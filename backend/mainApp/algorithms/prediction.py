from sklearn.ensemble import RandomForestRegressor
import pandas as pd


def create_rolling_features(data, window=24):
    df = pd.DataFrame(data)
    for i in range(1, window + 1):
        df[f'lag_{i}'] = df['energy_consumption'].shift(i)

    print(df)
    df['hour'] = df.index.hour
    df['day_of_week'] = df.index.dayofweek
    df['month'] = df.index.month
    return df.dropna()


def doRandomForest(trainData, testData):
    rfTimes = dict()
    train_rf = create_rolling_features(trainData)
    X_train_rf, y_train_rf = train_rf.drop('energy_consumption', axis=1), train_rf['energy_consumption']

    test_rf = create_rolling_features(pd.concat([trainData[-24:], testData]))
    X_test_rf, y_test_rf = test_rf.drop('energy_consumption', axis=1), test_rf['energy_consumption']

    rf_model = RandomForestRegressor(n_estimators=100)
    rf_model.fit(X_train_rf, y_train_rf)

    return rf_model, X_test_rf, y_test_rf, rfTimes


def do_prediction(data, n=1):
    train = data['energy_consumption'][:-n]
    test = data['energy_consumption'][-n:]
    rf_model, X_test_rf, _, _ = doRandomForest(train, test)
    ans = rf_model.predict(X_test_rf)
    return ans

# do_prediction(data, n=20)