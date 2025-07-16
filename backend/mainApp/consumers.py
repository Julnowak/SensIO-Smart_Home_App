import asyncio
import json

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from mainApp.connection import client
from mainApp.models import Room, Sensor, Measurement
from mainApp.serializers import SensorSerializer, MeasurementSerializer


class RoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.home_id = self.scope["url_route"]["kwargs"]["home_id"]
        self.room_group_name = f"room_updates_{self.home_id}"
        print(self.room_group_name)
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def light_update(self, event):
        print(f"Received light update event: {event}")  # Log event
        await self.send(text_data=json.dumps({
            "room_id": event["room_id"],
            "light": event["light"]
        }))

    async def receive(self, text_data):
        data = json.loads(text_data)
        print(f"Received WebSocket message: {data}")


        if data["type"] == "toggle_light":
            room_id = data["room_id"]
            new_light_status = data["light"]

            #MQTT
            client.publish("home/room/light", json.dumps({
                "type": "light_update",
                "room_id": room_id,
                "light": new_light_status,
            }))

            # Update the database asynchronously
            room = await self.get_room(room_id)
            if room:
                room.light = new_light_status
                await self.save_room(room)

                # Notify all WebSocket clients about the change
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "light_update",
                        "room_id": room_id,
                        "light": new_light_status,
                    },
                )

    @staticmethod
    async def get_room(room_id):
        try:
            return await Room.objects.aget(pk=room_id)  # Asynchronous DB fetch
        except Room.DoesNotExist:
            return None

    @staticmethod
    async def save_room(room):
        await sync_to_async(room.save)()  # Save the room in the DB


class HomeFloorConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("🔌 Próba połączenia WebSocket...")

        self.home_id = self.scope["url_route"]["kwargs"]["home_id"]
        self.floor_id = self.scope["url_route"]["kwargs"]["floor_id"]
        self.room_group_name = f"chart_updates_{self.home_id}_{self.floor_id}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        print("✅ WebSocket połączony!")

        self.running = True
        asyncio.create_task(self.send_sensor_data_loop())


    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):

        print(text_data)
        print("fffffffffffffff")
        # Można zaimplementować filtrowanie po stronie klienta, ale niekonieczne
        pass

    async def send_sensor_data_loop(self):
        while self.running:
            data = await self.get_serialized_sensor_data()
            if data:
                await self.send(text_data=json.dumps(data))
            await asyncio.sleep(5)  # np. co 3 sekundy

    @sync_to_async
    def get_serialized_sensor_data(self):

        print(self.floor_id)
        print(self.home_id)

        sensors = Sensor.objects.filter(device__room__floor_id=int(self.floor_id))
        measurements = Measurement.objects.filter(sensor__in=sensors)
        serialized = MeasurementSerializer(measurements, many=True).data

        # Tylko jeśli są nowe dane
        return {
            "type": "sensor_update",
            "data": serialized,
        }