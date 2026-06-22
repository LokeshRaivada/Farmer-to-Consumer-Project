import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, Filter, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import ProductDetailsModal from '../components/ProductDetailsModal';

const ProductCard = ({ product, onClick }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user, lang } = useAuth();
    const [added, setAdded] = useState(false);

    const handleAdd = (e) => {
        e.stopPropagation();
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const getCropEmoji = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('tomato')) return '🍅';
        if (lower.includes('onion')) return '🧅';
        if (lower.includes('potato')) return '🥔';
        if (lower.includes('spinach') || lower.includes('green') || lower.includes('🥬') || lower.includes('కూర')) return '🥬';
        if (lower.includes('carrot')) return '🥕';
        if (lower.includes('chilli') || lower.includes('mirchi')) return '🌶️';
        if (lower.includes('mango')) return '🥭';
        if (lower.includes('banana')) return '🍌';
        if (lower.includes('rice') || lower.includes('paddy') || lower.includes('grain') || lower.includes('ధాన్యం')) return '🌾';
        return '🌾';
    };

    const emoji = getCropEmoji(product.name);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -6, boxShadow: 'var(--shadow-glow)', borderColor: 'var(--primary)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="glass"
            style={{ 
                padding: '1.25rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.75rem', 
                position: 'relative',
                cursor: 'pointer',
                textAlign: 'left',
                borderRadius: '1.25rem',
                background: 'var(--bg-darkest)'
            }}
            onClick={onClick}
        >
            {/* Image Box */}
            <div style={{ 
                height: '140px', 
                background: 'var(--bg-darker)', 
                borderRadius: '0.75rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                overflow: 'hidden',
                fontSize: '4.5rem'
            }}>
                {emoji}
            </div>

            {/* Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%', margin: 0 }}>{product.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', color: '#eab308', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        <Star size={12} fill="#eab308" stroke="#eab308" />
                        <span>{product.averageRating > 0 ? product.averageRating.toFixed(1) : (lang === 'te' ? 'కొత్తది' : 'New')}</span>
                    </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem', width: '100%' }}>
                    <span>By </span>
                    {product.farmer?._id ? (
                        <span 
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/farmers/${product.farmer._id}`);
                            }}
                            style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                            {product.farmer.name}
                        </span>
                    ) : (
                        <span>{product.farmer?.name || 'Farmer'}</span>
                    )}
                    {product.farmer?.isVerified && (
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.75rem', marginLeft: '0.15rem' }} title="Verified Farmer">
                            🛡️
                        </span>
                    )}
                    {product.farmer?._id && (
                        <span 
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/farmers/${product.farmer._id}`);
                            }}
                            style={{ 
                                marginLeft: 'auto', 
                                color: 'var(--primary)', 
                                fontWeight: '700', 
                                fontSize: '0.7rem', 
                                cursor: 'pointer', 
                                border: '1px solid var(--primary)', 
                                padding: '0.15rem 0.4rem', 
                                borderRadius: '0.5rem',
                                background: 'var(--primary-glow)',
                                display: 'inline-flex',
                                alignItems: 'center'
                            }}
                        >
                            {lang === 'te' ? 'రైతు ప్రొఫైల్' : 'View Farmer'}
                        </span>
                    )}
                </div>

                {product.distance !== undefined && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={12} /> <span>{product.distance.toFixed(1)} {lang === 'te' ? 'కి.మీ దూరం' : 'KM away'}</span>
                    </div>
                )}
            </div>

            {/* Footer / Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)', marginTop: 'auto' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-light)' }}>
                    ₹{product.price} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/kg</span>
                </div>

                <button 
                    className={`btn ${added ? 'btn-secondary' : 'btn-primary'}`} 
                    style={{ padding: '0.5rem 1.0rem', borderRadius: '1.5rem', fontSize: '0.85rem', textTransform: 'none', minHeight: '40px' }}
                    onClick={handleAdd}
                    disabled={user?.role === 'farmer' || product.quantity <= 0}
                >
                    {added ? (lang === 'te' ? 'జోడించబడింది' : 'Added') : (lang === 'te' ? 'కార్ట్' : '🛒 Add')}
                </button>
            </div>
        </motion.div>
    );
};

const SkeletonCard = () => (
    <div className="glass" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '260px', borderRadius: '1.25rem', background: 'var(--bg-darkest)' }}>
        <div style={{ height: '140px', background: 'var(--bg-darker)', borderRadius: '0.75rem', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ height: '18px', width: '60%', background: 'var(--bg-darker)', borderRadius: '0.2rem', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ height: '12px', width: '40%', background: 'var(--bg-darker)', borderRadius: '0.2rem', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
            <div style={{ height: '24px', width: '30%', background: 'var(--bg-darker)', borderRadius: '0.2rem', animation: 'pulse 1.5s infinite' }}></div>
            <div style={{ height: '28px', width: '30%', background: 'var(--bg-darker)', borderRadius: '1.5rem', animation: 'pulse 1.5s infinite' }}></div>
        </div>
    </div>
);

const ConsumerStore = () => {
    const { t, user, lang } = useAuth();
    const [products, setProducts] = useState([]);
    
    // Search & Filter States
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [maxPrice, setMaxPrice] = useState(150);
    
    // Location Filter States
    const [city, setCity] = useState('');
    const [pincode, setPincode] = useState('');
    const [distance, setDistance] = useState(50);
    const [coords, setCoords] = useState(null);
    const [locating, setLocating] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const searchInputRef = useRef(null);

    // Initial parsing of search query parameters
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const cat = queryParams.get('category');
        if (cat) setCategory(cat);
        const searchQ = queryParams.get('search');
        if (searchQ) setSearch(searchQ);
        const focusSearch = queryParams.get('focusSearch');
        if (focusSearch === 'true' && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (search) params.search = search;
            if (category) params.category = category;
            if (city) params.city = city;
            if (pincode) params.pincode = pincode;
            if (coords) {
                params.lat = coords.lat;
                params.lon = coords.lon;
                params.distance = distance;
            }
            
            const prodRes = await axios.get('/api/consumer/products', { params });
            
            // Client-side filtering
            let processedProducts = [...prodRes.data];
            processedProducts = processedProducts.filter(p => p.price <= maxPrice);
            
            setProducts(processedProducts);
        } catch (error) {
            console.error('Fetch store error:', error);
            setError('Failed to load products. Please check your network connection or try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        const delayDebounce = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [search, category, city, pincode, distance, coords, maxPrice]);

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
                setLocating(false);
            },
            (error) => {
                console.error(error);
                alert('Unable to retrieve location');
                setLocating(false);
            }
        );
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', textAlign: 'left' }}>
            
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'var(--text-light)', margin: 0 }}>
                        {lang === 'te' ? 'పంటల మార్కెట్' : 'Marketplace'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>
                        {lang === 'te' ? 'నేరుగా రైతుల నుండి కొనుగోలు చేయండి' : 'Fresh crops listed directly from farm fields'}
                    </p>
                </div>
            </div>

            {/* Layout Wrapper */}
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                
                {/* Mobile Filters Toggle Bar */}
                <button 
                    className="mobile-filters-toggle btn btn-secondary" 
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    style={{ 
                        width: '100%', 
                        marginBottom: '1rem', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        minHeight: '44px',
                        borderRadius: '1.5rem',
                        fontWeight: 'bold',
                        fontSize: '0.95rem'
                    }}
                >
                    {showMobileFilters ? '⚡ ' + (lang === 'te' ? 'ఫిల్టర్లు దాచు' : 'Hide Filters') : '🔍 ' + (lang === 'te' ? 'ఫిల్టర్లను చూపించు' : 'Show Filters')}
                </button>

                {/* Desktop Left Sidebar Filters */}
                <aside className={`glass store-filters-sidebar ${showMobileFilters ? 'show' : ''}`} style={{ flex: '1 1 280px', maxWidth: '300px', width: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '7rem', borderRadius: '1.5rem', background: 'var(--bg-darkest)' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-light)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        🛡️ {lang === 'te' ? 'ఫిల్టర్లు' : 'Filters'}
                    </h3>

                    {/* Search Crops */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: 'bold' }}>🔍 {lang === 'te' ? 'వెతకండి' : 'Search Crops'}</label>
                        <div style={{ position: 'relative' }}>
                            <Search style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                            <input 
                                ref={searchInputRef}
                                type="text" 
                                placeholder={lang === 'te' ? 'టమాటా, వరి, ఉల్లిపాయ...' : "Tomato, Rice, Potato..."}
                                style={{ width: '100%', padding: '0.6rem 0.8rem 0.6rem 2.2rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', borderRadius: '2rem', color: 'var(--text-light)', fontSize: '0.85rem', outline: 'none' }}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Category Select */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: 'bold' }}>🥬 {lang === 'te' ? 'రకాలు' : 'Category'}</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {[
                              { key: '', labelEn: 'All Categories', labelTe: 'అన్ని రకాలు' },
                              { key: 'vegetables', labelEn: 'Fresh Vegetables', labelTe: 'తాజా కూరగాయలు' },
                              { key: 'fruits', labelEn: 'Fresh Fruits', labelTe: 'తాజా పండ్లు' },
                              { key: 'grains', labelEn: 'Grains & Pulses', labelTe: 'ధాన్యాలు & పప్పులు' }
                            ].map(cat => (
                                <button
                                    key={cat.key}
                                    onClick={() => setCategory(cat.key)}
                                    style={{
                                        background: category === cat.key ? 'rgba(22, 163, 74, 0.1)' : 'transparent',
                                        color: category === cat.key ? 'var(--primary)' : 'var(--text-light)',
                                        border: category === cat.key ? '1px solid var(--primary)' : '1px solid transparent',
                                        borderRadius: '0.5rem',
                                        padding: '0.5rem 0.75rem',
                                        fontSize: '0.85rem',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        textTransform: 'none',
                                        minHeight: '36px'
                                    }}
                                >
                                    {lang === 'te' ? cat.labelTe : cat.labelEn}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Nearby Farms (Location) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', background: 'rgba(22, 163, 74, 0.05)', border: '1px dashed var(--primary)', padding: '1rem', borderRadius: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                            <MapPin size={16} /> <span>📍 {lang === 'te' ? 'దగ్గరి పొలాలు' : 'Nearby Farms'}</span>
                        </div>
                        
                        <button 
                            onClick={handleDetectLocation} 
                            className="btn" 
                            style={{ background: coords ? 'var(--primary)' : 'var(--bg-darker)', color: coords ? 'var(--white)' : 'var(--text-light)', borderRadius: '2rem', fontSize: '0.85rem', padding: '0.5rem 1rem', width: '100%', textTransform: 'none', border: 'none', cursor: 'pointer', minHeight: '36px' }}
                        >
                            {locating 
                              ? (lang === 'te' ? 'వెతుకుతోంది...' : 'Locating...') 
                              : coords 
                                ? (lang === 'te' ? 'లొకేషన్ యాక్టివ్' : 'Location Active') 
                                : (lang === 'te' ? 'స్థానాన్ని గుర్తించు' : 'Detect Location')
                            }
                        </button>

                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <input 
                                type="text" 
                                placeholder={lang === 'te' ? 'నగరం' : "City"} 
                                value={city} 
                                onChange={(e) => setCity(e.target.value)}
                                style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '2rem', fontSize: '0.8rem', width: '50%', outline: 'none' }}
                            />
                            <input 
                                type="text" 
                                placeholder={lang === 'te' ? 'పిన్ కోడ్' : "Zip"} 
                                value={pincode} 
                                onChange={(e) => setPincode(e.target.value)}
                                style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', color: 'var(--text-light)', borderRadius: '2rem', fontSize: '0.8rem', width: '50%', outline: 'none' }}
                            />
                        </div>

                        {coords && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    <span>{lang === 'te' ? 'పరిధి' : 'Radius'}</span>
                                    <span>{distance} km</span>
                                </div>
                                <input 
                                    type="range" min="5" max="150" value={distance} onChange={(e) => setDistance(Number(e.target.value))}
                                    style={{ accentColor: 'var(--primary)' }}
                                />
                            </div>
                        )}

                        {(city || pincode || coords) && (
                            <button onClick={() => { setCity(''); setPincode(''); setCoords(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--error)', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'center', textTransform: 'none', padding: 0 }}>
                                {lang === 'te' ? 'తీసివేయి' : 'Clear Location'}
                            </button>
                        )}
                    </div>

                    {/* Price Range */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: 'bold' }}>
                            <span>💰 {lang === 'te' ? 'ధర పరిధి' : 'Price Range'}</span>
                            <span style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>₹{maxPrice}/kg</span>
                        </div>
                        <input 
                            type="range" 
                            min="20" 
                            max="200" 
                            value={maxPrice} 
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--primary)' }}
                        />
                    </div>
                </aside>

                {/* Product Grid Area */}
                <div style={{ flex: '3 1 600px' }}>
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: '1rem' }}>
                            <div className="loading" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Loading Products...</span>
                        </div>
                    ) : error ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                            style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-darker)', borderRadius: '2rem', border: '1px solid var(--glass-border)', maxWidth: '500px', margin: '2rem auto' }}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
                            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: 'var(--text-light)' }}>Connection Error</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{error}</p>
                            <button onClick={fetchProducts} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', borderRadius: '2rem' }}>Retry</button>
                        </motion.div>
                    ) : products.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                            style={{ textAlign: 'center', padding: '6rem 2rem', background: 'var(--bg-darker)', borderRadius: '2rem', border: '1px dashed var(--glass-border)' }}
                        >
                            <Search size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: 'var(--text-light)' }}>No products found</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Try adjusting your search query, price ranges, or location filters.</p>
                            <button onClick={() => { setSearch(''); setCategory(''); setCity(''); setPincode(''); setCoords(null); setMaxPrice(150); }} className="btn btn-primary" style={{ marginTop: '1.5rem', padding: '0.5rem 1.5rem', borderRadius: '2rem' }}>Reset Filters</button>
                        </motion.div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
                            <AnimatePresence>
                                {products.map(p => (
                                    <ProductCard 
                                        key={p._id} 
                                        product={p} 
                                        onClick={() => setSelectedProduct(p)} 
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Product Details Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <ProductDetailsModal 
                        product={selectedProduct} 
                        onClose={() => setSelectedProduct(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ConsumerStore;
