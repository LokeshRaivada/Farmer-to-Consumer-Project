import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Truck, TrendingUp, Search, MapPin, ArrowRight, ShieldCheck, Sprout } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, type: 'spring' }}
    whileHover={{ y: -10, scale: 1.02 }}
    className="glass"
    style={{ padding: '2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
  >
    <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}>
      <Icon size={120} color="var(--primary)" />
    </div>
    <div style={{ width: '70px', height: '70px', margin: '0 auto 1.5rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(0,255,157,0.3)' }}>
      <Icon size={36} color="var(--bg-darkest)" />
    </div>
    <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', fontWeight: '700', color: 'white' }}>{title}</h3>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{description}</p>
  </motion.div>
);

const FloatingElement = ({ icon: Icon, delay, top, left, right, bottom, size }) => (
  <motion.div
    className="animate-float"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 0.6, scale: 1 }}
    transition={{ delay, duration: 1 }}
    style={{ position: 'absolute', top, left, right, bottom, zIndex: 0, filter: 'blur(2px)' }}
  >
    <Icon size={size} color="var(--primary)" />
  </motion.div>
);

const Home = () => {
  const { t } = useAuth();

  return (
    <div style={{ position: 'relative' }}>
      <div className="bg-grid-pattern"></div>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', paddingBottom: '6rem' }}>
        
        {/* Advanced Hero Section */}
        <section style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          
          <FloatingElement icon={Leaf} delay={0.2} top="15%" left="-5%" size={60} />
          <FloatingElement icon={Sprout} delay={0.5} bottom="25%" left="40%" size={40} />
          
          <div style={{ maxWidth: '650px', zIndex: 10 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,255,157,0.1)', border: '1px solid var(--primary)', padding: '0.5rem 1rem', borderRadius: '2rem', marginBottom: '2rem', color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem' }}
            >
              <ShieldCheck size={16} /> Verified Organic Farmers Network
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ fontSize: '4.5rem', lineHeight: '1.1', marginBottom: '1.5rem', fontWeight: '700', textShadow: '0 0 40px rgba(0,255,157,0.3)' }}
            >
              The Future of <span style={{ background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Agriculture</span> Marketplace.
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '500px', lineHeight: '1.7' }}
            >
              Connect directly with verified local farmers. Get fresh, organic produce delivered straight to your door with real-time tracking and fair pricing.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}
            >
              <Link to="/store" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
                Explore Market <Search size={20} />
              </Link>
              <Link to="/signup" className="btn btn-secondary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
                Join as Farmer <ArrowRight size={20} />
              </Link>
            </motion.div>
          </div>
          
          {/* Futuristic Hero Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
            className="animate-float"
            style={{ width: '450px', height: '550px', position: 'relative', zIndex: 10, display: 'block' }} // Hide on mobile, show on desktop via CSS normally, using inline for quick fix
          >
            {/* Main Glass Card */}
            <div className="glass" style={{ width: '100%', height: '100%', borderRadius: '2rem', display: 'flex', flexDirection: 'column', padding: '2rem', position: 'relative', overflow: 'hidden', border: '1px solid rgba(0,255,157,0.4)', boxShadow: '0 0 50px rgba(0,255,157,0.2)' }}>
              
              <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'conic-gradient(transparent, transparent, transparent, var(--primary))', animation: 'spin 4s linear infinite', opacity: 0.1 }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', zIndex: 1 }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></div>
                </div>
                <div style={{ background: 'rgba(0,255,157,0.2)', color: 'var(--primary)', padding: '0.2rem 0.8rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold' }}>LIVE MARKET</div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 1 }}>
                {/* Realistic Market Rows */}
                {[
                  { name: 'Organic Tomatoes', farm: 'Green Valley Farm', price: '₹40/kg', trend: '+12%', icon: '🍅' },
                  { name: 'Fresh Spinach', farm: 'Sunrise Organics', price: '₹25/bunch', trend: '+5%', icon: '🥬' },
                  { name: 'Local Potatoes', farm: 'Heritage Farms', price: '₹30/kg', trend: '-2%', icon: '🥔' }
                ].map((item, i) => (
                  <div key={i} style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'rgba(0,255,157,0.05)'; e.currentTarget.style.borderColor = 'rgba(0,255,157,0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(0,0,0,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '0.5rem', background: 'rgba(0,255,157,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '0.2rem' }}>{item.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.farm}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'white', fontWeight: 'bold' }}>{item.price}</div>
                      <div style={{ color: item.trend.startsWith('+') ? 'var(--primary)' : '#ff5f56', fontSize: '0.8rem', fontWeight: 'bold' }}>{item.trend}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 'auto', zIndex: 1 }}>
                <div style={{ width: '100%', height: '120px', background: 'linear-gradient(to top, rgba(0,255,157,0.2), transparent)', borderRadius: '1rem', borderBottom: '2px solid var(--primary)', position: 'relative', overflow: 'hidden' }}>
                   {/* Animated Graph Area */}
                   <svg viewBox="0 0 100 40" style={{ width: '100%', height: '100%', position: 'absolute', bottom: 0 }} preserveAspectRatio="none">
                     <defs>
                       <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                         <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                       </linearGradient>
                     </defs>
                     <path d="M0 40 L 0 35 L 20 25 L 40 28 L 60 15 L 80 18 L 100 5 L 100 40 Z" fill="url(#graphGradient)" />
                     <path d="M0 35 L 20 25 L 40 28 L 60 15 L 80 18 L 100 5" fill="none" stroke="var(--primary)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,255,157,0.5))' }} />
                   </svg>
                   <div style={{ position: 'absolute', top: '10px', left: '15px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                     <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}></div>
                     <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold', letterSpacing: '1px' }}>MARKET TREND</span>
                   </div>
                </div>
              </div>

            </div>

            {/* Floating Badges */}
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} className="glass" style={{ position: 'absolute', bottom: '-20px', left: '-40px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '1rem', zIndex: 20 }}>
              <div style={{ background: 'var(--primary)', borderRadius: '50%', padding: '0.5rem' }}><MapPin color="var(--bg-darkest)" size={20} /></div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nearest Farm</div>
                <div style={{ fontWeight: 'bold' }}>1.2 km away</div>
              </div>
            </motion.div>

          </motion.div>
        </section>

        {/* Features Showcase */}
        <section className="grid grid-cols-1 md-grid-cols-3" style={{ marginTop: '2rem' }}>
          <FeatureCard 
              icon={Leaf} 
              title="100% Organic Verified" 
              description="Every farmer undergoes strict quality checks to ensure chemical-free, fresh produce." 
              delay={0.1}
          />
          <FeatureCard 
              icon={MapPin} 
              title="Hyper-Local Sourcing" 
              description="Discover farmers in your exact district. Lower carbon footprint, higher freshness." 
              delay={0.2}
          />
          <FeatureCard 
              icon={TrendingUp} 
              title="Fair Trade Pricing" 
              description="Cut out the middlemen. Farmers earn more, you pay less. Transparent market rates." 
              delay={0.3}
          />
        </section>

      </div>
    </div>
  );
};

export default Home;
