import paho.mqtt.client as mqtt
import json
import time
import random
from datetime import datetime, UTC

# HiveMQ broker config (Cloud)
MQTT_CLIENT_ID = "SIMULATOR_ONE"
MQTT_BROKER = "66159fe671ed443f94b00666425069a3.s1.eu.hivemq.cloud"
MQTT_PORT = 8883
MQTT_USER = "hivemq.webclient.1741361005809"
MQTT_PASSWORD = "Dtf>&v4?XW8pb39BE:xC"
MQTT_TOPIC = "cjn2i3w2733941sadd_14_1_7"

# TLS (SSL) settings
TLS_SETTINGS = {
    "ca_certs": None,  # Uses system CA certs
    "certfile": None,
    "keyfile": None,
    "tls_version": None,
    "ciphers": None
}

# Simulated device serial numbers
TEMP_SN = "TEMP-0001"
HUMIDITY_SN = "HUM-0001"
LIGHT_SN = "LIGHT-0001"
SENSOR_SN = "SENSOR-0001"

sensors = []


# Connect callback
def on_connect(client, userdata, flags, rc):
    print("Connected with result code", rc)

# Create MQTT client and set credentials
client = mqtt.Client(client_id=MQTT_CLIENT_ID)
client.username_pw_set(MQTT_USER, MQTT_PASSWORD)
client.tls_set(**TLS_SETTINGS)
client.on_connect = on_connect

# Connect to broker
print("Connecting to MQTT broker...")
client.connect(MQTT_BROKER, MQTT_PORT, 60)
client.loop_start()

def generate_data():
    temperature = round(random.uniform(18.0, 30.0), 1)
    humidity = round(random.uniform(30.0, 70.0), 1)
    light = random.choice([True, False])  # Simulate on/off
    now = datetime.now(UTC)

    data = {TEMP_SN: {"value": temperature, "type": "continuous", "created_at": now.isoformat()},
            HUMIDITY_SN: {"value": humidity, "type": "continuous", "created_at": now.isoformat()},
            LIGHT_SN: {"value": light, "type": "binary", "SN": LIGHT_SN, "created_at": now.isoformat()}}
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
