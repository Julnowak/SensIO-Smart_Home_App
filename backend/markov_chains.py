import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error


class EnergyConsumptionPredictor:
    def __init__(self, n_states=3, window_size=3):
        self.n_states = n_states
        self.window_size = window_size
        self.transition_matrix = None
        self.state_models = {}
        self.state_ranges = {}
        self.states = []

    def fit(self, data):
        # Dyskretyzacja danych na stany
        self._discretize_data(data)

        # Tworzenie macierzy przejść
        self._create_transition_matrix()

        # Trenowanie modeli dla każdego stanu
        self._train_state_models(data)

    def _discretize_data(self, data):
        # Automatyczny podział na stany używając kwantyli
        quantiles = np.linspace(0, 1, self.n_states + 1)
        bins = data.quantile(quantiles).unique()
        self.states = [f"State_{i}" for i in range(len(bins) - 1)]

        # Zapamiętanie zakresów dla każdego stanu
        for i in range(len(bins) - 1):
            self.state_ranges[self.states[i]] = (bins[i], bins[i + 1])

        self.discrete_states = pd.cut(data, bins=bins, labels=self.states, include_lowest=True)

    def _create_transition_matrix(self):
        self.transition_matrix = pd.DataFrame(
            0, index=self.states, columns=self.states, dtype=float
        )

        for i in range(len(self.discrete_states) - 1):
            current = self.discrete_states.iloc[i]
            next_ = self.discrete_states.iloc[i + 1]
            self.transition_matrix.loc[current, next_] += 1

        # Normalizacja do prawdopodobieństw
        self.transition_matrix = self.transition_matrix.div(
            self.transition_matrix.sum(axis=1), axis=0
        )

    def predict_next(self, recent_history):
        # Określ aktualny stan - POPRAWIONE
        current_value = recent_history.iloc[-1]  # Zmiana z recent_history[-1]
        current_state = self._get_current_state(current_value)

        # Przewidywanie następnego stanu
        next_state = np.random.choice(
            self.states,
            p=self.transition_matrix.loc[current_state].values
        )

        # Przewidywanie wartości w ramach stanu - POPRAWIONE
        if next_state in self.state_models:
            model = self.state_models[next_state]
            # Konwersja do numpy array przed predykcją
            input_data = recent_history.iloc[-self.window_size:].values.reshape(1, -1)
            prediction = model.predict(input_data)
            return max(prediction[0], 0)
        else:
            return np.mean(self.state_ranges[next_state])

    def _train_state_models(self, data):
        for state in self.states:
            indices = np.where(self.discrete_states == state)[0]
            X, y = [], []
            for idx in indices:
                if idx >= self.window_size:
                    # POPRAWIONE - użycie iloc dla pewnego dostępu
                    features = data.iloc[idx - self.window_size:idx].values
                    target = data.iloc[idx]  # Zmiana z data[idx]
                    X.append(features)
                    y.append(target)
            if len(X) > 0:
                model = LinearRegression()
                model.fit(X, y)
                self.state_models[state] = model

    def _get_current_state(self, value):
        try:
            value = float(value)
            for state, (low, high) in self.state_ranges.items():
                if low <= value <= high:  # Zmiana na <= z prawej strony
                    return state
            # Obsługa wartości spoza zakresu
            return self.states[-1] if value >= self.state_ranges[self.states[-1]][0] else self.states[0]
        except:
            return self.states[-1]

    def evaluate(self, test_data):
        predictions = []
        actual = []

        if len(test_data) <= self.window_size:
            raise ValueError(f"Test data too short. Needs at least {self.window_size + 1} samples.")

        for i in range(self.window_size, len(test_data)):
            try:
                # Pobieranie przez pozycję - POPRAWIONE
                recent = test_data.iloc[i - self.window_size:i]

                # Dodatkowe sprawdzenie typu danych
                if not isinstance(recent, pd.Series):
                    continue

                # Konwersja do wartości liczbowych
                recent_values = recent.values.astype(float)

                pred = self.predict_next(recent)
                predictions.append(pred)
                actual.append(test_data.iloc[i])

            except (KeyError, IndexError) as e:
                print(f"Błąd przy indeksie {i}: {str(e)}")
                continue

        if len(predictions) == 0:
            return np.nan, [], []

        rmse = np.sqrt(mean_squared_error(actual, predictions))
        return rmse, predictions, actual

# Generowanie przykładowych danych
np.random.seed(42)
hours = 24*30  # 30 dni co godzinę
base = np.sin(np.linspace(0, 2*np.pi, 24)) * 50 + 100
data = pd.Series(np.tile(base, 30) + np.random.normal(0, 15, hours))

# Podział na dane treningowe i testowe
train = data.iloc[:24*20]  # Pierwsze 20 dni
test = data.iloc[24*20:]   # Ostatnie 10 dni

# Inicjalizacja i trenowanie modelu
model = EnergyConsumptionPredictor(n_states=5, window_size=3)
model.fit(train)

# Ocena modelu
rmse, predictions, actual = model.evaluate(test)
print(f"RMSE: {rmse:.2f} kWh")

# Wizualizacja
import matplotlib.pyplot as plt

plt.figure(figsize=(12, 6))
plt.plot(actual, label="Rzeczywiste zużycie")
plt.plot(predictions, label="Przewidywania", alpha=0.7)
plt.title("Porównanie przewidywań z rzeczywistymi wartościami")
plt.xlabel("Godziny")
plt.ylabel("Zużycie energii [kWh]")
plt.legend()
plt.show()