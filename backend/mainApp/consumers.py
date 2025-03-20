import json

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from mainApp.connection import client
from mainApp.models import Room


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