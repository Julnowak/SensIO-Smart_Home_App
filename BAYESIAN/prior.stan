data {
  int<lower=0> N;               // Liczba obserwacji
  vector[N] sqm;                // Powierzchnia
  vector[N] temp;               // Temperatura
}

transformed data {
  vector[N] log_sqm = log1p(sqm);
  vector[N] log_sqm_scaled = (log_sqm - mean(log_sqm)) / sd(log_sqm);
  vector[N] temp_scaled = (temp - mean(temp)) / sd(temp);
}

generated quantities {
  vector[N] y_sim;
  
  for (n in 1:N) {
    real beta0 = normal_rng(4.0, 1);
    real beta1 = normal_rng(0.6, 0.1);
    real beta2 = normal_rng(-0.4, 0.1);
    real sigma = lognormal_rng(-1, 1);

    real mu = beta0 + beta1 * tanh(log_sqm_scaled[n]) +
                          beta2 * temp_scaled[n] * exp(-square(temp_scaled[n]));
    y_sim[n] = fmin(exp(normal_rng(mu, sigma)), 2000);

  }
}
