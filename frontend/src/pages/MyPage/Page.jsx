import React from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../../services/api/authApi';
import { useAuth } from '../../contexts/AuthContext';

const MyPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [showSellerForm, setShowSellerForm] = React.useState(false);
    const [bankInfo, setBankInfo] = React.useState({
        bankCode: '',
        accountNumber: '',
        accountHolder: ''
    });

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleUpgradeToSeller = async (e) => {
        e.preventDefault();
        const res = await authApi.upgradeToSeller(bankInfo);
        if (res.success) {
            alert('판매자로 전환되었습니다!');
            setShowSellerForm(false);
            // 페이지 새로고침 or 유저 정보 다시 불러오기
            window.location.reload(); 
        } else {
            alert(res.error?.message || '실패했습니다.');
        }
    };

    return (
        <div className="container" style={{ padding: '40px 0', maxWidth: '600px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '30px', fontWeight: 'bold' }}>마이페이지</h1>

            <div style={{
                background: 'var(--bg-secondary)',
                padding: '30px',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle)'
            }}>
                <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'var(--text-secondary)' }}>회원 번호 (Member ID)</h2>
                    <p style={{ fontSize: '1.1rem' }}>{user?.memberId ? `User #${user.memberId}` : '로그인 정보 확인 중...'}</p>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '15px', color: 'var(--text-secondary)' }}>판매자 관리</h2>
                    
                    <button 
                        className="btn btn-primary"
                        onClick={() => navigate('/products/new')}
                        style={{ width: '100%', marginBottom: '15px' }}
                    >
                        상품 등록하기
                    </button>
                    
                    {!showSellerForm ? (
                        <button 
                            className="btn btn-outline"
                            onClick={() => setShowSellerForm(true)}
                            style={{ width: '100%' }}
                        >
                            판매자 정보 등록/수정
                        </button>
                    ) : (
                        <form onSubmit={handleUpgradeToSeller} style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px', marginTop: '10px' }}>
                            <h3 style={{ marginBottom: '15px' }}>판매자 정보 입력</h3>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                <input 
                                    placeholder="은행 코드 (예: 004)"
                                    value={bankInfo.bankCode}
                                    onChange={e => setBankInfo({...bankInfo, bankCode: e.target.value})}
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
                                    required
                                />
                                <input 
                                    placeholder="계좌 번호"
                                    value={bankInfo.accountNumber}
                                    onChange={e => setBankInfo({...bankInfo, accountNumber: e.target.value})}
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
                                    required
                                />
                                <input 
                                    placeholder="예금주 명"
                                    value={bankInfo.accountHolder}
                                    onChange={e => setBankInfo({...bankInfo, accountHolder: e.target.value})}
                                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
                                    required
                                />
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>등록</button>
                                    <button type="button" className="btn btn-outline" onClick={() => setShowSellerForm(false)} style={{ flex: 1 }}>취소</button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
                    <button
                        onClick={handleLogout}
                        className="btn"
                        style={{
                            background: 'rgba(255, 64, 129, 0.1)',
                            color: 'var(--accent-secondary)',
                            border: '1px solid var(--accent-secondary)',
                            width: '100%'
                        }}
                    >
                        로그아웃
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyPage;
