import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils import timezone
from .models import CurrentSession

class SessionConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()
        self.user = self.scope['user']
        if self.user.is_anonymous:
            await self.close()
            return
        print(f"User {self.user} connected to SessionConsumer")

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')
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
            await self.resume_session(data)
        elif action == 'end_session':
            await self.end_session(data)

    async def start_session(self, data): #type of session
        existingSession = CurrentSession.objects.filter(user=self.user, isRunning=True)
        if existingSession:
            await self.send(text_data=json.dumps({
                'type': 'session_exists',
                'message': 'You already have an active session.',
            }))
            return
        self.session = await CurrentSession.objects.acreate(user=self.user, mode=data.get('mode'))
        await self.send(text_data=json.dumps({
            'type': 'session_started',
            'phase': self.session.phase,
            'id': self.session.id,
        }))

    async def break_start(self, data):
        try:
            break_type = data.get('break_type', 'shortBreak')  # Default to 'short' if not provided
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
            await self.session.end_session()
            await self.send(text_data=json.dumps({
                'type': 'session_ended',
                'id': self.session.id,
            }))
        except CurrentSession.DoesNotExist:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'No active session to end.',
            }))