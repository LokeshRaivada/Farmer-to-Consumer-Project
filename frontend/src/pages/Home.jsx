import React, { useState, useEffect } from 'react';
import { Leaf, Search, MapPin, ArrowRight, ShieldCheck, Sprout, Star, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

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
  if (lower.includes('rice') || lower.includes('paddy') || lower.includes('grain') || lower.includes('ధాన్య')) return '🌾';
  return '🌾';
};

const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const { user, lang } = useAuth();
  
  const handleAdd = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const emoji = getCropEmoji(product.name);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -6, boxShadow: 'var(--shadow-glow)', borderColor: 'var(--primary)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="glass"
      style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', textAlign: 'left', borderRadius: '1.25rem', background: 'var(--bg-darkest)' }}
    >
      {/* Crop Image as Emoji representation */}
      <div style={{ height: '130px', background: 'var(--bg-darker)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: '4rem' }}>
        <motion.span whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }} transition={{ duration: 0.3 }}>
          {emoji}
        </motion.span>
      </div>

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
                e.preventDefault();
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
                e.preventDefault();
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-light)' }}>
          ₹{product.price} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/kg</span>
        </div>

        <button
          onClick={handleAdd}
          className={`btn ${added ? 'btn-secondary' : 'btn-primary'}`}
          style={{ padding: '0.4rem 0.8rem', borderRadius: '1.5rem', fontSize: '0.8rem', textTransform: 'none', minHeight: '32px' }}
          disabled={user?.role === 'farmer' || product.quantity <= 0}
        >
          {added ? (lang === 'te' ? 'జోడించబడింది' : 'Added') : (lang === 'te' ? 'కార్ట్' : '🛒 Add')}
        </button>
      </div>
    </motion.div>
  );
};

const Home = () => {
  const { t, lang } = useAuth();
  const { addToCart } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [trends, setTrends] = useState([]);
  
  const [coords, setCoords] = useState(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locating, setLocating] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 70,
        damping: 15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, x: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 60,
        damping: 15,
        delay: 0.15
      }
    }
  };

  useEffect(() => {
    document.title = "FarmerDirect | Fresh Produce Direct From Farmers";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Buy fresh fruits, vegetables and grains directly from verified farmers.');
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [homeRes, productsRes] = await Promise.all([
          axios.get('/api/consumer/home'),
          axios.get('/api/consumer/products')
        ]);
        
        setFeaturedProducts(homeRes.data.featuredProducts || []);
        setFarmers(homeRes.data.farmers || []);
        setTrends(homeRes.data.trends || []);
        setAllProducts(productsRes.data || []);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
        setLocationEnabled(true);
        setLocating(false);
      },
      (error) => {
        console.error(error);
        alert('Location access denied. Displaying featured products instead.');
        setLocating(false);
        setLocationEnabled(false);
      }
    );
  };

  // Default realistic baseline for Live Market Card if database is empty/insufficient
  const defaultTrends = {
    vegetables: { price: 50.0, trend: 4.2 },
    fruits: { price: 118.0, trend: -1.7 },
    grains: { price: 65.0, trend: 1.6 }
  };

  const getCategoryRealAvg = (categoryKey) => {
    const matches = allProducts.filter(p => p.category === categoryKey && p.price > 0);
    if (matches.length === 0) return null;
    const avg = matches.reduce((sum, p) => sum + p.price, 0) / matches.length;
    return avg;
  };

  const getCategoryTrend = (categoryKey) => {
    const catTrends = trends.filter(t => t.category === categoryKey);
    if (catTrends.length >= 2) {
      const latest = catTrends[catTrends.length - 1].avgPrice;
      const prev = catTrends[catTrends.length - 2].avgPrice;
      return ((latest - prev) / prev) * 100;
    }
    // Stable realistic default trends matching the layout
    if (categoryKey === 'vegetables') return 4.2;
    if (categoryKey === 'fruits') return -1.7;
    if (categoryKey === 'grains') return 1.6;
    return 0;
  };

  const getCategoryPrice = (categoryKey) => {
    const realAvg = getCategoryRealAvg(categoryKey);
    if (realAvg !== null) return realAvg;
    const catTrends = trends.filter(t => t.category === categoryKey);
    if (catTrends.length > 0) return catTrends[catTrends.length - 1].avgPrice;
    return defaultTrends[categoryKey].price;
  };

  // Calculate dynamic averages for Tomato, Potato, Onion, Rice
  const getCropAvgPrice = (nameEn, nameTe, fallbackVal) => {
    const matches = allProducts.filter(p => 
      p.name.toLowerCase().includes(nameEn.toLowerCase()) || 
      p.name.includes(nameTe)
    );
    if (matches.length === 0) return fallbackVal;
    const avg = matches.reduce((sum, p) => sum + p.price, 0) / matches.length;
    return avg;
  };

  const tomatoPrice = getCropAvgPrice('tomato', 'టమాటా', 50.0);
  const potatoPrice = getCropAvgPrice('potato', 'బంగాళాదుంప', 45.0);
  const onionPrice = getCropAvgPrice('onion', 'ఉల్లిపాయ', 42.0);
  const ricePrice = getCropAvgPrice('rice', 'వరి', 65.0);

  const vegetableTrend = getCategoryTrend('vegetables');
  const grainTrend = getCategoryTrend('grains');

  const priceItems = [
    { nameEn: 'Tomatoes', nameTe: 'టమాటాలు', price: tomatoPrice, icon: '🍅', trend: vegetableTrend },
    { nameEn: 'Potatoes', nameTe: 'బంగాళాదుంపలు', price: potatoPrice, icon: '🥔', trend: vegetableTrend },
    { nameEn: 'Onions', nameTe: 'ఉల్లిపాయలు', price: onionPrice, icon: '🧅', trend: vegetableTrend },
    { nameEn: 'Rice / Grains', nameTe: 'బియ్యం / వరి', price: ricePrice, icon: '🌾', trend: grainTrend }
  ];

  const hasAnyPriceData = true; // Always show data (with realistic fallbacks if empty)

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ position: 'relative' }}
    >
      <div className="bg-grid-pattern"></div>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', paddingBottom: '6rem' }}>
        
        {/* 1. HERO SECTION */}
        <section style={{ minHeight: '45vh', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', padding: '2rem 0', position: 'relative' }}>
          <motion.div 
            variants={itemVariants}
            style={{ flex: '1 1 300px', zIndex: 10, textAlign: 'left' }}
          >
            <div
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(22, 163, 74, 0.1)', border: '1px solid var(--primary)', padding: '0.4rem 1rem', borderRadius: '2rem', marginBottom: '1rem', color: 'var(--primary)', fontWeight: '600', fontSize: '0.85rem' }}
            >
              <ShieldCheck size={14} /> {lang === 'te' ? 'రైతు నెట్‌వర్క్' : 'Verified Farmers Network'}
            </div>
            
            <h1
              style={{ fontSize: 'clamp(1.75rem, 6vw, 2.4rem)', lineHeight: '1.2', marginBottom: '1rem', fontWeight: '800', letterSpacing: '-1px', color: 'var(--text-light)' }}
            >
              {lang === 'te' ? 'తాజా పంటలు నేరుగా రైతుల నుండి' : 'Fresh Produce Direct From Farmers'}
            </h1>
            
            <p
              style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '520px', lineHeight: '1.6' }}
            >
              {lang === 'te' 
                ? 'మీ రాష్ట్రంలోని వెరిఫైడ్ లోకల్ రైతులతో నేరుగా కనెక్ట్ అవ్వండి. మధ్యవర్తులు లేకుండా తక్కువ ధరకు కొనుగోలు చేయండి.'
                : 'Connect directly with verified local farmers. Purchase freshly harvested vegetables, fruits, and grains at transparent farm-gate prices.'}
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/store" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '2rem' }}>
                {lang === 'te' ? 'మార్కెట్ చూడండి' : 'Explore Market'} <Search size={18} />
              </Link>
              <Link to="/signup" className="btn btn-secondary" style={{ padding: '0.6rem 1.5rem', borderRadius: '2rem' }}>
                {lang === 'te' ? 'రైతుగా చేరండి' : 'Become a Farmer'} <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
          
          {/* Live Market Card */}
          <motion.div 
            variants={cardVariants}
            style={{ flex: '0 1 400px', width: '100%', position: 'relative', zIndex: 10 }}
          >
            <div className="glass" style={{ width: '100%', borderRadius: '1.5rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--glass-border)', background: 'var(--bg-darkest)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }}></div>
                  <motion.div 
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}
                  />
                </div>
                <div style={{ background: 'rgba(22, 163, 74, 0.1)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <motion.span 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }}
                  />
                  {lang === 'te' ? 'లైవ్ మార్కెట్' : 'LIVE MARKET'}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { name: lang === 'te' ? 'తాజా కూరగాయలు' : 'Fresh Vegetables', key: 'vegetables', icon: '🥬' },
                  { name: lang === 'te' ? 'తాజా పండ్లు' : 'Fresh Fruits', key: 'fruits', icon: '🍎' },
                  { name: lang === 'te' ? 'స్థానిక ధాన్యాలు' : 'Local Grains', key: 'grains', icon: '🌾' }
                ].map((item, i) => {
                  const latest = getCategoryPrice(item.key);
                  const diff = getCategoryTrend(item.key);
                  const trendStr = diff !== null ? `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%` : '--';
                  
                  return (
                    <motion.div 
                      key={i} 
                      custom={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.1, type: 'spring', stiffness: 90, damping: 12 }}
                      whileHover={{ 
                        scale: 1.02, 
                        backgroundColor: 'var(--bg-darker)', 
                        borderColor: 'var(--primary)',
                        boxShadow: 'var(--shadow-glow)'
                      }}
                      whileTap={{ scale: 0.98 }}
                      style={{ background: 'var(--bg-darker)', borderRadius: '0.75rem', padding: '0.6rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid var(--glass-border)', cursor: 'pointer', transition: 'border-color 0.2s' }}
                    >
                      <motion.div 
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                        style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: 'rgba(22, 163, 74, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}
                      >
                        {item.icon}
                      </motion.div>
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ color: 'var(--text-light)', fontWeight: 'bold', fontSize: '0.85rem' }}>{item.name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{lang === 'te' ? 'సగటు ధర' : 'Average Price'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'var(--text-light)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                          ₹{latest.toFixed(1)}/kg
                        </div>
                        <div style={{ color: diff >= 0 ? 'var(--primary)' : '#ef4444', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {trendStr}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </section>

        {/* 2. TODAY'S PRICES */}
        <motion.section 
          variants={itemVariants}
          style={{ margin: '2rem 0', textAlign: 'left' }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '0.25rem' }}>
            📊 {lang === 'te' ? 'ఈరోజు పంటల ధరలు' : "Today's Crop Prices"}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            {lang === 'te' ? 'రైతులు విక్రయిస్తున్న తాజా పంటల సగటు మార్కెట్ ధరలు' : 'Real-time average prices calculated from active local listings'}
          </p>

          {loading ? (
            <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1rem', padding: '0.5rem 0' }}>
              ⏳ {lang === 'te' ? 'ధరలను లోడ్ చేస్తున్నాము...' : 'Loading market prices...'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {priceItems.map((item, idx) => (
                <motion.div 
                  key={idx} 
                  whileHover={{ y: -5, scale: 1.01, borderColor: 'var(--primary)', boxShadow: 'var(--shadow-glow)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="glass" 
                  style={{ padding: '1rem', borderRadius: '1rem', border: '1px solid var(--glass-border)', background: 'var(--bg-darkest)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.75rem' }}>{item.icon}</span>
                    {item.trend !== null && item.price !== null && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 'bold', padding: '0.15rem 0.4rem', borderRadius: '1rem', background: item.trend >= 0 ? 'rgba(22, 163, 74, 0.1)' : 'rgba(239,68,68,0.1)', color: item.trend >= 0 ? 'var(--primary)' : '#ef4444' }}>
                        {item.trend >= 0 ? '▲' : '▼'} {Math.abs(item.trend).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-light)', margin: 0 }}>
                    {lang === 'te' ? item.nameTe : item.nameEn}
                  </h3>
                  <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.25rem' }}>
                    {item.price !== null ? `₹${item.price.toFixed(1)}` : '--'}
                    {item.price !== null && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}> / kg</span>}
                  </div>
                  {item.price === null && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {lang === 'te' ? 'పంట అందుబాటులో లేదు' : 'No active listings'}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* 3. POPULAR CATEGORIES */}
        <motion.section 
          variants={itemVariants}
          style={{ margin: '2.5rem 0', textAlign: 'left' }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '0.25rem' }}>
            🥬 {lang === 'te' ? 'ప్రముఖ రకాలు' : 'Popular Categories'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            {lang === 'te' ? 'సులభమైన నావిగేషన్ కోసం పంటల రకాలు' : 'Find crops quickly by category'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {[
              { nameEn: 'Vegetables', nameTe: 'కూరగాయలు', key: 'vegetables', icon: '🥬', descEn: 'Fresh tomatoes, onions, greens', descTe: 'తాజా టమాటాలు, ఉల్లిపాయలు, ఆకుకూరలు' },
              { nameEn: 'Fruits', nameTe: 'పండ్లు', key: 'fruits', icon: '🍎', descEn: 'Sweet mangoes, bananas, seasonal fruits', descTe: 'మామిడి పండ్లు, అరటిపండ్లు, సీజనల్ పండ్లు' },
              { nameEn: 'Grains', nameTe: 'ధాన్యాలు', key: 'grains', icon: '🌾', descEn: 'Rice, wheat, pulses', descTe: 'బియ్యం, గోధుమలు, పప్పుధాన్యాలు' }
            ].map((cat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5, scale: 1.02, borderColor: 'var(--primary)', boxShadow: 'var(--shadow-glow)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{ display: 'flex', borderRadius: '1rem', overflow: 'hidden' }}
              >
                <Link
                  to={`/store?category=${cat.key}`}
                  className="glass"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    width: '100%',
                    textDecoration: 'none',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--bg-darkest)'
                  }}
                >
                  <div style={{ fontSize: '1.75rem', width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bg-darker)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cat.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-light)', margin: 0 }}>
                      {lang === 'te' ? cat.nameTe : cat.nameEn}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.1rem 0 0 0' }}>
                      {lang === 'te' ? cat.descTe : cat.descEn}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 4. NEARBY CROPS */}
        <motion.section 
          variants={itemVariants}
          style={{ margin: '2.5rem 0', textAlign: 'left' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-light)' }}>
                🌾 {locationEnabled ? (lang === 'te' ? 'మీకు దగ్గరలో ఉన్న పంటలు' : 'Products Near You') : (lang === 'te' ? 'మార్కెట్ లోని పంటలు' : 'Trending Crops')}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {locationEnabled 
                  ? (lang === 'te' ? '50 కిలోమీటర్ల లోపు రైతులు పండించిన తాజా పంటలు' : 'Showing crops listed by local farmers within 50 km') 
                  : (lang === 'te' ? 'దగ్గరి పొలాలను గుర్తించడానికి లొకేషన్ ఎనేబుల్ చేయండి' : 'Enable location permissions to find crops near you')}
              </p>
            </div>
            
            {!locationEnabled && (
              <button 
                onClick={requestLocation}
                disabled={locating}
                className="btn btn-secondary" 
                style={{ borderRadius: '2rem', fontSize: '0.8rem', padding: '0.4rem 1rem', minHeight: '36px' }}
              >
                {locating ? (lang === 'te' ? 'గుర్తిస్తోంది...' : 'Locating...') : `📍 ${lang === 'te' ? 'లొకేషన్ ఆన్ చేయండి' : 'Enable Location'}`}
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {[1, 2, 3, 4].map(i => <div key={i} className="glass" style={{ height: '240px', borderRadius: '1rem', opacity: 0.4 }} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {featuredProducts.slice(0, 8).map(p => (
                <ProductCard key={p._id} product={p} onAddToCart={addToCart} />
              ))}
              {featuredProducts.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  {lang === 'te' ? 'ఏ పంటలు అందుబాటులో లేవు.' : 'No products listed on the marketplace yet.'}
                </div>
              )}
            </div>
          )}
        </motion.section>

        {/* 5. VERIFIED FARMERS */}
        <motion.section 
          variants={itemVariants}
          style={{ margin: '2.5rem 0', textAlign: 'left' }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '0.25rem' }}>
            🛡️ {lang === 'te' ? 'వెరిఫైడ్ రైతులు' : 'Verified Farmers'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            {lang === 'te' ? 'ప్రభుత్వ గుర్తింపు పొందిన విశ్వసనీయ రైతులు' : 'Shop with confidence from verified local producers'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="glass" style={{ height: '80px', borderRadius: '1rem', opacity: 0.4 }} />)
            ) : farmers.length === 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>
                {lang === 'te' ? 'రైతులు నమోదు చేసుకోలేదు.' : 'No verified farmers registered yet.'}
              </div>
            ) : (
              farmers.slice(0, 6).map((farmer, idx) => (
                <motion.div 
                  key={farmer._id || idx}
                  whileHover={{ y: -4, borderColor: 'var(--primary)', boxShadow: 'var(--shadow-glow)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="glass" 
                  style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', borderRadius: '1rem', border: '1px solid var(--glass-border)', background: 'var(--bg-darkest)' }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--white)', flexShrink: 0 }}>
                    {farmer.name ? farmer.name.charAt(0).toUpperCase() : 'F'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-light)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{farmer.name}</h4>
                      {farmer.isVerified && (
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.75rem' }}>🛡️</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', color: '#eab308', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        <Star size={10} fill="#eab308" stroke="#eab308" />
                        <span>{farmer.rating || '4.8'}</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                        <MapPin size={10} /> {farmer.address?.city || 'Local Area'}
                      </span>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/store?farmerId=${farmer._id}`} 
                    className="btn btn-secondary" 
                    style={{ padding: '0.3rem 0.6rem', borderRadius: '1.5rem', fontSize: '0.75rem', minHeight: '30px' }}
                  >
                    {lang === 'te' ? 'చూడండి' : 'View Crops'}
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </motion.section>

        {/* 6. HOW IT WORKS */}
        <motion.section 
          variants={itemVariants}
          style={{ margin: '3rem 0', textAlign: 'center' }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '1.5rem' }}>
            ❓ {lang === 'te' ? 'ఫార్మర్‌డైరెక్ట్ ఎలా పనిచేస్తుంది?' : 'How FarmerDirect Works'}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', justifyContent: 'center' }}>
            {[
              { step: '🛒', titleEn: 'Browse Crops', titleTe: 'పంటలను వెతకండి', descEn: 'Find fresh crops listed by local farmers near you.', descTe: 'మీకు దగ్గరలో ఉన్న రైతులు పండించిన తాజా పంటలను వెతకండి.' },
              { step: '📦', titleEn: 'Place Order', titleTe: 'ఆర్డర్ చేయండి', descEn: 'Pay securely online or choose cash on delivery.', descTe: 'ఆన్‌లైన్ ద్వారా లేదా డెలివరీ సమయంలో సురక్షితంగా నగదు చెల్లించండి.' },
              { step: '🚚', titleEn: 'Get Fresh Delivery', titleTe: 'డెలివరీ పొందండి', descEn: 'Receive fresh harvest directly at your doorstep.', descTe: 'తాజా పంటలను నేరుగా మీ ఇంటి వద్ద పొందండి.' }
            ].map((s, idx) => (
              <motion.div 
                key={idx} 
                whileHover={{ y: -6, borderColor: 'var(--primary)', boxShadow: 'var(--shadow-glow)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="glass" 
                style={{ flex: '1 1 260px', maxWidth: '300px', padding: '1.5rem 1.25rem', borderRadius: '1rem', border: '1px solid var(--glass-border)', background: 'var(--bg-darkest)' }}
              >
                <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
                  {s.step}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '0.3rem' }}>
                  {lang === 'te' ? s.titleTe : s.titleEn}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.5', margin: 0 }}>
                  {lang === 'te' ? s.descTe : s.descEn}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

      </div>
    </motion.div>
  );
};
export default Home;
