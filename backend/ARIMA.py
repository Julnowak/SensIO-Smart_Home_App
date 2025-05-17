import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.stattools import adfuller
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf
from sklearn.metrics import mean_squared_error, mean_absolute_error
from math import sqrt

# Generowanie przykładowych danych zużycia energetycznego (jeśli nie mamy własnych)
np.random.seed(42)
date_range = pd.date_range(start='2010-01-01', end='2023-12-31', freq='M')
energy_consumption = 100 + 2 * np.arange(len(date_range)) + 10 * np.sin(
    np.arange(len(date_range)) * 0.5) + np.random.normal(0, 5, len(date_range))
data = pd.DataFrame({'Date': date_range, 'Energy_Consumption': energy_consumption})
data.set_index('Date', inplace=True)

# Podział na zbiór treningowy i testowy
train = data.iloc[:-24]  # pierwsze N-24 miesiące jako treningowe
test = data.iloc[-24:]  # ostatnie 24 miesiące jako testowe

# Wizualizacja danych
plt.figure(figsize=(12, 6))
plt.plot(train.index, train['Energy_Consumption'], label='Trening')
plt.plot(test.index, test['Energy_Consumption'], label='Test')
plt.title('Zużycie energetyczne w czasie')
plt.xlabel('Data')
plt.ylabel('Zużycie')
plt.legend()
plt.grid()
plt.show()


# Test stacjonarności
def test_stationarity(timeseries):
    result = adfuller(timeseries)
    print('Test ADF:')
    print(f'Statystyka ADF: {result[0]}')
    print(f'p-value: {result[1]}')
    print('Wartości krytyczne:')
    for key, value in result[4].items():
        print(f'   {key}: {value}')
    return result[1] > 0.05  # zwraca True jeśli szereg jest niestacjonarny


print("\nTest stacjonarności dla danych treningowych:")
non_stationary = test_stationarity(train['Energy_Consumption'])

if non_stationary:
    print("\nSzereg jest niestacjonarny - różnicowanie może być potrzebne.")
    # Różnicowanie
    train['Energy_diff'] = train['Energy_Consumption'].diff()
    train = train.dropna(subset=['Energy_diff'])  # usuwa tylko wiersze, gdzie 'Energy_diff' to NaN

    print("\nTest stacjonarności po różnicowaniu:")
    if test_stationarity(train['Energy_diff']):
        print("Szereg nadal niestacjonarny - potrzebne kolejne różnicowanie")
    else:
        print("Szereg jest teraz stacjonarny")
else:
    print("\nSzereg jest stacjonarny - można przejść do modelowania")

# Wykresy ACF i PACF do identyfikacji parametrów
plt.figure(figsize=(12, 8))
plt.subplot(211)
plot_acf(train['Energy_Consumption'].dropna(), ax=plt.gca(), lags=24)
plt.subplot(212)
plot_pacf(train['Energy_Consumption'].dropna(), ax=plt.gca(), lags=24)
plt.tight_layout()
plt.show()


# Funkcja do ewaluacji modelu
def evaluate_model(model, train_data, test_data, order, seasonal_order=None):
    history = train_data.copy()
    predictions = []

    if seasonal_order:  # Dla SARIMA
        fitted_model = model(history['Energy_Consumption'],
                             order=order,
                             seasonal_order=seasonal_order,
                             enforce_stationarity=False,
                             enforce_invertibility=False).fit()
    else:  # Dla pozostałych modeli
        fitted_model = model(history['Energy_Consumption'],
                             order=order).fit()

    # Prognoza
    forecast = fitted_model.get_forecast(steps=len(test_data))
    predictions = forecast.predicted_mean
    conf_int = forecast.conf_int()

    # Obliczenie błędów
    mse = mean_squared_error(test_data['Energy_Consumption'], predictions)
    rmse = sqrt(mse)
    mae = mean_absolute_error(test_data['Energy_Consumption'], predictions)

    # Wizualizacja
    plt.figure(figsize=(12, 6))
    plt.plot(train_data.index, train_data['Energy_Consumption'], label='Trening')
    plt.plot(test_data.index, test_data['Energy_Consumption'], label='Test')
    plt.plot(test_data.index, predictions, label='Prognoza')
    plt.fill_between(test_data.index,
                     conf_int.iloc[:, 0],
                     conf_int.iloc[:, 1],
                     color='k', alpha=0.1)
    plt.title(f'Prognoza vs Rzeczywiste wartości (RMSE={rmse:.2f}, MAE={mae:.2f})')
    plt.legend()
    plt.grid()
    plt.show()

    print(f"\nRMSE: {rmse:.2f}")
    print(f"MAE: {mae:.2f}")

    return fitted_model, predictions, rmse, mae


# 1. Model AR (Autoregresyjny)
print("\n=== Model AR ===")
ar_order = (2, 0, 0)  # (p, d, q)
ar_model, ar_pred, ar_rmse, ar_mae = evaluate_model(ARIMA, train, test, ar_order)

# 2. Model MA (Średniej ruchomej)
print("\n=== Model MA ===")
ma_order = (0, 0, 2)  # (p, d, q)
ma_model, ma_pred, ma_rmse, ma_mae = evaluate_model(ARIMA, train, test, ma_order)

# 3. Model ARMA (Autoregresyjna średnia ruchoma)
print("\n=== Model ARMA ===")
arma_order = (2, 0, 2)  # (p, d, q)
arma_model, arma_pred, arma_rmse, arma_mae = evaluate_model(ARIMA, train, test, arma_order)

# 4. Model ARIMA (Autoregresyjne zintegrowana średnia ruchoma)
print("\n=== Model ARIMA ===")
arima_order = (2, 1, 2)  # (p, d, q)
arima_model, arima_pred, arima_rmse, arima_mae = evaluate_model(ARIMA, train, test, arima_order)

# 5. Model SARIMA (Sezonowa ARIMA)
print("\n=== Model SARIMA ===")
sarima_order = (1, 1, 1)  # (p, d, q)
sarima_seasonal_order = (1, 1, 1, 12)  # (P, D, Q, s) gdzie s=12 dla danych miesięcznych
sarima_model, sarima_pred, sarima_rmse, sarima_mae = evaluate_model(
    SARIMAX, train, test, sarima_order, sarima_seasonal_order)

# Porównanie modeli
results = pd.DataFrame({
    'Model': ['AR', 'MA', 'ARMA', 'ARIMA', 'SARIMA'],
    'RMSE': [ar_rmse, ma_rmse, arma_rmse, arima_rmse, sarima_rmse],
    'MAE': [ar_mae, ma_mae, arma_mae, arima_mae, sarima_mae]
})

print("\nPorównanie wyników wszystkich modeli:")
print(results.sort_values(by='RMSE'))

# Wybór najlepszego modelu
best_model = results.loc[results['RMSE'].idxmin(), 'Model']
print(f"\nNajlepszy model: {best_model}")

# Prognoza na przyszłość używając najlepszego modelu
if best_model == 'SARIMA':
    final_model = SARIMAX(data['Energy_Consumption'],
                          order=sarima_order,
                          seasonal_order=sarima_seasonal_order).fit()
else:
    final_model = ARIMA(data['Energy_Consumption'],
                        order=eval(f"{best_model.lower()}_order")).fit()

# Prognoza na kolejne 12 okresów
forecast = final_model.get_forecast(steps=12)
forecast_mean = forecast.predicted_mean
forecast_conf_int = forecast.conf_int()

# Wizualizacja prognozy
plt.figure(figsize=(12, 6))
plt.plot(data.index, data['Energy_Consumption'], label='Dane historyczne')
plt.plot(forecast_mean.index, forecast_mean, label='Prognoza')
plt.fill_between(forecast_conf_int.index,
                 forecast_conf_int.iloc[:, 0],
                 forecast_conf_int.iloc[:, 1],
                 color='k', alpha=0.1)
plt.title(f'Prognoza zużycia energetycznego na kolejne 12 okresów ({best_model} model)')
plt.xlabel('Data')
plt.ylabel('Zużycie energetyczne')
plt.legend()
plt.grid()
plt.show()