"""
ASGI config for sports_reservation_backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from channels.security.websocket import AllowedHostsOriginValidator
from channels.auth import AuthMiddlewareStack
import reservations.routing # Import your app's routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sports_reservation_backend.settings')

# Initialize Django ASGI application early to ensure apps are populated
# and models are loaded.
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    # Django's ASGI application to handle traditional HTTP requests
    "http": django_asgi_app,

    # WebSocket chat handler
    "websocket": AllowedHostsOriginValidator( # Optional: Add security
        AuthMiddlewareStack( # Optional: If you need user auth in WebSocket
            URLRouter(
                reservations.routing.websocket_urlpatterns
            )
        )
    ),
})
