import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils import timezone
from datetime import timedelta
from .models import CurrentSession, SessionData
from users.models import UserData
from .serializers import SessionDataSerializer
from .tasks import checkUserConnection
from django_q.models import Schedule
import pytz
class SessionConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()
        self.user = self.scope['user']
        print(f"User connected: {self.user}")
        print(f"User authenticated: {self.user.is_authenticated}")
        if not self.user.is_authenticated:
            print("Anonymous user connected, closing connection.")
            await self.close(code=4100)
            return
        self.userData = await UserData.objects.aget(user=self.user)
        self.userData.isOnline = True
        await self.userData.asave()
        print(f"Connecting user: {self.user}")
        # get today's date

        await self.sendTimeData()

        if not self.user.is_authenticated:
            await self.send(text_data=json.dumps({
                'type': 'anonymous_user',
                'message': 'You must be logged in to start a session.',
            }))
            await self.close()
            return
        
        # Check if user has an existing session and mark as reconnected
        existing_session = await CurrentSession.objects.filter(user=self.user).afirst()
        if existing_session and not existing_session.isConnected:
            existing_session.isConnected = True
            existing_session.lastDisconnected = None  # Clear disconnect timestamp
            await existing_session.asave()
            self.session = existing_session
            print(f"User {self.user} reconnected to existing session {existing_session.id}")
            
            # Send session state to user
            await self.send(text_data=json.dumps({
                'type': 'session_reconnected',
                'phase': existing_session.phase,
                'mode': existing_session.mode,
                'pomodoroCount': existing_session.pomodoroCount,
                'startTime': existing_session.startTime.isoformat(),
                'lastPauseStartTime': existing_session.lastPauseStartTime.isoformat() if existing_session.lastPauseStartTime else None,
                'lastBreakStartTime': existing_session.lastBreakStartTime.isoformat() if existing_session.lastBreakStartTime else None,
                'accumulatedBreakDuration': str(existing_session.accumulatedBreakDuration),
                'accumulatedPauseDuration': str(existing_session.accumulatedPauseDuration),
            }))
        
        print(f"User {self.user} connected to SessionConsumer")

    async def disconnect(self, code):
        print(f"Disconnecting user: {self.user} with code: {code}")
        
        # Update user online status
        if not self.user.is_authenticated:
            print("Anonymous user disconnected, no user data to update.")
            return
        self.userData.isOnline = False
        await self.userData.asave()
        
        # Handle session disconnection if user has an active session
        session = await CurrentSession.objects.filter(user=self.user).afirst()
        if session:
            session.isConnected = False
            session.lastDisconnected = timezone.now()
            await session.asave()

            # Schedule a task to check user connection after 2 minutes
            schedule = await Schedule.objects.acreate(
                func='pomo.tasks.checkUserConnection',
                args=str(self.user.id),  # Convert to string for JSON serialization
                schedule_type=Schedule.ONCE,
                next_run=timezone.now() + timedelta(seconds=120)
            )

            print(f"Scheduled connection check for user {self.user} in 2 minutes (Schedule ID: {schedule.id}).")
        else:
            print(f"No active session found for user {self.user} on disconnect.")



    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('type')
        print(f"Received action: {action} from user: {self.user}")
        if action == 'start_session':
            await self.start_session(data)
        elif action == 'pause_session':
            await self.pause_session(data)
        elif action == 'break_start':
            await self.break_start(data)
        elif action == 'break_end':
            await self.break_end(data)
        elif action == 'resume_session':
            await self.resume_session()
        elif action == 'end_session':
            await self.end_session()

    async def start_session(self, data): #type of session
        # check if user already has an active session
        if await CurrentSession.objects.filter(user=self.user).aexists():
            print(f"User {self.user} already has an active session.")
            await self.send(text_data=json.dumps({
                'type': 'session_exists',
                'message': 'You already have an active session.',
            }))
            return
        self.session = await CurrentSession.objects.acreate(user=self.user, mode=data.get('payload').get('mode'), phase='focus')

        timeZone = self.userData.timeZone
        user_tz = pytz.timezone(timeZone)
        user_now = timezone.now().astimezone(user_tz)
        today = user_now.date()
        yesterday = today - timedelta(days=1)
        
        # Check if user has worked today
        if self.userData.lastWorked and self.userData.lastWorked.date() == today:
            print(f"User {self.user} has already worked today, not incrementing streak.")
        elif self.userData.lastWorked and self.userData.lastWorked.date() == yesterday:
            print(f"User {self.user} worked yesterday, incrementing streak.")
            self.userData.streak += 1
            self.userData.maxStreak = max(self.userData.maxStreak, self.userData.streak)
            self.userData.lastWorked = today
            await self.userData.asave()
        elif not self.userData.lastWorked:
            print(f"User {self.user} is working for the first time, starting streak at 1.")
            self.userData.streak = 1
            self.userData.maxStreak = max(self.userData.maxStreak, self.userData.streak)
            self.userData.lastWorked = today
            await self.userData.asave()
        else:
            print(f"User {self.user} broke their streak, resetting to 1.")
            self.userData.streak = 1
            self.userData.maxStreak = max(self.userData.maxStreak, self.userData.streak)
            self.userData.lastWorked = today
            await self.userData.asave()

        print(f"Starting session for user: {self.user} with mode: {self.session.mode}")
        await self.send(text_data=json.dumps({
            'type': 'session_started',
            'phase': self.session.phase,
            'id': self.session.id,
        }))

    async def break_start(self, data):
        try:
            break_type = data.get('payload').get('break_type', 'shortBreak')  # Default to 'short' if not provided
            await self.session.break_start(break_type)
            await self.send(text_data=json.dumps({
                'type': 'break_started',
                'phase': self.session.phase,
                'id': self.session.id,
            }))
            await self.sendTimeData()
        except CurrentSession.DoesNotExist:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'No active session to start a break.',
            }))

    async def break_end(self, data):
        try:
            await self.session.break_end()
            await self.send(text_data=json.dumps({
                'type': 'break_ended',
                'phase': self.session.phase,
                'id': self.session.id,
            }))
        except CurrentSession.DoesNotExist:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'No active session to end a break.',
            }))

    async def pause_session(self, data):
        try:
            await self.session.pause_session()
            await self.send(text_data=json.dumps({
                'type': 'session_paused',
                'id': self.session.id,
            }))
            
        except CurrentSession.DoesNotExist:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'No active session to pause.',
            }))

    async def resume_session(self):
        try:
            await self.session.resume_session()
            await self.send(text_data=json.dumps({
                'type': 'session_resumed',
                'id': self.session.id,
            }))
        except CurrentSession.DoesNotExist:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'No paused session to resume.',
            }))

    async def end_session(self): # add logic to mark session as inactive and allow users to reconnect
        try:
            await self.session.end_session()
            await self.sendTimeData()
        except CurrentSession.DoesNotExist:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'No active session to end.',
            }))

    
    async def sendTimeData(self):
        
        timeZone = self.userData.timeZone
        user_tz = pytz.timezone(timeZone)
        user_now = timezone.now().astimezone(user_tz)
        today = user_now.date()
        sessions = SessionData.objects.filter(user=self.user, endTime__date=today)
        # calculate total active time today
        total_active_time = timezone.timedelta(seconds=0)
        async for session in sessions.aiterator():
            total_active_time  += session.activeTime
        # get active time today
        await self.send(text_data=json.dumps({
            'type': 'study_time',
            'studyTime': total_active_time.seconds // 60 % 60
        }))
