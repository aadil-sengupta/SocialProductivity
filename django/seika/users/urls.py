from django.urls import path
#from rest_framework.authtoken.views import obtain_auth_token
from .views import userSettings, loginView, logoutView, signupView # Added import for protected_functional_view

urlpatterns = [
    # path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
    path('settings/', userSettings, name='user_settings'),
    path('login/', loginView, name='login_view'), 
    path('logout/', logoutView, name='logout_view'),  
    path('signup/', signupView, name='signup_view'),
]