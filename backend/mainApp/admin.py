from django.contrib import admin
from .models import AppUser, Measurement, Home, Device, Room, Floor

# Register your models here.
admin.site.register(AppUser)
admin.site.register(Device)
admin.site.register(Measurement)
admin.site.register(Home)
admin.site.register(Room)
admin.site.register(Floor)
