import { GravitySystem, Renderer, RenderOptions } from "./gravity.js"
import { scenefun, scene_set, strScene_toFun, 
    strScene_randomWithRotation, strScene_randomStatic, strScene_twoGroups } from "./scenes.js"
import { cmap_names } from "./utils/js-colormaps.js"

var canvas : HTMLElement | null = document.getElementById("canvas");

var paused = false;
var n_iter = 10;

var nx = 120;
var ny = 120;
var n_iter = 60;
var dt = 0.01;

var n_particle = 40000;

var gs = new GravitySystem(nx, ny,n_iter, dt, n_particle);
var renderer = new Renderer(gs, canvas as HTMLCanvasElement);

var ro : RenderOptions = {
    toggle_log_scale : false,
    colormap : 'gray'
};
cmap_names.unshift('gray');

var debug_div = document.getElementById("debug");
debug_div.style.display = 'none';

function setup() {
    let containerIds = ["container_sceneInput", "container_renderOption", "container_simulOption"]
    containerIds.forEach((id : string) => { document.getElementById(id).style.display = 'none'; })

    let initScene = strScene_randomWithRotation;
    scene_set(gs, strScene_toFun(initScene));
    textarea_scene.value = initScene;
}

function loop() {
    if (!paused){
        gs.step();
        renderer.draw_density(ro);
        // debug
        gs.tweak_momentum();
        // let [pX,pY] = gs.debug_calcMomentum();
        // let Residue = gs.debug_calcL2Residue();
        // debug_div.innerHTML = (`pX: ${pX}<br>py : ${pY}<br>R:${Residue}`);
        // debug
    }
    requestAnimationFrame(loop);
}

var button_ppause = document.getElementById("button_toggle_play");
button_ppause.onclick = () => {
    paused = !paused;
    button_ppause.innerHTML = paused ? "play" : "pause";
}

var button_reset = document.getElementById("button_reset");
button_reset.onclick = () => {
    let s = textarea_scene.value;
    let f : scenefun = strScene_toFun(s);
    scene_set(gs, f);
    renderer.draw_density(ro);
}

// var scene = 0;
var textarea_scene : HTMLTextAreaElement = document.getElementById("textarea_scene") as HTMLTextAreaElement;
var button_applyScene = document.getElementById("button_applyScene");
button_applyScene.onclick = () => {
    let s = textarea_scene.value;
    let f : scenefun = strScene_toFun(s);
    scene_set(gs, f);
    renderer.draw_density(ro);
}

var strScenes = [strScene_randomWithRotation, strScene_randomStatic, strScene_twoGroups];
var select_scene : HTMLSelectElement = document.getElementById("select_scene") as HTMLSelectElement;
select_scene.onchange = () => {
    let scene = parseInt(select_scene.value);
    let strScene = strScenes[scene];
    textarea_scene.value = strScene;
    let f : scenefun = strScene_toFun(strScene);
    scene_set(gs, f);
    renderer.draw_density(ro);
}

function setButtonShow(buttonId : string, containerId : string){
    let button     = document.getElementById(buttonId);
    let container  = document.getElementById(containerId);
    button.onclick = ()=>{
        let changeto   = (container.style.display == 'none') ? 'block' : 'none';
        button.innerHTML = (changeto == 'none') ? '∨' : '∧';
        container.style.display = changeto;
    };
}
setButtonShow("button_moreScene" , "container_sceneInput");
setButtonShow("button_moreRender", "container_renderOption");
setButtonShow("button_moreSimul" , "container_simulOption");

function attachCheckbox(checkboxId : string, opt : RenderOptions, component : string){
    let checkbox = document.getElementById(checkboxId) as HTMLInputElement;
    checkbox.onchange = ()=>{ opt[component] = checkbox.checked };
}
attachCheckbox("cx_toggleLog", ro, "toggle_log_scale");

var select_cmap : HTMLSelectElement = document.getElementById("select_cmap") as HTMLSelectElement;
for (const cname of cmap_names){
    select_cmap.add(new Option(cname));
}
select_cmap.onchange = () => {
    ro.colormap = select_cmap.value;
    renderer.draw_density(ro);
}

setup();
loop();
