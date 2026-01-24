import React, { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../services/api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null); // 사용자 정보 (필요시 확장)
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 초기 로드시 토큰 확인
        const checkLoginStatus = async () => {
            const token = authApi.getAccessToken();
            if (token) {
                setIsLoggedIn(true);
                // 유저 정보 가져오기
                const res = await authApi.getMe();
                if (res.success) {
                    setUser({ memberId: res.memberId });
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
                setUser({ memberId: meRes.memberId });
            }
            return { success: true };
        }
        return result;
    };

    const logout = () => {
        authApi.clearTokens();
        setIsLoggedIn(false);
        setUser(null);
        // 필요한 경우 로그인 페이지로 리다이렉트 로직 추가 가능 (컴포넌트 레벨에서 처리 권장)
    };

    const value = {
        isLoggedIn,
        user,
        isLoading,
        login,
        logout
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
