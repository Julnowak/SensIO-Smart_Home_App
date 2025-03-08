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
from rest_framework_simplejwt.tokens import RefreshToken

from mainApp.models import AppUser, Home
from mainApp.serializers import UserRegisterSerializer, UserLoginSerializer, HomeSerializer

UserModel = get_user_model()


class UserRegister(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        validated_data = request.data

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
    permission_classes = [permissions.AllowAny,]  # Allow any user to access this view

    def post(self, request):
        email = request.data.get("username")
        password = request.data.get("password")

        print(request.data)

        # Ensure both fields are present
        if not email or not password:
            return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate the user
        user = authenticate(request, email=email, password=password)

        if user is None:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })


class UserLogout(APIView):
    def post(self, request):
        return Response(status=status.HTTP_200_OK)


class OneUserData(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can log out

    def get(self, request):
        print(request.user)
        return Response(status=status.HTTP_200_OK)


class UserHomesData(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        homes = Home.objects.filter(owner=request.user)
        serializer = HomeSerializer(homes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class HomeData(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, home_id):
        home = Home.objects.get(home_id=home_id)
        serializer = HomeSerializer(home)
        return Response(serializer.data, status=status.HTTP_200_OK)
