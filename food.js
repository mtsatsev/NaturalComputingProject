class Food {
    constructor(pos_x, pos_y, weight, FoodCoolDown = 20) {
        this.weight = weight
        this.pos = createVector(pos_x, pos_y)
        this.FoodCoolDown = FoodCoolDown
    }

    draw() {
        strokeWeight(this.weight);
        stroke(128);
        point(this.pos);
    }
}
