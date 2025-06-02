data {
  int<lower=0> N;               // Liczba obserwacji
  vector[N] y;             // Rzeczywiste zużycie energii (zmienna odpowiedzi)
  vector[N] sqm;                // Powierzchnia
  vector[N] temp;               // Temperatura
  vector[N] hour;               // Godzina pomiaru (0-23)
  vector[N] day_of_week;        // Dzień tygodnia (0=poniedziałek, 6=niedziela)
}

transformed data {
  vector[N] log_sqm = log1p(sqm);
  vector[N] log_sqm_scaled = (log_sqm - mean(log_sqm)) / sd(log_sqm);
  vector[N] temp_scaled = (temp - mean(temp)) / sd(temp);
  
  // Skalowanie cykli czasowych do [0, 2π]
  vector[N] hour_rad = 2 * pi() * hour / 24;
  vector[N] day_rad = 2 * pi() * day_of_week / 7;
}

parameters {
  // Podstawowe parametry
  real beta0;                   // Intercept
  real beta1;                   // Efekt powierzchni
  real beta2;                   // Efekt temperatury
  
  // Parametry sezonowości
  real amp_hour_sin;            // Amplituda sinusa godzinowego
  real amp_hour_cos;            // Amplituda cosinusa godzinowego
  real amp_day_sin;             // Amplituda sinusa tygodniowego
  real amp_day_cos;             // Amplituda cosinusa tygodniowego
  
  // Szum
  real<lower=0> sigma;          // Odchylenie standardowe
}

model {
  // Priory (zgodne z wcześniejszym priorem)
  beta0 ~ normal(4.0, 1);
  beta1 ~ normal(0.6, 0.1);
  beta2 ~ normal(-0.4, 0.1);
  sigma ~ lognormal(-1, 1);
  
  amp_hour_sin ~ normal(0, 0.5);
  amp_hour_cos ~ normal(0, 0.5);
  amp_day_sin ~ normal(0, 0.3);
  amp_day_cos ~ normal(0, 0.3);
  
  // Likelihood
  for (n in 1:N) {
    real season_hour = amp_hour_sin * sin(hour_rad[n]) + 
                      amp_hour_cos * cos(hour_rad[n]);
    real season_day = amp_day_sin * sin(day_rad[n]) + 
                     amp_day_cos * cos(day_rad[n]);
    
    real mu = beta0 + 
              beta1 * tanh(log_sqm_scaled[n]) +
              beta2 * temp_scaled[n] * exp(-square(temp_scaled[n])) +
              season_hour + 
              season_day;
    
    y[n] ~ lognormal(mu, sigma);
  }
}

generated quantities {
  vector[N] y_sim;
  vector[N] mu;
  vector[N] log_lik;
  
  for (n in 1:N) {
    real season_hour = amp_hour_sin * sin(hour_rad[n]) + 
                      amp_hour_cos * cos(hour_rad[n]);
    real season_day = amp_day_sin * sin(day_rad[n]) + 
                     amp_day_cos * cos(day_rad[n]);
    
    mu[n] = beta0 + 
              beta1 * tanh(log_sqm_scaled[n]) +
              beta2 * temp_scaled[n] * exp(-square(temp_scaled[n])) +
              season_hour + 
              season_day;
    
    y_sim[n] = fmin(lognormal_rng(mu[n], sigma), 2000);
    log_lik[n] = lognormal_lpdf(y[n] | mu[n], sigma);
  }
}