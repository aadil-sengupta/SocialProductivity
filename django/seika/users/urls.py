from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from .views import protected_functional_view, userSettings # Added import for protected_functional_view

urlpatterns = [
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
    path('protected-functional/', protected_functional_view, name='protected_functional_view'),
    path('settings/', userSettings, name='user_settings'),
]