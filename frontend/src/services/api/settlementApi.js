import apiClient from '../apiClient';

const settlementApi = {
    // Legacy endpoint
    getSettlementHistory: async () => {
        return apiClient.get('/api/v1/settlements');
    },

    // GET /api/v1/finance/settlement/query/monthly?sellerId=1&targetMonth=2026-02
    getMonthlySummary: async ({ sellerId, targetMonth }) => {
        return apiClient.get('/api/v1/finance/settlement/query/monthly', {
            params: { sellerId, targetMonth }
        });
    },

    // GET /api/v1/finance/settlement/query/daily-items?sellerId=1&targetDate=2026-02-14
    getDailyItems: async ({ sellerId, targetDate }) => {
        return apiClient.get('/api/v1/finance/settlement/query/daily-items', {
            params: { sellerId, targetDate }
        });
    }
};

export default settlementApi;
