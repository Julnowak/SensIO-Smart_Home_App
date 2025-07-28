import pandas as pd
from matplotlib import pyplot as plt

N = 0
df = pd.read_csv('anomaly_one.csv', parse_dates=['timestamp'])
df['energy_consumption'] = df['energy_consumption']/1000

print(max(df['energy_consumption'] ))
