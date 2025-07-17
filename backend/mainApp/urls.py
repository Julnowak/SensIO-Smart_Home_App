from . import views
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import get_light_status, NotificationsAPI

urlpatterns = [
    path('register/', views.UserRegister.as_view(), name='register'),
    path('login/', views.UserLogin.as_view(), name='login'),
    path('logout/', views.UserLogout.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    path('user/', views.OneUserData.as_view(), name='user'),
    path('myHomes/', views.UserHomesData.as_view(), name='my-homes'),
    path('myDevices/', views.DevicesData.as_view(), name='my-devices'),
    path('myRooms/', views.RoomsData.as_view(), name='my-rooms'),
    path('home/<int:home_id>/', views.HomeData.as_view(), name='home'),
    path('roomsNewDevice/<int:home_id>/', views.RoomsNewDeviceApi.as_view(), name='roomsNewDevice'),
    path('notifications/', views.NotificationsAPI.as_view(), name='notifications'),
    path('notifications/<int:pk>/', NotificationsAPI.as_view(), name='notification-detail'),
    path('sensor/<int:sensor_id>/', views.SensorDataAPI.as_view(), name='sensor'),
    path("room/<int:room_id>/light/", get_light_status, name="get_light_status"),
    path("room/<int:room_id>/", views.RoomData.as_view(), name="room"),
    path("device/<int:device_id>/", views.DeviceData.as_view(), name="device"),
    path("actions/", views.ActionData.as_view(), name="actions"),
    path("layout_handler/", views.LayoutHandler.as_view(), name="layout_handler"),
]