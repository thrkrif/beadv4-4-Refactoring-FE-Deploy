
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const OrderSuccessPage = () => {
    const { orderId } = useParams();

    return (
        <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
            <div style={{ marginBottom: '30px' }}>
                <CheckCircle size={80} color="#00E5FF" style={{ filter: 'drop-shadow(0 0 10px rgba(0, 229, 255, 0.5))' }} />
            </div>
            
            <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>주문이 완료되었습니다!</h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '40px' }}>
                고객님의 주문이 성공적으로 처리되었습니다.<br />
                주문 번호: <span style={{ color: 'white', fontWeight: 'bold' }}>#{orderId || 'Unknown'}</span>
            </p>

            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <Link to="/products" className="btn btn-outline">
                    계속 쇼핑하기
                </Link>
                {/* 추후 Order Detail 페이지가 생기면 연결 */}
                <Link to="/" className="btn btn-primary">
                    홈으로 이동
                </Link>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
