
import apiClient from '../apiClient';

const orderApi = {
    // POST /api/v1/orders
    createOrder: async (data) => {
        // data structure: { cartItemIds: [], zipCode: '', baseAddress: '', detailAddress: '' }
        return apiClient.post('/api/v1/orders', data, { isCritical: true });
    },

    // POST /api/v1/orders/{orderId} (Cancel Order)
    cancelOrder: async (orderId) => {
        return apiClient.post(`/api/v1/orders/${orderId}`);
    }
};

export default orderApi;
