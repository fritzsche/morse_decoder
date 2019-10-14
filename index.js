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

            let scriptNode = this._ctx.createScriptProcessor(1024, 1, 1);

            console.log(`ScriptButterSize: ${scriptNode.bufferSize}`);


            var analyserNode = this._ctx.createAnalyser();
            audioSource.connect(analyserNode);
            analyserNode.fftSize = 1024;
            analyserNode.smoothingTimeConstant = 0;


            var fftData = new Float32Array(analyserNode.frequencyBinCount);

            analyserNode.connect(scriptNode);



            scriptNode.connect(this._ctx.destination);
            var i = 0;
            var toneIsOn = false;
            var lastTime = this._ctx.currentTime;
            scriptNode.onaudioprocess = audioProcessingEvent => {
                i += 1;
                var currentToneIsOn = false;
                var highestValue = -Infinity;
                var highestPosition = 0;
                analyserNode.getFloatFrequencyData(fftData);
                for (var n = 13; n < 20; n++) {
                    if (fftData[n] > highestValue) { highestValue = fftData[n]; highestPosition = n; }
                }
                //             if (i % 2 == 0) {
                //          console.log( i ); 
                if (highestValue > -30) {
                    currentToneIsOn = true;

                    //            }
                }

                if (currentToneIsOn != toneIsOn) {
                    if (!currentToneIsOn) {
                        console.log(`On ${ this._ctx.currentTime - lastTime }`)                      
                    } else {
                        console.log(`Off ${ this._ctx.currentTime - lastTime }`) 
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