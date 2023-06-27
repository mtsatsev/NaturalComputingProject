class EvolutionaryAlgorithm {
    constructor(Boids, Foods, mu, n_rules = 15, p_c = 1.0) {
        this.N_boids = Boids.length;
        this.mu = mu;
        this.p_c = p_c;
        this.Boids = Boids;
        this.Foods = Foods;
        this.n_rules = n_rules;
    }

    fitness(Boid) { }

    mutate(boid) {
        const mu_prob = [];
        for (let i = 0; i < this.n_rules; i++) {
            const prob = Math.random();
            mu_prob.push(prob);
        }
        delta_weights = this.generateGaussianDistribution(this.n_rules).map((weight, i) => {
            if (mu_prob[i] < this.mu) {
                return weight;
            } else {
                return 0.0;
            }
        });

        const weights = [];
        for (const attr_name in boid) {
            if (attr_name.startsWith("wr")) {
                const attribute = Boid[attr_name];
                weights.push(attribute);
            }
        }

        const updatedWeights = weights.map((weight, idx) => weight + delta_weights[idx]);

        Object.keys(boid).forEach((attr_name, idx) => {
            if (attr_name.startsWith("wr")) {
                boid[attr_name] = updatedWeights[idx];
            }
        });
    }

    generate_population() { };

    select_parent(Boid) { };


    generateGaussianDistribution(N, mean, standardDeviation) {
        const numbers = [];

        for (let i = 0; i < N; i++) {
            const number = randomGaussian() * standardDeviation + mean;
            numbers.push(number);
        }
    }
}