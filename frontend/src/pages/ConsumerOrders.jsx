import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Package, Clock, Truck, CheckCircle, MapPin, Calendar, Heart, DollarSign, ShoppingBag, RefreshCw, X, Star, AlertCircle, Camera, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const getFriendlyNotification = (msg) => {
    if (!msg) return '';
    const lower = msg.toLowerCase();
    if (lower.includes('status updated to shipped') || lower.includes('shipped')) {
        return '🚚 Your order is on the way';
    }
    if (lower.includes('status updated to delivered') || lower.includes('delivered')) {
        return '✅ Order delivered successfully';
    }
    if (lower.includes('status updated to accepted') || lower.includes('accepted')) {
        return '👨‍🌾 Farmer accepted your order';
    }
    if (lower.includes('status updated to packed') || lower.includes('packed')) {
        return '📦 Order packed and ready for delivery';
    }
    if (lower.includes('payment processed') || lower.includes('payment completed')) {
        return '💰 Payment received';
    }
    return msg;
};

const StatusBadge = ({ status }) => {
    const config = {
        pending: { color: '#EAB308', bg: 'rgba(234, 179, 8, 0.1)', text: 'Processing' },
        accepted: { color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.1)', text: 'Accepted' },
        packed: { color: '#A855F7', bg: 'rgba(168, 85, 247, 0.1)', text: 'Packed' },
        shipped: { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', text: 'Shipped' },
        delivered: { color: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)', text: 'Delivered' },
        cancelled: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', text: 'Cancelled' }
    };
    const { color, bg, text } = config[status] || config.pending;

    return (
        <span style={{ 
            padding: '0.25rem 0.75rem', 
            borderRadius: '1rem', 
            fontSize: '0.7rem', 
            fontWeight: '700', 
            color, 
            background: bg,
            textTransform: 'uppercase',
            border: `1px solid ${color}33`
        }}>
            {text}
        </span>
    );
};

const SummaryCard = ({ title, value, icon: Icon, color }) => (
    <div className="glass" style={{ padding: '1.25rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: `3px solid ${color}` }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
            <Icon size={20} />
        </div>
        <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold' }}>{title}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: '0.2rem', color: 'var(--text-light)' }}>{value}</div>
        </div>
    </div>
);

const isOrderRecent = (createdAt) => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    return new Date(createdAt) >= ninetyDaysAgo;
};

const OrderCard = ({ order, onReviewClick, userReviews, onDeleteReview }) => {
    const { lang } = useAuth();
    const statuses = ['pending', 'accepted', 'packed', 'shipped', 'delivered'];
    const currentStatusIndex = statuses.indexOf(order.status);

    const formatAuditTime = (timestamp) => {
        if (!timestamp) return '';
        const d = new Date(timestamp);
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const recent = isOrderRecent(order.createdAt);

    return (
        <motion.div 
            className="glass" 
            style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderRadius: '1.25rem', border: '1px solid var(--glass-border)' }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between' }}>
                <div style={{ flex: '1 1 300px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Order ID: <strong style={{ color: 'var(--text-light)' }}>#{order._id.slice(-6).toUpperCase()}</strong></div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Placed on {new Date(order.createdAt).toLocaleDateString()}</div>
                        </div>
                        <StatusBadge status={order.status} />
                    </div>

                    <div style={{ display: 'grid', gap: '1.25rem' }}>
                        {order.items.map((item, idx) => {
                            if (!item.product) return null;
                            const reviewKey = `${order._id}_${item.product._id}`;
                            const existingReview = userReviews[reviewKey];

                            return (
                                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'var(--bg-darker)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Package size={18} color="var(--primary)" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-light)' }}>{item.product.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.quantity} kg x ₹{item.price}/kg</div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                                        <div style={{ fontWeight: '700', color: 'var(--text-light)', fontSize: '0.9rem' }}>₹{item.quantity * item.price}</div>
                                        
                                        {order.status === 'delivered' && (
                                            existingReview ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.15rem' }}>
                                                    <div style={{ display: 'flex', gap: '1px' }}>
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={10} fill={i < existingReview.rating ? "#eab308" : "transparent"} color={i < existingReview.rating ? "#eab308" : "var(--glass-border)"} />
                                                        ))}
                                                    </div>
                                                    {recent ? (
                                                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                            <button 
                                                                onClick={() => onReviewClick(item.product, order, existingReview)}
                                                                style={{ background: 'transparent', border: 'none', color: 'var(--primary)', padding: 0, fontSize: '0.7rem', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline' }}
                                                            >
                                                                Edit
                                                            </button>
                                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>|</span>
                                                            <button 
                                                                onClick={() => onDeleteReview(existingReview._id)}
                                                                style={{ background: 'transparent', border: 'none', color: 'var(--error)', padding: 0, fontSize: '0.7rem', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline' }}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Locked (90+ days)</span>
                                                    )}
                                                </div>
                                            ) : (
                                                recent ? (
                                                    <button 
                                                        onClick={() => onReviewClick(item.product, order, null)}
                                                        style={{ background: 'rgba(22, 163, 74, 0.05)', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.25rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.7rem', cursor: 'pointer', textTransform: 'none', minHeight: 'auto', fontWeight: '600' }}
                                                    >
                                                        Write Review
                                                    </button>
                                                ) : (
                                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                                        🔒 Over 90 Days
                                                    </span>
                                                )
                                            )
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ flex: '1 1 250px', display: 'grid', gap: '1rem', background: 'var(--bg-dark)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
                    <div>
                        <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <MapPin size={12} color="var(--primary)" /> Delivery Address
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: '1.4' }}>{order.shippingAddress}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <div>
                            <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Calendar size={12} color="var(--primary)" /> Schedule Date
                            </h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{new Date(order.deliverySchedule).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <CheckCircle size={12} color="var(--primary)" /> Payment
                            </h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{order.paymentMethod || 'COD'}</p>
                        </div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Amount</span>
                        <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.25rem' }}>₹{order.totalAmount}</span>
                    </div>
                    {/* Call Farmer and WhatsApp actions */}
                    {order.farmer && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                            {order.farmer.phone && (
                                <a 
                                    href={`tel:${order.farmer.phone}`}
                                    className="btn btn-secondary"
                                    style={{ flex: 1, minHeight: '40px', padding: '0.25rem 0.5rem', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                                >
                                    📞 Call Farmer
                                </a>
                            )}
                            {order.farmer.phone && (
                                <a 
                                    href={`https://wa.me/${order.farmer.phone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                    style={{ flex: 1, minHeight: '40px', padding: '0.25rem 0.5rem', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', background: '#25D366', borderColor: '#25D366', color: 'var(--white)' }}
                                >
                                    💬 WhatsApp
                                </a>
                            )}
                        </div>
                    )}
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button
                            onClick={() => navigate(`/orders/${order._id}/track`)}
                            className="btn btn-primary"
                            style={{ 
                                marginTop: '0.5rem', 
                                width: '100%', 
                                minHeight: '40px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '0.5rem',
                                fontWeight: 'bold'
                            }}
                        >
                            <Truck size={16} /> {lang === 'te' ? 'లైవ్ ట్రాక్ డెలివరీ' : 'Live Track Delivery'}
                        </button>
                    )}
                </div>
            </div>

            {/* Delivery Tracking Timeline with persistent Audit Trail */}
            {order.status !== 'cancelled' ? (
                <div style={{ marginTop: '0.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                        <Truck size={14} color="var(--primary)" /> {lang === 'te' ? 'ఆర్డర్ ట్రాకింగ్ హిస్టరీ' : 'Order Tracking History'}
                    </h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {/* Progress Bar Line */}
                        <div style={{ position: 'absolute', top: '14px', left: '8%', right: '8%', height: '3px', background: 'var(--glass-border)', zIndex: 0, borderRadius: '2px' }}>
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(Math.max(0, currentStatusIndex) / (statuses.length - 1)) * 100}%` }}
                                style={{ height: '100%', background: 'var(--primary)', borderRadius: '2px', transition: 'width 0.8s ease-in-out' }}
                            />
                        </div>

                        {statuses.map((s, i) => {
                            const auditItem = order.statusHistory?.find(h => h.status === s);
                            const isCompleted = currentStatusIndex >= i;
                            const isCurrent = currentStatusIndex === i;

                            const timelineColors = {
                                pending: '#9CA3AF',
                                accepted: '#16A34A',
                                packed: '#F97316',
                                shipped: '#3B82F6',
                                delivered: '#16A34A'
                            };

                            const statusLabels = {
                                pending: lang === 'te' ? 'ఆర్డర్ విజయవంతమైంది' : 'Order Placed',
                                accepted: lang === 'te' ? 'రైతు అంగీకరించారు' : 'Farmer Accepted',
                                packed: lang === 'te' ? 'సిద్ధంగా ఉంది' : 'Ready',
                                shipped: lang === 'te' ? 'మధ్యలో ఉంది' : 'On The Way',
                                delivered: lang === 'te' ? 'డెలివరీ చేయబడింది' : 'Delivered'
                            };

                            const nodeColor = timelineColors[s] || '#9CA3AF';
                            const label = statusLabels[s] || s;

                            return (
                                <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', zIndex: 1, minWidth: '75px', flex: 1, textAlign: 'center' }}>
                                    <div style={{ 
                                        width: '28px', height: '28px', borderRadius: '50%', 
                                        background: isCompleted ? nodeColor : 'var(--bg-darkest)',
                                        border: `2px solid ${isCompleted ? nodeColor : 'var(--glass-border)'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: isCurrent ? `0 0 12px ${nodeColor}` : 'none',
                                        transition: 'all 0.3s'
                                    }}>
                                        {isCompleted ? <CheckCircle size={14} color="var(--white)" /> : <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)' }} />}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: isCompleted ? 'var(--text-light)' : 'var(--text-muted)', fontWeight: isCurrent ? 'bold' : 'normal' }}>
                                            {label}
                                        </span>
                                        {auditItem && (
                                            <>
                                                <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 'bold' }}>{getFriendlyNotification(auditItem.note)}</span>
                                                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{formatAuditTime(auditItem.timestamp)}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div style={{ marginTop: '0.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--glass-border)', background: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px dashed var(--error)' }}>
                    <span style={{ fontSize: '1.25rem' }}>❌</span>
                    <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--error)' }}>Order Cancelled</div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                            {order.statusHistory?.find(h => h.status === 'cancelled')?.note || 'This order has been cancelled.'}
                            {order.statusHistory?.find(h => h.status === 'cancelled') && ` (${formatAuditTime(order.statusHistory.find(h => h.status === 'cancelled').timestamp)})`}
                        </p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

const ConsumerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [userReviews, setUserReviews] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const { t, lang } = useAuth();
    const navigate = useNavigate();

    // Review modal state
    const [reviewProduct, setReviewProduct] = useState(null);
    const [reviewOrder, setReviewOrder] = useState(null);
    const [editingReview, setEditingReview] = useState(null); // Review object if editing
    
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState('');
    const [reviewSuccess, setReviewSuccess] = useState('');

    const fetchConsumerData = async () => {
        setLoading(true);
        setError(false);
        try {
            const [ordersRes, wishlistRes, notificationsRes, reviewsRes] = await Promise.all([
                axios.get('/api/consumer/orders'),
                axios.get('/api/consumer/wishlist'),
                axios.get('/api/consumer/notifications?limit=5'),
                axios.get('/api/reviews/my-reviews')
            ]);
            setOrders(ordersRes.data || []);
            setWishlistCount(wishlistRes.data?.length || 0);
            setNotifications(notificationsRes.data?.notifications || []);

            // Map user reviews: key orderId_productId
            const reviewsMap = {};
            if (reviewsRes.data) {
                reviewsRes.data.forEach(r => {
                    if (r.order && r.product) {
                        reviewsMap[`${r.order}_${r.product._id}`] = r;
                    }
                });
            }
            setUserReviews(reviewsMap);
        } catch (error) {
            console.error('Fetch consumer orders dashboard error:', error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConsumerData();
    }, []);

    const handleReviewClick = (product, order, existingReview) => {
        setReviewProduct(product);
        setReviewOrder(order);
        setEditingReview(existingReview);
        
        if (existingReview) {
            setRating(existingReview.rating);
            setComment(existingReview.comment);
            setImages(existingReview.images || []);
        } else {
            setRating(5);
            setComment('');
            setImages([]);
        }
        
        setImageUrlInput('');
        setReviewError('');
        setReviewSuccess('');
    };

    const handleAddImage = () => {
        if (imageUrlInput.trim()) {
            setImages([...images, imageUrlInput.trim()]);
            setImageUrlInput('');
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        setImages(images.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSimulatePhoto = () => {
        const mockPhotos = [
            'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500', // fresh tomatoes
            'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500', // potatoes
            'https://images.unsplash.com/photo-1618519764620-7403abdbfee9?w=500', // onions
            'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500'  // grains/rice
        ];
        const randomImg = mockPhotos[Math.floor(Math.random() * mockPhotos.length)];
        setImages([...images, randomImg]);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setReviewError('');
        setReviewSuccess('');

        try {
            if (editingReview) {
                // Edit existing review
                await axios.put(`/api/reviews/${editingReview._id}`, {
                    rating,
                    comment,
                    images
                });
                setReviewSuccess('Your review has been updated successfully!');
            } else {
                // Create new review
                await axios.post('/api/reviews', {
                    productId: reviewProduct._id,
                    orderId: reviewOrder._id,
                    rating,
                    comment,
                    images
                });
                setReviewSuccess('Your review has been submitted successfully!');
            }

            // Reload data to reflect edits
            await fetchConsumerData();
            setTimeout(() => {
                setReviewProduct(null);
                setReviewOrder(null);
                setEditingReview(null);
            }, 2000);
        } catch (err) {
            console.error('Review submit error:', err);
            setReviewError(err.response?.data?.message || 'Failed to save review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;
        try {
            await axios.delete(`/api/reviews/${reviewId}`);
            await fetchConsumerData();
            alert('Review deleted successfully.');
        } catch (err) {
            console.error('Delete review error:', err);
            alert(err.response?.data?.message || 'Failed to delete review.');
        }
    };

    const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const totalSpending = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalAmount, 0);

    if (loading) {
        return (
            <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div className="loading" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Loading Orders...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ maxWidth: '600px', margin: '6rem auto', padding: '2rem', textAlign: 'center' }} className="glass">
                <AlertCircle size={48} color="var(--error)" style={{ margin: '0 auto 1.5rem' }} />
                <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-light)' }}>Failed to Load Dashboard</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>We encountered an error fetching your orders. Please check your connection and try again.</p>
                <button onClick={fetchConsumerData} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
                    <RefreshCw size={16} /> Retry
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem', paddingBottom: '6rem' }}>
            <h1 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '2rem', fontWeight: '800', color: 'var(--text-light)' }}>
                <Clock size={32} color="var(--primary)" /> {lang === 'te' ? 'కస్టమర్ డాష్‌బోర్డ్' : 'Consumer Dashboard'}
            </h1>

            {/* Top Metrics Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                <SummaryCard title={lang === 'te' ? 'యాక్టివ్ ఆర్డర్లు' : 'Active Orders'} value={activeOrders} icon={ShoppingBag} color="#EAB308" />
                <SummaryCard title={lang === 'te' ? 'డెలివరీ అయినవి' : 'Delivered Orders'} value={deliveredOrders} icon={CheckCircle} color="#16A34A" />
                <SummaryCard title={lang === 'te' ? 'మొత్తం ఖర్చు' : 'Total Spending'} value={`₹${totalSpending.toLocaleString()}`} icon={DollarSign} color="var(--primary)" />
                <SummaryCard title={lang === 'te' ? 'విష్‌లిస్ట్' : 'Wishlist'} value={`${wishlistCount} ${lang === 'te' ? 'వస్తువులు' : 'Items'}`} icon={Heart} color="#EF4444" />
            </div>

            {/* 2-Column Responsive Layout for Orders & Notifications */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
                {/* Left Column: Recent Orders */}
                <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                        {lang === 'te' ? 'ఇటీవలి ఆర్డర్లు' : 'Recent Orders'}
                    </h3>
                    {orders.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📦</div>
                            <h3 className="empty-state-title">{lang === 'te' ? 'ఇంకా ఆర్డర్లు లేవు' : 'No Orders Yet'}</h3>
                            <p className="empty-state-desc">{lang === 'te' ? 'స్థానిక రైతులు నేరుగా జాబితా చేసిన ఉత్పత్తులను అన్వేషించండి మరియు ఈ రోజు షాపింగ్ ప్రారంభించండి.' : 'Explore products listed directly by local farmers and start shopping today.'}</p>
                            <Link to="/store" className="btn btn-primary" style={{ borderRadius: '2rem', marginTop: '0.5rem', textDecoration: 'none' }}>{lang === 'te' ? 'షాపింగ్ ప్రారంభించండి' : 'Start Shopping'}</Link>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1.5rem', width: '100%' }}>
                            <AnimatePresence>
                                {orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(order => (
                                    <OrderCard 
                                        key={order._id} 
                                        order={order} 
                                        onReviewClick={handleReviewClick} 
                                        userReviews={userReviews}
                                        onDeleteReview={handleDeleteReview}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Right Column: Live Notifications */}
                <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '7.5rem' }}>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid var(--glass-border)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                            {lang === 'te' ? 'ఇటీవలి నోటిఫికేషన్లు' : 'Recent Notifications'}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {notifications.length === 0 ? (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '1.5rem 0' }}>
                                    🔔 {lang === 'te' ? 'నోటిఫికేషన్‌లు ఏవీ లేవు' : 'No notifications yet.'}
                                </div>
                            ) : (
                                notifications.slice(0, 3).map(n => (
                                    <div key={n._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--glass-border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: '700', fontSize: '0.8rem', color: n.read ? 'var(--text-muted)' : 'var(--text-light)' }}>{n.title}</span>
                                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                                {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.3 }}>{getFriendlyNotification(n.message)}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile-First Review Modal */}
            {reviewProduct && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="glass"
                        style={{ width: '100%', maxWidth: '460px', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', borderRadius: '1.5rem', boxShadow: 'var(--shadow-card)', maxHeight: '90vh', overflowY: 'auto' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-light)', margin: 0 }}>
                                {editingReview ? 'Update Review' : `Review ${reviewProduct.name}`}
                            </h3>
                            <button 
                                onClick={() => { setReviewProduct(null); setReviewOrder(null); setEditingReview(null); }} 
                                aria-label="Close review modal"
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

                        {reviewError && (
                            <div style={{ color: 'var(--error)', fontSize: '0.85rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                {reviewError}
                            </div>
                        )}
                        {reviewSuccess && (
                            <div style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '700', padding: '0.75rem', background: 'rgba(22, 163, 74, 0.08)', borderRadius: '0.5rem', border: '1px solid rgba(22, 163, 74, 0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle size={16} /> {reviewSuccess}
                            </div>
                        )}

                        {!reviewSuccess && (
                            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {/* Big Stars Rating Selection */}
                                <div style={{ textAlign: 'center', background: 'var(--bg-dark)', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>TAP STARS TO RATE</label>
                                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setRating(star)}
                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.2rem', transition: 'transform 0.15s' }}
                                                className="hover-scale"
                                            >
                                                <Star 
                                                    size={36} 
                                                    fill={star <= (hoverRating || rating) ? '#eab308' : 'transparent'} 
                                                    color={star <= (hoverRating || rating) ? '#eab308' : 'var(--glass-border)'} 
                                                    style={{ filter: star <= (hoverRating || rating) ? 'drop-shadow(0 0 4px rgba(234,179,8,0.2))' : 'none' }}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 'bold', marginTop: '0.5rem' }}>
                                        {rating === 5 ? 'Excellent! 😍' : rating === 4 ? 'Very Good! 😊' : rating === 3 ? 'Good 🙂' : rating === 2 ? 'Fair 😐' : 'Poor 😞'}
                                    </span>
                                </div>

                                {/* Comment Field */}
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>YOUR EXPERIENCE</label>
                                    <textarea
                                        rows={4}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Tell others about this product..."
                                        required
                                        style={{ width: '100%', padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid var(--glass-border)', background: 'var(--bg-darkest)', color: 'var(--text-light)', fontSize: '0.95rem', outline: 'none', resize: 'none' }}
                                    />
                                </div>

                                {/* Simulated Image Upload */}
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>📷 PRODUCT PHOTOS</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <input 
                                            type="text" 
                                            placeholder="Paste image URL..." 
                                            value={imageUrlInput}
                                            onChange={(e) => setImageUrlInput(e.target.value)}
                                            style={{ flex: 1, padding: '0.6rem 0.85rem', borderRadius: '0.5rem', border: '1px solid var(--glass-border)', background: 'var(--bg-darkest)', color: 'var(--text-light)', fontSize: '0.85rem' }}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={handleAddImage}
                                            className="btn btn-secondary"
                                            style={{ minHeight: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '0.5rem' }}
                                        >
                                            Add
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={handleSimulatePhoto}
                                            className="btn btn-ghost"
                                            title="Simulate Photo Capture"
                                            style={{ minHeight: 'auto', padding: '0.5rem', color: 'var(--primary)' }}
                                        >
                                            <Camera size={18} />
                                        </button>
                                    </div>

                                    {/* Uploaded Images Preview */}
                                    {images.length > 0 && (
                                        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', background: 'var(--bg-dark)', borderRadius: '0.5rem', padding: '0.5rem' }}>
                                            {images.map((img, idx) => (
                                                <div key={idx} style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '0.4rem', overflow: 'hidden', border: '1px solid var(--glass-border)', flexShrink: 0 }}>
                                                    <img src={img} alt="review crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleRemoveImage(idx)}
                                                        style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--white)', cursor: 'pointer', padding: 0 }}
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Submit Actions */}
                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        style={{ flex: 1, padding: '1rem', borderRadius: '0.75rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Saving...' : editingReview ? 'Update Review' : 'Submit Review'}
                                    </button>
                                    
                                    {editingReview && (
                                        <button
                                            type="button"
                                            onClick={() => { handleDeleteReview(editingReview._id); setReviewProduct(null); }}
                                            className="btn btn-ghost"
                                            style={{ padding: '1rem', color: 'var(--error)', borderRadius: '0.75rem', border: '1px solid var(--error)33', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </form>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ConsumerOrders;
