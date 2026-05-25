import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Users, ShoppingBag, Package, Star, Activity, Trash, Ban, CheckCircle, Search, Menu, X, DollarSign, TrendingUp, ShieldAlert, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div whileHover={{ y: -5 }} className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden', borderLeft: `4px solid rgb(${color})` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</p>
                <h3 style={{ fontSize: '2rem', fontWeight: '700', marginTop: '0.5rem', color: 'white' }}>{value}</h3>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '1rem', background: `rgba(${color}, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={24} color={`rgb(${color})`} />
            </div>
        </div>
        {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><TrendingUp size={14} /> {trend}</span>
            </div>
        )}
        <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '100px', height: '100px', background: `radial-gradient(circle, rgba(${color}, 0.2) 0%, transparent 70%)`, filter: 'blur(10px)', zIndex: 0 }}></div>
    </motion.div>
);

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Data states
    const [analytics, setAnalytics] = useState({ totalUsers: 0, totalFarmers: 0, totalProducts: 0, totalOrders: 0, totalSales: 0, recentUsers: [], ordersByStatus: [] });
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [analyticsRes, usersRes, productsRes, ordersRes, reviewsRes] = await Promise.all([
                axios.get('/api/admin/analytics'),
                axios.get('/api/admin/users'),
                axios.get('/api/admin/products'),
                axios.get('/api/admin/orders'),
                axios.get('/api/admin/reviews')
            ]);
            setAnalytics(analyticsRes.data);
            setUsers(usersRes.data);
            setProducts(productsRes.data);
            setOrders(ordersRes.data);
            setReviews(reviewsRes.data);
        } catch (error) {
            console.error('Admin fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Actions
    const toggleBlockUser = async (id) => {
        try { await axios.put(`/api/admin/users/${id}/block`); fetchData(); } 
        catch (err) { alert(err.response?.data?.message || 'Error blocking user'); }
    };
    
    const toggleVerifyFarmer = async (id) => {
        try { await axios.put(`/api/admin/users/${id}/verify`); fetchData(); } 
        catch (err) { alert('Error verifying farmer'); }
    };

    const deleteUser = async (id) => {
        if(!window.confirm('Delete this user completely? This cannot be undone.')) return;
        try { await axios.delete(`/api/admin/users/${id}`); fetchData(); } 
        catch (err) { alert('Error deleting user'); }
    };

    const deleteProduct = async (id) => {
        if(!window.confirm('Remove this product?')) return;
        try { await axios.delete(`/api/admin/products/${id}`); fetchData(); } 
        catch (err) { alert('Error deleting product'); }
    };

    const deleteReview = async (id) => {
        if(!window.confirm('Delete this review?')) return;
        try { await axios.delete(`/api/admin/reviews/${id}`); fetchData(); } 
        catch (err) { alert('Error deleting review'); }
    };

    // Filtered Data
    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Mock Chart Data for Revenue Growth based on total sales
    const revenueData = [
        { name: 'Jan', amount: analytics.totalSales * 0.2 },
        { name: 'Feb', amount: analytics.totalSales * 0.4 },
        { name: 'Mar', amount: analytics.totalSales * 0.6 },
        { name: 'Apr', amount: analytics.totalSales * 0.8 },
        { name: 'May', amount: analytics.totalSales }
    ];

    const SidebarItem = ({ id, icon: Icon, label }) => (
        <button 
            onClick={() => { setActiveTab(id); if(window.innerWidth < 768) setSidebarOpen(false); }}
            style={{ 
                width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: activeTab === id ? 'rgba(0,255,157,0.1)' : 'transparent', 
                border: 'none', borderLeft: activeTab === id ? '4px solid var(--primary)' : '4px solid transparent', color: activeTab === id ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer', transition: 'all 0.3s', textAlign: 'left', fontWeight: activeTab === id ? 'bold' : 'normal'
            }}
            className="hover:bg-white/5"
        >
            <Icon size={20} /> <span>{label}</span>
        </button>
    );

    return (
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 100px)', margin: '-1rem -1rem', overflow: 'hidden' }}>
            
            {/* Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div 
                        initial={{ x: -250 }} animate={{ x: 0 }} exit={{ x: -250 }}
                        style={{ width: '250px', background: 'rgba(5, 20, 15, 0.95)', borderRight: '1px solid rgba(0,255,157,0.1)', backdropFilter: 'blur(20px)', zIndex: 100, display: 'flex', flexDirection: 'column', position: window.innerWidth < 768 ? 'absolute' : 'relative', height: '100%' }}
                    >
                        <div style={{ padding: '2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>Admin<span style={{ color: 'var(--primary)' }}>Panel</span></h2>
                            {window.innerWidth < 768 && <button className="btn-ghost" onClick={() => setSidebarOpen(false)}><X size={20} /></button>}
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <SidebarItem id="overview" icon={Activity} label="Overview" />
                            <SidebarItem id="users" icon={Users} label="User Management" />
                            <SidebarItem id="farmers" icon={Award} label="Farmer Verification" />
                            <SidebarItem id="products" icon={Package} label="Products" />
                            <SidebarItem id="orders" icon={ShoppingBag} label="Orders" />
                            <SidebarItem id="reviews" icon={Star} label="Reviews & Moderation" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', background: 'var(--bg-darkest)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    {!sidebarOpen && <button className="btn btn-ghost" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>}
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', textTransform: 'capitalize' }}>{activeTab === 'farmers' ? 'Farmer Verification' : activeTab} Dashboard</h1>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><div className="loading" style={{ width: '50px', height: '50px', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>
                ) : (
                    <AnimatePresence mode="wait">
                        
                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
                                    <StatCard title="Total Revenue" value={`₹${analytics.totalSales.toLocaleString()}`} icon={DollarSign} color="0, 255, 157" trend="Up 12%" />
                                    <StatCard title="Total Users" value={analytics.totalUsers} icon={Users} color="59, 130, 246" />
                                    <StatCard title="Active Products" value={analytics.totalProducts} icon={Package} color="245, 158, 11" />
                                    <StatCard title="Total Orders" value={analytics.totalOrders} icon={ShoppingBag} color="168, 85, 247" />
                                </div>

                                <div className="grid grid-cols-1 lg-grid-cols-3" style={{ gap: '2rem' }}>
                                    <div className="glass lg-col-span-2" style={{ padding: '2rem' }}>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Revenue Growth</h3>
                                        <div style={{ height: '300px' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={revenueData}>
                                                    <defs>
                                                        <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                    <XAxis dataKey="name" stroke="var(--text-muted)" />
                                                    <YAxis stroke="var(--text-muted)" tickFormatter={(v) => `₹${v}`} />
                                                    <Tooltip contentStyle={{ background: 'var(--bg-dark)', borderColor: 'var(--primary)' }} />
                                                    <Area type="monotone" dataKey="amount" stroke="var(--primary)" fillOpacity={1} fill="url(#colorAmt)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <div className="glass" style={{ padding: '2rem' }}>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Order Status Overview</h3>
                                        <div style={{ height: '300px' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={analytics.ordersByStatus}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                    <XAxis dataKey="_id" stroke="var(--text-muted)" />
                                                    <YAxis stroke="var(--text-muted)" />
                                                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ background: 'var(--bg-dark)', borderColor: 'var(--primary)' }} />
                                                    <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* USERS TAB */}
                        {activeTab === 'users' && (
                            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="glass" style={{ padding: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>All Users</h3>
                                        <div style={{ position: 'relative' }}>
                                            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                                            <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ padding: '0.5rem 1rem 0.5rem 2.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '2rem' }} />
                                        </div>
                                    </div>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                                                    <th style={{ padding: '1rem' }}>Name</th>
                                                    <th style={{ padding: '1rem' }}>Email</th>
                                                    <th style={{ padding: '1rem' }}>Role</th>
                                                    <th style={{ padding: '1rem' }}>Status</th>
                                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredUsers.map(u => (
                                                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>{u.name}</td>
                                                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{u.email}</td>
                                                        <td style={{ padding: '1rem' }}><span style={{ padding: '0.2rem 0.6rem', background: u.role === 'farmer' ? 'rgba(0,255,157,0.1)' : 'rgba(255,255,255,0.1)', color: u.role === 'farmer' ? 'var(--primary)' : 'white', borderRadius: '1rem', fontSize: '0.8rem', textTransform: 'capitalize' }}>{u.role}</span></td>
                                                        <td style={{ padding: '1rem' }}>
                                                            {u.isBlocked ? <span style={{ color: 'var(--error)' }}><Ban size={14} style={{ display: 'inline', marginRight: '4px' }} /> Blocked</span> : <span style={{ color: 'var(--primary)' }}><CheckCircle size={14} style={{ display: 'inline', marginRight: '4px' }} /> Active</span>}
                                                        </td>
                                                        <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                            {u.role !== 'admin' && (
                                                                <>
                                                                    <button onClick={() => toggleBlockUser(u._id)} className="btn btn-ghost" style={{ padding: '0.5rem', color: u.isBlocked ? 'var(--primary)' : 'var(--error)' }}>
                                                                        <ShieldAlert size={18} />
                                                                    </button>
                                                                    <button onClick={() => deleteUser(u._id)} className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>
                                                                        <Trash size={18} />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* FARMERS TAB */}
                        {activeTab === 'farmers' && (
                            <motion.div key="farmers" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="glass" style={{ padding: '2rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Farmer Verification Center</h3>
                                    <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3" style={{ gap: '1.5rem' }}>
                                        {users.filter(u => u.role === 'farmer').map(f => (
                                            <div key={f._id} style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '1rem', border: f.isVerified ? '1px solid rgba(0,255,157,0.3)' : '1px dashed rgba(255,255,255,0.2)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                    <div>
                                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white' }}>{f.name}</h4>
                                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{f.address?.city || 'No city provided'}</p>
                                                    </div>
                                                    {f.isVerified ? <Award color="var(--primary)" /> : <ShieldAlert color="var(--text-muted)" />}
                                                </div>
                                                <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                    <p>Phone: {f.phone}</p>
                                                    <p>Email: {f.email}</p>
                                                </div>
                                                <button 
                                                    onClick={() => toggleVerifyFarmer(f._id)}
                                                    className="btn" 
                                                    style={{ width: '100%', background: f.isVerified ? 'transparent' : 'var(--primary)', color: f.isVerified ? 'var(--error)' : 'var(--bg-dark)', border: f.isVerified ? '1px solid var(--error)' : 'none' }}
                                                >
                                                    {f.isVerified ? 'Revoke Verification' : 'Approve Farmer Profile'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* PRODUCTS TAB */}
                        {activeTab === 'products' && (
                            <motion.div key="products" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="glass" style={{ padding: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Product Inventory</h3>
                                        <div style={{ position: 'relative' }}>
                                            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                                            <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ padding: '0.5rem 1rem 0.5rem 2.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '2rem' }} />
                                        </div>
                                    </div>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                                                    <th style={{ padding: '1rem' }}>Product</th>
                                                    <th style={{ padding: '1rem' }}>Farmer</th>
                                                    <th style={{ padding: '1rem' }}>Category</th>
                                                    <th style={{ padding: '1rem' }}>Price/Qty</th>
                                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredProducts.map(p => (
                                                    <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>{p.name}</td>
                                                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{p.farmer?.name || 'Unknown'}</td>
                                                        <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{p.category}</td>
                                                        <td style={{ padding: '1rem' }}>₹{p.price} / {p.quantity}kg</td>
                                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                            <button onClick={() => deleteProduct(p._id)} className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--error)' }}><Trash size={18} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* REVIEWS TAB */}
                        {activeTab === 'reviews' && (
                            <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="glass" style={{ padding: '2rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Platform Feedback Moderation</h3>
                                    <div className="grid grid-cols-1 md-grid-cols-2" style={{ gap: '1.5rem' }}>
                                        {reviews.map(r => (
                                            <div key={r._id} style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{r.user?.name}</span> reviewed <span>{r.product?.name}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', color: '#F59E0B' }}>
                                                        {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < r.rating ? "#F59E0B" : "transparent"} />)}
                                                    </div>
                                                </div>
                                                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.5rem', borderLeft: '3px solid var(--primary)' }}>"{r.comment}"</p>
                                                <button onClick={() => deleteReview(r._id)} className="btn btn-ghost" style={{ color: 'var(--error)', alignSelf: 'flex-end', fontSize: '0.8rem', padding: '0.5rem' }}>
                                                    <Trash size={14} style={{ display: 'inline', marginRight: '4px' }}/> Remove Review
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ORDERS TAB */}
                        {activeTab === 'orders' && (
                            <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="glass" style={{ padding: '2rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Global Order Tracking</h3>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                                                    <th style={{ padding: '1rem' }}>Order ID</th>
                                                    <th style={{ padding: '1rem' }}>Consumer</th>
                                                    <th style={{ padding: '1rem' }}>Farmer</th>
                                                    <th style={{ padding: '1rem' }}>Total</th>
                                                    <th style={{ padding: '1rem' }}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map(o => (
                                                    <tr key={o._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>#{o._id.slice(-6).toUpperCase()}</td>
                                                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{o.consumer?.name || 'Unknown'}</td>
                                                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{o.farmer?.name || 'Unknown'}</td>
                                                        <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 'bold' }}>₹{o.totalAmount}</td>
                                                        <td style={{ padding: '1rem' }}>
                                                            <span style={{ padding: '0.2rem 0.6rem', background: o.status === 'delivered' ? 'rgba(0,255,157,0.1)' : 'rgba(255,255,255,0.1)', color: o.status === 'delivered' ? 'var(--primary)' : 'white', borderRadius: '1rem', fontSize: '0.8rem', textTransform: 'capitalize' }}>{o.status}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
