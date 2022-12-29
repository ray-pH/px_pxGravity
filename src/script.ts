import { GravitySystem, Renderer} from "./gravity.js"

var canvas : HTMLElement | null = document.getElementById("canvas");

var paused = false;
var n_iter = 10;

var nx = 120;
var ny = 120;
var n_iter = 20;
var dt = 0.01;

var n_particle = 20000;
const PI = 3.14159265;

var gs = new GravitySystem(nx, ny,n_iter, dt, n_particle);
var renderer = new Renderer(gs, canvas as HTMLCanvasElement);

function gen_clump(cx : number, cy : number, r : number, vx : number, vy : number,
                   n_part : number, id_start : number, gs : GravitySystem) : void{
    for (let i = id_start; i < id_start + n_part; i++){
        let rad = r * Math.sqrt(Math.random());
        let angle = 2*PI * Math.random();
        let x = cx + rad * Math.cos(angle);
        let y = cy + rad * Math.sin(angle);
        gs.particles_x[i] = x;
        gs.particles_y[i] = y;
        gs.particles_vx[i] = vx;
        gs.particles_vy[i] = vy;
    }
}

// function gen_clump(cx : number, cy : number, r : number, vx : number, vy : number,
//                    n_part : number, id_start : number, gs : GravitySystem) : void{
//
// gen_clump(0.5, 0.5, 0.1, 0, 0, 10000, 0, gs);

// for (let i = 0; i < n_particle; i++){
//     let x = Math.random();
//     let y = Math.random();
//     gs.particles_x[i] = x;
//     gs.particles_y[i] = y;
//     gs.particles_vx[i] = y;
//     gs.particles_vy[i] = x;
//     // gs.particles_x[i] = 0.5;
//     // gs.particles_y[i] = 0.5;
// }
//
for (let i = 0; i < n_particle; i++){
    let x = Math.random();
    let y = Math.random();
    gs.particles_x[i] = x;
    gs.particles_y[i] = y;
    gs.particles_vx[i] = (y-0.5)*0.1;
    gs.particles_vy[i] = -(x-0.5)*0.1;
}

var debug_div = document.getElementById("debug");
function loop() {
    if (!paused){
        // console.log(gs.particles_x);
        // console.log(gs.particles_y);
        // console.log(gs.particles_m);
        // gs.calcDensity();
        // console.log(gs.Density);
        gs.step();
        renderer.draw();

        // debug
        gs.tweak_momentum();
        let [pX,pY] = gs.debug_calcMomentum();
        let Residue = gs.debug_calcL2Residue();
        debug_div.innerHTML = (`pX: ${pX}<br>py : ${pY}<br>R:${Residue}`);
        // debug
    }
    
    
    requestAnimationFrame(loop);
}


var button_ppause = document.getElementById("button_toggle_play");
button_ppause.onclick = () => {
    paused = !paused;
    button_ppause.innerHTML = paused ? "play" : "pause";
}

loop();
