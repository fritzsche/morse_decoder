
// class FFT {
//     constructor(n) {
//         this.n = n;
//         this.levels = -1;
//         for (let i = 0; i < 32; i++) {
//             if (1 << i == n) {
//                 this.levels = i;
//             }
//         }
//         if (this.levels == -1) {
//             throw "must be a power of 2";
//         }
//         this.cosTable = new Float32Array(n / 2);
//         this.sinTable = new Float32Array(n / 2);
//         for (let i = 0; i < n / 2; i++) {
//             this.cosTable[i] = Math.cos(2 * Math.PI * i / n);
//             this.sinTable[i] = Math.sin(2 * Math.PI * i / n);
//         }
//     }
//     forward(real, imag) {
//         // permutation
//         for (let i = 0; i < this.n; i++) {
//             let j = this.reverseBits(i, this.levels);
//             if (j > i) {
//                 let temp = real[i];
//                 real[i] = real[j];
//                 real[j] = temp;
//                 temp = imag[i];
//                 imag[i] = imag[j];
//                 imag[j] = temp;
//             }
//         }
//         // radix-2 FFT
//         for (let size = 2; size <= this.n; size *= 2) {
//             const halfSize = size / 2;
//             let step = this.n / size;
//             for (let i = 0; i < this.n; i += size) {
//                 for (let j = i, k = 0; j < i + halfSize; j++, k += step) {
//                     let tmpRe = real[j + halfSize] * this.cosTable[k] +
//                         imag[j + halfSize] * this.sinTable[k];
//                     let tmpIm = -real[j + halfSize] * this.sinTable[k] +
//                         imag[j + halfSize] * this.cosTable[k];
//                     real[j + halfSize] = real[j] - tmpRe;
//                     imag[j + halfSize] = imag[j] - tmpIm;
//                     real[j] += tmpRe;
//                     imag[j] += tmpIm;
//                 }
//             }
//         }
//     }

//     reverseBits(x, bits) {
//         let y = 0;
//         for (let i = 0; i < bits; i++) {
//             y = (y << 1) | (x & 1);
//             x >>>= 1;
//         }
//         return y;
//     }

//     magnitude(real, imag){
//         let mag = new Float32Array(this.n / 2);
//         for(let i = 0;i< this.n;i ++) {
//             mag[i] = Math.sqrt( real[i] * real[i] + imag[i] * imag[i] );
//         }
//         return mag;

//     }
// }



class Decoder {
    // drawSpectrum(audioSource) {
    //     const canvasElement = document.getElementById('spectrogram')

    //     var gc = this.graphicContext = canvasElement.getContext("2d");
    //     var analyserNode = this._ctx.createAnalyser();
    //     //     analyserNode.smoothingTimeConstant = 0;
    //     audioSource.connect(analyserNode);
    //     analyserNode.fftSize = 1024 * 8;

    //     let frequencyBinCount = analyserNode.frequencyBinCount;
    //     let sampleRate = this._ctx.sampleRate;
    //     let fftBinSize = (sampleRate / 2) / frequencyBinCount;
    //     var graphicWidth = parseInt(getComputedStyle(canvasElement).width, 10);
    //     var graphicHeight = parseInt(getComputedStyle(canvasElement).height, 10);

    //     let getCursorPosition = (canvas, event) => {
    //         const rect = canvas.getBoundingClientRect()
    //         const x = event.clientX - rect.left
    //         const y = event.clientY - rect.top
    //         console.log("x: " + x + " y: " + y)
    //         const pos = graphicHeight - y;
    //         let freq = pos * fftBinSize;
    //         console.log(`freq ${freq}hz`)
    //     }
    //     canvasElement.onclick = e => {
    //         getCursorPosition(canvasElement, e);
    //     }


    //     var fftData = new Float32Array(analyserNode.frequencyBinCount);
    //     console.log(`Bin count: ${analyserNode.frequencyBinCount}`);
    //     console.log(`GraphicsHeight: ${graphicHeight}`);
    //     console.log(`GraphicsWidth: ${graphicWidth}`)

    //     gc.fillStyle = '#000000';

    //     gc.fillRect(0, 0, graphicWidth, graphicHeight);
    //     var pixel = gc.createImageData(1, 1);
    //     pixel.data[3] = 255;
    //     var draw = (() => {
    //         var slideImage = gc.getImageData(0, 0, graphicWidth - 1, graphicHeight);
    //         gc.putImageData(slideImage, 1, 0);

    //         analyserNode.getFloatFrequencyData(fftData);

    //         for (var i = 0; i < graphicHeight; ++i) {
    //             var n = Math.min(Math.max((fftData[i] + 55) * 4, 0), 255);
    //             pixel.data[0] = n;
    //             pixel.data[1] = n;
    //             pixel.data[2] = n;
    //             gc.putImageData(pixel, 0, graphicHeight - i);
    //         }
    //         requestAnimationFrame(draw);
    //     });
    //     draw();
    // }


    play() {
        // we should just use one ctx
        this._ctx = new (window.AudioContext || window.webkitAudioContext)();
        // getUserMedia need to be called on a navigator object
        navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia)
        let onGetUserMedia = (stream => {
            let audioSource = this._ctx.createMediaStreamSource(stream);

            //     this.drawSpectrum(audioSource);
            //         return;
            let bufferSize = 256;
            let scriptNode = this._ctx.createScriptProcessor(bufferSize, 1, 1);

            audioSource.connect(scriptNode);


            // var analyserNode = this._ctx.createAnalyser();
            // audioSource.connect(analyserNode);
            // analyserNode.fftSize = 2048;
            // analyserNode.smoothingTimeConstant = 0;



            const canvasElement = document.getElementById('graph')
            var gc = this.graphicContext = canvasElement.getContext("2d");
            var graphicWidth = parseInt(getComputedStyle(canvasElement).width, 10);
            var graphicHeight = parseInt(getComputedStyle(canvasElement).height, 10);
            gc.fillStyle = '#000000';
            gc.fillRect(0, 0, graphicWidth, graphicHeight);
            let pixel = gc.createImageData(1, 1);
            pixel.data[0] = 255;
            pixel.data[1] = 255;
            pixel.data[2] = 255;
            pixel.data[3] = 255;


            let pixelList = [];
            let stopAnimation = false;
            const animate = (() => {
                let pixels = pixelList.length;
                if (pixels > 0) {
                    let slideImage = gc.getImageData(0, 0, graphicWidth - pixels, graphicHeight);

                    gc.putImageData(slideImage, pixels, 0);
                    gc.fillRect(0, 0, pixels, graphicHeight);
                    for (let i = 0; i < pixels; i++) {
                        let pos = pixelList.shift();
                        gc.putImageData(pixel, i, graphicHeight - pos);
                    }
                }
                if (stopAnimation == false) requestAnimationFrame(animate);
            });
            requestAnimationFrame(animate);

            // let frequencyBinCount = analyserNode.frequencyBinCount;
            let sampleRate = this._ctx.sampleRate;
            // let binSize = (sampleRate / 2) / frequencyBinCount;

            // console.log(`frequencyBinCount: ${frequencyBinCount}`);
            // console.log(`sampleRate: ${sampleRate}`);
            // console.log(`binSize: ${binSize}Hz`);
            // console.log(`bufferSize: ${bufferSize / sampleRate}`);
            // console.log(`minDecibels ${analyserNode.minDecibels}`);
            // console.log(`maxDecibels ${analyserNode.maxDecibels}`);
            // analyserNode.connect(scriptNode);

            scriptNode.connect(this._ctx.destination);


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
                if (a.length < 1) throw ("2 means should have at least one element")
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

            const morseState = {
                LOW: 1,
                HIGH: 2
            };
            let magnitudelimitLow = 8.0;
            let magnitudeLimit = magnitudelimitLow;
            let targetFrequency = 750;
            let k = Math.floor(0.5 + ((bufferSize * targetFrequency) / sampleRate)) 
            let omega = (2 * Math.PI * k ) / bufferSize;
            let cosine = Math.cos(omega);
            let coeff = 2 * cosine;
            let Q0, Q1, Q2;

            var currentState = morseState.LOW;
            var lastState = currentState;
            var filteredState = currentState;
            var lastFilteredState = currentState;
            var noiseTime = 0.006;

            var lastChangeTime = this._ctx.currentTime;
            var lastFilteredChangeTime = lastChangeTime;
        //    var avgDuration = Infinity;

        //    var counter = 0;
            var durationArray = [];
            var ditLength = 0.06;
            var dahLength = 3 * ditLength;
            var currentMorseString = "";
            var currentText = "";
            var pauseDuration = ditLength;

           var lastMag = 0;

            const out = document.getElementById("out");


     //       let fft = new FFT(256*8);

     //       let buffer = new Array();

            scriptNode.onaudioprocess = audioProcessingEvent => {
                var inputData = audioProcessingEvent.inputBuffer.getChannelData(0);

           //     buffer = buffer.concat(Array.from(inputData))
              

                // if (buffer.length == 256*8) {
                //  var fftReal =  new Float32Array(buffer); 
                //     buffer = new Array();
                //  var fftIm = new Float32Array(256*8);

            // //    fftReal = new Float32Array([1,1,1,1,0,0,0,0]);
            // //    fftIm = new Float32Array(8);
 
                //  fft.forward(fftReal,fftIm);
                //  let mag = fft.magnitude(fftReal,fftIm);
      
                // let fftMax = Math.max(...mag)
                // var fftData = new Float32Array(analyserNode.frequencyBinCount);
                // analyserNode.getFloatFrequencyData(fftData);
 //               console.log("m",fftMax)
       //     }
           //     debugger;
                /*
                                var lastOutput = inputData[0];
                                for (var i = 0; i < bufferSize; i++) {
                                    inputData[i] = ( inputData[i] + lastOutput ) / 2;
                                    lastOutput = inputData[i];
                                }
                */
                Q1 = 0;
                Q2 = 0;
                for (var i = 0; i < inputData.length; i++) {
                    Q0 = coeff * Q1 - Q2 + inputData[i];
                    Q2 = Q1;
                    Q1 = Q0;
                }
                let magnitude = Math.sqrt(Q1 * Q1 + Q2 * Q2 - Q1 * Q2 * coeff)
              
      //          console.log(magnitude,mag[4])

                // low pass filter to smooth the values
                magnitude = (lastMag + magnitude) / 2
                lastMag = magnitude
                
     //           console.log(magnitude)
                pixelList.push(magnitude)
                //console.log(`Mag: ${ magnitude }`);

                if (magnitude > magnitudelimitLow) magnitudeLimit = Math.max(magnitudelimitLow, magnitudeLimit + ((magnitude - magnitudeLimit) / 6));
                currentState = magnitude > magnitudeLimit * 0.6 ? morseState.HIGH : morseState.LOW;

                if (currentState !== lastState) {
                    lastChangeTime = audioProcessingEvent.playbackTime;
                }

                if (audioProcessingEvent.playbackTime - lastChangeTime > noiseTime) {
                    filteredState = currentState;
                }


                if (filteredState != lastFilteredState) {
                    var duration = lastChangeTime - lastFilteredChangeTime
                    //if (lastFilteredState == morseState.LOW) 
                    //console.log(duration,lastFilteredState,ditLength, "p", pauseDuration)
                    lastFilteredChangeTime = lastChangeTime;
                    if (lastFilteredState == morseState.HIGH) { // end of HIGH
                        durationArray.push(duration);
                        if (durationArray.length > 100) durationArray.shift();
                        if (durationArray.length > 2) [ditLength, dahLength] = two_means(durationArray);

                        if (duration <= ditLength * 1.3) {
                            currentMorseString += ".";
                        } else {
                            currentMorseString += "-";
                        }
                        // console.log("***", dahLength, ditLength, duration, currentMorseString)
                    } else { // end of low
                        //   console.log("___", dahLength, ditLength, duration, currentMorseString)
                        //          console.log("LackDur",duration);
                        if (duration < ditLength * 2.7) {
                            pauseDuration = (5 * pauseDuration + duration) / 6;
                        } else { //
                            if (currentMorseString in code_map) {
                                currentText += code_map[currentMorseString];
                            } else {
                                currentText += "*";
                            }
                            currentMorseString = "";
                            // word border
                            if (duration > ditLength * 5) {
                                console.log(currentText);

                                out.textContent += currentText + " ";
                                out.scrollTop = out.scrollHeight;

                                currentText = "";
                                //                                console.log("Space");
                            }

                        }
                    }
                }

                lastState = currentState;
                lastFilteredState = filteredState;

            }
        });
        let onGetUserMediaError = (err => { console.error('Error connecting: ' + err); });
        if (navigator.mediaDevices) {
           // let supports = navigator.mediaDevices.getSupportedConstraints();
          //  debugger;
            navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                  }, 
                video: false }).then(onGetUserMedia, onGetUserMediaError);
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
        decoder.play();
    }
});