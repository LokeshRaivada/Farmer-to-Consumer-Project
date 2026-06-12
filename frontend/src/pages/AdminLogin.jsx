import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLogin = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, logout } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const loggedInUser = await login(credentials);
            if (loggedInUser.role !== 'admin') {
                await logout();
                setError('Access denied. Only administrators can log in here.');
                return;
            }
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid administrator credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem 1rem', position: 'relative', overflow: 'hidden' }}>
            {/* Background glowing blobs themed for admin security */}
            <div style={{ position: 'absolute', top: '15%', left: '25%', width: '320px', height: '320px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)', filter: 'blur(55px)', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', bottom: '15%', right: '25%', width: '320px', height: '320px', background: 'radial-gradient(circle, rgba(0, 255, 157, 0.1) 0%, transparent 70%)', filter: 'blur(55px)', zIndex: 0 }}></div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="glass" 
                style={{ width: '100%', maxWidth: '420px', padding: '3rem 2.5rem', borderRadius: '1.5rem', border: '1px solid rgba(168, 85, 247, 0.25)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)', zIndex: 1, position: 'relative' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '1.25rem', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid #A855F7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#A855F7', boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)' }}>
                        <ShieldAlert size={28} />
                    </div>
                    <h2 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>Admin Portal</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Secure sign-in for platform administrators</p>
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
                        <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                        <input 
                            type="email" placeholder="Admin Email" required
                            style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.75rem', fontSize: '0.95rem', transition: 'all 0.3s' }} 
                            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                            className="input-focus-glow"
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                        <input 
                            type="password" placeholder="Password" required
                            style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.75rem', fontSize: '0.95rem', transition: 'all 0.3s' }} 
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            className="input-focus-glow"
                        />
                    </div>
                    
                    <button 
                        className="btn btn-primary" 
                        type="submit" 
                        disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderRadius: '0.75rem', fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', background: '#A855F7', border: 'none', color: 'white' }}
                        onMouseEnter={(e) => e.target.style.background = '#9333EA'}
                        onMouseLeave={(e) => e.target.style.background = '#A855F7'}
                    >
                        {loading ? (
                            <div className="loading" style={{ width: '20px', height: '20px', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        ) : (
                            <>
                                Authenticate <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
