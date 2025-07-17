data {
  int<lower=0> N;
  vector[N] sqm;
  vector[N] temp;
  vector[N] lat;
  vector[N] lng;
  vector[N] yearbuilt;
  vector[N] numberoffloors;
  vector[N] occupants;
  vector[N] hour;
  vector[N] month;
  vector[N] day_of_week;
  vector[N] log_sqm_scaled;
  vector[N] temp_scaled;
  vector[N] lat_scaled;
  vector[N] lng_scaled;
  vector[N] yearbuilt_scaled;
  vector[N] numberoffloors_scaled;
  vector[N] occupants_scaled;
  vector[N] y;
}

transformed data {
  vector[N] hour_rad = 2 * pi() * hour / 24;
  vector[N] day_rad = 2 * pi() * day_of_week / 7;
}

parameters {
  real beta0;
  real beta1;
  real beta2;
  real beta3;
  real beta_lat;
  real beta_lng;
  real beta_year;
  real beta_floors;
  real beta_occupants;
  real amp_hour_sin; 
  real amp_hour_cos;
  real amp_day_sin;
  real amp_day_cos;
  real amp_month_sin;
  real amp_month_cos;
  real<lower=0> sigma;
}

model {
  // Priors
  beta0 ~ normal(2.5, 0.1);    
  beta1 ~ normal(1, 0.1);   
  beta2 ~ normal(-1.2, 0.5); 
  beta3 ~ normal(0, 0.3);  
  sigma ~ lognormal(-3, 0.5);

  beta_lat ~ normal(0, 0.1);
  beta_lng ~ normal(0, 0.1);
  beta_year ~ normal(0, 0.1);
  beta_floors ~ normal(0, 0.1);
  beta_occupants ~ normal(0, 0.1);
  amp_hour_sin ~ normal(0.1, 0.01);
  amp_hour_cos ~ normal(0.1, 0.01);
  amp_day_sin ~ normal(0, 0.1);
  amp_day_cos ~ normal(0, 0.1); 
  
  // Likelihood
  for (n in 1:N) {
    real mu = beta0 + 
              beta1 * tanh(log_sqm_scaled[n]) +
              beta2 * temp_scaled[n] * exp(-square(temp_scaled[n])) +
              beta_lat * lat_scaled[n] +
              beta_lng * lng_scaled[n] +
              beta_year * yearbuilt_scaled[n] +
              beta_floors * numberoffloors_scaled[n] +
              beta_occupants * occupants_scaled[n] 
              + amp_hour_sin * sin(hour_rad[n]) 
              + amp_hour_cos * cos(hour_rad[n])
              + amp_day_sin * sin(day_rad[n]) 
              + amp_day_cos * cos(day_rad[n])
              + beta3 * sin(month[n]);
    
    y[n] ~ lognormal(mu, sigma);
  }
}

generated quantities {
  vector[N] y_sim;
  vector[N] log_lik;
  
  for (n in 1:N) {
    real mu = beta0 + 
              beta1 * tanh(log_sqm_scaled[n]) +
              beta2 * temp_scaled[n] * exp(-square(temp_scaled[n])) +
              beta_lat * lat_scaled[n] +
              beta_lng * lng_scaled[n] +
              beta_year * yearbuilt_scaled[n] +
              beta_floors * numberoffloors_scaled[n] +
              beta_occupants * occupants_scaled[n]
              + amp_hour_sin * sin(hour_rad[n]) 
              + amp_hour_cos * cos(hour_rad[n])
              + amp_day_sin * sin(day_rad[n]) 
              + amp_day_cos * cos(day_rad[n])
              + beta3 * sin(month[n]);
    
    y_sim[n] = exp(normal_rng(mu, sigma));
    log_lik[n] = normal_lpdf(log(y[n]) | mu, sigma);
  }
}