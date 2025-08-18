import json
from channels.generic.websocket import AsyncWebsocketConsumer


class AlertsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        token = self.scope['query_string'].decode().split('token=')[-1]
        if not token:
            await self.close()
            return
        self.group_name = 'alerts_broadcast_group'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()


    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        # This consumer is broadcast-only from server; ignore client messages
        return

    # Events that views can send through channel layer
    async def sos_created(self, event):
        await self.send(text_data=json.dumps({
            'type': 'new_sos',
            'payload': event['payload'],
        }))

    async def donation_created(self, event):
        await self.send(text_data=json.dumps({
            'type': 'new_donation',
            'payload': event['payload'],
        }))

    async def volunteer_assigned(self, event):
        await self.send(text_data=json.dumps({
            'type': 'volunteer_assigned',
            'payload': event['payload'],
        }))


class ChatConsumer(AsyncWebsocketConsumer):
    online_users_by_group = {}

    async def connect(self):
        self.group_name = 'emergency_chat_room'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        ChatConsumer.online_users_by_group.setdefault(self.group_name, set())
        await self.accept()

    async def disconnect(self, close_code):
        # Remove user if tracked
        username = getattr(self, 'username', None)
        if username:
            users = ChatConsumer.online_users_by_group.get(self.group_name, set())
            if username in users:
                users.remove(username)
                await self.channel_layer.group_send(self.group_name, {
                    'type': 'user_left_event',
                    'username': username,
                })
                await self._broadcast_online_users()
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        try:
            data = json.loads(text_data or '{}')
        except Exception:
            return
        action = data.get('action')

        if action == 'join_chat':
            self.username = data.get('username') or 'anonymous'
            users = ChatConsumer.online_users_by_group.setdefault(self.group_name, set())
            if self.username not in users:
                users.add(self.username)
                await self.channel_layer.group_send(self.group_name, {
                    'type': 'user_joined_event',
                    'username': self.username,
                })
                await self._broadcast_online_users()
        elif action == 'send_message':
            message = {
                'id': data.get('id'),
                'content': data.get('content'),
                'username': data.get('username'),
                'timestamp': data.get('timestamp'),
            }
            await self.channel_layer.group_send(self.group_name, {
                'type': 'chat_message_event',
                'message': message,
            })

    async def chat_message_event(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'payload': event['message'],
        }))

    async def user_joined_event(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'payload': { 'username': event['username'] },
        }))

    async def user_left_event(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'payload': { 'username': event['username'] },
        }))

    async def online_users_event(self, event):
        await self.send(text_data=json.dumps({
            'type': 'online_users',
            'payload': event['users'],
        }))

    async def _broadcast_online_users(self):
        users = sorted(list(ChatConsumer.online_users_by_group.get(self.group_name, set())))
        await self.channel_layer.group_send(self.group_name, {
            'type': 'online_users_event',
            'users': users,
        })

    async def donation_created(self, event):
        await self.send(text_data=json.dumps({
            'type': 'new_donation',
            'payload': event['payload'],
        }))

    async def volunteer_assigned(self, event):
        await self.send(text_data=json.dumps({
            'type': 'volunteer_assigned',
            'payload': event['payload'],
        }))