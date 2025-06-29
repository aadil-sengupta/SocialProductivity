from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .models import UserData
from pomo.models import SessionData
from django.contrib.auth.models import User
from .serializers import UserDataSerializer
from django.db.models import Sum
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logoutView(request):
    # Logout user and invalidate token
    request.user.auth_token.delete()
    return Response({"message": "Logged out successfully."}, status=200)

@api_view(['POST'])
def signupView(request):
    # Handle user signup
    data = request.data
    fullName = data.get('fullName')
    email = data.get('email')
    password = data.get('password')

    if not fullName or not email or not password:
        return Response({"error": "Full Name, email, and password are required."}, status=400)
    
    try:
        user = User.objects.create_user(username=email, first_name=fullName, email=email, password=password)
        userDataModel = UserData.objects.create(user=user)
        
        token, created = Token.objects.get_or_create(user=user)
        if created:
            print("New token created for user:", user.username)
        else:
            print("Existing token retrieved for user:", user.username)

        
        # Serialize user data
        serializer = UserDataSerializer(userDataModel)
        
        return Response({'user': serializer.data, 'token': token.key}, status=201)
    
    except Exception as e:
        return Response({"error": str(e)}, status=400)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profileView(request):
    # Get user ID from query parameters for viewing other profiles, default to current user
    user_id = request.GET.get('id', None)
    
    if user_id:
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=404)
    else:
        user = request.user
    
    try:
        # Get UserData for the user
        userData = UserData.objects.get(user=user)
        
        # Get session statistics
        sessions = SessionData.objects.filter(user=user)
        totalSessions = sessions.count()
        
        
        totalActiveTime = sessions.aggregate(total=Sum('activeTime'))['total']
        
        totalActiveTimeMinutes = int(totalActiveTime.total_seconds() / 60) if totalActiveTime else 0
        
        # Serialize user data
        serializer = UserDataSerializer(userData)
        
        # Calculate next level experience requirement
        level = userData.level
        nextLevelExp = int(50 * (1.2 ** level))
        
        return Response({
            "userData": serializer.data,
            "totalSessions": totalSessions,
            "totalActiveTime": totalActiveTimeMinutes,
            "nextLevelExp": nextLevelExp
        }, status=200)
        
    except UserData.DoesNotExist:
        return Response({"error": "User profile not found."}, status=404)