import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, t } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(credentials);
            const params = new URLSearchParams(window.location.search);
            const redirect = params.get('redirect');
            if (user.role === 'farmer') navigate('/farmer');
            else if (user.role === 'admin') navigate('/admin');
            else if (redirect) navigate(`/${redirect}`);
            else navigate('/orders');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid login credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem 1rem', position: 'relative', overflow: 'hidden' }}>
            <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="glass auth-card" 
                style={{ maxWidth: '420px' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '1rem', background: 'rgba(22, 163, 74, 0.1)', border: '1px solid var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--primary)' }}>
                        <LogIn size={28} />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-light)', letterSpacing: '-0.5px' }}>{t('welcome')}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Sign in to continue to FarmerDirect</p>
                </div>
                
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--error)', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}
                    >
                        <AlertCircle size={16} style={{ flexShrink: 0 }} /> <span>{error}</span>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 5 }} size={18} />
                        <input 
                            type="email" placeholder="Email Address" required
                            style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '0.75rem', fontSize: '0.95rem', transition: 'all 0.3s' }} 
                            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 5 }} size={18} />
                        <input 
                            type={showPassword ? "text" : "password"} placeholder="Password" required
                            style={{ width: '100%', padding: '1rem 3.5rem 1rem 3rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '0.75rem', fontSize: '0.95rem', transition: 'all 0.3s' }} 
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 5, padding: 0, minHeight: 'auto', width: 'auto' }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem' }}>
                        <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>
                            Forgot Password?
                        </Link>
                    </div>
                    
                    <button 
                        className="btn btn-primary" 
                        type="submit" 
                        disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderRadius: '0.75rem', fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
                    >
                        {loading ? (
                            <div className="loading" style={{ width: '20px', height: '20px', borderTopColor: 'var(--white)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        ) : (
                            <>
                                Login <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1rem' }}>
                        Don't have an account? <Link to={`/signup${window.location.search}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>{t('signup')}</Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
