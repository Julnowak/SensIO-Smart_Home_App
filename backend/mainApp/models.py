from django.db import models
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils.crypto import get_random_string

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


class Home(models.Model):
    home_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200)
    address = models.CharField(max_length=500, null=True, blank=True)
    regards = models.TextField(max_length=1000, default=None, null=True, blank=True)
    owner = models.ForeignKey(AppUser, on_delete=models.CASCADE, blank=True, null=True)
    floor_num = models.IntegerField(default=1)
    code = models.CharField(max_length=100, default=get_random_string(length=20))
    created_at = models.DateField()

    def __str__(self):
        return "Dom " + str(self.home_id)


class Device(models.Model):
    device_id = models.AutoField(primary_key=True)
    home = models.ForeignKey(Home, on_delete=models.CASCADE)
    name = models.CharField(max_length=200, default="Czujnik " + str(device_id))
    created_at = models.DateField()

    def __str__(self):
        return "Czujnik " + str(self.device_id)


class Measurement(models.Model):
    measurement_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200, default="Pomiar " + str(measurement_id))
    sensor = models.ForeignKey(Device, on_delete=models.CASCADE)
    value = models.DecimalField(default=0.00, decimal_places=10, max_digits=20)
    # type = models.
    created_at = models.DateField()
    saved_at = models.DateField()

    def __str__(self):
        return "Pomiar " + str(self.measurement_id)

