import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { ShoppingCart, LogIn, UserPlus, LogOut, Menu, X, Globe, User, BarChart, Package, MapPin, Leaf, Search } from 'lucide-react';

// Lazy loading pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ConsumerStore = lazy(() => import('./pages/ConsumerStore'));
const FarmerDashboard = lazy(() => import('./pages/FarmerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Cart = lazy(() => import('./pages/Cart'));
const ConsumerOrders = lazy(() => import('./pages/ConsumerOrders'));

const Navbar = () => {
  const { user, logout, t, lang, toggleLang } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const { cartCount } = useCart();
  const location = window.location.pathname;

  const NavLink = ({ to, children }) => (
    <Link to={to} className={`nav-link ${location === to ? 'active' : ''}`} style={{ position: 'relative', textDecoration: 'none', color: location === to ? 'var(--primary)' : 'var(--text-light)', fontWeight: location === to ? '600' : '400', padding: '0.5rem', transition: 'color 0.3s' }}>
      {children}
    </Link>
  );

  return (
    <nav className="glass" style={{ margin: '1.5rem auto', maxWidth: '1200px', position: 'sticky', top: '1.5rem', zIndex: 1000, padding: '0.75rem 1.5rem', borderRadius: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)', border: '1px solid rgba(0,255,157,0.2)', backdropFilter: 'blur(25px)' }}>
      {/* Left: Logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(0,255,157,0.4)' }}>
           <Leaf color="var(--bg-darkest)" size={24} />
        </div>
        <span style={{ fontWeight: '700', fontSize: '1.25rem', color: 'var(--text-light)', letterSpacing: '-0.5px' }}>
          Farmer<span style={{ color: 'var(--primary)' }}>Direct</span>
        </span>
      </Link>

      {/* Center: Navigation */}
      <div className="desktop-menu" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 2rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
        <NavLink to="/">{t('home')}</NavLink>
        <NavLink to="/store">{t('store')}</NavLink>
        <NavLink to="/farmers">Farmers</NavLink>
        {user?.role === 'farmer' && <NavLink to="/farmer">{t('dashboard')}</NavLink>}
        {user?.role === 'consumer' && <NavLink to="/orders">{t('orders')}</NavLink>}
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', paddingRight: '1rem', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
           <button className="btn-icon"><Globe size={18} onClick={toggleLang} /></button>
           <button className="btn-icon"><Search size={18} /></button>
           <Link to="/cart" className="btn-icon" style={{ position: 'relative', textDecoration: 'none', display: 'flex' }}>
              <ShoppingCart size={18} />
              {cartCount > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--primary)', color: 'var(--bg-darkest)', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>{cartCount}</span>}
           </Link>
        </div>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,255,157,0.1)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold' }}>
                   {user.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user.name}</span>
            </div>
            <button onClick={logout} className="btn-icon" style={{ color: 'var(--error)', width: 'auto', padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
               <LogOut size={16} style={{ marginRight: '0.5rem' }} /> {t('logout')}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link to="/login" className="btn btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>{t('login')}</Link>
            <Link to="/signup" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', borderRadius: '2rem' }}>{t('signup')}</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1, padding: '0 1rem' }}>
            <Suspense fallback={<div className="loading">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/store" element={<ConsumerStore />} />
                <Route path="/farmer/*" element={<FarmerDashboard />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<ConsumerOrders />} />
              </Routes>
            </Suspense>
          </main>
          <footer style={{ padding: '4rem 2rem', textAlign: 'center', opacity: 0.5 }}>
             <p>&copy; 2026 Farmer-to-Consumer Direct Platform. All rights reserved.</p>
          </footer>
        </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
