import apiClient from '../apiClient.js';

class AuthApi {
    // 로그인
    async signin({ email, password }) {
        try {
            const response = await apiClient.post('/api/v1/auth/login', { email, password });

            // 토큰 추출 (response 구조 대응)
            const accessToken = response.accessToken || response.data?.accessToken;
            const refreshToken = response.refreshToken || response.data?.refreshToken;

            // 토큰 저장
            if (accessToken) sessionStorage.setItem('accessToken', accessToken);
            if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);

            if (!accessToken) {
                console.warn('Access Token not found in response', response);
            }

            return { success: true, data: response };
        } catch (error) {
            console.error('로그인 에러:', error);
            const errData = error.response?.data;

            return {
                success: false,
                error: {
                    code: errData?.code,
                    message: errData?.message,
                    status: errData?.status,
                    timestamp: errData?.timestamp
                }
            };
        }
    }

    // 회원가입
    async signup({ email, name, password }) {
        try {
            const response = await apiClient.post('/api/v1/members/signup', { email, name, password });
            return { success: true, data: response };
        } catch (error) {
            console.error('회원가입 에러:', error);
            const errData = error.response?.data;
            return {
                success: false,
                error: {
                    message: errData?.message || '회원가입에 실패했습니다.'
                }
            };
        }
    }

    // 토큰 갱신
    async refresh(refreshToken) {
        try {
            const response = await apiClient.post('/api/v1/auth/refresh', { refreshToken });
            const newAccessToken = response.accessToken || response.data?.accessToken;
            
            if (newAccessToken) {
                sessionStorage.setItem('accessToken', newAccessToken);
                return { success: true, data: response };
            }
             
            return { success: false, error: { message: '토큰 갱신 응답 형식 오류' } };
        } catch (error) {
            console.error('토큰 갱신 에러:', error);
            return { success: false, error: { message: '토큰 갱신 실패', code: 'GLOBAL-500-1' } };
        }
    }

    // 내 정보 조회 (회원 ID)
    async getMe() {
        try {
            const response = await apiClient.get('/api/v1/members/me');
            // 응답이 단순 문자열(ID)일 수도 있고, JSON일 수도 있음. 
            // MemberController.java: return AuthContext.memberId().toString(); -> 단순 문자열
            return { success: true, memberId: response };
        } catch (error) {
            console.error('내 정보 조회 실패:', error);
            return { success: false, error };
        }
    }

    // 판매자 전환 신청
    async upgradeToSeller({ bankCode, accountNumber, accountHolder }) {
        try {
            await apiClient.patch('/api/v1/members/role', { bankCode, accountNumber, accountHolder });
            return { success: true };
        } catch (error) {
            console.error('판매자 전환 실패:', error);
            return { success: false, error: error.response?.data || { message: '판매자 전환 실패' } };
        }
    }

    // TODO : 로그아웃
    // async signout() {
    //     try {
    //         const refreshToken = sessionStorage.getItem('refreshToken');
    //         if (refreshToken) {
    //             await apiClient.post('/api/v1/auth/signout', { refreshToken });
    //         }
    //     } catch (error) {
    //         console.warn('로그아웃 API 실패:', error);
    //     } finally {
    //         this.clearTokens();
    //         return { success: true };
    //     }
    // }

    // 토큰 관리
    saveTokens(accessToken, refreshToken) {
        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('refreshToken', refreshToken);
    }

    clearTokens() {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
    }

    getAccessToken() {
        return sessionStorage.getItem('accessToken');
    }

    getRefreshToken() {
        return sessionStorage.getItem('refreshToken');
    }

    isLoggedIn() {
        return !!this.getAccessToken();
    }
}

const authApi = new AuthApi();
export default authApi;
