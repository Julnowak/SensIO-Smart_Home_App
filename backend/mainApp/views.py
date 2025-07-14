import io
import json

import pandas as pd
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from django.http import JsonResponse, HttpResponse
from django.core.cache import cache
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Room, Device, Floor, Notification, Action

# Create your views here.
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from mainApp.models import AppUser, Home
from mainApp.serializers import UserRegisterSerializer, HomeSerializer, DeviceSerializer, UserSerializer, \
    RoomSerializer, NotificationSerializer, ActionSerializer, FloorSerializer
from .mqtt_thread import start_mqtt_thread, stop_mqtt_thread

UserModel = get_user_model()


class UserRegister(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):

        if AppUser.objects.filter(username=request.data['username'].lower()):
            return Response({"error": "Wybrana nazwa użytkownika już istnieje."}, status=status.HTTP_401_UNAUTHORIZED)
        if AppUser.objects.filter(email=request.data['email']):
            return Response({"error": "Istnieje już konto powiązane z tym adresem email."},status.HTTP_401_UNAUTHORIZED)
        if len(request.data['password']) < 8:
            return Response({"error": "Hasło powinno mieć minimum 8 znaków."}, status=status.HTTP_401_UNAUTHORIZED)
        if request.data['password'] != request.data['passwordSecond']:
            return Response({"error": "Hasła nie są ze sobą zgodne."}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.create(request.data)
            user.save()

            if user:
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(status.HTTP_400_BAD_REQUEST)


class UserLogin(APIView):
    permission_classes = [permissions.AllowAny,]  # Allow any user to access this view

    def post(self, request):
        email = request.data.get("username")
        password = request.data.get("password")

        print(request.data)

        # Ensure both fields are present
        if not email or not password:
            return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate the user
        user = authenticate(request, email=email, password=password)

        if user is None:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })


class UserLogout(APIView):

    def post(self, request):
        return Response(status=status.HTTP_200_OK)


class OneUserData(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        profile_picture = request.FILES.get('profile_picture')  # Use 'avatar' as the field name for the image
        if profile_picture:
            user.profile_picture = profile_picture  # Assuming 'avatar' is a field on your User model
            print(profile_picture)
            print(user.profile_picture)
            user.save()
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error': 'No avatar image provided'}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        user = request.user
        print(request.data)
        user.email = request.data.get("email")
        user.name = request.data.get("name")
        user.telephone = request.data.get("telephone")
        user.address = request.data.get("address")
        user.surname = request.data.get("surname")
        user.save()
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request):
        user = request.user
        user.delete()
        return Response({'message': 'User deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


class UserHomesData(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        homes = Home.objects.filter(owner=request.user)
        serializer = HomeSerializer(homes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        name = request.POST.get("name")
        address = request.POST.get("address")
        yearbuilt = None
        totalArea = None
        buildingType = None
        regards = None
        photo = None
        lat = None
        lng = None
        if "yearBuilt" in request.POST:
            yearbuilt = request.POST.get("yearBuilt")
        if "buildingType" in request.POST:
            buildingType = request.POST.get("buildingType")
        if "totalArea" in request.POST:
            try:
                totalArea = int(request.POST.get("totalArea"))
            except:
                pass
        if "floors" in request.POST:
            floors = int(request.POST.get("floors"))
        if "regards" in request.POST:
            regards = request.POST.get("regards")
        if "photo" in request.FILES:
            photo = request.FILES.get("photo")

        if "location" in request.POST:
            location = request.POST.get("location")
            lat = float(location.split(",")[0])
            lng = float(location.split(",")[1])
        home = Home.objects.create(name=name, address=address, owner=request.user, year_of_construction=yearbuilt,
                                   buildinq_type=buildingType, building_area=totalArea, floor_num=floors, regards=regards,
                                   image=photo, lat=lat, lng=lng)
        if floors == 1:
            Floor.objects.create(home=home, floor_number=1)
        else:
            for i in range(floors):
                Floor.objects.create(home=home, floor_number=i+1)
        serializer = HomeSerializer(home)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self,request):
        loc = request.data['location_id']
        location_current = Home.objects.get(current=True)
        location_current.current = False
        location_current.save()

        loc_new = Home.objects.get(home_id=loc)
        loc_new.current = True
        loc_new.save()
        return Response(status=status.HTTP_200_OK)


class HomeData(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, home_id):
        home = Home.objects.get(home_id=home_id)

        if request.GET.get("floorId"):
            floor = Floor.objects.get(floor_id=request.GET.get("floorId"))
        else:
            floor = Floor.objects.filter(home_id=home_id)[0]

        rooms = Room.objects.filter(home=home, floor=floor)
        roomsSerializer = RoomSerializer(rooms, many=True)
        serializer = HomeSerializer(home)
        return Response({"homeData": serializer.data, "roomsData": roomsSerializer.data}, status=status.HTTP_200_OK)

    def delete(self, request, home_id):
        home = Home.objects.get(home_id=home_id)
        home.delete()
        return Response(status=status.HTTP_200_OK)


class DevicesData(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        devices = Device.objects.filter(room__home__owner=request.user)
        serializer = DeviceSerializer(devices, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        device = Device.objects.create(name=request.data["name"], serial_number=request.data["serial_number"],
                                       topic=request.data["topic"], info=request.data["info"], brand=request.data["brand"],
                                       room_id=request.data["room"])

        serializer = DeviceSerializer(device)
        return Response(status=status.HTTP_200_OK)


class RoomsData(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        rooms = Room.objects.filter(home__owner=request.user)
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RoomData(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, room_id):
        room = Room.objects.get(room_id=room_id)
        serializer = RoomSerializer(room)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DeviceData(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, device_id):
        device = Device.objects.get(device_id=device_id)
        serializer = DeviceSerializer(device)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, device_id):
        device = Device.objects.get(device_id=device_id)

        if device.isActive:
            stop_mqtt_thread(device.topic)
            device.isActive = False
        else:
            start_mqtt_thread(device.topic, device_id)
            device.isActive = True
        device.save()

        return Response(status=status.HTTP_200_OK)

class RoomsNewDeviceApi(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, home_id):
        try:
            home = Home.objects.get(home_id=home_id)
        except Home.DoesNotExist:
            return Response({"error": "Home not found"}, status=status.HTTP_404_NOT_FOUND)

        floor_id = request.GET.get("floorId")

        if floor_id:
            # Zwróć pokoje na danym piętrze
            rooms = Room.objects.filter(home=home, floor_id=floor_id)
            serializer = RoomSerializer(rooms, many=True)
            return Response({"rooms": serializer.data}, status=status.HTTP_200_OK)
        else:
            # Zwróć listę pięter w domu
            floors = Floor.objects.filter(home=home)
            serializer = FloorSerializer(floors, many=True)
            return Response({"floors": serializer.data}, status=status.HTTP_200_OK)

class ActionData(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        actions = Action.objects.filter(device__owner=request.user).order_by("-created_at")
        serializer = ActionSerializer(actions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self,request):
        if request.data.get('actionType') == "export":
            ids = request.data.get('ids', [])
            actions = Action.objects.filter(action_id__in=ids)

            # Konwersja querysetu do listy słowników
            data = ActionSerializer(actions, many=True).data

            # Tworzenie DataFrame i zapis do CSV
            df = pd.DataFrame(data)

            buffer = io.StringIO()
            df.to_csv(buffer, index=False)
            buffer.seek(0)

            # Tworzymy odpowiedź HTTP z plikiem CSV
            response = HttpResponse(buffer.getvalue(), content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="actions_export.csv"'
            return response

        return Response(status=status.HTTP_400_BAD_REQUEST)


import random
class TestData(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        num = random.randint(0,100)
        return Response({"num": num}, status=status.HTTP_200_OK)


class LayoutHandler(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        layout = request.data['layout']
        print(request.data)
        floorId = int(request.data['floorId'])

        f = Floor.objects.get(floor_id=floorId)
        roomsIds = list(Room.objects.filter(floor=f).values_list("room_id", flat=True))
        for v in layout:
            name = None

            if v['id'] in roomsIds:
                print(roomsIds)
                roomsIds.remove(v['id'])
                print(roomsIds)

                old_r = Room.objects.get(room_id=v['id'])
                if old_r.name != v['name']:
                    old_r.name = v['name']

                old_r.position = {"x": v['x'], "y": v['y'], "width": v['width'], "height": v['height']}
                old_r.save()
            else:
                pos = {"x": None, "y": None, "width": None, "height": None}
                for k, vv in v.items():
                    if k == "name":
                        name = vv
                    elif k == "x":
                        pos["x"] = vv
                    elif k == "y":
                        pos["y"] = vv
                    elif k == "width":
                        pos["width"] = vv
                    elif k == "height":
                        pos["height"] = vv

                Room.objects.create(name=name, position=pos, home=f.home, floor=f)

        if roomsIds:
            print(roomsIds)
            for i in roomsIds:
                Room.objects.get(room_id=i).delete()

        return Response(status=status.HTTP_200_OK)


def get_light_status(request, room_id):
    light_status = cache.get(f"room_{room_id}_light")
    if light_status is None:
        try:
            # room = Room.objects.get(room_id=room_id)
            # light_status = room.light
            print("sd")
        except Room.DoesNotExist:
            return JsonResponse({"error": "Room not found"}, status=404)

    return JsonResponse({"room_id": room_id, "light": light_status})


class NotificationsAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        num = len(notifications.filter(isRead=False))
        print(num)
        return Response({"notifications": serializer.data, "num": num}, status=status.HTTP_200_OK)

    def patch(self, request, pk=None):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response(
                {"error": "Notification not found or you don't have permission"},
                status=status.HTTP_404_NOT_FOUND
            )

        if request.data['type'] == "read":
            serializer = NotificationSerializer(
                notification,
                data={'isRead': True},
                partial=True
            )
        else:
            serializer = NotificationSerializer(
                notification,
                data={'isRead': False},
                partial=True
            )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response(
                {"error": "Notification not found or you don't have permission"},
                status=status.HTTP_404_NOT_FOUND
            )

        notification.delete()
        return Response(
            {"message": "Notification deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )