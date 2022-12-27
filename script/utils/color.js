function hex2rgb(h) {
    var r = (0xFF) & (h >> 16);
    var g = (0xFF) & (h >> 8);
    var b = (0xFF) & (h >> 0);
    return [r, g, b, 255];
}
function hex2rgba(h) {
    var r = (0xFF) & (h >> 32);
    var g = (0xFF) & (h >> 16);
    var b = (0xFF) & (h >> 8);
    var a = (0xFF) & (h >> 0);
    return [r, g, b, a];
}
export { hex2rgb, hex2rgba };
