import React, { useEffect, useRef, useState, FormEvent } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane } from 'react-icons/fa';

interface ChatMessage {
    id: string;
    username: string;
    message: string;
    timestamp: number;
}

interface ChatProps {
    roomId: string;
}

const Chat: React.FC<ChatProps> = ({ roomId }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const { socket, isConnected } = useSocket();
    const { user } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!socket || !isConnected || !user) return;
        const handleNewMessage = (data: { username: string; message: string; timestamp: number }) => {
            setMessages(prev => [...prev, {
                id: `${Date.now()}-${Math.random()}`,
                username: data.username,
                message: data.message,
                timestamp: data.timestamp
            }]);
        };

        const handlePreviousMessage = (data: ChatMessage[]) => { setMessages(data) };

        socket.on('chat-message', handleNewMessage);
        socket.on('previous-message', handlePreviousMessage);

        return () => {
            socket.off('chat-message', handleNewMessage);
            socket.off('previous-message', handlePreviousMessage);
        };
    }, [socket, isConnected, user, roomId]);

    const sendMessage = (e: FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || !socket || !isConnected || !user) return;
        const messageData = {
            roomId,
            username: user.username,
            message: inputMessage.trim(),
            timeStamp: Date.now()
        };
        socket.emit('chat-message', messageData);
        setInputMessage('');
    };
    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className='flex flex-col h-full bg-gray-800 rounded-lg'>
            <div className='p-3 border-b border-gray-700'>
                <h3 className='text-lg font-semibold'>Chat</h3>
                <p className='text-xs text-gray-400'>{isConnected ? 'Connected' : 'Disconnected'}</p>
            </div>

            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px] max-h-[300px]"
            >
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex flex-col ${msg.username === user?.username ? 'items-end' : 'items-start'
                                }`}
                        >
                            <div
                                className={`max-w-[80%] px-3 py-2 rounded-lg ${msg.username === user?.username
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-700 text-gray-200'
                                    }`}
                            >
                                <p className="text-sm break-words">{msg.message}</p>
                            </div>
                            <div className="flex items-center space-x-2 mt-0.5">
                                <span className="text-xs text-gray-500">
                                    {msg.username === user?.username ? 'You' : msg.username}
                                </span>
                                <span className="text-xs text-gray-500">•</span>
                                <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className='p-3 border-t border-gray-700'>
                <div className="flex items-center space-x-2">
                    <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder='Type a Message...' className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white text-sm" disabled={!isConnected} />
                    <button type="submit" disabled={!isConnected || !inputMessage.trim()} className="px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition">
                        <FaPaperPlane size={16} />
                    </button>
                </div>
            </form>
        </div>
    )
};

export default Chat;