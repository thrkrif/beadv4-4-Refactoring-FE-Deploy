import React, { useEffect, useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import reviewApi from '../../../services/api/reviewApi';
import { useAuth } from '../../../contexts/AuthContext';

const normalizeHalfRating = (value) => {
    const raw = Number(value) || 0;
    const clamped = Math.max(0.5, Math.min(5, raw));
    return Math.round(clamped * 2) / 2;
};

const getStarFillPercent = (rating, index) => {
    const diff = normalizeHalfRating(rating) - index;
    if (diff >= 1) return 100;
    if (diff >= 0.5) return 50;
    return 0;
};

const StarRatingDisplay = ({ rating, size = 20 }) => {
    const normalized = normalizeHalfRating(rating);
    return (
        <span style={{ display: 'inline-flex', gap: '2px', lineHeight: 1 }} aria-label={`${normalized.toFixed(1)}점`}>
            {Array.from({ length: 5 }).map((_, index) => {
                const fill = getStarFillPercent(normalized, index);
                return (
                    <span
                        key={index}
                        style={{
                            position: 'relative',
                            width: `${size}px`,
                            height: `${size}px`,
                            display: 'inline-flex'
                        }}
                    >
                        <Star
                            size={size}
                            strokeWidth={1.8}
                            color="#d1d5db"
                            fill="#e5e7eb"
                            style={{ position: 'absolute', inset: 0 }}
                        />
                        {fill > 0 && (
                            <span style={{ position: 'absolute', inset: 0, overflow: 'hidden', width: `${fill}%` }}>
                                <Star
                                    size={size}
                                    strokeWidth={1.8}
                                    color="#f5a524"
                                    fill="#f5a524"
                                    style={{ position: 'absolute', inset: 0 }}
                                />
                            </span>
                        )}
                    </span>
                );
            })}
        </span>
    );
};

const formatDate = (rawDate) => {
    if (!rawDate) return '';
    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) return '';
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};

const normalizeReviewResponse = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.content)) return response.content;
    if (Array.isArray(response?.reviews)) return response.reviews;
    return [];
};

const ReviewSection = ({ productId }) => {
    const { isLoggedIn, user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(null);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const averageRating = useMemo(() => {
        if (!reviews.length) return 0;
        const total = reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0);
        return total / reviews.length;
    }, [reviews]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await reviewApi.getProductReviews(productId);
            setReviews(normalizeReviewResponse(response));
            setErrorMessage('');
        } catch (error) {
            console.error(error);
            setErrorMessage('리뷰를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            setErrorMessage('로그인 후 리뷰를 작성할 수 있습니다.');
            return;
        }

        setSubmitting(true);
        setErrorMessage('');

        try {
            await reviewApi.createReview(productId, {
                rating,
                content,
                authorId: user?.memberId ?? null,
                authorName: user?.name || '회원'
            });
            setContent('');
            setRating(5);
            await fetchReviews();
        } catch (error) {
            console.error(error);
            setErrorMessage(error.message || '리뷰 등록 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reviewId) => {
        const confirmed = window.confirm('리뷰를 삭제하시겠습니까?');
        if (!confirmed) return;

        try {
            await reviewApi.deleteReview(productId, reviewId, {
                authorId: user?.memberId ?? null
            });
            await fetchReviews();
        } catch (error) {
            console.error(error);
            setErrorMessage(error.message || '리뷰 삭제 중 오류가 발생했습니다.');
        }
    };

    const calculateClickedRating = (event, starIndex) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const isLeftHalf = (event.clientX - rect.left) < rect.width / 2;
        return normalizeHalfRating(starIndex + (isLeftHalf ? 0.5 : 1));
    };

    return (
        <section style={{ marginTop: '40px', background: '#fff', borderRadius: '16px', border: '1px solid var(--border-subtle)', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>리뷰</h2>
                    <div style={{ color: 'var(--text-secondary)' }}>
                        {reviews.length > 0 ? `${averageRating.toFixed(1)} / 5.0 (${reviews.length}개)` : '아직 리뷰가 없습니다.'}
                    </div>
                </div>
                {reviews.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <StarRatingDisplay rating={averageRating} size={18} />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{averageRating.toFixed(1)}점</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)', minWidth: '42px' }}>평점</span>
                    <div
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                        onMouseLeave={() => setHoverRating(null)}
                    >
                        {Array.from({ length: 5 }).map((_, index) => {
                            const displayValue = hoverRating ?? rating;
                            const fill = getStarFillPercent(displayValue, index);
                            return (
                                <button
                                    key={index}
                                    type="button"
                                    disabled={!isLoggedIn || submitting}
                                    onMouseMove={(event) => setHoverRating(calculateClickedRating(event, index))}
                                    onClick={(event) => setRating(calculateClickedRating(event, index))}
                                    aria-label={`${index + 1}번째 별`}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        padding: 0,
                                        margin: 0,
                                        cursor: (!isLoggedIn || submitting) ? 'not-allowed' : 'pointer',
                                        lineHeight: 1
                                    }}
                                >
                                    <span style={{ position: 'relative', width: '28px', height: '28px', display: 'inline-flex' }}>
                                        <Star
                                            size={28}
                                            strokeWidth={1.8}
                                            color="#d1d5db"
                                            fill="#e5e7eb"
                                            style={{ position: 'absolute', inset: 0 }}
                                        />
                                        {fill > 0 && (
                                            <span style={{ position: 'absolute', inset: 0, overflow: 'hidden', width: `${fill}%` }}>
                                                <Star
                                                    size={28}
                                                    strokeWidth={1.8}
                                                    color="#f5a524"
                                                    fill="#f5a524"
                                                    style={{ position: 'absolute', inset: 0 }}
                                                />
                                            </span>
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={isLoggedIn ? '이 상품에 대한 리뷰를 남겨주세요.' : '로그인 후 리뷰 작성이 가능합니다.'}
                    rows={4}
                    disabled={!isLoggedIn || submitting}
                    style={{ width: '100%', resize: 'vertical', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary" disabled={!isLoggedIn || submitting}>
                        {submitting ? '등록 중...' : '리뷰 등록'}
                    </button>
                </div>
            </form>

            {errorMessage && (
                <div style={{ marginBottom: '16px', padding: '10px 12px', borderRadius: '8px', background: '#ffebee', color: '#c62828', fontSize: '0.9rem' }}>
                    {errorMessage}
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0' }}>리뷰를 불러오는 중...</div>
            ) : reviews.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0' }}>첫 번째 리뷰를 남겨보세요.</div>
            ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                    {reviews.map((review) => (
                        <article key={review.id} style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '14px 16px', background: 'var(--bg-primary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <strong style={{ fontSize: '0.95rem' }}>{review.authorName || '회원'}</strong>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <StarRatingDisplay rating={review.rating} size={15} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{formatDate(review.createdAt)}</span>
                                    {user?.memberId != null && String(user.memberId) === String(review.authorId) && (
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            style={{ background: 'transparent', border: 'none', color: 'var(--accent-secondary)', fontSize: '0.82rem', padding: 0 }}
                                        >
                                            삭제
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: '1.55', whiteSpace: 'pre-wrap' }}>{review.content}</p>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
};

export default ReviewSection;
