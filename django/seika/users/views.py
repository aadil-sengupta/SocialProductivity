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

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def userSettings(request):
    if request.method == 'POST':
        # Handle POST request to update user settings
        userDataModel = UserData.objects.get(user=request.user)
        
        print("Post data:", request.data)
        serializer = UserDataSerializer(userDataModel, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        else:
            return Response(serializer.errors, status=400)
    
    # Handle GET request
    userDataModel = UserData.objects.get(user=request.user)
    if userDataModel:
        serializer = UserDataSerializer(userDataModel)
        return Response(serializer.data)
    
    return Response({"message": "User settings not found."}, status=404)
