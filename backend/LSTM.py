import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Bidirectional
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error
import matplotlib.pyplot as plt
import matplotlib.dates as mdates


class EnergyLSTMPredictor:
    def __init__(self, window_size=24, forecast_horizon=1, epochs=100, batch_size=32):
        self.window_size = window_size
        self.forecast_horizon = forecast_horizon
        self.epochs = epochs
        self.batch_size = batch_size
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.time_scalers = {}
        self.model = None

    def _create_time_features(self, df):
        """Tworzy cechy czasowe z daty"""
        df['hour'] = df.index.hour
        df['weekday'] = df.index.weekday
        df['month'] = df.index.month
        df['weekofyear'] = df.index.isocalendar().week

        # Kodowanie cykliczne dla cech czasowych
        df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
        df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
        df['weekday_sin'] = np.sin(2 * np.pi * df['weekday'] / 7)
        df['weekday_cos'] = np.cos(2 * np.pi * df['weekday'] / 7)
        df['month_sin'] = np.sin(2 * np.pi * (df['month'] - 1) / 12)
        df['month_cos'] = np.cos(2 * np.pi * (df['month'] - 1) / 12)

        return df.drop(['hour', 'weekday', 'month'], axis=1)

    def _create_sequences(self, data):
        """Tworzy sekwencje danych wejściowych i wyjściowych"""
        X, y = [], []
        for i in range(len(data) - self.window_size - self.forecast_horizon):
            X.append(data[i:(i + self.window_size)])
            y.append(data[i + self.window_size:i + self.window_size + self.forecast_horizon, 0])
        return np.array(X), np.array(y)

    def preprocess_data(self, data):
        """Przetwarza surowe dane do formatu dla LSTM"""
        # Dodanie cech czasowych
        df = self._create_time_features(data.to_frame())

        # Skalowanie danych
        scaled_data = self.scaler.fit_transform(df.values)

        # Podział na sekwencje
        X, y = self._create_sequences(scaled_data)

        # Podział na zbiór treningowy i testowy
        split = int(0.8 * len(X))
        X_train, X_test = X[:split], X[split:]
        y_train, y_test = y[:split], y[split:]

        return X_train, X_test, y_train, y_test

    def build_model(self, input_shape):
        """Buduje architekturę modelu LSTM"""
        model = Sequential([
            Bidirectional(LSTM(128, return_sequences=True, input_shape=input_shape)),
            Dropout(0.3),
            LSTM(64, return_sequences=False),
            Dropout(0.2),
            Dense(32, activation='relu'),
            Dense(self.forecast_horizon)
        ])

        model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
                      loss='mse',
                      metrics=['mae'])
        return model

    def train(self, X_train, y_train, X_test, y_test):
        """Trenowanie modelu z callbackami"""
        early_stop = EarlyStopping(monitor='val_loss', patience=15)
        checkpoint = ModelCheckpoint('best_model.h5', save_best_only=True)

        self.model = self.build_model((X_train.shape[1], X_train.shape[2]))

        history = self.model.fit(
            X_train, y_train,
            epochs=self.epochs,
            batch_size=self.batch_size,
            validation_data=(X_test, y_test),
            callbacks=[early_stop, checkpoint],
            verbose=1
        )
        return history

    def evaluate(self, X_test, y_test, df):
        """Ewaluacja modelu i wizualizacja wyników"""
        # Predykcja
        predictions = self.model.predict(X_test)

        # Przygotowanie danych do inverse transform
        dummy_array = np.zeros((len(predictions), df.shape[1]))
        dummy_array[:, 0] = predictions.flatten()
        predictions = self.scaler.inverse_transform(dummy_array)[:, 0]

        # Przygotowanie danych rzeczywistych
        dummy_array[:, 0] = y_test.flatten()
        y_true = self.scaler.inverse_transform(dummy_array)[:, 0]

        # Obliczenie metryk
        rmse = np.sqrt(mean_squared_error(y_true, predictions))
        mae = mean_absolute_error(y_true, predictions)
        mape = np.mean(np.abs((y_true - predictions) / y_true)) * 100

        # Pobranie dat dla wykresu
        dates = df.index[self.window_size + len(X_test):][:len(y_true)]

        # Wizualizacja
        plt.figure(figsize=(14, 6))
        plt.plot(dates, y_true, label='Rzeczywiste')
        plt.plot(dates, predictions, alpha=0.7, label='Predykcje')

        # Formatowanie dat
        plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
        plt.gca().xaxis.set_major_locator(mdates.DayLocator(interval=7))
        plt.gcf().autofmt_xdate()

        plt.title(f'Porównanie predykcji z rzeczywistym zużyciem (RMSE: {rmse:.2f} kWh)')
        plt.xlabel('Data')
        plt.ylabel('Zużycie energii (kWh)')
        plt.legend()
        plt.grid(True)
        plt.show()

        return {'RMSE': rmse, 'MAE': mae, 'MAPE': mape}


# Przykład użycia
if __name__ == "__main__":
    # Generowanie syntetycznych danych
    np.random.seed(42)
    dates = pd.date_range(start='2023-01-01', end='2023-12-31', freq='H')
    base = np.sin(np.linspace(0, 2 * np.pi * 365, len(dates))) * 50 + 100
    noise = np.random.normal(0, 15, len(dates))
    energy_data = pd.Series(base + noise, index=dates, name='consumption')

    # Inicjalizacja i przygotowanie danych
    predictor = EnergyLSTMPredictor(window_size=24, forecast_horizon=1, epochs=50)
    X_train, X_test, y_train, y_test = predictor.preprocess_data(energy_data)

    # Trenowanie modelu
    history = predictor.train(X_train, y_train, X_test, y_test)

    # Ewaluacja
    metrics = predictor.evaluate(X_test, y_test, energy_data.to_frame())
    print(f"Metryki efektywności:")
    print(f"RMSE: {metrics['RMSE']:.2f} kWh")
    print(f"MAE: {metrics['MAE']:.2f} kWh")
    print(f"MAPE: {metrics['MAPE']:.2f}%")

    # Wizualizacja historii treningu
    plt.figure(figsize=(12, 5))
    plt.plot(history.history['loss'], label='Strata treningowa')
    plt.plot(history.history['val_loss'], label='Strata walidacyjna')
    plt.title('Historia treningu modelu')
    plt.xlabel('Epoki')
    plt.ylabel('Strata (MSE)')
    plt.legend()
    plt.show()