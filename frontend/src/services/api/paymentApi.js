
import apiClient from '../apiClient';

const paymentApi = {
    // POST /api/v1/payments/confirm/toss
    confirmPayment: async (paymentKey, orderId, amount) => {
        return apiClient.post('/api/v1/payments/confirm/toss', {
            paymentKey,
            orderId,
            amount: Number(amount)
        });
    }
};

export default paymentApi;
