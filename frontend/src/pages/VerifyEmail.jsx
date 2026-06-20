import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, CheckCircle, XCircle, Loader2, ArrowRight, RefreshCw, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifyEmail = () => {
    const { token } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { verifyEmailToken, resendVerification, user } = useAuth();

    const queryParams = new URLSearchParams(location.search);
    const emailParam = queryParams.get('email') || user?.email || '';

    const [status, setStatus] = useState(token ? 'verifying' : 'prompt');
    const [message, setMessage] = useState('');
    const [resending, setResending] = useState(false);
    const [resendStatus, setResendStatus] = useState({ type: '', text: '' });

    useEffect(() => {
        if (token) {
            const verify = async () => {
                try {
                    const res = await verifyEmailToken(token);
                    setStatus('success');
                    setMessage(res.message || 'Email verified successfully!');
                } catch (err) {
                    setStatus('error');
                    setMessage(err.response?.data?.message || 'Email verification link is invalid or has expired.');
                }
            };
            verify();
        }
    }, [token]);

    const handleResend = async () => {
        if (!emailParam) {
            setResendStatus({ type: 'error', text: 'Please enter a valid email address first.' });
            return;
        }
        setResending(true);
        setResendStatus({ type: '', text: '' });
        try {
            const res = await resendVerification(emailParam);
            setResendStatus({ type: 'success', text: res.message || 'Verification email sent successfully!' });
        } catch (err) {
            setResendStatus({ 
                type: 'error', 
                text: err.response?.data?.message || 'Failed to resend verification email. Please try again.' 
            });
        } finally {
            setResending(false);
        }
    };

    const handleDashboardRedirect = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role === 'farmer') {
            navigate('/farmer');
        } else if (user.role === 'admin') {
            navigate('/admin');
        } else {
            navigate('/orders');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem 1rem' }}>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass"
                style={{ width: '100%', maxWidth: '480px', padding: '3rem 2rem', borderRadius: '1.5rem', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-card)', background: 'var(--bg-darkest)', textAlign: 'center' }}
            >
                {status === 'verifying' && (
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(22, 163, 74, 0.05)', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                            <Loader2 size={32} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-light)', marginBottom: '0.75rem' }}>Verifying Email</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                            Please wait while we verify your email token. This will only take a moment...
                        </p>
                    </div>
                )}

                {status === 'success' && (
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(22, 163, 74, 0.1)', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                            <CheckCircle size={36} />
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-light)', marginBottom: '0.75rem' }}>Verified! 🎉</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.5' }}>
                            {message || 'Your email address has been successfully verified.'}
                        </p>

                        <button 
                            className="btn btn-primary"
                            onClick={handleDashboardRedirect}
                            style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderRadius: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            Go to Dashboard <ArrowRight size={18} />
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', marginBottom: '1.5rem' }}>
                            <XCircle size={36} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-light)', marginBottom: '0.75rem' }}>Verification Failed</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.5' }}>
                            {message}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {emailParam && (
                                <button 
                                    className="btn btn-primary"
                                    onClick={handleResend}
                                    disabled={resending}
                                    style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    {resending ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                                    Resend Verification Email
                                </button>
                            )}
                            
                            <Link 
                                to="/login" 
                                className="btn btn-secondary"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', borderRadius: '0.75rem', textDecoration: 'none' }}
                            >
                                <LogIn size={18} /> Go to Login
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'prompt' && (
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(22, 163, 74, 0.05)', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                            <Mail size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-light)', marginBottom: '0.75rem' }}>Verify Your Email 🌾</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                            We have sent a verification link to your email address {emailParam ? <strong>({emailParam})</strong> : ''}. Please click the link to confirm your account.
                        </p>

                        <div style={{ background: 'rgba(22, 163, 74, 0.05)', border: '1px solid rgba(22, 163, 74, 0.1)', borderRadius: '0.75rem', padding: '1rem', marginBottom: '2rem', textAlign: 'left', fontSize: '0.8rem' }}>
                            <span style={{ fontWeight: 'bold', display: 'block', color: 'var(--primary)', marginBottom: '0.25rem' }}>💡 Sandbox Testing Tip</span>
                            <span style={{ color: 'var(--text-muted)', lineHeight: '1.4' }}>
                                Since this is a test environment, you can check the raw email details in the local email log file:
                                <code style={{ display: 'block', background: 'var(--bg-darker)', padding: '0.4rem', borderRadius: '0.4rem', marginTop: '0.4rem', wordBreak: 'break-all' }}>
                                    scratch/email_log.txt
                                </code>
                            </span>
                        </div>

                        {resendStatus.text && (
                            <div style={{ 
                                background: resendStatus.type === 'success' ? 'rgba(22, 163, 74, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                                border: `1px solid ${resendStatus.type === 'success' ? 'rgba(22, 163, 74, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                color: resendStatus.type === 'success' ? 'var(--primary)' : 'var(--error)',
                                padding: '0.75rem 1rem',
                                borderRadius: '0.5rem',
                                marginBottom: '1.5rem',
                                fontSize: '0.85rem',
                                textAlign: 'left'
                            }}>
                                {resendStatus.text}
                            </div>
                        )}

                        <button 
                            className="btn btn-primary"
                            onClick={handleResend}
                            disabled={resending}
                            style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}
                        >
                            {resending ? <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} /> : <RefreshCw size={18} />}
                            {resending ? 'Resending...' : 'Resend Verification Email'}
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
