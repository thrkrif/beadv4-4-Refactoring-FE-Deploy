import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../../services/api/authApi';
import orderApi from '../../services/api/orderApi';
import paymentApi from '../../services/api/paymentApi';
import productApi from '../../services/api/productApi';
import settlementApi from '../../services/api/settlementApi';
import { useAuth } from '../../contexts/AuthContext';
import { ShoppingBag, Wallet, History, Package, ArrowRight, TrendingUp, DollarSign, Calendar } from 'lucide-react';

const MyPage = () => {
    const navigate = useNavigate();
    const { user, logout, refresh } = useAuth();
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [walletInfo, setWalletInfo] = useState(null);
    const [financialLogs, setFinancialLogs] = useState([]);
    const [myProducts, setMyProducts] = useState([]);
    const [settlements, setSettlements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bankInfo, setBankInfo] = useState({ bankCode: '', accountNumber: '', accountHolder: '' });

    const isSeller = user?.role === 'SELLER';

    const fetchFinanceData = async (memberId) => {
        console.log('🔄 Fetching Financial Data for member:', memberId);
        
        // Always fetch wallet and logs for everyone
        const fetchWallet = async () => {
            try { return await paymentApi.getWallet(memberId); } 
            catch (e) { console.error('Wallet fetch failed:', e); return null; }
        };
        const fetchWLogs = async () => {
            try { return await paymentApi.getBalanceLogs(); }
            catch (e) { console.error('Balance logs fetch failed:', e); return { walletLog: [] }; }
        };
        const fetchRLogs = async () => {
            try { return await paymentApi.getRevenueLogs(); }
            catch (e) { console.error('Revenue logs fetch failed:', e); return { revenueLog: [] }; }
        };

        // Conditional fetches for sellers in seller-center tab
        const fetchPayouts = async () => {
            if (!isSeller || activeTab !== 'seller-center') return [];
            try { return await settlementApi.getSettlementHistory(); }
            catch (e) { console.error('Payouts fetch failed:', e); return []; }
        };
        const fetchMyProducts = async () => {
            if (!isSeller || activeTab !== 'seller-center') return { content: [] };
            try { return await productApi.getMyProducts(); }
            catch (e) { console.error('My products fetch failed:', e); return { content: [] }; }
        };

        const [wallet, wLogs, rLogs, payouts, productsRes] = await Promise.all([
            fetchWallet(), fetchWLogs(), fetchRLogs(), fetchPayouts(), fetchMyProducts()
        ]);

        if (wallet) setWalletInfo(wallet);
        
        const combinedLogs = [
            ...(wLogs?.walletLog || []),
            ...(rLogs?.revenueLog || [])
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setFinancialLogs(combinedLogs);
        if (activeTab === 'seller-center') {
            setSettlements(payouts || []);
            setMyProducts(productsRes?.content || []);
        }
    };

    useEffect(() => {
        const initMypage = async () => {
            setLoading(true);
            try {
                const currentUser = await refresh();
                
                // Fetch orders with safety catch
                try {
                    const orderData = await orderApi.getMyOrders();
                    setOrders(orderData || []);
                } catch (orderErr) {
                    console.warn('Orders fetch failed (likely endpoint missing):', orderErr);
                    setOrders([]);
                }
                
                // Always fetch financial data for any user
                if (currentUser?.memberId) {
                    await fetchFinanceData(currentUser.memberId);
                }
            } catch (err) {
                console.error('MyPage init error:', err);
            } finally {
                setLoading(false);
            }
        };
        if (authApi.getAccessToken()) initMypage();
    }, []);

    // Handle tab-specific data fetching
    useEffect(() => {
        if (user?.memberId) {
            fetchFinanceData(user.memberId);
        }
    }, [activeTab, isSeller, user?.memberId]);

    const handleUpgradeToSeller = async (e) => {
        e.preventDefault();
        const res = await authApi.upgradeToSeller(bankInfo);
        if (res.success) {
            alert('판매자로 전환되었습니다! 권한 갱신을 위해 다시 로그인해 주세요.');
            logout();
            navigate('/login');
        } else {
            alert(res.error?.message || '실패했습니다.');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('정말 이 상품을 삭제하시겠습니까?')) return;
        try {
            await productApi.deleteProduct(id);
            alert('상품이 삭제되었습니다.');
            fetchFinanceData(user.memberId);
        } catch (err) {
            console.error('Delete error:', err);
            alert('상품 삭제에 실패했습니다.');
        }
    };

    const getStatusBadge = (state) => {
        const styles = {
            PAYMENT_COMPLETED: { bg: 'rgba(0, 229, 255, 0.1)', color: '#00E5FF', text: '결제완료' },
            PENDING_PAYMENT: { bg: 'rgba(255, 171, 0, 0.1)', color: '#FFAB00', text: '결제대기' },
            CANCELLED: { bg: 'rgba(255, 64, 129, 0.1)', color: '#FF4081', text: '취소됨' },
            PREPARING: { bg: 'rgba(124, 77, 255, 0.1)', color: '#7C4DFF', text: '배송준비' }
        };
        const style = styles[state] || { bg: 'rgba(255,255,255,0.1)', color: '#ccc', text: state };
        return <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', backgroundColor: style.bg, color: style.color }}>{style.text}</span>;
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '5px' }}>마이페이지</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Welcome back, <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>User #{user?.memberId}</span></p>
                </div>
                <button onClick={handleLogout} className="btn-outline" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>로그아웃</button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '25px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '30px' }}>
                <button 
                    onClick={() => setActiveTab('orders')}
                    style={{ padding: '15px 5px', fontSize: '1.05rem', background: 'none', border: 'none', color: activeTab === 'orders' ? 'var(--accent-primary)' : 'var(--text-secondary)', borderBottom: activeTab === 'orders' ? '2px solid var(--accent-primary)' : 'none', cursor: 'pointer', fontWeight: activeTab === 'orders' ? '700' : '500', transition: 'all 0.2s' }}
                >
                    내 주문 내역
                </button>
                <button 
                    onClick={() => setActiveTab('wallet')}
                    style={{ padding: '15px 5px', fontSize: '1.05rem', background: 'none', border: 'none', color: activeTab === 'wallet' ? 'var(--accent-primary)' : 'var(--text-secondary)', borderBottom: activeTab === 'wallet' ? '2px solid var(--accent-primary)' : 'none', cursor: 'pointer', fontWeight: activeTab === 'wallet' ? '700' : '500', transition: 'all 0.2s' }}
                >
                    내 지갑
                </button>
                {isSeller && (
                    <button 
                        onClick={() => setActiveTab('seller-center')}
                        style={{ padding: '15px 5px', fontSize: '1.05rem', background: 'none', border: 'none', color: activeTab === 'seller-center' ? 'var(--accent-primary)' : 'var(--text-secondary)', borderBottom: activeTab === 'seller-center' ? '2px solid var(--accent-primary)' : 'none', cursor: 'pointer', fontWeight: activeTab === 'seller-center' ? '700' : '500', transition: 'all 0.2s' }}
                    >
                        판매자 센터
                    </button>
                )}
                {!isSeller && (
                    <button 
                        onClick={() => setActiveTab('be-seller')}
                        style={{ padding: '15px 5px', fontSize: '1.05rem', background: 'none', border: 'none', color: activeTab === 'be-seller' ? 'var(--accent-primary)' : 'var(--text-secondary)', borderBottom: activeTab === 'be-seller' ? '2px solid var(--accent-primary)' : 'none', cursor: 'pointer' }}
                    >
                        판매자 등록
                    </button>
                )}
            </div>

            {loading ? (
                <div style={{ padding: '100px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>시크릿 데이터를 불러오는 중...</div>
            ) : (
                <div className="tab-content" style={{ animation: 'fadeIn 0.4s ease' }}>
                    {/* Purchase History */}
                    {activeTab === 'orders' && (
                        <div style={{ display: 'grid', gap: '20px' }}>
                            {orders.length === 0 ? (
                                <div className="card" style={{ padding: '80px 20px', textAlign: 'center' }}>
                                    <ShoppingBag size={56} style={{ marginBottom: '20px', opacity: 0.2, color: 'var(--accent-primary)' }} />
                                    <h3 style={{ marginBottom: '10px' }}>주문 내역이 비어있어요!</h3>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>취향에 맞는 키보드를 찾아보세요.</p>
                                    <button onClick={() => navigate('/products')} className="btn-primary" style={{ padding: '12px 30px' }}>둘러보기</button>
                                </div>
                            ) : (
                                orders.map(order => {
                                    const representativeItem = order.items?.[0];
                                    const othersCount = (order.items?.length || 0) - 1;
                                    const representativeName = representativeItem 
                                        ? `${representativeItem.productName}${othersCount > 0 ? ` 외 ${othersCount}건` : ''}`
                                        : '상품 정보 없음';

                                    return (
                                        <div key={order.orderId} className="card" style={{ padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s', cursor: 'default' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                                                    {getStatusBadge(order.state)}
                                                </div>
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>{representativeName}</h3>
                                                <div style={{ display: 'flex', gap: '15px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                    <span>No. {order.orderNumber}</span>
                                                    <span>|</span>
                                                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{order.totalSalePrice.toLocaleString()}원</span>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', minWidth: '150px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', color: 'var(--accent-primary)', fontSize: '0.9rem', marginBottom: '12px', fontWeight: '600' }}>
                                                    <Package size={16} />
                                                    <span>{order.state === 'PAYMENT_COMPLETED' ? '배송 준비 중' : '주문 확인'}</span>
                                                </div>
                                                <button className="btn btn-outline" style={{ padding: '6px 15px', fontSize: '0.8rem' }} onClick={() => alert('상세조회 기능은 준비 중입니다.')}>상세 조회</button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* Integrated Wallet Tab - For Everyone */}
                    {activeTab === 'wallet' && (
                        <div style={{ display: 'grid', gap: '30px' }}>
                            <div className="card" style={{ padding: '30px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--accent-primary)' }}>
                                        <Wallet size={24} />
                                        <span style={{ fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Available Balance</span>
                                    </div>
                                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '5px' }}>{walletInfo?.balance?.toLocaleString() || 0}원</h2>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>즉시 출금 및 상품 구매에 사용 가능한 예치금입니다.</p>
                                </div>
                                <DollarSign size={80} style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.05, transform: 'rotate(-15deg)' }} />
                            </div>

                            <div className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ padding: '25px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>입출금 및 활동 내역</h3>
                                    <button className="btn-icon"><History size={18} /></button>
                                </div>
                                <div style={{ maxHeight: '600px', overflowY: 'auto', padding: '10px' }}>
                                    {financialLogs.length === 0 ? (
                                        <p style={{ padding: '50px', textAlign: 'center', color: 'var(--text-secondary)' }}>활동 내역이 없습니다.</p>
                                    ) : (
                                        financialLogs.map((log, idx) => (
                                            <div key={idx} style={{ padding: '15px 15px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: log.eventType?.includes('입금') ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 64, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {log.eventType?.includes('입금') ? <TrendingUp size={18} color="#4CAF50" /> : <Package size={18} color="#FF4081" />}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '3px' }}>{log.eventType === '판매수익_입금' ? '상품 판매 수익' : log.eventType ? log.eventType.replace('_', ' ') : '내역'}</p>
                                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(log.createdAt).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <span style={{ color: log.eventType?.includes('입금') ? '#4CAF50' : '#FF4081', fontWeight: '800', fontSize: '1.1rem' }}>
                                                    {log.eventType?.includes('입금') ? '+' : '-'}{log.amount.toLocaleString()}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Integrated Seller Dashboard - Refined Vertical Stack Layout */}
                    {isSeller && activeTab === 'seller-center' && (
                        <div style={{ display: 'grid', gap: '40px' }}>
                            
                            {/* Top Summary Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                                <div className="card" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(0, 229, 255, 0.05)', border: '1px solid rgba(0, 229, 255, 0.1)' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <TrendingUp size={24} color="black" />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>총 판매 수익</p>
                                        <h3 style={{ fontSize: '1.6rem', fontWeight: '800' }}>{walletInfo?.revenue?.toLocaleString() || 0}원</h3>
                                    </div>
                                </div>
                                <div className="card" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Package size={24} color="var(--accent-primary)" />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>등록된 상품</p>
                                        <h3 style={{ fontSize: '1.6rem', fontWeight: '800' }}>{myProducts.length}개</h3>
                                    </div>
                                </div>
                            </div>

                            {/* 1. Product Management (Full Width) */}
                            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                                <div style={{ padding: '20px 25px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>내 상품 관리</h3>
                                    <button onClick={() => navigate('/products/new')} className="btn btn-primary" style={{ padding: '6px 15px', fontSize: '0.85rem' }}>+ 상품 등록</button>
                                </div>
                                <div style={{ padding: '20px' }}>
                                    {myProducts.length === 0 ? (
                                        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            등록된 상품이 없습니다. 첫 상품을 등록해보세요!
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '15px' }}>
                                            {myProducts.map(product => (
                                                <div key={product.id} style={{ padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                        {product.imageUrl ? (
                                                            <img src={product.imageUrl} alt={product.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                                                        ) : (
                                                            <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <Package size={20} color="var(--text-secondary)" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '4px' }}>{product.name}</p>
                                                            <p style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: '700' }}>{product.price.toLocaleString()}원</p>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => navigate(`/products/${product.id}/edit`)} className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '0.75rem' }}>수정</button>
                                                        <button onClick={() => handleDeleteProduct(product.id)} className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '0.75rem', color: '#FF4081', borderColor: 'rgba(255, 64, 129, 0.2)' }}>삭제</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 2. Settlement Notice (Banner) */}
                            <div style={{ background: 'rgba(255, 171, 0, 0.05)', padding: '25px', borderRadius: '20px', border: '1px solid rgba(255, 171, 0, 0.1)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255, 171, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Calendar size={22} color="#FFAB00" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ color: '#FFAB00', marginBottom: '5px', fontWeight: '700' }}>데일리 정산 안내</h4>
                                    <p style={{ fontSize: '0.9rem', color: '#FFAB00', opacity: 0.8 }}>
                                        판매 수익금은 시스템 안정성을 위해 매일 자정 정산 프로세스가 완료된 후 업데이트됩니다.
                                    </p>
                                </div>
                            </div>

                            {/* 3. Daily Settlements (Full Width / Bottom) */}
                            <div className="card" style={{ padding: '0' }}>
                                <div style={{ padding: '20px 25px', borderBottom: '1px solid var(--border-subtle)' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>데일리 정산 내역</h3>
                                </div>
                                <div style={{ padding: '20px' }}>
                                    {settlements.length === 0 ? (
                                        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            <Calendar size={48} style={{ marginBottom: '15px', opacity: 0.1 }} />
                                            <p style={{ fontSize: '0.9rem' }}>최근 완료된 정산 결과가 없습니다.</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                                            {settlements.map(s => (
                                                <div key={s.id} style={{ padding: '20px', borderRadius: '14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-subtle)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{s.salesDate}</span>
                                                        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', background: s.status === 'COMPLETED' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)', color: s.status === 'COMPLETED' ? '#4CAF50' : '#FF9800' }}>{s.status}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                            <span style={{ color: 'var(--text-secondary)' }}>판매총액</span>
                                                            <span>{s.totalAmount.toLocaleString()}원</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600' }}>실제 정산금</span>
                                                            <span style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--accent-primary)' }}>{s.payoutAmount.toLocaleString()}원</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Become Seller */}
                    {!isSeller && activeTab === 'be-seller' && (
                        <div className="card" style={{ padding: '50px 40px', maxWidth: '500px', margin: '30px auto' }}>
                            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                <TrendingUp size={48} color="var(--accent-primary)" style={{ marginBottom: '20px' }} />
                                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '10px' }}>판매자 권한 신청</h2>
                                <p style={{ color: 'var(--text-secondary)' }}>당신의 멋진 키보드를 판매해보세요.</p>
                            </div>
                            <form onSubmit={handleUpgradeToSeller} style={{ display: 'grid', gap: '22px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.95rem', fontWeight: '600' }}>은행 코드</label>
                                    <input placeholder="예: 004 (신한), 020 (우리)" value={bankInfo.bankCode} onChange={e => setBankInfo({...bankInfo, bankCode: e.target.value})} required style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.95rem', fontWeight: '600' }}>계좌 번호</label>
                                    <input placeholder="'-' 제외하고 입력" value={bankInfo.accountNumber} onChange={e => setBankInfo({...bankInfo, accountNumber: e.target.value})} required style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.95rem', fontWeight: '600' }}>예금주 명</label>
                                    <input placeholder="본인 성함" value={bankInfo.accountHolder} onChange={e => setBankInfo({...bankInfo, accountHolder: e.target.value})} required style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'white' }} />
                                </div>
                                <button type="submit" className="btn-primary" style={{ marginTop: '10px', padding: '16px', fontWeight: 'bold', fontSize: '1.1rem' }}>신청 완료하기</button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyPage;
