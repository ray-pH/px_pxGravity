class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }
    sub(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }
    dot(v) {
        return (this.x * v.x) + (this.y * v.y);
    }
    scale(s) {
        return new Vector2(s * this.x, s * this.y);
    }
}
export { Vector2 };
