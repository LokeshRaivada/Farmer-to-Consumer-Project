import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, HelpCircle, Phone, BookOpen, Globe, X } from 'lucide-react';

const AssistantPanel = ({ onOpenChat, onOpenHelp, onOpenGuide }) => {
  const { lang, toggleLang } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      icon: <MessageCircle size={20} color="var(--primary)" />,
      labelEn: "Chat Support",
      labelTe: "చాట్ సహాయం",
      action: () => {
        onOpenChat();
        setIsOpen(false);
      }
    },
    {
      icon: <HelpCircle size={20} color="var(--primary)" />,
      labelEn: "FAQs / Help Guide",
      labelTe: "ప్రశ్నలు & జవాబులు",
      action: () => {
        onOpenHelp();
        setIsOpen(false);
      }
    },
    {
      icon: <BookOpen size={20} color="var(--primary)" />,
      labelEn: "How To Use FarmerDirect",
      labelTe: "యాప్ ఎలా వాడాలి?",
      action: () => {
        onOpenGuide();
        setIsOpen(false);
      }
    }
  ];

  return (
    <div style={{ position: 'fixed', bottom: '5.5rem', right: '1.5rem', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      
      {/* Options Panel Popup */}
      {isOpen && (
        <div 
          className="glass"
          style={{ 
            width: '280px', 
            borderRadius: '1.25rem', 
            padding: '1.25rem', 
            marginBottom: '0.75rem', 
            background: 'var(--bg-darkest)', 
            border: '1px solid var(--glass-border)', 
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            animation: 'fadeInUp 0.2s ease-out',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
            <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.95rem' }}>
              {lang === 'te' ? 'రైతు సహాయ కేంద్రం' : 'FarmerDirect Assistant'}
            </span>
            <button 
              onClick={() => setIsOpen(false)} 
              aria-label={lang === 'te' ? 'సహాయ కేంద్రాన్ని మూసివేయి' : 'Close assistant panel'}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--text-secondary)', 
                cursor: 'pointer', 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                transition: 'all 0.2s', 
                minHeight: '40px', 
                padding: 0 
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-darker)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Menu Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={item.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  width: '100%',
                  background: 'var(--bg-darker)',
                  border: '1px solid transparent',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  minHeight: '48px',
                  color: 'var(--text-light)',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
                className="hover-glow"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.background = 'var(--bg-darkest)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.background = 'var(--bg-darker)';
                }}
              >
                {item.icon}
                <span>{lang === 'te' ? item.labelTe : item.labelEn}</span>
              </button>
            ))}
          </div>

          {/* Call Support Widget */}
          <div style={{ background: 'rgba(22, 163, 74, 0.06)', border: '1px solid rgba(22, 163, 74, 0.15)', padding: '0.75rem', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
              {lang === 'te' ? 'నేరుగా కాల్ చేయండి:' : 'DIRECT SUPPORT CALL:'}
            </span>
            <a 
              href="tel:+919988776655" 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                background: 'var(--primary)',
                color: 'var(--text-on-primary)',
                padding: '0.6rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                textAlign: 'center',
                minHeight: '40px'
              }}
            >
              <Phone size={16} />
              <span>+91 9988776655</span>
            </a>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.1rem' }}>
              support@farmerdirect.com
            </span>
          </div>

          {/* Language Toggle Selector */}
          <button
            onClick={toggleLang}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '0.6rem 0.75rem',
              background: 'var(--bg-darker)',
              border: '1px solid var(--glass-border)',
              borderRadius: '0.75rem',
              color: 'var(--text-light)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
              minHeight: '44px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={16} color="var(--primary)" />
              <span>{lang === 'te' ? 'భాష మార్చండి' : 'Change Language'}</span>
            </div>
            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
              {lang === 'te' ? 'English' : 'తెలుగు'}
            </span>
          </button>

        </div>
      )}

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-primary"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          padding: 0,
          cursor: 'pointer',
          border: 'none',
          background: 'var(--primary)',
          color: 'var(--white)',
          transition: 'transform 0.2s',
          zIndex: 10000
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title={lang === 'te' ? 'సహాయం' : 'Assistant Support'}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

    </div>
  );
};

export default AssistantPanel;
