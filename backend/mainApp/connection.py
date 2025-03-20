import json

import paho.mqtt.client as paho
from django.core.cache import cache
from paho import mqtt

from mainApp.models import Room

client = paho.Client(client_id="", userdata=None, protocol=paho.MQTTv5)
client.tls_set(tls_version=mqtt.client.ssl.PROTOCOL_TLS)

USERNAME = "hivemq.webclient.1741361005809"
PASSWORD = "Dtf>&v4?XW8pb39BE:xC"
URL = "66159fe671ed443f94b00666425069a3.s1.eu.hivemq.cloud"
PORT = 8883
TOPIC = "home/room/light"
CLIENT_ID = "python-client"

import time
import paho.mqtt.client as paho
from paho import mqtt

# setting callbacks for different events to see if it works, print the message etc.
def on_connect(client, userdata, flags, rc, properties=None):
    print("CONNECT received with code %s." % rc)
    client.subscribe(TOPIC)

# with this callback you can see if your publish was successful
def on_publish(client, userdata, mid, properties=None):
    print("mid: " + str(mid))

# print which topic was subscribed to
def on_subscribe(client, userdata, mid, granted_qos, properties=None):
    print("Subscribed: " + str(mid) + " " + str(granted_qos))

# print message, useful for checking if it was successful
def on_message(client, userdata, msg):
    print(msg.topic + " " + str(msg.qos) + " " + str(msg.payload))
    try:
        payload = json.loads(msg.payload.decode("utf-8"))  # Assuming JSON payload
        room_id = 1  # Extract room_id
        light_state = payload.get("light_status", False)  # Extract light state

        # Update Room model
        # Room.objects.filter(room_id=room_id).update(light=light_state)
        ls = True
        if light_state == 0:
            ls = False

        room = Room.objects.get(room_id=room_id)
        room.light = ls
        room.save()

        # Store in cache for quick access
        cache.set(f"room_{room_id}_light", light_state, timeout=30)

    except Exception as e:
        print(f"Error processing MQTT message: {e}")

# using MQTT version 5 here, for 3.1.1: MQTTv311, 3.1: MQTTv31
# userdata is user defined data of any type, updated by user_data_set()
# client_id is the given name of the client
client = paho.Client(client_id="", userdata=None, protocol=paho.MQTTv5)
client.on_connect = on_connect

# enable TLS for secure connection
client.tls_set(tls_version=mqtt.client.ssl.PROTOCOL_TLS)

# set username and password
client.username_pw_set(USERNAME, PASSWORD)

# connect to HiveMQ Cloud on port 8883 (default for MQTT)
client.connect(URL, PORT)

# setting callbacks, use separate functions like above for better visibility
client.on_subscribe = on_subscribe
client.on_message = on_message
client.on_publish = on_publish

# # subscribe to all topics of encyclopedia by using the wildcard "#"
# client.subscribe("encyclopedia/#", qos=2)
#
# # a single publish, this can also be done in loops, etc.
# client.publish("encyclopedia/temperature", payload="hot", qos=1)

# loop_forever for simplicity, here you need to stop the loop manually
# you can also use loop_start and loop_stop
client.loop_start()