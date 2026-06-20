import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, Smartphone, AlertCircle, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Signup = () => {
    const [step, setStep] = useState(1);
    const [userData, setUserData] = useState({ 
        name: '', email: '', password: '', confirmPassword: '', role: 'consumer', phone: '', 
        address: { city: '', state: '', district: '', zip: '' },
        coordinates: null
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register, t } = useAuth();
    const navigate = useNavigate();

    // Password complexity check matching backend: min 8 chars, at least 1 letter and 1 number
    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
        return regex.test(password);
    };

    const handleNext = (e) => {
        e.preventDefault();
        setError('');
        
        if (!userData.name || !userData.email || !userData.password || !userData.confirmPassword) {
            setError('Please fill out all fields.');
            return;
        }

        // Validate password strength
        if (!validatePassword(userData.password)) {
            setError('Password must be at least 8 characters long and contain both letters and numbers (only letters, numbers, and @$!%*#?& are allowed).');
            return;
        }

        // Check password matching
        if (userData.password !== userData.confirmPassword) {
            setError('Passwords do not match.');
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
            await register(userData);
            // Redirect to verify-email with email parameter
            navigate(`/verify-email?email=${encodeURIComponent(userData.email)}`);
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
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="glass" 
                style={{ width: '100%', maxWidth: '480px', padding: '3rem 2.5rem', borderRadius: '1.5rem', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-card)', zIndex: 1, background: 'var(--bg-darkest)' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '1rem', background: 'rgba(22, 163, 74, 0.1)', border: '1px solid var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--primary)' }}>
                        <UserPlus size={26} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-light)' }}>Create Account</h2>
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
                                <div style={{ display: 'flex', gap: '0.5rem', padding: '0.25rem', background: 'var(--bg-darker)', borderRadius: '0.75rem', border: '1px solid var(--glass-border)' }}>
                                    {['consumer', 'farmer'].map(r => (
                                        <button 
                                            key={r} type="button" 
                                            className={`btn ${userData.role === r ? 'btn-primary' : 'btn-ghost'}`}
                                            style={{ flex: 1, textTransform: 'capitalize', padding: '0.6rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.9rem', border: 'none', transition: 'all 0.3s', color: userData.role === r ? 'var(--white)' : 'var(--text-light)', background: userData.role === r ? 'var(--primary)' : 'transparent', minHeight: '36px' }}
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
                                    style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 3rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '0.75rem', fontSize: '0.95rem' }} 
                                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                />
                            </div>

                            <div style={{ position: 'relative' }}>
                                <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                                <input 
                                    type="email" placeholder="Email Address" required
                                    value={userData.email}
                                    style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 3rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '0.75rem', fontSize: '0.95rem' }} 
                                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                />
                            </div>

                            <div style={{ position: 'relative' }}>
                                <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                                <input 
                                    type={showPassword ? "text" : "password"} placeholder="Password (min. 8 characters)" required
                                    value={userData.password}
                                    style={{ width: '100%', padding: '0.9rem 3.5rem 0.9rem 3rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '0.75rem', fontSize: '0.95rem' }} 
                                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 5, padding: 0, minHeight: 'auto', width: 'auto' }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div style={{ position: 'relative' }}>
                                <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                                <input 
                                    type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" required
                                    value={userData.confirmPassword}
                                    style={{ width: '100%', padding: '0.9rem 3.5rem 0.9rem 3rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '0.75rem', fontSize: '0.95rem' }} 
                                    onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 5, padding: 0, minHeight: 'auto', width: 'auto' }}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
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
                                    style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 3rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '0.75rem', fontSize: '0.95rem' }} 
                                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }} className="flex-responsive">
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <input 
                                        type="text" placeholder="City" required
                                        value={userData.address.city}
                                        style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '0.75rem', fontSize: '0.95rem' }} 
                                        onChange={(e) => setUserData({ ...userData, address: { ...userData.address, city: e.target.value } })}
                                    />
                                </div>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <input 
                                        type="text" placeholder="State" required
                                        value={userData.address.state}
                                        style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '0.75rem', fontSize: '0.95rem' }} 
                                        onChange={(e) => setUserData({ ...userData, address: { ...userData.address, state: e.target.value } })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }} className="flex-responsive">
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <input 
                                        type="text" placeholder="District" required
                                        value={userData.address.district}
                                        style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '0.75rem', fontSize: '0.95rem' }} 
                                        onChange={(e) => setUserData({ ...userData, address: { ...userData.address, district: e.target.value } })}
                                    />
                                </div>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <input 
                                        type="text" placeholder="Pincode" required
                                        value={userData.address.zip}
                                        style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '0.75rem', fontSize: '0.95rem' }} 
                                        onChange={(e) => setUserData({ ...userData, address: { ...userData.address, zip: e.target.value } })}
                                    />
                                </div>
                            </div>

                            {/* Optional Geolocation Capture */}
                            {userData.role === 'farmer' && (
                                <div style={{ background: 'rgba(22, 163, 74, 0.05)', padding: '1rem', borderRadius: '0.75rem', border: '1px dashed var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-light)' }}>GPS Store Location</h4>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>Captures coordinates to let consumers find you nearby.</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={detectLocation}
                                        style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', borderRadius: '2rem', background: userData.coordinates ? 'var(--primary)' : 'var(--bg-darker)', color: userData.coordinates ? 'var(--white)' : 'var(--text-light)', border: '1px solid var(--glass-border)', cursor: 'pointer', transition: 'all 0.3s', fontWeight: 'bold', minHeight: '36px' }}
                                    >
                                        {userData.coordinates ? 'Saved ✓' : 'Detect GPS'}
                                    </button>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setStep(1)}
                                    style={{ flex: 1, padding: '1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
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
                                        <div className="loading" style={{ width: '20px', height: '20px', borderTopColor: 'var(--white)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
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
