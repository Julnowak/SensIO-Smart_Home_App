import threading
import json
import ssl
from datetime import datetime

import paho.mqtt.client as paho
from paho import mqtt

from .models import Device, Measurement, Sensor

mqtt_threads = {}  # topic -> {"thread": t, "stop_event": e, "client": c}


def start_mqtt_thread(topic: str, deviceId: int):
    if topic in mqtt_threads:
        print(f"[MQTT] Wątek dla topicu '{topic}' już działa.")
        return

    stop_event = threading.Event()

    def on_message(client, userdata, msg):
        try:
            payload = json.loads(msg.payload.decode())
            print(f"[MQTT] Odebrano wiadomość z topicu '{msg.topic}': {payload}")

            device = Device.objects.get(device_id=deviceId)
            payload = json.loads(msg.payload.decode("utf-8"))
            sensors = Sensor.objects.filter(device=device)

            for k, v in payload.items():
                if k != "device_data" and k != "created_at":
                    if not sensors.filter(serial_number=v["SN"]).exists():
                        Sensor.objects.create(serial_number=v["SN"], device=device, name=k)

                    Measurement.objects.create(value=payload[k]["value"],
                                               saved_at=datetime.now(),
                                               created_at=payload['created_at'],
                                               sensor=sensors.get(serial_number=v["SN"]))

        except Exception as e:
            print(f"[MQTT] Błąd w przetwarzaniu danych: {e}")

    def mqtt_loop():
        print(f"[MQTT] Startuję nasłuch dla topicu: {topic}")
        client = paho.Client(protocol=paho.MQTTv5)
        client.tls_set(tls_version=ssl.PROTOCOL_TLS)
        client.username_pw_set("hivemq.webclient.1741361005809", "Dtf>&v4?XW8pb39BE:xC")
        client.on_message = on_message
        client.connect("66159fe671ed443f94b00666425069a3.s1.eu.hivemq.cloud", 8883)
        client.subscribe(topic)
        client.loop_start()  # używamy loop_start zamiast loop_forever

        while not stop_event.is_set():
            stop_event.wait(1)  # sprawdzaj co 1s czy trzeba zakończyć

        print(f"[MQTT] Zatrzymuję klienta MQTT dla topicu {topic}")
        client.loop_stop()
        client.disconnect()

    thread = threading.Thread(target=mqtt_loop, daemon=True)
    thread.start()

    mqtt_threads[topic] = {
        "thread": thread,
        "stop_event": stop_event
    }


def stop_mqtt_thread(topic: str):
    entry = mqtt_threads.get(topic)
    if entry:
        print(f"[MQTT] Zatrzymywanie wątku dla topicu {topic}")
        entry["stop_event"].set()
        entry["thread"].join(timeout=5)
        del mqtt_threads[topic]
    else:
        print(f"[MQTT] Brak aktywnego wątku dla topicu {topic}")
