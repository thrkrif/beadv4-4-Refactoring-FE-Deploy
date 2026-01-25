
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cartApi from '../../services/api/cartApi';
import orderApi from '../../services/api/orderApi';

const OrderPage = () => {
    const navigate = useNavigate();
    const [cartData, setCartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        zipCode: '',
        baseAddress: '',
        detailAddress: ''
    });

    useEffect(() => {
        // Fetch cart items to display what's being ordered
        cartApi.getCart().then(res => {
            // Mapping backend response
            const data = res; 
            setCartData({
                items: data.items || [],
                totalAmount: data.totalSalePrice || data.totalPrice || 0
            });
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
            alert('장바구니 정보를 불러오는데 실패했습니다.');
            navigate('/cart');
        });
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!cartData || cartData.items.length === 0) {
            alert('주문할 상품이 없습니다.');
            return;
        }

        if (!confirm('주문하시겠습니까?')) return;

        try {
            const orderRequest = {
                cartItemIds: cartData.items.map(item => item.cartItemId),
                zipCode: formData.zipCode,
                baseAddress: formData.baseAddress,
                detailAddress: formData.detailAddress
            };

                        // 1. Create Order
            const response = await orderApi.createOrder(orderRequest);
            const orderId = response.orderNumber || response.data?.orderNumber;
            const amount = response.totalSalePrice || response.data?.totalSalePrice;
            const orderName = `주문번호 ${orderId}`;

            // 2. Request Payment via Toss
            const clientKey = "test_ck_ORzdMaqN3wONXJBEp1bg35AkYXQG"; // Test Key
            const tossPayments = window.TossPayments(clientKey);

            await tossPayments.requestPayment("카드", {
                amount,
                orderId,
                orderName,
                successUrl: `${window.location.origin}/payment/success`, // Use correct success route
                failUrl: `${window.location.origin}/payment/fail`
            });

        } catch (error) {
            console.error(error);
            alert('주문 또는 결제 요청 중 오류가 발생했습니다.');
        }
    };

    if (loading) return <div className="container" style={{ padding: '50px', textAlign: 'center' }}>로딩 중...</div>;

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '30px' }}>주문 / 결제</h1>

            <div style={{ display: 'grid', gap: '30px' }}>
                {/* Order Summary */}
                <div className="card" style={{ padding: '20px' }}>
                    <h3 style={{ marginBottom: '15px' }}>주문 상품 ({cartData.items.length}개)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {cartData.items.map(item => (
                            <div key={item.cartItemId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                <span>{item.productName} x {item.quantity}</span>
                                <span>{(item.totalSalePrice || item.totalPrice).toLocaleString()}원</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        <span>총 결제금액</span>
                        <span style={{ color: 'var(--accent-primary)' }}>{cartData.totalAmount.toLocaleString()}원</span>
                    </div>
                </div>

                {/* Delivery Info Form */}
                <form onSubmit={handleSubmit} className="card" style={{ padding: '30px' }}>
                    <h3 style={{ marginBottom: '20px' }}>배송지 정보</h3>
                    
                    <div style={{ display: 'grid', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>우편번호</label>
                            <input name="zipCode" value={formData.zipCode} onChange={handleChange} required placeholder="00000"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'white' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>기본 주소</label>
                            <input name="baseAddress" value={formData.baseAddress} onChange={handleChange} required placeholder="서울시 강남구..."
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'white' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>상세 주소</label>
                            <input name="detailAddress" value={formData.detailAddress} onChange={handleChange} required placeholder="101호"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'white' }} />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '30px', padding: '15px', fontSize: '1.1rem' }}>
                        결제하기
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OrderPage;
