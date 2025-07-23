import io
import json

import pandas as pd
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from django.http import JsonResponse, HttpResponse
from django.core.cache import cache
from django.utils import timezone
from fontTools.designspaceLib.types import Rules
from jupyter_events.cli import console
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Room, Device, Floor, Notification, Action, Sensor, Measurement, Rule

# Create your views here.
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from mainApp.models import AppUser, Home
from mainApp.serializers import UserRegisterSerializer, HomeSerializer, DeviceSerializer, UserSerializer, \
    RoomSerializer, NotificationSerializer, ActionSerializer, FloorSerializer, SensorSerializer, MeasurementSerializer, \
    RuleSerializer
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
            user.save()
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error': 'No avatar image provided'}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        user = request.user
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
        if "yearBuilt" in request.POST and request.POST.get("yearBuilt") != "":
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

        if "location" in request.POST and request.POST.get("location") != '':
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
        alarms = Action.objects.filter(device__location=home).order_by("-created_at")
        measurements = Measurement.objects.filter(sensor__device__location=home).order_by("-created_at")

        roomsSerializer = RoomSerializer(rooms, many=True)
        serializer = HomeSerializer(home)
        alarmSerializer = ActionSerializer(alarms, many=True)
        measurementSerializer = MeasurementSerializer(measurements, many=True)
        return Response({"homeData": serializer.data, "roomsData": roomsSerializer.data,
                         "alarmsData": alarmSerializer.data, 'measurementsData': measurementSerializer.data},
                        status=status.HTTP_200_OK)

    def put(self, request, home_id):
        home = Home.objects.get(home_id=home_id)

        if 'changeCurrent' in request.data:
            try:
                home_tc = Home.objects.filter(owner=request.user, current=True).first()
                home_tc.current = False
                home_tc.save()
            except:
                pass

            home.current = True
        if 'archive' in request.data:
            home.isArchived = not home.isArchived

        print(request.data)
        home.lat = request.data['lat']
        home.lng = request.data['lng']
        home.name = request.data['name']
        home.address = request.data['address']
        home.owner = request.user
        home.save()

        serializer = HomeSerializer(home)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, home_id):
        home = Home.objects.get(home_id=home_id)

        if home.current == True:
            home.delete()
            homes = Home.objects.filter(owner_id=request.user.id).values_list("home_id", flat=True)
            h = Home.objects.get(home_id=homes[0])
            h.current = True
            h.save()
        else:
            home.delete()

        return Response(status=status.HTTP_200_OK)


class DevicesData(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        devices = Device.objects.filter(location__owner=request.user)
        rooms = Room.objects.filter(home__owner=request.user)
        floors = Floor.objects.filter(home__owner=request.user)
        locations = Home.objects.filter(owner=request.user)

        roomsSerializer = RoomSerializer(rooms, many=True)
        floorSerializer = FloorSerializer(floors, many=True)
        locationSerializer = HomeSerializer(locations, many=True)
        serializer = DeviceSerializer(devices, many=True)
        return Response({"roomsData": roomsSerializer.data, "floorsData": floorSerializer.data,
                         "locationsData": locationSerializer.data, "devicesData": serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        Device.objects.create(name=request.data["name"],
                                       owner=request.user,
                                       serial_number=request.data["serial_number"],
                                       topic=request.data["topic"], info=request.data["info"], brand=request.data["brand"],
                                       room_id=request.data["room"], color=request.data["color"], floor_id=request.data["floor"], location_id=request.data["building"])
        print(request.data)
        return Response(status=status.HTTP_200_OK)


class RoomsData(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        rooms = Room.objects.filter(home__owner=request.user)
        floors = Floor.objects.filter(home__owner=request.user)
        locations = Home.objects.filter(owner=request.user)
        serializer = RoomSerializer(rooms, many=True)
        floorSerializer = FloorSerializer(floors, many=True)
        locationSerializer = HomeSerializer(locations, many=True)
        return Response({"roomsData": serializer.data, "floorsData": floorSerializer.data,
                         "locationsData": locationSerializer.data}, status=status.HTTP_200_OK)


class RoomData(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, room_id):
        room = Room.objects.get(room_id=room_id)
        devices = Device.objects.filter(room=room)
        sensors = Sensor.objects.filter(room=room)
        rules = Rule.objects.filter(rooms=room)

        energySen = sensors.filter(data_type="ENERGY")

        actions = Action.objects.filter(device__room=room).order_by("-created_at")


        serializer = RoomSerializer(room)
        devicesSerializer = DeviceSerializer(devices, many=True)
        sensorsSerializer = SensorSerializer(sensors, many=True)
        ruleSerializer = RuleSerializer(rules, many=True)
        actionsSerializer = ActionSerializer(actions, many=True)
        return Response({"roomData": serializer.data, "devicesData": devicesSerializer.data,
                         "sensorsData": sensorsSerializer.data, "rulesData": ruleSerializer.data,
                         "actionsData": actionsSerializer.data}, status=status.HTTP_200_OK)


class DeviceData(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, device_id):
        device = Device.objects.get(device_id=device_id)
        sensors = Sensor.objects.filter(device=device)
        rooms = Room.objects.filter(home__owner=request.user)
        floors = Floor.objects.filter(home__owner=request.user)
        locations = Home.objects.filter(owner=request.user)
        actions = Action.objects.filter(device=device).order_by("-created_at")
        rules = Rule.objects.filter(devices=device).order_by("-created_at")
        measurements = Measurement.objects.filter(sensor__in=sensors).order_by("-created_at")

        serializer = DeviceSerializer(device)
        sensorSerializer = SensorSerializer(sensors, many=True)
        locationSerializer = HomeSerializer(locations, many=True)
        roomSerializer = RoomSerializer(rooms, many=True)
        floorSerializer = FloorSerializer(floors, many=True)
        actionsSerializer = ActionSerializer(actions, many=True)
        rulesSerializer = RuleSerializer(rules, many=True)
        measurementSerializer = MeasurementSerializer(measurements, many=True)
        return Response({"deviceData":serializer.data,
                              "sensorsData": sensorSerializer.data,
                              "locationsData": locationSerializer.data,
                              "roomsData": roomSerializer.data,
                              "floorsData": floorSerializer.data,
                              "actionsData": actionsSerializer.data,
                              "rulesData": rulesSerializer.data,
                              "measurementsData": measurementSerializer.data,
                         }, status=status.HTTP_200_OK)

    def post(self, request, device_id):
        device = Device.objects.get(device_id=device_id)

        if device.isActive:
            stop_mqtt_thread(device.topic)
            device.isActive = False
        else:
            start_mqtt_thread(device.topic, device_id)
            device.isActive = True
        device.save()

        serializer=DeviceSerializer(device)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, device_id):
        device = Device.objects.get(device_id=device_id)
        device.isFavorite = request.data["isFavorite"]
        try:
            device.name = request.data["name"]
            device.serial_number = request.data["serial_number"]
            device.info = request.data["info"]
            device.color = request.data["color"]
            device.data_type = request.data["data_type"]
            device.brand = request.data["brand"]
            device.floor = Floor.objects.get(floor_id=request.data["floor"])
            device.room = Room.objects.get(room_id=request.data["room"])
            device.location = Home.objects.get(home_id=request.data["location"])
        except:
            pass
        device.save()
        serializer = DeviceSerializer(device)
        return Response(serializer.data, status=status.HTTP_200_OK)


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


class ActionsData(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):

        locations = Home.objects.filter(owner=request.user)
        if "sel" in request.GET:
            loc = locations.get(home_id=int(request.GET.get("sel")))
        else:
            loc = locations.get(current=True)

        actions = Action.objects.filter(device__owner=request.user, device__location=loc).order_by("-created_at")
        serializer = ActionSerializer(actions, many=True)
        locationsSerializer = HomeSerializer(locations, many=True)
        return Response({"actionsData": serializer.data,
                         "locationsData": locationsSerializer.data}, status=status.HTTP_200_OK)

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


class ActionData(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def put(self, request, action_id):
        action = Action.objects.get(action_id=action_id)

        if "isDanger" in request.data:
            if action.status == "NORMAL":
                action.measurement.warning = "HIGH"
                action.measurement.save()
                action.status = "HIGH"
            else:
                action.measurement.warning = "NORMAL"
                action.measurement.save()
                action.status = "NORMAL"
            action.save()

        if "isAcknowledged" in request.data:
            action.isAcknowledged = not action.isAcknowledged
            action.save()

        return Response(status=status.HTTP_200_OK)


class SensorDataAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, sensor_id):
        sensor = Sensor.objects.get(sensor_id=sensor_id)
        measurements = Measurement.objects.filter(sensor=sensor).order_by("-created_at")
        home = sensor.device.location
        floors = Floor.objects.filter(home=home)
        rooms = Room.objects.filter(floor__in=floors)

        rules = Rule.objects.filter(sensors=sensor).order_by("-created_at")

        actions = Action.objects.filter(measurement__in=measurements).order_by("-created_at")
        serializer = SensorSerializer(sensor)
        measurementSerialzier = MeasurementSerializer(measurements, many=True)
        actionSerializer = ActionSerializer(actions, many=True)
        ruleSerializer = RuleSerializer(rules, many=True)
        roomSerializer = RoomSerializer(rooms, many=True)
        floorSerializer = FloorSerializer(floors, many=True)
        return Response({"sensorData": serializer.data, "measurementData": measurementSerialzier.data,
                         "actionsData": actionSerializer.data, "rulesData": ruleSerializer.data,
                         "roomsData": roomSerializer.data, "floorsData": floorSerializer.data}, status=status.HTTP_200_OK)

    def put(self, request, sensor_id):
        sensor = Sensor.objects.get(sensor_id=sensor_id)

        if "type" in request.data:
            if request.data["type"] == "lightChange":
                measurement = Measurement.objects.create(
                    value=int(request.data["value"]),
                    saved_at=timezone.now(),
                    created_at=timezone.now(),
                    sensor=sensor,
                )

                Action.objects.create(
                    measurement=measurement,
                    device_id=sensor.device.device_id,
                    description=f"Ręczna zmiana oświetlenia na {int(request.data["value"])}.",
                    status=measurement.warning,
                    type="MANUAL",
                )

                if sensor.room:
                    sensors = Sensor.objects.filter(room=sensor.room)
                    if sensors.count() > 1:
                        l = list()
                        for s in sensors:
                            m = Measurement.objects.filter(sensor=s).last()
                            l.append(m.value)

                        any_sensor_on = any(int(ll) == 1 for ll in l)
                        sensor.room.light = any_sensor_on
                    else:
                        sensor.room.light = int(request.data["value"]) == 1
                    sensor.room.save()

                return Response(status=status.HTTP_200_OK)


        sensor.visibleName = request.data["visibleName"]
        sensor.name = request.data["name"]
        sensor.serial_number = request.data["serial_number"]
        sensor.data_type = request.data["data_type"]
        sensor.unit = request.data["unit"]
        if "room" in request.data and request.data["room"]:
            sensor.room = Room.objects.get(pk=int(request.data["room"]))
        sensor.save()

        serializer = SensorSerializer(sensor)
        return Response(serializer.data, status=status.HTTP_200_OK)


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


class RulesDataAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        rules = Rule.objects.filter(owner=request.user)
        serializer = RuleSerializer(rules, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RuleDataAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, rule_id):
        rule = Rule.objects.get(pk=rule_id)
        serializer = RuleSerializer(rule)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        print(request.data)
        # rule = Rule.objects.get(pk=rule_id)
        # serializer = RuleSerializer(rule)
        return Response(status=status.HTTP_200_OK)

    def put(self, request, rule_id):
        rule = Rule.objects.get(pk=rule_id)
        serializer = RuleSerializer(rule)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MainAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        locations = Home.objects.filter(owner=request.user)
        measurements = Measurement.objects.filter(sensor__device__owner=request.user, sensor__data_type="ENERGY")
        measurementSerializer = MeasurementSerializer(measurements, many=True)
        locationSerializer = HomeSerializer(locations, many=True)
        return Response({"measurementsData": measurementSerializer.data,
                              "locationsData": locationSerializer.data}, status=status.HTTP_200_OK)


class ChartsDataAPI(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):

        devices = Device.objects.filter(owner=request.user)
        sensors = Sensor.objects.filter(device__owner=request.user)

        rooms = Room.objects.filter(home__owner=request.user)
        floors = Floor.objects.filter(home__owner=request.user)
        locations = Home.objects.filter(owner=request.user)

        measurements = Measurement.objects.filter(sensor__device__owner=request.user)

        roomsSerializer = RoomSerializer(rooms, many=True)
        floorSerializer = FloorSerializer(floors, many=True)
        locationSerializer = HomeSerializer(locations, many=True)
        serializer = DeviceSerializer(devices, many=True)
        sensorSerializer = SensorSerializer(sensors, many=True)
        measurementSerializer = MeasurementSerializer(measurements, many=True)

        # print(measurementSerializer.data)

        return Response({"roomsData": roomsSerializer.data, "floorsData": floorSerializer.data,
                         "locationsData": locationSerializer.data, "devicesData": serializer.data,
                         "sensorsData": sensorSerializer.data, "measurementsData": measurementSerializer.data},
                          status=status.HTTP_200_OK)


    def post(self, request):

        print(request.data)
        t = request.data['type']

        if t == "device":
            device = Device.objects.get(pk=request.data['device'])
            measurements = Measurement.objects.filter(device=device)
            serializer = MeasurementSerializer(measurements, many=True)


        # sensor = Sensor.objects.get(sensor_id=sensor_id)
        # sensor.visibleName = request.data["visibleName"]
        # sensor.name = request.data["name"]
        # sensor.serial_number = request.data["serial_number"]
        # sensor.data_type = request.data["data_type"]
        # sensor.unit = request.data["unit"]
        # sensor.save()

        # serializer = SensorSerializer(sensor)
        return Response(serializer.data, status=status.HTTP_200_OK)