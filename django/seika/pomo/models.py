from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone # Added for timezone.now() and timedelta
import secrets
import string

# Create your models here.

def generate_unique_session_id():
    while True:
        session_id = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
        if not PomoSession.objects.filter(sessionId=session_id).exists():
            return session_id

class PomoSession(models.Model):
    sessionId = models.CharField(max_length=100, unique=True, blank=True) # same as meeting link
    users = models.ManyToManyField(User, related_name='pomo_sessions')
    startTime = models.DateTimeField(auto_now_add=True) # Time the session entry was created
    endTime = models.DateTimeField(null=True, blank=True) # Time the overall session is marked as ended
    isRunning = models.BooleanField(default=True) # True if currently active, False if paused or ended
    totalTime = models.DurationField(
        default=timezone.timedelta(seconds=0), blank=True)
    activeTime = models.DurationField(
        default=timezone.timedelta(seconds=0), blank=True)
    # New fields for pause tracking
    last_pause_start_time = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when the session was last paused."
    )
    accumulated_pause_duration = models.DurationField(
        default=timezone.timedelta(seconds=0),
        help_text="Total accumulated duration of all pauses for this session."
    )

    def save(self, *args, **kwargs):
        if not self.sessionId:
            self.sessionId = generate_unique_session_id()
        super().save(*args, **kwargs)

    def __str__(self):
        user_list = ", ".join(user.username for user in self.users.all())
        
        current_status = "Unknown"
        if self.endTime:
            current_status = "Completed"
        elif self.isRunning:
            current_status = "Running"
        elif self.last_pause_start_time: # Indicates it's currently paused
            current_status = "Paused"
        else: # Not running, no end time, not explicitly paused (could be pending or stopped before first pause)
            current_status = "Stopped/Pending"

        if not user_list:
            return f"Session {self.sessionId} ({current_status}) - No users"
        return f"Session {self.sessionId} ({current_status}) for Users: {user_list}"

    def pause_session(self):
        """Pauses the session if it is currently running."""
        if self.isRunning:
            self.isRunning = False
            self.last_pause_start_time = timezone.now()
            self.save()

    def resume_session(self):
        """Resumes the session if it is paused."""
        if not self.isRunning and self.last_pause_start_time:
            pause_duration = timezone.now() - self.last_pause_start_time
            self.accumulated_pause_duration += pause_duration
            self.last_pause_start_time = None
            self.isRunning = True
            self.save()
        elif not self.isRunning and self.endTime is None: # If it was stopped but not formally paused via last_pause_start_time
            self.isRunning = True # Simply mark as running
            self.save()

    def end_session(self):
        """Ends the session, marking it as completed."""
        if self.isRunning or self.last_pause_start_time:
            if self.last_pause_start_time:
                pause_duration = timezone.now() - self.last_pause_start_time
                self.accumulated_pause_duration += pause_duration
            
            self.endTime = timezone.now()
            self.isRunning = False
            self.totalTime = self.endTime - self.startTime
            self.activeTime = self.totalTime - self.accumulated_pause_duration
            self.save()