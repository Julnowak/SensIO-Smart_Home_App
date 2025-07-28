import paho.mqtt.client as mqtt
import json
import time
from datetime import datetime, UTC

import pandas as pd

# HiveMQ broker config (Cloud)
MQTT_CLIENT_ID = "SIMULATOR_ONE"
MQTT_BROKER = "66159fe671ed443f94b00666425069a3.s1.eu.hivemq.cloud"
MQTT_PORT = 8883
MQTT_USER = "hivemq.webclient.1741361005809"
MQTT_PASSWORD = "Dtf>&v4?XW8pb39BE:xC"
MQTT_TOPIC = "cnri46wce0323c_13_1"

# TLS (SSL) settings
TLS_SETTINGS = {
    "ca_certs": None,  # Uses system CA certs
    "certfile": None,
    "keyfile": None,
    "tls_version": None,
    "ciphers": None
}

# Simulated device serial numbers
ENERGY_SN = "ENERGY-3465"

sensors = []


# Connect callback
def on_connect(client, userdata, flags, rc):
    print("Connected with result code", rc)

# Create MQTT client and set credentials
client = mqtt.Client(client_id=MQTT_CLIENT_ID)
client.username_pw_set(MQTT_USER, MQTT_PASSWORD)
client.tls_set(**TLS_SETTINGS)
client.on_connect = on_connect

N = 0
df = pd.read_csv('anomaly_one.csv', parse_dates=['timestamp'])
df['energy_consumption'] = df['energy_consumption']/1000

# Connect to broker
print("Connecting to MQTT broker...")
client.connect(MQTT_BROKER, MQTT_PORT, 60)
client.loop_start()

def generate_data():
    global N
    now = datetime.now(UTC)
    data = {}

    first_row = df.iloc[N]

    energy = first_row['energy_consumption']
    data[ENERGY_SN] = {
        "value": energy,
        "type": "continuous",
        "created_at": now.isoformat(),
        "saved_at": now.isoformat()
    }
    N += 1
    return data

try:
    while True:
        payload = generate_data()
        json_payload = json.dumps(payload)
        print("Publishing:", json_payload)
        client.publish(MQTT_TOPIC, json_payload)
        time.sleep(10)

except KeyboardInterrupt:
    print("Stopped by user.")
    client.loop_stop()
    client.disconnect()
