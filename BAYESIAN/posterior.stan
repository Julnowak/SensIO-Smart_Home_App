data {
  int<lower=0> N;
  vector[N] sqm;
  vector[N] temp;
  vector[N] y; 
}

transformed data {
  vector[N] log_sqm = log1p(sqm);
  vector[N] log_sqm_scaled = (log_sqm - mean(log_sqm)) / sd(log_sqm);
  vector[N] temp_scaled = (temp - mean(temp)) / sd(temp);
  vector[N] log_y = log(y); 
}

parameters {
  real beta0;                
  real beta1;
  real beta2;
  real<lower=0> sigma;        
}

model {

  beta0 ~ normal(6.0, 0.5);    
  beta1 ~ normal(0.8, 0.15);   
  beta2 ~ normal(-0.5, 0.15);   
  sigma ~ lognormal(-0.5, 0.4); 
  
  for (n in 1:N) {
    real mu = beta0 
              + beta1 * tanh(log_sqm_scaled[n]/1.5) 
              + beta2 * temp_scaled[n] * exp(-temp_scaled[n]^2/2);
    log_y[n] ~ normal(mu, sigma);
  }
}

generated quantities {
  vector[N] y_sim;
  vector[N] mu;
  
  for (n in 1:N) {
    mu[n] = beta0 
            + beta1 * tanh(log_sqm_scaled[n]/1.5)
            + beta2 * temp_scaled[n] * exp(-temp_scaled[n]^2/2);
    
    y_sim[n] = exp(normal_rng(mu[n], sigma));
    y_sim[n] = fmin(y_sim[n], 2000); 
  }
}