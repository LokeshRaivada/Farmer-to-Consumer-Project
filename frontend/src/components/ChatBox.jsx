import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ChatBox = ({ recipientId, recipientName, orderId }) => {
  const { user, lang } = useAuth();
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket) return;

    const messageData = {
      room: roomName,
      senderId: user._id,
      senderName: user.name,
      receiverId: recipientId,
      text: inputMessage,
      timestamp: new Date().toISOString()
    };

    socket.emit('send_message', messageData);
    setMessages((prev) => [...prev, messageData]);
    setInputMessage('');
  };

  const formatMessageTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  if (!user) return null;

  return (
    <div style={{ position: 'fixed', bottom: '5rem', right: '1.5rem', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="glass" 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{ width: '330px', height: '480px', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '1rem', border: '1px solid var(--glass-border)', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}
          >
            
            {/* WhatsApp Header */}
            <div style={{ padding: '0.75rem 1rem', background: 'var(--primary-dark)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {(recipientName || 'C').charAt(0).toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{recipientName || 'Chat'}</span>
                  <span style={{ fontSize: '0.65rem', opacity: 0.85 }}>{lang === 'te' ? 'ఆన్‌లైన్' : 'online'}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* WhatsApp Message Logs Container */}
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--whatsapp-bg)' }}>
              {messages.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '200px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', background: 'var(--whatsapp-their-bubble)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', margin: 0 }}>
                    💬 {lang === 'te' ? 'సంభాషణను ప్రారంభించండి' : 'Start a conversation'}
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderId === user._id;
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        alignSelf: isMe ? 'flex-end' : 'flex-start', 
                        maxWidth: '80%', 
                        textAlign: 'left',
                        position: 'relative'
                      }}
                    >
                      <div style={{ 
                        padding: '0.5rem 0.75rem 0.85rem 0.75rem', 
                        borderRadius: isMe ? '7px 0px 7px 7px' : '0px 7px 7px 7px',
                        background: isMe ? 'var(--whatsapp-my-bubble)' : 'var(--whatsapp-their-bubble)',
                        color: 'var(--whatsapp-text)',
                        boxShadow: '0 1px 1px rgba(0,0,0,0.08)',
                        fontSize: '0.9rem',
                        lineHeight: '1.35',
                        position: 'relative'
                      }}>
                        {msg.text}
                        <span style={{ 
                          position: 'absolute', 
                          bottom: '2px', 
                          right: '6px', 
                          fontSize: '0.6rem', 
                          color: 'var(--text-muted)', 
                          opacity: 0.8,
                          display: 'block',
                          textAlign: 'right'
                        }}>
                          {formatMessageTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* WhatsApp Chat Send Pill Input */}
            <form onSubmit={sendMessage} style={{ padding: '0.75rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.5rem', background: 'var(--bg-darkest)', alignItems: 'center' }}>
              <input 
                type="text" 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={lang === 'te' ? 'సందేశాన్ని టైప్ చేయండి...' : 'Type a message...'}
                style={{ 
                  flex: 1, 
                  padding: '0.6rem 1rem', 
                  borderRadius: '2rem', 
                  border: '1px solid var(--glass-border)', 
                  background: 'var(--bg-darker)', 
                  color: 'var(--text-light)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  minHeight: '38px'
                }}
              />
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ 
                  padding: 0, 
                  borderRadius: '50%', 
                  width: '38px', 
                  height: '38px', 
                  minWidth: '38px', 
                  minHeight: '38px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: 'var(--primary)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                <Send size={16} />
              </button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)} 
          className="btn btn-primary" 
          style={{ 
            width: '56px', 
            height: '56px', 
            minWidth: '56px', 
            minHeight: '56px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            padding: 0,
            cursor: 'pointer',
            border: 'none'
          }}
        >
          <MessageCircle size={24} />
        </button>
      )}

    </div>
  );
};

export default ChatBox;
