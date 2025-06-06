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
    # get user model - Django automatically sets request.user from the token
    if request.method == 'POST':
        # Handle POST request to update user settings
        userDataModel = UserData.objects.filter(user=request.user).first()
        
        if userDataModel:
            # Update existing user settings
            serializer = UserDataSerializer(userDataModel, data=request.data, context={'request': request})
        else:
            # Create new user settings if none exist
            serializer = UserDataSerializer(data=request.data, context={'request': request})
        
        print("Post data:", request.data)
        if serializer.is_valid():
            if userDataModel:
                # Update existing record
                serializer.save()
            else:
                # Create new record
                serializer.save(user=request.user)
            return Response(serializer.data, status=200)
        else:
            return Response(serializer.errors, status=400)
    
    # Handle GET request
    userDataModel = UserData.objects.filter(user=request.user).first()
    if userDataModel:
        serializer = UserDataSerializer(userDataModel)
        return Response(serializer.data)
    
    return Response({"message": "User settings not found."}, status=404)
