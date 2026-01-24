
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import productApi from '../../services/api/productApi';

const ProductCreatePage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        salePrice: '',
        stock: '',
        category: 'KEYBOARD', // Default
        description: '',
        imageUrl: '',
        detail: {} // Empty map for now
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await productApi.createProduct({
                ...formData,
                price: Number(formData.price),
                salePrice: Number(formData.salePrice || formData.price),
                stock: Number(formData.stock),
            });
            alert('상품이 등록되었습니다.');
            navigate('/products');
        } catch (error) {
            console.error(error);
            alert('상품 등록에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '40px 0', maxWidth: '800px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '30px' }}>상품 등록</h1>
            
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
                        {isLoading ? '등록 중...' : '상품 등록하기'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductCreatePage;
