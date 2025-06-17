from django.db import models
from django.contrib.auth.models import User
from pomo.models import SessionData, CurrentSession
from django.utils import timezone

# Create your models here.
class FriendRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
    ]
    
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_requests')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_requests')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('sender', 'receiver')
    
    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username} ({self.status})"

class UserData(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    friends = models.ManyToManyField(User, related_name='friend_of', blank=True)
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
    
    def send_friend_request(self, to_user):
        """Send a friend request to another user"""
        if to_user == self.user:
            return False, "Cannot send friend request to yourself"
        
        if self.is_friend(to_user):
            return False, "Already friends"
        
        request, created = FriendRequest.objects.get_or_create(
            sender=self.user,
            receiver=to_user,
            defaults={'status': FriendRequest.PENDING}
        )
        
        if not created and request.status == FriendRequest.DECLINED:
            request.status = FriendRequest.PENDING
            request.save()
            return True, "Friend request sent"
        elif not created:
            return False, "Friend request already exists"
        
        return True, "Friend request sent"
    
    def accept_friend_request(self, from_user):
        """Accept a friend request"""
        try:
            request = FriendRequest.objects.get(
                sender=from_user,
                receiver=self.user,
                status=FriendRequest.PENDING
            )
            request.status = FriendRequest.ACCEPTED
            request.save()
            
            # Add each other as friends
            self.friends.add(from_user)
            from_user.userdata.friends.add(self.user)
            
            return True, "Friend request accepted"
        except FriendRequest.DoesNotExist:
            return False, "Friend request not found"
    
    def decline_friend_request(self, from_user):
        """Decline a friend request"""
        try:
            request = FriendRequest.objects.get(
                sender=from_user,
                receiver=self.user,
                status=FriendRequest.PENDING
            )
            request.status = FriendRequest.DECLINED
            request.save()
            return True, "Friend request declined"
        except FriendRequest.DoesNotExist:
            return False, "Friend request not found"
    
    def remove_friend(self, friend_user):
        """Remove a friend"""
        if self.is_friend(friend_user):
            self.friends.remove(friend_user)
            friend_user.userdata.friends.remove(self.user)
            return True, "Friend removed"
        return False, "Not friends"
    
    def is_friend(self, user):
        """Check if user is a friend"""
        return self.friends.filter(id=user.id).exists()
    
    def get_pending_requests(self):
        """Get pending friend requests received"""
        return FriendRequest.objects.filter(
            receiver=self.user,
            status=FriendRequest.PENDING
        )
    
    def get_sent_requests(self):
        """Get pending friend requests sent"""
        return FriendRequest.objects.filter(
            sender=self.user,
            status=FriendRequest.PENDING
        )

