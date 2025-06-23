from django.contrib.auth.models import AnonymousUser
from rest_framework.authtoken.models import Token
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
import logging

logger = logging.getLogger(__name__)

@database_sync_to_async
def get_user(token_key):
    try:
        token = Token.objects.get(key=token_key)
        logger.info(f"Token authentication successful for user: {token.user}")
        return token.user
    except Token.DoesNotExist:
        logger.warning(f"Invalid token provided: {token_key}")
        return AnonymousUser()

class TokenAuthMiddleware(BaseMiddleware):
    def __init__(self, inner):
        super().__init__(inner)

    async def __call__(self, scope, receive, send):
        # Parse query string to get token
        token_key = None
        try:
            query_string = scope.get('query_string', b'').decode()
            logger.debug(f"Query string: {query_string}")
            
            if query_string:
                query_params = dict(x.split('=') for x in query_string.split("&") if '=' in x)
                token_key = query_params.get('token')
                logger.debug(f"Extracted token: {token_key}")
        except (ValueError, AttributeError) as e:
            logger.error(f"Error parsing query string: {e}")
            token_key = None
        
        # Get user based on token
        if token_key:
            scope['user'] = await get_user(token_key)
        else:
            logger.info("No token provided, using AnonymousUser")
            scope['user'] = AnonymousUser()
        
        logger.info(f"User authenticated as: {scope['user']}, is_authenticated: {scope['user'].is_authenticated}")
        return await super().__call__(scope, receive, send)