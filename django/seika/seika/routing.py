from django.urls import re_path
from pomo.consumer import SessionConsumer

websocket_urlpatterns = [
    re_path('ws/session/', SessionConsumer.as_asgi()),
]