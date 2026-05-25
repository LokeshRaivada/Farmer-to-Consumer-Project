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

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div whileHover={{ y: -5 }} className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</p>
                <h3 style={{ fontSize: '2rem', fontWeight: '700', marginTop: '0.5rem', color: 'white' }}>{value}</h3>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '1rem', background: `rgba(${color}, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={24} color={`rgb(${color})`} />
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><TrendingUp size={14} /> +{trend}%</span>
            <span style={{ color: 'var(--text-muted)' }}>from last month</span>
        </div>
        {/* Decorative glow */}
        <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '100px', height: '100px', background: `radial-gradient(circle, rgba(${color}, 0.2) 0%, transparent 70%)`, filter: 'blur(10px)', zIndex: 0 }}></div>
    </motion.div>
);

const FarmerDashboard = () => {
    const { t, user } = useAuth();
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', price: '', quantity: '', category: 'vegetables', description: '' });
    const [activeTab, setActiveTab] = useState('overview');
    const [farmerStats, setFarmerStats] = useState({ averageRating: 0, numReviews: 0, recentReviews: [] });

    const fetchDashData = async () => {
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
        } catch (error) {
            console.error('Fetch dashboard data error:', error);
        }
    };

    useEffect(() => { fetchDashData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/farmer/products', formData);
            setShowAddForm(false);
            setFormData({ name: '', price: '', quantity: '', category: 'vegetables', description: '' });
            fetchDashData();
        } catch (error) {
            console.error('Add product error:', error);
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

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', paddingBottom: '6rem' }}>
            {/* Dashboard Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Dashboard Overview</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome back, <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{user?.name}</span>. Here's what's happening today.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-ghost" style={{ padding: '0.75rem', borderRadius: '50%' }}><Bell size={20} /></button>
                    <button className="btn btn-primary" onClick={() => setShowAddForm(true)} style={{ borderRadius: '2rem', padding: '0.75rem 1.5rem' }}>
                        <Plus size={20} /> New Product
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
                {['overview', 'inventory', 'orders', 'analytics', 'feedback'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{ 
                            background: 'transparent', border: 'none', color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                            padding: '0.5rem 1rem', fontSize: '1rem', fontWeight: activeTab === tab ? '600' : '400',
                            textTransform: 'capitalize', cursor: 'pointer', position: 'relative', transition: 'color 0.3s'
                        }}
                    >
                        {tab}
                        {activeTab === tab && <motion.div layoutId="activeTab" style={{ position: 'absolute', bottom: '-8px', left: 0, right: 0, height: '2px', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }} />}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                        
                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md-grid-cols-3" style={{ marginBottom: '2.5rem' }}>
                            <StatCard title="Total Revenue" value={`₹${totalSales.toLocaleString()}`} icon={DollarSign} color="0, 255, 157" trend="12.5" />
                            <StatCard title="Active Orders" value={orders.filter(o => o.status === 'pending' || o.status === 'shipped').length} icon={ShoppingBag} color="245, 158, 11" trend="8.2" />
                            <StatCard title="Total Products" value={products.length} icon={Package} color="59, 130, 246" trend="2.4" />
                        </div>

                        {/* Charts & Recent Activity */}
                        <div className="grid grid-cols-1 md-grid-cols-3" style={{ gap: '2.5rem' }}>
                            <div className="glass md-col-span-2" style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Revenue Analytics</h3>
                                    <select style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                                        <option>Last 6 Months</option>
                                        <option>This Year</option>
                                    </select>
                                </div>
                                <div style={{ height: '300px', width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={data}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} axisLine={false} tickLine={false} />
                                            <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                                            <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '0.5rem', backdropFilter: 'blur(10px)' }} />
                                            <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="glass" style={{ padding: '2rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '2rem' }}>Recent Orders</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {orders.slice(0, 5).map((order) => (
                                        <div key={order._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,255,157,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <ShoppingBag size={18} color="var(--primary)" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>#{order._id.slice(-6).toUpperCase()}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.consumer?.name || 'Customer'}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>₹{order.totalAmount}</div>
                                                <div style={{ fontSize: '0.75rem', color: order.status === 'delivered' ? 'var(--primary)' : 'var(--text-muted)', textTransform: 'capitalize' }}>{order.status}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {orders.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>No recent orders.</p>}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'inventory' && (
                    <motion.div key="inventory" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="glass" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Active Inventory</h3>
                            <div style={{ position: 'relative', width: '300px' }}>
                                <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                                <input type="text" placeholder="Search products..." style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '2rem', color: 'white', fontSize: '0.9rem' }} />
                            </div>
                        </div>
                        
                        <div style={{ width: '100%', overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem', fontWeight: '500', fontSize: '0.9rem' }}>Product</th>
                                        <th style={{ padding: '1rem', fontWeight: '500', fontSize: '0.9rem' }}>Category</th>
                                        <th style={{ padding: '1rem', fontWeight: '500', fontSize: '0.9rem' }}>Price</th>
                                        <th style={{ padding: '1rem', fontWeight: '500', fontSize: '0.9rem' }}>Stock</th>
                                        <th style={{ padding: '1rem', fontWeight: '500', fontSize: '0.9rem', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.3s' }} className="hover:bg-white/5">
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={20} color="var(--primary)" /></div>
                                                    <span style={{ fontWeight: '600' }}>{p.name}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{p.category}</td>
                                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>₹{p.price} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ kg</span></td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ background: p.quantity > 5 ? 'rgba(0,255,157,0.1)' : 'rgba(239,68,68,0.1)', color: p.quantity > 5 ? 'var(--primary)' : 'var(--error)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                    {p.quantity} kg
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <button onClick={() => deleteProduct(p._id)} style={{ color: 'var(--error)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem' }}><Trash size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {products.length === 0 && <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No products in inventory.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'orders' && (
                    <motion.div key="orders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ display: 'grid', gap: '1.5rem' }}>
                        {orders.length === 0 && <div className="glass" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>No orders received yet.</div>}
                        {orders.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(order => (
                            <div key={order._id} className="glass" style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Order #{order._id.slice(-6).toUpperCase()}</h3>
                                            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', background: order.status === 'delivered' ? 'rgba(0,255,157,0.1)' : 'rgba(255,255,255,0.1)', color: order.status === 'delivered' ? 'var(--primary)' : 'white' }}>{order.status}</span>
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span><Clock size={14} style={{ display: 'inline', marginRight: '0.25rem' }}/> {new Date(order.createdAt).toLocaleDateString()}</span>
                                            <span>Customer: {order.consumer?.name || 'Local Customer'}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {['pending', 'accepted', 'packed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                            <button 
                                                key={status} 
                                                onClick={() => updateOrderStatus(order._id, status)}
                                                className={`btn ${order.status === status ? 'btn-primary' : 'btn-ghost'}`}
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', textTransform: 'capitalize', borderRadius: '2rem' }}
                                                disabled={order.status === status}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md-grid-cols-2" style={{ gap: '2rem' }}>
                                    <div>
                                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Order Items</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {order.items.map((item, idx) => (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1rem', borderRadius: '0.5rem' }}>
                                                    <span style={{ fontWeight: '500' }}>{item.product?.name} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>x {item.quantity}kg</span></span>
                                                    <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>₹{item.quantity * item.price}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Delivery Details</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}><MapPin size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} /> <span style={{ lineHeight: '1.4' }}>{order.shippingAddress}</span></div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Clock size={18} color="var(--primary)" /> <span>Preferred: {new Date(order.deliverySchedule).toLocaleDateString()}</span></div>
                                        </div>
                                        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '1.1rem' }}>Total Amount</span>
                                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{order.totalAmount}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'feedback' && (
                    <motion.div key="feedback" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md-grid-cols-3" style={{ gap: '2rem' }}>
                        {/* Rating Summary */}
                        <div className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', alignSelf: 'flex-start' }}>Your Rating Score</h3>
                            <div style={{ fontSize: '5rem', fontWeight: 'bold', color: 'var(--primary)', lineHeight: 1 }}>{farmerStats.averageRating.toFixed(1)}</div>
                            <div style={{ display: 'flex', gap: '0.25rem', margin: '1rem 0' }}>
                                {[1,2,3,4,5].map(s => <Star key={s} size={24} fill={s <= Math.round(farmerStats.averageRating) ? "var(--primary)" : "transparent"} color="var(--primary)" />)}
                            </div>
                            <div style={{ color: 'var(--text-muted)' }}>Based on {farmerStats.numReviews} consumer reviews</div>
                        </div>

                        {/* Recent Reviews Panel */}
                        <div className="glass md-col-span-2" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <MessageSquare size={20} color="var(--primary)" />
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Customer Feedback</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {farmerStats.recentReviews.map(review => (
                                    <div key={review._id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <div>
                                                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{review.product?.name || 'Product'}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reviewed by {review.user?.name} on {new Date(review.createdAt).toLocaleDateString()}</div>
                                            </div>
                                            <div style={{ display: 'flex' }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={14} fill={i < review.rating ? "#F59E0B" : "transparent"} color={i < review.rating ? "#F59E0B" : "rgba(255,255,255,0.2)"} />
                                                ))}
                                            </div>
                                        </div>
                                        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', lineHeight: 1.5 }}>"{review.comment}"</p>
                                    </div>
                                ))}
                                {farmerStats.recentReviews.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No customer feedback yet.</div>}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium Add Product Modal */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="glass" style={{ padding: '3rem', maxWidth: '500px', width: '100%', position: 'relative', border: '1px solid var(--primary)', boxShadow: '0 0 50px rgba(0,255,157,0.2)' }}
                        >
                            <button onClick={() => setShowAddForm(false)} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }} className="hover-glow"><X size={18} /></button>
                            
                            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: '700' }}>Add New Product</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>List your fresh produce for consumers.</p>
                            
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Product Name</label>
                                    <input required placeholder="e.g. Organic Tomatoes" style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                                </div>
                                
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Price per kg (₹)</label>
                                        <input required type="number" placeholder="40" style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }} value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Available Quantity (kg)</label>
                                        <input required type="number" placeholder="100" style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }} value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
                                    </div>
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Category</label>
                                    <select style={{ width: '100%', padding: '1rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem', appearance: 'none' }} value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                                        <option value="vegetables">Fresh Vegetables</option>
                                        <option value="fruits">Fresh Fruits</option>
                                        <option value="grains">Grains & Pulses</option>
                                    </select>
                                </div>
                                
                                <button className="btn btn-primary" type="submit" style={{ marginTop: '1rem', padding: '1rem', fontSize: '1rem', width: '100%' }}>List Product in Store</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FarmerDashboard;
