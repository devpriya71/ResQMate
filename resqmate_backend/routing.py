from django.urls import path
from emergencies.consumers import AlertsConsumer, ChatConsumer

websocket_urlpatterns = [
	path('ws/alerts/', AlertsConsumer.as_asgi()),
    path('ws/chat/', ChatConsumer.as_asgi()),
]