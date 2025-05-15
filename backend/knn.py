import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error
from scipy.spatial.distance import euclidean
from collections import defaultdict
from heapq import nsmallest
from datetime import datetime
import matplotlib.pyplot as plt

class EnergyKNN:
    def __init__(self, k=5, metric='euclidean', window_size=24, use_time_features=True):
        self.k = k
        self.metric = metric
        self.window_size = window_size
        self.use_time_features = use_time_features
        self.scaler = StandardScaler()
        self.X_train = None
        self.y_train = None
        self.feature_names = None

    def _create_features(self, data, index):
        """Tworzy cechy dla danego indeksu czasowego"""
        features = []

        # Cechy historyczne
        for i in range(1, self.window_size + 1):
            features.append(data.iloc[index - i])

        # Cechy czasowe
        if self.use_time_features:
            dt = data.index[index]
            features.extend([
                dt.hour,
                dt.weekday(),
                dt.month,
                dt.isocalendar().week
            ])

        return np.array(features)

    def _preprocess_data(self, data):
        """Przygotowuje dane i tworzy cechy"""
        X, y = [], []

        for i in range(self.window_size, len(data)):
            X.append(self._create_features(data, i))
            y.append(data.iloc[i])

        return np.array(X), np.array(y)

    def fit(self, data):
        """Trenowanie modelu"""
        # Przygotowanie danych
        self.feature_names = []
        self.feature_names.extend([f'lag_{i}' for i in range(1, self.window_size + 1)])

        if self.use_time_features:
            self.feature_names.extend(['hour', 'weekday', 'month', 'week'])

        X, y = self._preprocess_data(data)

        # Skalowanie cech
        self.scaler.fit(X)
        self.X_train = self.scaler.transform(X)
        self.y_train = y

    def _calculate_distance(self, x1, x2):
        """Oblicza odległość między obserwacjami"""
        if self.metric == 'euclidean':
            return euclidean(x1, x2)
        elif self.metric == 'manhattan':
            return np.sum(np.abs(x1 - x2))
        else:
            raise ValueError(f"Nieobsługiwana metryka: {self.metric}")

    def predict(self, data, horizon=1):
        """Predykcja dla nowych danych"""
        predictions = []

        # Przygotowanie danych wejściowych
        X, _ = self._preprocess_data(data)
        X_scaled = self.scaler.transform(X)

        for x in X_scaled:
            # Znajdź k najbliższych sąsiadów
            distances = []
            for i, train_x in enumerate(self.X_train):
                dist = self._calculate_distance(x, train_x)
                distances.append((dist, self.y_train[i]))

            # Wybierz k najmniejszych odległości
            nearest = nsmallest(self.k, distances, key=lambda x: x[0])

            # Średnia ważona (odwrotność odległości jako wagi)
            weights = [1 / (d[0] + 1e-9) for d in nearest]
            weighted_avg = np.average([d[1] for d in nearest], weights=weights)

            predictions.append(weighted_avg)

        return np.array(predictions)

    def evaluate(self, data):
        """Ewaluacja modelu"""
        X, y_true = self._preprocess_data(data)
        y_pred = self.predict(data)

        mse = mean_squared_error(y_true, y_pred)
        mae = mean_absolute_error(y_true, y_pred)

        return {
            'RMSE': np.sqrt(mse),
            'MAE': mae,
            'MAPE': np.mean(np.abs((y_true - y_pred) / y_true)) * 100,
            'predictions': y_pred,
            'actual': y_true
        }

    def tune_k(self, data, k_values=range(3, 15)):
        """Automatyczne strojenie parametru k"""
        results = {}
        X, y = self._preprocess_data(data)
        X_scaled = self.scaler.transform(X)

        for k in k_values:
            self.k = k
            y_pred = self.predict(data)
            rmse = np.sqrt(mean_squared_error(y, y_pred))
            results[k] = rmse

        best_k = min(results, key=results.get)
        self.k = best_k

        return results, best_k


# Przykład użycia
if __name__ == "__main__":
    # Generowanie syntetycznych danych
    np.random.seed(42)
    dates = pd.date_range(start='2023-01-01', end='2023-12-31')
    base = np.sin(np.linspace(0, 2 * np.pi * 365, len(dates))) * 50 + 100
    noise = np.random.normal(0, 15, len(dates))
    data = pd.Series(base + noise, index=dates)

    # Podział na zbiór treningowy i testowy
    split_date = '2023-11-01'
    train = data[:split_date]
    test = data[split_date:]

    # Inicjalizacja i trenowanie modelu
    model = EnergyKNN(k=7, window_size=24, use_time_features=True)
    model.fit(train)

    # Strojenie hiperparametru k
    results, best_k = model.tune_k(train)
    print(f"Optymalna wartość k: {best_k}")

    # Ewaluacja na zbiorze testowym
    metrics = model.evaluate(test)

    print(f"\nMetryki efektywności:")
    print(f"RMSE: {metrics['RMSE']:.2f} kWh")
    print(f"MAE: {metrics['MAE']:.2f} kWh")
    print(f"MAPE: {metrics['MAPE']:.2f}%")

    # Wizualizacja wyników
    plt.figure(figsize=(14, 6))
    plt.plot(test.index[len(test) - len(metrics['actual']):], metrics['actual'], label='Rzeczywiste')
    plt.plot(test.index[len(test) - len(metrics['predictions']):], metrics['predictions'], alpha=0.7, label='Predykcje')
    plt.title('Porównanie predykcji z rzeczywistym zużyciem energii')
    plt.xlabel('Data')
    plt.ylabel('Zużycie energii (kWh)')
    plt.legend()
    plt.grid(True)
    plt.show()