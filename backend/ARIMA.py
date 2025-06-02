import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.stattools import adfuller
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf
from sklearn.metrics import mean_squared_error, mean_absolute_error
from math import sqrt

data = pd.DataFrame(pd.read_csv("one_building_data.csv"))
# data = pd.DataFrame(pd.read_csv("second_building_data.csv"))
# data = pd.DataFrame(pd.read_csv("third_building_data.csv"))
print(data.describe())

# Podział na zbiór treningowy i testowy
train = data.iloc[:-24]  # pierwsze N-24 miesiące jako treningowe
test = data.iloc[-24:]  # ostatnie 24 miesiące jako testowe

# Wizualizacja danych
plt.figure(figsize=(12, 6))
plt.plot(train.index, train['energy_consumption'], label='Trening')
plt.plot(test.index, test['energy_consumption'], label='Test')
plt.title('Zużycie energetyczne w czasie')
plt.xlabel('Data')
plt.ylabel('Zużycie')
plt.legend()
plt.grid()
plt.show()


# More thorough stationarity analysis
def test_stationarity(timeseries, max_diff=2):
    diff_count = 0
    current_series = timeseries.copy()

    while diff_count <= max_diff:
        result = adfuller(current_series.dropna())
        p_value = result[1]

        print(f'\nTest ADF (d={diff_count}):')
        print(f'ADF Statistic: {result[0]:.4f}')
        print(f'p-value: {p_value:.4f}')
        print('Critical Values:')
        for key, value in result[4].items():
            print(f'   {key}: {value:.4f}')

        if p_value <= 0.05:
            print(f'Series is stationary at d={diff_count}')
            return diff_count
        else:
            print('Series is non-stationary - differencing needed')
            current_series = current_series.diff().dropna()
            diff_count += 1

    print(f'Could not achieve stationarity after {max_diff} differences')
    return max_diff


print("\nComprehensive stationarity testing:")
d = test_stationarity(train['energy_consumption'])

# More detailed ACF/PACF plots with confidence intervals
plt.figure(figsize=(14, 10))

# Original series
plt.subplot(321)
plot_acf(train['energy_consumption'].dropna(), ax=plt.gca(), lags=48, alpha=0.05, title='ACF - Original Series')
plt.grid(True)

plt.subplot(322)
plot_pacf(train['energy_consumption'].dropna(), ax=plt.gca(), lags=48, alpha=0.05, title='PACF - Original Series')
plt.grid(True)

# First difference
plt.subplot(323)
plot_acf(train['energy_consumption'].diff().dropna(), ax=plt.gca(), lags=48, alpha=0.05, title='ACF - First Difference')
plt.grid(True)

plt.subplot(324)
plot_pacf(train['energy_consumption'].diff().dropna(), ax=plt.gca(), lags=48, alpha=0.05,
          title='PACF - First Difference')
plt.grid(True)

# Second difference (if needed)
if d > 1:
    plt.subplot(325)
    plot_acf(train['energy_consumption'].diff().diff().dropna(), ax=plt.gca(), lags=48, alpha=0.05,
             title='ACF - Second Difference')
    plt.grid(True)

    plt.subplot(326)
    plot_pacf(train['energy_consumption'].diff().diff().dropna(), ax=plt.gca(), lags=48, alpha=0.05,
              title='PACF - Second Difference')
    plt.grid(True)

plt.tight_layout()
plt.show()


# Funkcja do ewaluacji modelu
def evaluate_model(model, train_data, test_data, order, name, seasonal_order=None):
    history = train_data.copy()
    predictions = []

    if seasonal_order:  # Dla SARIMA
        fitted_model = model(history['energy_consumption'],
                             order=order,
                             seasonal_order=seasonal_order,
                             enforce_stationarity=False,
                             enforce_invertibility=False).fit()
    else:  # Dla pozostałych modeli
        fitted_model = model(history['energy_consumption'],
                             order=order).fit()

    # Prognoza
    forecast = fitted_model.get_forecast(steps=len(test_data))
    predictions = forecast.predicted_mean
    conf_int = forecast.conf_int()

    # Obliczenie błędów
    mse = mean_squared_error(test_data['energy_consumption'], predictions)
    rmse = sqrt(mse)
    mae = mean_absolute_error(test_data['energy_consumption'], predictions)

    # Wizualizacja
    plt.figure(figsize=(12, 6))
    plt.plot(train_data.index, train_data['energy_consumption'], label='Trening')
    plt.plot(test_data.index, test_data['energy_consumption'], label='Test')
    plt.plot(test_data.index, predictions, label='Prognoza')
    plt.fill_between(test_data.index,
                     conf_int.iloc[:, 0],
                     conf_int.iloc[:, 1],
                     color='k', alpha=0.1)
    plt.title(f'{name} (RMSE={rmse:.2f}, MAE={mae:.2f})')
    plt.legend()
    plt.grid()
    plt.show()

    print(f"\nRMSE: {rmse:.2f}")
    print(f"MAE: {mae:.2f}")

    return fitted_model, predictions, rmse, mae


# 1. Model AR (Autoregressive)
print("\n=== Optimized AR Model ===")
ar_order = (24, 0, 0)  # Higher order to capture daily patterns
ar_model, ar_pred, ar_rmse, ar_mae = evaluate_model(ARIMA, train, test, ar_order, "AR model")

# 2. Model MA (Moving Average)
print("\n=== Optimized MA Model ===")
ma_order = (0, 0, 24)  # Higher order to capture daily patterns
ma_model, ma_pred, ma_rmse, ma_mae = evaluate_model(ARIMA, train, test, ma_order, "MA model")

# 3. Model ARMA (Autoregressive Moving Average)
print("\n=== Optimized ARMA Model ===")
arma_order = (24, 0, 24)  # Higher order to capture daily patterns
arma_model, arma_pred, arma_rmse, arma_mae = evaluate_model(ARIMA, train, test, arma_order, "ARMA model")

# 4. Model ARIMA (Autoregressive Integrated Moving Average)
print("\n=== Optimized ARIMA Model ===")
arima_order = (24, 1, 24)  # Higher order with differencing
arima_model, arima_pred, arima_rmse, arima_mae = evaluate_model(ARIMA, train, test, arima_order, "ARIMA model")

# 5. Model SARIMA (Seasonal ARIMA)
print("\n=== Optimized SARIMA Model ===")
sarima_order = (1, 1, 1)  # Non-seasonal part
sarima_seasonal_order = (1, 1, 1, 24)  # 24-hour seasonality for hourly data
sarima_model, sarima_pred, sarima_rmse, sarima_mae = evaluate_model(
    SARIMAX, train, test, sarima_order,"SARIMA model", sarima_seasonal_order)

# # 6. Additional SARIMA with different parameters
# print("\n=== Alternative SARIMA Model ===")
# sarima_order_alt = (2, 1, 2)  # Non-seasonal part
# sarima_seasonal_order_alt = (1, 1, 1, 24)  # 24-hour seasonality
# sarima_model_alt, sarima_pred_alt, sarima_rmse_alt, sarima_mae_alt = evaluate_model(
#     SARIMAX, train, test, sarima_order_alt, sarima_seasonal_order_alt)

# from itertools import product
#
# # Define parameter ranges to test
# p = d = q = range(0, 3)  # Try values 0, 1, 2
# P = D = Q = range(0, 2)  # Try values 0, 1
# s = 24  # Fixed seasonality for hourly data
#
# # Generate all different combinations of p, d, q triplets
# pdq = list(product(p, d, q))
#
# # Generate all different combinations of seasonal p, d, q triplets
# seasonal_pdq = [(x[0], x[1], x[2], s) for x in list(product(P, D, Q))]
#
# best_score = float('inf')
# best_order = None
# best_seasonal_order = None
#
# # Grid search
# print("\nPerforming grid search for optimal SARIMA parameters...")
# for param in pdq:
#     for param_seasonal in seasonal_pdq:
#         try:
#             mod = SARIMAX(train['energy_consumption'],
#                           order=param,
#                           seasonal_order=param_seasonal,
#                           enforce_stationarity=False,
#                           enforce_invertibility=False)
#
#             results = mod.fit(disp=False)
#
#             # Get AIC score
#             aic = results.aic
#             if aic < best_score:
#                 best_score = aic
#                 best_order = param
#                 best_seasonal_order = param_seasonal
#
#             print(f'SARIMA{param}x{param_seasonal} - AIC:{aic:.2f}')
#         except:
#             continue
#
# print(f"\nBest SARIMA model: {best_order}x{best_seasonal_order} with AIC: {best_score:.2f}")
#
# # Evaluate the best found model
# print("\n=== Best SARIMA Model from Grid Search ===")
# best_sarima_model, best_sarima_pred, best_sarima_rmse, best_sarima_mae = evaluate_model(
#     SARIMAX, train, test, best_order, best_seasonal_order)
#
#
# # Porównanie modeli
# results = pd.DataFrame({
#     'Model': ['AR', 'MA', 'ARMA', 'ARIMA', 'SARIMA'],
#     'RMSE': [ar_rmse, ma_rmse, arma_rmse, arima_rmse, sarima_rmse],
#     'MAE': [ar_mae, ma_mae, arma_mae, arima_mae, sarima_mae]
# })
#
# # Extended results comparison
# results = pd.DataFrame({
#     'Model': ['AR(24)', 'MA(24)', 'ARMA(24,24)', 'ARIMA(24,1,24)',
#               'SARIMA(1,1,1)x(1,1,1,24)', 'SARIMA(2,1,2)x(1,1,1,24)',
#               f'SARIMA{best_order}x{best_seasonal_order} (Grid Search)'],
#     'RMSE': [ar_rmse, ma_rmse, arma_rmse, arima_rmse,
#              sarima_rmse, sarima_rmse_alt, best_sarima_rmse],
#     'MAE': [ar_mae, ma_mae, arma_mae, arima_mae,
#             sarima_mae, sarima_mae_alt, best_sarima_mae],
#     'Parameters': [str(ar_order), str(ma_order), str(arma_order), str(arima_order),
#                    str(sarima_order)+'x'+str(sarima_seasonal_order),
#                    str(sarima_order_alt)+'x'+str(sarima_seasonal_order_alt),
#                    str(best_order)+'x'+str(best_seasonal_order)]
# })
#
# print("\nComparison of all models:")
# print(results.sort_values(by='RMSE'))