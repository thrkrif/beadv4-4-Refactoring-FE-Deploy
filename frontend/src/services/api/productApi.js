
import apiClient from '../apiClient';

/**
 * Product API Service
 * Mirrors ApiV1ProductController
 */
const productApi = {
    /**
     * Get Product List (Paginated)
     * GET /api/v1/products?category=...&page=...&size=...&sort=...
     * @param {string} category - KEYBOARD, KEYCAP, SWITCH, etc.
     * @param {number} page - 0-indexed
     * @param {number} size 
     */
    getProducts: async (category = 'KEYBOARD', page = 0, size = 10) => {
        const params = { page, size, sort: 'id,desc' };
        if (category && category !== 'ALL') {
            params.category = category;
        }
        return apiClient.get('/api/v1/products', { params });
    },

    /**
     * Get Product Detail
     * GET /api/v1/products/{id}
     * @param {number} id 
     */
    getProductDetail: async (id) => {
        return apiClient.get(`/api/v1/products/${id}`);
    },

    /**
     * Create Product (Seller)
     * POST /api/v1/products
     */
    createProduct: async (productData) => {
        return apiClient.post('/api/v1/products', productData);
    },

    /**
     * Update Product (Seller)
     * PUT /api/v1/products/{id}
     */
    updateProduct: async (id, productData) => {
        return apiClient.put(`/api/v1/products/${id}`, productData);
    },

    /**
     * Delete Product (Seller/Admin)
     * DELETE /api/v1/products/{id}
     */
    deleteProduct: async (id) => {
        return apiClient.delete(`/api/v1/products/${id}`);
    },

    /**
     * Search Products
     * GET /api/v1/products/search?keyword=...
     */
    searchProducts: async (keyword) => {
        return apiClient.get('/api/v1/products/search', { params: { keyword } });
    },

    /**
     * Get My Products (Seller)
     * GET /api/v1/products/me
     */
    getMyProducts: async (page = 0, size = 10) => {
        return apiClient.get('/api/v1/products/me', { params: { page, size } });
    }
};

export default productApi;
