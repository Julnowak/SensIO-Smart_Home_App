from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json
from .models import Room


@receiver(post_save, sender=Room)
def room_light_updated(sender, instance, **kwargs):
    """Wysyła update do WebSocketów, gdy zmienia się światło w pokoju"""
    print(f"🔄 Signal: Room {instance.room_id} light changed to {instance.light}")

    channel_layer = get_channel_layer()
    group_name = f"room_updates_{instance.home_id}"
    print(f"Sending to group: {group_name}")
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "light_update",
            "room_id": instance.room_id,
            "light": instance.light,
        },
    )
    print("SSSSSSSSSSSSSSSSSSSS")
