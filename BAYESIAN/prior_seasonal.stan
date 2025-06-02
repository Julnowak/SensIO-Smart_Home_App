data {
  int<lower=0> N;               // Liczba obserwacji
  vector[N] sqm;                // Powierzchnia
  vector[N] temp;               // Temperatura
  vector[N] hour;              // Godzina pomiaru (0-23)
  vector[N] day_of_week;       // Dzień tygodnia (0=poniedziałek, 6=niedziela)
}

transformed data {
  vector[N] log_sqm = log1p(sqm);
  vector[N] log_sqm_scaled = (log_sqm - mean(log_sqm)) / sd(log_sqm);
  vector[N] temp_scaled = (temp - mean(temp)) / sd(temp);
  
  // Skalowanie cykli czasowych do [0, 2π]
  vector[N] hour_rad = 2 * pi() * hour / 24;
  vector[N] day_rad = 2 * pi() * day_of_week / 7;
}

generated quantities {
  vector[N] y_sim;
  
  for (n in 1:N) {
    // Podstawowe parametry
    real beta0 = normal_rng(4.0, 1);
    real beta1 = normal_rng(0.6, 0.1);
    real beta2 = normal_rng(-0.4, 0.1);
    real sigma = lognormal_rng(-1, 1);
    
    // Parametry sezonowości
    real amp_hour_sin = normal_rng(0, 0.5);
    real amp_hour_cos = normal_rng(0, 0.5);
    real amp_day_sin = normal_rng(0, 0.3);
    real amp_day_cos = normal_rng(0, 0.3);

    // Składnik sezonowości
    real season_hour = amp_hour_sin * sin(hour_rad[n]) + 
                      amp_hour_cos * cos(hour_rad[n]);
    real season_day = amp_day_sin * sin(day_rad[n]) + 
                      amp_day_cos * cos(day_rad[n]);
    
    real mu = beta0 + 
              beta1 * tanh(log_sqm_scaled[n]) +
              beta2 * temp_scaled[n] * exp(-square(temp_scaled[n])) +
              season_hour + 
              season_day;
    
    y_sim[n] = fmin(exp(normal_rng(mu, sigma)), 2000);
    
  }
}