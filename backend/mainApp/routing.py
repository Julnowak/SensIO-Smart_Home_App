from django.urls import re_path

from mainApp import consumers

websocket_urlpatterns = [
    re_path(r"ws/room_updates/(?P<home_id>\w+)/$", consumers.RoomConsumer.as_asgi()),
    re_path(r"ws/chart_updates/(?P<home_id>\d+)/(?P<floor_id>\d+)/$", consumers.HomeFloorConsumer.as_asgi()),
]