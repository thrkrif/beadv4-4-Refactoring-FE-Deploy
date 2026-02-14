
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import productApi from '../../services/api/productApi';
import reviewApi from '../../services/api/reviewApi';
import ProductForm from './Form';
import ProductItem from './components/ProductItem';

const PAGE_SIZE = 12;

const ProductPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    // 백엔드는 category 파라미터가 필수이며 Enum (KEYBOARD, SWITCH 등)만 받음. ALL 지원 안 함.
    const category = searchParams.get('category') || 'KEYBOARD';
    const keyword = searchParams.get('keyword');

    const [products, setProducts] = useState([]);
    const [reviewSummaryMap, setReviewSummaryMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const loadMoreRef = useRef(null);
    const loadingMoreRef = useRef(false);
    const isSearchMode = Boolean(keyword);

    const fetchProducts = async ({ nextPage = 0, reset = false } = {}) => {
        if (!reset && loadingMoreRef.current) return;

        if (reset) {
            setLoading(true);
            setError(null);
        } else {
            loadingMoreRef.current = true;
            setIsLoadingMore(true);
        }

        try {
            // Backend currently has no "Get All" endpoint and only supports KEYBOARD.
            // So for "ALL" category, we fetch "KEYBOARD" products to show something.
            const targetCategory = category === 'ALL' ? 'KEYBOARD' : category;
            const res = isSearchMode
                ? await productApi.searchProducts(keyword)
                : await productApi.getProducts(targetCategory, nextPage, PAGE_SIZE);

            // searchProducts returns List<ProductListResponse> (array)
            // getProducts returns Page<ProductListResponse> (object with content array)
            const content = Array.isArray(res) ? res : (res.content || []);

            const enrichedProducts = await Promise.all(
                content.map(async (item) => {
                    try {
                        const detail = await productApi.getProductDetail(item.id);
                        return {
                            ...item,
                            salePrice: detail?.price ?? item.salePrice ?? item.price
                        };
                    } catch (detailError) {
                        console.error(`failed to fetch product detail: ${item.id}`, detailError);
                        return item;
                    }
                })
            );

            const productIds = enrichedProducts.map((item) => item.id).filter(Boolean);
            const summaryMap = await reviewApi.getProductReviewSummaryMap(productIds);

            if (reset) {
                setProducts(enrichedProducts);
                setReviewSummaryMap(summaryMap || {});
            } else {
                setProducts((prev) => {
                    const prevIds = new Set(prev.map((item) => String(item.id)));
                    const appended = enrichedProducts.filter((item) => !prevIds.has(String(item.id)));
                    return [...prev, ...appended];
                });
                setReviewSummaryMap((prev) => ({ ...prev, ...(summaryMap || {}) }));
            }

            if (isSearchMode) {
                setPage(0);
                setHasMore(false);
            } else {
                const isLastPage = Boolean(res?.last);
                const totalPages = Number(res?.totalPages || 0);
                const fallbackLast = content.length < PAGE_SIZE;
                const resolvedLast = Number.isFinite(totalPages) && totalPages > 0
                    ? nextPage + 1 >= totalPages
                    : (res?.last !== undefined ? isLastPage : fallbackLast);
                setHasMore(!resolvedLast);
                setPage(nextPage);
            }
        } catch (err) {
            console.error(err);
            setError(err);
        } finally {
            if (reset) {
                setLoading(false);
            } else {
                loadingMoreRef.current = false;
                setIsLoadingMore(false);
            }
        }
    };

    useEffect(() => {
        setProducts([]);
        setReviewSummaryMap({});
        setPage(0);
        setHasMore(true);
        fetchProducts({ nextPage: 0, reset: true });
    }, [category, keyword]);

    useEffect(() => {
        if (isSearchMode || !hasMore || loading || isLoadingMore || error) return;
        const target = loadMoreRef.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loadingMoreRef.current) {
                    fetchProducts({ nextPage: page + 1, reset: false });
                }
            },
            { root: null, rootMargin: '220px 0px', threshold: 0.01 }
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, [page, hasMore, loading, isLoadingMore, isSearchMode, error]);

    const handleCategoryChange = (catId) => {
        setSearchParams({ category: catId });
    };

    return (
        <div className="container" style={{ padding: '40px 20px', display: 'flex', gap: '40px' }}>
            <ProductForm currentCategory={category} onCategoryChange={handleCategoryChange} />

            <main style={{ flex: 1 }}>
                <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ textTransform: 'capitalize' }}>
                        {/* Simple mapping for title, ideally pass map from Form or utils */}
                        {keyword ? `'${keyword}' 검색 결과` :
                            category === 'ALL' ? '전체 상품' :
                                category === 'KEYBOARD' ? '키보드' :
                                    category === 'SWITCH' ? '스위치' :
                                        category === 'KEYCAP' ? '키캡' : '액세서리'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>총 {products.length}개의 상품</p>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>로딩 중...</div>
                ) : error ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-danger)' }}>
                        <p>상품을 불러오는 중 오류가 발생했습니다.</p>
                        <button onClick={fetchProducts} className="btn btn-primary" style={{ marginTop: '10px' }}>다시 시도</button>
                    </div>
                ) : (
                    <>
                        <div className="grid-cols-3">
                            {products.map(product => (
                                <ProductItem
                                    key={product.id}
                                    product={product}
                                    reviewSummary={reviewSummaryMap[String(product.id)]}
                                />
                            ))}
                        </div>

                        {!isSearchMode && (
                            <div ref={loadMoreRef} style={{ padding: '20px 0 10px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                {isLoadingMore ? '상품을 더 불러오는 중...' : (hasMore ? '스크롤하면 더 불러옵니다.' : '모든 상품을 불러왔습니다.')}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );

};

export default ProductPage;
