import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import productApi from '../services/api/productApi';
import { Search, Star } from 'lucide-react';
import reviewApi from '../services/api/reviewApi';
import { getPriceInfo } from '../utils/price';

const HomePage = () => {
    const [featured, setFeatured] = useState([]);
    const [switches, setSwitches] = useState([]);
    const [reviewSummaryMap, setReviewSummaryMap] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const enrichWithSalePrice = async (items) => {
            const enriched = await Promise.all(
                (items || []).map(async (item) => {
                    try {
                        const detail = await productApi.getProductDetail(item.id);
                        return {
                            ...item,
                            salePrice: detail?.price ?? item.salePrice ?? item.price
                        };
                    } catch (error) {
                        console.error(`failed to fetch product detail: ${item.id}`, error);
                        return item;
                    }
                })
            );
            return enriched;
        };

        const fetchCategoryProducts = async (category, setter) => {
            try {
                const response = await productApi.getProducts(category, 0, 4);
                const enriched = await enrichWithSalePrice(response.content || []);
                if (isMounted) setter(enriched);
            } catch (error) {
                console.error(`failed to fetch ${category} products`, error);
                if (isMounted) setter([]);
            }
        };

        fetchCategoryProducts('KEYBOARD', setFeatured);
        fetchCategoryProducts('SWITCH', setSwitches);
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;
        const productIds = [...featured, ...switches].map((product) => product.id).filter(Boolean);
        if (!productIds.length) return;

        reviewApi.getProductReviewSummaryMap(productIds)
            .then((summaryMap) => {
                if (isMounted) {
                    setReviewSummaryMap(summaryMap);
                }
            })
            .catch((error) => {
                console.error('Failed to fetch review summary:', error);
            });

        return () => {
            isMounted = false;
        };
    }, [featured, switches]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/products?keyword=${encodeURIComponent(searchTerm)}`);
        }
    };

    const getSellerDisplayName = (product) => {
        const rawName = product?.sellerName || product?.memberName || product?.username || product?.nickname;
        if (!rawName) return '판매자';
        if (/^판매자\s*\d+$/i.test(rawName) || /^user\s*#?\s*\d+$/i.test(rawName)) return '판매자';
        return rawName;
    };

    const ProductCard = ({ product, compact = false }) => {
        const { originalPrice, salePrice, hasDiscount, discountRate } = getPriceInfo(product);

        return (
            <Link to={`/products/${product.id}`} state={{ product }} className="card" style={{ textDecoration: 'none', display: 'block', border: 'none', boxShadow: 'none', background: 'transparent', overflow: 'visible' }}>
                <div style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    position: 'relative',
                    paddingTop: compact ? '90%' : '100%',
                    background: '#f8f9fa',
                    marginBottom: compact ? '12px' : '16px'
                }}>
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            objectPosition: 'center',
                            padding: compact ? '8px' : '10px',
                            background: '#fff',
                            transition: 'transform 0.3s'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; }}
                    />
                    {product.stock < 5 && (
                        <div style={{
                            position: 'absolute', top: 12, left: 12,
                            background: 'rgba(255, 107, 107, 0.9)', color: '#fff',
                            padding: '4px 10px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 'bold'
                        }}>품절임박</div>
                    )}
                </div>
                <div>
                    <div style={{ fontSize: compact ? '0.75rem' : '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{product.category}</div>
                    <div style={{ marginBottom: compact ? '6px' : '8px' }}>
                        <h3 style={{ fontSize: compact ? '0.92rem' : '1rem', fontWeight: 600, lineHeight: '1.4', color: 'var(--text-primary)', margin: 0, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {product.name} - {getSellerDisplayName(product)}
                        </h3>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px' }}>
                        <div style={{ display: 'grid', gap: '2px', textAlign: 'left', minHeight: compact ? '58px' : '64px' }}>
                            <div style={{ fontSize: compact ? '0.74rem' : '0.8rem', color: 'var(--accent-secondary)', fontWeight: 700, visibility: hasDiscount ? 'visible' : 'hidden' }}>
                                할인율 {discountRate}%
                            </div>
                            <div style={{ fontSize: compact ? '0.72rem' : '0.78rem', color: 'var(--text-muted)', textDecoration: 'line-through', visibility: hasDiscount ? 'visible' : 'hidden', whiteSpace: 'nowrap' }}>
                                정가 {originalPrice.toLocaleString()}원
                            </div>
                            <div style={{ fontWeight: 800, fontSize: compact ? '1rem' : '1.1rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                                판매가 {salePrice.toLocaleString()}원
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: '#ffcc00',
                                fontWeight: 700,
                                fontSize: compact ? '0.72rem' : '0.78rem'
                            }}>
                                <Star size={compact ? 12 : 13} fill="currentColor" strokeWidth={1.8} />
                                {(reviewSummaryMap[String(product.id)]?.averageRating || 0).toFixed(1)}
                            </span>
                            <span style={{ fontSize: compact ? '0.72rem' : '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                리뷰 {reviewSummaryMap[String(product.id)]?.reviewCount || 0}개
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div>
            {/* Hero Section */}
            <section style={{
                height: '600px',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '60px',
                textAlign: 'center'
            }}>
                <div className="container" style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '800px', padding: '0 20px' }}>
                    <h2 style={{
                        fontSize: '3.5rem',
                        fontWeight: 900,
                        color: '#2d3436',
                        marginBottom: '10px',
                        lineHeight: 1.2,
                        letterSpacing: '-1px'
                    }}>
                        Find Your <span style={{ color: 'var(--accent-primary)', position: 'relative', display: 'inline-block' }}>
                            THOCK
                            <svg style={{ position: 'absolute', bottom: '5px', left: 0, width: '100%', height: '10px', zIndex: -1, opacity: 0.3 }} viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="var(--accent-primary)" strokeWidth="8" fill="none" />
                            </svg>
                        </span>
                    </h2>
                    <p style={{ fontSize: '1.25rem', color: '#636e72', marginBottom: '50px', fontWeight: '500' }}>
                        완벽한 타건감을 위한 프리미엄 커스텀 키보드 플랫폼
                    </p>

                    {/* Keyboard Search Bar */}
                    <form onSubmit={handleSearch} style={{
                        position: 'relative',
                        maxWidth: '600px',
                        margin: '0 auto',
                        background: '#fff',
                        borderRadius: '16px', // Rounded like a keycap top
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05), inset 0 -4px 0 rgba(0,0,0,0.05)', // Keycap-like shadow
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #e2e8f0',
                        transform: 'translateY(0)',
                        transition: 'transform 0.1s, box-shadow 0.1s'
                    }}
                        onMouseDown={(e) => {
                            e.currentTarget.style.transform = 'translateY(4px)';
                            e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05), inset 0 -1px 0 rgba(0,0,0,0.05)';
                        }}
                        onMouseUp={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.05), inset 0 -4px 0 rgba(0,0,0,0.05)';
                        }}>
                        <Search size={22} color="var(--text-secondary)" style={{ marginLeft: '15px' }} />
                        <input
                            type="text"
                            placeholder="어떤 키보드를 찾고 계신가요?"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                flex: 1,
                                border: 'none',
                                background: 'transparent',
                                padding: '15px 20px',
                                fontSize: '1.1rem',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                fontWeight: '500'
                            }}
                        />
                        <button type="submit" style={{
                            background: 'var(--accent-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '12px 24px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            boxShadow: '0 4px 10px rgba(0, 196, 180, 0.3)'
                        }}>
                            Enter
                        </button>
                    </form>

                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {['Q', 'W', 'E', 'R', 'T', 'Y'].map(key => (
                            <div key={key} style={{
                                width: '40px', height: '40px',
                                background: 'rgba(255,255,255,0.5)',
                                borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#94a3b8', fontWeight: 'bold',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                            }}>
                                {key}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Decorative Background Elements - Abstract Switches/Keys */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
                    <div style={{ position: 'absolute', top: '10%', left: '5%', width: '100px', height: '100px', background: 'var(--accent-primary)', opacity: 0.1, borderRadius: '20px', transform: 'rotate(-15deg)' }}></div>
                    <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: '150px', height: '150px', background: 'var(--accent-secondary)', opacity: 0.05, borderRadius: '30px', transform: 'rotate(10deg)' }}></div>
                    <div style={{ position: 'absolute', top: '20%', right: '20%', width: '60px', height: '60px', border: '4px solid #cbd5e1', opacity: 0.3, borderRadius: '12px', transform: 'rotate(25deg)' }}></div>
                    <div style={{ position: 'absolute', bottom: '30%', left: '15%', width: '80px', height: '80px', background: '#94a3b8', opacity: 0.1, borderRadius: '50%' }}></div>
                </div>
            </section>

            {/* Featured Section */}
            <section className="container" style={{ marginBottom: '80px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '30px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', fontWeight: '700' }}>새로 들어온 키보드</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>가장 핫한 신상 키보드를 만나보세요.</p>
                    </div>
                    <Link to="/products?category=KEYBOARD" className="btn-more-link">더보기</Link>
                </div>

                <div className="grid-cols-5-featured">
                    {featured.map(product => (
                        <ProductCard key={product.id} product={product} compact />
                    ))}
                </div>
            </section>

            {/* Switches Section */}
            <section className="container" style={{ marginBottom: '100px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '30px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', fontWeight: '700' }}>인기 스위치</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>타건감의 핵심, 다양한 스위치 컬렉션.</p>
                    </div>
                    <Link to="/products?category=SWITCH" className="btn-more-link">더보기</Link>
                </div>

                <div className="grid-cols-4">
                    {switches.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
