function arr_add(a1 : Float32Array , a2 : Float32Array) : Float32Array {
    let l : number = Math.min(a1.length, a2.length);
    let ares   = new Float32Array(l);
    for (var i = 0; i < l; i++) ares[i] = a1[i] + a2[i];
    return ares;
}

function arr_mul(a1 : Float32Array , a2 : Float32Array) : Float32Array {
    let l : number = Math.min(a1.length, a2.length);
    let ares   = new Float32Array(l);
    for (var i = 0; i < l; i++) ares[i] = a1[i] * a2[i];
    return ares;
}

function arr_scale(s : number, arr : Float32Array) : Float32Array{
    let ares = new Float32Array(arr.length);
    for (var i = 0; i < arr.length; i++) ares[i] = s * arr[i];
    return ares;
}

function arr_concat(arr1 : Float32Array, arr2 : Float32Array) : Float32Array {
    let result = new Float32Array(arr1.length + arr2.length);
    result.set(arr1);
    result.set(arr2, arr1.length);
    return result;
}

export {arr_add, arr_scale, arr_mul, arr_concat};
