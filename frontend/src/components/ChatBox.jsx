import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, X, Send, User } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ChatBox = ({ recipientId, recipientName, orderId }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  const roomName = `chat_${orderId || [user?._id, recipientId].sort().join('_')}`;

  useEffect(() => {
    if (isOpen && user) {
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);

      newSocket.on('connect', () => {
        newSocket.emit('join_room', roomName);
      });

      newSocket.on('receive_message', (data) => {
        setMessages((prev) => [...prev, data]);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isOpen, user, roomName]);

  useEffect(() => {
    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket) return;

    const messageData = {
      room: roomName,
      senderId: user._id,
      senderName: user.name,
      text: inputMessage,
      timestamp: new Date().toISOString()
    };

    socket.emit('send_message', messageData);
    setMessages((prev) => [...prev, messageData]);
    setInputMessage('');
  };

  if (!user) return null;

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      
      {/* Chat Window */}
      {isOpen && (
        <div className="glass" style={{ width: '350px', height: '450px', marginBottom: '1rem', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '1rem' }}>
          
          {/* Header */}
          <div style={{ padding: '1rem', background: 'var(--primary)', color: 'var(--bg-darkest)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
              <User size={18} /> {recipientName || 'Chat'}
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(0,0,0,0.2)' }}>
            {messages.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>Start a conversation</p>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.senderId === user._id;
                return (
                  <div key={idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textAlign: isMe ? 'right' : 'left' }}>
                      {msg.senderName}
                    </div>
                    <div style={{ 
                      padding: '0.75rem 1rem', 
                      borderRadius: isMe ? '1rem 0 1rem 1rem' : '0 1rem 1rem 1rem',
                      background: isMe ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                      color: isMe ? 'var(--bg-darkest)' : 'var(--text-light)',
                      border: isMe ? 'none' : '1px solid rgba(255,255,255,0.2)'
                    }}>
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.5rem', background: 'var(--bg-darkest)' }}>
            <input 
              type="text" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              style={{ flex: 1, padding: '0.75rem', borderRadius: '2rem', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-light)' }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0.75rem', borderRadius: '50%', minWidth: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={18} />
            </button>
          </form>

        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="btn-primary" style={{ width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0,255,157,0.4)' }}>
          <MessageCircle size={28} />
        </button>
      )}

    </div>
  );
};

export default ChatBox;
