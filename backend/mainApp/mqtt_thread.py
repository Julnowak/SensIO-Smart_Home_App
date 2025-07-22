import threading
import json
import ssl
from datetime import datetime
from celery import shared_task
import paho.mqtt.client as paho
from .algorithms.anomalyDetection import detect_anomaly
from .models import Device, Measurement, Sensor, Action
import pandas as pd

mqtt_threads = {}  # topic -> {"thread": t, "stop_event": e, "client": c}


@shared_task
def process_mqtt_data(payload, topic, device_id):
    try:
        print(f"[Celery] Przetwarzam dane z MQTT dla topicu {topic}")
        device = Device.objects.get(device_id=device_id)

        for k, v in payload.items():
            sensor, created = Sensor.objects.get_or_create(serial_number=k, device=device, name=k)
            measurement = Measurement.objects.create(
                value=float(v["value"]),
                saved_at=datetime.now(),
                created_at=v["created_at"],
                sensor=sensor
            )

            if sensor.data_type == "ENERGY":
                all_mes = Measurement.objects.filter(sensor=sensor)
                mes = all_mes.values_list("saved_at", "value")
                df = pd.DataFrame(mes, columns=["timestamp", "energy_consumption"])
                df['energy_consumption'] = df['energy_consumption'].astype(float)

                detRes = detect_anomaly(df)

                if detRes['lastHigh']:
                    measurement.warning = "HIGH"
                elif detRes['lastMedium']:
                    measurement.warning = "MEDIUM"
                elif detRes['lastLow']:
                    measurement.warning = "LOW"

                measurement.save()

                Action.objects.create(
                    measurement=measurement,
                    device_id=device_id,
                    description="Pomiar zużycia energii.",
                    status=measurement.warning
                )

    except Exception as e:
        print(f"[Celery] Błąd w przetwarzaniu danych MQTT: {e}")


def start_mqtt_thread(topic: str, deviceId: int):
    if topic in mqtt_threads:
        print(f"[MQTT] Wątek dla topicu '{topic}' już działa.")
        return

    stop_event = threading.Event()

    def on_message(client, userdata, msg):
        try:
            payload = json.loads(msg.payload.decode())
            topic = msg.topic
            print(f"[MQTT] Odebrano wiadomość z topicu '{topic}': {payload}")
            process_mqtt_data.apply_async(args=[payload, topic, deviceId], queue="mqtt_tasks")
        except Exception as e:
            print(f"[MQTT] Błąd w odbiorze wiadomości: {e}")

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
