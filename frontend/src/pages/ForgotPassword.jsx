import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Phone, Lock, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { forgotPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await forgotPassword({
                email,
                phone,
                newPassword,
                confirmPassword
            });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Please check your email and phone number.');
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
                        Provide your registered email and phone number to set a new password directly.
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
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '0.5rem' }}>Password Reset Successful!</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                            Your password has been successfully updated. You can now use your new password to log in.
                        </p>

                        <Link 
                            to="/login" 
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', borderRadius: '0.75rem', textDecoration: 'none', fontWeight: 'bold' }}
                        >
                            Go to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                            <input 
                                type="email" placeholder="Email Address" required
                                value={email}
                                style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 3rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '0.75rem', fontSize: '0.95rem' }} 
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <Phone style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                            <input 
                                type="tel" placeholder="Phone Number" required
                                value={phone}
                                style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 3rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '0.75rem', fontSize: '0.95rem' }} 
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                            <input 
                                type="password" placeholder="New Password" required
                                value={newPassword}
                                style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 3rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '0.75rem', fontSize: '0.95rem' }} 
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                            <input 
                                type="password" placeholder="Confirm New Password" required
                                value={confirmPassword}
                                style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 3rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '0.75rem', fontSize: '0.95rem' }} 
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button 
                            className="btn btn-primary" 
                            type="submit" 
                            disabled={loading}
                            style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} /> : 'Reset Password'}
                        </button>

                        <Link 
                            to="/login" 
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', marginTop: '0.5rem' }}
                        >
                            <ArrowLeft size={16} /> Back to Login
                        </Link>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
