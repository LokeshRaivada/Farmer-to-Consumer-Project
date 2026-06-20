import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Award, ArrowUpRight, Loader, Leaf, User, Search, Filter, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Reviews = () => {
    const { lang } = useAuth();
    const navigate = useNavigate();

    // Stats leaderboards state
    const [topFarmers, setTopFarmers] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [leadersLoading, setLeadersLoading] = useState(true);

    // Reviews list & filters state
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [rating, setRating] = useState(''); // Empty string = All Ratings

    const loadLeaders = async () => {
        setLeadersLoading(true);
        try {
            const [farmersRes, productsRes] = await Promise.all([
                axios.get('/api/reviews/top-farmers'),
                axios.get('/api/reviews/top-products')
            ]);
            setTopFarmers(farmersRes.data || []);
            setTopProducts(productsRes.data || []);
        } catch (err) {
            console.error('Error loading leaders:', err);
        } finally {
            setLeadersLoading(false);
        }
    };

    const loadReviews = async () => {
        setReviewsLoading(true);
        try {
            const params = {};
            if (search) params.search = search.trim();
            if (rating) params.rating = rating;

            const { data } = await axios.get('/api/reviews/recent', { params });
            setReviews(data || []);
        } catch (err) {
            console.error('Error loading reviews:', err);
        } finally {
            setReviewsLoading(false);
        }
    };

    useEffect(() => {
        loadLeaders();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadReviews();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, rating]);

    const renderStars = (rating) => {
        const stars = [];
        const floor = Math.floor(rating);
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star 
                    key={i} 
                    size={12} 
                    fill={i <= floor ? '#eab308' : 'transparent'} 
                    color={i <= floor ? '#eab308' : 'var(--glass-border)'} 
                />
            );
        }
        return stars;
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem', paddingBottom: '6rem', textAlign: 'left' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    💬 {lang === 'te' ? 'కమ్యూనిటీ రేటింగ్స్ & సమీక్షలు' : 'Ratings & Reviews Hub'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0, lineHeight: 1.5 }}>
                    {lang === 'te' ? 'వినియోగదారుల నుండి నిజమైన సమీక్షలను బ్రౌజ్ చేయండి మరియు అత్యుత్తమ రేటింగ్ పొందిన రైతులు మరియు పంటలను కనుగొనండి.' : 'Browse real customer feedback derived from completed orders to find trustworthy farmers and high-quality crops.'}
                </p>
            </div>

            {/* Interactive Filters Bar */}
            <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', alignItems: 'center', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
                    <Search size={18} color="var(--text-muted)" />
                    <input 
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={lang === 'te' ? 'రైతు, పంట లేదా సమీక్షను శోధించండి...' : 'Search by farmer, crop, reviewer, comment...'}
                        style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-light)', outline: 'none', fontSize: '0.9rem' }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px' }}>
                    <Filter size={16} color="var(--text-muted)" />
                    <select
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', outline: 'none', fontSize: '0.9rem', cursor: 'pointer', width: '100%' }}
                    >
                        <option value="" style={{ background: 'var(--bg-darker)' }}>⭐ {lang === 'te' ? 'అన్ని రేటింగ్‌లు' : 'All Ratings'}</option>
                        <option value="5" style={{ background: 'var(--bg-darker)' }}>⭐ 5 Stars</option>
                        <option value="4" style={{ background: 'var(--bg-darker)' }}>⭐ 4 Stars & Above</option>
                        <option value="3" style={{ background: 'var(--bg-darker)' }}>⭐ 3 Stars & Above</option>
                        <option value="2" style={{ background: 'var(--bg-darker)' }}>⭐ 2 Stars & Above</option>
                        <option value="1" style={{ background: 'var(--bg-darker)' }}>⭐ 1 Star & Above</option>
                    </select>
                </div>
                {(search || rating) && (
                    <button 
                        onClick={() => { setSearch(''); setRating(''); }}
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '0.5rem', minHeight: '32px' }}
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Layout Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', lg: '1.8fr 1.2fr', gap: '2rem' }} className="reviews-layout-grid">
                
                {/* Left Side: Dynamic Reviews Feed */}
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-light)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MessageSquare size={18} color="var(--primary)" /> {lang === 'te' ? 'కస్టమర్ అభిప్రాయం' : 'Customer Feedback Feed'}
                    </h2>

                    {reviewsLoading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', flexDirection: 'column', gap: '1rem' }}>
                            <Loader className="animate-spin" size={24} color="var(--primary)" />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Filtering reviews...</span>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '1rem', border: '1px dashed var(--glass-border)' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                                {search || rating 
                                    ? "No reviews match your filters."
                                    : "No customer reviews yet. Be the first customer to review this product."}
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {reviews.map(r => (
                                <motion.div 
                                    key={r._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass"
                                    style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', border: '1px solid var(--glass-border)' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <User size={14} color="var(--text-muted)" /> {r.user?.name || 'Verified Customer'}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                                                <span>Bought</span>
                                                <span style={{ color: 'var(--primary)', fontWeight: 'bold', background: 'rgba(22, 163, 74, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '0.25rem' }}>
                                                    {r.product?.name || 'Crop Listing'}
                                                </span>
                                                <span>from</span>
                                                <span 
                                                    onClick={() => r.farmer?._id && navigate(`/farmers/${r.farmer._id}`)}
                                                    style={{ color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                                                >
                                                    {r.farmer?.name || 'Verified Farmer'}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '2px', background: 'rgba(234, 179, 8, 0.05)', padding: '0.2rem 0.5rem', borderRadius: '0.5rem', border: '1px solid rgba(234, 179, 8, 0.1)' }}>
                                            {renderStars(r.rating)}
                                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#eab308', marginLeft: '0.25rem' }}>{r.rating.toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', margin: '0.25rem 0', fontStyle: 'italic', lineHeight: '1.4' }}>
                                        "{r.comment}"
                                    </p>
                                    
                                    {/* Uploaded Crop Photos */}
                                    {r.images && r.images.length > 0 && (
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                                            {r.images.map((img, idx) => (
                                                <img 
                                                    key={idx} 
                                                    src={img} 
                                                    alt="Review photo" 
                                                    style={{ width: '80px', height: '80px', borderRadius: '0.5rem', objectFit: 'cover', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                                                    onClick={() => window.open(img, '_blank')}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                            <CheckCircle2 size={10} /> Verified Purchase
                                        </span>
                                        <span>•</span>
                                        <span>{new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side: Leaderboard Sidebars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Leaderboard: Top Rated Farmers */}
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-light)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Award size={18} color="var(--primary)" /> {lang === 'te' ? 'టాప్ రేటెడ్ రైతులు' : 'Top Farmers'}
                        </h2>
                        {leadersLoading ? (
                            <div style={{ padding: '1.5rem', textAlign: 'center' }}><Loader className="animate-spin" size={16} /></div>
                        ) : topFarmers.length === 0 ? (
                            <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderRadius: '1rem' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>No farmers ranked yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {topFarmers.map(f => (
                                    <div 
                                        key={f._id}
                                        onClick={() => navigate(`/farmers/${f._id}`)}
                                        className="glass"
                                        style={{ padding: '1rem', borderRadius: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', border: '1px solid var(--glass-border)', cursor: 'pointer', transition: 'transform 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(22, 163, 74, 0.08)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold' }}>
                                            {f.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-light)', margin: 0 }}>
                                                    {f.name} {f.isVerified && '🛡️'}
                                                </h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', color: '#eab308', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                    <Star size={10} fill="#eab308" color="#eab308" />
                                                    <span>{(f.averageRating || f.rating || 0).toFixed(1)}</span>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                                                📍 {f.address?.city || 'Local Area'} • {f.completedOrdersCount || 0} Orders Completed
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Leaderboard: Top Rated Products */}
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-light)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Leaf size={18} color="var(--primary)" /> {lang === 'te' ? 'టాప్ రేటెడ్ పంటలు' : 'Top Rated Crops'}
                        </h2>
                        {leadersLoading ? (
                            <div style={{ padding: '1.5rem', textAlign: 'center' }}><Loader className="animate-spin" size={16} /></div>
                        ) : topProducts.length === 0 ? (
                            <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderRadius: '1rem' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>No rated products yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {topProducts.map(p => (
                                    <div 
                                        key={p._id}
                                        className="glass"
                                        style={{ padding: '1rem', borderRadius: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', border: '1px solid var(--glass-border)' }}
                                    >
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-darker)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                            <Leaf size={20} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-light)', margin: 0 }}>{p.name}</h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', color: '#eab308', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                    <Star size={10} fill="#eab308" color="#eab308" />
                                                    <span>{p.averageRating.toFixed(1)}</span>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem', display: 'flex', justifyContent: 'space-between' }}>
                                                <span>By {p.farmer?.name || 'Verified Farmer'}</span>
                                                <span>₹{p.price}/kg</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

            </div>

            {/* Custom Responsive Styles */}
            <style dangerouslySetInnerHTML={{__html: `
                @media (min-width: 992px) {
                    .reviews-layout-grid {
                        grid-template-columns: 1.8fr 1.2fr !important;
                    }
                }
            `}} />
        </div>
    );
};

export default Reviews;
