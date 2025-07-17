import datetime

from django.db import models
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils.crypto import get_random_string
from django.utils import timezone

# Create your models here.
class AppUserManager(BaseUserManager):
    def create_user(self, email, username, password=None):
        if not email:
            raise ValueError('An email is required.')
        if not password:
            raise ValueError('A password is required.')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, username, password):
        """
        Creates and saves a superuser with the given email and password.
        """
        user = self.create_user(
            email,
            username=username,
            password=password,
        )
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class AppUser(AbstractBaseUser, PermissionsMixin):
    id = models.AutoField(primary_key=True)
    email = models.EmailField(max_length=50, unique=True)
    username = models.CharField(max_length=50)
    telephone = models.CharField(max_length=15,blank=True, null=True)
    address = models.CharField(max_length=200,blank=True, null=True)
    name = models.CharField(max_length=200,blank=True, null=True)
    surname = models.CharField(max_length=200,blank=True, null=True)
    profile_picture = models.ImageField(blank=True, null=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    objects = AppUserManager()

    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    def __str__(self):
        return self.username


from django.db import models
import datetime


class Home(models.Model):
    BUILDING_TYPES = [
        ("residual", "mieszkalne"),
        ("public", "publiczne"),
        ("industrial", "przemysłowe"),
        ("commercial", "komercyjne/handlowo-usługowe"),
    ]

    home_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200)
    address = models.CharField(max_length=500, null=True, blank=True)
    regards = models.TextField(max_length=1000, null=True, blank=True)
    owner = models.ForeignKey('AppUser', on_delete=models.CASCADE, blank=True, null=True)
    floor_num = models.IntegerField(default=1)
    code = models.CharField(max_length=100, default=get_random_string(length=20))
    buildinq_type = models.CharField(
        max_length=20,
        choices=BUILDING_TYPES,
        default="residual"
    )
    year_of_construction = models.IntegerField(default=datetime.date.today().year, null=True, blank=True)
    image = models.ImageField(blank=True, null=True)
    building_area = models.IntegerField(default=0, null=True, blank=True)
    current = models.BooleanField(default=False)
    created_at = models.DateField(default=datetime.date.today)
    isActive = models.BooleanField(default=True)
    lng = models.CharField(max_length=100, null=True, blank=True)
    lat = models.CharField(max_length=100, null=True, blank=True)
    isFavorite = models.BooleanField(default=False)

    def __str__(self):
        return "Dom " + str(self.home_id)


class Floor(models.Model):
    floor_id = models.AutoField(primary_key=True)
    home = models.ForeignKey(Home, on_delete=models.CASCADE)
    floor_number = models.IntegerField()

    def __str__(self):
        return "Piętro " + str(self.floor_id)


class Room(models.Model):
    room_id = models.AutoField(primary_key=True)
    home = models.ForeignKey(Home, on_delete=models.CASCADE)
    floor = models.ForeignKey(Floor, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=200, default="Pokój")
    light = models.BooleanField(default=False)
    warning = models.BooleanField(default=False)
    parent = models.IntegerField(null=True, blank=True)
    position = models.JSONField()
    color = models.CharField(max_length=20, default="#42adf5")
    isFavorite = models.BooleanField(default=False)

    def __str__(self):
        return "Pokój " + str(self.room_id)


class Device(models.Model):
    DATA_TYPES = [
        ("LIGHT", "światło"),
        ("HUMIDITY", "wilgotność"),
        ("CONTINUOUS", "inne ciągłe"),
        ("DISCRETE", "inne dyskretne"),
        ("FUNCTIONAL", "inne funkcyjne"),
        ("OTHER", "inne/różne"),
    ]

    device_id = models.AutoField(primary_key=True)
    owner = models.ForeignKey(AppUser, on_delete=models.CASCADE, blank=True, null=True)
    location = models.ForeignKey(Home, on_delete=models.CASCADE)
    floor = models.ForeignKey(Floor, on_delete=models.CASCADE, blank=True, null=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, blank=True, null=True)
    name = models.CharField(max_length=200)
    serial_number = models.CharField(max_length=200, blank=True, null=True)
    topic = models.CharField(max_length=200, blank=True)
    info = models.TextField(max_length=1000, blank=True, null=True)
    brand = models.CharField(max_length=200, blank=True, null=True)
    isActive = models.BooleanField(default=True)
    color = models.CharField(max_length=20, default="#42adf5")
    data_type = models.CharField(max_length=20, choices=DATA_TYPES, default="CONTINUOUS", blank=True, null=True)
    isFavorite = models.BooleanField(default=False)
    isConfigured = models.BooleanField(default=False)

    def __str__(self):
        return "Urządzenie " + str(self.device_id)

    def save(self, *args, **kwargs):
        if not self.topic:  # Only generate topic if it's not set
            components = [
                str(self.serial_number) if self.serial_number else '',
                str(self.location) if self.location else '',
                str(self.owner) if self.owner else '',
                str(self.device_id) if self.device_id else ''
            ]
            self.topic = "_".join(filter(None, components))  # Join non-empty components

        super().save(*args, **kwargs)


class Sensor(models.Model):
    DATA_TYPES = [
        ("LIGHT", "światło"),
        ("HUMIDITY", "wilgotność"),
        ("CONTINUOUS", "inne ciągłe"),
        ("DISCRETE", "inne dyskretne"),
        ("FUNCTIONAL", "inne funkcyjne"),
        ("OTHER", "inne/różne"),
    ]
    sensor_id = models.AutoField(primary_key=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, blank=True, null=True)
    name = models.CharField(max_length=200)
    visibleName = models.CharField(max_length=200, blank=True)
    serial_number = models.CharField(max_length=200, blank=True, null=True)
    device = models.ForeignKey(Device, on_delete=models.CASCADE)
    data_type = models.CharField(max_length=20, choices=DATA_TYPES, default="CONTINUOUS")
    unit = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return "Czujnik " + str(self.sensor_id)

    def save(self, *args, **kwargs):
        if not self.visibleName:  # Only generate topic if it's not set
            self.topic = str(self.name) if self.serial_number else ''

        super().save(*args, **kwargs)

class Measurement(models.Model):
    measurement_id = models.AutoField(primary_key=True)
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)
    value = models.DecimalField(default=0.00, decimal_places=10, max_digits=20)
    created_at = models.DateTimeField()
    saved_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return "Pomiar " + str(self.measurement_id)


class Action(models.Model):
    ACTION_TYPES = [
        ("AUTO", "automatycznie"),
        ("MANUAL", "ręcznie"),
    ]

    STATUS_TYPES = [
        ("1", "krytyczny"),
        ("2", "ostrzeżenie"),
        ("3", "informacja"),
        ("4", "inne"),
    ]

    action_id = models.AutoField(primary_key=True)
    description = models.CharField(max_length=1000)
    device = models.ForeignKey(Device, on_delete=models.CASCADE)
    measurement = models.ForeignKey(Measurement, on_delete=models.CASCADE, blank=True, null=True)
    type = models.CharField(max_length=20, choices=ACTION_TYPES, default="AUTO")
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_TYPES, default="3")
    priority = models.IntegerField(default=1)

    def __str__(self):
        return "Akcja " + str(self.action_id)


class Notification(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE)
    title = models.CharField(max_length=300)
    isRead = models.BooleanField(default=False)
    message = models.CharField(max_length=1000)
    time_triggered = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Powiadomienie ID-{self.id}: {self.title}"