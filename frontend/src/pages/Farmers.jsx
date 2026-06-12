import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Star, Package, ShoppingCart, Loader, MessageSquare, Send, CheckCircle, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Farmers = () => {
    const { user } = useAuth();
    const { addToCart } = useCart();
    
    const [farmers, setFarmers] = useState([]);
    const [selectedFarmer, setSelectedFarmer] = useState(null);
    const [farmerProducts, setFarmerProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [addedProductId, setAddedProductId] = useState(null);

    // Search and Filter
    const [searchCity, setSearchCity] = useState('');
    const [searchPincode, setSearchPincode] = useState('');

    // Farmer Review Form States
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

    const selectFarmer = async (farmer) => {
        setSelectedFarmer(farmer);
        setFarmerProducts([]);
        setFarmerReviews([]);
        setReviewError('');
        setReviewSuccess('');
        setComment('');
        
        // Fetch farmer's products
        setProductsLoading(true);
        try {
            const prodRes = await axios.get(`/api/consumer/products?farmerId=${farmer._id}`);
            setFarmerProducts(prodRes.data || []);
        } catch (err) {
            console.error('Error fetching products for farmer:', err);
        } finally {
            setProductsLoading(false);
        }

        // Fetch farmer reviews
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
            
            // Re-calc rating dynamically in local view
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
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    🚜 Our Registered Farmers
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>
                    Connect directly with local agricultural producers, explore their current crop catalogs, and purchase fresh produce directly.
                </p>
            </div>

            {/* Filter controls */}
            <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Search size={14} /> Filter by Location:</span>
                <input 
                    type="text" 
                    placeholder="City..." 
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.85rem', width: '150px' }}
                />
                <input 
                    type="text" 
                    placeholder="Pincode..." 
                    value={searchPincode}
                    onChange={(e) => setSearchPincode(e.target.value)}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.85rem', width: '120px' }}
                />
                {(searchCity || searchPincode) && (
                    <button 
                        onClick={() => { setSearchCity(''); setSearchPincode(''); }}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {loading ? (
                <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                    <Loader className="animate-spin" size={32} color="var(--primary)" />
                    <span style={{ color: 'var(--text-muted)' }}>Loading farmers list...</span>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', md: '1fr 1.5fr', gap: '2rem' }} className="farmers-main-grid">
                    {/* Left: Farmers List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h2 style={{ fontSize: '1.2rem', color: 'white', margin: '0 0 0.5rem', fontWeight: '700' }}>Directory ({farmers.length})</h2>
                        {farmers.length === 0 ? (
                            <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1rem' }}>
                                <p style={{ color: 'var(--text-muted)', margin: 0 }}>No farmers match your filter options.</p>
                            </div>
                        ) : (
                            farmers.map(f => (
                                <motion.div
                                    key={f._id}
                                    whileHover={{ x: 4 }}
                                    onClick={() => selectFarmer(f)}
                                    className="glass"
                                    style={{ 
                                        padding: '1.25rem', 
                                        borderRadius: '1rem', 
                                        cursor: 'pointer', 
                                        display: 'flex', 
                                        gap: '1rem', 
                                        alignItems: 'center',
                                        borderLeft: selectedFarmer?._id === f._id ? '4px solid var(--primary)' : '1px solid var(--glass-border)',
                                        background: selectedFarmer?._id === f._id ? 'rgba(0,255,157,0.06)' : 'var(--glass-bg)'
                                    }}
                                >
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,255,157,0.1)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold' }}>
                                        {f.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white', margin: '0 0 0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            {f.name}
                                            {f.isVerified && <span style={{ color: 'var(--primary)', fontSize: '0.75rem' }} title="Verified Profile">🛡️</span>}
                                        </h3>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <MapPin size={10} /> <span>{f.address?.city || 'Local Area'}, {f.address?.state || 'India'}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.1rem', color: '#eab308', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                            <Star size={10} fill="#eab308" color="#eab308" />
                                            <span>{f.rating > 0 ? f.rating.toFixed(1) : 'New'}</span>
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{f.productsCount} Crops</div>
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
                                    <div className="glass" style={{ padding: '2rem', borderRadius: '1.25rem', background: 'rgba(0,0,0,0.1)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                            <div>
                                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.25rem' }}>
                                                    {selectedFarmer.name}
                                                    {selectedFarmer.isVerified && <span style={{ color: 'var(--primary)', fontSize: '1rem' }} title="Verified Profile">🛡️ Verified Farmer</span>}
                                                </h2>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <MapPin size={14} /> <span>{selectedFarmer.address?.street}, {selectedFarmer.address?.city}, {selectedFarmer.address?.state} - {selectedFarmer.address?.zip}</span>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#eab308', fontSize: '1.1rem', fontWeight: 'bold', justifyContent: 'flex-end' }}>
                                                    <Star size={16} fill="#eab308" color="#eab308" />
                                                    <span>{selectedFarmer.rating > 0 ? selectedFarmer.rating.toFixed(1) : 'New'}</span>
                                                </div>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({selectedFarmer.reviewsCount} reviews)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Products Grid */}
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Package size={18} color="var(--primary)" /> Listed Crops ({farmerProducts.length})
                                        </h3>

                                        {productsLoading ? (
                                            <div style={{ padding: '2rem', textAlign: 'center' }}>
                                                <Loader className="animate-spin" size={20} color="var(--primary)" />
                                            </div>
                                        ) : farmerProducts.length === 0 ? (
                                            <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1rem' }}>
                                                <p style={{ color: 'var(--text-muted)', margin: 0 }}>This farmer has no active crop listings at the moment.</p>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                                {farmerProducts.map(p => (
                                                    <div 
                                                        key={p._id} 
                                                        className="glass"
                                                        style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                                                    >
                                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'white', margin: 0 }}>{p.name}</h4>
                                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '32px' }}>{p.description}</p>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <div>
                                                                <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white' }}>₹{p.price}</span>
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

                                    {/* Farmer Review System (Phase 5) */}
                                    <div style={{ marginTop: '1rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <MessageSquare size={18} color="var(--primary)" /> Farmer Reviews
                                        </h3>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', lg: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
                                            {/* List of Farmer Reviews */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {reviewsLoading ? (
                                                    <div style={{ padding: '1.5rem', textAlign: 'center' }}><Loader className="animate-spin" size={16} /></div>
                                                ) : farmerReviews.length === 0 ? (
                                                    <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderRadius: '1rem' }}>
                                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>No reviews submitted for this farmer yet.</p>
                                                    </div>
                                                ) : (
                                                    farmerReviews.map(r => (
                                                        <div key={r._id} className="glass" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>{r.user?.name || 'Anonymous Consumer'}</span>
                                                                <div style={{ display: 'flex', gap: '1px' }}>
                                                                    {[1,2,3,4,5].map(star => (
                                                                        <Star key={star} size={10} fill={star <= r.rating ? '#eab308' : 'transparent'} color={star <= r.rating ? '#eab308' : 'rgba(255,255,255,0.2)'} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>"{r.comment}"</p>
                                                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                {r.verifiedPurchase && <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✓ Verified Buyer</span>}
                                                                <span>•</span>
                                                                <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            {/* Submit Farmer Review */}
                                            {user && user.role === 'consumer' ? (
                                                <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Review Farmer {selectedFarmer.name}</h4>
                                                    
                                                    {reviewError && <div style={{ color: 'var(--error)', fontSize: '0.8rem' }}>{reviewError}</div>}
                                                    {reviewSuccess && <div style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 'bold' }}>{reviewSuccess}</div>}

                                                    <form onSubmit={handleFarmerReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                        <div>
                                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Rating</label>
                                                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                                {[1,2,3,4,5].map(star => (
                                                                    <button
                                                                        key={star} type="button" onClick={() => setRating(star)}
                                                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                                                                    >
                                                                        <Star size={18} fill={star <= rating ? '#eab308' : 'transparent'} color={star <= rating ? '#eab308' : 'rgba(255,255,255,0.2)'} />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Review Message</label>
                                                            <textarea
                                                                rows={3} required value={comment} onChange={(e) => setComment(e.target.value)}
                                                                placeholder="Write farmer feedback..."
                                                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.02)', color: 'white', outline: 'none', fontSize: '0.8rem', resize: 'none' }}
                                                            />
                                                        </div>
                                                        <button 
                                                            type="submit" disabled={submittingReview} className="btn btn-primary"
                                                            style={{ width: '100%', padding: '0.5rem 0', borderRadius: '1.5rem', fontSize: '0.8rem', textTransform: 'none', minHeight: '32px' }}
                                                        >
                                                            {submittingReview ? 'Submitting...' : <><Send size={12} /> Submit Review</>}
                                                        </button>
                                                    </form>
                                                </div>
                                            ) : (
                                                <div className="glass" style={{ padding: '1.25rem', borderRadius: '1rem', opacity: 0.8, fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                                    🔒 Log in as a Consumer to write a farmer review.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="glass" style={{ padding: '5rem 2rem', textAlign: 'center', borderRadius: '1.25rem', border: '1px dashed rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(0,255,157,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><User size={28} /></div>
                                    <h2 style={{ fontSize: '1.25rem', color: 'white', margin: 0 }}>No Farmer Selected</h2>
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
