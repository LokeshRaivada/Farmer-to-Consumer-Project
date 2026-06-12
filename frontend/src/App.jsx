import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { ShoppingCart, LogOut, Menu, X, Leaf, Search, Bell, Heart, ChevronDown } from 'lucide-react';
import ChatBox from './components/ChatBox';
import axios from 'axios';

// Lazy loading pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Signup = lazy(() => import('./pages/Signup'));
const ConsumerStore = lazy(() => import('./pages/ConsumerStore'));
const FarmerDashboard = lazy(() => import('./pages/FarmerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Cart = lazy(() => import('./pages/Cart'));
const ConsumerOrders = lazy(() => import('./pages/ConsumerOrders'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Settings = lazy(() => import('./pages/Settings'));
const Reviews = lazy(() => import('./pages/Reviews'));
const Farmers = lazy(() => import('./pages/Farmers'));

const Navbar = () => {
  const { user, logout, t, lang, toggleLang, largeText, toggleLargeText } = useAuth();
  const { cartCount } = useCart();
  const location = window.location.pathname;
  
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showProfile, setShowProfile] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  const [notifications, setNotifications] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState('');

  const fetchNotifications = React.useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await axios.get('/api/consumer/notifications?limit=20');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [user]);

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await axios.put('/api/consumer/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await axios.put(`/api/consumer/notifications/${notif._id}/read`);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    setShowNotifications(false);
    if (notif.link) {
      window.location.href = notif.link;
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    return `${diffDay}d ago`;
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      window.location.href = `/store?search=${encodeURIComponent(searchTerm.trim())}`;
    }
  };

  const NavLink = ({ to, children }) => (
    <Link 
      to={to} 
      className={`nav-link ${location === to ? 'active' : ''}`} 
      onClick={() => setMobileMenuOpen(false)}
      style={{ position: 'relative', textDecoration: 'none', color: location === to ? 'var(--primary)' : 'var(--text-light)', fontWeight: location === to ? '600' : '400', padding: '0.4rem 0.6rem', transition: 'color 0.3s', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap', flexShrink: 0 }}
    >
      {children}
    </Link>
  );

  return (
    <nav className="glass" style={{ margin: '1.5rem auto', maxWidth: '1300px', position: 'sticky', top: '1.5rem', zIndex: 1000, padding: '0.6rem 1.25rem', borderRadius: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)', border: '1px solid rgba(0,255,157,0.2)', backdropFilter: 'blur(25px)' }}>
      {/* Left: Logo & Desktop Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(0,255,157,0.4)', flexShrink: 0 }}>
             <Leaf color="var(--bg-darkest)" size={24} />
          </div>
          <span className="logo-text" style={{ fontWeight: '700', fontSize: '1.25rem', color: 'var(--text-light)', letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>
            Farmer<span style={{ color: 'var(--primary)' }}>Direct</span>
          </span>
        </Link>

        {/* Center Links (Desktop only) */}
        <div className="desktop-menu" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.3rem 0.8rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
          <NavLink to="/">🏠 {t('home')}</NavLink>
          <NavLink to="/store">🛒 {t('shop')}</NavLink>
          <NavLink to="/farmers">👨‍🌾 {t('farmers')}</NavLink>
          <NavLink to={user ? (user.role === 'farmer' ? '/farmer' : '/orders') : '/login'}>
            📦 {lang === 'te' ? 'నా ఆర్డర్లు' : 'Orders'}
          </NavLink>
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', position: 'relative', flexShrink: 0 }}>
        {/* Minimal Search Trigger Link */}
        <Link 
          to="/store?focusSearch=true" 
          className="nav-action-btn" 
          title="Search Crops"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-light)' }}
        >
          <Search size={16} color="currentColor" style={{ flexShrink: 0 }} />
          <span className="desktop-menu">{lang === 'te' ? 'వెతకండి' : 'Search'}</span>
        </Link>

        {/* Permanent Language Toggle (Desktop only) */}
        <div className="desktop-menu" style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '2rem', padding: '2px', border: '1px solid rgba(0,255,157,0.15)', alignItems: 'center', height: '32px', flexShrink: 0 }}>
          <button 
            onClick={() => lang !== 'en' && toggleLang()} 
            className="lang-toggle-btn"
            style={{ 
              background: lang === 'en' ? 'var(--primary)' : 'transparent', 
              color: lang === 'en' ? 'var(--bg-darkest)' : 'var(--text-light)',
              border: 'none', borderRadius: '1.5rem', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s', height: '100%', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' 
            }}
          >
            EN
          </button>
          <button 
            onClick={() => lang !== 'te' && toggleLang()} 
            className="lang-toggle-btn"
            style={{ 
              background: lang === 'te' ? 'var(--primary)' : 'transparent', 
              color: lang === 'te' ? 'var(--bg-darkest)' : 'var(--text-light)',
              border: 'none', borderRadius: '1.5rem', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s', height: '100%', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' 
            }}
          >
            తెలుగు
          </button>
        </div>

        {/* Alerts / Notifications (Desktop/Mobile) */}
        {user && (
          <div style={{ position: 'relative' }}>
            <button 
              className="nav-action-btn" 
              title="Alerts"
              onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
              style={{ color: unreadCount > 0 ? 'var(--primary)' : 'var(--text-light)', position: 'relative' }}
            >
              <Bell size={16} color="currentColor" style={{ flexShrink: 0 }} />
              <span className="desktop-menu">{t('alerts') || 'Alerts'}</span>
              {unreadCount > 0 && (
                <span className="badge" style={{ position: 'absolute', top: '2px', right: '2px', background: 'var(--primary)', color: 'var(--bg-darkest)', borderRadius: '50%', width: '15px', height: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold' }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="glass" style={{ position: 'absolute', top: '3rem', right: '-4rem', width: '320px', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--glass-border)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 1010, display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--bg-dark)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--primary)' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n._id} onClick={() => handleNotificationClick(n)} style={{ padding: '0.6rem', borderRadius: '0.5rem', background: n.read ? 'transparent' : 'rgba(0, 255, 157, 0.05)', border: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '0.25rem' }} className="hover-glow">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
                          <span style={{ fontWeight: n.read ? '600' : '700', fontSize: '0.85rem', color: 'white' }}>{n.title}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatTimeAgo(n.createdAt)}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.3', margin: 0 }}>{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wishlist Link (Quick Access) (Desktop only) */}
        {user && user.role === 'consumer' && (
          <Link to="/wishlist" className="nav-action-btn desktop-menu" title="Wishlist">
             <Heart size={16} color="currentColor" style={{ flexShrink: 0 }} />
             <span>{t('wishlist') || 'Wishlist'}</span>
          </Link>
        )}

        {/* Cart link */}
        <Link to="/cart" className="nav-action-btn" title="Shopping Cart">
           <ShoppingCart size={16} color="currentColor" style={{ flexShrink: 0 }} />
           <span className="desktop-menu">{t('cart') || 'Cart'}</span>
           {cartCount > 0 && <span className="badge" style={{ background: 'var(--primary)', color: 'var(--bg-darkest)', borderRadius: '50%', padding: '0.1rem 0.4rem', fontSize: '10px', fontWeight: 'bold', marginLeft: '0.25rem' }}>{cartCount}</span>}
        </Link>

        {/* User Account Profile / Login / Signup */}
        {user ? (
          <div style={{ position: 'relative' }} className="desktop-menu">
            <button 
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              className="nav-btn hover-glow"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0,255,157,0.1)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.8rem', flexShrink: 0 }}>
                 {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="user-name" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'white', display: 'inline-block', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
              <ChevronDown size={14} color="var(--text-muted)" style={{ transform: showProfile ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', flexShrink: 0 }} />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfile && (
              <div className="glass" style={{ position: 'absolute', top: '3.5rem', right: 0, width: '220px', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--glass-border)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 1010, display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-dark)' }}>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'white' }}>{user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'left' }}>
                  <Link to="/settings" onClick={() => setShowProfile(false)} style={{ textDecoration: 'none', color: 'var(--text-light)', fontSize: '0.85rem', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                    👤 {t('profile') || 'Profile'} & Settings
                  </Link>
                  {user.role === 'farmer' && (
                    <Link to="/farmer" onClick={() => setShowProfile(false)} style={{ textDecoration: 'none', color: 'var(--text-light)', fontSize: '0.85rem', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                      🌾 {t('my_farm') || 'My Farm'}
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setShowProfile(false)} style={{ textDecoration: 'none', color: 'var(--text-light)', fontSize: '0.85rem', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                      🛡️ Admin Dashboard
                    </Link>
                  )}
                  {user.role === 'consumer' && (
                    <>
                      <Link to="/orders" onClick={() => setShowProfile(false)} style={{ textDecoration: 'none', color: 'var(--text-light)', fontSize: '0.85rem', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                        📦 {lang === 'te' ? 'నా ఆర్డర్లు' : 'My Orders'}
                      </Link>
                      <Link to="/wishlist" onClick={() => setShowProfile(false)} style={{ textDecoration: 'none', color: 'var(--text-light)', fontSize: '0.85rem', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                        ❤️ {t('wishlist') || 'Wishlist'}
                      </Link>
                    </>
                  )}
                </div>
                <button 
                  onClick={() => { setShowProfile(false); logout(); }} 
                  style={{ color: 'var(--error)', width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                >
                   <LogOut size={14} /> {t('logout') || 'Logout'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }} className="desktop-menu">
            <Link to="/login" className="nav-btn" style={{ textDecoration: 'none' }}>🔑 {t('login') || 'Login'}</Link>
            <Link to="/signup" className="nav-btn hover-glow" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'var(--bg-darkest) !important' }}>📝 {t('signup') || 'Signup'}</Link>
          </div>
        )}

        {/* Mobile Menu Button (Hamburger) */}
        <button 
          className="mobile-toggle btn-icon" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ display: 'none' }}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="glass mobile-menu-panel" style={{ position: 'absolute', top: '5rem', left: '1rem', right: '1rem', padding: '1.5rem', borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 999, background: 'var(--bg-dark)' }}>
          {/* Mobile Language Toggle Switch */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '2rem', padding: '2px', border: '1px solid rgba(255,255,255,0.1)', alignItems: 'center', height: '36px', width: '100%' }}>
            <button 
              onClick={() => lang !== 'en' && toggleLang()} 
              className="lang-toggle-btn"
              style={{ 
                flex: 1,
                background: lang === 'en' ? 'var(--primary)' : 'transparent', 
                color: lang === 'en' ? 'var(--bg-darkest)' : 'var(--text-light)',
                border: 'none', borderRadius: '1.5rem', padding: '0.3rem 0.75rem', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}
            >
              English
            </button>
            <button 
              onClick={() => lang !== 'te' && toggleLang()} 
              className="lang-toggle-btn"
              style={{ 
                flex: 1,
                background: lang === 'te' ? 'var(--primary)' : 'transparent', 
                color: lang === 'te' ? 'var(--bg-darkest)' : 'var(--text-light)',
                border: 'none', borderRadius: '1.5rem', padding: '0.3rem 0.75rem', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}
            >
              తెలుగు
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
            <NavLink to="/">🏠 {t('home')}</NavLink>
            <NavLink to="/store">🛒 {t('shop')}</NavLink>
            <NavLink to="/farmers">👨‍🌾 {t('farmers')}</NavLink>
            <NavLink to={user ? (user.role === 'farmer' ? '/farmer' : '/orders') : '/login'}>
              📦 {lang === 'te' ? 'నా ఆర్డర్లు' : 'Orders'}
            </NavLink>
            
            {user ? (
              <>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0.5rem 0' }}></div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Account Settings</div>
                <NavLink to="/settings">👤 {t('profile')} & Settings</NavLink>
                {user.role === 'farmer' && <NavLink to="/farmer">🌾 {t('my_farm')}</NavLink>}
                {user.role === 'admin' && <NavLink to="/admin">🛡️ Admin Dashboard</NavLink>}
                {user.role === 'consumer' && <NavLink to="/wishlist">❤️ {t('wishlist')}</NavLink>}
                
                <button 
                  onClick={() => { setMobileMenuOpen(false); logout(); }} 
                  style={{ color: 'var(--error)', width: '100%', padding: '0.6rem', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}
                >
                   <LogOut size={14} /> {t('logout')}
                </button>
              </>
            ) : (
              <>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0.5rem 0' }}></div>
                <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                  <Link to="/login" className="btn btn-ghost" onClick={() => setMobileMenuOpen(false)} style={{ flex: 1, padding: '0.6rem 0' }}>🔑 {t('login')}</Link>
                  <Link to="/signup" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)} style={{ flex: 1, padding: '0.6rem 0', borderRadius: '1.5rem' }}>📝 {t('signup')}</Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Responsive Styles Injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 1280px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-toggle {
            display: flex !important;
          }
        }
        @media (max-width: 1380px) {
          .lang-te .desktop-menu {
            display: none !important;
          }
          .lang-te .mobile-toggle {
            display: flex !important;
          }
        }
      `}} />
    </nav>
  );
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const token = user?.token || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '1rem', color: 'var(--text-light)' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.05)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        <div style={{ fontSize: '0.85rem', opacity: 0.6, letterSpacing: '1.25px', textTransform: 'uppercase' }}>Authenticating...</div>
      </div>
    );
  }

  if (!token) {
    const isAdminPath = window.location.pathname.startsWith('/admin');
    return <Navigate to={isAdminPath ? "/admin/login" : "/login"} replace />;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  const { user, lang, largeText, t } = useAuth();
  return (
    <div className={`${lang === 'te' ? 'lang-te' : ''} ${largeText ? 'large-mode' : ''}`} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '0 1rem' }}>
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><div className="loading" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/store" element={<ConsumerStore />} />
            <Route path="/farmer/*" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerDashboard /></ProtectedRoute>} />
            <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<ProtectedRoute allowedRoles={['consumer']}><ConsumerOrders /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute allowedRoles={['consumer']}><Wishlist /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/farmers" element={<Farmers />} />
          </Routes>
        </Suspense>
      </main>
      
      <ChatBox recipientName="Support / Seller" />
      
      {/* Simplified Footer */}
      <footer className="glass" style={{ margin: '2px', maxWidth: '1500px', padding: '2rem', borderRadius: '2rem', border: '1px solid rgba(0, 255, 157, 0.1)', textAlign: 'left' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem' }}>
          {/* Column 1: About */}
          <div>
            <h3 style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem', marginBottom: '1rem' }}>{lang === 'te' ? 'పరిచయం' : 'About FarmerDirect'}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6', margin: 0, opacity: 0.8 }}>
              {lang === 'te' 
                ? 'రైతులను నేరుగా వినియోగదారులతో అనుసంధానించే సురక్షితమైన మరియు సులభమైన వేదిక. తాజా పంటలను నేరుగా కస్టమర్ల ఇళ్లకు చేరవేస్తాము.' 
                : 'A secure and easy platform connecting local farmers directly to customers at transparent prices. We bring fresh crops from fields to your doorstep.'}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem', marginBottom: '1rem' }}>{lang === 'te' ? 'లింకులు' : 'Quick Links'}</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <li><Link to="/" style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>🏠 {t('home')}</Link></li>
              <li><Link to="/store" style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>🛒 {t('shop')}</Link></li>
              <li><Link to="/farmers" style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>👨‍🌾 {t('farmers')}</Link></li>
              <li><Link to={user ? (user.role === 'farmer' ? '/farmer' : '/orders') : '/login'} style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>📦 {lang === 'te' ? 'నా ఆర్డర్లు' : 'Orders'}</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem', marginBottom: '1rem' }}>{lang === 'te' ? 'సంప్రదించండి' : 'Contact Us'}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6', margin: '0 0 0.5rem', opacity: 0.8 }}>
              📍 Rajam Main Road, Andhra Pradesh, India
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6', margin: '0 0 0.5rem', opacity: 0.8 }}>
              📧 support@farmerdirect.com
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6', margin: 0, opacity: 0.8 }}>
              📞 +91 9988776655
            </p>
          </div>

          {/* Column 4: Support */}
          <div>
            <h3 style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem', marginBottom: '1rem' }}>{lang === 'te' ? 'సహాయం' : 'Support'}</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <li><Link to="/login" style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>🌾 {lang === 'te' ? 'అమ్మకం ప్రారంభించండి' : 'Start Selling (Farmer)'}</Link></li>
              <li><Link to="/signup" style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>📝 {lang === 'te' ? 'రిజిస్ట్రేషన్ చేసుకోండి' : 'Register Account'}</Link></li>
            </ul>
          </div>
        </div>
        
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '2.5rem', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', opacity: 0.6 }}>
           <p>&copy; {new Date().getFullYear()} FarmerDirect. All rights reserved.</p>
           <p>Empowering farming communities across India 🚜</p>
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
