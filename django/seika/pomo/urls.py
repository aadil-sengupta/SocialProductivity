from django.urls import path
from pomo.views import timerView


urlpatterns = [
    path('timer/', timerView, name='timerView'),

]