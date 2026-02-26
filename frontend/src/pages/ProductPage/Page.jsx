
import React, { useEffect, useState } from 'react';
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
    const currentPage = Math.max(0, Number(searchParams.get('page') || 0));

    const [products, setProducts] = useState([]);
    const [reviewSummaryMap, setReviewSummaryMap] = useState({});
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchInput, setSearchInput] = useState(keyword || '');
    const isSearchMode = Boolean(keyword);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const targetCategory = category === 'ALL' ? 'KEYBOARD' : category;
            const res = isSearchMode
                ? await productApi.searchProducts(keyword)
                : await productApi.getProducts(targetCategory, currentPage, PAGE_SIZE);

            const content = Array.isArray(res) ? res : (res.content || []);
            setProducts(content);

            const productIds = content.map((item) => item.id).filter(Boolean);
            const summaryMap = productIds.length > 0
                ? await reviewApi.getProductReviewSummaryMap(productIds)
                : {};
            setReviewSummaryMap(summaryMap || {});

            if (isSearchMode) {
                setTotalElements(content.length);
                setTotalPages(1);
            } else {
                const resolvedTotalPages = Math.max(1, Number(res?.totalPages || 1));
                const resolvedTotalElements = Number.isFinite(Number(res?.totalElements))
                    ? Number(res.totalElements)
                    : content.length;
                setTotalPages(resolvedTotalPages);
                setTotalElements(resolvedTotalElements);
            }
        } catch (err) {
            console.error(err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [category, keyword, currentPage]);

    useEffect(() => {
        setSearchInput(keyword || '');
    }, [keyword]);

    const handleCategoryChange = (catId) => {
        setSearchParams({ category: catId, page: '0' });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const trimmedKeyword = searchInput.trim();
        if (!trimmedKeyword) {
            setSearchParams({ category, page: '0' });
            return;
        }
        setSearchParams({ keyword: trimmedKeyword, page: '0' });
    };

    const handleMovePage = (nextPage) => {
        if (nextPage < 0 || nextPage >= totalPages) return;
        if (isSearchMode) return;
        setSearchParams({ category, page: String(nextPage) });
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
                    <p style={{ color: 'var(--text-secondary)' }}>총 {totalElements}개의 상품</p>
                    <form onSubmit={handleSearchSubmit} style={{ marginTop: '12px', display: 'flex', gap: '10px', maxWidth: '520px' }}>
                        <input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="상품명으로 검색"
                            style={{ flex: 1, padding: '10px 12px', border: '1px solid var(--border-subtle)', borderRadius: '8px', background: '#fff' }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }}>
                            검색
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>로딩 중...</div>
                ) : error ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-danger)' }}>
                        <p>상품을 불러오는 중 오류가 발생했습니다.</p>
                        <button onClick={() => fetchProducts()} className="btn btn-primary" style={{ marginTop: '10px' }}>다시 시도</button>
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
                            <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => handleMovePage(currentPage - 1)}
                                    disabled={currentPage <= 0}
                                    style={{ padding: '8px 12px', opacity: currentPage <= 0 ? 0.5 : 1 }}
                                >
                                    이전
                                </button>
                                <span style={{ color: 'var(--text-secondary)', minWidth: '80px', textAlign: 'center' }}>
                                    {currentPage + 1} / {totalPages}
                                </span>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => handleMovePage(currentPage + 1)}
                                    disabled={currentPage + 1 >= totalPages}
                                    style={{ padding: '8px 12px', opacity: currentPage + 1 >= totalPages ? 0.5 : 1 }}
                                >
                                    다음
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );

};

export default ProductPage;
