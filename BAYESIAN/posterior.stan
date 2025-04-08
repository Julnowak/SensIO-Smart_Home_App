data {
    int<lower=0> N; //number of data
    array[N] real temperature;
    array[N] real y;
}

parameters {
    real alpha;//intercept
    real beta; //slope
    real<lower=0> sigma;
}

model {
    //priors
    alpha ~ normal(1.26, 0.05);
    beta ~ normal(94800, 1500);
    sigma ~ normal(1300,200);
    
    for(n in 1:N)
        y[n] ~ normal(alpha * temperature[n]  + beta , sigma); //likelihood
}

generated quantities {
    array[N] real y_sim; //simulated data from posterior
    array[N] real log_lik;

    for(i in 1:N){
        y_sim[i] = normal_rng(alpha * temperature[i] + beta , sigma);
        log_lik[i] = normal_lpdf(y[i] | alpha * temperature[i] + beta , sigma);
    }
	    
}