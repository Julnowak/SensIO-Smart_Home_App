import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import IsolationForest
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler

# === 1. Wczytanie i przygotowanie danych ===
df = pd.read_csv("one_building_data.csv")
df['timestamp'] = pd.to_datetime(df['timestamp'])
df.sort_values('timestamp', inplace=True)
df.set_index('timestamp', inplace=True)

data = df[['energy_consumption']].dropna()

# Skalowanie danych (ważne dla One-Class SVM)
scaler = StandardScaler()
scaled_energy = scaler.fit_transform(data)

# === 2. Isolation Forest ===
isoforest = IsolationForest(n_estimators=100, contamination=0.01, random_state=42)
data['iso_anomaly'] = isoforest.fit_predict(scaled_energy)
data['iso_anomaly'] = data['iso_anomaly'].map({1: 0, -1: 1})

# === 3. One-Class SVM ===
onesvm = OneClassSVM(nu=0.01, kernel="rbf", gamma='scale')
data['svm_anomaly'] = onesvm.fit_predict(scaled_energy)
data['svm_anomaly'] = data['svm_anomaly'].map({1: 0, -1: 1})

# === 4. Wizualizacja porównawcza ===
plt.figure(figsize=(15, 6))
plt.plot(data.index, data['energy_consumption'], label='Energy Consumption', color='blue')

# Isolation Forest Anomalies
plt.scatter(
    data.index[data['iso_anomaly'] == 1],
    data['energy_consumption'][data['iso_anomaly'] == 1],
    color='red',
    label='Isolation Forest Anomaly',
    s=25,
    alpha=0.6
)

# One-Class SVM Anomalies
plt.scatter(
    data.index[data['svm_anomaly'] == 1],
    data['energy_consumption'][data['svm_anomaly'] == 1],
    color='green',
    label='One-Class SVM Anomaly',
    s=25,
    alpha=0.6
)

plt.title('Porównanie wykrywania anomalii: Isolation Forest vs One-Class SVM')
plt.xlabel('Czas')
plt.ylabel('Zużycie energii')
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.show()
