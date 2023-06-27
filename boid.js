class Boid {
    constructor(id, pos_x, pos_y, max_vel, max_acc, max_neighbours, max_food, rule_weights) {
        // Boid ID, for keeping track of this boid's position in the distance matrix
        this.id = id

        // Position
        this.pos = createVector(pos_x, pos_y)
        // Velocity
        this.vel = p5.Vector.random2D().mult(2)
        // Acceleration
        this.acc = createVector(0, 0)

        // Set maximum velocity and acceleration
        this.max_vel = max_vel
        this.max_acc = max_acc

        // Set vision range
        this.vision_range = 50

        // Keep track of neighbours (within vision)
        this.max_neighbours = max_neighbours
        this.neighbours = [] // Neigbour positions and velocities

        // Keep track of food (within vision)
        this.max_food = max_food
        this.foods = [] // Food positions


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
        this.rw_mean_food = rule_weights[12]
        this.rw_near_food = rule_weights[13]
        this.rw_far_food = rule_weights[14]
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

        return neighbour_distances // Array[Tuple(float, vector, Boid)]

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
        acc_hat = this.food(acc_hat, neighbour_distances) // Not implemented

        // Update Velocity
        acc_hat.limit(this.max_acc)
        this.vel.add(acc_hat)
        this.vel.limit(this.max_vel)

        // Update Position
        this.pos.add(this.vel)

        if (this.pos.x > width) {
            this.pos.x = 0;
        }
        if (this.pos.y > height) {
            this.pos.y = 0;
        }
        if (this.pos.x < 0) {
            this.pos.x = width;
        }
        if (this.pos.y < 0) {
            this.pos.y = height;
        }
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
            magnitude += neighbour_distances[i][2].vel.mag() //*this.rw_mean_vel
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


        // return acc_hat
    }

    food(acc_hat, neighbour_distances) {
        // TODO
        return acc_hat
    }
}