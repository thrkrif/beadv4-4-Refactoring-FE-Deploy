
import apiClient from '../apiClient';

const paymentApi = {
    // POST /api/v1/payments/confirm/toss
    confirmPayment: async (paymentKey, orderId, amount) => {
        console.log('🚀 결제 승인 API 호출 데이터:', { paymentKey, orderId, amount: Number(amount) });
        return apiClient.post('/api/v1/payments/confirm/toss', {
            paymentKey,
            orderId,
            amount: Number(amount)
        });
    },

    // 내 지갑 정보 조회
    getWallet: async (memberId) => {
        return apiClient.get(`/api/v1/payments/internal/wallets/${memberId}`);
    },

    // 입출금 로그 조회
    getBalanceLogs: async () => {
        return apiClient.get('/api/v1/payments/balanceLog');
    },

    // 결제 내역 조회
    getPaymentLogs: async () => {
        return apiClient.get('/api/v1/payments/paymentLog');
    },

    // 판매 수익 내역 조회
    getRevenueLogs: async () => {
        return apiClient.get('/api/v1/payments/revenueLog');
    }
};

export default paymentApi;
