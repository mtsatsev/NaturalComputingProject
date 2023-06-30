class EvolutionaryAlgorithm {
    constructor(Boids, Foods, mu, nRules = 13, pc = 1.0) {
        this.NBoids = Boids.length;
        this.mu = mu;
        this.pc = pc;
        this.Boids = Boids;
        this.Foods = Foods;
        this.nRules = nRules;
    }

    fitness(boid) {
        // TODO: DOES NOT WORK. NO FUNCITONALITY TO SEE HOW MUCH FOOD WE GOT.
        const collectedFood = boid.consumed_food;
        return collectedFood
    }

    mutate(boid, id) {
        const muProb = [];
        for (let i = 0; i < this.nRules; i++) {
            const prob = Math.random();
            muProb.push(prob);
        }
        var deltaWeights = this.generateGaussianDistribution(
            this.nRules, 0, 1
        );
        for (let i = 0; i < deltaWeights.lenght; i++) {
            if (muProb[i] > this.mu) {
                deltaWeights[i] = 0.0;
            }
        }
        var weights = boid.rw;

        const updatedWeights = weights.map((weight, idx) => weight + deltaWeights[idx])
        var x = floor(random(0, 800));
        var y = floor(random(0, 800));

        return new Boid(id, x, y, updatedWeights);
        /*

        Object.keys(boid).forEach((attrName, idx) => {
            if (attrName.startsWith("wr")) {
                boid[attrName] = updatedWeights[idx];
            }
        });*/
    }

    select_parent(K = 10) {
        const parents = [];
        var bestFitness = -1;
        var bestIdx = -1;
        for (let i = 0; i < K; i++) {
            const parent_candidate = this.Boids[Math.floor(Math.random(0, this.NBoids))];
            parents.push(parent_candidate);
            var parentFitness = this.fitness(parent_candidate);
            if (bestFitness < parentFitness) {
                bestFitness = parentFitness;
                bestIdx = i;
            }
        }
        const choice = parents[bestIdx];
        return choice;
    }

    writeResults(G) {
        const weights = this.Boids.reduce((dict, boid) => {
            dict["BOID: " + boid.id.toString()] = [boid.rw, this.fitness(boid), boid.density];
            return dict;
        }, {});

        saveJSON(weights, "result/"+G.toString()+'results.json');
    }

    Evolution(K) {
        const newGeneration = [];

        var i = 0;
        for (let i = 0; i < this.NBoids; i++) {
            var parent = this.select_parent(K)
            var offspring = this.mutate(parent, i)
            newGeneration.push(offspring)
        }
        return newGeneration;
    }

    generateGaussianDistribution(N, mean, standardDeviation) {
        const numbers = [];

        for (let i = 0; i < N; i++) {
            const number = randomGaussian(mean, standardDeviation);
            numbers.push(number);
        }
        return numbers
    }
}