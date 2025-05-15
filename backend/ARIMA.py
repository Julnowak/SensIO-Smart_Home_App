import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.metrics import mean_squared_error
import warnings

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

# 1. Generate better synthetic energy production data with clear seasonality
np.random.seed(42)
days = pd.date_range(start='2024-01-01', periods=200, freq='D')

# Strong weekly seasonality (7 days) + yearly pattern (365 days)
base = 100
weekly_seasonality = 15 * np.sin(2 * np.pi * np.arange(len(days)) / 7)
yearly_seasonality = 20 * np.sin(2 * np.pi * np.arange(len(days)) / 365)
noise = np.random.normal(0, 5, len(days))

energy_production = base + weekly_seasonality + yearly_seasonality + noise
data = pd.Series(energy_production, index=days)

# 2. Plot the original data
plt.figure(figsize=(14, 6))
plt.plot(data)
plt.title('Daily Energy Production with Seasonality')
plt.xlabel('Date')
plt.ylabel('Energy Production (kWh)')
plt.grid(True)
plt.show()

# 3. Split into train and test sets
train_size = int(len(data) * 0.8)
train, test = data[:train_size], data[train_size:]

# 4. Fit SARIMA model with proper seasonal components
# Weekly seasonality (7 days)
order = (1, 1, 1)  # Non-seasonal (p,d,q)
seasonal_order = (1, 1, 1, 7)  # Seasonal (P,D,Q,s)

model = SARIMAX(train,
                order=order,
                seasonal_order=seasonal_order,
                trend='c',
                enforce_stationarity=False,
                enforce_invertibility=False)

results = model.fit(disp=False)
print(results.summary())

# 5. Make predictions
forecast_steps = len(test)
forecast = results.get_forecast(steps=forecast_steps)
forecast_mean = forecast.predicted_mean
conf_int = forecast.conf_int()

# 6. Evaluate model
mse = mean_squared_error(test, forecast_mean)
print(f'\nModel MSE: {mse:.2f}')

# 7. Plot results
plt.figure(figsize=(14, 7))
plt.plot(train, label='Training Data')
plt.plot(test, label='Actual Production', color='blue')
plt.plot(forecast_mean.index, forecast_mean, label='SARIMA Forecast', color='red')
plt.fill_between(conf_int.index,
                conf_int.iloc[:, 0],
                conf_int.iloc[:, 1], color='pink', alpha=0.3)
plt.title('Energy Production Forecast with SARIMA')
plt.xlabel('Date')
plt.ylabel('Energy Production (kWh)')
plt.legend()
plt.grid(True)
plt.show()

# 8. Future forecasting (next 60 days)
final_model = SARIMAX(data,
                     order=order,
                     seasonal_order=seasonal_order,
                     trend='c',
                     enforce_stationarity=False,
                     enforce_invertibility=False)

final_results = final_model.fit(disp=False)

future_steps = 60
future_forecast = final_results.get_forecast(steps=future_steps)
future_mean = future_forecast.predicted_mean
future_conf_int = future_forecast.conf_int()
future_dates = pd.date_range(start=data.index[-1] + pd.Timedelta(days=1), periods=future_steps, freq='D')

# 9. Plot final forecast
plt.figure(figsize=(14, 7))
plt.plot(data, label='Historical Data')
plt.plot(future_dates, future_mean, label='60-Day Forecast', color='red')
plt.fill_between(future_dates,
                future_conf_int.iloc[:, 0],
                future_conf_int.iloc[:, 1], color='pink', alpha=0.3)
plt.title('Future Energy Production Forecast with Confidence Intervals')
plt.xlabel('Date')
plt.ylabel('Energy Production (kWh)')
plt.legend()
plt.grid(True)
plt.show()