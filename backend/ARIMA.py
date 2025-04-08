import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from statsmodels.tsa.arima.model import ARIMA

# Przykładowe dane – symulowane zużycie energii (np. w kWh) przez 100 dni
np.random.seed(42)
days = pd.date_range(start='2024-01-01', periods=100, freq='D')
energy_usage = 50 + np.sin(np.linspace(0, 10, 100)) * 10 + np.random.normal(0, 2, 100)
data = pd.Series(energy_usage, index=days)

# Tworzenie i trenowanie modelu ARIMA (parametry: AR=2, I=1, MA=2)
model = ARIMA(data, order=(2, 1, 2))
model_fit = model.fit()

# Prognoza na kolejne 10 dni
forecast_steps = 10
forecast = model_fit.forecast(steps=forecast_steps)

# Tworzymy daty dla prognozy
forecast_index = pd.date_range(start=data.index[-1] + pd.Timedelta(days=1), periods=forecast_steps, freq='D')
forecast_series = pd.Series(forecast, index=forecast_index)
from statsmodels.tsa.statespace.sarimax import SARIMAX

# Model SARIMA: ARIMA + sezonowość
model = SARIMAX(data, order=(2, 1, 2), seasonal_order=(1, 0, 1, 20))  # 20 ≈ sezonowość sinusa
model_fit = model.fit(disp=False)

# Prognoza
forecast_steps = 100
forecast = model_fit.forecast(steps=forecast_steps)
forecast_index = pd.date_range(start=data.index[-1] + pd.Timedelta(days=1), periods=forecast_steps)
forecast_series = pd.Series(forecast, index=forecast_index)

# Wykres
plt.figure(figsize=(12, 5))
plt.plot(data, label='Dane historyczne')
plt.plot(forecast_series, label='Prognoza SARIMA', color='red')
plt.title('Prognozowanie zużycia energii – SARIMA')
plt.xlabel('Data')
plt.ylabel('Zużycie energii [kWh]')
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.show()

