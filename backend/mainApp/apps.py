from django.apps import AppConfig


class MainappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'mainApp'

    def ready(self):
        import mainApp.signals  # Upewnij się, że sygnał się załadował
        # from . import connection  # Start MQTT client when Django starts
