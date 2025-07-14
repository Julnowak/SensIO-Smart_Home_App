from django.core.exceptions import ValidationError
from rest_framework import serializers

# from django.contrib.auth.models import User
from django.contrib.auth import authenticate, get_user_model

from mainApp.models import Home, Device, Room, Notification, Action, Floor

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

    class Meta:
        model = Home
        fields = [field.name for field in Home._meta.fields] + ['devicesCount', 'floors']
        depth = 2

    def get_devicesCount(self, obj):
        rooms = Room.objects.filter(home=obj)
        return Device.objects.filter(room__in=rooms).count()

    def get_floors(self, obj):
        f = Floor.objects.filter(home=obj)
        floors = FloorSerializer(f, many=True).data
        return floors


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


class ActionSerializer(serializers.ModelSerializer):
    # device_id = serializers.IntegerField(source='device.device_id', read_only=True)

    class Meta:
        model = Action
        fields = '__all__'
        depth = 4


class DeviceSerializer(serializers.ModelSerializer):
    room = serializers.CharField(source='room.name', read_only=True)
    room_id = serializers.IntegerField(source='room.room_id', read_only=True)
    color = serializers.CharField(source='room.color', read_only=True)

    class Meta:
        model = Device
        fields = [field.name for field in Device._meta.fields] + ['room', 'room_id', "color"]


class RoomSerializer(serializers.ModelSerializer):
    floor_number = serializers.IntegerField(source='room.floor.floor_number', read_only=True)

    class Meta:
        model = Room
        fields = [field.name for field in Room._meta.fields] + ['floor_number']
