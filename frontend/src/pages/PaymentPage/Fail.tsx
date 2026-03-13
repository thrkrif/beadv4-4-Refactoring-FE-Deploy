
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const PaymentFailPage = () => {
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');
    const message = searchParams.get('message');

    return (
        <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
            <XCircle size={80} color="var(--accent-error)" style={{ marginBottom: '20px' }} />
            <h1 style={{ marginBottom: '20px' }}>결제 실패</h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '40px' }}>
                결제가 진행되지 않았습니다.<br />
                <span style={{ color: 'var(--accent-error)', fontSize: '0.9rem' }}>{message} ({code})</span>
            </p>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <Link to="/cart" className="btn btn-primary">장바구니로 돌아가기</Link>
                <Link to="/" className="btn btn-outline">홈으로 이동</Link>
            </div>
        </div>
    );
};

export default PaymentFailPage;
