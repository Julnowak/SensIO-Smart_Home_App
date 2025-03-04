from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.middleware.csrf import get_token
from django.shortcuts import render

# Create your views here.
from rest_framework import permissions, status
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView

from mainApp.models import AppUser
from mainApp.serializers import UserRegisterSerializer, UserLoginSerializer

UserModel = get_user_model()


def custom_validation(data):
    email = data['email'].strip()
    username = data['username'].strip()
    password = data['password'].strip()

    # if not email or UserModel.objects.filter(email=email).exists():
    #     raise ValidationError('choose another email')
    #
    # if not password or len(password) < 8:
    #     raise ValidationError('choose another password, min 8 characters')
    #
    # if not username:
    #     raise ValidationError('choose another username')
    return data


def validate_email(data):
    email = data['email'].strip()
    if not email:
        raise ValidationError('an email is needed')
    return True


def validate_username(data):
    username = data['username'].strip()
    if not username:
        raise ValidationError('choose another username')
    return True


def validate_password(data):
    password = data['password'].strip()
    if not password:
        raise ValidationError('a password is needed')
    return True


class UserRegister(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        validated_data = custom_validation(request.data)

        if AppUser.objects.filter(username=validated_data['username'].lower()):
            return Response({"error": "Wybrana nazwa użytkownika już istnieje."}, status=status.HTTP_401_UNAUTHORIZED)
        if AppUser.objects.filter(email=validated_data['email']):
            return Response({"error": "Istnieje już konto powiązane z tym adresem email."},status.HTTP_401_UNAUTHORIZED)
        if len(validated_data['password']) < 8:
            return Response({"error": "Hasło powinno mieć minimum 8 znaków."}, status=status.HTTP_401_UNAUTHORIZED)
        if validated_data['password'] != validated_data['confirmPassword']:
            return Response({"error": "Hasła nie są ze sobą zgodne."}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = UserRegisterSerializer(data=validated_data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.create(validated_data)
            user.user_type = validated_data['user_type']
            user.save()

            if user:
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(status.HTTP_400_BAD_REQUEST)


class UserLogin(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        data = request.data
        print(data)

        # Validate email and password
        assert validate_email(data)
        assert validate_password(data)

        serializer = UserLoginSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            user = authenticate(request, email=data['email'], password=data['password'])
            try:
                login(request, user)

                user_data = {
                    'id': user.user_id,
                    'username': user.username,
                    'email': user.email,
                }

                print(user_data)
                return Response(user_data, status=status.HTTP_200_OK)
            except:
                print("adadad")
                return Response({"error": "Wprowadzono nieprawidłowy email lub hasło."}, status=status.HTTP_401_UNAUTHORIZED)


class UserLogout(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out
    authentication_classes = (SessionAuthentication,)  # Use session-based authentication

    def post(self, request):
        logout(request)  # This logs out the user (clears session)Clear the session cookie explicitly
        return Response(status=status.HTTP_200_OK)


class OneUserData(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out
    authentication_classes = (SessionAuthentication, BasicAuthentication,)  # Use session-based authentication

    def get(self, request):
        print(request.user)
        return Response(status=status.HTTP_200_OK)
