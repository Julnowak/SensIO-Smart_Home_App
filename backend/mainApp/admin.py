from django.contrib import admin
from .models import AppUser, Measurement, Home, Sensor

# Register your models here.
admin.site.register(AppUser)
admin.site.register(Sensor)
admin.site.register(Measurement)
admin.site.register(Home)
