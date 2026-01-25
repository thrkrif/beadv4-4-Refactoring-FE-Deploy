import apiClient from '../apiClient';

const settlementApi = {
    // GET /api/v1/settlements
    getSettlementHistory: async () => {
        return apiClient.get('/api/v1/settlements');
    }
};

export default settlementApi;
