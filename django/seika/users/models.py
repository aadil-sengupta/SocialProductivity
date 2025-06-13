from django.db import models
from django.contrib.auth.models import User
from pomo.models import SessionData, CurrentSession
from django.utils import timezone
# from pomo.models import PomoSessionData, PomoSession

# Create your models here.
class UserData(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    isOnline = models.BooleanField(default=True)
    # countUp = models.BooleanField(default=True)

    # Profile
    profilePhoto = models.CharField(max_length=255, blank=True, null=True)
    showOnlineStatus = models.BooleanField(default=True)
    showTimeSpendStudying = models.BooleanField(default=True)

    # Theme
    accentColor = models.CharField(max_length=20, default='#10b981')
    wallpaper = models.CharField(max_length=255, default='leaves.jpg')
    backgroundBlur = models.BooleanField(default=False, help_text="Enable background blur")
    font = models.CharField(max_length=100, default='Arial') # Add font options in the frontend
    darkMode = models.BooleanField(default=True)

    # Timer Settings
    focusDuration = models.IntegerField(default=25, help_text="Focus duration in minutes")
    shortBreakDuration = models.IntegerField(default=5, help_text="Short break duration in minutes")
    longBreakDuration = models.IntegerField(default=15, help_text="Long break duration in minutes")
    longBreakInterval = models.IntegerField(default=4, help_text="Number of pomodoros before a long break")
    pauseIsBreak = models.BooleanField(default=True, help_text="Whether to treat pause as a break")

    # Notification Settings
    desktopNotifications = models.BooleanField(default=True, help_text="Enable desktop notifications")
    playSoundOnNotification = models.BooleanField(default=True, help_text="Play sound on notification")
    breakReminders = models.BooleanField(default=True, help_text="Enable break reminders")
    standUpReminders = models.BooleanField(default=True, help_text="Enable stand up reminders")


    def isWorking(self):
        """
        Check if the user is currently working.
        This can be determined by checking if there are any active CurrentSessions.
        """
        return CurrentSession.objects.filter(user=self.user).exists()
    
    def activeTime(self):
        """
        Calculate the total active time for the user across all sessions.
        This can be determined by summing the durations of all active sessions.
        """
        total_active_time = timezone.timedelta(seconds=0)
        for session in SessionData.objects.filter(user=self.user):
            total_active_time += session.activeTime
        return total_active_time

    def totalTime(self):
        """
        Calculate the total time for the user across all sessions.
        This can be determined by summing the durations of all sessions.
        """
        total_time = timezone.timedelta(seconds=0)
        for session in SessionData.objects.filter(user=self.user):
                total_time += session.totalTime
        return total_time

    def __str__(self):
        return f"UserData for {self.user.username}"