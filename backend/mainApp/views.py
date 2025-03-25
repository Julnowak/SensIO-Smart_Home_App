import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.core.cache import cache
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Room, Device, Floor

# Create your views here.
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from mainApp.models import AppUser, Home
from mainApp.serializers import UserRegisterSerializer, HomeSerializer, DeviceSerializer, UserSerializer, RoomSerializer

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
    parser_classes = (MultiPartParser, FormParser)

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
        user.email = request.data.get("email")
        user.name = request.data.get("name")
        user.username = request.data.get("username")
        user.telephone = request.data.get("phone")
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

    def put(self,request):
        loc = request.data['location_id']
        location_current = Home.objects.get(current=True)
        location_current.current = False
        location_current.save()
        print(location_current)

        loc_new = Home.objects.get(home_id=loc)
        loc_new.current = True
        loc_new.save()
        return Response(status=status.HTTP_200_OK)


class HomeData(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, home_id):
        home = Home.objects.get(home_id=home_id)
        floor = 1

        rooms = Room.objects.filter(home=home, floor=floor)

        roomsSerializer = RoomSerializer(rooms, many=True)
        serializer = HomeSerializer(home)
        return Response({"homeData": serializer.data, "roomsData": roomsSerializer.data}, status=status.HTTP_200_OK)


class DevicesData(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        devices = Device.objects.filter(room__home__owner=request.user)
        serializer = DeviceSerializer(devices, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):

        print(request.data)
        # devices = Device.objects.create()
        # device =
        # serializer = DeviceSerializer(device, many=True)
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


class LayoutHandler(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        layout = request.data['layout']
        json_data = f'{layout}'
        rooms = json.loads(json_data)
        print(rooms)
        d = {}
        for v in rooms:
            name = None
            pos = {}
            parent = None
            f = Floor.objects.get(floor_id=v['floor'])
            for k, vv in v.items():
                if k == "name":
                    name = vv
                elif k == "position":
                    pos = vv
                elif k == "parent":
                    if "temp" in str(vv):
                        parent = d[vv]
                    else:
                        parent = vv
            if not Room.objects.filter(floor=f, position=pos).exists():
                new = Room.objects.create(name=name, position=pos, home=f.home, floor=f, parent=parent)
                if "temp" in str(v['room_id']):
                    d[v['room_id']] = new.room_id
            else:
                old_r = Room.objects.get(floor=f, position=pos)
                if old_r.name != name:
                    old_r.name = name
                    old_r.save()
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