import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

const CartItem = ({ item, onRemove, isSelected, onToggleSelect }) => {
    return (
        <div className="card" style={{ display: 'flex', padding: '15px', alignItems: 'center', gap: '20px' }}>
            <input 
                type="checkbox" 
                checked={isSelected}
                onChange={() => onToggleSelect(item.cartItemId)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-primary)', flexShrink: 0 }}
            />
            <div style={{ width: '80px', height: '80px', background: '#fff', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                <img
                    src={item.productImageUrl || 'https://placehold.co/100?text=Thock'}
                    alt="Product"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/100?text=${encodeURIComponent(item.productName)}`; }}
                />
            </div>

            <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '5px' }}>
                    <Link to={`/products/${item.productId}`}>{item.productName}</Link>
                </h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {item.salePrice ? item.salePrice.toLocaleString() : item.price.toLocaleString()}원 × {item.quantity}
                </div>
            </div>

            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                {(item.totalSalePrice || item.totalPrice).toLocaleString()}원
            </div>

            <button 
                onClick={() => onRemove(item.productId)}
                style={{ 
                    background: 'none', border: 'none', cursor: 'pointer', padding: '5px',
                    color: 'var(--text-secondary)', transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#FF4081'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                title="삭제"
            >
                <Trash2 size={20} />
            </button>
        </div>
    );
};

export default CartItem;
