import { GravitySystem, Renderer, RenderOptions, SimulOptions } from "./gravity.js"
import { scenefun, scene_set, strScene_toFun, 
    strScene_randomWithRotation, strScene_randomStatic, strScene_twoGroups,
    strScene_ringOrbit} from "./scenes.js"
import { cmap_names } from "./utils/js-colormaps.js"

var canvas : HTMLElement | null = document.getElementById("canvas");

var lastValid_strScene : string = "";
var paused = false;

const so : SimulOptions = {
    n_grid : 120,
    n_iter : 60,
    dt     : 0.01,
    n_particle : 40000,
    G      : 0.6,
}
const ro : RenderOptions = {
    toggle_log_scale : true,
    colormap : 'bone'
};
cmap_names.unshift(ro.colormap);

var gs : GravitySystem;
var renderer : Renderer;
function initSystem(so : SimulOptions){
    gs = new GravitySystem(so.n_grid, so.n_grid, so.n_iter, so.dt, so.n_particle);
    gs.setG(so.G);
    renderer = new Renderer(gs, canvas as HTMLCanvasElement);
}

var debug_div = document.getElementById("debug");
debug_div.style.display = 'none';

function readSceneFromURL() : boolean{
    let queryString : Window['location']['search'] = window.location.search;
    let urlParams   : URLSearchParams = new URLSearchParams(queryString);
    let urlstrScene : string = urlParams.get('scene');
    if (urlstrScene == null) return false;

    let parsedstrScene : string = "";
    try{
        parsedstrScene = atob(decodeURIComponent(urlstrScene));
    } catch(e){ 
        console.log(e);
        return false; 
    }

    (document.getElementById("select_scene") as HTMLSelectElement).value = "3";
    lastValid_strScene = parsedstrScene;
    textarea_scene.value = parsedstrScene;
    document.getElementById("button_moreScene").click();
    document.getElementById("button_applyScene").click();
    return true;
}

function setup() {
    initSystem(so);
    let containerIds = ["container_sceneInput", "container_renderOption", "container_simulOption", "container_sceneHelp"];
    containerIds.forEach((id : string) => { document.getElementById(id).style.display = 'none'; })

    let success = readSceneFromURL();
    if (success) return;

    let initScene = strScene_randomWithRotation;
    lastValid_strScene = initScene;
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
    let f : scenefun = strScene_toFun(lastValid_strScene);
    scene_set(gs, f);
    renderer.draw_density(ro);
}

// var scene = 0;
var textarea_scene : HTMLTextAreaElement = document.getElementById("textarea_scene") as HTMLTextAreaElement;
var button_applyScene = document.getElementById("button_applyScene");
var container_sceneInput = document.getElementById("container_sceneInput");
var span_errorScene = document.getElementById("span_errorScene");
button_applyScene.onclick = () => {
    let s = textarea_scene.value;
    let f : scenefun = strScene_toFun(s);

    let msg : string = ""; 
    let bgcolor : string = "#D6D6D6";
    try {
        scene_set(gs, f);
    } catch(e){
        msg = e.toString();
        bgcolor = "#D63333"
    }

    if (msg == "") lastValid_strScene = s;
    container_sceneInput.style.backgroundColor = bgcolor;
    span_errorScene.innerHTML = msg;
    renderer.draw_density(ro);
}

var strScenes = [strScene_randomWithRotation, strScene_randomStatic, strScene_twoGroups, strScene_ringOrbit, ''];
var select_scene : HTMLSelectElement = document.getElementById("select_scene") as HTMLSelectElement;
select_scene.onchange = () => {
    let scene = parseInt(select_scene.value);
    let strScene = strScenes[scene];
    lastValid_strScene = strScene;
    textarea_scene.value = strScene;
    let f : scenefun = strScene_toFun(strScene);
    scene_set(gs, f);
    renderer.draw_density(ro);

    let msg : string = ""; 
    let bgcolor : string = "#D6D6D6";
    container_sceneInput.style.backgroundColor = bgcolor;
    span_errorScene.innerHTML = msg;
}

var button_shareScene : HTMLButtonElement = document.getElementById("button_shareScene") as HTMLButtonElement;
var span_shareScene   : HTMLDivElement    = document.getElementById("span_shareScene") as HTMLDivElement;
var input_shareScene  : HTMLInputElement  = document.getElementById("input_shareScene") as HTMLInputElement;
button_shareScene.onclick = () => {
    let siteURI    : string = window.location.href.split('?')[0];
    let strScene   : string = textarea_scene.value;
    let strScene64 : string = btoa(strScene);
    span_shareScene.style.display = "grid";
    input_shareScene.value = siteURI + "?scene=" + encodeURIComponent(strScene64);
}

function setButtonShow(buttonId : string, containerId : string, sOpen : string, sClosed : string){
    let button     = document.getElementById(buttonId);
    let container  = document.getElementById(containerId);
    button.onclick = ()=>{
        let changeto   = (container.style.display == 'none') ? 'block' : 'none';
        button.innerHTML = (changeto == 'none') ? sOpen : sClosed;
        container.style.display = changeto;
    };
}
setButtonShow("button_moreDesc"  , "container_desc"        ,'∨','∧');
setButtonShow("button_moreScene" , "container_sceneInput"  ,'∨','∧');
setButtonShow("button_moreRender", "container_renderOption",'∨','∧');
setButtonShow("button_moreSimul" , "container_simulOption" ,'∨','∧');
setButtonShow("button_helpScene", "container_sceneHelp"    ,'?','?');

function attachCheckbox(checkboxId : string, opt : RenderOptions, component : string){
    let checkbox = document.getElementById(checkboxId) as HTMLInputElement;
    checkbox.onchange = ()=>{ 
        opt[component] = checkbox.checked 
        renderer.draw_density(ro);
    };
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

const tx_SOcomponent = {
    "tx_n_grid": "n_grid",
    "tx_dt"    : "dt",
    "tx_n_particle" : "n_particle",
    "tx_G" : "G",
}
for (let tx_id in tx_SOcomponent){
    let comp = tx_SOcomponent[tx_id];
    let tx_element : HTMLInputElement = document.getElementById(tx_id) as HTMLInputElement;
    tx_element.value = so[comp];
}
var button_applySimulOp = document.getElementById("button_applySimulOp");
button_applySimulOp.onclick = () => {
    for (let tx_id in tx_SOcomponent){
        let comp = tx_SOcomponent[tx_id];
        let tx_element : HTMLInputElement = document.getElementById(tx_id) as HTMLInputElement;
        let parsed : number = parseFloat(tx_element.value);
        if (isNaN(parsed)) return;
        so[comp] = parsed;
    }
    initSystem(so);

    let f : scenefun = strScene_toFun(lastValid_strScene);
    scene_set(gs, f);
    renderer.draw_density(ro);
};

setup();
loop();
