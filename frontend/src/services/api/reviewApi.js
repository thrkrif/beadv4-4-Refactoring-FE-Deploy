import apiClient from '../apiClient';

const STORAGE_KEY = 'thock_product_reviews_v1';
const USE_MOCK_REVIEW_API = import.meta.env.VITE_USE_MOCK_REVIEW_API !== 'false';

const safeParse = (raw) => {
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
};

const loadReviewMap = () => safeParse(localStorage.getItem(STORAGE_KEY));

const saveReviewMap = (reviewMap) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviewMap));
};

const toProductKey = (productId) => String(productId);

const normalizeReviewList = (raw) => {
    if (!Array.isArray(raw)) return [];
    return raw
        .filter((item) => item && typeof item === 'object')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const normalizeReviewResponse = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.content)) return response.content;
    if (Array.isArray(response?.reviews)) return response.reviews;
    return [];
};

const summarize = (reviewList) => {
    const reviews = normalizeReviewList(reviewList);
    const count = reviews.length;
    const averageRating = count
        ? reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / count
        : 0;

    return { averageRating, reviewCount: count };
};

const reviewApi = {
    async getProductReviews(productId) {
        if (!USE_MOCK_REVIEW_API) {
            return apiClient.get(`/api/v1/products/${productId}/reviews`);
        }

        const reviewMap = loadReviewMap();
        const productKey = toProductKey(productId);
        return normalizeReviewList(reviewMap[productKey] || []);
    },

    async createReview(productId, { rating, content, authorId, authorName }) {
        if (!USE_MOCK_REVIEW_API) {
            return apiClient.post(`/api/v1/products/${productId}/reviews`, {
                rating,
                content
            });
        }

        const normalizedRating = Number(rating);
        const normalizedContent = (content || '').trim();
        const isHalfStep = Number.isInteger(normalizedRating * 2);

        if (!isHalfStep || normalizedRating < 0.5 || normalizedRating > 5) {
            throw new Error('평점은 0.5점부터 5점까지 0.5점 단위로 선택해주세요.');
        }
        if (!normalizedContent) {
            throw new Error('리뷰 내용을 입력해주세요.');
        }

        const reviewMap = loadReviewMap();
        const productKey = toProductKey(productId);
        const currentReviews = normalizeReviewList(reviewMap[productKey] || []);

        const now = new Date().toISOString();
        const newReview = {
            id: Date.now(),
            productId: Number(productId),
            rating: normalizedRating,
            content: normalizedContent,
            authorId: authorId ?? null,
            authorName: authorName || '회원',
            createdAt: now,
            updatedAt: now
        };

        reviewMap[productKey] = [newReview, ...currentReviews];
        saveReviewMap(reviewMap);

        return newReview;
    },

    async deleteReview(productId, reviewId, { authorId } = {}) {
        if (!USE_MOCK_REVIEW_API) {
            return apiClient.delete(`/api/v1/products/${productId}/reviews/${reviewId}`);
        }

        const reviewMap = loadReviewMap();
        const productKey = toProductKey(productId);
        const currentReviews = normalizeReviewList(reviewMap[productKey] || []);
        const target = currentReviews.find((review) => String(review.id) === String(reviewId));

        if (!target) {
            throw new Error('삭제할 리뷰를 찾을 수 없습니다.');
        }
        if (target.authorId !== null && authorId !== null && String(target.authorId) !== String(authorId)) {
            throw new Error('본인이 작성한 리뷰만 삭제할 수 있습니다.');
        }

        reviewMap[productKey] = currentReviews.filter((review) => String(review.id) !== String(reviewId));
        saveReviewMap(reviewMap);
        return true;
    },

    async getProductReviewSummary(productId) {
        const reviews = await this.getProductReviews(productId);
        return summarize(normalizeReviewResponse(reviews));
    },

    async getProductReviewSummaryMap(productIds = []) {
        const ids = Array.from(new Set((productIds || []).map((id) => String(id))));
        if (!ids.length) return {};

        const summaryEntries = await Promise.all(
            ids.map(async (id) => {
                const summary = await this.getProductReviewSummary(id);
                return [id, summary];
            })
        );

        return Object.fromEntries(summaryEntries);
    }
};

export default reviewApi;
