
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import paymentApi from '../../services/api/paymentApi';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    useEffect(() => {
        if (!paymentKey || !orderId || !amount) {
            setError('결제 정보가 부족합니다.');
            setLoading(false);
            return;
        }

        paymentApi.confirmPayment(paymentKey, orderId, amount)
            .then(res => {
                setResult(res);
                setLoading(false);
            })
            .catch(err => {
                console.error('Payment Confirm Error:', err);
                setError(err.message || '결제 승인 중 오류가 발생했습니다.');
                setLoading(false);
            });
    }, [paymentKey, orderId, amount]);

    if (loading) return <div className="container" style={{ padding: '50px', textAlign: 'center' }}>결제 승인 처리 중...</div>;

    if (error) {
        return (
            <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
                <AlertTriangle size={60} color="var(--accent-error)" style={{ marginBottom: '20px' }} />
                <h2>결제 승인 실패</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>{error}</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <Link to="/cart" className="btn btn-outline">장바구니로 돌아가기</Link>
                    <Link to="/" className="btn btn-primary">홈으로 이동</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
            <CheckCircle size={80} color="#00E5FF" style={{ marginBottom: '20px', filter: 'drop-shadow(0 0 10px rgba(0, 229, 255, 0.5))' }} />
            <h1 style={{ marginBottom: '20px' }}>결제가 완료되었습니다!</h1>
            <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '30px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>주문번호</span>
                    <span>{orderId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>결제금액</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{Number(amount).toLocaleString()}원</span>
                </div>
            </div>
            
            <div style={{ marginTop: '40px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <Link to="/products" className="btn btn-outline">계속 쇼핑하기</Link>
                <Link to="/" className="btn btn-primary">홈으로 이동</Link>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;
