from django.db import models
from django.contrib.auth.models import User
from pomo.models import SessionData, CurrentSession
from django.utils import timezone
# from pomo.models import PomoSessionData, PomoSession

# Create your models here.
class UserData(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    wallpaper = models.CharField(max_length=255, blank=True, null=True)
    countUp = models.BooleanField(default=True)
    font = models.CharField(max_length=100, default='Arial')
    accentColor = models.CharField(max_length=20, default='pink')
    darkMode = models.BooleanField(default=True)

    # def isStudying(self):
    #     """
    #     Check if the user is currently studying.
    #     This can be determined by checking if there are any active PomoSessions.
    #     """
    #     return PomoSession.objects.filter(user=self.user, isRunning=True).exists()
    
    # def activeTime(self):
    #     """
    #     Calculate the total active time for the user across all PomoSessions.
    #     This can be determined by summing the durations of all active sessions.
    #     """
    #     total_active_time = timezone.timedelta(seconds=0)
    #     for session in PomoSessionData.objects.filter(user=self.user):
    #         total_active_time += session.activeTime
    #     return total_active_time

    # def totalTime(self):
    #     """
    #     Calculate the total time for the user across all PomoSessions.
    #     This can be determined by summing the durations of all sessions.
    #     """
    #     total_time = timezone.timedelta(seconds=0)
    #     for session in PomoSession.objects.filter(user=self.user):
    #             total_time += session.endTime
    #     return total_time

    # def __str__(self):
    #     return f"UserData for {self.user.username}"