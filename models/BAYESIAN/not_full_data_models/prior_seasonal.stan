data {
  int<lower=0> N;               
  vector<lower=0>[N] sqm;
  vector[N] temp;               
  vector<lower=0, upper=24>[N] hour;
  vector<lower=0, upper=7>[N] day_of_week;
  vector<lower=0, upper=12>[N] month;
}

transformed data {
  vector[N] log_sqm = log1p(sqm);
  vector[N] log_sqm_scaled;
  vector[N] temp_scaled;
  
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
    real beta0 = normal_rng(4.78, 0.1);
    real beta1 = normal_rng(0.4, 0.1);
    real beta2 = normal_rng(-0.1, 0.1);
    real beta3 = normal_rng(0, 0.3);
    real sigma = lognormal_rng(-5, 0.5);

    real amp_hour_sin = normal_rng(0.1, 0.01);
    real amp_hour_cos = normal_rng(0.1, 0.01);
    real amp_day_sin = normal_rng(0, 0.1);
    real amp_day_cos = normal_rng(0, 0.1);

    
    real mu = beta0 
              + beta1 * tanh(log_sqm_scaled[n]) 
              + beta2 * temp_scaled[n] * exp(-temp_scaled[n]^2)
              + amp_hour_sin * sin(hour_rad[n]) + amp_hour_cos * cos(hour_rad[n])
              + amp_day_sin * sin(day_rad[n]) + amp_day_cos * cos(day_rad[n])
              + beta3 * sin(month[n]);

    y_sim[n] = lognormal_rng(mu, sigma);
  }
}