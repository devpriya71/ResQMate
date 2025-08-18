// src/services/alertsSocket.js
let ws = null;
let reconnectTimeout = null;
const listeners = {
    new_sos: new Set(),
    new_donation: new Set(),
    volunteer_assigned: new Set(),
};

export const connectAlertsSocket = (token) => {
    if (!token) return null;

    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        return ws;
    }

    ws = new WebSocket(`ws://localhost:8000/ws/alerts/?token=${token}`);

    ws.onopen = () => {
        console.log('WebSocket connected');
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (listeners[data.type]) {
            listeners[data.type].forEach((callback) => callback(data.payload));
        }
    };

    ws.onerror = (err) => {
        console.error('WebSocket error', err);
    };

    ws.onclose = () => {
        console.warn('WebSocket closed, reconnecting in 2s...');
        reconnectTimeout = setTimeout(() => {
            connectAlertsSocket(token);
        }, 2000);
    };

    return ws;
};

export const disconnectAlertsSocket = () => {
    if (ws) {
        ws.close();
        ws = null;
    }
};

export const onAlertEvent = (type, callback) => {
    if (!listeners[type]) listeners[type] = new Set();
    listeners[type].add(callback);

    // return unsubscribe function
    return () => {
        listeners[type].delete(callback);
    };
};

const alertsSocket = { connectAlertsSocket, disconnectAlertsSocket, onAlertEvent };
export default alertsSocket;



