from django.urls import path
from emergencies.consumers import AlertsConsumer, ChatConsumer

websocket_urlpatterns = [
    # Alerts WebSocket connection
    # This will route WebSocket requests to the AlertsConsumer
    # The URL path 'ws/alerts/' will be handled by AlertsConsumer
    # The as_asgi() method is used to convert the consumer into an ASGI application
	path('ws/alerts/', AlertsConsumer.as_asgi()),
    # Chat WebSocket connection
    # This will route WebSocket requests to the ChatConsumer
    # The URL path 'ws/chat/' will be handled by ChatConsumer
    # The as_asgi() method is used to convert the consumer into an ASGI application
    # This allows the consumer to handle WebSocket connections and process messages sent over the WebSocket
    path('ws/chat/', ChatConsumer.as_asgi()),
]