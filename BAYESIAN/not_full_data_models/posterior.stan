data {
  int<lower=0> N;
  vector[N] sqm;
  vector[N] temp;
  vector[N] y; 
}

transformed data {
  vector[N] log_sqm = log1p(sqm);
  vector[N] log_sqm_scaled;
  vector[N] temp_scaled;
  
  // Safe scaling (prevent NaN from constant variables)
  real m_log_sqm = mean(log_sqm);
  real s_log_sqm = sd(log_sqm);
  log_sqm_scaled = s_log_sqm > 0 ? (log_sqm - m_log_sqm) / s_log_sqm : rep_vector(0, N);
  
  real m_temp = mean(temp);
  real s_temp = sd(temp);
  temp_scaled = s_temp > 0 ? (temp - m_temp) / s_temp : rep_vector(0, N);
}

parameters {
  real beta0;                
  real beta1;
  real beta2;
  real<lower=0> sigma;        
}

model {

  beta0 ~ normal(4.78, 0.1);    
  beta1 ~ normal(0.4, 0.1);   
  beta2 ~ normal(-0.1, 0.1);   
  sigma ~ lognormal(-5, 0.5);
  
  for (n in 1:N) {
    real mu = beta0 
              + beta1 * tanh(log_sqm_scaled[n]) 
              + beta2 * temp_scaled[n] * exp(-temp_scaled[n]^2);
    y[n] ~ lognormal(mu, sigma);
  }
}

generated quantities {
  vector[N] y_sim;
  vector[N] mu;
  vector[N] log_lik;
  
  for (n in 1:N) {
    mu[n] = beta0 
            + beta1 * tanh(log_sqm_scaled[n])
            + beta2 * temp_scaled[n] * exp(-temp_scaled[n]^2);
    
    y_sim[n] = lognormal_rng(mu[n], sigma);
    log_lik[n] = normal_lpdf(log(y[n]) | mu[n], sigma);
  }
}
