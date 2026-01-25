
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import productApi from '../../services/api/productApi';
import ProductForm from './Form';
import ProductItem from './components/ProductItem';

const ProductPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    // 백엔드는 category 파라미터가 필수이며 Enum (KEYBOARD, SWITCH 등)만 받음. ALL 지원 안 함.
    const category = searchParams.get('category') || 'KEYBOARD';
    const keyword = searchParams.get('keyword');

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = () => {
        setLoading(true);
        setError(null);
        // Backend currently has no "Get All" endpoint and only supports KEYBOARD.
        // So for "ALL" category, we fetch "KEYBOARD" products to show something.
        const fetchMethod = (category === 'ALL' && !keyword)
             ? productApi.getProducts('KEYBOARD')
             : (keyword ? productApi.searchProducts(keyword) : productApi.getProducts(category));
        fetchMethod.then(res => {
            // searchProducts returns List<ProductListResponse> (array)
            // getProducts returns Page<ProductListResponse> (object with content array)
            const content = Array.isArray(res) ? res : (res.content || []);
            setProducts(content);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setError(err);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchProducts();
    }, [category, keyword]);

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
                    <div className="grid-cols-3">
                        {products.map(product => (
                            <ProductItem key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );

};

export default ProductPage;
