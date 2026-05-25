import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, Smartphone, MapPin, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const Signup = () => {
    const [userData, setUserData] = useState({ 
        name: '', email: '', password: '', role: 'consumer', phone: '', 
        address: { city: '', state: '' } 
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register, t } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await register(userData);
            if (user.role === 'farmer') navigate('/farmer');
            else navigate('/store');
        } catch (err) {
            setError(err.response?.data?.message || 'Error occurred during registration.');
        }
        setLoading(false);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ width: '100%', maxWidth: '500px', padding: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>Create Account</h2>
                
                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                        {['consumer', 'farmer'].map(r => (
                            <button 
                                key={r} type="button" 
                                className={`btn ${userData.role === r ? 'btn-primary' : ''}`}
                                style={{ flex: 1, textTransform: 'capitalize', padding: '0.5rem' }}
                                onClick={() => setUserData({ ...userData, role: r })}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    <div style={{ position: 'relative' }}>
                        <User style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} size={18} />
                        <input 
                            type="text" placeholder="Full Name" required
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }} 
                            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} size={18} />
                        <input 
                            type="email" placeholder="Email Address" required
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }} 
                            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} size={18} />
                            <input 
                                type="password" placeholder="Password" required minLength={6}
                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }} 
                                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                            />
                        </div>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Smartphone style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} size={18} />
                            <input 
                                type="text" placeholder="Phone" required
                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }} 
                                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <MapPin style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} size={18} />
                            <input 
                                type="text" placeholder="City" required
                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }} 
                                onChange={(e) => setUserData({ ...userData, address: { ...userData.address, city: e.target.value } })}
                            />
                        </div>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <MapPin style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} size={18} />
                            <input 
                                type="text" placeholder="State" required
                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }} 
                                onChange={(e) => setUserData({ ...userData, address: { ...userData.address, state: e.target.value } })}
                            />
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <input 
                                type="text" placeholder="District" required
                                style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }} 
                                onChange={(e) => setUserData({ ...userData, address: { ...userData.address, district: e.target.value } })}
                            />
                        </div>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <input 
                                type="text" placeholder="Pincode" required
                                style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }} 
                                onChange={(e) => setUserData({ ...userData, address: { ...userData.address, zip: e.target.value } })}
                            />
                        </div>
                    </div>

                    {userData.role === 'farmer' && (
                        <div style={{ background: 'rgba(0,255,157,0.05)', padding: '1rem', borderRadius: '0.5rem', border: '1px dashed rgba(0,255,157,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Store Location (Optional)</h4>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Helps local consumers find you.</p>
                            </div>
                            <button 
                                type="button"
                                className="btn"
                                onClick={() => {
                                    if(navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition(
                                            (pos) => setUserData({ ...userData, coordinates: [pos.coords.longitude, pos.coords.latitude] }),
                                            () => alert('Location access denied.')
                                        );
                                    }
                                }}
                                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', borderRadius: '2rem', background: userData.coordinates ? 'var(--primary)' : 'rgba(255,255,255,0.1)', color: userData.coordinates ? 'var(--bg-dark)' : 'white' }}
                            >
                                {userData.coordinates ? 'Location Saved' : 'Detect Location'}
                            </button>
                        </div>
                    )}

                    <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '1rem', marginTop: '1rem' }}>
                        {loading ? <Loader className="animate-spin" /> : <UserPlus size={20} />} Create Account
                    </button>
                    <p style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.9rem' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>{t('login')}</Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default Signup;
