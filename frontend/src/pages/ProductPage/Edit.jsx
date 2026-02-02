
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import productApi from '../../services/api/productApi';

const ProductEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        salePrice: '',
        stock: '',
        category: 'KEYBOARD',
        description: '',
        imageUrl: '',
        detail: {}
    });

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await productApi.getProductDetail(id);
                // Map API response to form data
                setFormData({
                    name: res.name || '',
                    price: res.price || '',
                    salePrice: res.salePrice || res.price || '',
                    stock: res.stock || '',
                    category: res.category || 'KEYBOARD',
                    description: res.description || '',
                    imageUrl: res.imageUrl || '',
                    detail: res.detail || {}
                });
            } catch (err) {
                console.error('Fetch error:', err);
                setErrorMessage('상품 정보를 불러오는 데 실패했습니다.');
            } finally {
                setIsFetching(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await productApi.updateProduct(id, {
                ...formData,
                price: Number(formData.price),
                salePrice: Number(formData.salePrice || formData.price),
                stock: Number(formData.stock),
            });
            alert('상품 정보가 수정되었습니다.');
            navigate('/mypage'); // Redirect back to MyPage
        } catch (error) {
            console.error(error);
            setErrorMessage('상품 수정에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) return (
        <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
            데이터를 불러오는 중...
        </div>
    );

    return (
        <div className="container" style={{ padding: '40px 0', maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem' }}>상품 정보 수정</h1>
                <button onClick={() => navigate('/mypage')} className="btn btn-outline" style={{ padding: '8px 20px' }}>취소</button>
            </div>
            
            {errorMessage && (
                <div style={{ padding: '15px', color: '#FF4081', background: 'rgba(255, 64, 129, 0.1)', borderRadius: '8px', marginBottom: '20px' }}>
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'grid', gap: '20px' }}>
                    
                    {/* Name */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>상품명</label>
                        <input name="name" value={formData.name} onChange={handleChange} required 
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'white' }} />
                    </div>

                    {/* Category */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>카테고리</label>
                        <select name="category" value={formData.category} onChange={handleChange}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'white' }}>
                            <option value="KEYBOARD">키보드</option>
                            <option value="KEYCAP">키캡</option>
                            <option value="SWITCH">스위치</option>
                        </select>
                    </div>

                    {/* Prices */}
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px' }}>정가</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required 
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'white' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px' }}>판매가 (할인가)</label>
                            <input type="number" name="salePrice" value={formData.salePrice} onChange={handleChange} 
                                placeholder="비워두면 정가와 동일"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'white' }} />
                        </div>
                    </div>

                    {/* Stock */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>재고 수량</label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleChange} required 
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'white' }} />
                    </div>

                    {/* Image URL */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>이미지 URL</label>
                        <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://..."
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'white' }} />
                    </div>

                    {/* Description */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>상세 설명</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={5}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'white' }} />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ marginTop: '20px', padding: '15px' }}>
                        {isLoading ? '수정 중...' : '상품 정보 수정하기'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductEditPage;
