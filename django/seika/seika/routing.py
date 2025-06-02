from django.urls import re_path
from pomo.consumer import PomoConsumer

websocket_urlpatterns = [
    re_path('ws/pomo/', PomoConsumer.as_asgi()),
]
