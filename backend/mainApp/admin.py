from django.contrib import admin
from .models import AppUser, Measurement, Home, Device
# Register your models here.
admin.site.register(AppUser)
admin.site.register(Device)
admin.site.register(Measurement)
admin.site.register(Home)
