const CanvasWidth = 800;
const CanvasHeight = 800;
const max_T = 2000
const max_G = 20
var T = 0
var G = 0
const N_boids = 30 // Number of boids
const N_foods = 15 // Number of foods
var Boids = []
var Foods = []
const FoodCoolDown = 10;

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

class Boid {
    constructor(id, pos_x, pos_y, rule_weights) {
        // Boid ID, for keeping track of this boid's position in the distance matrix
        this.id = id

        // Position
        this.pos = createVector(pos_x, pos_y)
        // Velocity
        this.vel = p5.Vector.random2D().mult(2)
        // Acceleration
        this.acc = createVector(0, 0)

        // Set maximum velocity and acceleration (Same as in previous assignment)
        this.max_vel = 2
        this.max_acc = 0.1

        // Set vision range
        this.vision_range = 50

        // Keep track of neighbours (within vision)
        this.max_neighbours = 5
        this.neighbours = [] // Neigbour positions and velocities

        // Food consumption
        this.cd = 0
        this.consumed_food = 0

        // Density
        this.density = 0

        this.rw = rule_weights
        // Set movement rule strengths (rw = rule weight)
        // Positional rules
        this.rw_mean_pos = rule_weights[0]
        this.rw_near_pos = rule_weights[1]
        this.rw_far_pos = rule_weights[2]

        // Velocity rules
        this.rw_mean_vel = rule_weights[3]
        this.rw_near_vel = rule_weights[4]
        this.rw_far_vel = rule_weights[5]

        // Allignment rules
        this.rw_mean_all = rule_weights[6]
        this.rw_near_all = rule_weights[7]
        this.rw_far_all = rule_weights[8]

        // Seperation rules
        this.rw_mean_sep = rule_weights[9]
        this.rw_near_sep = rule_weights[10]
        this.rw_far_sep = rule_weights[11]

        // Food rules
        this.rw_near_food = rule_weights[12]

    }

    // Boid_distances = [#Boid x #Boid] matrix
    collect_neighbours(Boid_distances) {

        // Copy by value
        let neighbour_distances = Boid_distances[this.id];

        // Sort by numerical value
        neighbour_distances.sort(function (a, b) { return a[0] - b[0] })

        // get the first max_neighbour + 1 (self is included) boid
        neighbour_distances = neighbour_distances.slice(1, this.max_neighbours + 1)
        for (let i = 0; i < neighbour_distances.length; i++) {
            if (neighbour_distances[i][0] > this.vision_range) {
                return neighbour_distances.slice(0, i)
            }
        }
        return neighbour_distances 
    }

    // Calculate movement vector based on the movement rules.
    move(Boid_distances) {
        // Get neighbour_distances
        var neighbour_distances = this.collect_neighbours(Boid_distances)

        var acc_hat = createVector()

        // Go over all movement rules

        if (neighbour_distances.length > 0) {

            // Positional rules
            acc_hat = this.positional(acc_hat, neighbour_distances)

            // Velocity rules 
            acc_hat = this.velocity(acc_hat, neighbour_distances)


            // Allignment rules
            acc_hat = this.allignment(acc_hat, neighbour_distances)

            // Seperation rules
            acc_hat = this.seperation(acc_hat, neighbour_distances)
        }
        // Food rules
        acc_hat = this.food(acc_hat)


        // Update Velocity
        acc_hat.limit(this.max_acc)
        this.vel.add(acc_hat)
        this.vel.limit(this.max_vel)

        // Update Position
        this.pos.add(this.vel)

        if (this.pos.x > width) {
            this.vel.add(-0.1, 0)
        }
        if (this.pos.y > height) {
            this.vel.add(0, -0.1)
        }
        if (this.pos.x < 0) {
            this.vel.add(0.1, 0)
        }
        if (this.pos.y < 0) {
            this.vel.add(0, 0.1)
        }

        // Collect density
        this.density += neighbour_distances.length / max_T
    }

    positional(acc_hat, neighbour_distances) {
        var mean_pos = createVector()  // Mean position
        let j = 0
        for (let i = 0; i < this.max_neighbours && i < neighbour_distances.length; i++) {
            j += 1
            mean_pos.add(neighbour_distances[i][1])
        }
        acc_hat.add(mean_pos.mult(-this.rw_mean_pos / j))

        // Nearest neighbour
        var near_pos = createVector()
        near_pos.add(neighbour_distances[0][1])
        acc_hat.add(near_pos.mult(-this.rw_near_pos))

        // Furthest neighbour
        var far_pos = createVector()
        far_pos.add(neighbour_distances[neighbour_distances.length - 1][1])
        acc_hat.add(far_pos.mult(-this.rw_far_pos))

        return acc_hat
    }

    velocity(acc_hat, neighbour_distances) {
        var mean_vel = this.vel.copy()
        mean_vel.setMag(1) // Mean position
        let magnitude = 0
        let j = 0
        for (let i = 0; i < this.max_neighbours && i < neighbour_distances.length; i++) {
            j += 1
            magnitude += neighbour_distances[i][2].vel.mag() 
        }
        magnitude /= j
        mean_vel.setMag(magnitude)
        acc_hat.add(mean_vel.mult(this.rw_mean_vel))


        // Nearest neighbour
        var near_vel = this.vel.copy()
        near_vel.setMag(neighbour_distances[0][2].vel.mag())
        acc_hat.add(near_vel.mult(this.rw_near_vel))

        // Furthest neighbour
        var far_vel = this.vel.copy()
        far_vel.setMag(neighbour_distances[neighbour_distances.length - 1][2].vel.mag())
        acc_hat.add(far_vel.mult(this.rw_far_vel))

        return acc_hat
    }

    allignment(acc_hat, neighbour_distances) {
        var mean_allign = createVector(1, 0)  // Mean position
        let rads = 0
        let j = 0
        for (let i = 0; i < this.max_neighbours && i < neighbour_distances.length; i++) {
            j += 1
            rads += neighbour_distances[i][2].vel.heading()
            //*this.rw_mean_pos
        }
        rads /= j
        mean_allign.setHeading(rads)
        acc_hat.add(mean_allign.mult(this.rw_mean_all))

        // Nearest neighbour
        var near_allign = createVector(1, 0)
        near_allign.setHeading(neighbour_distances[0][2].vel.heading())
        acc_hat.add(near_allign.mult(this.rw_near_all))

        // Furthest neighbour
        var far_allign = createVector(1, 0)
        far_allign.setHeading(neighbour_distances[neighbour_distances.length - 1][2].vel.heading())
        acc_hat.add(far_allign.mult(this.rw_far_all))

        return acc_hat
    }

    seperation(acc_hat, neighbour_distances) {
        var mean_sep = createVector()  // Mean position
        let j = 0
        for (let i = 0; i < this.max_neighbours && i < neighbour_distances.length; i++) {
            j += 1
            mean_sep.add(neighbour_distances[i][1])
            mean_sep.mult(1 - (neighbour_distances[i][0] / this.vision_range))//*this.rw_mean_pos
        }
        acc_hat.add(mean_sep.mult(this.rw_mean_sep / j))

        // Nearest neighbour
        var near_sep = createVector()
        near_sep.add(neighbour_distances[0][1])
        near_sep.mult(1 - (neighbour_distances[0][0] / this.vision_range))
        acc_hat.add(near_sep.mult(this.rw_near_sep))

        // Furthest neighbour
        var far_sep = createVector()
        far_sep.add(neighbour_distances[neighbour_distances.length - 1][1])
        far_sep.mult(1 - (neighbour_distances[neighbour_distances.length - 1][0] / this.vision_range))

        acc_hat.add(far_sep.mult(this.rw_far_sep))

        return acc_hat

    }

    food(acc_hat) {
        var food_distances = []

        // Calculate distances
        for (let food of Foods) {
            if (food.weight > 0) {
                let vector = p5.Vector.sub(this.pos, food.pos)
                let distance = vector.mag()
                food_distances.push([distance, vector, food])
            }
        }

        if (food_distances.length > 0) {

            // sort to get closest
            food_distances.sort(function (a, b) { return a[0] - b[0] })


            // Go to closest (if inside of vision)
            if (food_distances[0][0] <= this.vision_range) {
                var near_food = createVector()
                near_food.add(food_distances[0][1])
                acc_hat.add(near_food.mult(-this.rw_near_food))
            }

            // Food eating if available
            if (this.cd > 0) {
                this.cd--
            }

            if (this.cd == 0 && food_distances[0][0] <= 5) {
                this.cd = FoodCoolDown;
                this.consumed_food++;
                food_distances[0][2].weight--;
            }
        }
        return acc_hat
    }
}

// Generate (uniformly distributed) random rule weights in the range (-1, 1)
function generate_rule_weights(nr_rules) {
    var rule_weights = []
    for (let i = 0; i < nr_rules; i++) {
        rule_weights.push(random(-1, 1))
    }
    return rule_weights
}

// Generate the Boid distance matrix
// Boid matrix is of shape [N x N x 2] 2 = (Distance, velocity vector)
function calc_boid_distances(Boids) {
    let N = Boids.length
    var i = 0
    var Boid_distances = [] 

    // Loop over boids
    for (var boid_a of Boids) {
        if (i != boid_a.id) {
            throw new Error(`Boids list is not sorted correctly (id = 0,1,2,...,N), ${i} !=  ${boid_a.id}`)
        }
        let a = boid_a.pos.copy()
        var neighbour_distances = []

        // Loop over potential neighbours
        for (var boid_b of Boids) {
            let b = boid_b.pos.copy()
            let dis_vec = p5.Vector.sub(a, b)
            let distance = dis_vec.mag()
            neighbour_distances.push([distance, dis_vec, boid_b])
        }

        Boid_distances.push(neighbour_distances)
        i += 1
    }
    return Boid_distances

}

// Seed boids on the canvas
function seed_boids(N, boid_array, mode = 'random') {
    if (mode == 'random') {
        for (let i = 0; i < N; i++) {
            let x = random(0, CanvasWidth)
            let y = random(0, CanvasHeight)
            Boids.push(new Boid(i, x, y, generate_rule_weights(13)))
        }
    }
}

function seed_food(N, food_array) {
    for (let i = 0; i < N; i++) {
        let x = random(0, CanvasWidth)
        let y = random(0, CanvasHeight)

        let weight = 8

        var food = new Food(x, y, weight)
        food_array.push(food)
    }
}

function setup() {
    seed_boids(N_boids, Boids) // Fill the Boid array
    seed_food(N_foods, Foods)
    createCanvas(CanvasWidth, CanvasHeight);
}

function draw() {

    if (G < max_G) {
        if (T < max_T) { // Run Generational Simulation
            if (T % 200 == 0) background(220);

            var distance_mat = calc_boid_distances(Boids)

            for (let b of Boids) {
                b.move(distance_mat)
                if (T % 200 == 0) {
                    strokeWeight(8);
                    stroke(255);
                    point(b.pos.x, b.pos.y);
                }
            }

            for (let f of Foods) {
                if (T % 200 == 0) {
                    f.drawFood()
                }
            }

            T += 1
        } else { // Generational Simulation is over
            writeResults(Boids)

            Boids = sample_new_generation(Boids)
            Foods = []
            seed_food(N_foods, Foods)

            G += 1
            T = 0
        }
    }
}

// Takes all boids and returns a fitness distribution 
function sample_new_generation(Boids) {
    var tot_food = 0
    var table = []
    var new_boids = []

    // Generate lookup table to sample from
    for (var boid of Boids) {
        tot_food += boid.consumed_food
        for (let i = 0; i < boid.consumed_food + 1; i++) {
            table.push(boid.id)
        }
    }

    // Sample children
    for (let i = 0; i < N_boids; i++) {
        var parent_ix1 = table[floor(random(0, tot_food))] // Sample
        var parent_ix2 = table[floor(random(0, tot_food))] // Sample
        var parent1 = Boids[parent_ix1] // Select
        var parent2 = Boids[parent_ix2] // Select

        var child
        if (parent1.consumed_food > parent2.consumed_food) {
            child = mutate_and_generate(parent1, i) // Generate child
        } else {
            child = mutate_and_generate(parent2, i) // Generate child
        }

        new_boids.push(child)
    }
    return new_boids
}

// Takes a Boid parent and returns a mutated offspring
function mutate_and_generate(parent, id) {
    // id, pos_x, pos_y, max_vel, max_acc, max_neighbours, max_food, max_vision, rule_weights
    var new_weights = []
    for (var w of parent.rw) {
        new_w = randomGaussian(0, 0.2) + w
        new_weights.push(new_w)
    }

    var x = random(0, CanvasWidth)
    var y = random(0, CanvasHeight)

    var child = new Boid(id, x, y, new_weights)
    return child
}

function writeResults(Boids) {
    const weights = Boids.reduce((dict, boid) => {
        dict["BOID: " + boid.id.toString()] = [boid.rw, boid.consumed_food, boid.density];
        return dict;
    }, {});

    saveJSON(weights, "FoodCoolDown10/Run" + G.toString() + '/results.json');
}
