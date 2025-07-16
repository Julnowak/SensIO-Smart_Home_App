import paho.mqtt.client as mqtt
import json
import random
import time
from datetime import datetime, UTC

# HiveMQ broker config (Cloud)
MQTT_CLIENT_ID = "SIMULATOR_ONE"
MQTT_BROKER = "66159fe671ed443f94b00666425069a3.s1.eu.hivemq.cloud"
MQTT_PORT = 8883
MQTT_USER = "hivemq.webclient.1741361005809"
MQTT_PASSWORD = "Dtf>&v4?XW8pb39BE:xC"
MQTT_TOPIC = "test"

# TLS (SSL) settings
TLS_SETTINGS = {
    "ca_certs": None,  # Uses system CA certs
    "certfile": None,
    "keyfile": None,
    "tls_version": None,
    "ciphers": None
}

# Simulated device serial numbers
DEVICE_SN = "SIM-0001"
TEMP_SN = "TEMP-0001"
HUMIDITY_SN = "HUM-0001"
LIGHT_SN = "LIGHT-0001"

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

    data = {
        "temp": {"value": temperature, "type": "continuous", "SN": TEMP_SN},
        "humidity": {"value": humidity, "type": "continuous", "SN": HUMIDITY_SN},
        "light": {"value": light, "type": "binary", "SN": LIGHT_SN},
        "device_data": {"SN": DEVICE_SN},
        "created_at": now
    }
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
