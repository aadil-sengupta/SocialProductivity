from django.contrib.auth.models import User
from django.utils import timezone
from .models import CurrentSession
from datetime import timedelta




def checkUserConnection(user_id):
    """
    Check if user has reconnected after 2 minutes of disconnection.
    If not, end their active session.
    """
    print(f"Django-Q task checking user {user_id} for reconnection after 2 minutes...")
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        print(f"User {user_id} not found.")
        return

    session = CurrentSession.objects.filter(user=user).first()
    if not session:
        print(f"No active session found for user {user.username}.")
        return

    # Check if user has reconnected
    if session.isConnected:
        print(f"User {user.username} has reconnected. Session remains active.")
        return

    # Verify that at least 2 minutes have passed since disconnection
    if session.lastDisconnected:
        time_since_disconnect = timezone.now() - session.lastDisconnected
        if time_since_disconnect < timedelta(minutes=2):
            print(f"User {user.username} disconnected for {time_since_disconnect}, but less than 2 minutes. Not ending session yet.")
            return

    print(f"User {user.username} has been disconnected for 2+ minutes. Ending session.")
    session.end_session_sync()
    
    