import json
from channels.generic.websocket import AsyncWebsocketConsumer
from pomo.models import PomoSession
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from urllib.parse import parse_qs



class PomoConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()
        if 'query_string' not in self.scope:
            await self.close()
            return
        query_string = self.scope['query_string']
        token = await Token.objects.aget(key=parse_qs(query_string)[b'token'][0].decode('ascii'))
        self.user = await User.objects.aget(id=token.user_id)
        if not self.user.is_authenticated:
            await self.close()
            return
        
        self.session = await PomoSession.objects.acreate()
        await self.session.users.aadd(self.user)
        await self.session.asave()
        
        await self.send(text_data=json.dumps({
            'type': 'connected',
            'sessionId': self.session.id,
            'startTime': self.session.startTime.isoformat(),
        }))

    async def disconnect(self, close_code):
        if self.session:
            await self.session.end_session()
        await self.close()

    async def receive(self, text_data):
        data = json.loads(text_data)
        print(f"Received data: {data}")
        try:
            if data["action"] == 'pause':
                await self.session.pause_session()
            elif data["action"] == 'resume':
                await self.session.resume_session()
            await self.send(text_data=json.dumps({
                'type': 'timer',
                'action': data["action"],
                }))
            
        except Exception as e:
            print(f"Error pausing session: {e}")



