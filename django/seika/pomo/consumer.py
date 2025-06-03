import json
from channels.generic.websocket import AsyncWebsocketConsumer
from pomo.models import PomoSession
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from urllib.parse import parse_qs
from django.utils import timezone



class PomoConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()
        
        # Try to get token authentication first
        if 'query_string' in self.scope and b'token' in parse_qs(self.scope['query_string']):
            try:
                token_key = parse_qs(self.scope['query_string'])[b'token'][0].decode('ascii')
                token = await Token.objects.aget(key=token_key)
                self.user = await User.objects.aget(id=token.user_id)
                self.is_authenticated = True
            except Exception as e:
                # Token authentication failed, fall back to anonymous
                self.user = None
                self.is_authenticated = False
        else:
            # No token provided, use anonymous session
            self.user = None
            self.is_authenticated = False
            
        # Don't close connection for unauthenticated users

    async def disconnect(self, close_code):
        if self.session:
            self.session.isConnected = False
            self.session.lastDisconnected = timezone.now()
            await self.session.asave()
        await self.close()

    async def receive(self, text_data):
        data = json.loads(text_data)
        print(f"Received data: {data}")
        try:
            if data["action"] == 'start':

                self.session = await PomoSession.objects.acreate(user = self.user)
                await self.send(text_data=json.dumps({
                    'type': 'connected',
                    'sessionId': self.session.id,
                    'startTime': self.session.startTime.isoformat(),
                }))
            elif data["action"] == 'connect':
                if not hasattr(self, 'session'):
                    self.session = await PomoSession.objects.aget(id=data["id"])
                # check if user is part of the session
                if self.user != self.session.user:
                    await self.send(text_data=json.dumps({
                        'type': 'error',
                        'message': 'You are not part of this session.'
                    }))
                    return
                # check if session is already connected
                if self.session.isConnected:
                    await self.send(text_data=json.dumps({
                        'type': 'error',
                        'message': 'Session is already connected.'
                    }))
                    return
                
                self.session.isConnected = True
                self.session.lastDisconnected = None
                await self.session.asave()
                await self.send(text_data=json.dumps({
                    'type': 'connected',
                    'sessionId': self.session.id,
                    'startTime': self.session.startTime.isoformat(),
                }))
            elif data["action"] == 'pause':
                await self.session.pause_session()
            elif data["action"] == 'resume':
                await self.session.resume_session()
            await self.send(text_data=json.dumps({
                'type': 'timer',
                'action': data["action"],
                }))
            
        except Exception as e:
            print(f"Error pausing session: {e}")



