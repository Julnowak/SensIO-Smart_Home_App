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
  vector[N] y;
}

transformed data {
  vector[N] log_sqm = log1p(sqm);
  vector[N] log_sqm_scaled = (log_sqm - mean(log_sqm)) / (sd(log_sqm) > 0 ? sd(log_sqm) : 1.0);
  vector[N] temp_scaled = (temp - mean(temp)) / (sd(temp) > 0 ? sd(temp) : 1.0);
  vector[N] lat_scaled = (lat - mean(lat)) / (sd(lat) > 0 ? sd(lat) : 1.0);
  vector[N] lng_scaled = (lng - mean(lng)) / (sd(lng) > 0 ? sd(lng) : 1.0);
  vector[N] yearbuilt_scaled = (yearbuilt - mean(yearbuilt)) / (sd(yearbuilt) > 0 ? sd(yearbuilt) : 1.0);
  vector[N] numberoffloors_scaled = (numberoffloors - mean(numberoffloors)) / (sd(numberoffloors) > 0 ? sd(numberoffloors) : 1.0);
  vector[N] occupants_scaled = (occupants - mean(occupants)) / (sd(occupants) > 0 ? sd(occupants) : 1.0);
  vector[N] hour_scaled = (hour - mean(hour)) / (sd(hour) > 0 ? sd(hour) : 1.0);
  vector[N] month_scaled = (month - mean(month)) / (sd(month) > 0 ? sd(month) : 1.0);
  vector[N] day_of_week_scaled = (day_of_week - mean(day_of_week)) / (sd(day_of_week) > 0 ? sd(day_of_week) : 1.0);
}

parameters {
  real beta0;
  real beta1;
  real beta2;
  real beta_lat;
  real beta_lng;
  real beta_year;
  real beta_floors;
  real beta_occupants;
  real beta_hour;
  real beta_month;
  real beta_dow;
  real<lower=0> sigma;
}

model {
  // Priors
  beta0 ~ normal(2, 1);
  beta1 ~ normal(0.6, 0.1);
  beta2 ~ normal(-0.4, 0.1);
  beta_lat ~ normal(0, 0.1);
  beta_lng ~ normal(0, 0.1);
  beta_year ~ normal(0, 0.1);
  beta_floors ~ normal(0, 0.1);
  beta_occupants ~ normal(0, 0.1);
  beta_hour ~ normal(0, 0.1);
  beta_month ~ normal(0, 0.1);
  beta_dow ~ normal(0, 0.1);
  sigma ~ lognormal(-1, 1);
  
  // Likelihood
  for (n in 1:N) {
    real mu = beta0 + 
              beta1 * tanh(log_sqm_scaled[n]) +
              beta2 * temp_scaled[n] * exp(-square(temp_scaled[n])) +
              beta_lat * lat_scaled[n] +
              beta_lng * lng_scaled[n] +
              beta_year * yearbuilt_scaled[n] +
              beta_floors * numberoffloors_scaled[n] +
              beta_occupants * occupants_scaled[n] +
              beta_hour * hour_scaled[n] +
              beta_month * month_scaled[n] +
              beta_dow * day_of_week_scaled[n];
    
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
              beta_occupants * occupants_scaled[n] +
              beta_hour * hour_scaled[n] +
              beta_month * month_scaled[n] +
              beta_dow * day_of_week_scaled[n];
    
    y_sim[n] = fmin(exp(normal_rng(mu, sigma)), 2000);
    log_lik[n] = lognormal_lpdf(y[n] | mu, sigma);
  }
}