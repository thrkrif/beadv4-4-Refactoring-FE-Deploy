
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import orderApi from '../../services/api/orderApi';

const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;
const TOSS_SDK_SRC = 'https://js.tosspayments.com/v1/payment';
const ANONYMOUS = 'ANONYMOUS';

const PaymentPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const readPendingPayment = () => {
        try {
            return JSON.parse(sessionStorage.getItem('pendingPayment') || 'null');
        } catch {
            return null;
        }
    };

    const amountFromQuery = Number(searchParams.get('amount') || 0);
    const orderNumberFromQuery = searchParams.get('orderNumber');
    const pendingPayment = readPendingPayment();
    const pendingAmount = pendingPayment?.amount;
    const initialState = location.state || (amountFromQuery > 0 ? {
        amount: amountFromQuery,
        orderName: `주문번호 ${orderNumberFromQuery || orderId}`,
        orderNumber: orderNumberFromQuery || pendingPayment?.orderNumber
    } : null);

    // State to hold order info if not passed via location state
    const [orderInfo, setOrderInfo] = useState(initialState);
    const [widgetError, setWidgetError] = useState(clientKey ? '' : '클라이언트 키가 없습니다. VITE_TOSS_CLIENT_KEY를 설정해주세요.');
    const [isSdkReady, setIsSdkReady] = useState(() => typeof window !== 'undefined' && !!window.TossPayments);
    const tossPaymentsRef = useRef(null);

    useEffect(() => {
        // If orderInfo is missing (e.g. direct access or refresh), fetch it
        if (!orderInfo) {
            console.log('Order info missing, fetching for orderId:', orderId);
            orderApi.getOrderDetail(orderId)
                .then(res => {
                    console.log('Fetched order detail:', res);
                    const resolvedAmount = Number(location.state?.amount || amountFromQuery || pendingAmount || 0);
                    setOrderInfo({
                        amount: resolvedAmount,
                        orderName: `주문번호 ${res.orderNumber || orderId}`,
                        orderNumber: res.orderNumber,
                        customerName: res.ordererName,
                        customerEmail: res.ordererEmail,
                        customerKey: res.memberId ? String(res.memberId) : ANONYMOUS
                    });
                })
                .catch(err => {
                    console.error('Failed to fetch order info:', err);
                    alert('주문 정보를 불러올 수 없습니다. 다시 시도해주세요.');
                    navigate('/');
                });
        }
    }, [orderId, navigate, location.state, orderInfo, amountFromQuery, pendingAmount]);

    useEffect(() => {
        if (!clientKey) {
            return;
        }
        if (window.TossPayments) {
            tossPaymentsRef.current = window.TossPayments(clientKey);
            return;
        }

        const script = document.createElement('script');
        script.src = TOSS_SDK_SRC;
        script.async = true;
        script.onload = () => {
            if (!window.TossPayments) {
                setWidgetError('토스 결제 SDK 초기화에 실패했습니다.');
                return;
            }

            tossPaymentsRef.current = window.TossPayments(clientKey);
            setIsSdkReady(true);
            setWidgetError('');
        };
        script.onerror = () => {
            setWidgetError('토스 결제 SDK를 불러오지 못했습니다.');
        };

        document.body.appendChild(script);

        return () => {
            script.onload = null;
            script.onerror = null;
        };
    }, []);

    const handlePayment = async () => {
        const tossPayments = tossPaymentsRef.current;

        if (!tossPayments || !orderInfo) {
            console.error('Payment SDK or order info is missing at click time:', { tossPayments: !!tossPayments, orderInfo: !!orderInfo });
            alert('결제 준비가 완료되지 않았습니다. 잠시 후 다시 시도해주세요.');
            return;
        }
        if (Number(orderInfo.amount) <= 0) {
            alert('결제 금액을 확인할 수 없습니다. 주문 페이지에서 다시 시도해주세요.');
            return;
        }

        try {
            console.log('Requesting payment...');
            await tossPayments.requestPayment('카드', {
                amount: Number(orderInfo.amount),
                orderId: String(orderInfo.orderNumber || orderId),
                orderName: orderInfo.orderName || `주문번호 ${orderInfo.orderNumber || orderId}`,
                customerName: orderInfo.customerName || '익명',
                customerEmail: orderInfo.customerEmail || '',
                successUrl: `${window.location.origin}/payment/success`,
                failUrl: `${window.location.origin}/payment/fail`,
            });
        } catch (error) {
            if (error?.code === 'USER_CANCEL') {
                console.log('Payment window closed by user');
            } else {
                console.error('Payment Request Error:', error);
                const errorCode = error?.code ? ` (${error.code})` : '';
                const errorMessage = error?.message || '알 수 없는 에러';
                alert(`결제 요청 중 오류가 발생했습니다${errorCode}: ${errorMessage}`);
            }
        }
    };

    if (!orderInfo) return <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>주문 정보를 확인 중...</div>;

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>결제하기</h1>

            <div className="card" style={{ padding: '0 20px 20px' }}>
                <div style={{ padding: '20px 0', borderBottom: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
                    <h3 style={{ marginBottom: '10px' }}>주문 정보</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>상품명: {orderInfo.orderName}</p>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '5px' }}>
                        결제 금액: <span style={{ color: 'var(--accent-primary)' }}>{Number(orderInfo.amount).toLocaleString()}원</span>
                    </p>
                </div>

                {widgetError && (
                    <p style={{ color: 'var(--accent-error)', marginTop: '12px', fontSize: '0.92rem' }}>
                        {widgetError}
                    </p>
                )}

                <button
                    onClick={handlePayment}
                    className="btn btn-primary"
                    disabled={!isSdkReady || !!widgetError}
                    style={{
                        width: '100%',
                        padding: '15px',
                        fontSize: '1.1rem',
                        marginTop: '20px',
                        opacity: isSdkReady && !widgetError ? 1 : 0.6,
                        cursor: isSdkReady && !widgetError ? 'pointer' : 'not-allowed'
                    }}
                >
                    {isSdkReady ? '결제하기' : '결제 모듈 로딩 중...'}
                </button>
            </div>
        </div>
    );
};

export default PaymentPage;
