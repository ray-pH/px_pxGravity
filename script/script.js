import { GravitySystem, Renderer } from "./gravity.js";
import { scene_set, strScene_toFun, strScenes } from "./scenes.js";
import { cmap_names } from "./utils/js-colormaps.js";
var canvas = document.getElementById("canvas");
var lastValid_strScene = "";
var paused = false;
const so = {
    n_grid: 120,
    n_iter: 60,
    dt: 0.01,
    n_particle: 40000,
    G: 0.6,
};
const ro = {
    toggle_log_scale: true,
    colormap: 'bone'
};
cmap_names.unshift(ro.colormap);
var gs;
var renderer;
function initSystem(so) {
    gs = new GravitySystem(so.n_grid, so.n_grid, so.n_iter, so.dt, so.n_particle);
    gs.setG(so.G);
    renderer = new Renderer(gs, canvas);
}
var debug_div = document.getElementById("debug");
debug_div.style.display = 'none';
function readSceneFromURL() {
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    let urlstrScene = urlParams.get('scene');
    if (urlstrScene == null)
        return false;
    let parsedstrScene = "";
    try {
        parsedstrScene = atob(decodeURIComponent(urlstrScene));
    }
    catch (e) {
        console.log(e);
        return false;
    }
    document.getElementById("select_scene").value =
        (Object.keys(strScenes).length - 1).toString();
    lastValid_strScene = parsedstrScene;
    textarea_scene.value = parsedstrScene;
    document.getElementById("button_moreScene").click();
    document.getElementById("button_applyScene").click();
    return true;
}
function setup() {
    initSystem(so);
    let containerIds = ["container_sceneInput", "container_renderOption", "container_simulOption", "container_sceneHelp"];
    containerIds.forEach((id) => { document.getElementById(id).style.display = 'none'; });
    let select_scene = document.getElementById('select_scene');
    let strScenesKeys = Object.keys(strScenes);
    for (let id in strScenesKeys) {
        select_scene.add(new Option(strScenesKeys[id], id));
    }
    let success = readSceneFromURL();
    if (success)
        return;
    let initScene = strScenes[strScenesKeys[0]];
    lastValid_strScene = initScene;
    scene_set(gs, strScene_toFun(initScene));
    textarea_scene.value = initScene;
}
function loop() {
    if (!paused) {
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
};
var button_reset = document.getElementById("button_reset");
button_reset.onclick = () => {
    let f = strScene_toFun(lastValid_strScene);
    scene_set(gs, f);
    renderer.draw_density(ro);
};
// var scene = 0;
var textarea_scene = document.getElementById("textarea_scene");
var button_applyScene = document.getElementById("button_applyScene");
var container_sceneInput = document.getElementById("container_sceneInput");
var span_errorScene = document.getElementById("span_errorScene");
button_applyScene.onclick = () => {
    let s = textarea_scene.value;
    let f = strScene_toFun(s);
    let msg = "";
    let bgcolor = "#D6D6D6";
    try {
        scene_set(gs, f);
    }
    catch (e) {
        msg = e.toString();
        bgcolor = "#D63333";
    }
    if (msg == "")
        lastValid_strScene = s;
    container_sceneInput.style.backgroundColor = bgcolor;
    span_errorScene.innerHTML = msg;
    renderer.draw_density(ro);
};
var select_scene = document.getElementById("select_scene");
select_scene.onchange = () => {
    let scene = parseInt(select_scene.value);
    let strScene = strScenes[Object.keys(strScenes)[scene]];
    lastValid_strScene = strScene;
    textarea_scene.value = strScene;
    let f = strScene_toFun(strScene);
    scene_set(gs, f);
    renderer.draw_density(ro);
    let msg = "";
    let bgcolor = "#D6D6D6";
    container_sceneInput.style.backgroundColor = bgcolor;
    span_errorScene.innerHTML = msg;
};
var button_shareScene = document.getElementById("button_shareScene");
var span_shareScene = document.getElementById("span_shareScene");
var input_shareScene = document.getElementById("input_shareScene");
button_shareScene.onclick = () => {
    let siteURI = window.location.href.split('?')[0];
    let strScene = textarea_scene.value;
    let strScene64 = btoa(strScene);
    span_shareScene.style.display = "grid";
    input_shareScene.value = siteURI + "?scene=" + encodeURIComponent(strScene64);
};
function setButtonShow(buttonId, containerId, sOpen, sClosed) {
    let button = document.getElementById(buttonId);
    let container = document.getElementById(containerId);
    button.onclick = () => {
        let changeto = (container.style.display == 'none') ? 'block' : 'none';
        button.innerHTML = (changeto == 'none') ? sOpen : sClosed;
        container.style.display = changeto;
    };
}
setButtonShow("button_moreDesc", "container_desc", '∨', '∧');
setButtonShow("button_moreScene", "container_sceneInput", '∨', '∧');
setButtonShow("button_moreRender", "container_renderOption", '∨', '∧');
setButtonShow("button_moreSimul", "container_simulOption", '∨', '∧');
setButtonShow("button_helpScene", "container_sceneHelp", '?', '?');
function attachCheckbox(checkboxId, opt, component) {
    let checkbox = document.getElementById(checkboxId);
    checkbox.onchange = () => {
        opt[component] = checkbox.checked;
        renderer.draw_density(ro);
    };
}
attachCheckbox("cx_toggleLog", ro, "toggle_log_scale");
var select_cmap = document.getElementById("select_cmap");
for (const cname of cmap_names) {
    select_cmap.add(new Option(cname));
}
select_cmap.onchange = () => {
    ro.colormap = select_cmap.value;
    renderer.draw_density(ro);
};
const tx_SOcomponent = {
    "tx_n_grid": "n_grid",
    "tx_dt": "dt",
    "tx_n_particle": "n_particle",
    "tx_G": "G",
};
for (let tx_id in tx_SOcomponent) {
    let comp = tx_SOcomponent[tx_id];
    let tx_element = document.getElementById(tx_id);
    tx_element.value = so[comp];
}
var button_applySimulOp = document.getElementById("button_applySimulOp");
button_applySimulOp.onclick = () => {
    for (let tx_id in tx_SOcomponent) {
        let comp = tx_SOcomponent[tx_id];
        let tx_element = document.getElementById(tx_id);
        let parsed = parseFloat(tx_element.value);
        if (isNaN(parsed))
            return;
        so[comp] = parsed;
    }
    initSystem(so);
    let f = strScene_toFun(lastValid_strScene);
    scene_set(gs, f);
    renderer.draw_density(ro);
};
setup();
loop();
