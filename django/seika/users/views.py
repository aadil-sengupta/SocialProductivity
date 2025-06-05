from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import UserData
from .serializers import UserDataSerializer
# Create your views here.

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_functional_view(request):
    return Response({"message": "Hello, authenticated user! This is a protected function-based view."})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def userSettings(request):
    # get user model - Django automatically sets request.user from the token
    
    userDataModel = UserData.objects.filter(user=request.user).first()

    if userDataModel:
        serializer = UserDataSerializer(userDataModel)
        return Response(serializer.data)
    return Response({"message": "User settings not found."}, status=404)
