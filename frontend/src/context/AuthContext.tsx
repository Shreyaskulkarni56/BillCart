import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    shopName?: string;
    phone?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    register: (userData: { name: string; email: string; password: string; shopName?: string; phone?: string }) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(() => {
        const savedUser = localStorage.getItem('billcart_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('billcart_token'));
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadUser = async () => {
            const storedToken = localStorage.getItem('billcart_token');
            if (storedToken) {
                try {
                    const me = await authApi.getMe();
                    setUser(me);
                    localStorage.setItem('billcart_user', JSON.stringify(me));
                } catch (error) {
                    console.error('Failed to load user profile:', error);
                    localStorage.removeItem('billcart_token');
                    localStorage.removeItem('billcart_user');
                    setToken(null);
                    setUser(null);
                }
            }
            setIsLoading(false);
        };
        loadUser();
    }, []);

    const login = async (credentials: { email: string; password: string }) => {
        const data = await authApi.login(credentials);
        setToken(data.token);
        const userData: AuthUser = {
            id: data.id,
            name: data.name,
            email: data.email,
            shopName: data.shopName,
            phone: data.phone,
        };
        setUser(userData);
        localStorage.setItem('billcart_token', data.token);
        localStorage.setItem('billcart_user', JSON.stringify(userData));
    };

    const register = async (userData: { name: string; email: string; password: string; shopName?: string; phone?: string }) => {
        const data = await authApi.register(userData);
        setToken(data.token);
        const userObj: AuthUser = {
            id: data.id,
            name: data.name,
            email: data.email,
            shopName: data.shopName,
            phone: data.phone,
        };
        setUser(userObj);
        localStorage.setItem('billcart_token', data.token);
        localStorage.setItem('billcart_user', JSON.stringify(userObj));
    };

    const logout = () => {
        localStorage.removeItem('billcart_token');
        localStorage.removeItem('billcart_user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
