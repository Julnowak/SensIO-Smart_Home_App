# mainApp/tasks.py
from celery import shared_task
from datetime import datetime, timedelta
from .models import Rule, Measurement

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

                for s in rule.sensors.all():
                    if s.data_type == "LIGHT":
                        if int(rule.value_low) == 1:
                            pass
                        print("dddddddddddddd")
