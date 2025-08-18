// services/chatSocket.js

let ws = null;
const listeners = {
    chat_message: new Set(),
    user_joined: new Set(),
    user_left: new Set(),
    online_users: new Set(),
};

export const connectChatSocket = () => {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        return ws;
    }

    ws = new WebSocket('ws://localhost:8000/ws/chat/');

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            const { type, payload } = data || {};
            if (type && listeners[type]) {
                for (const cb of listeners[type]) {
                    cb(payload);
                }
            }
        } catch (err) {
            console.error('Invalid chat WS message', err);
        }
    };

    return ws;
};

export const sendChatAction = (payload) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(payload));
};

export const onChatEvent = (eventType, callback) => {
    if (!listeners[eventType]) return () => { };
    listeners[eventType].add(callback);
    return () => listeners[eventType].delete(callback);
};

export default { connectChatSocket, sendChatAction, onChatEvent };






