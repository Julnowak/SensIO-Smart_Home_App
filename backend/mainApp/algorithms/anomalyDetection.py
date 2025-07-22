import os

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import MinMaxScaler
import numpy as np
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler

os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dropout, RepeatVector, TimeDistributed, Dense
from tensorflow.keras.optimizers import Adam
import keras_tuner as kt




def isolation_forest_IQR(data, column='energy_consumption', contamination=0.05):
    data = data.copy()
    scaler = MinMaxScaler()
    values = scaler.fit_transform(data[[column]])

    model = IsolationForest(
        contamination="auto",
        n_estimators=500,
    )

    model.fit_predict(values)
    decision_scores = model.decision_function(values)

    threshold = np.quantile(decision_scores, 0.01)
    data['isolation_forest'] = decision_scores < threshold

    return data


def dynamic_iqr(timeseries, w=None, k=1.5):
    if isinstance(timeseries, pd.Series):
        df = pd.DataFrame({'energy consumption': timeseries.values}, index=timeseries.index)
    elif isinstance(timeseries, pd.DataFrame):
        df = timeseries.copy()
    else:
        raise ValueError("Input should be a pandas Series or DataFrame")

    anomalies = np.zeros(len(df), dtype=bool)

    if w is None or w >= len(df):
        Q1 = df['energy consumption'].quantile(0.25)
        Q3 = df['energy consumption'].quantile(0.75)
        IQR = Q3 - Q1
        lb = Q1 - k * IQR
        ub = Q3 + k * IQR
        anomalies = (df['energy consumption'] < lb) | (df['energy consumption'] > ub)
    else:
        for i in range(len(df)):
            start = max(0, i - w // 2)
            end = min(len(df), i + w // 2)
            window = df['energy consumption'].iloc[start:end]
            Q1 = window.quantile(0.25)
            Q3 = window.quantile(0.75)
            IQR = Q3 - Q1
            lb = Q1 - k * IQR
            ub = Q3 + k * IQR
            if (df['energy consumption'].iloc[i] < lb) or (df['energy consumption'].iloc[i] > ub):
                anomalies[i] = True

    return anomalies

def create_sequences(data, window_size):
    sequences = []
    for i in range(len(data) - window_size + 1):
        sequences.append(data[i:i + window_size])
    return np.array(sequences)


def lstm_autoencoder(data, column='energy_consumption', window_size=24, iqr_multiplier=1.5, epochs=1, batch_size=32):
    scaler = MinMaxScaler()
    values = scaler.fit_transform(data[[column]])
    if len(values) < window_size + 1:
        raise ValueError(f"Not enough data points ({len(values)}) for window size {window_size}")
    X = create_sequences(values, window_size)
    X = X.reshape((X.shape[0], X.shape[1], 1))

    def build_model(hp):
        model = Sequential()
        model.add(LSTM(
            units=hp.Int('units', min_value=32, max_value=128, step=32),
            activation='relu',
            input_shape=(window_size, 1),
            return_sequences=False))
        model.add(Dropout(hp.Float('dropout', 0.1, 0.3, step=0.1)))
        model.add(RepeatVector(window_size))
        model.add(LSTM(
            units=hp.Int('units', min_value=32, max_value=128, step=32),
            activation='relu',
            return_sequences=True))
        model.add(Dropout(hp.Float('dropout', 0.1, 0.3, step=0.1)))
        model.add(TimeDistributed(Dense(1)))
        model.compile(
            optimizer=Adam(hp.Float('learning_rate', 1e-4, 1e-3, sampling='log')),
            loss='mse',
            metrics=['mae'])
        return model

    tuner = kt.RandomSearch(
        build_model,
        objective='val_loss',
        max_trials=10,
        directory='tuning',
        project_name='energy_forecast'
    )

    tuner.search(X, X, epochs=20, batch_size=batch_size, validation_split=0.2, verbose=1)
    best_model = tuner.get_best_models(num_models=1)[0]

    best_model.fit(X, X, epochs=epochs, batch_size=batch_size, validation_split=0.2, verbose=1)

    pred = best_model.predict(X)
    mae = np.mean(np.abs(pred - X), axis=(1, 2))

    q1 = np.percentile(mae, 25)
    q3 = np.percentile(mae, 75)
    iqr = q3 - q1

    ub = q3 + iqr_multiplier * iqr
    lb = q1 - iqr_multiplier * iqr

    anomalies = np.zeros(len(data))
    anomaly_scores = np.zeros(len(data))
    window_counts = np.zeros(len(data))

    for i in range(len(mae)):
        if mae[i] > ub or mae[i] < lb:
            anomaly_scores[i:i + window_size] += 1
        window_counts[i:i + window_size] += 1

    anomaly_scores = np.where(window_counts > 0, anomaly_scores / window_counts, 0)
    anomalies[anomaly_scores > 0.5] = 1

    data['lstm_autoencoder'] = anomalies
    return data


def matcher(if_res, lstm_res, iqr_res):
    consensus = pd.DataFrame(index=if_res.index)
    if_res = if_res.astype(bool) if if_res is not None else pd.Series(False, index=consensus.index)
    iqr_res = iqr_res.astype(bool) if iqr_res is not None else pd.Series(False, index=consensus.index)
    lstm_res = lstm_res.astype(bool) if lstm_res is not None else pd.Series(False, index=consensus.index)
    consensus['IF+IQR'] = iqr_res & (if_res | lstm_res)
    return consensus['IF+IQR']


def matcher2(if_res, lstm_res, iqr_res):
    consensus = pd.DataFrame(index=if_res.index)
    if_res = if_res.astype(bool) if if_res is not None else pd.Series(False, index=consensus.index)
    iqr_res = iqr_res.astype(bool) if iqr_res is not None else pd.Series(False, index=consensus.index)
    lstm_res = lstm_res.astype(bool) if lstm_res is not None else pd.Series(False, index=consensus.index)
    consensus['IF+IQR+LSTMAE'] = iqr_res & if_res & lstm_res
    return consensus['IF+IQR+LSTMAE']


def detect_anomaly(data):
    IF = isolation_forest_IQR(data=data)
    IQR = dynamic_iqr(data['energy_consumption'], w=None, k=1.5)
    LSTM = lstm_autoencoder(data, window_size=24, iqr_multiplier=4.5)

    consensus = matcher(
        IF['isolation_forest'] == 1,
        LSTM['lstm_autoencoder'] == 1,
        IQR
    )

    consensusHigh = matcher(
        IF['isolation_forest'] == 1,
        LSTM['lstm_autoencoder'] == 1,
        IQR
    )

    result = {"low_all": IF, "medium_all": consensus, "high_all": consensusHigh,
              "lastLow": IF['isolation_forest'].iloc[-1], "lastMedium": consensus.iloc[-1], "lastHigh": consensusHigh.iloc[-1]}

    return result

