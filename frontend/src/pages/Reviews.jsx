import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Award, ArrowUpRight, Loader, Leaf, User, Send, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Reviews = () => {
    const { user } = useAuth();
    
    const [data, setData] = useState({
        latestReviews: [],
        highestRatedProducts: [],
        topFarmers: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Website Review Form States
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState('');
    const [submitError, setSubmitError] = useState('');

    const fetchReviewsData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get('/api/reviews/page-data');
            setData(res.data);
        } catch (err) {
            console.error('Error fetching reviews page data:', err);
            setError('Failed to load reviews data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviewsData();
    }, []);

    const handleWebsiteReviewSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitSuccess('');
        setSubmitError('');

        try {
            const { data: newReview } = await axios.post('/api/reviews', {
                rating,
                comment,
                reviewType: 'website'
            });

            setSubmitSuccess('Thank you! Your website feedback has been submitted.');
            setComment('');
            setRating(5);

            // Insert new review into the local list immediately
            setData(prev => ({
                ...prev,
                latestReviews: [newReview, ...prev.latestReviews].slice(0, 6)
            }));
        } catch (err) {
            console.error('Website review submit error:', err);
            setSubmitError(err.response?.data?.message || 'Failed to submit review.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        const floor = Math.floor(rating);
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star 
                    key={i} 
                    size={14} 
                    fill={i <= floor ? '#eab308' : 'transparent'} 
                    color={i <= floor ? '#eab308' : 'rgba(255, 255, 255, 0.2)'} 
                />
            );
        }
        return stars;
    };

    if (loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                <Loader className="animate-spin" size={32} color="var(--primary)" />
                <span style={{ color: 'var(--text-muted)' }}>Loading reviews & highlights...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', textAlign: 'center' }} className="glass">
                <p style={{ color: 'var(--error)', marginBottom: '1.5rem' }}>{error}</p>
                <button className="btn btn-primary" onClick={fetchReviewsData} style={{ borderRadius: '2rem' }}>Retry</button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem', textAlign: 'left' }}>
            {/* Header & Website Review Form Split Section */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '3rem', alignItems: 'center' }}>
                <div style={{ flex: '1 1 400px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <MessageSquare size={36} color="var(--primary)" /> Community Hub
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0, lineHeight: 1.5 }}>
                        Read transparent reviews from fellow consumers and discover top-rated fresh produce and farmers. Help us improve by submitting website feedback!
                    </p>
                </div>

                {/* Website Feedback Form Card */}
                <div style={{ flex: '1 1 350px' }}>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid var(--glass-border)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            💬 Rate Our Website & Platform
                        </h3>

                        {submitError && <div style={{ color: 'var(--error)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{submitError}</div>}
                        {submitSuccess && <div style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{submitSuccess}</div>}

                        {user ? (
                            <form onSubmit={handleWebsiteReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rating:</span>
                                    <div style={{ display: 'flex', gap: '0.2rem' }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star} type="button" onClick={() => setRating(star)}
                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                                            >
                                                <Star 
                                                    size={18} 
                                                    fill={star <= rating ? '#eab308' : 'transparent'} 
                                                    color={star <= rating ? '#eab308' : 'rgba(255, 255, 255, 0.2)'} 
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <textarea
                                    rows={2} required value={comment} onChange={(e) => setComment(e.target.value)}
                                    placeholder="Write website feedback..."
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.02)', color: 'white', outline: 'none', fontSize: '0.8rem', resize: 'none' }}
                                />
                                <button 
                                    type="submit" disabled={submitting} className="btn btn-primary"
                                    style={{ width: '100%', padding: '0.5rem 0', borderRadius: '1.5rem', fontSize: '0.8rem', textTransform: 'none', minHeight: '32px' }}
                                >
                                    {submitting ? 'Submitting...' : <><Send size={12} /> Submit Website Review</>}
                                </button>
                            </form>
                        ) : (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem 0' }}>
                                🔒 Please log in to leave website feedback.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Grid Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', lg: 'repeat(3, 1fr)', gap: '2rem' }} className="reviews-grid">
                {/* Column 1: Latest Reviews */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MessageSquare size={18} color="var(--primary)" /> Latest Feedback
                    </h2>
                    {data.latestReviews.length === 0 ? (
                        <div className="glass" style={{ padding: '3rem 1.5rem', textAlign: 'center', borderRadius: '1rem' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>No reviews submitted yet.</p>
                        </div>
                    ) : (
                        data.latestReviews.map(r => (
                            <motion.div 
                                key={r._id}
                                whileHover={{ y: -2 }}
                                className="glass"
                                style={{ padding: '1.25rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'white', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <User size={12} color="var(--text-muted)" /> {r.user?.name || 'Anonymous User'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {r.reviewType === 'website' ? (
                                                <span style={{ color: 'var(--primary)', fontWeight: '500' }}>Platform Feedback 🌐</span>
                                            ) : r.reviewType === 'farmer' ? (
                                                <span>Reviewed Farmer <span style={{ color: 'var(--primary)', fontWeight: '500' }}>{r.farmer?.name || 'Verified Farmer'}</span></span>
                                            ) : (
                                                <span>Reviewed Crop <span style={{ color: 'var(--primary)', fontWeight: '500' }}>{r.product?.name || 'Deleted Crop'}</span></span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1px' }}>
                                        {renderStars(r.rating)}
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic', lineHeight: '1.4' }}>
                                    "{r.comment}"
                                </p>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {r.verifiedPurchase && <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✓ Verified Purchase</span>}
                                    <span>{new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Column 2: Highest Rated Products */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Leaf size={18} color="var(--primary)" /> Top Crop Selection
                    </h2>
                    {data.highestRatedProducts.length === 0 ? (
                        <div className="glass" style={{ padding: '3rem 1.5rem', textAlign: 'center', borderRadius: '1rem' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>No highly rated crops available yet.</p>
                        </div>
                    ) : (
                        data.highestRatedProducts.map(p => (
                            <motion.div 
                                key={p._id}
                                whileHover={{ y: -2 }}
                                className="glass"
                                style={{ padding: '1.25rem', borderRadius: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}
                            >
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0,255,157,0.05)', border: '1px solid rgba(0,255,157,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Leaf size={24} color="var(--primary)" />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'white', margin: 0 }}>{p.name}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#eab308', fontSize: '0.8rem', fontWeight: '600' }}>
                                            <Star size={12} fill="#eab308" color="#eab308" />
                                            <span>{p.averageRating.toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>By {p.farmer?.name || 'Verified Farmer'}</span>
                                        <span>({p.numReviews} review{p.numReviews !== 1 ? 's' : ''})</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'white' }}>₹{p.price}/kg</span>
                                        <Link to="/store" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                            Shop Crop <ArrowUpRight size={12} />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Column 3: Top Rated Farmers */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Award size={18} color="var(--primary)" /> Top Ranked Farmers
                    </h2>
                    {data.topFarmers.length === 0 ? (
                        <div className="glass" style={{ padding: '3rem 1.5rem', textAlign: 'center', borderRadius: '1rem' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>No verified farmer rankings yet.</p>
                        </div>
                    ) : (
                        data.topFarmers.map(f => (
                            <motion.div 
                                key={f._id}
                                whileHover={{ y: -2 }}
                                className="glass"
                                style={{ padding: '1.25rem', borderRadius: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}
                            >
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0,255,157,0.1)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                    {f.name.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            {f.name}
                                            {f.isVerified && <span style={{ color: 'var(--primary)', fontSize: '0.8rem' }} title="Verified profile">🛡️</span>}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#eab308', fontSize: '0.8rem', fontWeight: '600' }}>
                                            <Star size={12} fill="#eab308" color="#eab308" />
                                            <span>{f.rating.toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {f.address?.city || 'Local Area'}, {f.address?.state || 'India'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                                        <span>🌾 <strong>{f.productsCount}</strong> Active Crops</span>
                                        <span>💬 <strong>{f.reviewsCount}</strong> Review{f.reviewsCount !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Custom Responsive Styles */}
            <style dangerouslySetInnerHTML={{__html: `
                @media (min-width: 992px) {
                    .reviews-grid {
                        grid-template-columns: repeat(3, 1fr) !important;
                    }
                }
            `}} />
        </div>
    );
};

export default Reviews;
