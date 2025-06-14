import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils import timezone
from datetime import timedelta
from .models import CurrentSession, SessionData
from users.models import UserData
from .serializers import SessionDataSerializer
from .tasks import checkUserConnection
from django_q.models import Schedule
class SessionConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()
        self.user = self.scope['user']
        self.userData = await UserData.objects.aget(user=self.user)
        self.userData.isOnline = True
        await self.userData.asave()
        
        print(f"Connecting user: {self.user}")
        if self.user.is_anonymous:
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
                'id': existing_session.id,
                'mode': existing_session.mode,
                'pomodoroCount': existing_session.pomodoroCount,
            }))
        
        print(f"User {self.user} connected to SessionConsumer")

    async def disconnect(self, code):
        print(f"Disconnecting user: {self.user} with code: {code}")
        
        # Update user online status
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
            # Get the session ID before it's deleted
            session_id = self.session.id
            
            # Use the model's end_session method which handles SessionData creation and deletion
            await self.session.end_session()
            
            # Get the most recent SessionData for this user to return to the client
            session_data = await SessionData.objects.filter(user=self.user).alast()
            
            await self.send(text_data=json.dumps({
                'type': 'session_ended',
                'data': SessionDataSerializer(session_data).data,
                'id': session_id,
            }))
        except CurrentSession.DoesNotExist:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'No active session to end.',
            }))
        