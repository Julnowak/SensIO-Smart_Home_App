data {
    int<lower=0> N; //number of data
    vector[N] temperature;
}

generated quantities {
    real alpha = normal_rng(1.26, 0.05); // intercept
    real beta = normal_rng(94800, 1500); // slope
    real<lower=0> sigma = normal_rng(1300, 200);

    vector[N] y_sim;

    for (i in 1:N)
        y_sim[i] = normal_rng(alpha * temperature[i] + beta, sigma);
}
