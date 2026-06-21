import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Star, Package, ShoppingCart, Loader, MessageSquare, Send, CheckCircle, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Farmers = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, lang } = useAuth();
    const { addToCart } = useCart();
    
    const [farmers, setFarmers] = useState([]);
    const [selectedFarmer, setSelectedFarmer] = useState(null);
    const [farmerProducts, setFarmerProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [addedProductId, setAddedProductId] = useState(null);

    const [searchCity, setSearchCity] = useState('');
    const [searchPincode, setSearchPincode] = useState('');

    const [farmerReviews, setFarmerReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState('');
    const [reviewSuccess, setReviewSuccess] = useState('');

    const fetchFarmers = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (searchCity) params.city = searchCity.trim();
            if (searchPincode) params.pincode = searchPincode.trim();
            
            const { data } = await axios.get('/api/consumer/farmers', { params });
            setFarmers(data || []);
        } catch (err) {
            console.error('Error fetching farmers:', err);
            setError('Failed to load farmers list.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFarmers();
    }, [searchCity, searchPincode]);

    useEffect(() => {
        const loadSelectedFarmer = async () => {
            if (!id) {
                setSelectedFarmer(null);
                setFarmerProducts([]);
                setFarmerReviews([]);
                return;
            }

            let found = farmers.find(f => f._id === id);
            
            if (!found && farmers.length > 0) {
                try {
                    const { data } = await axios.get('/api/consumer/farmers');
                    found = data.find(f => f._id === id);
                } catch (err) {
                    console.error('Error fetching fallback farmer:', err);
                }
            }

            if (found) {
                selectFarmer(found);
            }
        };

        loadSelectedFarmer();
    }, [id, farmers]);

    const selectFarmer = async (farmer) => {
        setSelectedFarmer(farmer);
        setFarmerProducts([]);
        setFarmerReviews([]);
        setReviewError('');
        setReviewSuccess('');
        setComment('');
        
        setProductsLoading(true);
        try {
            const prodRes = await axios.get(`/api/consumer/products?farmerId=${farmer._id}`);
            setFarmerProducts(prodRes.data || []);
        } catch (err) {
            console.error('Error fetching products for farmer:', err);
        } finally {
            setProductsLoading(false);
        }

        setReviewsLoading(true);
        try {
            const { data } = await axios.get(`/api/reviews/farmer/${farmer._id}`);
            setFarmerReviews(data || []);
        } catch (err) {
            console.error('Error fetching farmer reviews:', err);
        } finally {
            setReviewsLoading(false);
        }
    };

    const handleAddToCart = (product, e) => {
        e.stopPropagation();
        addToCart(product);
        setAddedProductId(product._id);
        setTimeout(() => setAddedProductId(null), 2000);
    };

    const handleFarmerReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Please login as a consumer to review farmers.');
            return;
        }
        setSubmittingReview(true);
        setReviewError('');
        setReviewSuccess('');

        try {
            const { data: newReview } = await axios.post('/api/reviews', {
                farmerId: selectedFarmer._id,
                rating,
                comment,
                reviewType: 'farmer'
            });

            setReviewSuccess('Farmer review submitted successfully!');
            setFarmerReviews(prev => [newReview, ...prev]);
            setComment('');
            
            const newCount = selectedFarmer.reviewsCount + 1;
            const newRating = parseFloat((((selectedFarmer.rating * selectedFarmer.reviewsCount) + rating) / newCount).toFixed(1));
            setSelectedFarmer(prev => ({
                ...prev,
                rating: newRating,
                reviewsCount: newCount
            }));
        } catch (err) {
            console.error('Farmer review submit error:', err);
            setReviewError(err.response?.data?.message || 'Failed to submit farmer review.');
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem', textAlign: 'left' }}>
            {/* Page Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    🚜 {lang === 'te' ? 'మా రిజిస్టర్డ్ రైతులు' : 'Our Registered Farmers'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>
                    {lang === 'te' ? 'స్థానిక వ్యవసాయ ఉత్పత్తిదారులతో నేరుగా కనెక్ట్ అవ్వండి, వారి ప్రస్తుత పంట కేటలాగ్‌లను అన్వేషించండి మరియు తాజా ఉత్పత్తులను నేరుగా కొనుగోలు చేయండి.' : 'Connect directly with local agricultural producers, explore their current crop catalogs, and purchase fresh produce directly.'}
                </p>
            </div>

            {/* Filter controls */}
            <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', alignItems: 'center', border: '1px solid var(--glass-border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Search size={14} /> {lang === 'te' ? 'స్థానం ఆధారంగా వడపోత:' : 'Filter by Location:'}</span>
                <input 
                    type="text" 
                    placeholder={lang === 'te' ? 'నగరం...' : 'City...'}
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    style={{ width: '150px' }}
                />
                <input 
                    type="text" 
                    placeholder={lang === 'te' ? 'పిన్‌కోడ్...' : 'Pincode...'}
                    value={searchPincode}
                    onChange={(e) => setSearchPincode(e.target.value)}
                    style={{ width: '120px' }}
                />
                {(searchCity || searchPincode) && (
                    <button 
                        onClick={() => { setSearchCity(''); setSearchPincode(''); }}
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '0.5rem', minHeight: '32px' }}
                    >
                        {lang === 'te' ? 'ఫిల్టర్‌లను తొలగించు' : 'Clear Filters'}
                    </button>
                )}
            </div>

            {loading ? (
                <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                    <Loader className="animate-spin" size={32} color="var(--primary)" />
                    <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Loading Farmers...</span>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', md: '1fr 1.5fr', gap: '2rem' }} className="farmers-main-grid">
                    {/* Left: Farmers List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-light)', margin: '0 0 0.5rem', fontWeight: '700' }}>{lang === 'te' ? 'రైతుల జాబితా' : 'Directory'} ({farmers.length})</h2>
                        {farmers.length === 0 ? (
                            <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
                                <p style={{ color: 'var(--text-muted)', margin: 0 }}>No farmers match your filter options.</p>
                            </div>
                        ) : (
                            farmers.map(f => (
                                <motion.div
                                    key={f._id}
                                    whileHover={{ x: 4 }}
                                    onClick={() => navigate(`/farmers/${f._id}`)}
                                    className="glass"
                                    style={{ 
                                        padding: '1.25rem', 
                                        borderRadius: '1rem', 
                                        cursor: 'pointer', 
                                        display: 'flex', 
                                        gap: '1rem', 
                                        alignItems: 'center',
                                        borderLeft: selectedFarmer?._id === f._id ? '4px solid var(--primary)' : '1px solid var(--glass-border)',
                                        background: selectedFarmer?._id === f._id ? 'var(--primary-glow)' : 'var(--glass-bg)',
                                        borderTop: '1px solid var(--glass-border)',
                                        borderBottom: '1px solid var(--glass-border)',
                                        borderRight: '1px solid var(--glass-border)'
                                    }}
                                >
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-glow)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold' }}>
                                        {f.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-light)', margin: '0 0 0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            {f.name}
                                            {f.isVerified && <span style={{ color: 'var(--primary)', fontSize: '0.75rem' }} title="Verified Profile">🛡️</span>}
                                        </h3>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <MapPin size={10} /> <span>{f.address?.city || 'Local Area'}, {f.address?.state || 'India'}</span>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold', marginTop: '0.25rem' }}>
                                            {lang === 'te' ? 'ప్రొఫైల్ చూడండి' : 'View Profile'} &rarr;
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.1rem', color: '#eab308', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                            <Star size={10} fill="#eab308" color="#eab308" />
                                            <span>{f.rating > 0 ? f.rating.toFixed(1) : 'New'}</span>
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{f.productsCount} {lang === 'te' ? 'పంటలు' : 'Crops'}</div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Right: Selected Farmer crops & Reviews */}
                    <div>
                        <AnimatePresence mode="wait">
                            {selectedFarmer ? (
                                <motion.div
                                    key={selectedFarmer._id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                                >
                                    {/* Farmer Detail Card */}
                                    <div className="glass" style={{ padding: '2rem', borderRadius: '1.25rem', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                                            <div>
                                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.25rem' }}>
                                                    {selectedFarmer.name}
                                                    {selectedFarmer.isVerified && <span style={{ color: 'var(--primary)', fontSize: '0.9rem', background: 'var(--primary-glow)', padding: '0.2rem 0.6rem', borderRadius: '1rem' }} title="Verified Profile">🛡️ Verified Farmer</span>}
                                                </h2>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <MapPin size={14} /> <span>{selectedFarmer.address?.street}, {selectedFarmer.address?.city}, {selectedFarmer.address?.state} - {selectedFarmer.address?.zip}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Aggregated Farmer Trust Signals Grid */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                            <div className="glass" style={{ padding: '0.75rem', borderRadius: '0.75rem', textAlign: 'center', background: 'var(--bg-darker)', border: '1px solid var(--glass-border)' }}>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#eab308' }}>
                                                    ⭐ {selectedFarmer.averageRating > 0 ? selectedFarmer.averageRating.toFixed(1) : (selectedFarmer.rating > 0 ? selectedFarmer.rating.toFixed(1) : 'New')}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Rating</div>
                                            </div>
                                            <div className="glass" style={{ padding: '0.75rem', borderRadius: '0.75rem', textAlign: 'center', background: 'var(--bg-darker)', border: '1px solid var(--glass-border)' }}>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                                    {selectedFarmer.completedOrdersCount || 0}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Completed Orders</div>
                                            </div>
                                            <div className="glass" style={{ padding: '0.75rem', borderRadius: '0.75rem', textAlign: 'center', background: 'var(--bg-darker)', border: '1px solid var(--glass-border)' }}>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-light)' }}>
                                                    {selectedFarmer.productsCount || 0}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Active Crops</div>
                                            </div>
                                            <div className="glass" style={{ padding: '0.75rem', borderRadius: '0.75rem', textAlign: 'center', background: 'var(--bg-darker)', border: '1px solid var(--glass-border)' }}>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981' }}>
                                                    {selectedFarmer.totalProductsSold || 0} kg
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Total Sold</div>
                                            </div>
                                        </div>
                                        {/* Direct Farmer Call and WhatsApp triggers */}
                                        {selectedFarmer.phone && (
                                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
                                                <a 
                                                    href={`tel:${selectedFarmer.phone}`}
                                                    className="btn btn-secondary"
                                                    style={{ flex: 1, minHeight: '44px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                                                >
                                                    📞 Call Farmer
                                                </a>
                                                <a 
                                                    href={`https://wa.me/${selectedFarmer.phone.replace(/[^0-9]/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-primary"
                                                    style={{ flex: 1, minHeight: '44px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#25D366', borderColor: '#25D366', color: 'var(--white)' }}
                                                >
                                                    💬 WhatsApp
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {/* Products Grid */}
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-light)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Package size={18} color="var(--primary)" /> {lang === 'te' ? 'జాబితా చేయబడిన పంటలు' : 'Listed Crops'} ({farmerProducts.length})
                                        </h3>

                                        {productsLoading ? (
                                            <div style={{ padding: '2rem', textAlign: 'center' }}>
                                                <Loader className="animate-spin" size={20} color="var(--primary)" />
                                            </div>
                                        ) : farmerProducts.length === 0 ? (
                                            <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
                                                <p style={{ color: 'var(--text-muted)', margin: 0 }}>This farmer has no active crop listings at the moment.</p>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                                {farmerProducts.map(p => (
                                                    <div 
                                                        key={p._id} 
                                                        className="glass"
                                                        style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--glass-border)' }}
                                                    >
                                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-light)', margin: 0 }}>{p.name}</h4>
                                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '32px' }}>{p.description}</p>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)' }}>
                                                            <div>
                                                                <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-light)' }}>₹{p.price}</span>
                                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/kg</span>
                                                            </div>
                                                            <button 
                                                                onClick={(e) => handleAddToCart(p, e)}
                                                                className={`btn ${addedProductId === p._id ? 'btn-secondary' : 'btn-primary'}`}
                                                                style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem', borderRadius: '1rem', minHeight: '26px' }}
                                                                disabled={user?.role === 'farmer' || p.quantity <= 0}
                                                            >
                                                                {addedProductId === p._id ? 'Added' : <><ShoppingCart size={10} /> Add</>}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Farmer Review System */}
                                    <div style={{ marginTop: '1rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-light)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <MessageSquare size={18} color="var(--primary)" /> {lang === 'te' ? 'రైతు సమీక్షలు' : 'Recent Customer Reviews'}
                                        </h3>

                                        {/* List of Farmer Reviews */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {reviewsLoading ? (
                                                <div style={{ padding: '1.5rem', textAlign: 'center' }}><Loader className="animate-spin" size={16} /></div>
                                            ) : farmerReviews.length === 0 ? (
                                                <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
                                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>No customer reviews yet.</p>
                                                </div>
                                            ) : (
                                                farmerReviews.map(r => (
                                                    <div key={r._id} className="glass" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--glass-border)' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div>
                                                                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-light)' }}>{r.user?.name || 'Anonymous Consumer'}</span>
                                                                {r.product?.name && (
                                                                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', marginLeft: '0.5rem', background: 'var(--primary-glow)', padding: '0.1rem 0.4rem', borderRadius: '0.25rem' }}>
                                                                        {r.product.name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '1px' }}>
                                                                {[1,2,3,4,5].map(star => (
                                                                    <Star key={star} size={12} fill={star <= r.rating ? '#eab308' : 'transparent'} color={star <= r.rating ? '#eab308' : 'var(--glass-border)'} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0', fontStyle: 'italic' }}>"{r.comment}"</p>
                                                        {r.images && r.images.length > 0 && (
                                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                                                                {r.images.map((img, idx) => (
                                                                    <img 
                                                                        key={idx} 
                                                                        src={img} 
                                                                        alt="Review" 
                                                                        style={{ width: '60px', height: '60px', borderRadius: '0.35rem', objectFit: 'cover', border: '1px solid var(--glass-border)' }} 
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.25rem' }}>
                                                            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✓ Verified Buyer</span>
                                                            <span>•</span>
                                                            <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="glass" style={{ padding: '5rem 2rem', textAlign: 'center', borderRadius: '1.25rem', border: '1px dashed var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-darker)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><User size={28} /></div>
                                    <h2 style={{ fontSize: '1.25rem', color: 'var(--text-light)', margin: 0 }}>No Farmer Selected</h2>
                                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem', maxWidth: '320px' }}>Select a farmer from the directory list on the left to browse their fresh produce catalog and read customer reviews.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Layout styles */}
            <style dangerouslySetInnerHTML={{__html: `
                @media (min-width: 768px) {
                    .farmers-main-grid {
                        grid-template-columns: 1fr 1.5fr !important;
                    }
                }
            `}} />
        </div>
    );
};

export default Farmers;
