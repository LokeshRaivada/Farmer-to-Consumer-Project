import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Leaf, MapPin, Star, ArrowRight, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Wishlist = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get('/api/consumer/wishlist');
      setWishlist(data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [user]);

  const handleRemove = async (productId, e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await axios.post(`/api/consumer/wishlist/${productId}`);
      setWishlist(prev => prev.filter(p => p._id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(product);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <Loader className="animate-spin" size={32} color="var(--primary)" />
        <span style={{ color: 'var(--text-muted)' }}>Loading wishlist...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem', textAlign: 'left' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Heart size={36} color="var(--primary)" fill="var(--primary)" /> My Wishlist
      </h1>

      {wishlist.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass" 
          style={{ padding: '5rem 2rem', textAlign: 'center', borderRadius: '2rem', border: '1px dashed rgba(255,255,255,0.1)' }}
        >
          <div style={{ background: 'rgba(0, 255, 157, 0.05)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Heart size={40} color="var(--text-muted)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'white' }}>Your wishlist is empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
            Explore our marketplace and bookmark your favorite fresh produce to purchase them later.
          </p>
          <Link to="/store" className="btn btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: '2rem' }}>
            Browse Marketplace <ArrowRight size={18} />
          </Link>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          <AnimatePresence>
            {wishlist.map(p => (
              <motion.div
                key={p._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -5 }}
                className="glass"
                style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}
              >
                {/* Remove from wishlist */}
                <button 
                  onClick={(e) => handleRemove(p._id, e)}
                  style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 10, background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--error)' }}
                  title="Remove from wishlist"
                >
                  <Heart size={16} fill="var(--error)" color="var(--error)" />
                </button>

                {/* Image Placeholder */}
                <div style={{ height: '140px', background: 'linear-gradient(135deg, rgba(0, 255, 157, 0.06), rgba(34, 197, 94, 0.03))', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <Leaf size={40} color="var(--primary)" opacity={0.3} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{p.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.1rem', color: '#eab308', fontSize: '0.8rem' }}>
                      <Star size={12} fill="#eab308" />
                      <span>{p.averageRating > 0 ? p.averageRating.toFixed(1) : 'New'}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span>By {p.farmer?.name || 'Verified Farmer'}</span>
                    {p.farmer?.isVerified && <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✓</span>}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <MapPin size={12} /> <span>{p.farmer?.address?.city || 'Local Area'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>
                      ₹{p.price} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/kg</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: p.quantity > 5 ? 'var(--primary)' : 'var(--error)' }}>
                      Stock: {p.quantity}kg
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleAddToCart(p, e)}
                    className="btn btn-primary"
                    style={{ padding: '0.4rem 0.8rem', borderRadius: '1.5rem', fontSize: '0.75rem', textTransform: 'none', minHeight: '32px' }}
                    disabled={user?.role === 'farmer' || p.quantity <= 0}
                  >
                    Add
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
