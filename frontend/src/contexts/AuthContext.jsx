import React, { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../services/api/authApi';

const AuthContext = createContext(null);
const USERNAME_STORAGE_KEY = 'username';

const usernameFromEmail = (email) => {
    if (!email || typeof email !== 'string') return null;
    const localPart = email.split('@')[0]?.trim();
    return localPart || null;
};

const resolveDisplayName = (res, fallbackEmail = null) =>
    res?.name ||
    res?.username ||
    sessionStorage.getItem(USERNAME_STORAGE_KEY) ||
    usernameFromEmail(fallbackEmail);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null); // 사용자 정보 (필요시 확장)
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 초기 로드시 토큰 확인
        const checkLoginStatus = async () => {
            const token = authApi.getAccessToken();
            if (token) {
                try {
                    // 유저 정보 가져오기
                    const res = await authApi.getMe();
                    if (res.success) {
                        setUser({
                            memberId: res.memberId,
                            role: res.role,
                            name: resolveDisplayName(res)
                        });
                        setIsLoggedIn(true);
                    } else {
                        throw new Error('User info fetch failed');
                    }
                } catch (err) {
                    console.error('Session validation failed:', err);
                    authApi.clearTokens(); // Token useless or backend error -> logout
                    setIsLoggedIn(false);
                    setUser(null);
                }
            } else {
                setIsLoggedIn(false);
                setUser(null);
            }
            setIsLoading(false);
        };

        checkLoginStatus();

        // TODO: 필요한 경우 여기서 사용자 정보를 가져오는 API를 호출하여 user 상태를 채울 수 있음
    }, []);

    const login = async (email, password) => {
        const result = await authApi.signin({ email, password });
        if (result.success) {
            setIsLoggedIn(true);
            // 로그인 성공 시 바로 유저 정보 로딩
            const meRes = await authApi.getMe();
            if (meRes.success) {
                const displayName = resolveDisplayName(meRes, email);
                if (displayName) sessionStorage.setItem(USERNAME_STORAGE_KEY, displayName);
                setUser({ memberId: meRes.memberId, role: meRes.role, name: displayName });
            }
            return { success: true };
        }
        return result;
    };

    const refresh = async () => {
        if (!authApi.getAccessToken()) return null;
        try {
            const res = await authApi.getMe();
            if (res.success) {
                const displayName = resolveDisplayName(res);
                if (displayName) sessionStorage.setItem(USERNAME_STORAGE_KEY, displayName);
                const newUser = { memberId: res.memberId, role: res.role, name: displayName };
                setUser(newUser);
                return newUser;
            }
        } catch (err) {
            console.error('Info refresh failed:', err);
        }
        return null;
    };

    const logout = () => {
        authApi.clearTokens();
        sessionStorage.removeItem(USERNAME_STORAGE_KEY);
        setIsLoggedIn(false);
        setUser(null);
    };

    const value = {
        isLoggedIn,
        user,
        isLoading,
        login,
        logout,
        refresh
    };

    return (
        <AuthContext.Provider value={value}>
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
