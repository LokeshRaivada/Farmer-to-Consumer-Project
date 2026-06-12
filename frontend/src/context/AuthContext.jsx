import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

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
    const [loading, setLoading] = useState(false); // We initialize synchronously so no loading needed

    useEffect(() => {
        // Any async checks can go here, like verifying token with backend
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

    const t = (key) => {
        const translations = {
            en: {
                welcome: 'Welcome back, Farmer',
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
                welcome: 'స్వాగతం, రైతు',
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
        <AuthContext.Provider value={{ user, lang, toggleLang, t, login, register, logout, loading, largeText, toggleLargeText }}>
            {children}
          </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
