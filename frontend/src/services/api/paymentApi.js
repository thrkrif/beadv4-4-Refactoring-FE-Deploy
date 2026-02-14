
import apiClient from '../apiClient';

const paymentApi = {
    // POST /api/v1/payments/confirm/toss
    confirmToss: async (paymentKey, orderId, amount) => {
        console.log('🚀 토스 결제 승인 API 호출:', { paymentKey, orderId, amount: Number(amount) });
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
    },

    // 출금 신청
    requestWithdrawal: async (amount) => {
        // 백엔드가 단순 Long 타입의 값을 Body로 받도록 되어 있음 (JSON 객체가 아님)
        // 하지만 axios/apiClient가 기본적으로 JSON으로 직렬화할 수 있으므로 
        // Content-Type 헤더와 함께 적절히 보내야 함.
        // 백엔드 컨트롤러: @RequestBody Long amount
        return apiClient.post('/api/v1/payments/withdraw', amount, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};

export default paymentApi;
