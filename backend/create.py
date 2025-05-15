from django.core.management.base import BaseCommand
from django.utils import timezone
from faker import Faker
from mainApp.models import Notification, AppUser  # Zmień 'your_app' na nazwę Twojej aplikacji
import random

help = 'Generuje 20 przykładowych powiadomień dla losowych użytkowników'

fake = Faker('pl_PL')  # Polski generator danych
user = AppUser.objects.get(username="julia")
notifications = []
for _ in range(20):
    random_user = user
    random_days_ago = random.randint(0, 30)
    random_hours_ago = random.randint(0, 23)
    notifications.append(Notification(
        user=random_user,
        title=fake.sentence(nb_words=6),
        message=fake.paragraph(nb_sentences=3),
        isRead=random.choice([True, False]),
        time_triggered=timezone.now() - timezone.timedelta(days=random_days_ago, hours=random_hours_ago)
    ))
Notification.objects.bulk_create(notifications)