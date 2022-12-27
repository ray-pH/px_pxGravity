class Vector2 {
    x : number;
    y : number;

    constructor(x : number, y : number){
        this.x = x;
        this.y = y;
    }

    add(v : Vector2) : Vector2 {
        return new Vector2(this.x + v.x, this.y + v.y);
    }
    sub(v : Vector2) : Vector2 {
        return new Vector2(this.x - v.x, this.y - v.y);
    }
    dot(v : Vector2) : number {
        return (this.x * v.x) + (this.y * v.y);
    }
    scale(s : number) : Vector2 {
        return new Vector2(s * this.x, s * this.y);
    }
}

export {Vector2};
