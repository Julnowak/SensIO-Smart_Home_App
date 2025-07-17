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
  if (s_log_sqm > 0) {
    log_sqm_scaled = (log_sqm - m_log_sqm) / s_log_sqm;
  } else {
    log_sqm_scaled = rep_vector(0, N);
  }

  real m_temp = mean(temp);
  real s_temp = sd(temp);
  if (s_temp > 0) {
    temp_scaled = (temp - m_temp) / s_temp;
  } else {
    temp_scaled = rep_vector(0, N);
  }
  
  vector[N] hour_rad = 2 * pi() * hour / 24;
  vector[N] day_rad = 2 * pi() * day_of_week / 7;
  vector[N] month_rad = 2 * pi() * month / 12;

}

generated quantities {
  vector[N] y_sim;
  
  for (n in 1:N) {
    real beta0 = normal_rng(2.5, 0.1);
    real beta1 = normal_rng(1, 0.1);
    real beta2 = normal_rng(-1.2, 0.5);
    real sigma = lognormal_rng(-3, 0.5);
    
    real amp_hour_sin = normal_rng(0, 0.3);
    real amp_hour_cos = normal_rng(0, 0.3);
    real amp_day_sin = normal_rng(0, 0.3);
    real amp_day_cos = normal_rng(0, 0.3);
    real amp_month_sin = normal_rng(0, 0.3);
    real amp_month_cos = normal_rng(0, 0.3);
    
    // Safe mu calculation (all terms guaranteed finite)
    real mu = beta0 
              + beta1 * tanh(log_sqm_scaled[n]) 
              + beta2 * temp_scaled[n] * exp(-temp_scaled[n]^2)
              + amp_hour_sin * sin(hour_rad[n]) + amp_hour_cos * cos(hour_rad[n])
              + amp_day_sin * sin(day_rad[n]) + amp_day_cos * cos(day_rad[n])
              + amp_month_sin * sin(month_rad[n]) + amp_month_cos * cos(month_rad[n]);

    y_sim[n] = lognormal_rng(mu, sigma);
  }
}