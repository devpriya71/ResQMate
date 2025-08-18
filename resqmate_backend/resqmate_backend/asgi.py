"""
ASGI config for resqmate_backend project.

This config wires Django HTTP handling and Channels WebSocket routing.
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'resqmate_backend.settings')

# Django's ASGI application to handle traditional HTTP requests
django_asgi_app = get_asgi_application()

# Import websocket URL patterns from project routing
from routing import websocket_urlpatterns

# Combined ASGI application
application = ProtocolTypeRouter({
	"http": django_asgi_app,
	"websocket": URLRouter(websocket_urlpatterns),
})
