
import apiClient from '../apiClient';

const orderApi = {
    // POST /api/v1/orders
    createOrder: async (data) => {
        // data structure: { cartItemIds: [], zipCode: '', baseAddress: '', detailAddress: '' }
        return apiClient.post('/api/v1/orders', data, { isCritical: true });
    },

    // POST /api/v1/orders/{orderId}/cancel (Cancel Order)
    cancelOrder: async (orderId, reasonType = 'CHANGE_OF_MIND', reasonDetail = '') => {
        return apiClient.post(`/api/v1/orders/${orderId}/cancel`, { cancelReasonType: reasonType, cancelReasonDetail: reasonDetail });
    },

    // POST /api/v1/orders/{orderId}/items/cancel (Partial Cancel)
    cancelOrderItem: async (orderId, orderItemIds, reasonType = 'CHANGE_OF_MIND', reasonDetail = '') => {
        const normalizedOrderItemIds = (orderItemIds || [])
            .map(id => Number(id))
            .filter(id => Number.isFinite(id));

        return apiClient.post(`/api/v1/orders/${orderId}/items/cancel`, {
            orderItemIds: normalizedOrderItemIds,
            cancelReasonType: reasonType,
            cancelReasonDetail: reasonDetail
        });
    },

    // GET /api/v1/orders (Order History)
    getMyOrders: async () => {
        return apiClient.get('/api/v1/orders');
    },

    // GET /api/v1/orders/{orderId} (Order Detail)
    getOrderDetail: async (orderId) => {
        return apiClient.get(`/api/v1/orders/${orderId}`);
    }
};

export default orderApi;
