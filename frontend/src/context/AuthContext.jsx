import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
            return parsedUser;
        }
        return null;
    });
    const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');
    const [largeText, setLargeText] = useState(localStorage.getItem('largeText') === 'true');
    const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState({ emailVerificationRequired: false, emailEnabled: false });
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (user && user._id) {
            const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const newSocket = io(SOCKET_URL, {
                query: { userId: user._id }
            });
            
            newSocket.on('connect', () => {
                console.log('📡 [SOCKET] Connected with ID:', newSocket.id);
                newSocket.emit('join_room', user._id);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
                setSocket(null);
            };
        } else {
            setSocket(null);
        }
    }, [user?._id]);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const { data } = await axios.get('/api/config/public');
                setConfig(data);
            } catch (err) {
                console.error('Failed to fetch public config:', err);
            }
        };
        fetchConfig();
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
    }, [darkMode]);

    useEffect(() => {
        const verifyToken = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
                    const { data } = await axios.get('/api/auth/me');
                    setUser({ ...data, token: parsedUser.token });
                    localStorage.setItem('user', JSON.stringify({ ...data, token: parsedUser.token }));
                } catch (error) {
                    console.error('Token verification failed, logging out:', error);
                    setUser(null);
                    localStorage.removeItem('user');
                    delete axios.defaults.headers.common['Authorization'];
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };
        verifyToken();
    }, []);

    const login = async (credentials) => {
        const { data } = await axios.post('/api/auth/login', credentials);
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        return data;
    };

    const register = async (userData) => {
        const { data } = await axios.post('/api/auth/register', userData);
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        return data;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
    };

    const changePassword = async (oldPassword, newPassword) => {
        const { data } = await axios.put('/api/auth/change-password', { oldPassword, newPassword });
        return data;
    };

    const updateProfile = async (profileData) => {
        const { data } = await axios.put('/api/auth/profile', profileData);
        const storedUser = localStorage.getItem('user');
        const token = storedUser ? JSON.parse(storedUser).token : '';
        const updatedUser = { ...data, token };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
    };

    const forgotPassword = async (email) => {
        const { data } = await axios.post('/api/auth/forgot-password', { email });
        return data;
    };

    const resetPassword = async (token, password, confirmPassword) => {
        const { data } = await axios.post(`/api/auth/reset-password/${token}`, { password, confirmPassword });
        return data;
    };

    const verifyEmailToken = async (token) => {
        const { data } = await axios.post(`/api/auth/verify-email/${token}`);
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            const updatedUser = { ...parsedUser, isEmailVerified: true };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        return data;
    };

    const resendVerification = async (email) => {
        const { data } = await axios.post('/api/auth/resend-verification', { email });
        return data;
    };

    const toggleLang = () => {
        const newLang = lang === 'en' ? 'te' : 'en';
        setLang(newLang);
        localStorage.setItem('lang', newLang);
    };

    const toggleLargeText = () => {
        const newLarge = !largeText;
        setLargeText(newLarge);
        localStorage.setItem('largeText', String(newLarge));
    };

    const toggleDarkMode = () => {
        const newDark = !darkMode;
        setDarkMode(newDark);
        localStorage.setItem('darkMode', String(newDark));
    };

    const t = (key) => {
        const translations = {
            en: {
                welcome: 'Welcome back',
                home: 'Home',
                store: 'Store',
                dashboard: 'Dashboard',
                cart: 'Cart',
                login: 'Login',
                signup: 'Sign Up',
                logout: 'Logout',
                products: 'Products',
                orders: 'Orders',
                analytics: 'Analytics',
                buy_fresh: 'Buy Fresh, Direct from Farmers',
                sell_produce: 'Sell your produce at a fair price',
                nearby_farmers: 'Nearby Farmers',
                categories: 'Categories',
                
                // Simplified Terminology
                shop: 'Shop',
                farmers: 'Farmers',
                my_farm: 'My Farm',
                my_crops: 'My Crops',
                customer_orders: 'Orders From Customers',
                money_earned: 'Money Earned',
                sales_summary: 'View Sales',
                low_stock_alerts: 'Crops Running Low',
                messages: 'Customer Messages',
                add_new_crop: 'Add Crop',
                update_delivery_status: 'Update Delivery Status',
                contact_customer: 'Call Customer',
                order_placed: 'Order Placed',
                farmer_accepted: 'Farmer Accepted',
                ready_for_delivery: 'Ready',
                on_the_way: 'On The Way',
                delivered: 'Delivered',
                wishlist: 'Wishlist',
                alerts: 'Alerts',
                profile: 'Profile',
                nearby_farms: 'Nearby Farms',
                price_range: 'Price Range',
                search: 'Search',
                category: 'Category',
                empty_orders: 'No Orders Yet. When customers place orders, they will appear here.',
                empty_crops: 'No Crops Added. Add your first crop to start selling.',
                payment_received: 'Payment received successfully.',
                order_on_the_way: 'Your order is on the way.',
                verified_badge: 'Verified Farmer',
                available: 'Available',
                only_left: 'Only {count} KG Left'
            },
            te: {
                welcome: 'మళ్లీ స్వాగతం',
                home: 'హోమ్',
                store: 'షాప్',
                dashboard: 'నా పొలం',
                cart: 'కార్ట్',
                login: 'లాగిన్',
                signup: 'సైన్ అప్',
                logout: 'లాగ్ అవుట్',
                products: 'నా పంటలు',
                orders: 'కస్టమర్ ఆర్డర్లు',
                analytics: 'విక్రయాల సారాంశం',
                buy_fresh: 'తాజా పంట, నేరుగా రైతు నుండి కొనండి',
                sell_produce: 'మీ పంటను సరైన ధరకే అమ్మండి',
                nearby_farmers: 'దగ్గరి రైతులు',
                categories: 'రకాలు',
                
                // Simplified Terminology
                shop: 'షాప్',
                farmers: 'రైతులు',
                my_farm: 'నా పొలం',
                my_crops: 'నా పంటలు',
                customer_orders: 'కస్టమర్ల నుండి ఆర్డర్లు',
                money_earned: 'సంపాదించిన డబ్బు',
                sales_summary: 'విక్రయాలు చూడండి',
                low_stock_alerts: 'తక్కువగా ఉన్న పంటలు',
                messages: 'కస్టమర్ సందేశాలు',
                add_new_crop: 'పంటను జోడించు',
                update_delivery_status: 'డెలివరీ స్థితిని మార్చు',
                contact_customer: 'కస్టమర్‌కు ఫోన్ చేయి',
                order_placed: 'ఆర్డర్ విజయవంతమైంది',
                farmer_accepted: 'రైతు అంగీకరించారు',
                ready_for_delivery: 'సిద్ధంగా ఉంది',
                on_the_way: 'మధ్యలో ఉంది',
                delivered: 'డెలివరీ చేయబడింది',
                wishlist: 'విష్‌లిస్ట్',
                alerts: 'హెచ్చరికలు',
                profile: 'ప్రొఫైల్',
                nearby_farms: 'దగ్గరి పొలాలు',
                price_range: 'ధరల పరిధి',
                search: 'వెతకండి',
                category: 'రకాలు',
                empty_orders: 'ఇంకా ఆర్డర్లు లేవు. కస్టమర్లు ఆర్డర్ చేసినప్పుడు, అవి ఇక్కడ కనిపిస్తాయి.',
                empty_crops: 'ఇంకా ఏ పంటలు జోడించలేదు. అమ్మడం ప్రారంభించడానికి మీ మొదటి పంటను జోడించండి.',
                payment_received: 'డబ్బు విజయవంతంగా చెల్లించబడింది.',
                order_on_the_way: 'మీ ఆర్డర్ మధ్యలో ఉంది.',
                verified_badge: 'వెరిఫైడ్ రైతు',
                available: 'అందుబాటులో ఉంది',
                only_left: 'కేవలం {count} కేజీలు మాత్రమే ఉంది'
            }
        };
        return translations[lang][key] || key;
    };

    return (
        <AuthContext.Provider value={{ 
            user, lang, toggleLang, t, login, register, logout, loading, largeText, toggleLargeText, darkMode, toggleDarkMode,
            changePassword, updateProfile, forgotPassword, resetPassword, verifyEmailToken, resendVerification,
            config, socket
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
