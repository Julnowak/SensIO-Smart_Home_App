import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()


from celery.schedules import crontab

app.conf.beat_schedule = {
    'check-rules-every-minute': {
        'task': 'mainApp.tasks.check_and_run_rules',
        'schedule': crontab(),
        'options': {'queue': 'schedule_tasks'}
    },
}
