import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Trash, ArrowRight, Package, MapPin, Calendar, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to load Razorpay script
const loadScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

const Cart = () => {
    const { user, t, lang } = useAuth();
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [address, setAddress] = useState(user?.address?.city ? `${user.address.city}, ${user.address.state}` : '');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');

    const handleCheckout = async () => {
        if (!user) {
            navigate('/login?redirect=cart');
            return;
        }

        if (user.role !== 'consumer') {
            alert('Only consumers can place orders.');
            return;
        }

        if (!address || !deliveryDate) {
            alert('Please provide shipping address and delivery date.');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                items: cartItems.map(item => ({
                    product: item.product._id,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalAmount: cartTotal,
                shippingAddress: address,
                deliverySchedule: deliveryDate,
                paymentMethod: paymentMethod
            };

            const response = await axios.post('/api/consumer/orders', orderData);
            
            if (paymentMethod === 'Online') {
                const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
                if (!res) {
                    alert('Razorpay SDK failed to load. Are you online?');
                    setLoading(false);
                    return;
                }

                const orderRes = await axios.post('/api/payments/create-razorpay-order', {
                    orderId: response.data[0]._id,
                    amount: cartTotal
                });
                
                const { id: order_id, currency, amount } = orderRes.data;

                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SxFAW9YORDUfza',
                    amount: amount,
                    currency: currency,
                    name: 'FarmerDirect',
                    description: 'Fresh Farm Produce',
                    order_id: order_id,
                    handler: async function (paymentResponse) {
                        try {
                            await axios.post('/api/payments/success', {
                                orderId: response.data[0]._id,
                                amount: cartTotal
                            });
                        } catch (err) {
                            console.error('Failed to report payment success:', err);
                        }
                        setOrderSuccess(true);
                        clearCart();
                        setLoading(false);
                    },
                    prefill: {
                        name: user.name,
                        email: user.email,
                        contact: user.phone || '9999999999'
                    },
                    theme: {
                        color: '#16A34A'
                    }
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.on('payment.failed', function (response){
                    alert('Payment Failed! ' + response.error.description);
                    setLoading(false);
                });
                paymentObject.open();
            } else {
                setOrderSuccess(true);
                clearCart();
                setLoading(false);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Failed to place order. Please try again.');
        }
        setLoading(false);
    };

    if (orderSuccess) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}
                className="glass"
            >
                <div style={{ padding: '4rem' }}>
                    <div style={{ width: '80px', height: '80px', background: 'var(--primary)', borderRadius: '50%', margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={40} color="var(--white)" />
                    </div>
                    <h1 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>{lang === 'te' ? 'ఆర్డర్ విజయవంతమైంది!' : 'Order Placed Successfully!'}</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>
                        {lang === 'te' ? 'మీ ఆర్డర్ రైతులకు పంపబడింది. మీరు దాని స్థితిని మీ ప్రొఫైల్‌లో ట్రాక్ చేయవచ్చు.' : 'Your order has been sent to the farmers. You can track its status in your dashboard.'}
                    </p>
                    <Link to="/store" className="btn btn-primary" style={{ textDecoration: 'none' }}>{lang === 'te' ? 'షాపింగ్ కొనసాగించండి' : 'Continue Shopping'}</Link>
                </div>
            </motion.div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1rem' }}>
                <div className="empty-state">
                    <div className="empty-state-icon">🛒</div>
                    <h3 className="empty-state-title">{lang === 'te' ? 'మీ కార్ట్ ఖాళీగా ఉంది' : 'Your Cart is Empty'}</h3>
                    <p className="empty-state-desc">
                        {lang === 'te' ? 'స్థానిక రైతుల నుండి తాజా పంటలు మీ కోసం సిద్ధంగా ఉన్నాయి!' : 'Fresh products from nearby farmers are waiting for you!'}
                    </p>
                    <Link to="/store" className="btn btn-primary" style={{ borderRadius: '2rem', textDecoration: 'none', marginTop: '0.5rem' }}>
                        {lang === 'te' ? 'షాపింగ్ ప్రారంభించండి' : 'Start Shopping'} <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem', paddingBottom: '6rem' }}>
            <h1 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-light)' }}>
                <ShoppingCart /> {t('cart')}
            </h1>

            <div className="grid grid-cols-1 lg-grid-cols-3" style={{ gap: '2rem', alignItems: 'start' }}>
                {/* Cart Items */}
                <div className="lg-col-span-2" style={{ display: 'grid', gap: '1rem' }}>
                    <AnimatePresence>
                        {cartItems.map((item) => (
                            <motion.div 
                                key={item.product._id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="glass cart-item-card" 
                                style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', border: '1px solid var(--glass-border)' }}
                            >
                                <div style={{ width: '80px', height: '80px', background: 'var(--bg-darker)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Package color="var(--primary)" />
                                </div>
                                <div className="cart-item-details" style={{ flex: 1, textAlign: 'left' }}>
                                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-light)', margin: '0 0 0.25rem' }}>{item.product.name}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.5rem' }}>By {item.product.farmer?.name || 'Local Farmer'}</p>
                                    <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>₹{item.price} / kg</div>
                                </div>
                                <div className="cart-item-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-darkest)', border: '1px solid var(--glass-border)', borderRadius: '2rem', padding: '0.25rem' }}>
                                        <button 
                                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                            style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'transparent', color: 'var(--text-light)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'auto', padding: 0 }}
                                        >-</button>
                                        <span style={{ width: '40px', textAlign: 'center', color: 'var(--text-light)' }}>{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                            style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'transparent', color: 'var(--text-light)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'auto', padding: 0 }}
                                        >+</button>
                                    </div>
                                    <button 
                                        onClick={() => removeFromCart(item.product._id)}
                                        style={{ background: 'transparent', color: 'var(--error)', padding: '0.5rem', border: 'none', cursor: 'pointer', minHeight: 'auto' }}
                                    >
                                        <Trash size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Summary */}
                <div className="glass" style={{ padding: '2rem', border: '1px solid var(--glass-border)' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-light)', textAlign: 'left' }}>Order Summary</h2>
                    
                    <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                            <span style={{ color: 'var(--text-light)', fontWeight: '600' }}>₹{cartTotal}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Delivery Fee</span>
                            <span style={{ color: 'var(--primary)', fontWeight: '600' }}>FREE</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold' }}>
                            <span style={{ color: 'var(--text-light)' }}>Total</span>
                            <span style={{ color: 'var(--primary)' }}>₹{cartTotal}</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '1.25rem', marginBottom: '2rem', textAlign: 'left' }}>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-light)' }}>
                                <MapPin size={16} color="var(--primary)" /> {lang === 'te' ? 'పూర్తి డెలివరీ చిరునామా' : 'Full Shipping Address'}
                            </label>
                            <textarea 
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder={lang === 'te' ? 'ఇంటి నెంబర్, వీధి, గ్రామం లేదా పట్టణం పేరు నమోదు చేయండి...' : 'Enter your full house number, street name, village or town name...'}
                                rows={3}
                            />
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem', opacity: 0.8 }}>
                                💡 {lang === 'te' 
                                  ? 'ఉదాహరణ: ఇంటి నెం. 4-12, పంచాయతీ ఆఫీస్ వీధి, రాంపూర్ గ్రామం, రంగారెడ్డి జిల్లా'
                                  : 'Example: House No. 4-12, Near Panchayat Office, Rampur Village, Rangareddy District'
                                }
                            </p>
                        </div>
                        
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-light)' }}>
                                <Calendar size={16} color="var(--primary)" /> {lang === 'te' ? 'డెలివరీ తేదీ' : 'Preferred Delivery Date'}
                            </label>
                            <input 
                                type="date"
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-light)' }}>
                                💳 {lang === 'te' ? 'డబ్బులు చెల్లించే విధానం' : 'Payment Method'}
                            </label>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <label style={{ flex: 1, minWidth: '140px', padding: '1.2rem 1rem', border: `2px solid ${paymentMethod === 'COD' ? 'var(--primary)' : 'var(--glass-border)'}`, borderRadius: '0.75rem', background: paymentMethod === 'COD' ? 'rgba(22, 163, 74, 0.08)' : 'var(--bg-dark)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-light)' }}>
                                    <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                                    {lang === 'te' ? 'చేతికి డబ్బులు ఇవ్వడం (COD)' : 'Cash on Delivery'}
                                </label>
                                <label style={{ flex: 1, minWidth: '140px', padding: '1.2rem 1rem', border: `2px solid ${paymentMethod === 'Online' ? 'var(--primary)' : 'var(--glass-border)'}`, borderRadius: '0.75rem', background: paymentMethod === 'Online' ? 'rgba(22, 163, 74, 0.08)' : 'var(--bg-dark)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-light)' }}>
                                    <input type="radio" name="payment" value="Online" checked={paymentMethod === 'Online'} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                                    {lang === 'te' ? 'ఆన్‌లైన్ పేమెంట్' : 'Online (Razorpay)'}
                                </label>
                            </div>
                        </div>
                    </div>

                    <button 
                        className="btn btn-primary" 
                        style={{ width: '100%', padding: '1rem' }}
                        disabled={loading}
                        onClick={handleCheckout}
                    >
                        {loading ? 'Processing...' : user ? 'Place Order' : 'Login to Checkout'}
                    </button>
                    {!user && <p style={{ fontSize: '0.8rem', textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>You'll need an account to place orders.</p>}
                </div>
            </div>
        </div>
    );
};

export default Cart;
