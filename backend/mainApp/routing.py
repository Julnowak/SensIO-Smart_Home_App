from django.urls import re_path

from mainApp import consumers

websocket_urlpatterns = [
    re_path(r"ws/room_updates/(?P<home_id>\w+)/$", consumers.RoomConsumer.as_asgi()),
]