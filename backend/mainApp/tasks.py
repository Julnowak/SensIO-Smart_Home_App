# mainApp/tasks.py
from celery import shared_task
from datetime import datetime, timedelta
from .models import Rule, Measurement, Action

from celery import shared_task
from django.utils import timezone
from .models import Rule


@shared_task
def check_and_run_rules():
    now = timezone.localtime()  # Czas lokalny z uwzględnieniem TIME_ZONE
    now_hour = now.hour
    now_minute = now.minute
    now_total_minutes = now_hour * 60 + now_minute

    print(f"[Celery] Lokalny czas: {now.strftime('%H:%M')}")

    rules = Rule.objects.filter(isActive=True)

    for rule in rules:
        rule_time = rule.start_date
        rule_time_local = timezone.localtime(rule_time)
        rule_total_minutes = rule_time_local.hour * 60 + rule_time_local.minute

        if abs(now_total_minutes - rule_total_minutes) <= 1:
            print(f"[Celery] Uruchamiam regułę: {rule.name} o {rule_time_local.strftime('%H:%M')}")

            print(rule.type)
            if rule.type == "ON/OFF":
                for d in rule.devices.all():
                    if int(rule.value_low) == 1:
                        d.isActive = True
                    else:
                        d.isActive = False
                    d.save()

                    if int(rule.value_low) == 1:
                        Action.objects.create(
                            device_id=d.device_id,
                            description=f"Włączono urządzenie",
                            type="AUTO"
                        )
                    else:
                        Action.objects.create(
                            device_id=d.device_id,
                            description=f"Wyłączono urządzenie",
                            type="AUTO"
                        )

            elif rule.type == "SET":
                for s in rule.sensors.all():
                    if s.data_type == "LIGHT":
                        measurement = Measurement.objects.create(
                            value=int(rule.value_low),
                            saved_at=datetime.now(),
                            created_at=datetime.now(),
                            sensor=s
                        )
                        Action.objects.create(
                            measurement=measurement,
                            device_id=s.device.device_id,
                            description=f"Zmiana stanu światła na {int(rule.value_low)}.",
                            status=measurement.warning,
                            type="AUTO"
                        )
                        if s.room:
                            s.room.light = int(rule.value_low)
                        s.save()