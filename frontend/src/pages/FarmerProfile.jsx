import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, MapPin, Star, Package, ShoppingCart, Loader, 
    Share2, Phone, ArrowLeft, Calendar, Award, Clock, Eye 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductDetailsModal from '../components/ProductDetailsModal';

const FarmerProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, lang } = useAuth();
    const { addToCart } = useCart();

    const [farmer, setFarmer] = useState(null);
    const [activeCropsCount, setActiveCropsCount] = useState(0);
    const [isTopSeller, setIsTopSeller] = useState(false);
    const [products, setProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [coords, setCoords] = useState(null);
    const [addedProductId, setAddedProductId] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [copied, setCopied] = useState(false);

    // Auto-detect location for distance calculations
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoords({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (err) => {
                    console.log('Location detection skipped or blocked:', err.message);
                }
            );
        }
    }, []);

    // Fetch Farmer Profile
    useEffect(() => {
        const fetchFarmerProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await axios.get(`/api/farmers/${id}`);
                setFarmer(data.farmer);
                setActiveCropsCount(data.activeCropsCount);
                setIsTopSeller(data.isTopSeller);
            } catch (err) {
                console.error('Error fetching farmer:', err);
                setError(err.response?.data?.message || 'Failed to load farmer profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchFarmerProfile();
    }, [id]);

    // Fetch Farmer Products
    useEffect(() => {
        const fetchProducts = async () => {
            setProductsLoading(true);
            try {
                const queryParams = coords ? `?lat=${coords.lat}&lon=${coords.lon}` : '';
                const { data } = await axios.get(`/api/farmers/${id}/products${queryParams}`);
                setProducts(data || []);
            } catch (err) {
                console.error('Error fetching products:', err);
            } finally {
                setProductsLoading(false);
            }
        };
        fetchProducts();
    }, [id, coords]);

    // Fetch Farmer Reviews
    useEffect(() => {
        const fetchReviews = async () => {
            setReviewsLoading(true);
            try {
                const { data } = await axios.get(`/api/farmers/${id}/reviews`);
                setReviews(data || []);
            } catch (err) {
                console.error('Error fetching reviews:', err);
            } finally {
                setReviewsLoading(false);
            }
        };
        fetchReviews();
    }, [id]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(err => {
                console.error('Clipboard copy failed:', err);
            });
    };

    const handleAddToCart = (product, e) => {
        e.stopPropagation();
        addToCart(product);
        setAddedProductId(product._id);
        setTimeout(() => setAddedProductId(null), 2000);
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

    const formatJoinedDate = (dateStr) => {
        if (!dateStr) return '';
        const options = { year: 'numeric', month: 'long' };
        return new Date(dateStr).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                <Loader className="animate-spin" size={32} color="var(--primary)" />
                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Loading Farmer Profile...</span>
            </div>
        );
    }

    if (error || !farmer) {
        return (
            <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', textAlign: 'center' }} className="glass">
                <h2 style={{ color: 'var(--danger)', fontWeight: 'bold', marginBottom: '1rem' }}>Profile Error</h2>
                <p style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>{error || 'Farmer profile could not be found.'}</p>
                <button className="btn btn-primary" onClick={() => navigate('/store')}>
                    {lang === 'te' ? 'స్టోర్‌కి తిరిగి వెళ్ళు' : 'Back to Store'}
                </button>
            </div>
        );
    }

    return (
        <div style={{ 
            maxWidth: '1200px', 
            margin: '1.5rem auto', 
            padding: '0 1rem 3rem 1rem', 
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
        }}>
            {/* Back Navigation Link */}
            <div>
                <button 
                    onClick={() => navigate(-1)} 
                    style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--text-muted)', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.4rem', 
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '0.9rem',
                        fontWeight: '600'
                    }}
                    className="hover-primary"
                >
                    <ArrowLeft size={16} /> 
                    {lang === 'te' ? 'వెనుకకు' : 'Back'}
                </button>
            </div>

            {/* Profile Cover & Header Section */}
            <div style={{ position: 'relative' }}>
                {/* Cover Banner */}
                <div style={{ 
                    height: '200px', 
                    background: 'linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.2)), url("https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80")', 
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '1.25rem',
                    boxShadow: 'var(--shadow-card)'
                }} />

                {/* Profile Card Header Info */}
                <div className="glass" style={{ 
                    marginTop: '-4rem',
                    marginRight: '1rem',
                    marginLeft: '1rem',
                    borderRadius: '1.25rem',
                    padding: '1.5rem',
                    background: 'var(--bg-darkest)',
                    border: '1px solid var(--glass-border)',
                    boxShadow: 'var(--shadow-card)',
                    position: 'relative',
                    zIndex: 2
                }}>
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'row', 
                        flexWrap: 'wrap', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        gap: '1.5rem' 
                    }}>
                        {/* Avatar & Identifiers */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                            {/* Initials Avatar Badge */}
                            <div style={{ 
                                width: '80px', 
                                height: '80px', 
                                borderRadius: '50%', 
                                background: 'var(--primary-glow)', 
                                border: '3px solid var(--primary)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                color: 'var(--primary)', 
                                fontSize: '2.2rem', 
                                fontWeight: '900',
                                boxShadow: 'var(--shadow-glow)'
                            }}>
                                {farmer.name.charAt(0).toUpperCase()}
                            </div>

                            {/* Name, Location & Badges */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <h1 style={{ 
                                    fontSize: '1.75rem', 
                                    fontWeight: '800', 
                                    color: 'var(--text-light)', 
                                    margin: 0,
                                    lineHeight: '1.2'
                                }}>
                                    {farmer.name}
                                </h1>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    <MapPin size={14} color="var(--primary)" /> 
                                    <span>{farmer.address?.city || 'Local Area'}, {farmer.address?.state || 'India'}</span>
                                </div>

                                {/* Dynamic Badges */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.2rem' }}>
                                    {farmer.isVerified ? (
                                        <span style={{ 
                                            background: 'var(--primary-glow)', 
                                            color: 'var(--primary)', 
                                            fontSize: '0.75rem', 
                                            fontWeight: 'bold', 
                                            padding: '0.2rem 0.6rem', 
                                            borderRadius: '1rem',
                                            border: '1px solid var(--primary)'
                                        }}>
                                            🛡️ {lang === 'te' ? 'వెరిఫైడ్ రైతు' : 'Verified Farmer'}
                                        </span>
                                    ) : (
                                        <span style={{ 
                                            background: 'rgba(234, 179, 8, 0.1)', 
                                            color: '#eab308', 
                                            fontSize: '0.75rem', 
                                            fontWeight: 'bold', 
                                            padding: '0.2rem 0.6rem', 
                                            borderRadius: '1rem',
                                            border: '1px solid rgba(234, 179, 8, 0.3)'
                                        }}>
                                            🛡️ {lang === 'te' ? 'వెరిఫికేషన్ పురోగతిలో ఉంది' : 'Verification Pending'}
                                        </span>
                                    )}

                                    {isTopSeller && (
                                        <span style={{ 
                                            background: 'rgba(234, 179, 8, 0.15)', 
                                            color: '#eab308', 
                                            fontSize: '0.75rem', 
                                            fontWeight: 'bold', 
                                            padding: '0.2rem 0.6rem', 
                                            borderRadius: '1rem',
                                            border: '1px solid #eab308'
                                        }}>
                                            🏆 Top Seller
                                        </span>
                                    )}

                                    {/* Future response time element */}
                                    <span style={{ 
                                        background: 'var(--bg-darker)', 
                                        color: 'var(--text-muted)', 
                                        fontSize: '0.75rem', 
                                        padding: '0.2rem 0.6rem', 
                                        borderRadius: '1rem',
                                        border: '1px solid var(--border)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}>
                                        <Clock size={10} /> {lang === 'te' ? 'సాధారణంగా 2 గంటల్లో స్పందిస్తారు' : 'Usually responds within 2 hrs'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Top Right Action - Share profile */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignSelf: 'stretch', justifyContent: 'center' }}>
                            <button 
                                onClick={handleShare}
                                className="btn btn-secondary"
                                style={{ 
                                    padding: '0.5rem 1rem', 
                                    borderRadius: '1.5rem', 
                                    fontSize: '0.85rem', 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '0.4rem', 
                                    minHeight: '40px',
                                    justifyContent: 'center'
                                }}
                            >
                                <Share2 size={14} /> 
                                {copied ? (lang === 'te' ? 'కాపీ చేయబడింది!' : 'Link Copied!') : (lang === 'te' ? 'ప్రొఫైల్ షేర్ చేయి' : 'Share Profile')}
                            </button>
                        </div>
                    </div>

                    {/* Contact Actions Box (No Phone Text Displayed) */}
                    {farmer.phone && (
                        <div style={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: '0.75rem', 
                            marginTop: '1.5rem', 
                            borderTop: '1px solid var(--glass-border)', 
                            paddingTop: '1.25rem' 
                        }}>
                            <a 
                                href={`tel:${farmer.phone}`}
                                className="btn btn-secondary"
                                style={{ 
                                    flex: '1 1 140px', 
                                    minHeight: '46px', 
                                    textDecoration: 'none', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '0.5rem',
                                    borderRadius: '1.5rem',
                                    fontSize: '0.95rem'
                                }}
                            >
                                📞 {lang === 'te' ? 'రైతుకు కాల్ చేయి' : 'Call Farmer'}
                            </a>
                            <a 
                                href={`https://wa.me/${farmer.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary"
                                style={{ 
                                    flex: '1 1 140px', 
                                    minHeight: '46px', 
                                    textDecoration: 'none', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '0.5rem', 
                                    background: '#25D366', 
                                    borderColor: '#25D366', 
                                    color: '#fff',
                                    borderRadius: '1.5rem',
                                    fontSize: '0.95rem'
                                }}
                            >
                                💬 {lang === 'te' ? 'వాట్సాప్ రైతు' : 'WhatsApp Farmer'}
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Statistics Row Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem',
                marginTop: '0.5rem'
            }}>
                <div className="glass" style={{ padding: '1.25rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-darker)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Star fill="#eab308" color="#eab308" size={20} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-light)' }}>
                            {farmer.averageRating > 0 ? farmer.averageRating.toFixed(1) : 'New'} 
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: '0.25rem' }}>
                                ({farmer.numReviews || 0} reviews)
                            </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{lang === 'te' ? 'రైతు రేటింగ్' : 'Farmer Rating'}</div>
                    </div>
                </div>

                <div className="glass" style={{ padding: '1.25rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-darker)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={20} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-light)' }}>
                            {farmer.completedOrdersCount || 0} {lang === 'te' ? 'ఆర్డర్లు' : 'Orders'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{lang === 'te' ? 'పూర్తయిన లావాదేవీలు' : 'Completed Orders'}</div>
                    </div>
                </div>

                <div className="glass" style={{ padding: '1.25rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-darker)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingCart size={20} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-light)' }}>
                            {activeCropsCount} {lang === 'te' ? 'పంటలు' : 'Crops'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{lang === 'te' ? 'ప్రస్తుత పంటలు' : 'Active Listed Crops'}</div>
                    </div>
                </div>

                <div className="glass" style={{ padding: '1.25rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-darker)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={20} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-light)' }}>
                            {formatJoinedDate(farmer.createdAt)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{lang === 'te' ? 'చేరిన తేదీ' : 'Member Since'}</div>
                    </div>
                </div>
            </div>

            {/* Profile Content Layout Split */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr', 
                // Wait: on desktop, grid is 2fr 1fr
                // We handle standard flex/grid responsive styles via container
                gap: '2rem',
                marginTop: '1rem'
            }} className="farmer-profile-split-grid">
                
                {/* Left Area: Active Crops Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h2 style={{ 
                        fontSize: '1.4rem', 
                        fontWeight: '800', 
                        color: 'var(--text-light)', 
                        borderBottom: '1px solid var(--glass-border)', 
                        paddingBottom: '0.5rem', 
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        🌾 {lang === 'te' ? 'లభ్యమయ్యే పంటలు' : 'Available Crops'}
                    </h2>

                    {productsLoading ? (
                        <div style={{ padding: '3rem', textAlign: 'center' }}>
                            <Loader className="animate-spin" size={24} color="var(--primary)" />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '1.25rem', border: '1px dashed var(--glass-border)' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌾</div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '0.5rem' }}>
                                {lang === 'te' ? 'ప్రస్తుతానికి పంటలు అందుబాటులో లేవు' : 'No crops available right now.'}
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                                {lang === 'te' ? 'ఈ రైతు ప్రస్తుతం ఏ పంటలను జాబితా చేయలేదు. త్వరలో మళ్ళీ తనిఖీ చేయండి.' : 'This farmer has no active listed produce at the moment. Please check back later.'}
                            </p>
                        </div>
                    ) : (
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
                            gap: '1.25rem' 
                        }}>
                            {products.map(product => {
                                const emoji = getCropEmoji(product.name);
                                const isAdded = addedProductId === product._id;
                                
                                return (
                                    <div 
                                        key={product._id} 
                                        className="glass hover-glow"
                                        style={{ 
                                            padding: '1.25rem', 
                                            borderRadius: '1.25rem', 
                                            background: 'var(--bg-darkest)',
                                            border: '1px solid var(--glass-border)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.75rem',
                                            position: 'relative'
                                        }}
                                    >
                                        {/* Crop Thumbnail Box */}
                                        <div style={{ 
                                            height: '130px', 
                                            background: 'var(--bg-darker)', 
                                            borderRadius: '0.75rem', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            fontSize: '4rem' 
                                        }}>
                                            {emoji}
                                        </div>

                                        {/* Crop Info */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h3 style={{ 
                                                    fontSize: '1.05rem', 
                                                    fontWeight: 'bold', 
                                                    color: 'var(--text-light)', 
                                                    margin: 0,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    maxWidth: '75%'
                                                }}>
                                                    {product.name}
                                                </h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', color: '#eab308', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                                    <Star size={12} fill="#eab308" stroke="#eab308" />
                                                    <span>{product.averageRating > 0 ? product.averageRating.toFixed(1) : (lang === 'te' ? 'కొత్తది' : 'New')}</span>
                                                </div>
                                            </div>

                                            {product.distance !== undefined && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                    <MapPin size={12} /> <span>{product.distance.toFixed(1)} {lang === 'te' ? 'కి.మీ దూరం' : 'KM away'}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Price & Action Row */}
                                        <div style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            paddingTop: '0.5rem', 
                                            borderTop: '1px solid var(--glass-border)', 
                                            marginTop: 'auto' 
                                        }}>
                                            <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-light)' }}>
                                                ₹{product.price} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/kg</span>
                                            </div>

                                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                {/* View Details Button */}
                                                <button
                                                    onClick={() => setSelectedProduct(product)}
                                                    className="btn btn-secondary"
                                                    style={{ 
                                                        padding: '0.4rem 0.6rem', 
                                                        borderRadius: '50%', 
                                                        minHeight: '36px',
                                                        minWidth: '36px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: '1px solid var(--border)'
                                                    }}
                                                    title={lang === 'te' ? 'వివరాలు చూడండి' : 'View Details'}
                                                >
                                                    <Eye size={14} />
                                                </button>

                                                {/* Add to Cart Button */}
                                                <button 
                                                    className={`btn ${isAdded ? 'btn-secondary' : 'btn-primary'}`} 
                                                    style={{ 
                                                        padding: '0.4rem 0.8rem', 
                                                        borderRadius: '1.5rem', 
                                                        fontSize: '0.8rem', 
                                                        textTransform: 'none', 
                                                        minHeight: '36px',
                                                        fontWeight: '600'
                                                    }}
                                                    onClick={(e) => handleAddToCart(product, e)}
                                                    disabled={user?.role === 'farmer' || product.quantity <= 0}
                                                >
                                                    {isAdded ? (lang === 'te' ? 'చేర్చబడింది' : 'Added') : (lang === 'te' ? 'కార్ట్' : '🛒 Add')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Area: Reviews & About Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* About section */}
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1.25rem', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)' }}>
                        <h3 style={{ 
                            fontSize: '1.2rem', 
                            fontWeight: '800', 
                            color: 'var(--text-light)', 
                            borderBottom: '1px solid var(--glass-border)', 
                            paddingBottom: '0.5rem', 
                            margin: '0 0 1rem 0' 
                        }}>
                            ℹ️ {lang === 'te' ? 'రైతు గురించి' : 'About the Farmer'}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            <p style={{ margin: 0, lineHeight: '1.5' }}>
                                {lang === 'te' 
                                    ? `స్వాగతం! నేను ${farmer.name}. స్థానిక వినియోగదారులకు నేరుగా తాజా మరియు సహజమైన నాణ్యమైన పంటలను సరఫరా చేయడమే మా లక్ష్యం. మా పొలంలో ప్రతి పంటను ప్రేమ మరియు బాధ్యతతో పండిస్తాము.`
                                    : `Welcome! I am ${farmer.name}. Our mission is to supply fresh, high-quality, and clean agricultural produce directly to local consumers. Everything on our farm is grown with love, dedication, and care.`
                                }
                            </p>

                            {/* Future Fields Structure Ready for Extensions */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    <strong>{lang === 'te' ? 'వ్యవసాయ ప్రాంతం:' : 'Farm Location:'}</strong> {farmer.address?.city || 'Local Area'}, {farmer.address?.state || 'India'}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    <strong>{lang === 'te' ? 'వ్యవస్థాపకుడు:' : 'Member Since:'}</strong> {formatJoinedDate(farmer.createdAt)}
                                </div>
                                {/* Ready for Farm Description, Specialization, and Organic Certification in future enhancements */}
                            </div>
                        </div>
                    </div>

                    {/* Customer reviews section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h2 style={{ 
                            fontSize: '1.2rem', 
                            fontWeight: '800', 
                            color: 'var(--text-light)', 
                            borderBottom: '1px solid var(--glass-border)', 
                            paddingBottom: '0.5rem', 
                            margin: 0
                        }}>
                            ⭐ {lang === 'te' ? 'కస్టమర్ సమీక్షలు' : 'Recent Reviews'} ({reviews.length})
                        </h2>

                        {reviewsLoading ? (
                            <div style={{ padding: '2rem', textAlign: 'center' }}>
                                <Loader className="animate-spin" size={20} color="var(--primary)" />
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="glass" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', borderRadius: '1.25rem', border: '1px dashed var(--glass-border)' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⭐</div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                                    {lang === 'te' ? 'ఇంకా సమీక్షలు లేవు. పూర్తయిన ఆర్డర్ల తర్వాత ఇక్కడ సమీక్షలు కనిపిస్తాయి.' : 'No customer reviews yet.'}
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {reviews.map(r => (
                                    <div 
                                        key={r._id} 
                                        className="glass" 
                                        style={{ 
                                            padding: '1rem', 
                                            borderRadius: '1rem', 
                                            background: 'var(--bg-darker)',
                                            border: '1px solid var(--glass-border)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.4rem'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-light)' }}>
                                                {r.user?.name || 'Verified Consumer'}
                                            </span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                {new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                            {/* Stars */}
                                            <div style={{ display: 'flex', gap: '0.05rem', color: '#eab308' }}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star 
                                                        key={star} 
                                                        size={12} 
                                                        fill={star <= r.rating ? '#eab308' : 'none'} 
                                                        stroke={star <= r.rating ? '#eab308' : 'var(--text-muted)'} 
                                                    />
                                                ))}
                                            </div>

                                            {/* Purchased product label */}
                                            {r.product && (
                                                <span style={{ 
                                                    fontSize: '0.75rem', 
                                                    color: 'var(--primary)', 
                                                    background: 'var(--primary-glow)',
                                                    padding: '0.1rem 0.4rem',
                                                    borderRadius: '0.25rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {lang === 'te' ? 'కొనుగోలు చేసారు:' : 'Purchased:'} {r.product.name}
                                                </span>
                                            )}
                                        </div>

                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: '0.2rem 0 0 0', lineHeight: '1.4' }}>
                                            {r.comment}
                                        </p>

                                        {/* Review Images */}
                                        {r.images && r.images.length > 0 && (
                                            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                                                {r.images.map((img, idx) => (
                                                    <img 
                                                        key={idx}
                                                        src={img} 
                                                        alt="Review attachment" 
                                                        style={{ 
                                                            width: '45px', 
                                                            height: '45px', 
                                                            objectFit: 'cover', 
                                                            borderRadius: '0.25rem',
                                                            border: '1px solid var(--border)'
                                                        }} 
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Details Modal Integration */}
            {selectedProduct && (
                <ProductDetailsModal 
                    product={selectedProduct} 
                    onClose={() => setSelectedProduct(null)} 
                />
            )}
        </div>
    );
};

export default FarmerProfile;
