class Decoder {
    constructor() {


    }

    drawSpectrum(audioSource) {
        var canvasElement = document.getElementById('spectrogram')
        var gc = this.graphicContext = canvasElement.getContext("2d");
        var analyserNode = this._ctx.createAnalyser();
        analyserNode.smoothingTimeConstant = 0;
        audioSource.connect(analyserNode);
        analyserNode.fftSize = 8192 * 2;
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
                var n = Math.min(Math.max((fftData[i] + 55) * 4, 0), 255);
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

            //      this.drawSpectrum(audioSource);
            //       return;

            let bufferSize = 512 ;
            let scriptNode = this._ctx.createScriptProcessor(bufferSize, 1, 1);

            console.log(`ScriptButterSize: ${scriptNode.bufferSize}`);


            var analyserNode = this._ctx.createAnalyser();
            audioSource.connect(analyserNode);
            analyserNode.fftSize = bufferSize;
            analyserNode.smoothingTimeConstant = 0;



            let frequencyBinCount = analyserNode.frequencyBinCount;
            let sampleRate = this._ctx.sampleRate;
            let binSize = (sampleRate / 2) / frequencyBinCount;

            console.log(`frequencyBinCount: ${frequencyBinCount}`);
            console.log(`sampleRate: ${sampleRate}`);
            console.log(`binSize: ${binSize}Hz`);
            console.log(`bufferSize: ${bufferSize / sampleRate}`);
            console.log(`minDecibels ${analyserNode.minDecibels}`);
            console.log(`maxDecibels ${analyserNode.maxDecibels}`);
            analyserNode.connect(scriptNode);

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
                if (a.length <= 1) throw ("2 means should have at least one element")
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

            //    let scalingFactor = bufferSize / 2;  

            const analyzerState = {
                LOW: 1,
                HIGH: 2
            };


            let magnitudelimitLow = 30;
            let magnitudeLimit = magnitudelimitLow;            

            let targetFrequency = 700;
            let k = (0.5 + ((bufferSize * targetFrequency) / sampleRate));
            let omega = (2 * Math.PI * k) / bufferSize;
            //    let sine = Math.sin(omega);
            let cosine = Math.cos(omega);
            let coeff = 2 * cosine;
            let Q0, Q1, Q2;

            scriptNode.onaudioprocess = audioProcessingEvent => {
                var inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                Q1 = 0;
                Q2 = 0;
                for (var i = 0; i < inputData.length; i++) {
                    Q0 = coeff * Q1 - Q2 + inputData[i];
                    Q2 = Q1;
                    Q1 = Q0;
                }
                let magnitude = Math.sqrt(Q1 * Q1 + Q2 * Q2 - Q1 * Q2 * coeff);

                if (magnitude > magnitudelimitLow) magnitudeLimit = Math.max(magnitudelimitLow, magnitudeLimit + ((magnitude - magnitudeLimit) / 6));
          //      console.log(magnitudeLimit,magnitude);

                if (magnitude > magnitudeLimit * 0.6) {
                  console.log(magnitudeLimit,magnitude,"^");
                } else {
                 console.log(magnitudeLimit,magnitude);
                }

            


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