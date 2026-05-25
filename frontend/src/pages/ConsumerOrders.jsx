import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Package, Clock, Truck, CheckCircle, MapPin, Calendar, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StatusBadge = ({ status }) => {
    const config = {
        pending: { color: '#EAB308', bg: 'rgba(234, 179, 8, 0.1)', text: 'Processing' },
        shipped: { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', text: 'Shipped' },
        delivered: { color: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)', text: 'Delivered' },
        cancelled: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', text: 'Cancelled' }
    };
    const { color, bg, text } = config[status] || config.pending;

    return (
        <span style={{ 
            padding: '0.25rem 0.75rem', 
            borderRadius: '1rem', 
            fontSize: '0.75rem', 
            fontWeight: '600', 
            color, 
            background: bg,
            textTransform: 'uppercase'
        }}>
            {text}
        </span>
    );
};

const OrderCard = ({ order }) => {
    const statuses = ['pending', 'accepted', 'packed', 'shipped', 'delivered'];
    const currentStatusIndex = statuses.indexOf(order.status);

    return (
        <motion.div 
            className="glass" 
            style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                <div style={{ flex: '1 1 300px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Order ID: #{order._id.slice(-6).toUpperCase()}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Placed on {new Date(order.createdAt).toLocaleDateString()}</div>
                        </div>
                        <StatusBadge status={order.status} />
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {order.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ width: '40px', height: '40px', background: 'var(--glass-bg)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Package size={20} color="var(--primary)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '1rem' }}>{item.product?.name || 'Deleted Product'}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.quantity} kg x ₹{item.price}/kg</div>
                                </div>
                                <div style={{ fontWeight: '600' }}>₹{item.quantity * item.price}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ flex: '0 0 250px', display: 'grid', gap: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '1rem' }}>
                    <div>
                        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={14} /> Delivery Address
                        </h4>
                        <p style={{ fontSize: '0.9rem' }}>{order.shippingAddress}</p>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={14} /> Schedule Date
                        </h4>
                        <p style={{ fontSize: '0.9rem' }}>{new Date(order.deliverySchedule).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle size={14} /> Payment Method
                        </h4>
                        <p style={{ fontSize: '0.9rem' }}>{order.paymentMethod || 'COD'}</p>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 'bold' }}>
                            <span>Total Amount</span>
                            <span style={{ color: 'var(--secondary)' }}>₹{order.totalAmount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delivery Tracking Timeline */}
            {order.status !== 'cancelled' && (
                <div style={{ marginTop: '1rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Truck size={18} color="var(--primary)" /> Delivery Tracking
                    </h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                        {/* Connecting Line */}
                        <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '4px', background: 'rgba(255,255,255,0.1)', zIndex: 0, borderRadius: '2px' }}>
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(Math.max(0, currentStatusIndex) / (statuses.length - 1)) * 100}%` }}
                                style={{ height: '100%', background: 'var(--primary)', borderRadius: '2px', transition: 'width 1s ease-in-out' }}
                            />
                        </div>

                        {statuses.map((s, i) => {
                            const isCompleted = currentStatusIndex >= i;
                            const isCurrent = currentStatusIndex === i;
                            return (
                                <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 1, width: '20%' }}>
                                    <div style={{ 
                                        width: '34px', height: '34px', borderRadius: '50%', 
                                        background: isCompleted ? 'var(--primary)' : 'var(--bg-darkest)',
                                        border: `2px solid ${isCompleted ? 'var(--primary)' : 'rgba(255,255,255,0.2)'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: isCurrent ? '0 0 15px var(--primary)' : 'none',
                                        transition: 'all 0.3s'
                                    }}>
                                        {isCompleted ? <CheckCircle size={16} color="var(--bg-darkest)" /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />}
                                    </div>
                                    <span style={{ fontSize: '0.75rem', textTransform: 'capitalize', color: isCompleted ? 'white' : 'var(--text-muted)', fontWeight: isCurrent ? 'bold' : 'normal' }}>
                                        {s}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

const ConsumerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, t } = useAuth();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await axios.get('/api/consumer/orders');
                setOrders(data);
            } catch (error) {
                console.error('Fetch orders error:', error);
            }
            setLoading(false);
        };
        fetchOrders();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>{t('loading')}</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
            <h1 style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Clock size={32} color="var(--primary)" /> Your Orders
            </h1>

            {orders.length === 0 ? (
                <div className="glass" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
                    <div style={{ opacity: 0.3, marginBottom: '2rem' }}><Package size={64} style={{ margin: '0 auto' }} /></div>
                    <h2 style={{ marginBottom: '1rem' }}>No orders found</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You haven't placed any orders yet. Start supporting local farmers today!</p>
                    <a href="/store" className="btn btn-primary">Start Shopping</a>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '2rem' }}>
                    <AnimatePresence>
                        {orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(order => (
                            <OrderCard key={order._id} order={order} />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default ConsumerOrders;
