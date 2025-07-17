data {
  int<lower=0> N;
  vector[N] sqm;
  vector[N] temp;
}

transformed data {
  vector[N] log_sqm = log1p(sqm);
  vector[N] log_sqm_scaled = (log_sqm - mean(log_sqm)) / sd(log_sqm);
  vector[N] temp_scaled = (temp - mean(temp)) / sd(temp);
}

generated quantities {
  vector[N] y_sim;
  
  for (n in 1:N) {
    real beta0 = normal_rng(4, 0.01);
    real beta1 = normal_rng(1.2, 0.1);
    real beta2 = normal_rng(-0.8, 0.4);
    real sigma = lognormal_rng(-2.2, 0.1);

    real mu = beta0 
            + beta1 * tanh(log_sqm_scaled[n])
            + beta2 * temp_scaled[n] * exp(-temp_scaled[n]^2);
    y_sim[n] = exp(normal_rng(mu, sigma));
  }
}