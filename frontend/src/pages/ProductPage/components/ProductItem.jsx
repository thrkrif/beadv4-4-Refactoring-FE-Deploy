
import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { getPriceInfo } from '../../../utils/price';

const ProductItem = ({ product, reviewSummary }) => {
    const { originalPrice, salePrice, hasDiscount, discountRate } = getPriceInfo(product);
    const averageRating = reviewSummary?.averageRating || 0;
    const reviewCount = reviewSummary?.reviewCount || 0;

    const getSellerDisplayName = (item) => {
        const rawName = item?.sellerName || item?.memberName || item?.username || item?.name || item?.nickname;
        if (!rawName) return '판매자';
        if (/^판매자\s*\d+$/i.test(rawName) || /^user\s*#?\s*\d+$/i.test(rawName)) return '판매자';
        return rawName;
    };

    return (
        <Link to={`/products/${product.id}`} state={{ product }} className="card" style={{ textDecoration: 'none' }}>
            <div style={{ height: '240px', overflow: 'hidden', background: '#f8f9fa' }}>
                <img
                    src={product.imageUrl || `https://placehold.co/300x200?text=${product.name}`}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', padding: '10px', background: '#fff' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/300x200?text=${encodeURIComponent(product.name)}`; }}
                />
            </div>
            <div style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{product.category}</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', height: '44px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {product.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginBottom: '8px' }}>
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#ffcc00',
                        fontWeight: 700,
                        fontSize: '0.78rem'
                    }}>
                        <Star size={13} fill="currentColor" strokeWidth={1.8} />
                        {averageRating.toFixed(1)}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        리뷰 {reviewCount}개
                    </span>
                </div>
                <div style={{ display: 'grid', gap: '2px', marginBottom: '6px' }}>
                    {hasDiscount && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', fontWeight: 700 }}>
                            할인율 {discountRate}%
                        </span>
                    )}
                    {hasDiscount && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                            정가 {originalPrice.toLocaleString()}원
                        </span>
                    )}
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                        판매가 {salePrice.toLocaleString()}원
                    </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{getSellerDisplayName(product)}</span>
            </div>
        </Link>
    );
};

export default ProductItem;
