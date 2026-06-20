import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash, Package, ShoppingBag, DollarSign, MapPin, CheckCircle, Clock, Search, Bell, X, BarChart3, TrendingUp, Star, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 8000 },
  { name: 'Apr', revenue: 6000 },
  { name: 'May', revenue: 11000 },
  { name: 'Jun', revenue: 9500 },
];

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="glass" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', borderRadius: '1rem', flex: '1 1 220px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '1rem', background: `rgba(${color}, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={24} color={`rgb(${color})`} />
        </div>
        <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{title}</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.1rem 0 0 0', color: 'var(--text-light)' }}>{value}</h3>
        </div>
    </div>
);

const FarmerDashboard = () => {
    const { t, user, lang } = useAuth();
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', price: '', quantity: '', category: 'vegetables', description: '' });
    const [activeTab, setActiveTab] = useState('overview');
    const [farmerStats, setFarmerStats] = useState({ averageRating: 0, numReviews: 0, recentReviews: [] });
    const [wizardStep, setWizardStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDashData = async () => {
        setLoading(true);
        setError('');
        try {
            const { data: prodData } = await axios.get('/api/farmer/products');
            setProducts(prodData);
            const { data: orderData } = await axios.get('/api/farmer/orders');
            setOrders(orderData);
            try {
                const { data: statsData } = await axios.get('/api/reviews/farmer/stats');
                setFarmerStats(statsData);
            } catch (err) {
                console.error('Fetch stats error:', err);
            }
        } catch (err) {
            console.error('Fetch dashboard data error:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashData(); }, []);

    const handleNextStep = () => {
        if (wizardStep === 1 && !formData.name.trim()) {
            alert('Please enter crop name');
            return;
        }
        if (wizardStep === 2 && (!formData.price || Number(formData.price) <= 0)) {
            alert('Please enter a valid price');
            return;
        }
        if (wizardStep === 3 && (!formData.quantity || Number(formData.quantity) <= 0)) {
            alert('Please enter a valid quantity');
            return;
        }
        setWizardStep(prev => prev + 1);
    };

    const handlePrevStep = () => {
        setWizardStep(prev => Math.max(1, prev - 1));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/farmer/products', formData);
            setShowAddForm(false);
            setWizardStep(1);
            setFormData({ name: '', price: '', quantity: '', category: 'vegetables', description: '' });
            fetchDashData();
        } catch (error) {
            console.error('Add product error:', error);
            alert(error.response?.data?.message || 'Failed to add product');
        }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await axios.delete(`/api/farmer/products/${id}`);
            fetchDashData();
        } catch (error) {
            console.error('Delete product error:', error);
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            await axios.put(`/api/farmer/orders/${orderId}`, { status });
            fetchDashData();
        } catch (error) {
            console.error('Order update error:', error);
            alert('Failed to update order status');
        }
    };

    const totalSales = orders.reduce((sum, order) => {
        if (order.status === 'delivered') return sum + order.totalAmount;
        return sum;
    }, 0);

    const getTabLabel = (tab) => {
        if (lang === 'te') {
            switch(tab) {
                case 'overview': return '🌾 నా ఫారమ్';
                case 'inventory': return '📦 నా పంటలు';
                case 'orders': return '📋 కస్టమర్ ఆర్డర్లు';
                case 'analytics': return '💰 సంపాదించిన డబ్బు';
                case 'feedback': return '💬 సందేశాలు';
                default: return tab;
            }
        } else {
            switch(tab) {
                case 'overview': return '🌾 My Farm';
                case 'inventory': return '📦 My Crops';
                case 'orders': return '📋 Customer Orders';
                case 'analytics': return '💰 Money Earned';
                case 'feedback': return '💬 Messages';
                default: return tab;
            }
        }
    };

    const pendingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'accepted').length;
    const deliveriesTodayCount = orders.filter(o => {
        const today = new Date().toDateString();
        return new Date(o.deliverySchedule).toDateString() === today && o.status !== 'delivered' && o.status !== 'cancelled';
    }).length;
    const lowStockCount = products.filter(p => p.quantity <= 10).length;

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
                <div className="loading" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Loading Crops & Orders...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ maxWidth: '600px', margin: '6rem auto', padding: '2rem', textAlign: 'center' }} className="glass">
                <span style={{ fontSize: '3rem' }}>⚠️</span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-light)', margin: '1rem 0 0.5rem' }}>
                    {lang === 'te' ? 'సమస్య ఏర్పడింది' : 'Something went wrong'}
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                    {lang === 'te' ? 'సమస్య ఏర్పడింది. దయచేసి మళ్లీ ప్రయత్నించండి.' : 'Something went wrong. Please try again.'}
                </p>
                <button onClick={fetchDashData} className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
                    {lang === 'te' ? 'మళ్లీ ప్రయత్నించు' : 'Retry'}
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', paddingBottom: '6rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-light)', margin: 0 }}>
                        {lang === 'te' ? 'రైతు డ్యాష్‌బోర్డ్' : 'Farmer Dashboard'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>
                        {lang === 'te' ? `నమస్కారం, ${user?.name}. ఈరోజు మీ వ్యాపార వివరాలు.` : `Welcome back, ${user?.name}. Here is your farm summary for today.`}
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <StatCard title={lang === 'te' ? 'కొత్త ఆర్డర్లు' : 'New Orders'} value={pendingOrdersCount} icon={ShoppingBag} color="245, 158, 11" />
                <StatCard title={lang === 'te' ? 'ఈరోజు డెలివరీలు' : 'Deliveries Today'} value={deliveriesTodayCount} icon={Clock} color="59, 130, 246" />
                <StatCard title={lang === 'te' ? 'తక్కువ నిల్వ' : 'Low Stock'} value={lowStockCount} icon={Package} color="239, 68, 68" />
                <StatCard title={lang === 'te' ? 'మొత్తం ఆదాయం' : "Today's Earnings"} value={`₹${totalSales.toLocaleString()}`} icon={DollarSign} color="22, 163, 74" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div 
                    onClick={() => { setShowAddForm(true); setWizardStep(1); }}
                    className="glass" 
                    style={{ padding: '1.25rem', borderRadius: '1rem', border: '1px solid var(--glass-border)', background: 'var(--bg-darkest)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'center', alignItems: 'center', transition: 'transform 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <span style={{ fontSize: '1.75rem' }}>➕</span>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-light)', fontWeight: 'bold' }}>{lang === 'te' ? 'పంటను జోడించు' : 'Add Crop'}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>List new farm products</p>
                </div>
                <div 
                    onClick={() => setActiveTab('orders')}
                    className="glass" 
                    style={{ padding: '1.25rem', borderRadius: '1rem', border: '1px solid var(--glass-border)', background: 'var(--bg-darkest)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'center', alignItems: 'center', transition: 'transform 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <span style={{ fontSize: '1.75rem' }}>📋</span>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-light)', fontWeight: 'bold' }}>{lang === 'te' ? 'కస్టమర్ ఆర్డర్లు' : 'Orders'}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Process active deliveries</p>
                </div>
                <div 
                    onClick={() => setActiveTab('feedback')}
                    className="glass" 
                    style={{ padding: '1.25rem', borderRadius: '1rem', border: '1px solid var(--glass-border)', background: 'var(--bg-darkest)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'center', alignItems: 'center', transition: 'transform 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <span style={{ fontSize: '1.75rem' }}>💬</span>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-light)', fontWeight: 'bold' }}>{lang === 'te' ? 'సందేశాలు' : 'Messages'}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Read customer feedback</p>
                </div>
                <div 
                    onClick={() => setActiveTab('analytics')}
                    className="glass" 
                    style={{ padding: '1.25rem', borderRadius: '1rem', border: '1px solid var(--glass-border)', background: 'var(--bg-darkest)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'center', alignItems: 'center', transition: 'transform 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <span style={{ fontSize: '1.75rem' }}>💰</span>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-light)', fontWeight: 'bold' }}>{lang === 'te' ? 'ఆదాయం' : 'Earnings'}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Check revenue charts</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.25rem', overflowX: 'auto' }}>
                {['overview', 'inventory', 'orders', 'analytics', 'feedback'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{ 
                            background: 'transparent', border: 'none', color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                            padding: '0.5rem 1rem', fontSize: '0.95rem', fontWeight: activeTab === tab ? '600' : '400',
                            cursor: 'pointer', position: 'relative', transition: 'color 0.3s', whiteSpace: 'nowrap', minHeight: '36px'
                        }}
                    >
                        {getTabLabel(tab)}
                        {activeTab === tab && <motion.div layoutId="activeTab" style={{ position: 'absolute', bottom: '-4px', left: 0, right: 0, height: '2px', background: 'var(--primary)' }} />}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                            <div className="glass" style={{ flex: '2 1 600px', padding: '1.5rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-light)', margin: 0 }}>Revenue Analytics</h3>
                                </div>
                                <div style={{ height: '260px', width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={data}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                                            <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 11}} axisLine={false} tickLine={false} />
                                            <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 11}} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                                            <Tooltip contentStyle={{ background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', borderRadius: '0.5rem', color: 'var(--text-light)' }} />
                                            <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="glass" style={{ flex: '1 1 300px', padding: '1.5rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '1.5rem', margin: 0 }}>Recent Activity</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {orders.slice(0, 5).map((order) => (
                                        <div key={order._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--glass-border)' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(22, 163, 74, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <ShoppingBag size={16} color="var(--primary)" />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-light)' }}>#{order._id.slice(-6).toUpperCase()}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.consumer?.name || 'Customer'}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-light)' }}>₹{order.totalAmount}</div>
                                                <div style={{ fontSize: '0.7rem', color: order.status === 'delivered' ? 'var(--primary)' : 'var(--text-muted)', textTransform: 'capitalize' }}>{order.status}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {orders.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.85rem', margin: '2rem 0' }}>No recent orders.</p>}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'inventory' && (
                    <motion.div key="inventory" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-light)', margin: 0 }}>My Listed Crops</h3>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                            {products.map(p => (
                                <div key={p._id} className="glass" style={{ padding: '1.25rem', borderRadius: '1rem', border: '1px solid var(--glass-border)', background: 'var(--bg-darkest)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, color: 'var(--text-light)' }}>{p.name}</h4>
                                        <button onClick={() => deleteProduct(p._id)} style={{ color: 'var(--error)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.25rem', minHeight: 'auto' }}><Trash size={16} /></button>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                        <span>Category: <strong style={{ color: 'var(--text-light)' }}>{p.category}</strong></span>
                                        <span>Stock: <strong style={{ color: p.quantity > 5 ? 'var(--primary)' : 'var(--error)' }}>{p.quantity} kg</strong></span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-light)' }}>₹{p.price}/kg</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gate price</span>
                                    </div>
                                </div>
                            ))}
                            {products.length === 0 && (
                                <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                                    <div className="empty-state-icon">🌾</div>
                                    <h3 className="empty-state-title">{lang === 'te' ? 'ఇంకా ఏ పంటలు జోడించలేదు' : 'No Crops Added Yet'}</h3>
                                    <p className="empty-state-desc">{lang === 'te' ? 'అమ్మకం ప్రారంభించడానికి పంటను జోడించండి.' : 'Add your first crop to start selling produce directly to consumers.'}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'orders' && (
                    <motion.div key="orders" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} style={{ display: 'grid', gap: '1.5rem' }}>
                        {orders.length === 0 && (
                            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                                <div className="empty-state-icon">📦</div>
                                <h3 className="empty-state-title">{lang === 'te' ? 'ఇంకా ఆర్డర్లు లేవు' : 'No Orders Yet'}</h3>
                                <p className="empty-state-desc">{lang === 'te' ? 'కస్టమర్లు ఆర్డర్లు చేసినప్పుడు అవి ఇక్కడ కనిపిస్తాయి.' : 'When customers place orders, they will appear here.'}</p>
                            </div>
                        )}
                        {orders.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(order => (
                            <div key={order._id} className="glass" style={{ padding: '1.5rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-light)', margin: 0 }}>Order #{order._id.slice(-6).toUpperCase()}</h3>
                                            <span style={{ padding: '0.15rem 0.6rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', background: order.status === 'delivered' ? 'rgba(22, 163, 74, 0.1)' : 'var(--bg-darker)', color: order.status === 'delivered' ? 'var(--primary)' : 'var(--text-light)' }}>{order.status}</span>
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                            <span><Clock size={12} style={{ display: 'inline', marginRight: '0.2rem' }}/> {new Date(order.createdAt).toLocaleDateString()}</span>
                                            <span>Customer: {order.consumer?.name || 'Local Customer'}</span>
                                            {order.consumer?.phone && (
                                                <a 
                                                    href={`tel:${order.consumer.phone}`} 
                                                    className="btn btn-secondary" 
                                                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', minHeight: '28px', borderRadius: '1rem', textDecoration: 'none' }}
                                                >
                                                    📞 Call Customer ({order.consumer.phone})
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                        {['pending', 'accepted', 'packed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                            <button 
                                                key={status} 
                                                onClick={() => updateOrderStatus(order._id, status)}
                                                className={`btn ${order.status === status ? 'btn-primary' : 'btn-secondary'}`}
                                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', textTransform: 'capitalize', borderRadius: '2rem', minHeight: '32px' }}
                                                disabled={order.status === status}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                                    <div style={{ flex: '1 1 300px' }}>
                                        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem', fontWeight: 'bold' }}>Order Items</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {order.items.map((item, idx) => (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-darker)', padding: '0.6rem 0.8rem', borderRadius: '0.5rem' }}>
                                                    <span style={{ fontWeight: '500', fontSize: '0.85rem', color: 'var(--text-light)' }}>{item.product?.name} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>x {item.quantity}kg</span></span>
                                                    <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '0.85rem' }}>₹{item.quantity * item.price}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ flex: '1 1 300px', background: 'var(--bg-darker)', padding: '1rem', borderRadius: '0.75rem', border: '1px dashed var(--glass-border)' }}>
                                        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem', fontWeight: 'bold' }}>Delivery Details</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><MapPin size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} /> <span style={{ lineHeight: '1.4' }}>{order.shippingAddress}</span></div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} color="var(--primary)" /> <span>Preferred: {new Date(order.deliverySchedule).toLocaleDateString()}</span></div>
                                        </div>
                                        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Total Amount</span>
                                            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{order.totalAmount}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'analytics' && (
                    <motion.div key="analytics" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="glass" style={{ padding: '1.5rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-light)', margin: 0 }}>Earnings History</h3>
                        </div>
                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorRevenue2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                                    <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} axisLine={false} tickLine={false} />
                                    <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                                    <Tooltip contentStyle={{ background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', borderRadius: '0.5rem', color: 'var(--text-light)' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue2)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'feedback' && (
                    <motion.div key="feedback" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                        <div className="glass" style={{ flex: '1 1 300px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '1.5rem', alignSelf: 'flex-start', margin: 0 }}>Your Rating Score</h3>
                            <div style={{ fontSize: '4.5rem', fontWeight: 'bold', color: 'var(--primary)', lineHeight: 1 }}>{farmerStats.averageRating.toFixed(1)}</div>
                            <div style={{ display: 'flex', gap: '0.25rem', margin: '0.75rem 0' }}>
                                {[1,2,3,4,5].map(s => <Star key={s} size={20} fill={s <= Math.round(farmerStats.averageRating) ? "var(--primary)" : "transparent"} color="var(--primary)" />)}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Based on {farmerStats.numReviews} consumer reviews</div>
                        </div>

                        <div className="glass" style={{ flex: '2 1 500px', padding: '1.5rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <MessageSquare size={18} color="var(--primary)" />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-light)', margin: 0 }}>Customer Reviews</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {farmerStats.recentReviews.map(review => (
                                    <div key={review._id} style={{ padding: '1rem', background: 'var(--bg-darker)', borderRadius: '0.75rem', border: '1px solid var(--glass-border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            <div>
                                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-light)' }}>{review.product?.name || 'Product'}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reviewed by {review.user?.name} on {new Date(review.createdAt).toLocaleDateString()}</div>
                                            </div>
                                            <div style={{ display: 'flex' }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} fill={i < review.rating ? "#F59E0B" : "transparent"} color={i < review.rating ? "#F59E0B" : "rgba(255,255,255,0.2)"} />
                                                ))}
                                            </div>
                                        </div>
                                        <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', lineHeight: 1.4, margin: 0 }}>"{review.comment}"</p>
                                    </div>
                                ))}
                                {farmerStats.recentReviews.length === 0 && (
                                    <div className="empty-state" style={{ padding: '2rem' }}>
                                        <div className="empty-state-icon">💬</div>
                                        <h3 className="empty-state-title">{lang === 'te' ? 'ఇంకా సందేశాలు లేవు' : 'No Messages Yet'}</h3>
                                        <p className="empty-state-desc">{lang === 'te' ? 'కస్టమర్ల నుండి రేటింగులు మరియు ఫీడ్‌బ్యాక్ ఇక్కడ కనిపిస్తాయి.' : 'Ratings and reviews from customers will show up here.'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showAddForm && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
                            className="glass" style={{ padding: '2rem', maxWidth: '460px', width: '100%', position: 'relative', border: '1px solid var(--glass-border)', background: 'var(--bg-darkest)' }}
                        >
                            <button onClick={() => { setShowAddForm(false); setWizardStep(1); }} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'var(--bg-darker)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', cursor: 'pointer', minHeight: 'auto' }}><X size={18} /></button>
                            
                            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.25rem', fontWeight: 'bold', color: 'var(--text-light)', textTransform: 'none' }}>Add New Crop</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>Step {wizardStep} of 4</p>
                            
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {wizardStep === 1 && (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '0.25rem' }}>🌾</div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 'bold', marginBottom: '0.5rem' }}>Crop Name (Mandatory)</label>
                                            <input required placeholder="e.g. Tomatoes" style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-darker)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none' }} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 'bold', marginBottom: '0.5rem' }}>Category</label>
                                            <select style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none' }} value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                                                <option value="vegetables">Fresh Vegetables</option>
                                                <option value="fruits">Fresh Fruits</option>
                                                <option value="grains">Grains & Pulses</option>
                                            </select>
                                        </div>
                                    </motion.div>
                                )}

                                {wizardStep === 2 && (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '0.25rem' }}>💰</div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 'bold', marginBottom: '0.5rem' }}>Price per kg (₹) (Mandatory)</label>
                                            <input required type="number" placeholder="40" style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-darker)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none' }} value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                                        </div>
                                    </motion.div>
                                )}

                                {wizardStep === 3 && (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '0.25rem' }}>📦</div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 'bold', marginBottom: '0.5rem' }}>Available Quantity (kg) (Mandatory)</label>
                                            <input required type="number" placeholder="100" style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-darker)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none' }} value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
                                        </div>
                                    </motion.div>
                                )}

                                {wizardStep === 4 && (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '0.25rem' }}>📷</div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 'bold', marginBottom: '0.5rem' }}>Description / Photo Notes (Optional)</label>
                                            <textarea placeholder="Describe crop quality, variety, or organic farming methods..." rows="3" style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-darker)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '0.5rem', resize: 'none', fontSize: '0.9rem', outline: 'none' }} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                                        </div>
                                    </motion.div>
                                )}
                                
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    {wizardStep > 1 && (
                                        <button type="button" className="btn btn-secondary" onClick={handlePrevStep} style={{ flex: 1 }}>Back</button>
                                    )}
                                    {wizardStep < 4 ? (
                                        <button type="button" className="btn btn-primary" onClick={handleNextStep} style={{ flex: 2 }}>Next</button>
                                    ) : (
                                        <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>List Crop</button>
                                    )}
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FarmerDashboard;
