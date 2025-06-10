from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone # Added for timezone.now() and timedelta

# def generate_unique_session_id():
#     while True:
#         session_id = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
#         if not PomoSession.objects.filter(sessionId=session_id).exists():
#             return session_id

class CurrentSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='current_sessions')
    mode = models.CharField(max_length=50, default='pomodoro', choices=[
        ('pomodoro', 'Pomodoro'),
        ('free', 'Free'),
    ])
    phase = models.CharField(max_length=50, default='work', choices=[
        ('focus', 'Focus'),
        ('shortBreak', 'Short Break'),
        ('longBreak', 'Long Break'),
        ('free', 'Free'),
        ('paused', 'Paused'),
    ])
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    isRunning = models.BooleanField(default=True)
    isConnected = models.BooleanField(default=True)
    lastDisconnected = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when the session was last disconnected."
    )
    lastBreakStartTime = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when the session was last paused."
    )
    accumulatedBreakDuration = models.DurationField(
        default=timezone.timedelta(seconds=0),
        help_text="Total accumulated duration of all breaks for this session."
    )

    def __str__(self):
        current_status = "Running" if self.is_running else "Paused"
        return f"{current_status} for User: {self.user.username} in {self.mode} mode, phase: {self.phase}"
    
    async def pause_session(self):
        """Pauses the session if it is currently running."""
        if self.isRunning:
            self.isRunning = False
            self.lastBreakStartTime = timezone.now()
            await self.asave()

    async def resume_session(self):
        """Resumes the session if it is currently paused."""
        if not self.isRunning:
            self.isRunning = True
            if self.lastBreakStartTime:
                break_duration = timezone.now() - self.lastBreakStartTime
                self.accumulatedBreakDuration += break_duration
                self.lastBreakStartTime = None
            await self.asave()
    
    async def end_session(self):
        """Ends the session, marking it as completed."""
        if self.isRunning or self.lastBreakStartTime:
            if self.lastBreakStartTime:
                break_duration = timezone.now() - self.lastBreakStartTime
                self.accumulatedBreakDuration += break_duration

            self.endTime = timezone.now()
            self.isRunning = False
            self.totalTime = self.endTime - self.startTime
            self.activeTime = self.totalTime - self.accumulatedBreakDuration
            await self.asave()

class SessionData(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pomo_session_data')
    endTime = models.DateTimeField(auto_now_add=True)
    totalTime = models.DurationField()
    activeTime = models.DurationField(blank=True, null=True) 
    breakTime = models.DurationField()
    startTime = models.DateTimeField() # Time the session started

    def save(self, *args, **kwargs):
        self.activeTime = self.totalTime - self.breakTime
        super().save(*args, **kwargs)


    def __str__(self):
        return f"Session data for {self.user.username} - End Time: {self.endTime}, Total Time: {self.totalTime}, Active Time: {self.activeTime}"
    
    
