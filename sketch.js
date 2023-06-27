const CanvasWidth = 400;
const CanvasHeight = 400;


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
  var Boid_distances = [] //Array(N).fill(Array(N).fill(0)) // Create [#Boid x #Boid] 0's matrix.

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

      let max_vel = 2 //randomGaussian(2, 1)
      let max_acc = 0.4 //randomGaussian(1, 1)

      let max_neighbours = 3// round(randomGaussian(5, 1))

      let max_food = round(randomGaussian(5, 1))

      // let max_vision = round(randomGaussian(50, 10))

      // Generate a new boid
      //id, pos_x, pos_y, max_vel, max_acc, max_neighbours, max_food, rule_weights

      Boids.push(new Boid(i, x, y, max_vel, max_acc, max_neighbours, max_food, generate_rule_weights(15)))
    }
  }
}

function seed_food(N, food_array) {
  for (let i = 0; i < N; i++) {
    let x = random(0, CanvasWidth)
    let y = random(0, CanvasHeight)

    let weight = round(randomGaussian(5, 4))

    var food = new Food(x, y, weight)
    food_array.push(food)
  }
}




const max_T = 500
var T = 0
const N_boids = 100 // Number of boids
const N_foods = 10
const Boids = []
const Foods = []


function setup() {
  seed_boids(N_boids, Boids) // Fill the Boid array
  seed_food(N_foods, Foods)
  createCanvas(400, 400);
}

function draw() {
  if (T < max_T) {
    background(220);
    var distance_mat = calc_boid_distances(Boids)

    for (let b of Boids) {
      b.move(distance_mat)
      strokeWeight(8);
      stroke(255);
      point(b.pos.x, b.pos.y);
    }
    let s = 0
    for (let f of Foods) {
      f.draw()
      s += f.weight
    }
    //console.log(s)
  }
  T += 1
}