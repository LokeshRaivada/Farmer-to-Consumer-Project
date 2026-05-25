import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Filter, ShoppingCart, Leaf, Heart, Package, Star, LayoutGrid, List, ChevronDown, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import ProductDetailsModal from '../components/ProductDetailsModal';

const ProductCard = ({ product, viewMode, initialWishlisted, onClick }) => {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [added, setAdded] = useState(false);
    const [wishlisted, setWishlisted] = useState(initialWishlisted);

    const handleAdd = () => {
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const toggleWishlist = async () => {
        if (!user) {
            alert('Please login to use the wishlist!');
            return;
        }
        try {
            await axios.post(`/api/consumer/wishlist/${product._id}`);
            setWishlisted(!wishlisted);
        } catch (error) {
            console.error('Wishlist error:', error);
        }
    };

    const isList = viewMode === 'list';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -5 }}
            className="glass"
            style={{ 
                padding: '1.5rem', 
                display: 'flex', 
                flexDirection: isList ? 'row' : 'column', 
                gap: '1.5rem', 
                position: 'relative',
                alignItems: isList ? 'center' : 'stretch',
                cursor: 'pointer'
            }}
            onClick={onClick}
        >
            {/* Badges */}
            <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
                {product.category === 'vegetables' && <span style={{ background: 'var(--primary)', color: 'var(--bg-dark)', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Leaf size={10}/> Fresh</span>}
                <span style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', color: 'white', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontWeight: 'bold' }}>Organic</span>
            </div>

            {/* Wishlist Button */}
            <button 
                onClick={(e) => { e.stopPropagation(); toggleWishlist(); }}
                style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10, background: 'rgba(0,0,0,0.3)', borderRadius: '50%', padding: '0.5rem', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }}
                className="hover-glow"
            >
                <Heart size={18} color={wishlisted ? 'var(--error)' : 'white'} fill={wishlisted ? 'var(--error)' : 'transparent'} />
            </button>

            {/* Image Placeholder */}
            <div style={{ 
                height: isList ? '120px' : '180px', 
                width: isList ? '120px' : '100%',
                background: 'linear-gradient(135deg, rgba(0,255,157,0.1), rgba(0,208,132,0.05))', 
                borderRadius: '0.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                overflow: 'hidden',
                flexShrink: 0
            }}>
                <Leaf color="var(--primary)" size={48} opacity={0.5} />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{product.name}</h3>
                        <p style={{ color: 'var(--primary)', fontSize: '0.85rem', textTransform: 'capitalize' }}>{product.category}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#F59E0B', fontSize: '0.85rem' }}>
                        <Star size={14} fill={product.averageRating > 0 ? "#F59E0B" : "transparent"} />
                        <span>{product.averageRating > 0 ? product.averageRating.toFixed(1) : 'New'}</span>
                        <span style={{ color: 'var(--text-muted)' }}>({product.numReviews || 0})</span>
                    </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Award size={12} color="var(--bg-dark)" />
                    </div>
                    <span>{product.farmer?.name || 'Verified Farmer'}</span>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={14} color="var(--primary)" /> 
                    {product.farmer?.address?.city || 'Local Area'}, {product.farmer?.address?.state || 'District'}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: isList ? '0' : 'auto', paddingTop: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
                            ₹{product.price} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ kg</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: product.quantity > 5 ? 'var(--primary)' : 'var(--error)' }}>
                            {product.quantity > 0 ? `${product.quantity} kg in stock` : 'Out of stock'}
                        </div>
                    </div>
                    <button 
                        className={`btn ${added ? 'btn-secondary' : 'btn-primary'}`} 
                        style={{ padding: '0.6rem 1rem', borderRadius: '2rem' }}
                        onClick={(e) => { e.stopPropagation(); handleAdd(); }}
                        disabled={user?.role === 'farmer' || product.quantity <= 0}
                    >
                        {added ? <Package size={18} /> : <ShoppingCart size={18} />}
                        <span style={{ marginLeft: '0.5rem' }}>{added ? 'Added' : 'Add'}</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

const SkeletonCard = () => (
    <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ height: '180px', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ height: '24px', width: '60%', background: 'rgba(255,255,255,0.05)', borderRadius: '0.25rem', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ height: '16px', width: '40%', background: 'rgba(255,255,255,0.05)', borderRadius: '0.25rem', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <div style={{ height: '30px', width: '30%', background: 'rgba(255,255,255,0.05)', borderRadius: '0.25rem', animation: 'pulse 1.5s infinite' }}></div>
            <div style={{ height: '36px', width: '30%', background: 'rgba(255,255,255,0.05)', borderRadius: '2rem', animation: 'pulse 1.5s infinite' }}></div>
        </div>
    </div>
);

const ConsumerStore = () => {
    const { t } = useAuth();
    const [products, setProducts] = useState([]);
    const [farmers, setFarmers] = useState([]);
    
    // Search & Filter State
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [sort, setSort] = useState('newest');
    const [viewMode, setViewMode] = useState('grid');
    
    // Location State
    const [city, setCity] = useState('');
    const [pincode, setPincode] = useState('');
    const [distance, setDistance] = useState(50); // km
    const [coords, setCoords] = useState(null); // {lat, lon}
    const [locating, setLocating] = useState(false);

    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [wishlistIds, setWishlistIds] = useState([]);

    const fetchProductsAndFarmers = async () => {
        setLoading(true);
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
            
            const [prodRes, farmRes] = await Promise.all([
                axios.get('/api/consumer/products', { params }),
                axios.get('/api/consumer/farmers', { params })
            ]);
            
            // Client-side sorting for products
            let sortedData = [...prodRes.data];
            if (sort === 'price-low') sortedData.sort((a,b) => a.price - b.price);
            if (sort === 'price-high') sortedData.sort((a,b) => b.price - a.price);
            
            setProducts(sortedData);
            setFarmers(farmRes.data);

            // Fetch wishlist if logged in
            if (localStorage.getItem('token')) {
                const { data: wishData } = await axios.get('/api/consumer/wishlist');
                const ids = wishData.map(p => p._id || p);
                setWishlistIds(ids);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        const delayDebounceFn = setTimeout(() => {
            fetchProductsAndFarmers();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search, category, sort, city, pincode, distance, coords]);

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
                alert('Unable to retrieve your location');
                setLocating(false);
            }
        );
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
            
            {/* Header & Advanced Filters */}
            <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ position: 'relative', flex: '1 1 300px' }}>
                        <Search style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} size={20} />
                        <input 
                            type="text" 
                            placeholder="Search fresh vegetables, fruits, grains..."
                            style={{ width: '100%', padding: '1rem 1rem 1rem 3.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '2rem', color: 'white', fontSize: '1rem' }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '0.5rem' }}>
                        <button onClick={() => setViewMode('grid')} className="btn btn-ghost" style={{ padding: '0.5rem', background: viewMode === 'grid' ? 'rgba(255,255,255,0.1)' : 'transparent' }}><LayoutGrid size={20} /></button>
                        <button onClick={() => setViewMode('list')} className="btn btn-ghost" style={{ padding: '0.5rem', background: viewMode === 'list' ? 'rgba(255,255,255,0.1)' : 'transparent' }}><List size={20} /></button>
                    </div>
                </div>

                {/* Location Filter Panel */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', padding: '1rem', background: 'rgba(0,255,157,0.05)', borderRadius: '1rem', border: '1px dashed rgba(0,255,157,0.2)', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                        <MapPin size={20} /> <span style={{ fontWeight: 'bold' }}>Find Local</span>
                    </div>
                    
                    <button 
                        onClick={handleDetectLocation} 
                        className="btn" 
                        style={{ background: coords ? 'var(--primary)' : 'rgba(255,255,255,0.1)', color: coords ? 'var(--bg-dark)' : 'white', borderRadius: '2rem', fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {locating ? 'Locating...' : coords ? 'Location Active' : 'Detect My Location'}
                    </button>

                    <input 
                        type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)}
                        style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '2rem', fontSize: '0.85rem', width: '120px' }}
                    />
                    <input 
                        type="text" placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)}
                        style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '2rem', fontSize: '0.85rem', width: '100px' }}
                    />
                    
                    {coords && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                            <span>Radius:</span>
                            <input 
                                type="range" min="5" max="200" value={distance} onChange={(e) => setDistance(e.target.value)}
                                style={{ accentColor: 'var(--primary)', width: '80px' }}
                            />
                            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{distance} km</span>
                        </div>
                    )}
                    
                    {(city || pincode || coords) && (
                        <button onClick={() => { setCity(''); setPincode(''); setCoords(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--error)', fontSize: '0.85rem', cursor: 'pointer', marginLeft: 'auto' }}>
                            Clear Location
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {['', 'vegetables', 'fruits', 'grains'].map((cat) => (
                            <button 
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`btn ${category === cat ? 'btn-primary' : 'btn-ghost'}`}
                                style={{ textTransform: 'capitalize', padding: '0.5rem 1.25rem', borderRadius: '2rem', whiteSpace: 'nowrap' }}
                            >
                                {cat || 'All Categories'}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={16} color="var(--text-muted)" />
                        <select 
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.5rem 1rem', borderRadius: '2rem', appearance: 'none', paddingRight: '2rem' }}
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Top Rated</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Nearby Farmers Spotlight (Only shown if farmers exist and user is searching by location) */}
            {(city || pincode || coords) && farmers.length > 0 && (
                <div style={{ marginBottom: '3rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Award size={24} color="var(--primary)" /> Top Farmers Near You
                    </h3>
                    <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                        {farmers.slice(0, 5).map(farmer => (
                            <div key={farmer._id} className="glass hover-glow" style={{ padding: '1.5rem', borderRadius: '1rem', minWidth: '250px', flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0,255,157,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Leaf size={24} color="var(--primary)" />
                                    </div>
                                    {farmer.distance !== undefined && (
                                        <span style={{ background: 'var(--primary)', color: 'var(--bg-dark)', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>
                                            {farmer.distance} km away
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{farmer.name}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                                        <MapPin size={12} /> {farmer.address?.city || 'Local Area'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Product Grid / List */}
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                {(city || pincode || coords) ? 'Fresh Products Near You' : 'All Products'}
            </h3>

            {loading ? (
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md-grid-cols-2 lg-grid-cols-4' : 'grid-cols-1'}`}>
                    {[1,2,3,4,5,6,7,8].map(i => <SkeletonCard key={i} />)}
                </div>
            ) : (
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md-grid-cols-2 lg-grid-cols-4' : 'grid-cols-1 md-grid-cols-2'}`}>
                    <AnimatePresence>
                        {products.map(p => <ProductCard key={p._id} product={p} viewMode={viewMode} initialWishlisted={wishlistIds.includes(p._id)} onClick={() => setSelectedProduct(p)} />)}
                    </AnimatePresence>
                </div>
            )}

            {!loading && products.length === 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', padding: '6rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.1)' }}
                >
                    <Search size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No products found</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search filters or browse another category.</p>
                    <button onClick={() => { setSearch(''); setCategory(''); setCity(''); setPincode(''); setCoords(null); }} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Clear Filters</button>
                </motion.div>
            )}

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
