import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils import timezone

class PomoConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()
        
        self.user = self.scope['user']
        print(f"User connected: {self.user}")

            
        