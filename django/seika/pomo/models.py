from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone # Added for timezone.now() and timedelta
import pytz # Added for timezone handling

# def generate_unique_session_id():
#     while True:
#         session_id = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
#         if not PomoSession.objects.filter(sessionId=session_id).exists():
#             return session_id

class CurrentSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='current_sessions')
    mode = models.CharField(max_length=50, default='pomodoro',null=True, blank=True, choices=[
        ('pomodoro', 'Pomodoro'),
        ('free', 'Free'),
    ])
    phase = models.CharField(max_length=50, blank=True, null=True, choices=[
        ('focus', 'Focus'),
        ('shortBreak', 'Short Break'),
        ('longBreak', 'Long Break'),
        ('free', 'Free'),
        ('paused', 'Paused'),
    ])
    pomodoroCount = models.IntegerField(default=0)
    startTime = models.DateTimeField(auto_now_add=True)
    isConnected = models.BooleanField(default=True)
    lastDisconnected = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when the session was last disconnected."
    )
    lastBreakStartTime = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when the session was last Break-ed."
    )
    accumulatedBreakDuration = models.DurationField(
        default=timezone.timedelta(seconds=0),
        help_text="Total accumulated duration of all breaks for this session."
    )
    lastPauseStartTime = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when the session was last paused."
    )
    accumulatedPauseDuration = models.DurationField(
        default=timezone.timedelta(seconds=0),
        help_text="Total accumulated duration of all pauses for this session."
    )

    # def save(self, *args, **kwargs):
    #     if self.mode == 'pomodoro':
    #         self.phase = 'focus'
    #     elif self.mode == 'free':
    #         self.phase = 'free'
    #     super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} in {self.mode} mode, phase: {self.phase}"
    
    async def pause_session(self):
        """Pauses the session if it is currently running."""
        if self.lastBreakStartTime:
            break_duration = timezone.now() - self.lastBreakStartTime
            self.accumulatedBreakDuration += break_duration
            self.lastBreakStartTime = None
        self.lastPauseStartTime = timezone.now()
        await self.asave()

    async def resume_session(self):
        """Resumes the session if it is currently paused."""
        if self.lastPauseStartTime:
            pause_duration = timezone.now() - self.lastPauseStartTime
            self.accumulatedPauseDuration += pause_duration
            self.lastPauseStartTime = None
        await self.asave()
    
    async def break_start(self, break_type):
        """Starts a break for the session."""
        self.lastBreakStartTime = timezone.now()
        if self.lastPauseStartTime:
            pause_duration = timezone.now() - self.lastPauseStartTime
            self.accumulatedPauseDuration += pause_duration
            self.lastPauseStartTime = None
        print(f"Starting break of type: {break_type} for user: {self.user.username}")
        if break_type == 'shortBreak':
            self.phase = 'shortBreak'
        elif break_type == 'longBreak':
            self.phase = 'longBreak'
        await self.asave()
    
    async def break_end(self):
        """Ends the break for the session, updating the accumulated break duration."""
        if self.lastBreakStartTime:
            break_duration = timezone.now() - self.lastBreakStartTime
            self.accumulatedBreakDuration += break_duration
            self.lastBreakStartTime = None
            self.phase = 'focus'
        await self.asave()

    async def end_session(self):
        """Ends the session, creates a SessionData record, and deletes the current session."""
        
        # Calculate final durations
        if self.lastBreakStartTime:
            break_duration = timezone.now() - self.lastBreakStartTime
            self.accumulatedBreakDuration += break_duration
            self.lastBreakStartTime = None
        
        if self.lastPauseStartTime:
            pause_duration = timezone.now() - self.lastPauseStartTime
            self.accumulatedPauseDuration += pause_duration
            self.lastPauseStartTime = None
        
        await self.asave()

        end_time = timezone.now()
        total_time = end_time - self.startTime
        active_time = total_time - self.accumulatedBreakDuration - self.accumulatedPauseDuration
        
        # Create SessionData record with the completed session data
        await SessionData.objects.acreate(
            user=self.user,
            endTime=end_time,
            totalTime=total_time,
            activeTime=active_time,
            breakTime=self.accumulatedBreakDuration,
            pauseTime=self.accumulatedPauseDuration,
            startTime=self.startTime
        )
        
        # Get UserData using get_model to avoid circular import
        from django.apps import apps
        UserData = apps.get_model('users', 'UserData')
        
        try:
            userData = await UserData.objects.aget(user=self.user)
            timeZone = userData.timeZone
            user_tz = pytz.timezone(timeZone)
            user_now = timezone.now().astimezone(user_tz)
            today = user_now.date()

            userData.lastWorked = today
            await userData.addExpTime(active_time)
        except UserData.DoesNotExist:
            print(f"UserData not found for user {self.user.username}")

        print(f"Session ended for user {self.user.username}. Duration: {total_time}, Active: {active_time}")
        
        # Delete the current session
        await self.adelete()

    def end_session_sync(self):
        """Ends the session, creates a SessionData record, and deletes the current session."""
        
        # Calculate final durations
        if self.lastBreakStartTime:
            break_duration = timezone.now() - self.lastBreakStartTime
            self.accumulatedBreakDuration += break_duration
            self.lastBreakStartTime = None
        
        if self.lastPauseStartTime:
            pause_duration = timezone.now() - self.lastPauseStartTime
            self.accumulatedPauseDuration += pause_duration
            self.lastPauseStartTime = None
        
        end_time = timezone.now()
        total_time = end_time - self.startTime
        active_time = total_time - self.accumulatedBreakDuration - self.accumulatedPauseDuration
        
        # Create SessionData record with the completed session data
        SessionData.objects.create(
            user=self.user,
            endTime=end_time,
            totalTime=total_time,
            activeTime=active_time,
            breakTime=self.accumulatedBreakDuration,
            pauseTime=self.accumulatedPauseDuration,
            startTime=self.startTime
        )
                # Get UserData using get_model to avoid circular import
        from django.apps import apps
        UserData = apps.get_model('users', 'UserData')
        
        try:
            userData = UserData.objects.get(user=self.user)
            timeZone = userData.timeZone
            user_tz = pytz.timezone(timeZone)
            user_now = timezone.now().astimezone(user_tz)
            today = user_now.date()

            userData.lastWorked = today
            userData.addExpTime_sync(active_time)
        except UserData.DoesNotExist:
            print(f"UserData not found for user {self.user.username}")

        print(f"Session ended for user {self.user.username}. Duration: {total_time}, Active: {active_time}")
        
        print(f"Session ended for user {self.user.username}. Duration: {total_time}, Active: {active_time}")
        
        # Delete the current session
        self.delete()

class SessionData(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pomo_session_data')
    endTime = models.DateTimeField(auto_now_add=True)
    totalTime = models.DurationField()
    activeTime = models.DurationField(blank=True, null=True) 
    breakTime = models.DurationField()
    pauseTime = models.DurationField() # Total time spent in pause
    startTime = models.DateTimeField() # Time the session started

    def save(self, *args, **kwargs):
        self.activeTime = self.totalTime - self.breakTime
        super().save(*args, **kwargs)


    def __str__(self):
        return f"Session data for {self.user.username} - End Time: {self.endTime}, Total Time: {self.totalTime}, Active Time: {self.activeTime}"
    
    
