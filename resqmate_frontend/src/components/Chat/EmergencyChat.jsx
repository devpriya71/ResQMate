import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MessageCircle, Send, Users } from 'lucide-react';
import { connectChatSocket, onChatEvent, sendChatAction } from '../../services/chatSocket';
import { getUserData } from '../../utils/auth';

const EmergencyChat = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [onlineUsers, setOnlineUsers] = useState([]);
    const messagesEndRef = useRef(null);
    const joinedRef = useRef(false);
    const username = useMemo(() => getUserData()?.username || 'anonymous', []);

    useEffect(() => {
        const ws = connectChatSocket();
        const offMsg = onChatEvent('chat_message', handleNewMessage);
        const offJoin = onChatEvent('user_joined', handleUserJoined);
        const offLeft = onChatEvent('user_left', handleUserLeft);
        const offUsers = onChatEvent('online_users', setOnlineUsers);

        const handleOpen = () => {
            if (!joinedRef.current) {
                sendChatAction({ action: 'join_chat', username });
                joinedRef.current = true;
            }
        };
        ws?.addEventListener?.('open', handleOpen);
        const handleClose = () => { joinedRef.current = false; };
        ws?.addEventListener?.('close', handleClose);
        // In case already open
        if (ws?.readyState === WebSocket.OPEN) {
            handleOpen();
        }

        return () => {
            offMsg();
            offJoin();
            offLeft();
            offUsers();
            ws?.removeEventListener?.('open', handleOpen);
            ws?.removeEventListener?.('close', handleClose);
        };
    }, [username]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleNewMessage = (message) => {
        setMessages(prev => [...prev, message]);
    };

    const handleUserJoined = (data) => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'system',
            content: `${data.username} joined the chat`,
            timestamp: new Date().toISOString(),
        }]);
    };

    const handleUserLeft = (data) => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'system',
            content: `${data.username} left the chat`,
            timestamp: new Date().toISOString(),
        }]);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        connectChatSocket();
        sendChatAction({
            action: 'send_message',
            content: newMessage,
            username: username,
            timestamp: new Date().toISOString(),
        });
        setNewMessage('');
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Emergency Chat</h3>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{onlineUsers.length} online</span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div key={message.id || index}>
                            {message.type === 'system' ? (
                                <div className="text-center text-xs text-gray-500 py-1">
                                    {message.content}
                                </div>
                            ) : (
                                <div className={`flex ${message.username === username ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.username === username
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                        }`}>
                                        {message.username !== username && (
                                            <p className="text-xs font-medium mb-1 opacity-75">
                                                {message.username}
                                            </p>
                                        )}
                                        <p className="text-sm">{message.content}</p>
                                        <p className={`text-xs mt-1 opacity-75 ${message.username === username ? 'text-blue-100' : 'text-gray-500'
                                            }`}>
                                            {formatTime(message.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EmergencyChat;