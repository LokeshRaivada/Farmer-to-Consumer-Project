import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Users, ShoppingBag, Package, Star, Activity, Trash, Ban, CheckCircle, Search, Menu, X, DollarSign, TrendingUp, ShieldAlert, Award, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Premium Stat Card
const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div 
        whileHover={{ y: -5, scale: 1.02 }} 
        className="glass" 
        style={{ 
            padding: '1.5rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem', 
            position: 'relative', 
            overflow: 'hidden', 
            borderLeft: `4px solid rgb(${color})`,
            boxShadow: 'var(--shadow-card)'
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
            <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</p>
                <h3 style={{ fontSize: '1.85rem', fontWeight: '800', marginTop: '0.4rem', color: 'var(--text-light)', letterSpacing: '-0.5px' }}>{value}</h3>
            </div>
            <div style={{ width: '46px', height: '46px', borderRadius: '0.85rem', background: `rgba(${color}, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `inset 0 0 10px rgba(${color}, 0.15)` }}>
                <Icon size={20} color={`rgb(${color})`} />
            </div>
        </div>
        {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', zIndex: 1 }}>
                <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><TrendingUp size={12} /> {trend}</span>
            </div>
        )}
        <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '90px', height: '90px', background: `radial-gradient(circle, rgba(${color}, 0.15) 0%, transparent 70%)`, filter: 'blur(8px)', zIndex: 0 }}></div>
    </motion.div>
);

// Skeleton loaders for premium UX
const StatCardSkeleton = () => (
    <div className="glass skeleton-glow" style={{ height: '110px', borderRadius: '1.25rem', opacity: 0.3 }} />
);

const ChartSkeleton = () => (
    <div className="glass skeleton-glow" style={{ height: '300px', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading analytics...</div>
    </div>
);

const TableRowSkeleton = ({ cols = 5 }) => (
    <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
        {[...Array(cols)].map((_, idx) => (
            <td key={idx} style={{ padding: '1.25rem 1rem' }}>
                <div className="skeleton-glow" style={{ height: '16px', width: idx === 0 ? '120px' : idx === 1 ? '160px' : '80px', borderRadius: '4px', opacity: 0.2 }} />
            </td>
        ))}
    </tr>
);

const CardSkeleton = () => (
    <div className="glass skeleton-glow" style={{ height: '180px', borderRadius: '1.25rem', opacity: 0.2 }} />
);

// Tab specific skeleton block to prevent layout shifts
const TabSkeleton = ({ tab }) => {
    if (tab === 'overview') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                    {[...Array(6)].map((_, i) => <StatCardSkeleton key={i} />)}
                </div>
                <div className="grid grid-cols-1 lg-grid-cols-3" style={{ gap: '2rem' }}>
                    <div className="lg-col-span-2"><ChartSkeleton /></div>
                    <div><ChartSkeleton /></div>
                </div>
                <div className="grid grid-cols-1 lg-grid-cols-3" style={{ gap: '2rem' }}>
                    <div className="lg-col-span-2 skeleton-glow" style={{ height: '250px', background: 'var(--bg-darker)', borderRadius: '1.25rem' }} />
                    <div style={{ height: '250px', background: 'var(--bg-darker)', borderRadius: '1.25rem' }} className="skeleton-glow" />
                </div>
            </div>
        );
    }
    
    if (tab === 'farmers' || tab === 'reviews') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
                </div>
            </div>
        );
    }
    
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '1.25rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            {[...Array(5)].map((_, i) => (
                                <th key={i} style={{ padding: '1rem' }}>
                                    <div className="skeleton-glow" style={{ height: '14px', width: '70px', borderRadius: '4px', opacity: 0.15 }} />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(6)].map((_, i) => <TableRowSkeleton key={i} cols={5} />)}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Premium empty states
const EmptyState = ({ message, subtitle, icon: Icon }) => (
    <div className="glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', textAlign: 'center', borderStyle: 'dashed', borderWidth: '1px', borderColor: 'rgba(255,255,255,0.1)' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--bg-darker)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '1.25rem', border: '1px solid rgba(0, 255, 157, 0.15)' }}>
            <Icon size={24} />
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '0.4rem' }}>{message}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: '320px' }}>{subtitle}</p>
    </div>
);

// Reusable custom pagination controls
const Pagination = ({ current, total, onPageChange }) => {
    if (total <= 1) return null;
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button 
                onClick={() => onPageChange(Math.max(1, current - 1))}
                disabled={current === 1}
                className="btn btn-ghost"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', opacity: current === 1 ? 0.4 : 1 }}
            >
                Prev
            </button>
            {[...Array(total)].map((_, i) => {
                const page = i + 1;
                if (total > 6 && Math.abs(current - page) > 2 && page !== 1 && page !== total) {
                    if (page === 2 || page === total - 1) {
                        return <span key={page} style={{ color: 'var(--text-muted)', padding: '0 0.25rem' }}>...</span>;
                    }
                    return null;
                }
                return (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`btn ${current === page ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', padding: 0, fontSize: '0.8rem', fontWeight: current === page ? 'bold' : 'normal' }}
                    >
                        {page}
                    </button>
                );
            })}
            <button 
                onClick={() => onPageChange(Math.min(total, current + 1))}
                disabled={current === total}
                className="btn btn-ghost"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', opacity: current === total ? 0.4 : 1 }}
            >
                Next
            </button>
        </div>
    );
};

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
    const [currentPage, setCurrentPage] = useState(1);

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
            setAnalytics(analyticsRes.data || { totalUsers: 0, totalFarmers: 0, totalProducts: 0, totalOrders: 0, totalSales: 0, recentUsers: [], ordersByStatus: [] });
            setUsers(usersRes.data || []);
            setProducts(productsRes.data || []);
            setOrders(ordersRes.data || []);
            setReviews(reviewsRes.data || []);
        } catch (error) {
            console.error('Admin fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Actions
    const toggleBlockUser = async (id) => {
        try { 
            await axios.put(`/api/admin/users/${id}/block`); 
            fetchData(); 
        } catch (err) { 
            alert(err.response?.data?.message || 'Error blocking user'); 
        }
    };
    
    const toggleVerifyFarmer = async (id) => {
        try { 
            await axios.put(`/api/admin/users/${id}/verify`); 
            fetchData(); 
        } catch (err) { 
            alert('Error verifying farmer'); 
        }
    };

    const deleteUser = async (id) => {
        if(!window.confirm('Delete this user completely? This cannot be undone.')) return;
        try { 
            await axios.delete(`/api/admin/users/${id}`); 
            fetchData(); 
        } catch (err) { 
            alert('Error deleting user'); 
        }
    };

    const deleteProduct = async (id) => {
        if(!window.confirm('Remove this product?')) return;
        try { 
            await axios.delete(`/api/admin/products/${id}`); 
            fetchData(); 
        } catch (err) { 
            alert('Error deleting product'); 
        }
    };

    const deleteReview = async (id) => {
        if(!window.confirm('Delete this review?')) return;
        try { 
            await axios.delete(`/api/admin/reviews/${id}`); 
            fetchData(); 
        } catch (err) { 
            alert('Error deleting review'); 
        }
    };

    // Tab switcher with state cleanses to prevent index bounds issues
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setSearchQuery('');
        setCurrentPage(1);
    };

    // Filter Memos for search with robust defensive string conversions
    const filteredUsers = useMemo(() => {
        return users.filter(u => 
            (u?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
            (u?.email || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [users, searchQuery]);

    const filteredFarmers = useMemo(() => {
        return users.filter(u => 
            u?.role === 'farmer' && (
                (u?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (u?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (u?.address?.city || '').toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [users, searchQuery]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => 
            (p?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p?.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p?.farmer?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, searchQuery]);

    const filteredReviews = useMemo(() => {
        return reviews.filter(r => 
            (r?.product?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r?.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r?.comment || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [reviews, searchQuery]);

    const filteredOrders = useMemo(() => {
        return orders.filter(o => 
            (o?._id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (o?.consumer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (o?.farmer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (o?.status || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [orders, searchQuery]);

    // Pending Farmers calculated for verification queue
    const pendingFarmers = useMemo(() => {
        return users.filter(u => u?.role === 'farmer' && !u?.isVerified);
    }, [users]);

    // Pagination constants
    const ITEMS_PER_TABLE = 10;
    const ITEMS_PER_GRID = 6;

    // Sliced Data
    const paginatedUsers = useMemo(() => {
        return filteredUsers.slice((currentPage - 1) * ITEMS_PER_TABLE, currentPage * ITEMS_PER_TABLE);
    }, [filteredUsers, currentPage]);

    const paginatedFarmers = useMemo(() => {
        return filteredFarmers.slice((currentPage - 1) * ITEMS_PER_GRID, currentPage * ITEMS_PER_GRID);
    }, [filteredFarmers, currentPage]);

    const paginatedProducts = useMemo(() => {
        return filteredProducts.slice((currentPage - 1) * ITEMS_PER_TABLE, currentPage * ITEMS_PER_TABLE);
    }, [filteredProducts, currentPage]);

    const paginatedReviews = useMemo(() => {
        return filteredReviews.slice((currentPage - 1) * ITEMS_PER_GRID, currentPage * ITEMS_PER_GRID);
    }, [filteredReviews, currentPage]);

    const paginatedOrders = useMemo(() => {
        return filteredOrders.slice((currentPage - 1) * ITEMS_PER_TABLE, currentPage * ITEMS_PER_TABLE);
    }, [filteredOrders, currentPage]);

    // Charts data
    const revenueData = useMemo(() => {
        const sales = analytics?.totalSales || 0;
        return [
            { name: 'Jan', amount: sales * 0.2 },
            { name: 'Feb', amount: sales * 0.4 },
            { name: 'Mar', amount: sales * 0.5 },
            { name: 'Apr', amount: sales * 0.8 },
            { name: 'May', amount: sales }
        ];
    }, [analytics?.totalSales]);

    const SidebarItem = ({ id, icon: Icon, label }) => (
        <motion.button 
            whileHover={{ x: 6, background: 'rgba(22, 163, 74, 0.08)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { handleTabChange(id); if(window.innerWidth < 768) setSidebarOpen(false); }}
            style={{ 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                padding: '1rem 1.5rem', 
                background: activeTab === id ? 'rgba(22, 163, 74, 0.12)' : 'transparent', 
                border: 'none', 
                borderLeft: activeTab === id ? '4px solid var(--primary)' : '4px solid transparent', 
                color: activeTab === id ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer', 
                transition: 'color 0.2s, border-color 0.2s', 
                textAlign: 'left', 
                fontWeight: activeTab === id ? '700' : '500',
                fontSize: '0.9rem',
                letterSpacing: '0.3px',
                borderRadius: '0 0.5rem 0.5rem 0',
                outline: 'none'
            }}
        >
            <Icon size={18} /> <span>{label}</span>
        </motion.button>
    );

    return (
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 100px)', margin: '0', background: 'var(--bg-darkest)', color: 'var(--text-light)', position: 'relative' }}>
            
            {/* Sidebar with modern glassmorphism design */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div 
                        initial={{ x: -250 }} 
                        animate={{ x: 0 }} 
                        exit={{ x: -250 }}
                        style={{ 
                            width: '260px', 
                            background: 'var(--bg-dark)', 
                            borderRight: '1px solid var(--glass-border)', 
                            backdropFilter: 'var(--glass-blur)', 
                            zIndex: 100, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            position: window.innerWidth < 768 ? 'absolute' : 'sticky', 
                            top: '100px', 
                            height: 'calc(100vh - 100px)',
                            paddingTop: '1.5rem'
                        }}
                    >
                        <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-light)', letterSpacing: '-0.5px' }}>Admin<span style={{ color: 'var(--primary)' }}>Panel</span></h2>
                            {window.innerWidth < 768 && <button className="btn-ghost" onClick={() => setSidebarOpen(false)}><X size={20} /></button>}
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
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

            {/* Main Content Pane */}
            <div style={{ flex: 1, padding: '2.5rem 2rem', overflowX: 'hidden', minHeight: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                    {!sidebarOpen && <button className="btn btn-ghost" style={{ padding: '0.5rem', borderRadius: '50%' }} onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>}
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', textTransform: 'capitalize', color: 'var(--text-light)', letterSpacing: '-0.5px' }}>
                        {activeTab === 'farmers' ? 'Farmer Verification' : activeTab} Dashboard
                    </h1>
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <TabSkeleton tab={activeTab} />
                        </motion.div>
                    ) : (
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.25 }}>
                            
                            {/* OVERVIEW TAB */}
                            {activeTab === 'overview' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                    {/* Platform Health Row */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                                        <StatCard title="Total Revenue" value={`₹${typeof analytics?.totalSales === 'number' ? analytics.totalSales.toLocaleString() : '0'}`} icon={DollarSign} color="0, 255, 157" />
                                        <StatCard title="Total Users" value={analytics?.totalUsers || 0} icon={Users} color="59, 130, 246" />
                                        <StatCard title="Total Farmers" value={analytics?.totalFarmers || 0} icon={Award} color="16, 185, 129" />
                                        <StatCard title="Active Crops" value={analytics?.totalProducts || 0} icon={Package} color="245, 158, 11" />
                                        <StatCard title="Total Orders" value={analytics?.totalOrders || 0} icon={ShoppingBag} color="168, 85, 247" />
                                        <StatCard title="Pending Verifications" value={pendingFarmers.length} icon={ShieldAlert} color="239, 68, 68" />
                                    </div>

                                    {/* Charts Section */}
                                    <div className="grid grid-cols-1 lg-grid-cols-3" style={{ gap: '2rem' }}>
                                        <div className="glass lg-col-span-2" style={{ padding: '2rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 'bold', color: 'var(--text-light)' }}>Revenue Growth</h3>
                                            <div style={{ height: '300px' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={revenueData}>
                                                        <defs>
                                                            <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                                                        <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                                                        <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                                                        <Tooltip contentStyle={{ background: 'var(--bg-dark)', borderColor: 'var(--glass-border)', borderRadius: '8px' }} />
                                                        <Area type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                        <div className="glass" style={{ padding: '2rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 'bold', color: 'var(--text-light)' }}>Order Status Overview</h3>
                                            <div style={{ height: '300px' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={analytics?.ordersByStatus || []}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                                                        <XAxis dataKey="_id" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                                                        <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                                                        <Tooltip cursor={{ fill: 'var(--bg-darker)' }} contentStyle={{ background: 'var(--bg-dark)', borderColor: 'var(--glass-border)' }} />
                                                        <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Verification Queue & Recent Users Section */}
                                    <div className="grid grid-cols-1 lg-grid-cols-3" style={{ gap: '2rem' }}>
                                        <div className="glass lg-col-span-2" style={{ padding: '2rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 'bold', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Award size={18} color="var(--primary)" /> Farmer Verification Queue
                                            </h3>
                                            
                                            {pendingFarmers.length === 0 ? (
                                                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                    🎉 All farmer profiles have been verified.
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    {pendingFarmers.slice(0, 5).map(f => (
                                                        <div key={f._id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-dark)', border: '1px dashed var(--glass-border)', borderRadius: '0.75rem', gap: '1rem' }}>
                                                            <div>
                                                                <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-light)' }}>{f?.name || 'Anonymous'}</h4>
                                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.1rem' }}>
                                                                    {f?.address?.city || 'City unspecified'} • {f?.phone || 'No phone'} • {f?.email || 'No email'}
                                                                </p>
                                                            </div>
                                                            <button 
                                                                onClick={() => toggleVerifyFarmer(f._id)}
                                                                className="btn btn-primary"
                                                                style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', borderRadius: '1.5rem' }}
                                                            >
                                                                Verify Farmer
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {pendingFarmers.length > 5 && (
                                                        <button 
                                                            onClick={() => handleTabChange('farmers')} 
                                                            style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', textAlign: 'left', marginTop: '0.5rem' }}
                                                        >
                                                            View all {pendingFarmers.length} pending profiles ➔
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="glass" style={{ padding: '2rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 'bold', color: 'var(--text-light)' }}>Recent Registrations</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {(analytics?.recentUsers || []).map(u => (
                                                    <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
                                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,255,157,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                                            {(u?.name || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u?.name || 'Anonymous'}</div>
                                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u?.email || 'No email'}</div>
                                                        </div>
                                                        <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'var(--bg-darker)', borderRadius: '1rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                                            {u?.role}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* USERS TAB */}
                            {activeTab === 'users' && (
                                <div className="glass" style={{ padding: '2rem' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-light)' }}>Registered Users ({filteredUsers.length})</h3>
                                        <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
                                            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                                            <input 
                                                type="text" 
                                                placeholder="Search users..." 
                                                value={searchQuery} 
                                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} 
                                                style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', borderRadius: '2rem', color: 'var(--text-light)', fontSize: '0.85rem' }} 
                                            />
                                        </div>
                                    </div>

                                    {filteredUsers.length === 0 ? (
                                        <EmptyState message="No users found" subtitle="Try expanding or changing your query filters." icon={Users} />
                                    ) : (
                                        <>
                                            <div style={{ overflowX: 'auto' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                                                    <thead>
                                                        <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                            <th style={{ padding: '1rem' }}>Name</th>
                                                            <th style={{ padding: '1rem' }}>Email</th>
                                                            <th style={{ padding: '1rem' }}>Role</th>
                                                            <th style={{ padding: '1rem' }}>Status</th>
                                                            <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {paginatedUsers.map(u => (
                                                            <tr key={u._id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }} className="hover-row">
                                                                <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-light)' }}>{u?.name || 'Anonymous'}</td>
                                                                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{u?.email || 'No email'}</td>
                                                                <td style={{ padding: '1rem' }}>
                                                                    <span style={{ padding: '0.2rem 0.6rem', background: u?.role === 'farmer' ? 'rgba(22, 163, 74, 0.08)' : 'var(--bg-darker)', color: u?.role === 'farmer' ? 'var(--primary)' : 'var(--text-light)', borderRadius: '1rem', fontSize: '0.75rem', textTransform: 'capitalize', fontWeight: 'bold' }}>
                                                                        {u?.role}
                                                                    </span>
                                                                </td>
                                                                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                                                                    {u?.isBlocked ? (
                                                                        <span style={{ color: 'var(--error)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Ban size={12} /> Blocked</span>
                                                                    ) : (
                                                                        <span style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={12} /> Active</span>
                                                                    )}
                                                                </td>
                                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                                                                        {u?.role !== 'admin' && (
                                                                            <>
                                                                                <button 
                                                                                    onClick={() => toggleBlockUser(u._id)} 
                                                                                    className="btn btn-ghost" 
                                                                                    style={{ padding: '0.4rem', color: u?.isBlocked ? 'var(--primary)' : 'var(--error)' }}
                                                                                    title={u?.isBlocked ? "Unblock user" : "Block user"}
                                                                                >
                                                                                    <ShieldAlert size={16} />
                                                                                </button>
                                                                                <button 
                                                                                    onClick={() => deleteUser(u._id)} 
                                                                                    className="btn btn-ghost" 
                                                                                    style={{ padding: '0.4rem', color: 'var(--text-muted)' }}
                                                                                    title="Delete user profile"
                                                                                >
                                                                                    <Trash size={16} />
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <Pagination current={currentPage} total={totalUsersPages} onPageChange={setCurrentPage} />
                                        </>
                                    )}
                                </div>
                            )}

                            {/* FARMERS TAB */}
                            {activeTab === 'farmers' && (
                                <div className="glass" style={{ padding: '2rem' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-light)' }}>Farmer Profiles ({filteredFarmers.length})</h3>
                                        <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
                                            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                                            <input 
                                                type="text" 
                                                placeholder="Search by city/name..." 
                                                value={searchQuery} 
                                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} 
                                                style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', borderRadius: '2rem', color: 'var(--text-light)', fontSize: '0.85rem' }} 
                                            />
                                        </div>
                                    </div>

                                    {filteredFarmers.length === 0 ? (
                                        <EmptyState message="No farmers found" subtitle="Try switching search queries or terms." icon={Award} />
                                    ) : (
                                        <>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                                {paginatedFarmers.map(f => (
                                                    <div key={f._id} style={{ background: 'var(--bg-darkest)', padding: '1.5rem', borderRadius: '1rem', border: f?.isVerified ? '1px solid rgba(0,255,157,0.2)' : '1px dashed rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                        <div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                                <div>
                                                                    <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-light)' }}>{f?.name || 'Anonymous'}</h4>
                                                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.15rem' }}>{f?.address?.city || 'No city registered'}</p>
                                                                </div>
                                                                {f?.isVerified ? (
                                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,255,157,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}><Award size={16} /></div>
                                                                ) : (
                                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-darker)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><Clock size={16} /></div>
                                                                )}
                                                            </div>
                                                            <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                                <p><strong>Phone:</strong> {f?.phone || 'No phone'}</p>
                                                                <p><strong>Email:</strong> {f?.email || 'No email'}</p>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => toggleVerifyFarmer(f._id)}
                                                            className="btn" 
                                                            style={{ width: '100%', background: f?.isVerified ? 'transparent' : 'var(--primary)', color: f?.isVerified ? 'var(--error)' : 'var(--bg-dark)', border: f?.isVerified ? '1px solid var(--error)' : 'none', padding: '0.5rem', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '0.5rem' }}
                                                        >
                                                            {f?.isVerified ? 'Revoke Verification' : 'Verify Farmer'}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <Pagination current={currentPage} total={totalFarmersPages} onPageChange={setCurrentPage} />
                                        </>
                                    )}
                                </div>
                            )}

                            {/* PRODUCTS TAB */}
                            {activeTab === 'products' && (
                                <div className="glass" style={{ padding: '2rem' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-light)' }}>Crops Listings ({filteredProducts.length})</h3>
                                        <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
                                            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                                            <input 
                                                type="text" 
                                                placeholder="Search crops..." 
                                                value={searchQuery} 
                                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} 
                                                style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', borderRadius: '2rem', color: 'var(--text-light)', fontSize: '0.85rem' }} 
                                            />
                                        </div>
                                    </div>

                                    {filteredProducts.length === 0 ? (
                                        <EmptyState message="No products listed" subtitle="Currently, there are no listings matching filters." icon={Package} />
                                    ) : (
                                        <>
                                            <div style={{ overflowX: 'auto' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                                                    <thead>
                                                        <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                            <th style={{ padding: '1rem' }}>Crop</th>
                                                            <th style={{ padding: '1rem' }}>Farmer</th>
                                                            <th style={{ padding: '1rem' }}>Category</th>
                                                            <th style={{ padding: '1rem' }}>Price & Qty</th>
                                                            <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {paginatedProducts.map(p => (
                                                            <tr key={p._id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }} className="hover-row">
                                                                <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-light)' }}>{p?.name || 'No name'}</td>
                                                                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{p?.farmer?.name || 'Unknown Farmer'}</td>
                                                                <td style={{ padding: '1rem', textTransform: 'capitalize', fontSize: '0.85rem' }}>{p?.category}</td>
                                                                <td style={{ padding: '1rem', fontWeight: '600' }}>₹{p?.price} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '0.75rem' }}>/ {p?.quantity}kg</span></td>
                                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                                    <button 
                                                                        onClick={() => deleteProduct(p._id)} 
                                                                        className="btn btn-ghost" 
                                                                        style={{ padding: '0.4rem', color: 'var(--error)' }}
                                                                        title="Delete product listing"
                                                                    >
                                                                        <Trash size={16} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <Pagination current={currentPage} total={totalProductsPages} onPageChange={setCurrentPage} />
                                        </>
                                    )}
                                </div>
                            )}

                            {/* REVIEWS TAB */}
                            {activeTab === 'reviews' && (
                                <div className="glass" style={{ padding: '2rem' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-light)' }}>Moderation Feed ({filteredReviews.length})</h3>
                                        <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
                                            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                                            <input 
                                                type="text" 
                                                placeholder="Search reviews..." 
                                                value={searchQuery} 
                                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} 
                                                style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', borderRadius: '2rem', color: 'var(--text-light)', fontSize: '0.85rem' }} 
                                            />
                                        </div>
                                    </div>

                                    {filteredReviews.length === 0 ? (
                                        <EmptyState message="No reviews listed" subtitle="Currently, there are no reviews posted on the platform." icon={Star} />
                                    ) : (
                                        <>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                                                {paginatedReviews.map(r => (
                                                    <div key={r._id} style={{ background: 'var(--bg-darkest)', padding: '1.5rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <div>
                                                                <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>{r?.user?.name || 'Anonymous'}</span>
                                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> reviewed </span>
                                                                <strong style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{r?.product?.name || 'Unknown Crop'}</strong>
                                                            </div>
                                                            <div style={{ display: 'flex', color: '#F59E0B', flexShrink: 0 }}>
                                                                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < r.rating ? "#F59E0B" : "transparent"} stroke={i < r.rating ? "#F59E0B" : "rgba(255,255,255,0.3)"} />)}
                                                            </div>
                                                        </div>
                                                        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', fontStyle: 'italic', background: 'var(--bg-darker)', padding: '0.75rem 1rem', borderRadius: '0.5rem', borderLeft: '3px solid var(--primary)', margin: 0 }}>
                                                            "{r?.comment || 'No comment text'}"
                                                        </p>
                                                        <button 
                                                            onClick={() => deleteReview(r._id)} 
                                                            className="btn btn-ghost" 
                                                            style={{ color: 'var(--error)', alignSelf: 'flex-end', fontSize: '0.75rem', padding: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                                        >
                                                            <Trash size={12} /> Remove Review
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <Pagination current={currentPage} total={totalReviewsPages} onPageChange={setCurrentPage} />
                                        </>
                                    )}
                                </div>
                            )}

                            {/* ORDERS TAB */}
                            {activeTab === 'orders' && (
                                <div className="glass" style={{ padding: '2rem' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-light)' }}>Global Orders List ({filteredOrders.length})</h3>
                                        <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
                                            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                                            <input 
                                                type="text" 
                                                placeholder="Search orders..." 
                                                value={searchQuery} 
                                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} 
                                                style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', borderRadius: '2rem', color: 'var(--text-light)', fontSize: '0.85rem' }} 
                                            />
                                        </div>
                                    </div>

                                    {filteredOrders.length === 0 ? (
                                        <EmptyState message="No orders tracked" subtitle="There are no orders that match the filter terms." icon={ShoppingBag} />
                                    ) : (
                                        <>
                                            <div style={{ overflowX: 'auto' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                                                    <thead>
                                                        <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                            <th style={{ padding: '1rem' }}>Order ID</th>
                                                            <th style={{ padding: '1rem' }}>Consumer</th>
                                                            <th style={{ padding: '1rem' }}>Farmer</th>
                                                            <th style={{ padding: '1rem' }}>Total</th>
                                                            <th style={{ padding: '1rem' }}>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {paginatedOrders.map(o => (
                                                            <tr key={o._id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }} className="hover-row">
                                                                <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--text-light)' }}>#{(o?._id || '').slice(-6).toUpperCase()}</td>
                                                                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{o?.consumer?.name || 'Local Customer'}</td>
                                                                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{o?.farmer?.name || 'Farmer Account'}</td>
                                                                <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 'bold' }}>₹{o?.totalAmount || 0}</td>
                                                                <td style={{ padding: '1rem' }}>
                                                                    <span style={{ padding: '0.2rem 0.6rem', background: o?.status === 'delivered' ? 'rgba(22, 163, 74, 0.08)' : 'var(--bg-darker)', color: o?.status === 'delivered' ? 'var(--primary)' : 'var(--text-light)', borderRadius: '1rem', fontSize: '0.75rem', textTransform: 'capitalize', fontWeight: 'bold', border: '1px solid var(--glass-border)' }}>
                                                                        {o?.status || 'pending'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <Pagination current={currentPage} total={totalOrdersPages} onPageChange={setCurrentPage} />
                                        </>
                                    )}
                                </div>
                            )}

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminDashboard;
