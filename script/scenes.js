function scene_set(gs, sf) {
    let px = gs.particles_x;
    let py = gs.particles_y;
    let vx = gs.particles_vx;
    let vy = gs.particles_vy;
    let m = gs.particles_m;
    gs.Phi.fill(0.0);
    sf(px, py, vx, vy, m);
    gs.calcInitMomentum();
    gs.calcDensity();
}
function strScene_toFun(s) {
    let f = new Function('px', 'py', 'vx', 'vy', 'm', "\"use strict\";\n" + s);
    return f;
}
let strScene_randomWithRotation = `let n_particle = px.length;
for (let i = 0; i < n_particle; i++){
    let x = Math.random();
    let y = Math.random();
    px[i] = x;
    py[i] = y;
    vx[i] = (y-0.5)*1;
    vy[i] = -(x-0.5)*1;
    m[i]  = 1.0;
}
`;
let strScene_randomStatic = `let n_particle = px.length;
for (let i = 0; i < n_particle; i++){
    let x = Math.random();
    let y = Math.random();
    px[i] = x;
    py[i] = y;
    vx[i] = 0;
    vy[i] = 0;
    m[i]  = 1.0;
}
`;
let strScene_twoGroups = `let n_particle = px.length;
const PI = 3.14159265;
function gen_clump(cx, cy, r, vx_val, vy_val, id_from, id_to){
    for (let i = id_from; i < id_to; i++){
        let rad = r * Math.sqrt(Math.random());
        let angle = 2*PI * Math.random();
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
`;
export { scene_set, strScene_toFun, strScene_randomWithRotation, strScene_randomStatic, strScene_twoGroups };
