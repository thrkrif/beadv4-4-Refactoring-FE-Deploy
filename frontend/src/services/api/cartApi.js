
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

    // DELETE /api/v1/carts/items/{id} (Not implemented in Backend MVP)
    removeCartItem: async (itemId) => {
        console.warn('Remove Cart Item: Not implemented in Backend MVP');
        // throw new Error('상품 삭제 기능은 아직 지원되지 않습니다.');
        return { success: false, message: '기능 준비 중입니다.' };
    },

    // Clear Cart (Helper - Local only or implement clear API if exists)
    clearCart: () => {
        // If backend has clear API, call it. Otherwise just local cleanup if needed?
        // Currently backend clears cart on Order creation automatically.
        // Explicit clear might not be supported.
    }
};

export default cartApi;
