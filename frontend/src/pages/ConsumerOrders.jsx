import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Package, Clock, Truck, CheckCircle, MapPin, Calendar, Heart, DollarSign, ListOrdered, ShoppingBag, RefreshCw, X, Star, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

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
            <div style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: '0.2rem', color: 'white' }}>{value}</div>
        </div>
    </div>
);

const OrderCard = ({ order, onReviewClick }) => {
    const { lang } = useAuth();
    const statuses = ['pending', 'accepted', 'packed', 'shipped', 'delivered'];
    const currentStatusIndex = statuses.indexOf(order.status);

    // Formatter for audit timestamps
    const formatAuditTime = (timestamp) => {
        if (!timestamp) return '';
        const d = new Date(timestamp);
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Order ID: <strong style={{ color: 'white' }}>#{order._id.slice(-6).toUpperCase()}</strong></div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Placed on {new Date(order.createdAt).toLocaleDateString()}</div>
                        </div>
                        <StatusBadge status={order.status} />
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {order.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Package size={18} color="var(--primary)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>{item.product?.name || 'Deleted Product'}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.quantity} kg x ₹{item.price}/kg</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                    <div style={{ fontWeight: '700', color: 'white' }}>₹{item.quantity * item.price}</div>
                                    {order.status === 'delivered' && item.product && (
                                        <button 
                                            onClick={() => onReviewClick(item.product)}
                                            style={{ background: 'rgba(0, 255, 157, 0.08)', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.7rem', cursor: 'pointer', textTransform: 'none' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 255, 157, 0.15)' }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 255, 157, 0.08)' }}
                                        >
                                            Write Review
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ flex: '1 1 250px', display: 'grid', gap: '1rem', background: 'rgba(255,255,255,0.01)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.03)' }}>
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
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Amount</span>
                        <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.25rem' }}>₹{order.totalAmount}</span>
                    </div>
                </div>
            </div>

            {/* Delivery Tracking Timeline with persistent Audit Trail */}
            {order.status !== 'cancelled' ? (
                <div style={{ marginTop: '0.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                        <Truck size={14} color="var(--primary)" /> {lang === 'te' ? 'ఆర్డర్ ట్రాకింగ్ హిస్టరీ' : 'Order Tracking History'}
                    </h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {/* Progress Bar Line */}
                        <div style={{ position: 'absolute', top: '14px', left: '8%', right: '8%', height: '3px', background: 'rgba(255,255,255,0.05)', zIndex: 0, borderRadius: '2px' }}>
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(Math.max(0, currentStatusIndex) / (statuses.length - 1)) * 100}%` }}
                                style={{ height: '100%', background: 'var(--primary)', borderRadius: '2px', transition: 'width 0.8s ease-in-out' }}
                            />
                        </div>

                        {statuses.map((s, i) => {
                            // Find matching audit status
                            const auditItem = order.statusHistory?.find(h => h.status === s);
                            const isCompleted = currentStatusIndex >= i;
                            const isCurrent = currentStatusIndex === i;

                            const timelineColors = {
                                pending: '#9CA3AF', // Gray
                                accepted: '#10B981', // Green
                                packed: '#F97316', // Orange
                                shipped: '#3B82F6', // Blue
                                delivered: '#10B981' // Green
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
                                        border: `2px solid ${isCompleted ? nodeColor : 'rgba(255,255,255,0.1)'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: isCurrent ? `0 0 12px ${nodeColor}` : 'none',
                                        transition: 'all 0.3s'
                                    }}>
                                        {isCompleted ? <CheckCircle size={14} color="var(--bg-darkest)" /> : <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: isCompleted ? 'white' : 'var(--text-muted)', fontWeight: isCurrent ? 'bold' : 'normal' }}>
                                            {label}
                                        </span>
                                        {auditItem && (
                                            <>
                                                <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 'bold' }}>{auditItem.note}</span>
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
                <div style={{ marginTop: '0.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(239, 68, 68, 0.03)', padding: '1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px dashed rgba(239, 68, 68, 0.15)' }}>
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const { t } = useAuth();

    // Review Modal States
    const [reviewProduct, setReviewProduct] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState('');
    const [reviewSuccess, setReviewSuccess] = useState('');

    const fetchConsumerData = async () => {
        setLoading(true);
        setError(false);
        try {
            const [ordersRes, wishlistRes, notificationsRes] = await Promise.all([
                axios.get('/api/consumer/orders'),
                axios.get('/api/consumer/wishlist'),
                axios.get('/api/consumer/notifications?limit=5')
            ]);
            setOrders(ordersRes.data || []);
            setWishlistCount(wishlistRes.data?.length || 0);
            setNotifications(notificationsRes.data?.notifications || []);
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

    const handleReviewClick = (product) => {
        setReviewProduct(product);
        setRating(5);
        setComment('');
        setReviewError('');
        setReviewSuccess('');
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setReviewError('');
        setReviewSuccess('');

        try {
            await axios.post('/api/reviews', {
                productId: reviewProduct._id,
                rating,
                comment
            });
            setReviewSuccess('Thank you! Your review has been submitted successfully.');
            setTimeout(() => {
                setReviewProduct(null);
            }, 2000);
        } catch (err) {
            console.error('Review submit error:', err);
            setReviewError(err.response?.data?.message || 'Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Summary math
    const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const totalSpending = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalAmount, 0);

    if (loading) {
        return (
            <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ width: '200px', height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '1rem' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    {[...Array(5)].map((_, i) => <div key={i} className="glass" style={{ height: '80px', borderRadius: '1rem', opacity: 0.5 }} />)}
                </div>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="glass skeleton-glow" style={{ height: '220px', borderRadius: '1.25rem', opacity: 0.3 }} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ maxWidth: '600px', margin: '6rem auto', padding: '2rem', textAlign: 'center' }} className="glass">
                <AlertCircle size={48} color="var(--error)" style={{ margin: '0 auto 1.5rem' }} />
                <h2 style={{ marginBottom: '0.5rem' }}>Failed to Load Dashboard</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>We encountered an error fetching your orders. Please check your connection and try again.</p>
                <button onClick={fetchConsumerData} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
                    <RefreshCw size={16} /> Retry
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem', paddingBottom: '6rem' }}>
            <h1 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '2rem', fontWeight: '800' }}>
                <Clock size={32} color="var(--primary)" /> Consumer Dashboard
            </h1>

            {/* Top Metrics Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                <SummaryCard title="Active Orders" value={activeOrders} icon={ShoppingBag} color="#EAB308" />
                <SummaryCard title="Delivered Orders" value={deliveredOrders} icon={CheckCircle} color="#22C55E" />
                <SummaryCard title="Total Spending" value={`₹${totalSpending.toLocaleString()}`} icon={DollarSign} color="#00ff9d" />
                <SummaryCard title="Wishlist" value={`${wishlistCount} Items`} icon={Heart} color="#EF4444" />
            </div>

            {/* 2-Column Responsive Layout for Orders & Notifications */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
                {/* Left Column: Recent Orders */}
                <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
                        Recent Orders
                    </h3>
                    {orders.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass" 
                            style={{ padding: '6rem 2rem', textAlign: 'center', borderRadius: '1.25rem', border: '1px dashed rgba(255,255,255,0.1)' }}
                        >
                            <div style={{ opacity: 0.2, marginBottom: '1.5rem' }}><ShoppingBag size={56} style={{ margin: '0 auto' }} /></div>
                            <h2 style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>No orders placed yet</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 2rem' }}>Explore products listed directly by local farmers and start shopping today.</p>
                            <Link to="/store" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '2rem' }}>Start Shopping</Link>
                        </motion.div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1.5rem', width: '100%' }}>
                            <AnimatePresence>
                                {orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(order => (
                                    <OrderCard key={order._id} order={order} onReviewClick={handleReviewClick} />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Right Column: Live Notifications (Phase 6) */}
                <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '7.5rem' }}>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid var(--glass-border)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
                            Recent Notifications
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {notifications.length === 0 ? (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '1.5rem 0' }}>
                                    🔔 No notifications yet.
                                </div>
                            ) : (
                                notifications.slice(0, 3).map(n => (
                                    <div key={n._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: '700', fontSize: '0.8rem', color: n.read ? 'var(--text-muted)' : 'white' }}>{n.title}</span>
                                            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>
                                                {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.3 }}>{n.message}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Submission Modal (Phase 5) */}
            {reviewProduct && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', padding: '1rem' }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass"
                        style={{ width: '100%', maxWidth: '450px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'var(--bg-dark)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>Review {reviewProduct.name}</h3>
                            <button 
                                onClick={() => setReviewProduct(null)} 
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {reviewError && <div style={{ color: 'var(--error)', fontSize: '0.85rem' }}>{reviewError}</div>}
                        {reviewSuccess && <div style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600' }}>{reviewSuccess}</div>}

                        {!reviewSuccess && (
                            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                {/* Stars Selection */}
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Rating</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                                            >
                                                <Star 
                                                    size={24} 
                                                    fill={star <= rating ? '#eab308' : 'transparent'} 
                                                    color={star <= rating ? '#eab308' : 'rgba(255, 255, 255, 0.2)'} 
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Comment Field */}
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Review Comment</label>
                                    <textarea
                                        rows={4}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Share your experience with this crop..."
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.15)', color: 'white', background: 'rgba(255,255,255,0.02)', outline: 'none', resize: 'none' }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '0.8rem 0', borderRadius: '2rem', marginTop: '0.5rem' }}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ConsumerOrders;
