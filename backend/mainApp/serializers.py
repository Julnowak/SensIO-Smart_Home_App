from django.core.exceptions import ValidationError
from rest_framework import serializers

# from django.contrib.auth.models import User
from django.contrib.auth import authenticate, get_user_model

from mainApp.models import Home, Device, Room, Notification, Action, Floor, Sensor, Measurement, Rule

UserModel = get_user_model()


class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = '__all__'

    def create(self, validated_data):
        user_obj = UserModel.objects.create_user(email=validated_data['email'],
                                                 password=validated_data['password'],
                                                 username=validated_data['username'])
        user_obj.username = validated_data['username']
        user_obj.save()
        return user_obj


class UserLoginSerializer(serializers.Serializer):

    email = serializers.EmailField()
    password = serializers.CharField()

    def check_user(self, validated_data):
        user = authenticate(username=validated_data['email'], password=validated_data['password'])
        if not user:
            raise ValidationError('User not found.')
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = '__all__'


class FloorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Floor
        fields = '__all__'
        depth = 2


class HomeSerializer(serializers.ModelSerializer):
    devicesCount = serializers.SerializerMethodField()
    floors = serializers.SerializerMethodField()
    lastUpdated = serializers.SerializerMethodField()
    isActive = serializers.SerializerMethodField()
    activeDevices = serializers.SerializerMethodField()
    roomsCount = serializers.SerializerMethodField()

    class Meta:
        model = Home
        fields = [field.name for field in Home._meta.fields] + ['roomsCount','activeDevices', 'devicesCount', 'floors','lastUpdated', 'isActive']
        depth = 2

    def get_devicesCount(self, obj):
        return Device.objects.filter(location=obj).count()

    def get_floors(self, obj):
        f = Floor.objects.filter(home=obj)
        floors = FloorSerializer(f, many=True).data
        return floors

    def get_lastUpdated(self, obj):
        measurements = Measurement.objects.filter(sensor__device__location=obj)

        if measurements.count() == 0:
            return None
        else:
            last = measurements.order_by("-saved_at").values_list("saved_at")[0]
            return last

    def get_isActive(self, obj):
        devices = Device.objects.filter(location=obj).values_list("isActive", flat=True)
        return any(devices)

    def get_roomsCount(self, obj):
        rooms = Room.objects.filter(home=obj)
        return rooms.count()

    def get_activeDevices(self, obj):
        devices = Device.objects.filter(location=obj, isActive=True)
        devices_all = Device.objects.filter(location=obj)
        return f"{len(devices)}/{len(devices_all)}"


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


class SensorSerializer(serializers.ModelSerializer):
    lastValue = serializers.SerializerMethodField()

    class Meta:
        model = Sensor
        fields = [field.name for field in Sensor._meta.fields] + ['lastValue']
        depth = 2

    def get_lastValue(self, obj):
        measurement = Measurement.objects.filter(sensor=obj).order_by("-saved_at").first()
        serializer = MeasurementSerializer(measurement)
        return serializer.data


class MeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Measurement
        fields = '__all__'
        depth = 3


class ActionSerializer(serializers.ModelSerializer):
    # device_id = serializers.IntegerField(source='device.device_id', read_only=True)

    class Meta:
        model = Action
        fields = '__all__'
        depth = 4


class RuleSerializer(serializers.ModelSerializer):
    # device_id = serializers.IntegerField(source='device.device_id', read_only=True)

    class Meta:
        model = Rule
        fields = '__all__'
        depth = 2


class DeviceSerializer(serializers.ModelSerializer):
    lastUpdated = serializers.SerializerMethodField()
    sensorNum = serializers.SerializerMethodField()

    class Meta:
        model = Device
        fields = [field.name for field in Device._meta.fields] + ['sensorNum', 'lastUpdated']
        depth = 2

    def get_lastUpdated(self, obj):
        measurements = Measurement.objects.filter(sensor__device=obj)

        if measurements.count() == 0:
            return None
        else:
            last = measurements.order_by("-saved_at").values_list("saved_at")[0]
            return last

    def get_sensorNum(self, obj):
        sensors = Sensor.objects.filter(device=obj)
        return sensors.count()


class RoomSerializer(serializers.ModelSerializer):
    floor_number = serializers.IntegerField(source='room.floor.floor_number', read_only=True)
    lastUpdated = serializers.SerializerMethodField()
    isActive = serializers.SerializerMethodField()
    activeDevices = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = [field.name for field in Room._meta.fields] + ['floor_number', 'lastUpdated', 'isActive', 'activeDevices']
        depth=2

    def get_lastUpdated(self, obj):
        measurements = Measurement.objects.filter(sensor__device__room=obj)
        if measurements.count() == 0:
            return None
        else:
            last = measurements.order_by("-saved_at").values_list("saved_at")[0]
            return last

    def get_isActive(self, obj):
        devices = Device.objects.filter(room=obj).values_list("isActive", flat=True)
        return any(devices)

    def get_activeDevices(self, obj):
        devices = Device.objects.filter(room=obj, isActive=True)
        devices_all = Device.objects.filter(room=obj)
        return f"{len(devices)}/{len(devices_all)}"
