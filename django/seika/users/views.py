from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .models import UserData
from django.contrib.auth.models import User
from .serializers import UserDataSerializer
# Create your views here.

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

@api_view(['POST'])
def loginView(request):
    # verify and generate token
    data = request.data
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return Response({"error": "Email and password are required."}, status=400)
    
    try:
        user = User.objects.get(email=email)
        if user.check_password(password):
            # Get or create token for the user
            token, created = Token.objects.get_or_create(user=user)
            
            if created:
                print("New token created for user:", user.username)
            else:
                print("Existing token retrieved for user:", user.username)
            
            # Get user data (create if doesn't exist)
            try:
                userDataModel = UserData.objects.get(user=user)
            except UserData.DoesNotExist:
                # Create UserData if it doesn't exist
                userDataModel = UserData.objects.create(user=user)
                print("Created new UserData for user:", user.username)
            
            # Serialize user data
            serializer = UserDataSerializer(userDataModel)
            
            return Response({
                "token": token.key, 
                "user": serializer.data
            }, status=200)
        else:
            return Response({"error": "Invalid credentials."}, status=401)
    
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)


