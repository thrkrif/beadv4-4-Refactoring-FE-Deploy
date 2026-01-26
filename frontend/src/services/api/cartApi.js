
import apiClient from '../apiClient';

const cartApi = {
    // GET /api/v1/carts
    getCart: async () => {
        return apiClient.get('/api/v1/carts');
    },

    // POST /api/v1/carts/items
    addToCart: async (productId, quantity) => {
        return apiClient.post('/api/v1/carts/items', { productId, quantity });
    },

    // PATCH /api/v1/carts/items/{id} (Not implemented in Backend MVP)
    updateCartItem: async (itemId, quantity) => {
        console.warn('Update Cart Item: Not implemented in Backend MVP');
        // throw new Error('수량 변경 기능은 아직 지원되지 않습니다.');
        return { success: false, message: '기능 준비 중입니다.' };
    },

    // DELETE /api/v1/carts/items
    removeCartItems: async (cartItemIds) => {
        // cartItemIds: [1, 2, 3]
        return apiClient.request('/api/v1/carts/items', {
            method: 'DELETE',
            body: JSON.stringify(cartItemIds)
        });
    },

    // Clear Cart (Helper to call the same delete endpoint with empty list)
    clearCart: async () => {
        return apiClient.request('/api/v1/carts/items', {
            method: 'DELETE',
            body: JSON.stringify([])
        });
    }
};

export default cartApi;
