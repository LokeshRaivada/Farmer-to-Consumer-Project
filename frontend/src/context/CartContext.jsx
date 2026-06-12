import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const cartKey = user ? `cart_user_${user._id}` : 'cart_guest';

    const [cartItems, setCartItems] = useState(() => {
        // Initial sync load
        try {
            const storedUser = localStorage.getItem('user');
            const parsedUser = storedUser ? JSON.parse(storedUser) : null;
            const initialKey = parsedUser ? `cart_user_${parsedUser._id}` : 'cart_guest';
            const savedCart = localStorage.getItem(initialKey);
            const parsed = savedCart ? JSON.parse(savedCart) : [];
            return Array.isArray(parsed) ? parsed.filter(item => item && item.product && item.product._id) : [];
        } catch (error) {
            console.error('Error loading cart items:', error);
            return [];
        }
    });

    const currentKeyRef = useRef(cartKey);

    useEffect(() => {
        if (currentKeyRef.current !== cartKey) {
            const savedCart = localStorage.getItem(cartKey);
            currentKeyRef.current = cartKey;
            try {
                const parsed = savedCart ? JSON.parse(savedCart) : [];
                setCartItems(Array.isArray(parsed) ? parsed.filter(item => item && item.product && item.product._id) : []);
            } catch (error) {
                console.error('Error parsing cart items on key change:', error);
                setCartItems([]);
            }
        }
    }, [cartKey]);

    useEffect(() => {
        if (currentKeyRef.current === cartKey) {
            const cleanItems = cartItems.filter(item => item && item.product && item.product._id);
            localStorage.setItem(cartKey, JSON.stringify(cleanItems));
        }
    }, [cartItems, cartKey]);

    const addToCart = (product, quantity = 1) => {
        if (!product || !product._id) return;
        setCartItems(prev => {
            const validItems = prev.filter(item => item && item.product && item.product._id);
            const existingItem = validItems.find(item => item.product._id === product._id);
            if (existingItem) {
                return validItems.map(item => 
                    item.product._id === product._id 
                    ? { ...item, quantity: item.quantity + quantity } 
                    : item
                );
            }
            return [...validItems, { product, quantity, price: product.price }];
        });
    };

    const removeFromCart = (productId) => {
        setCartItems(prev => prev.filter(item => item && item.product && item.product._id && item.product._id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        setCartItems(prev => prev.filter(item => item && item.product && item.product._id).map(item => 
            item.product._id === productId ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <CartContext.Provider value={{ 
            cartItems, 
            addToCart, 
            removeFromCart, 
            updateQuantity, 
            clearCart, 
            cartTotal, 
            cartCount 
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);

