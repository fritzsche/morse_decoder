class Decoder {
    constructor() {


    }

    drawSpectrum(audioSource) {
        var canvasElement = document.getElementById('spectrogram')
        var gc = this.graphicContext = canvasElement.getContext("2d");
        var analyserNode = this._ctx.createAnalyser();
        audioSource.connect(analyserNode);
        analyserNode.fftSize = 8192;
        var fftData = new Float32Array(analyserNode.frequencyBinCount);

        var graphicWidth = parseInt(getComputedStyle(canvasElement).width, 10);
        var graphicHeight = parseInt(getComputedStyle(canvasElement).height, 10);

        console.log(`GraphicsHeight: ${graphicHeight}`);
        console.log(`GraphicsWidth: ${graphicWidth}`)

        gc.fillStyle = '#000000';

        gc.fillRect(0, 0, graphicWidth, graphicHeight);
        var pixel = gc.createImageData(1, 1);
        pixel.data[3] = 255;
        var draw = (() => {
            var slideImage = gc.getImageData(0, 0, graphicWidth - 1, graphicHeight);
            gc.putImageData(slideImage, 1, 0);

            analyserNode.getFloatFrequencyData(fftData);
            for (var i = 0; i < graphicHeight; ++i) {
                var n = Math.min(Math.max((fftData[i] + 80) * 4, 0), 255);
                pixel.data[0] = n;
                pixel.data[1] = n;
                pixel.data[2] = n;
                gc.putImageData(pixel, 0, graphicHeight - i);
            }
            requestAnimationFrame(draw);
        });
        draw();
    }


    play() {
        // we should just use one ctx
        this._ctx = new (window.AudioContext || window.webkitAudioContext)();
        // getUserMedia need to be called on a navigator object
        navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia)
        let onGetUserMedia = (stream => {
            let audioSource = this._ctx.createMediaStreamSource(stream);
            /*
                        let lowpassFilter = this._ctx.createBiquadFilter();
                        let highpassFilter = this._ctx.createBiquadFilter();
                        highpassFilter.frequency.setValueAtTime(200, this._ctx.currentTime);
                        highpassFilter.Q.setValueAtTime(0.707, this._ctx.currentTime); 
                        highpassFilter.type = "highpass";
                        lowpassFilter.Q.setValueAtTime(0.707, this._ctx.currentTime); 
                        lowpassFilter.frequency.setValueAtTime(2000, this._ctx.currentTime);
                        lowpassFilter.type = "lowpass";
            */


            /*
                        audioSource.connect(lowpassFilter);
                        lowpassFilter.connect(highpassFilter);
                       
                        this.drawSpectrum(highpassFilter);
            */
            let bufferSize = 512;
            let scriptNode = this._ctx.createScriptProcessor(bufferSize, 1, 1);

            console.log(`ScriptButterSize: ${scriptNode.bufferSize}`);


            var analyserNode = this._ctx.createAnalyser();
            audioSource.connect(analyserNode);
            analyserNode.fftSize = bufferSize;
            analyserNode.smoothingTimeConstant = 0;


            var fftData = new Float32Array(analyserNode.frequencyBinCount);
            let frequencyBinCount = analyserNode.frequencyBinCount;
            let sampleRate = this._ctx.sampleRate;
            let binSize = (sampleRate / 2) / frequencyBinCount;
            let startBin = Math.floor(500 / binSize);
            let endBin = Math.ceil(900 / binSize);

            console.log(`frequencyBinCount: ${frequencyBinCount}`);
            console.log(`sampleRate: ${sampleRate}`);
            console.log(`binSize: ${binSize}Hz`);
            console.log(`bufferSize: ${bufferSize / sampleRate}`);
            console.log(`minDecibels ${analyserNode.minDecibels}`);
            console.log(`maxDecibels ${analyserNode.maxDecibels}`);
            analyserNode.connect(scriptNode);

            scriptNode.connect(this._ctx.destination);
            var i = 0;
            var toneIsOn = false;
            var lastTime = this._ctx.currentTime;

            var numBin = 0;
            var sumBin = 0;

            var minVal = Infinity;
            var maxVal = -Infinity;
            // threshold in DB that we consider a CW tone
            var threshold = Infinity;

            var currentMorseString = "";
            var currentText = "";

            const code_map = {
                ".-": 'a',
                "-...": 'b',
                "-.-.": 'c',
                "-..": 'd',
                ".": 'e',
                "..-.": 'f',
                "--.": 'g',
                "....": 'h',
                "..": 'i',
                ".---": 'j',
                "-.-": 'k',
                ".-..": 'l',
                "--": 'm',
                "-.": 'n',
                "---": 'o',
                ".--.": 'p',
                "--.-": 'q',
                ".-.": 'r',
                "...": 's',
                "-": 't',
                "..-": 'u',
                "...-": 'v',
                ".--": 'w',
                "-..-": 'x',
                "-.--": 'y',
                "--..": 'z',
                ".----": '1',
                "..---": '2',
                "...--": '3',
                "....-": '4',
                ".....": '5',
                "-....": '6',
                "--...": '7',
                "---..": '8',
                "----.": '9',
                "-----": '0',
                "-...-": '=',
                ".-.-.-": '.',
                "--..--": ',',
                "..--..": '?',
                ".----.": "'",
                "-..-.": '/',
                "-.--.": '(',
                "-.--.-": ')',
                ".-...": "&",
                "---...": ":",
                "-.-.-.": ";",
                ".-.-.": "+",
                "-....-": "-",
                "..--.-": "_",
                ".-..-.": '"',
                "...-..-": "$",
                "-.-.--": "!",
                ".--.-.": "@"
            }

            let two_means = a => {
                if (a.length <= 1) throw("2 means should have at least one element")
                // take smallest and largest value as start value
                var p1 = Math.min(...a);
                var p2 = Math.max(...a);
                while (true) {
                    var num1 = 0.0;
                    var num2 = 0.0;
                    var sum1 = 0.0;
                    var sum2 = 0.0;
                    for (var i = 0; i < a.length; i++) {
                        if (Math.abs(p1 - a[i]) < Math.abs(p2 - a[i])) {
                            num1 += 1;
                            sum1 += a[i];
                        } else {
                            num2 += 1;
                            sum2 += a[i];
                        };
                    }
                    let mean1 = sum1 / num1;
                    let mean2 = sum2 / num2;
                    if ((mean1 == p1) && (mean2 == p2)) return [mean1, mean2];
                    p1 = mean1;
                    p2 = mean2;
                }
            }

            var toneLengthArray = [];
            var ditToneLength = Infinity;

            var scanArray = [];

            scriptNode.onaudioprocess = audioProcessingEvent => {
                i += 1;
                var currentToneIsOn = false;
                var highestValue = -Infinity;
                var highestBin = 0;

                analyserNode.getFloatFrequencyData(fftData);
                for (var n = startBin; n < endBin; n++) {
                    if (fftData[n] > highestValue) { highestValue = fftData[n]; highestBin = n; }
                }
         //       console.log(highestBin);
         if (highestValue == -Infinity) highestValue = -256; 
                scanArray.push(highestValue);
                if (scanArray.length > 1000) {
                    scanArray.shift();
                 //   debugger;
                }
                if ( i % 50 === 0) {
                    if(threshold < -100) debugger;
                    const [low, high] = two_means(scanArray);                    
                    if (high - low > 20) {
                        threshold = high - 10 ; 
                        console.log(threshold);
                    }                   
                }
                if (highestValue > threshold) {
                    currentToneIsOn = true;
                    numBin += 1;
                    sumBin += highestBin;
                }
                if (minVal > highestValue) minVal = highestValue;
                if (maxVal < highestValue) maxVal = highestValue;

                // if the difference of the detected max und min values is larger than 
                // a than a specific value we have found the signal hight 
//                if (maxVal - minVal > 10) {
//                    threshold = maxVal - 10;
   //                  console.log(`set threshold 10 ${threshold}`);
//                }

                if (currentToneIsOn != toneIsOn) {
                    var toneLength = this._ctx.currentTime - lastTime;
                    if (!currentToneIsOn) {
                        var bin = sumBin / numBin;
                        if (ditToneLength !== Infinity) {
                            if (toneLength <= ditToneLength * 2) {
                                currentMorseString += ".";
                            } else {
                                currentMorseString += "-";
                            }
                        }
                        //      console.log(`On ${toneLength} / Freq: ${bin * binSize}Hz / ${bin}`)
                        toneLengthArray.push(toneLength);
                        if (toneLengthArray.length > 50) toneLengthArray.shift();
                        if (toneLengthArray.length > 10) {
                            const [low, high] = two_means(toneLengthArray);
                            ditToneLength = low;
                         //         console.log(`*** ${low} / ${high} `)

                        }
                        numBin = 0;
                        sumBin = 0;
                        //               console.log(`Min ${minVal} / Max: ${maxVal} / ${minToneLength} /  ${toneLength} `);
                    } else {
                        // character border
                        if (ditToneLength !== Infinity) {
                            if (toneLength > ditToneLength * 2) {
                                if (currentMorseString in code_map) {
                                    currentText += code_map[currentMorseString];
                                } else {
                                    currentText += "?";
                                }
                                currentMorseString = "";
                                // word border
                                if (toneLength > ditToneLength * 5) {
                                    console.log(currentText);
                                    currentText = "";
                                    //                                console.log("Space");
                                } else {

                                }
                            }
                        }
                        //                   console.log(`Off ${this._ctx.currentTime - lastTime}`)
                    }


                    //         console.log(highestValue);
                    //        console.log(highestPosition);
                    toneIsOn = !toneIsOn;
                    lastTime = this._ctx.currentTime;
                }

                /*                
                                // we just support mono and read the first channel
                                let inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                                var maxAmp = 0;
                                for (let sample = 0; sample < audioProcessingEvent.inputBuffer.length; sample++) {
                                    maxAmp = Math.max(maxAmp, inputData[sample]);
                                }
                                if (maxAmp > 0.2)
                                    console.log(`AudioEvent:  ${audioProcessingEvent.inputBuffer.numberOfChannels} channel / max ${maxAmp}`);
                                    */
            }
        });
        let onGetUserMediaError = (err => { console.error('Error connecting: ' + err); });
        if (navigator.mediaDevices) {
            navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(onGetUserMedia, onGetUserMediaError);
        } else {
            if (navigator.getUserMedia) {
                navigator.getUserMedia({ audio: true, video: false }, onGetUserMedia, onGetUserMediaError);
            } else {
                alert("No User Media")
            }
        }
    }
}


document.addEventListener("DOMContentLoaded", function (event) {
    console.log("DOM Load");
    var decoder = new Decoder();
    document.getElementById("play").onclick = e => {
        console.log("play!");
        decoder.play();
    }
});