import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from statsmodels.tsa.arima.model import ARIMA

# === 1. Load and Prepare Data ===
df = pd.read_csv("one_building_data.csv")
df['timestamp'] = pd.to_datetime(df['timestamp'])
df.sort_values('timestamp', inplace=True)
df.set_index('timestamp', inplace=True)

data = df[['energy_consumption', 'airTemperature']].dropna()
scaler = MinMaxScaler()
scaled_data = scaler.fit_transform(data)

# === 2. Create Sequences ===
sequence_length = 24
forecast_horizon = 24

X, y = [], []
for i in range(len(scaled_data) - sequence_length - forecast_horizon):
    X.append(scaled_data[i:i+sequence_length])
    y.append(scaled_data[i+sequence_length:i+sequence_length+forecast_horizon, 0])  # only energy_consumption

X, y = np.array(X), np.array(y)

# === 3. Train/Test Split ===
split_index = int(0.8 * len(X))
X_train, X_test = X[:split_index], X[split_index:]
y_train, y_test = y[:split_index], y[split_index:]

# === 4. Define and Train LSTM ===
model = Sequential([
    LSTM(64, activation='relu', input_shape=(sequence_length, 2)),
    Dense(forecast_horizon)
])
model.compile(optimizer='adam', loss='mse')
model.fit(X_train, y_train, epochs=10, validation_data=(X_test, y_test), verbose=1)

# === 5. LSTM Prediction ===
predictions = model.predict(X_test)

# === 6. Inverse Transform ===
def inverse_energy_only(arr):
    temp = np.zeros((arr.shape[0], 2))
    temp[:, 0] = arr
    return scaler.inverse_transform(temp)[:, 0]

inv_pred = np.array([inverse_energy_only(p) for p in predictions])
inv_actual = np.array([inverse_energy_only(a) for a in y_test])

# === 7. ARIMA Baseline ===
series = df['energy_consumption'].dropna()
train_arima, test_arima = series[:-forecast_horizon], series[-forecast_horizon:]

model_arima = ARIMA(train_arima, order=(5, 1, 0))
model_arima_fit = model_arima.fit()
forecast_arima = model_arima_fit.forecast(steps=forecast_horizon)

# === 8. Plot and Compare ===
plt.figure(figsize=(15, 5))
plt.plot(inv_actual[-1], label='Actual (LSTM)')
plt.plot(inv_pred[-1], label='LSTM Forecast')
plt.plot(range(24), forecast_arima.values, label='ARIMA Forecast', linestyle='--')
plt.title("Energy Consumption Forecast (Next 24h)")
plt.xlabel("Hour")
plt.ylabel("Energy Consumption")
plt.legend()
plt.grid(True)
plt.show()

# === 9. MSE Comparison ===
lstm_mse = mean_squared_error(inv_actual[-1], inv_pred[-1])
arima_mse = mean_squared_error(inv_actual[-1], forecast_arima)

print(f"LSTM MSE: {lstm_mse:.2f}")
print(f"ARIMA MSE: {arima_mse:.2f}")
