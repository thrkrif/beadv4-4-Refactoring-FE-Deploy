
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import productApi from '../services/api/productApi';

const HomePage = () => {
    const [featured, setFeatured] = useState([]);

    useEffect(() => {
        // 백엔드 제약으로 'KEYBOARD' 카테고리의 최신 상품을 가져옵니다. 3개만 
        productApi.getProducts('KEYBOARD', 0, 3).then(res => {
            const content = res.content || [];
            setFeatured(content);
        }).catch(err => console.error('HomePage Fetch Error:', err));
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <section style={{
                height: '70vh',
                background: 'radial-gradient(circle at center, #2C2C2C 0%, #121212 70%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', textShadow: '0 0 20px rgba(0,229,255,0.3)', fontWeight: '800' }}>
                    완벽한 타건감, 당신만의 <span style={{ color: 'var(--accent-primary)' }}>THOCK</span>
                </h1>
                <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', maxWidth: '800px', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                    커스텀 키보드부터 전문가용 스위치, 프리미엄 키캡까지.<br />
                    키보드 애호가들을 위한 전문 이커머스 플랫폼 Thock입니다.
                </p>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <Link to="/products" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1.2rem 2.5rem', borderRadius: '50px' }}>
                        쇼핑 시작하기
                    </Link>
                    <Link to="/products?category=KEYBOARD" className="btn btn-outline" style={{ fontSize: '1.1rem', padding: '1.2rem 2.5rem', borderRadius: '50px' }}>
                        키보드 보러가기
                    </Link>
                </div>
            </section>

            {/* Featured Section */}
            <section className="container" style={{ padding: '80px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h2>신규 입고 상품</h2>
                    <Link to="/products" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>전체 보기 &rarr;</Link>
                </div>

                <div className="grid-cols-3">
                    {featured.map(product => (
                        <Link to={`/products/${product.id}`} key={product.id} className="card" style={{ textDecoration: 'none' }}>
                            <div style={{ height: '240px', overflow: 'hidden', background: '#fff', position: 'relative' }}>
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; }}
                                />
                                {product.stock < 5 && (
                                    <div style={{
                                        position: 'absolute', top: 10, left: 10,
                                        background: 'rgba(0,0,0,0.7)', color: 'var(--accent-secondary)',
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'
                                    }}>품절 임박</div>
                                )}
                            </div>
                            <div style={{ padding: '20px' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{product.category}</div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', lineHeight: '1.4' }}>{product.name}</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{product.price.toLocaleString()}원</span>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{product.nickname}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
