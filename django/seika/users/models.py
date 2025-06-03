from django.db import models
from django.contrib.auth.models import User
from pomo.models import PomoSession
from django.utils import timezone

# Create your models here.
class UserData(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    

    def isStudying(self):
        """
        Check if the user is currently studying.
        This can be determined by checking if there are any active PomoSessions.
        """
        for session in self.sessions.all():
            if session.isRunning:
                return True
        return False
    
    def activeTime(self):
        """
        Calculate the total active time for the user across all PomoSessions.
        This can be determined by summing the durations of all active sessions.
        """
        total_active_time = 0
        for session in self.sessions.all():
            if session.isRunning:
                total_active_time += (timezone.now() - session.startTime).total_seconds()
            elif session.endTime:
                total_active_time += (session.endTime - session.startTime).total_seconds()
        return total_active_time

    def totalTime(self):
        """
        Calculate the total time for the user across all PomoSessions.
        This can be determined by summing the durations of all sessions.
        """
        total_time = 0
        for session in self.sessions.all():
            if session.endTime:
                total_time += (session.endTime - session.startTime).total_seconds()
        return total_time