import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, User, MessageSquare, CheckCircle, Send, Camera, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProductDetailsModal = ({ product, onClose }) => {
    const { user, lang } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [breakdown, setBreakdown] = useState({ 5:0, 4:0, 3:0, 2:0, 1:0 });
    const [percentages, setPercentages] = useState({ 5:0, 4:0, 3:0, 2:0, 1:0 });
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');

    // Review Form State (Only shown if eligible)
    const [eligibility, setEligibility] = useState({ eligible: false, orderId: null });
    const [checkingEligibility, setCheckingEligibility] = useState(true);
    
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');

    // Reporting modal state
    const [reportingReviewId, setReportingReviewId] = useState(null);
    const [reportReason, setReportReason] = useState('Spam');
    const [submittingReport, setSubmittingReport] = useState(false);
    const [reportSuccess, setReportSuccess] = useState('');

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/reviews/product/${product._id}?sortBy=${sortBy}`);
            setReviews(data.reviews || []);
            setBreakdown(data.breakdown || { 5:0, 4:0, 3:0, 2:0, 1:0 });
            setPercentages(data.percentages || { 5:0, 4:0, 3:0, 2:0, 1:0 });
        } catch (err) {
            console.error('Failed to load reviews', err);
        }
        setLoading(false);
    };

    const checkEligibility = async () => {
        if (!user || user.role !== 'consumer') {
            setCheckingEligibility(false);
            return;
        }
        setCheckingEligibility(true);
        try {
            const { data } = await axios.get(`/api/reviews/eligible-order/${product._id}`);
            setEligibility(data);
        } catch (err) {
            console.error('Error checking review eligibility:', err);
        } finally {
            setCheckingEligibility(false);
        }
    };

    useEffect(() => {
        fetchReviews();
        checkEligibility();
    }, [product._id, sortBy]);

    const handleAddImage = () => {
        if (imageUrlInput.trim()) {
            setImages([...images, imageUrlInput.trim()]);
            setImageUrlInput('');
        }
    };

    const handleRemoveImage = (idxToRemove) => {
        setImages(images.filter((_, idx) => idx !== idxToRemove));
    };

    const handleSimulatePhoto = () => {
        const mockPhotos = [
            'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500', // tomatoes
            'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500', // potatoes
            'https://images.unsplash.com/photo-1618519764620-7403abdbfee9?w=500', // onions
            'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500'  // grains
        ];
        const randomImg = mockPhotos[Math.floor(Math.random() * mockPhotos.length)];
        setImages([...images, randomImg]);
    };

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
            await axios.post('/api/reviews', { 
                productId: product._id, 
                orderId: eligibility.orderId,
                rating, 
                comment,
                images 
            });
            setRating(5);
            setComment('');
            setImages([]);
            fetchReviews();
            checkEligibility();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Delete this review?')) return;
        try {
            await axios.delete(`/api/reviews/${reviewId}`);
            fetchReviews();
            checkEligibility();
        } catch (err) {
            console.error('Delete review error:', err);
        }
    };

    const handleReportClick = (reviewId) => {
        setReportingReviewId(reviewId);
        setReportReason('Spam');
        setReportSuccess('');
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        setSubmittingReport(true);
        try {
            await axios.put(`/api/reviews/${reportingReviewId}/report`, { reportReason });
            setReportSuccess('Thank you. Review has been reported for moderation.');
            setTimeout(() => {
                setReportingReviewId(null);
            }, 2000);
        } catch (err) {
            console.error('Error reporting review:', err);
            alert('Failed to submit report. Please try again.');
        } finally {
            setSubmittingReport(false);
        }
    };

    const avgRating = product.averageRating || 0;
    const totalReviews = reviews.length;

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="glass" 
                style={{ maxWidth: '900px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', border: '1px solid var(--glass-border)' }}
            >
                {/* Header */}
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-dark)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-light)', margin: 0 }}>{lang === 'te' ? 'పంట సమీక్షలు' : 'Product Reviews'}</h2>
                    <button 
                        onClick={onClose} 
                        aria-label="Close details modal"
                        style={{ 
                            background: 'var(--bg-darker)', 
                            border: 'none', 
                            borderRadius: '50%', 
                            width: '40px', 
                            height: '40px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: 'var(--text-light)', 
                            cursor: 'pointer', 
                            minHeight: '40px', 
                            padding: 0,
                            transition: 'all 0.2s'
                        }} 
                        className="hover-glow"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', overflowY: 'auto' }}>
                    {/* Left Col: Product & Stats */}
                    <div style={{ flex: '1 1 300px', padding: '2rem', borderRight: '1px solid var(--glass-border)', background: 'var(--bg-dark)', textAlign: 'left' }}>
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-light)' }}>{product.name}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                              By {product.farmer?.name || 'Local Farmer'} 
                              {product.farmer?.isVerified && <span style={{ color: 'var(--primary)', fontWeight: 'bold', marginLeft: '0.25rem' }}>🛡️ {lang === 'te' ? 'వెరిఫైడ్' : 'Verified'}</span>}
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
                                        href={`https://wa.me/${product.farmer.phone.replace(/[^0-9]/g, '')}`}
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
                        <div style={{ textAlign: 'center', marginBottom: '2.5rem', padding: '1.5rem', background: 'var(--bg-darker)', borderRadius: '1rem', border: '1px dashed var(--primary)' }}>
                            <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--primary)', lineHeight: 1 }}>{avgRating.toFixed(1)}</div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', margin: '0.5rem 0' }}>
                                {[1,2,3,4,5].map(star => (
                                    <Star key={star} size={20} fill={star <= Math.round(avgRating) ? "var(--primary)" : "transparent"} color="var(--primary)" />
                                ))}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Based on {totalReviews} reviews</div>
                        </div>

                        {/* Breakdown with percentages */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {[5,4,3,2,1].map(star => {
                                const count = breakdown[star] || 0;
                                const pct = percentages[star] || 0;
                                return (
                                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: '40px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{star} <Star size={12} fill="var(--text-muted)" color="var(--text-muted)" /></div>
                                        <div style={{ flex: 1, height: '6px', background: 'var(--bg-darker)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }} />
                                        </div>
                                        <div style={{ width: '45px', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{pct}% ({count})</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Right Col: Reviews & Form */}
                    <div style={{ flex: '2 1 400px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'left', overflowY: 'auto', maxHeight: '70vh' }}>
                        
                        {/* Write Review Form - Check Eligibility */}
                        {!checkingEligibility && eligibility.eligible && (
                            <div style={{ background: 'var(--bg-dark)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
                                <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)', margin: '0 0 1rem' }}>
                                    <MessageSquare size={18} color="var(--primary)" /> Write a Review
                                </h4>
                                {error && <div style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(239,68,68,0.1)', borderRadius: '0.5rem' }}>{error}</div>}
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                                        style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', resize: 'vertical', minHeight: '100px' }}
                                    />
                                    
                                    {/* Crop photos input */}
                                    <div style={{ width: '100%' }}>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>📷 ADD CROP PHOTOS</label>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <input 
                                                type="text" 
                                                placeholder="Paste photo URL..." 
                                                value={imageUrlInput}
                                                onChange={(e) => setImageUrlInput(e.target.value)}
                                                style={{ flex: 1, padding: '0.4rem 0.6rem', borderRadius: '0.4rem', border: '1px solid var(--glass-border)', fontSize: '0.8rem' }}
                                            />
                                            <button type="button" onClick={handleAddImage} className="btn btn-secondary" style={{ minHeight: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Add</button>
                                            <button type="button" onClick={handleSimulatePhoto} className="btn btn-ghost" title="Simulate Capture" style={{ minHeight: 'auto', padding: '0.4rem', color: 'var(--primary)' }}><Camera size={16} /></button>
                                        </div>
                                        {images.length > 0 && (
                                            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', background: 'var(--bg-darker)', padding: '0.4rem', borderRadius: '0.4rem' }}>
                                                {images.map((img, idx) => (
                                                    <div key={idx} style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '0.25rem', overflow: 'hidden' }}>
                                                        <img src={img} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        <button type="button" onClick={() => handleRemoveImage(idx)} style={{ position: 'absolute', top: '1px', right: '1px', background: 'var(--text-primary)', border: 'none', width: '12px', height: '12px', borderRadius: '50%', color: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}><X size={8} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button type="submit" disabled={submitLoading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {submitLoading ? 'Submitting...' : <><Send size={16} /> Submit Review</>}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Review List */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-light)', margin: 0 }}>Customer Reviews</h4>
                                <select 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value)}
                                    style={{ width: 'auto', minHeight: 'auto', padding: '0.4rem 0.8rem !important' }}
                                >
                                    <option value="newest">Latest</option>
                                    <option value="highest">Highest Rating</option>
                                    <option value="lowest">Lowest Rating</option>
                                </select>
                            </div>

                            {loading ? (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Loading reviews...</div>
                            ) : reviews.length === 0 ? (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem', background: 'var(--bg-dark)', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
                                    <Star size={40} opacity={0.2} style={{ margin: '0 auto 1rem' }} color="var(--text-muted)" />
                                    <p style={{ margin: 0, fontWeight: 'bold' }}>No reviews yet.</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Be the first customer to review this product!</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {reviews.map(review => (
                                        <div key={review._id} style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-darker)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
                                                        <User size={18} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--text-light)' }}>{review.user?.name || 'User'}</div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                            <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'bold' }}>
                                                                ✓ Verified Buyer
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex' }}>
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} fill={i < review.rating ? "#F59E0B" : "transparent"} color={i < review.rating ? "#F59E0B" : "var(--glass-border)"} />
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-light)', margin: '0.25rem 0' }}>{review.comment}</p>
                                            
                                            {/* Renders review images */}
                                            {review.images && review.images.length > 0 && (
                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                                                    {review.images.map((img, idx) => (
                                                        <a key={idx} href={img} target="_blank" rel="noopener noreferrer" style={{ width: '60px', height: '60px', borderRadius: '0.4rem', overflow: 'hidden', border: '1px solid var(--glass-border)', display: 'block' }}>
                                                            <img src={img} alt="review capture" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        </a>
                                                    ))}
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                                {user && user._id === review.user?._id && (
                                                    <button onClick={() => handleDelete(review._id)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', fontSize: '0.8rem', cursor: 'pointer', padding: 0, minHeight: 'auto', textDecoration: 'underline' }}>Delete Review</button>
                                                )}
                                                {user && user._id !== review.user?._id && (
                                                    <button onClick={() => handleReportClick(review._id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', padding: 0, minHeight: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                                        ⚠️ Report
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Inappropriate Review Reporting Modal */}
            {reportingReviewId && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', padding: '1rem' }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass"
                        style={{ width: '100%', maxWidth: '400px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', borderRadius: '1.25rem' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <AlertTriangle size={18} color="var(--error)" /> Report Review
                            </h3>
                            <button 
                                onClick={() => setReportingReviewId(null)} 
                                aria-label="Close report dialog"
                                style={{ 
                                    background: 'transparent', 
                                    border: 'none', 
                                    color: 'var(--text-secondary)', 
                                    cursor: 'pointer', 
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '50%', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    transition: 'all 0.2s', 
                                    minHeight: '40px', 
                                    padding: 0 
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-darker)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {reportSuccess ? (
                            <div style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'center', padding: '1rem 0' }}>
                                {reportSuccess}
                            </div>
                        ) : (
                            <form onSubmit={handleReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Reason for Report</label>
                                    <select 
                                        value={reportReason} 
                                        onChange={(e) => setReportReason(e.target.value)}
                                        style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', background: 'var(--bg-darkest)', color: 'var(--text-light)', border: '1px solid var(--glass-border)' }}
                                    >
                                        <option value="Spam">Spam</option>
                                        <option value="Abuse">Abuse</option>
                                        <option value="Fake Review">Fake Review</option>
                                        <option value="Offensive Content">Offensive Content</option>
                                    </select>
                                </div>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary" 
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', fontWeight: 'bold', background: 'var(--error)', borderColor: 'var(--error)' }}
                                    disabled={submittingReport}
                                >
                                    {submittingReport ? 'Submitting...' : 'Submit Report'}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default ProductDetailsModal;
