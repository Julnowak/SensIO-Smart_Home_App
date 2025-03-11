from . import views
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import get_light_status

urlpatterns = [
    path('register/', views.UserRegister.as_view(), name='register'),
    path('login/', views.UserLogin.as_view(), name='login'),
    path('logout/', views.UserLogout.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    path('user/', views.OneUserData.as_view(), name='user'),
    path('myHomes/', views.UserHomesData.as_view(), name='my-homes'),
    path('myDevices/', views.DevicesData.as_view(), name='my-devices'),
    path('home/<int:home_id>', views.HomeData.as_view(), name='home'),

    path("room/<int:room_id>/light/", get_light_status, name="get_light_status"),
    path("layout_handler/", views.LayoutHandler.as_view(), name="layout_handler"),
]