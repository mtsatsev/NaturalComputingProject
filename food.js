class Food {
    constructor(pos_x, pos_y, weight) {
        this.weight = weight
        this.pos = createVector(pos_x, pos_y)
    }

    drawFood() {
        strokeWeight(this.weight);
        stroke(128);
        point(this.pos);
    }
}
