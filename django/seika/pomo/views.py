from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from pomo.models import CurrentSession


def timerView(request):
    return render(request, 'testTimer.html')


#api view
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def existingSessions(request):
    request.user
    sessions = CurrentSession.objects.filter(users=request.user)
    if sessions:
        return Response({
            "message": "Existing sessions found",
            "sessions": [session.sessionId for session in sessions]
        })
    return Response({"message": "Existing sessions API"})