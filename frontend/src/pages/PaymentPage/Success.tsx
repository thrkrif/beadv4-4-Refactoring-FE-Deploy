
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import paymentApi from '../../services/api/paymentApi';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const { updateCartCount } = useCart();

    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const amountNumber = Number(amount || 0);
    const hasAmountParam = amount !== null;
    const isWalletPayment = paymentKey === 'INTERNAL_WALLET' || (hasAmountParam && !!orderId && amountNumber <= 0);
    const confirmed = useRef(false);

    useEffect(() => {
        let cancelled = false;
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const syncCartCount = async () => {
            // 결제 완료 이벤트 소비 지연을 고려해 짧게 재시도
            for (let attempt = 0; attempt < 5; attempt += 1) {
                if (cancelled) return;
                await updateCartCount();
                if (attempt < 4) {
                    await sleep(300);
                }
            }
        };

        const run = async () => {
            if (isWalletPayment) {
                await syncCartCount();
                if (cancelled) return;
                setResult({ paymentMethod: 'INTERNAL_WALLET' });
                setLoading(false);
                return;
            }

            if (!paymentKey || !orderId || !amount) {
                setError('결제 정보가 부족합니다.');
                setLoading(false);
                return;
            }

            if (confirmed.current) return;
            confirmed.current = true;

            console.log(`💳 결제 승인 요청 시작: orderId=${orderId}, amount=${amount}`);

            try {
                const res = await paymentApi.confirmToss(paymentKey, orderId, amount);
                await syncCartCount();
                if (cancelled) return;
                setResult(res);
                setLoading(false);
            } catch (err) {
                if (cancelled) return;
                console.error('Payment Confirm Error:', err);
                setError(err.message || '결제 승인 중 오류가 발생했습니다.');
                setLoading(false);
            }
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [paymentKey, orderId, amount, isWalletPayment, updateCartCount]);

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
                    <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{amountNumber.toLocaleString()}원</span>
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
