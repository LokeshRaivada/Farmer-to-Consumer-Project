import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, X, Send, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatBox = ({ recipientId, recipientName, orderId, isOpen: propIsOpen, setIsOpen: propSetIsOpen, onMessagesRead }) => {
  const { user, lang, socket } = useAuth();
  const [localIsOpen, setLocalIsOpen] = useState(false);
  const isOpen = propIsOpen !== undefined ? propIsOpen : localIsOpen;
  const setIsOpen = propSetIsOpen !== undefined ? propSetIsOpen : setLocalIsOpen;
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  const roomName = orderId ? `chat_order_${orderId}` : `chat_${[user?._id, recipientId].sort().join('_')}`;

  // Fetch messages from backend
  const fetchMessages = async (pageNum, append = false) => {
    if (!orderId) return;
    try {
      setIsLoading(true);
      const { data } = await axios.get(`/api/chat/messages/${orderId}?page=${pageNum}&limit=30`);
      
      if (data.length < 30) {
        setHasMore(false);
      }
      
      if (append) {
        const container = chatContainerRef.current;
        const scrollHeightBefore = container ? container.scrollHeight : 0;
        const scrollTopBefore = container ? container.scrollTop : 0;

        setMessages(prev => [...data, ...prev]);

        // Retain scroll position
        setTimeout(() => {
          if (container) {
            container.scrollTop = container.scrollHeight - scrollHeightBefore + scrollTopBefore;
          }
        }, 50);
      } else {
        setMessages(data);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }, 50);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setIsLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!orderId) return;
    try {
      await axios.put(`/api/chat/messages/${orderId}/read`);
      if (onMessagesRead) {
        onMessagesRead(orderId);
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Setup Socket Listeners
  useEffect(() => {
    if (isOpen && user && socket) {
      // Join order chat room
      socket.emit('join_room', { room: roomName });
      
      // Initial fetch and read mark
      setPage(1);
      setHasMore(true);
      fetchMessages(1, false);
      markAsRead();

      const handleReceiveMessage = (data) => {
        if (data.room === roomName || (data.orderId && data.orderId === orderId)) {
          setMessages(prev => [...prev, data]);
          markAsRead();
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }
      };

      socket.on('receive_message', handleReceiveMessage);
      
      return () => {
        socket.off('receive_message', handleReceiveMessage);
      };
    }
  }, [isOpen, user?._id, socket, roomName, orderId]);

  // Handle scroll to top for pagination
  const handleScroll = (e) => {
    const container = e.currentTarget;
    if (container.scrollTop === 0 && hasMore && !isLoading && orderId) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage, true);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket) return;

    const messageData = {
      room: roomName,
      orderId: orderId,
      senderId: user._id,
      senderName: user.name,
      receiverId: recipientId,
      text: inputMessage,
      timestamp: new Date().toISOString()
    };

    socket.emit('send_message', messageData);
    setMessages(prev => [...prev, messageData]);
    setInputMessage('');
    
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
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
    <div style={{ position: 'fixed', bottom: '5.5rem', right: '1.5rem', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="glass" 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{ width: '330px', maxWidth: 'calc(100vw - 3rem)', height: '480px', maxHeight: 'calc(100vh - 7.5rem)', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '1rem', border: '1px solid var(--glass-border)', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}
          >
            
            {/* Header */}
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
                aria-label={lang === 'te' ? 'చాట్ విండోను మూసివేయి' : 'Close chat box'}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'var(--white)', 
                  cursor: 'pointer', 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  transition: 'background 0.2s', 
                  minHeight: '40px', 
                  padding: 0 
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Message Logs */}
            <div 
              ref={chatContainerRef}
              onScroll={handleScroll}
              style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--whatsapp-bg)' }}
            >
              {isLoading && hasMore && (
                <div style={{ textAlign: 'center', padding: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                  <Loader size={16} className="animate-spin" style={{ color: 'var(--primary)' }} />
                </div>
              )}
              {messages.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '200px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', background: 'var(--whatsapp-their-bubble)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', margin: 0 }}>
                    💬 {lang === 'te' ? 'సంభాషణను ప్రారంభించండి' : 'Start a conversation'}
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderId === user._id || (msg.sender && msg.sender._id === user._id) || (msg.sender === user._id);
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        alignSelf: isMe ? 'flex-end' : 'flex-start', 
                        maxWidth: '85%', 
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
                        {msg.text || msg.content}
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
                          {formatMessageTime(msg.timestamp || msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
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
                  color: 'var(--text-on-primary)',
                  cursor: 'pointer'
                }}
              >
                <Send size={16} />
              </button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ChatBox;
