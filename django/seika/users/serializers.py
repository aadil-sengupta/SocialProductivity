from .models import UserData
from rest_framework import serializers

class UserDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserData
        fields = '__all__'
        read_only_fields = ['id', 'user']  # Assuming 'user' is a foreign key to the User model