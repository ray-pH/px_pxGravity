import {GravitySystem} from "./gravity.js"

type scenefun = (px : Float32Array, py : Float32Array, vx : Float32Array, vy : Float32Array, m : Float32Array,
                n_particle : number) => void;

function scene_set(gs : GravitySystem, sf : scenefun){
    let px = gs.particles_x;
    let py = gs.particles_y;
    let vx = gs.particles_vx;
    let vy = gs.particles_vy;
    let m  = gs.particles_m;
    gs.Phi.fill(0.0);
    sf(px,py,vx,vy,m, gs.n_particle);
    gs.calcInitMomentum();
    gs.calcDensity();
}

function strScene_toFun(s : string) : scenefun {
    let f : scenefun = new Function('px', 'py', 'vx', 'vy', 'm', 'n_particle', "\"use strict\";\n" + s) as scenefun;
    return f;
}

let strScene_randomWithRotation : string =
`for (let i = 0; i < n_particle; i++){
    let x = Math.random();
    let y = Math.random();
    px[i] = x;
    py[i] = y;
    vx[i] = (y-0.5)*1;
    vy[i] = -(x-0.5)*1;
    m[i]  = 1.0;
}
`

let strScene_randomStatic : string =
`for (let i = 0; i < n_particle; i++){
    let x = Math.random();
    let y = Math.random();
    px[i] = x;
    py[i] = y;
    vx[i] = 0;
    vy[i] = 0;
    m[i]  = 1.0;
}
`

let strScene_twoGroups : string =
`function gen_clump(cx, cy, r, vx_val, vy_val, id_from, id_to){
    for (let i = id_from; i < id_to; i++){
        let rad = r * Math.sqrt(Math.random());
        let angle = 2* Math.PI * Math.random();
        let x = cx + rad * Math.cos(angle);
        let y = cy + rad * Math.sin(angle);
        px[i] = x;
        py[i] = y;
        vx[i] = vx_val;
        vy[i] = vy_val;
    }
}

gen_clump(0.5, 0.5-0.1, 0.1, -1.2, 0, 0, n_particle/2);
gen_clump(0.5, 0.5+0.1, 0.1,  1.2, 0, n_particle/2, n_particle);
`

let strScene_ringOrbit : string = 
`function gen_clump(cx, cy, r, vx_val, vy_val, id_from, id_to){
    for (let i = id_from; i < id_to; i++){
        let rad = r * Math.sqrt(Math.random());
        let angle = 2* Math.PI * Math.random();
        let x = cx + rad * Math.cos(angle);
        let y = cy + rad * Math.sin(angle);
        px[i] = x;
        py[i] = y;
        vx[i] = vx_val;
        vy[i] = vy_val;
    }
}

function gen_ring(cx, cy, ri, ro, ve, id_from, id_to){
    for (let i = id_from; i < id_to; i++){
        // ri + rand*(ro-ri)
        let rad   = ri + (ro-ri) * Math.random();
        let angle = 2* Math.PI * Math.random();
        let x = cx + rad * Math.cos(angle);
        let y = cy + rad * Math.sin(angle);
        px[i] = x;
        py[i] = y;
        vx[i] = (y-0.5)*ve;
        vy[i] = -(x-0.5)*ve;
    }  
}

let center_fraction = 0.9;
let n_fraction = Math.floor(n_particle * center_fraction);
let vel = 5;
gen_clump(0.5, 0.5, 0.02, 0, 0, 0, n_fraction);
gen_ring(0.5, 0.5, 0.3,  0.35, vel, n_fraction, n_particle);
`

let strScene_ringOrbitUnstable : string = 
`function gen_clump(cx, cy, r, vx_val, vy_val, id_from, id_to){
    for (let i = id_from; i < id_to; i++){
        let rad = r * Math.sqrt(Math.random());
        let angle = 2* Math.PI * Math.random();
        let x = cx + rad * Math.cos(angle);
        let y = cy + rad * Math.sin(angle);
        px[i] = x;
        py[i] = y;
        vx[i] = vx_val;
        vy[i] = vy_val;
    }
}

let ve = 6;
function gen_ring(cx, cy, ri, ro, id_from, id_to){
    for (let i = id_from; i < id_to; i++){
        // ri + rand*(ro-ri)
        let rad   = ri + (ro-ri) * Math.random();
        let angle = 2* Math.PI * Math.random();
        let x = cx + rad * Math.cos(angle);
        let y = cy + rad * Math.sin(angle);
        px[i] = x;
        py[i] = y;
        vx[i] = (y-0.5)*ve;
        vy[i] = -(x-0.5)*ve;
    }  
}

gen_clump(0.5, 0.5, 0.02, 0, 0, 0, n_particle/2);
gen_ring(0.5, 0.5, 0.25,  0.3, n_particle/2, n_particle);
`

const strScene_rocheL : string = 
`function gen_clump(cx, cy, r, vx_val, vy_val, id_from, id_to){
    for (let i = id_from; i < id_to; i++){
        let rad = r * Math.sqrt(Math.random());
        let angle = 2* Math.PI * Math.random();
        let x = cx + rad * Math.cos(angle);
        let y = cy + rad * Math.sin(angle);
        px[i] = x;
        py[i] = y;
        vx[i] = vx_val;
        vy[i] = vy_val;
    }
}

let center_fraction = 0.99;
let n_fraction = Math.floor(n_particle * center_fraction);
let vel = 5;
gen_clump(0.5, 0.5, 0.02, 0, 0, 0, n_fraction);
gen_clump(0.5, 0.5+0.3, 0.01, 0.4*vel, 0, n_fraction, n_particle);
`

interface SceneStr {
    [key : string] : string;
}
const strScenes : SceneStr = {
    'Ring Orbit'           : strScene_ringOrbit,
    'Ring Orbit Unstable'  : strScene_ringOrbitUnstable,
    'Random with Rotation' : strScene_randomWithRotation,
    'Random static'        : strScene_randomStatic,
    'Two Group'            : strScene_twoGroups,
    'Roche Limit'          : strScene_rocheL,
    'Custom'               : '',
}

export {scenefun, scene_set, strScene_toFun, SceneStr, strScenes};
