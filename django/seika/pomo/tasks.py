from celery import shared_task
from django.contrib.auth import get_user_model
# Assuming you have a way to check if the user is currently connected via WS
# This would typically query Redis or a similar fast store
from some_module import is_user_ws_connected
from datetime import datetime, timedelta

User = get_user_model()

@shared_task
def mark_session_inactive_after_delay(user_id):
    print(f"Celery task checking user {user_id} for reconnection...")
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        print(f"User {user_id} not found.")
        return

    if is_user_ws_connected(user_id):
        print(f"User {user_id} reconnected. Session still active.")
        return

    print(f"User {user_id} has not reconnected. Marking session as inactive.")
