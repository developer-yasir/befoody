import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await api.get('/api/users/me');
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching user:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/api/auth/login', {
                email,
                password
            });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);
            return { success: true, user };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (name, email, password, role = 'customer') => {
        try {
            const response = await api.post('/api/auth/register', {
                name,
                email,
                password,
                role
            });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
        isRestaurant: user?.role === 'restaurant'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
