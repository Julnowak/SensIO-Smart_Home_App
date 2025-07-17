from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import MinMaxScaler
import numpy as np
import pandas as pd


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


def matcher(if_res, iqr_res):
    consensus = pd.DataFrame(index=if_res.index)
    if_res = if_res.astype(bool) if if_res is not None else pd.Series(False, index=consensus.index)
    iqr_res = iqr_res.astype(bool) if iqr_res is not None else pd.Series(False, index=consensus.index)

    consensus['IF'] = if_res
    consensus['IF+IQR'] = iqr_res & if_res
    return consensus['IF+IQR']


### Detektor IF oraz IQR+IF
def detect_anomaly(data):
    IF = isolation_forest_IQR(data=data)
    _, IQR = dynamic_iqr(data['energy_consumption'], w=None, k=1.5)
    last = (data.index[-1] in IF[IF['isolation_forest']==1]) | (data.index[-1] in data[IQR])
    #  in resIF[resIF['isolation_forest']==1]) | (d.index[-1] in d[resIQR])
    consensus = matcher(
        IF['isolation_forest'] == 1,
        IQR
    )
    result = {"low": IF, "medium": consensus, "last": last}

    return result