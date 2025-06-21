from .models import UserData
from rest_framework import serializers
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'last_login', 'is_active']
        read_only_fields = ['id', 'date_joined', 'last_login']

class UserDataSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  # Nested serializer for user data
    
    class Meta:
        model = UserData
        fields = '__all__'
        read_only_fields = ['id', 'user']  # Keep user as read-only since it's a foreign key