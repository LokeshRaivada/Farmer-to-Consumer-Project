import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, Smartphone, MapPin, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Signup = () => {
    const [step, setStep] = useState(1);
    const [userData, setUserData] = useState({ 
        name: '', email: '', password: '', role: 'consumer', phone: '', 
        address: { city: '', state: '', district: '', zip: '' },
        coordinates: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register, t } = useAuth();
    const navigate = useNavigate();

    const handleNext = (e) => {
        e.preventDefault();
        setError('');
        if (!userData.name || !userData.email || !userData.password) {
            setError('Please fill out all credentials.');
            return;
        }
        if (userData.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!userData.phone || !userData.address.city || !userData.address.state || !userData.address.district || !userData.address.zip) {
            setError('Please complete all contact and location fields.');
            return;
        }

        setLoading(true);
        try {
            const user = await register(userData);
            const params = new URLSearchParams(window.location.search);
            const redirect = params.get('redirect');
            if (user.role === 'farmer') navigate('/farmer');
            else if (redirect) navigate(`/${redirect}`);
            else navigate('/store');
        } catch (err) {
            setError(err.response?.data?.message || 'Error occurred during registration.');
        } finally {
            setLoading(false);
        }
    };

    const detectLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserData({ ...userData, coordinates: [pos.coords.longitude, pos.coords.latitude] });
                    alert('Location captured successfully!');
                },
                () => {
                    alert('Location access denied. Please fill address manually.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '85vh', padding: '2rem 1rem', position: 'relative', overflow: 'hidden' }}>
            {/* Background glowing blobs */}
            <div style={{ position: 'absolute', top: '10%', right: '20%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(0, 255, 157, 0.1) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', bottom: '10%', left: '20%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(0, 229, 255, 0.08) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }}></div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="glass" 
                style={{ width: '100%', maxWidth: '480px', padding: '3rem 2.5rem', borderRadius: '1.5rem', border: '1px solid rgba(0, 255, 157, 0.2)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)', zIndex: 1 }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '1rem', background: 'rgba(0, 255, 157, 0.1)', border: '1px solid var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--primary)' }}>
                        <UserPlus size={26} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'white' }}>Create Account</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Step {step} of 2 - {step === 1 ? 'Credentials' : 'Location & Details'}</p>
                </div>
                
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--error)', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}
                    >
                        <AlertCircle size={16} style={{ flexShrink: 0 }} /> <span>{error}</span>
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.form 
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleNext}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                        >
                            {/* Role selector */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>Select Account Type</label>
                                <div style={{ display: 'flex', gap: '0.5rem', padding: '0.25rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.75rem', border: '1px solid var(--glass-border)' }}>
                                    {['consumer', 'farmer'].map(r => (
                                        <button 
                                            key={r} type="button" 
                                            className={`btn ${userData.role === r ? 'btn-primary' : 'btn-ghost'}`}
                                            style={{ flex: 1, textTransform: 'capitalize', padding: '0.6rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.9rem', border: 'none', transition: 'all 0.3s' }}
                                            onClick={() => setUserData({ ...userData, role: r })}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ position: 'relative' }}>
                                <User style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                                <input 
                                    type="text" placeholder="Full Name" required
                                    value={userData.name}
                                    style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 3rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.75rem', fontSize: '0.95rem' }} 
                                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                />
                            </div>

                            <div style={{ position: 'relative' }}>
                                <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                                <input 
                                    type="email" placeholder="Email Address" required
                                    value={userData.email}
                                    style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 3rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.75rem', fontSize: '0.95rem' }} 
                                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                />
                            </div>

                            <div style={{ position: 'relative' }}>
                                <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                                <input 
                                    type="password" placeholder="Password (min. 6 characters)" required minLength={6}
                                    value={userData.password}
                                    style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 3rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.75rem', fontSize: '0.95rem' }} 
                                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                                />
                            </div>

                            <button 
                                className="btn btn-primary" 
                                type="submit" 
                                style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.95rem' }}
                            >
                                Continue <ArrowRight size={18} />
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form 
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleSubmit}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                        >
                            <div style={{ position: 'relative' }}>
                                <Smartphone style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                                <input 
                                    type="text" placeholder="Phone Number" required
                                    value={userData.phone}
                                    style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 3rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.75rem', fontSize: '0.95rem' }} 
                                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <input 
                                        type="text" placeholder="City" required
                                        value={userData.address.city}
                                        style={{ width: '100%', padding: '0.9rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.75rem', fontSize: '0.95rem' }} 
                                        onChange={(e) => setUserData({ ...userData, address: { ...userData.address, city: e.target.value } })}
                                    />
                                </div>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <input 
                                        type="text" placeholder="State" required
                                        value={userData.address.state}
                                        style={{ width: '100%', padding: '0.9rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.75rem', fontSize: '0.95rem' }} 
                                        onChange={(e) => setUserData({ ...userData, address: { ...userData.address, state: e.target.value } })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <input 
                                        type="text" placeholder="District" required
                                        value={userData.address.district}
                                        style={{ width: '100%', padding: '0.9rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.75rem', fontSize: '0.95rem' }} 
                                        onChange={(e) => setUserData({ ...userData, address: { ...userData.address, district: e.target.value } })}
                                    />
                                </div>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <input 
                                        type="text" placeholder="Pincode" required
                                        value={userData.address.zip}
                                        style={{ width: '100%', padding: '0.9rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.75rem', fontSize: '0.95rem' }} 
                                        onChange={(e) => setUserData({ ...userData, address: { ...userData.address, zip: e.target.value } })}
                                    />
                                </div>
                            </div>

                            {/* Optional Geolocation Capture */}
                            {userData.role === 'farmer' && (
                                <div style={{ background: 'rgba(0,255,157,0.03)', padding: '1rem', borderRadius: '0.75rem', border: '1px dashed rgba(0,255,157,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>GPS Store Location</h4>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>Captures coordinates to let consumers find you nearby.</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={detectLocation}
                                        style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', borderRadius: '2rem', background: userData.coordinates ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: userData.coordinates ? 'var(--bg-darkest)' : 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.3s', fontWeight: 'bold' }}
                                    >
                                        {userData.coordinates ? 'Saved ✓' : 'Detect GPS'}
                                    </button>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button 
                                    type="button" 
                                    className="btn btn-ghost" 
                                    onClick={() => setStep(1)}
                                    style={{ flex: 1, padding: '1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}
                                >
                                    <ArrowLeft size={18} /> Back
                                </button>
                                
                                <button 
                                    type="submit" 
                                    className="btn btn-primary" 
                                    disabled={loading}
                                    style={{ flex: 2, padding: '1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold' }}
                                >
                                    {loading ? (
                                        <div className="loading" style={{ width: '20px', height: '20px', borderTopColor: 'var(--bg-darkest)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                    ) : (
                                        <>
                                            Submit <UserPlus size={18} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1.5rem' }}>
                    Already have an account? <Link to={`/login${window.location.search}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>{t('login')}</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Signup;
