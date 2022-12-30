import { GravitySystem, Renderer } from "./gravity.js";
import { scene_set, strScene_toFun, strScene_randomWithRotation, strScene_randomStatic, strScene_twoGroups } from "./scenes.js";
var canvas = document.getElementById("canvas");
var paused = false;
var n_iter = 10;
var nx = 120;
var ny = 120;
var n_iter = 60;
var dt = 0.01;
var n_particle = 40000;
var gs = new GravitySystem(nx, ny, n_iter, dt, n_particle);
var renderer = new Renderer(gs, canvas);
// gen_clump(0.5, 0.5-0.1, 0.1, 0, 0, n_particle/2, 0, gs);
// gen_clump(0.5, 0.5+0.1, 0.1, 0, 0, n_particle/2, n_particle/2, gs);
// gen_clump(0.5, 0.5-0.1, 0.1, -1.2, 0, n_particle/2, 0, gs);
// gen_clump(0.5, 0.5+0.1, 0.1,  1.2, 0, n_particle/2, n_particle/2, gs);
var debug_div = document.getElementById("debug");
debug_div.style.display = 'none';
function setup() {
    container_sceneInput.style.display = 'none';
    let initScene = strScene_randomWithRotation;
    scene_set(gs, strScene_toFun(initScene));
    textarea_scene.value = initScene;
}
function loop() {
    if (!paused) {
        gs.step();
        renderer.draw_density();
        // debug
        gs.tweak_momentum();
        // let [pX,pY] = gs.debug_calcMomentum();
        // let Residue = gs.debug_calcL2Residue();
        // debug_div.innerHTML = (`pX: ${pX}<br>py : ${pY}<br>R:${Residue}`);
        // debug
    }
    requestAnimationFrame(loop);
}
// var scene = 0;
var textarea_scene = document.getElementById("textarea_scene");
var button_applyScene = document.getElementById("button_applyScene");
button_applyScene.onclick = () => {
    let s = textarea_scene.value;
    let f = strScene_toFun(s);
    scene_set(gs, f);
};
var strScenes = [strScene_randomWithRotation, strScene_randomStatic, strScene_twoGroups];
var select_scene = document.getElementById("select_scene");
select_scene.onchange = () => {
    let scene = parseInt(select_scene.value);
    let strScene = strScenes[scene];
    textarea_scene.value = strScene;
    let f = strScene_toFun(strScene);
    scene_set(gs, f);
};
var button_moreScene = document.getElementById("button_moreScene");
var container_sceneInput = document.getElementById("container_sceneInput");
button_moreScene.onclick = () => {
    container_sceneInput.style.display = (container_sceneInput.style.display == 'none') ? 'block' : 'none';
};
var button_ppause = document.getElementById("button_toggle_play");
button_ppause.onclick = () => {
    paused = !paused;
    button_ppause.innerHTML = paused ? "play" : "pause";
};
setup();
loop();
