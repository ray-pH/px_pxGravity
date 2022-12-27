import {arr_add, arr_scale, arr_mul, arr_concat} from "./utils/arr64.js"
import {step_euler, step_heun, step_RK4} from "./utils/solver64.js"
// import {hex2rgb} from "./utils/color.js"
// import {Vector2} from "./utils/vector2";

function clamp(x : number, min : number,max : number) : number{
    return Math.min(max, Math.max(min, x));
}

function inRange(x : number, min : number, max : number) : boolean{
    if (x > max) return false;
    if (x < min) return false;
    return true;
}

const G = 1.0;
const Pi = 3.14159265; //TODO: more digits
class GravitySystem {
    Density  : Float32Array;
    Phi: Float32Array; // potential
    Density_prev  : Float32Array;
    Phi_prev: Float32Array; // potential

    nx : number;
    ny : number;
    nxy: number;
    dt : number;

    n_particle   : number;
    particles_m  : Float32Array;
    particles_x  : Float32Array;
    particles_y  : Float32Array;
    particles_vx : Float32Array;
    particles_vy : Float32Array;

    n_iter : number;

    constructor(nx : number, ny : number, n_iter : number, dt : number, n_particle : number){
        this.nx = nx;
        this.ny = ny;
        this.n_iter = n_iter;

        this.dt = dt;

        let  nxy = nx * ny;
        this.nxy = nxy;
        this.Density = new Float32Array(nxy);
        this.Phi     = new Float32Array(nxy);
        this.Density_prev = new Float32Array(nxy);
        this.Phi_prev     = new Float32Array(nxy);

        this.n_particle   = n_particle;
        this.particles_m  = new Float32Array(n_particle);
        this.particles_m.fill(1.0);
        this.particles_x  = new Float32Array(n_particle);
        this.particles_y  = new Float32Array(n_particle);
        this.particles_vx = new Float32Array(n_particle);
        this.particles_vy = new Float32Array(n_particle);

    }

    calcDensity(){
        this.Density.fill(0.0);
        for (let k = 0; k < this.n_particle; k++){
            let ii = Math.round(this.particles_x[k] * this.nx);
            let jj = Math.round(this.particles_y[k] * this.ny);
            if (inRange(ii, 0, this.nx-1) && inRange(jj, 0, this.ny-1)){
                this.Density[ii + this.nx*jj] += this.particles_m[ii + this.nx*jj];
            }
        }
    }

    solveField() : void{
        this.Phi_prev.set(this.Phi);
        let ny = this.ny;
        let h2 = 1/(this.nx * this.ny);
        for (let k = 0; k < this.n_iter; k++){
            for (let i = 1; i < this.nx-1; i++){ for (let j = 1; j < this.ny-1; j++){
                let dd = (this.Phi[(i-1) + ny*j] + this.Phi[(i+1) + ny*j] +
                          this.Phi[i + ny*(j-1)] + this.Phi[i + ny*(j+1)]);
                this.Phi[i + ny*j] = 0.25 * (dd - 4*Pi*G*this.Density[i + ny*j] * h2);
            } }
        }
    }

    extrapolateBoundary(field : Float32Array) {
        var nx = this.nx;
        for (var i = 0; i < this.nx; i++) {
            field[i + nx*0] = field[i + nx*1];
            field[i + nx*(this.ny-1)] = field[i + nx*(this.ny-2)]; 
        }
        for (var j = 0; j < this.ny; j++) {
            field[0 + nx*j] = field[1 + nx*j];
            field[(this.nx-1) + nx*j] = field[(this.nx-2) + nx*j];
        }
    }


    // ∇⋅g = -∇²Φ
    // g   = -∇ Φ
    applyGravityAcc(){
        // let nx = this.nx;
        // for (let i = 1; i < this.nx-1; i++){ for (let j = 1; j < this.ny-1; j++){
        //     if (this.Density[i + nx*j] == 0.0) continue;
        //     // 1/(2h) = 0.5 n
        //     let gx = - (this.Phi[(i+1) + nx*j] - this.Phi[(i-1) + nx*j]) * 0.5 * this.nx;
        //     let gy = - (this.Phi[i + nx*(j+1)] - this.Phi[i + nx*(j-1)]) * 0.5 * this.ny;
        //     this.Vx[i + nx*j] += gx * this.dt;
        //     this.Vx[i + nx*j] += gy * this.dt;
        // } }
        let nx = this.nx;
        for (let k = 0; k < this.n_particle; k++){
            let i = Math.round(this.particles_x[k] * this.nx);
            let j = Math.round(this.particles_y[k] * this.ny);
            if (inRange(i, 1, this.nx-2) && inRange(j, 1, this.ny-2)){
                let gx = - (this.Phi[(i+1) + nx*j] - this.Phi[(i-1) + nx*j]) * 0.5 * this.nx;
                let gy = - (this.Phi[i + nx*(j+1)] - this.Phi[i + nx*(j-1)]) * 0.5 * this.ny;
                this.particles_vx[k] += gx * this.dt;
                this.particles_vy[k] += gy * this.dt;
                this.particles_x[k] += this.particles_vx[k] * this.dt;
                this.particles_y[k] += this.particles_vy[k] * this.dt;
            }
        }
    }

    step() {
        this.calcDensity();
        this.solveField();
        this.extrapolateBoundary(this.Phi);
        this.applyGravityAcc();
    }
}

class Renderer {
    gsys : GravitySystem;
    canvas : HTMLCanvasElement;
    ctx    : CanvasRenderingContext2D;
    width  : number;
    height : number;

    xres   : number;
    yres   : number;
    waveScale : number = 1.0;
    Vdynamic  : boolean = false; // flag, whether V changes over time

    option_drawBottomPot : boolean = true;

    data_canvas   : HTMLCanvasElement;
    data_ctx      : CanvasRenderingContext2D;
    data_img_data : ImageData;
    data_pixels   : ImageData["data"];

    constructor(gs : GravitySystem, canvas : HTMLCanvasElement){
        this.gsys = gs;

        this.ctx      = canvas.getContext('2d');
        this.width    = canvas.width;
        this.height   = canvas.height;

        this.xres  = gs.nx;
        this.yres  = gs.ny;
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.scale(canvas.width/this.xres, canvas.height/this.yres);
        this.ctx.imageSmoothingEnabled = false; // -> nearest-neighbor interpolation
        
        // temp canvas to store original values
        this.data_canvas        = document.createElement('canvas');
        this.data_canvas.width  = this.xres;
        this.data_canvas.height = this.yres;
        this.data_ctx      = this.data_canvas.getContext('2d');
        this.data_img_data = this.data_ctx.getImageData(0,0, this.data_canvas.width, this.data_canvas.height);
        this.data_pixels   = this.data_img_data.data;
    }

    draw() {
        var gs = this.gsys;
        let color     = [255, 255, 255, 255];
        // let obs_color = hex2rgb(0x9BB6E0); //obstacle #9bb6e0
        let maxdens = Math.max(...gs.Density);
        for (let i = 0; i < gs.nxy; i++){

            let dens = clamp(gs.Density[i], 0, maxdens)/maxdens;
            let color = [255, 255, 255, 255];
            color[0] = 255 * dens;
            color[1] = 255 * dens;
            color[2] = 255 * dens;
            color[3] = 255;

            var p = 4*i;
            this.data_pixels[p+0] = color[0];
            this.data_pixels[p+1] = color[1];
            this.data_pixels[p+2] = color[2];
            this.data_pixels[p+3] = color[3];
        }

        // put data into temp_canvas
        this.data_ctx.putImageData(this.data_img_data, 0, 0);
        // draw into original canvas
        this.ctx.drawImage(this.data_canvas, 0, 0);
    }

}

export {GravitySystem, Renderer};
