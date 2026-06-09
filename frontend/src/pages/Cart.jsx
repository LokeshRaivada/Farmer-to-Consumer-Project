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
    const { user, t } = useAuth();
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

                // Create Razorpay order on backend
                const orderRes = await axios.post('/api/payments/create-razorpay-order', {
                    orderId: response.data._id,
                    amount: cartTotal
                });
                
                const { id: order_id, currency, amount } = orderRes.data;

                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SxFAW9YORDUfza', // Enter the Key ID generated from the Dashboard
                    amount: amount,
                    currency: currency,
                    name: 'FarmerDirect',
                    description: 'Fresh Farm Produce',
                    order_id: order_id,
                    handler: async function (response) {
                        // After successful payment, we could verify signature here
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
                        color: '#00ff9d'
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
                        <CheckCircle size={40} color="white" />
                    </div>
                    <h1 style={{ marginBottom: '1rem' }}>Order Placed Successfully!</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>
                        Your order has been sent to the farmers. You can track its status in your dashboard.
                    </p>
                    <Link to="/store" className="btn btn-primary">Continue Shopping</Link>
                </div>
            </motion.div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1rem' }}>
                <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingCart size={40} opacity={0.5} />
                    </div>
                    <h1 style={{ marginBottom: '1rem' }}>Your Cart is Empty</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>
                        Fresh products from nearby farmers are waiting for you!
                    </p>
                    <Link to="/store" className="btn btn-primary">
                        Start Shopping <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
            <h1 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                                className="glass" 
                                style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}
                            >
                                <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Package color="var(--primary)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.1rem' }}>{item.product.name}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>By {item.product.farmer?.name || 'Local Farmer'}</p>
                                    <div style={{ marginTop: '0.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>₹{item.price} / kg</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '2rem', padding: '0.25rem' }}>
                                        <button 
                                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                            style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'transparent', color: 'white' }}
                                        >-</button>
                                        <span style={{ width: '40px', textAlign: 'center' }}>{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                            style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'transparent', color: 'white' }}
                                        >+</button>
                                    </div>
                                    <button 
                                        onClick={() => removeFromCart(item.product._id)}
                                        style={{ background: 'transparent', color: 'var(--error)', padding: '0.5rem' }}
                                    >
                                        <Trash size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Summary */}
                <div className="glass" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Order Summary</h2>
                    
                    <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                            <span>₹{cartTotal}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Delivery Fee</span>
                            <span style={{ color: 'var(--primary)' }}>FREE</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold' }}>
                            <span>Total</span>
                            <span style={{ color: 'var(--secondary)' }}>₹{cartTotal}</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <MapPin size={14} /> Shipping Address
                            </label>
                            <textarea 
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Enter full delivery address..."
                                style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem', resize: 'none' }}
                                rows={2}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <Calendar size={14} /> Preferred Delivery Date
                            </label>
                            <input 
                                type="date"
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Payment Method
                            </label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <label style={{ flex: 1, padding: '1rem', border: `1px solid ${paymentMethod === 'COD' ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '0.5rem', background: paymentMethod === 'COD' ? 'rgba(0,255,157,0.1)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} style={{ accentColor: 'var(--primary)' }} />
                                    Cash on Delivery
                                </label>
                                <label style={{ flex: 1, padding: '1rem', border: `1px solid ${paymentMethod === 'Online' ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '0.5rem', background: paymentMethod === 'Online' ? 'rgba(0,255,157,0.1)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input type="radio" name="payment" value="Online" checked={paymentMethod === 'Online'} onChange={(e) => setPaymentMethod(e.target.value)} style={{ accentColor: 'var(--primary)' }} />
                                    Online (Razorpay)
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
                    {!user && <p style={{ fontSize: '0.8rem', textAlign: 'center', marginTop: '1rem', opacity: 0.7 }}>You'll need an account to place orders.</p>}
                </div>
            </div>
        </div>
    );
};

export default Cart;
