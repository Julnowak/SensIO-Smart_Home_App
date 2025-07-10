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
}

transformed data {
  vector[N] log_sqm = log1p(sqm);
  vector[N] log_sqm_scaled;
  vector[N] temp_scaled;
  vector[N] lat_scaled = (lat - mean(lat)) / (sd(lat) > 0 ? sd(lat) : 1.0);
  vector[N] lng_scaled = (lng - mean(lng)) / (sd(lng) > 0 ? sd(lng) : 1.0);
  vector[N] yearbuilt_scaled = (yearbuilt - mean(yearbuilt)) / (sd(yearbuilt) > 0 ? sd(yearbuilt) : 1.0);
  vector[N] numberoffloors_scaled = (numberoffloors - mean(numberoffloors)) / (sd(numberoffloors) > 0 ? sd(numberoffloors) : 1.0);
  vector[N] occupants_scaled = (occupants - mean(occupants)) / (sd(occupants) > 0 ? sd(occupants) : 1.0);
  
  real m_log_sqm = mean(log_sqm);
  real s_log_sqm = sd(log_sqm);
  log_sqm_scaled = s_log_sqm > 0 ? (log_sqm - m_log_sqm) / s_log_sqm : rep_vector(0, N);
  
  real m_temp = mean(temp);
  real s_temp = sd(temp);
  temp_scaled = s_temp > 0 ? (temp - m_temp) / s_temp : rep_vector(0, N);
  
  vector[N] hour_rad = 2 * pi() * hour / 24;
  vector[N] day_rad = 2 * pi() * day_of_week / 7;  
}

generated quantities {
  vector[N] y_sim;
  
  for (n in 1:N) {
    real beta0 = normal_rng(2.5, 0.1);    
    real beta1 = normal_rng(1, 0.1);   
    real beta2 = normal_rng(-1.2, 0.5); 
    real beta3 = normal_rng(0, 0.3);  
    real sigma = lognormal_rng(-3, 0.5);
    
    real beta_lat = normal_rng(0, 0.1);
    real beta_lng = normal_rng(0, 0.1);
    real beta_year = normal_rng(0, 0.1);
    real beta_floors = normal_rng(0, 0.1);
    real beta_occupants = normal_rng(0, 0.1);

    real amp_hour_sin = normal_rng(0.1, 0.01);
    real amp_hour_cos = normal_rng(0.1, 0.01);
    real amp_day_sin = normal_rng(0, 0.1);
    real amp_day_cos = normal_rng(0, 0.1);

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
  }
}