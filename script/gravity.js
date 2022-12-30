import { step_heun } from "./utils/solver32.js";
function clamp(x, min, max) {
    return Math.min(max, Math.max(min, x));
}
function inRange(x, min, max) {
    if (x > max)
        return false;
    if (x < min)
        return false;
    return true;
}
const G = 0.6;
const Pi = 3.14159265; //TODO: more digits
class GravitySystem {
    constructor(nx, ny, n_iter, dt, n_particle) {
        this.nx = nx;
        this.ny = ny;
        this.n_iter = n_iter;
        this.dt = dt;
        let nxy = nx * ny;
        this.nxy = nxy;
        this.Density = new Float32Array(nxy);
        this.Phi = new Float32Array(nxy);
        this.gx = new Float32Array(nxy);
        this.gy = new Float32Array(nxy);
        // this.Density_prev = new Float32Array(nxy);
        this.Phi_prev = new Float32Array(nxy);
        this.n_particle = n_particle;
        this.particles_m = new Float32Array(n_particle);
        this.particles_m.fill(1.0);
        this.particles_x = new Float32Array(n_particle);
        this.particles_y = new Float32Array(n_particle);
        this.particles_vx = new Float32Array(n_particle);
        this.particles_vy = new Float32Array(n_particle);
        this.particle_Arr = new Float32Array(n_particle * 4);
    }
    calcInitMomentum() {
        let [px, py] = this.debug_calcMomentum();
        this.initPx = px;
        this.initPy = py;
    }
    calcDensity() {
        this.Density.fill(0.0);
        for (let k = 0; k < this.n_particle; k++) {
            let ii = Math.floor(this.particles_x[k] * this.nx);
            let jj = Math.floor(this.particles_y[k] * this.ny);
            if (inRange(ii, 0, this.nx - 1) && inRange(jj, 0, this.ny - 1)) {
                this.Density[ii + this.nx * jj] += this.particles_m[ii + this.nx * jj];
            }
        }
    }
    // solveField() : void{
    //     let ny = this.ny;
    //     let h2 = 1/(this.nx * this.ny);
    //     for (let k = 0; k < this.n_iter; k++){
    //         this.Phi_prev.set(this.Phi);
    //         for (let i = 1; i < this.nx-1; i++){ for (let j = 1; j < this.ny-1; j++){
    //             let dd = (this.Phi_prev[(i-1) + ny*j] + this.Phi_prev[(i+1) + ny*j] +
    //                       this.Phi_prev[i + ny*(j-1)] + this.Phi_prev[i + ny*(j+1)]);
    //             this.Phi[i + ny*j] = 0.25 * (dd - 4*Pi*G*this.Density[i + ny*j] * h2);
    //         } }
    //     }
    // }
    //SOR
    solveField() {
        let w = 1.9;
        let ny = this.ny;
        let h2 = 1 / (this.nx * this.ny);
        this.Phi_prev.set(this.Phi);
        for (let k = 0; k < this.n_iter; k++) {
            for (let i = 1; i < this.nx - 1; i++) {
                for (let j = 1; j < this.ny - 1; j++) {
                    let dd = (this.Phi[(i - 1) + ny * j] + this.Phi[(i + 1) + ny * j] +
                        this.Phi[i + ny * (j - 1)] + this.Phi[i + ny * (j + 1)]);
                    let R = dd - 4 * Pi * G * this.Density[i + ny * j] * h2;
                    this.Phi[i + ny * j] = (1.0 - w) * this.Phi[i + ny * j] + w * 0.25 * R;
                }
            }
        }
    }
    calcGvector() {
        let nx = this.nx;
        for (let i = 1; i < this.nx - 1; i++) {
            for (let j = 1; j < this.ny - 1; j++) {
                this.gx[i + nx * j] = -(this.Phi[(i + 1) + nx * j] - this.Phi[(i - 1) + nx * j]) * 0.5 * this.nx;
                this.gy[i + nx * j] = -(this.Phi[i + nx * (j + 1)] - this.Phi[i + nx * (j - 1)]) * 0.5 * this.ny;
            }
        }
    }
    extrapolateBoundary(field) {
        var nx = this.nx;
        for (var i = 0; i < this.nx; i++) {
            field[i + nx * 0] = field[i + nx * 1];
            field[i + nx * (this.ny - 1)] = field[i + nx * (this.ny - 2)];
        }
        for (var j = 0; j < this.ny; j++) {
            field[0 + nx * j] = field[1 + nx * j];
            field[(this.nx - 1) + nx * j] = field[(this.nx - 2) + nx * j];
        }
    }
    // type diffFun = (t : number, arr : Float32Array) => Float32Array;
    genDiffFun() {
        let fun = (_t, Arr) => {
            let len = Arr.length / 4;
            let res = new Float32Array(Arr.length);
            let nx = this.nx;
            for (let k = 0; k < this.n_particle; k++) {
                let k_x = k;
                let k_y = k + len;
                let k_vx = k + 2 * len;
                let k_vy = k + 3 * len;
                let i = Math.floor(Arr[k_x] * this.nx);
                let j = Math.floor(Arr[k_y] * this.ny);
                if (!(inRange(i, 0, this.nx - 1) && inRange(j, 0, this.ny - 1)))
                    continue;
                res[k_x] = Arr[k_vx]; //Dx
                res[k_y] = Arr[k_vy]; //Dy
                res[k_vx] = this.gx[i + nx * j]; //Dvx
                res[k_vy] = this.gy[i + nx * j]; //Dvy
            }
            return res;
        };
        return fun;
    }
    stepMotion() {
        let np = this.n_particle;
        this.particle_Arr.set(this.particles_x, 0 * np);
        this.particle_Arr.set(this.particles_y, 1 * np);
        this.particle_Arr.set(this.particles_vx, 2 * np);
        this.particle_Arr.set(this.particles_vy, 3 * np);
        let Xn = step_heun(this.genDiffFun(), 0, this.particle_Arr, this.dt);
        this.particles_x.set(Xn.slice(0 * np, 1 * np));
        this.particles_y.set(Xn.slice(1 * np, 2 * np));
        this.particles_vx.set(Xn.slice(2 * np, 3 * np));
        this.particles_vy.set(Xn.slice(3 * np, 4 * np));
    }
    step() {
        this.calcDensity();
        this.solveField();
        this.extrapolateBoundary(this.Phi);
        this.calcGvector();
        this.extrapolateBoundary(this.gx);
        this.extrapolateBoundary(this.gy);
        this.stepMotion();
        // this.applyGravityAcc();
    }
    debug_calcMomentum() {
        let pX = 0;
        let pY = 0;
        for (let i = 0; i < this.n_particle; i++) {
            pX += this.particles_vx[i];
            pY += this.particles_vy[i];
        }
        return [pX, pY];
    }
    debug_calcL2Residue() {
        let sumRsq = 0;
        let h2 = 1 / (this.nx * this.ny);
        let ny = this.ny;
        for (let i = 1; i < this.nx - 1; i++) {
            for (let j = 1; j < this.ny - 1; j++) {
                let dd = (this.Phi[(i - 1) + ny * j] + this.Phi[(i + 1) + ny * j] +
                    this.Phi[i + ny * (j - 1)] + this.Phi[i + ny * (j + 1)]);
                // this.Phi[i + ny*j] = 0.25 * (dd - 4*Pi*G*this.Density[i + ny*j] * h2);
                let Rij = 4 * this.Phi[i + ny * j] + 4 * Pi * G * h2 * this.Density[i + ny * j] - dd;
                sumRsq += Rij * Rij;
            }
        }
        return Math.sqrt(sumRsq);
    }
    tweak_momentum() {
        let tolerance = 10;
        let [px, py] = this.debug_calcMomentum();
        let dpx = px - this.initPx;
        let dpy = py - this.initPy;
        if (Math.abs(dpx) > tolerance) {
            let dvx = dpx / this.n_particle;
            for (let i = 0; i < this.n_particle; i++)
                this.particles_vx[i] -= dvx;
        }
        if (Math.abs(dpy) > tolerance) {
            let dvy = dpy / this.n_particle;
            for (let i = 0; i < this.n_particle; i++)
                this.particles_vy[i] -= dvy;
        }
    }
}
class Renderer {
    constructor(gs, canvas) {
        this.waveScale = 1.0;
        this.Vdynamic = false; // flag, whether V changes over time
        this.option_drawBottomPot = true;
        this.gsys = gs;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.xres = gs.nx;
        this.yres = gs.ny;
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.scale(canvas.width / this.xres, canvas.height / this.yres);
        this.ctx.imageSmoothingEnabled = false; // -> nearest-neighbor interpolation
        // temp canvas to store original values
        this.data_canvas = document.createElement('canvas');
        this.data_canvas.width = this.xres;
        this.data_canvas.height = this.yres;
        this.data_ctx = this.data_canvas.getContext('2d');
        this.data_img_data = this.data_ctx.getImageData(0, 0, this.data_canvas.width, this.data_canvas.height);
        this.data_pixels = this.data_img_data.data;
    }
    draw_potential() {
        var gs = this.gsys;
        let color = [255, 255, 255, 255];
        // let obs_color = hex2rgb(0x9BB6E0); //obstacle #9bb6e0
        let maxdens = Math.max(...gs.Phi);
        let mindens = Math.min(...gs.Phi);
        let range = maxdens - mindens;
        for (let i = 0; i < gs.nxy; i++) {
            let dens = clamp(gs.Density[i] + mindens, 0, range) / range;
            let color = [255, 255, 255, 255];
            color[0] = 255 * dens;
            color[1] = 255 * dens;
            color[2] = 255 * dens;
            color[3] = 255;
            var p = 4 * i;
            this.data_pixels[p + 0] = color[0];
            this.data_pixels[p + 1] = color[1];
            this.data_pixels[p + 2] = color[2];
            this.data_pixels[p + 3] = color[3];
        }
        // put data into temp_canvas
        this.data_ctx.putImageData(this.data_img_data, 0, 0);
        // draw into original canvas
        this.ctx.drawImage(this.data_canvas, 0, 0);
    }
    draw_density() {
        var gs = this.gsys;
        let color = [255, 255, 255, 255];
        // let obs_color = hex2rgb(0x9BB6E0); //obstacle #9bb6e0
        let maxdens = Math.max(...gs.Density);
        for (let i = 0; i < gs.nxy; i++) {
            let dens = clamp(gs.Density[i], 0, maxdens) / maxdens;
            let color = [255, 255, 255, 255];
            color[0] = 255 * dens;
            color[1] = 255 * dens;
            color[2] = 255 * dens;
            color[3] = 255;
            var p = 4 * i;
            this.data_pixels[p + 0] = color[0];
            this.data_pixels[p + 1] = color[1];
            this.data_pixels[p + 2] = color[2];
            this.data_pixels[p + 3] = color[3];
        }
        // put data into temp_canvas
        this.data_ctx.putImageData(this.data_img_data, 0, 0);
        // draw into original canvas
        this.ctx.drawImage(this.data_canvas, 0, 0);
    }
}
export { GravitySystem, Renderer };
