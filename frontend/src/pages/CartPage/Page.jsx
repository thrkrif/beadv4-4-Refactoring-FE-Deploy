
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import cartApi from '../../services/api/cartApi';
import CartItem from './components/CartItem';
import { AlertCircle } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

const CartPage = () => {
    const [basket, setBasket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const { updateCartCount } = useCart();

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = () => {
        setLoading(true);
        cartApi.getCart().then(res => {
            const data = res;
            setBasket({
                items: data.items || [],
                totalAmount: data.totalSalePrice || data.totalPrice || 0
            });
            setSelectedIds([]); // Reset selection on reload
            updateCartCount(); // Sync Header
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    const handleToggleSelect = (cartItemId) => {
        setSelectedIds(prev =>
            prev.includes(cartItemId)
                ? prev.filter(id => id !== cartItemId)
                : [...prev, cartItemId]
        );
    };

    const handleToggleAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(basket.items.map(item => item.cartItemId));
        } else {
            setSelectedIds([]);
        }
    };

    const handleRemoveSelected = () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`선택한 ${selectedIds.length}개 상품을 삭제하시겠습니까?`)) return;

        cartApi.removeCartItems(selectedIds).then(() => {
            loadCart();
            updateCartCount();
        }).catch(err => {
            console.error('Failed to remove selected items:', err);
            alert('상품 삭제에 실패했습니다.');
        });
    };

    const handleRemoveItem = (cartItemId) => {
        cartApi.removeCartItems([cartItemId]).then(() => {
            loadCart();
            updateCartCount();
        }).catch(err => {
            console.error('Failed to remove item:', err);
            alert('상품 삭제에 실패했습니다.');
        });
    };

    const handleClearCart = () => {
        if (!window.confirm('장바구니를 모두 비우시겠습니까?')) return;
        cartApi.clearCart().then(() => {
            loadCart();
            updateCartCount();
        }).catch(err => {
            console.error('Failed to clear cart:', err);
            alert('장바구니 비우기에 실패했습니다.');
        });
    };

    if (loading) return <div className="container" style={{ padding: '50px', textAlign: 'center' }}>장바구니 로딩 중...</div>;

    if (!basket || !basket.items || basket.items.length === 0) {
        return (
            <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
                <div style={{ marginBottom: '20px' }}>
                    <AlertCircle size={60} color="var(--text-muted)" />
                </div>
                <h2>장바구니가 비어있습니다.</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
                    아직 담은 상품이 없습니다.
                </p>
                <Link to="/products" className="btn btn-primary">
                    쇼핑하러 가기
                </Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem' }}>장바구니</h1>
                <button
                    onClick={handleClearCart}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
                >
                    장바구니 전체 비우기
                </button>
            </div>

            {/* Selection Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.95rem' }}>
                    <input
                        type="checkbox"
                        checked={basket.items.length > 0 && selectedIds.length === basket.items.length}
                        onChange={handleToggleAll}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                    />
                    <span>전체 선택 ({selectedIds.length}/{basket.items.length})</span>
                </label>
                <button
                    onClick={handleRemoveSelected}
                    disabled={selectedIds.length === 0}
                    style={{
                        background: 'none', border: '1px solid var(--border-subtle)',
                        padding: '6px 15px', borderRadius: '8px', fontSize: '0.85rem',
                        color: selectedIds.length > 0 ? '#FF4081' : 'var(--text-secondary)',
                        cursor: selectedIds.length > 0 ? 'pointer' : 'not-allowed',
                        opacity: selectedIds.length > 0 ? 1 : 0.5,
                        transition: 'all 0.2s'
                    }}
                >
                    선택 삭제
                </button>
            </div>

            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                {/* Cart Items */}
                <div style={{ flex: 2, minWidth: '300px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {basket.items.map((item) => (
                            <CartItem
                                key={item.cartItemId}
                                item={item}
                                onRemove={handleRemoveItem}
                                isSelected={selectedIds.includes(item.cartItemId)}
                                onToggleSelect={handleToggleSelect}
                            />
                        ))}
                    </div>
                </div>

                {/* Summary */}
                <div style={{ flex: 1, minWidth: '280px' }}>
                    <div className="card" style={{ padding: '30px', position: 'sticky', top: '100px' }}>
                        <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '15px' }}>결제 상세</h3>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--text-secondary)' }}>
                            <span>상품 금액</span>
                            <span>{basket.totalAmount.toLocaleString()}원</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', color: 'var(--text-secondary)' }}>
                            <span>배송비</span>
                            <span>무료</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            <span>총 결제금액</span>
                            <span style={{ color: 'var(--accent-primary)' }}>{basket.totalAmount.toLocaleString()}원</span>
                        </div>

                        <Link to="/orders/new" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', textAlign: 'center', textDecoration: 'none' }}>
                            주문하기
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
