var canvas : HTMLElement | null = document.getElementById("canvas");

var paused = false;
var n_iter = 10;

function loop() {
    if (!paused){
    }
    // requestAnimationFrame(loop);
}


var button_ppause = document.getElementById("button_toggle_play");
button_ppause.onclick = () => {
    paused = !paused;
    button_ppause.innerHTML = paused ? "play" : "pause";
}

loop();
