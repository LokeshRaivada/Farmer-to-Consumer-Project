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
                categories: 'Categories'
            },
            te: {
                welcome: 'స్వాగతం, రైతు',
                home: 'హోమ్',
                store: 'స్టోర్',
                dashboard: 'డ్యాష్‌బోర్డ్',
                cart: 'కార్ట్',
                login: 'లాగిన్',
                signup: 'సైన్ అప్',
                logout: 'లాగ్ అవుట్',
                products: 'ఉత్పత్తులు',
                orders: 'ఆర్డర్లు',
                analytics: 'విశ్లేషణలు',
                buy_fresh: 'తాజా పంట, నేరుగా రైతు నుండి కొనండి',
                sell_produce: 'మీ పంటను సరైన ధరకే అమ్మండి',
                nearby_farmers: 'దగ్గరి రైతులు',
                categories: 'రకాలు'
            }
        };
        return translations[lang][key] || key;
    }

    return (
        <AuthContext.Provider value={{ user, lang, toggleLang, t, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
