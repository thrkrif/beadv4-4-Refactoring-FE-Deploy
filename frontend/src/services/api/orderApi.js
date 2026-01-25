
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
    },

    // GET /api/v1/orders (Order History)
    getMyOrders: async () => {
        return apiClient.get('/api/v1/orders');
    }
};

export default orderApi;
