
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cartApi from '../services/api/cartApi';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartCount, setCartCount] = useState(0);
    const { isLoggedIn } = useAuth();

    const fetchCartCount = useCallback(async () => {
        if (!isLoggedIn) {
            setCartCount(0);
            return;
        }
        try {
            const res = await cartApi.getCart();
            const count = res.items ? res.items.length : 0;
            setCartCount(count);
        } catch (err) {
            console.error('Failed to fetch cart count:', err);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        fetchCartCount();
    }, [fetchCartCount]);

    return (
        <CartContext.Provider value={{ cartCount, updateCartCount: fetchCartCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
