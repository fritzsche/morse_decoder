class Decoder {
    constructor() {


    }
    play() {
        // we should just use one ctx
        this._ctx = new (window.AudioContext || window.webkitAudioContext)();
        // getUserMedia need to be called on a navigator object
        navigator.getUserMedia  = (navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia)   
        if (navigator.getUserMedia ) alert("No UserMedia");
        navigator.getUserMedia( { audio: true, video: false },
            stream => {
                var audioSource = this._ctx.createMediaStreamSource(stream);

            },
            err => { console.error('Error connecting: ' + err); }
        );
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