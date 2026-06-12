import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, User, MessageSquare, CheckCircle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProductDetailsModal = ({ product, onClose }) => {
    const { user, lang } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [breakdown, setBreakdown] = useState({ 5:0, 4:0, 3:0, 2:0, 1:0 });
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');

    // Review Form State
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/reviews/product/${product._id}?sortBy=${sortBy}`);
            setReviews(data.reviews);
            setBreakdown(data.breakdown);
        } catch (err) {
            console.error('Failed to load reviews', err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReviews();
    }, [product._id, sortBy]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) {
            setError('Please select a star rating.');
            return;
        }
        if (!comment.trim()) {
            setError('Please write a review comment.');
            return;
        }

        setSubmitLoading(true);
        setError('');
        try {
            await axios.post('/api/reviews', { productId: product._id, rating, comment });
            setRating(0);
            setComment('');
            fetchReviews();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review');
        }
        setSubmitLoading(false);
    };

    const handleDelete = async (reviewId) => {
        if(!window.confirm('Delete this review?')) return;
        try {
            await axios.delete(`/api/reviews/${reviewId}`);
            fetchReviews();
        } catch (err) {
            console.error(err);
        }
    };

    const avgRating = product.averageRating || 0;
    const totalReviews = reviews.length;

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="glass" 
                style={{ maxWidth: '900px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
            >
                {/* Header */}
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{lang === 'te' ? 'పంట సమీక్షలు' : 'Product Reviews'}</h2>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }} className="hover-glow"><X size={20} /></button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', overflowY: 'auto' }}>
                    {/* Left Col: Product & Stats */}
                    <div style={{ flex: '1 1 300px', padding: '2rem', borderRight: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.1)' }}>
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{product.name}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                              By {product.farmer?.name || 'Local Farmer'} 
                              {product.farmer?.isVerified && <span style={{ color: 'var(--primary)', fontWeight: 'bold', marginLeft: '0.25rem' }}>🛡️ {lang === 'te' ? 'వెరిఫైడ్ రైతు' : 'Verified Farmer'}</span>}
                            </p>

                            {/* Call / WhatsApp Farmer Direct triggers */}
                            {product.farmer?.phone && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
                                    <a 
                                        href={`tel:${product.farmer.phone}`}
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '1.5rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textTransform: 'none', fontSize: '0.95rem' }}
                                    >
                                        📞 {lang === 'te' ? 'రైతుకు ఫోన్ చేయి' : 'Call Farmer'}
                                    </a>
                                    <a 
                                        href={`https://wa.me/${product.farmer.phone}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary"
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '1.5rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textTransform: 'none', fontSize: '0.95rem' }}
                                    >
                                        💬 {lang === 'te' ? 'వాట్సాప్ రైతు' : 'WhatsApp Farmer'}
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Average Rating Block */}
                        <div style={{ textAlign: 'center', marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px dashed rgba(0,255,157,0.2)' }}>
                            <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--primary)', lineHeight: 1 }}>{avgRating.toFixed(1)}</div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', margin: '0.5rem 0' }}>
                                {[1,2,3,4,5].map(star => (
                                    <Star key={star} size={20} fill={star <= Math.round(avgRating) ? "var(--primary)" : "transparent"} color="var(--primary)" />
                                ))}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Based on {totalReviews} reviews</div>
                        </div>

                        {/* Breakdown */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {[5,4,3,2,1].map(star => {
                                const count = breakdown[star] || 0;
                                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                                return (
                                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: '40px', fontSize: '0.85rem' }}>{star} <Star size={12} fill="var(--text-muted)" color="var(--text-muted)" /></div>
                                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }} />
                                        </div>
                                        <div style={{ width: '30px', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{count}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Right Col: Reviews & Form */}
                    <div style={{ flex: '2 1 400px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* Write Review Form */}
                        {user && user.role === 'consumer' && (
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MessageSquare size={18} color="var(--primary)" /> Write a Review
                                </h4>
                                {error && <div style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(239,68,68,0.1)', borderRadius: '0.5rem' }}>{error}</div>}
                                <form onSubmit={handleSubmit}>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                        {[1,2,3,4,5].map(star => (
                                            <Star 
                                                key={star} 
                                                size={24} 
                                                fill={star <= (hoverRating || rating) ? "var(--primary)" : "transparent"} 
                                                color={star <= (hoverRating || rating) ? "var(--primary)" : "var(--text-muted)"}
                                                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setRating(star)}
                                            />
                                        ))}
                                    </div>
                                    <textarea 
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Share your experience with this product..."
                                        style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem', resize: 'vertical', minHeight: '100px', marginBottom: '1rem' }}
                                    />
                                    <button type="submit" disabled={submitLoading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {submitLoading ? 'Submitting...' : <><Send size={16} /> Submit Review</>}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Review List */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Customer Reviews</h4>
                                <select 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value)}
                                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}
                                >
                                    <option value="newest">Latest</option>
                                    <option value="highest">Highest Rating</option>
                                    <option value="lowest">Lowest Rating</option>
                                </select>
                            </div>

                            {loading ? (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Loading reviews...</div>
                            ) : reviews.length === 0 ? (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem', background: 'rgba(0,0,0,0.1)', borderRadius: '1rem' }}>
                                    <Star size={40} opacity={0.2} style={{ margin: '0 auto 1rem' }} />
                                    <p>No reviews yet. Be the first to review this product!</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {reviews.map(review => (
                                        <div key={review._id} style={{ paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <User size={18} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{review.user?.name || 'User'}</div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                            {review.verifiedPurchase && <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><CheckCircle size={10} /> Verified Purchase</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex' }}>
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} fill={i < review.rating ? "#F59E0B" : "transparent"} color={i < review.rating ? "#F59E0B" : "rgba(255,255,255,0.2)"} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.9)' }}>{review.comment}</p>
                                            
                                            {user && user._id === review.user?._id && (
                                                <button onClick={() => handleDelete(review._id)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.5rem', padding: 0 }}>Delete Review</button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ProductDetailsModal;
