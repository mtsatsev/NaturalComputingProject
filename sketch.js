const CanvasWidth = 800;
const CanvasHeight = 800;

const max_T = 2000
const max_G = 20
var T = 0
var G = 0
const N_boids = 30 // Number of boids
const N_foods = 20 // Number of foods
const FoodCoolDown = 10;

var Boids = []
var Foods = []


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
      Boids.push(new Boid(i, x, y, generate_rule_weights(13)))
    }
  }
}

function seed_food(N, food_array) {
  for (let i = 0; i < N; i++) {
    let x = random(0, CanvasWidth)
    let y = random(0, CanvasHeight)

    let weight = round(8)

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
    console.log(G)
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
      T += 1

      for (let f of Foods) {
        f.drawFood()
      }
      //console.log(s)
      T++;
    } else {
      var EA = new EvolutionaryAlgorithm(Boids, Foods, 0.01);
      EA.writeResults(G);
      Boids = EA.Evolution(10);
      Foods = []
      seed_food(N_foods, Foods)
      G += 1
      T = 0
    }
  } else {
    console.log('THATS ALL FOLK');
  }
}