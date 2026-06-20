import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { resetPassword } = useAuth();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Password complexity check matching backend: min 8 chars, at least 1 letter and 1 number
    const validatePassword = (pwd) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
        return regex.test(pwd);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }

        // Validate password strength
        if (!validatePassword(password)) {
            setError('Password must be at least 8 characters long and contain both letters and numbers.');
            return;
        }

        // Check password matching
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await resetPassword(token, password, confirmPassword);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. The link may have expired or is invalid.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem 1rem' }}>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass"
                style={{ width: '100%', maxWidth: '440px', padding: '3rem 2rem', borderRadius: '1.5rem', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-card)', background: 'var(--bg-darkest)' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '1rem', background: 'rgba(22, 163, 74, 0.1)', border: '1px solid var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--primary)' }}>
                        <Lock size={26} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-light)' }}>Reset Password</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        Enter your new secure password below to regain access to your account.
                    </p>
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

                {success ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(22, 163, 74, 0.1)', color: 'var(--primary)', marginBottom: '1.25rem' }}>
                            <CheckCircle size={28} />
                        </div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '0.5rem' }}>Password Updated!</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem', lineHeight: '1.5' }}>
                            Your password has been successfully reset. You can now log in using your new password.
                        </p>

                        <Link 
                            to="/login" 
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', borderRadius: '0.75rem', textDecoration: 'none', fontWeight: 'bold' }}
                        >
                            Log In Now <ArrowRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 5 }} size={18} />
                            <input 
                                type={showPassword ? "text" : "password"} placeholder="New Password (min. 8 chars)" required
                                value={password}
                                style={{ width: '100%', padding: '0.9rem 3.5rem 0.9rem 3rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '0.75rem', fontSize: '0.95rem' }} 
                                onChange={(e) => setPassword(e.target.value)}
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
                            <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 5 }} size={18} />
                            <input 
                                type={showConfirmPassword ? "text" : "password"} placeholder="Confirm New Password" required
                                value={confirmPassword}
                                style={{ width: '100%', padding: '0.9rem 3.5rem 0.9rem 3rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '0.75rem', fontSize: '0.95rem' }} 
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                            disabled={loading}
                            style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} /> : 'Reset Password'}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPassword;
