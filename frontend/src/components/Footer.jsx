import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            background: '#222',
            color: '#fff',
            padding: '60px 0 30px',
            marginTop: 'auto',
            fontSize: '0.9rem'
        }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: '40px', gap: '30px' }}>

                    {/* Brand Section */}
                    <div style={{ flex: '1 1 300px' }}>
                        <div style={{ fontWeight: '800', fontSize: '1.8rem', marginBottom: '16px', letterSpacing: '-1px' }}>
                            THOCK
                        </div>
                        <p style={{ color: '#aaa', lineHeight: '1.6', marginBottom: '24px' }}>
                            프리미엄 커스텀 키보드 플랫폼, 또각.<br />
                            당신만의 완벽한 타건감을 찾아보세요.
                        </p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            {['Instagram', 'Twitter', 'Facebook'].map(sns => (
                                <div key={sns} style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <span style={{ fontSize: '10px' }}>{sns[0]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Links Section */}
                    <div style={{ display: 'flex', gap: '60px', flexWrap: 'wrap' }}>
                        <div>
                            <h4 style={{ color: '#fff', marginBottom: '20px', fontSize: '1rem' }}>SHOP</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#aaa' }}>
                                <li style={{ marginBottom: '10px', cursor: 'pointer' }}>전체 상품</li>
                                <li style={{ marginBottom: '10px', cursor: 'pointer' }}>키보드</li>
                                <li style={{ marginBottom: '10px', cursor: 'pointer' }}>스위치</li>
                                <li style={{ marginBottom: '10px', cursor: 'pointer' }}>키캡</li>
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ color: '#fff', marginBottom: '20px', fontSize: '1rem' }}>SUPPORT</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#aaa' }}>
                                <li style={{ marginBottom: '10px', cursor: 'pointer' }}>공지사항</li>
                                <li style={{ marginBottom: '10px', cursor: 'pointer' }}>자주 묻는 질문</li>
                                <li style={{ marginBottom: '10px', cursor: 'pointer' }}>1:1 문의</li>
                                <li style={{ marginBottom: '10px', cursor: 'pointer' }}>배송 안내</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #333', paddingTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', color: '#666' }}>

                    <div>
                        <span style={{ marginRight: '20px', cursor: 'pointer' }}>이용약관</span>
                        <span style={{ cursor: 'pointer' }}>개인정보처리방침</span>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.85rem' }}>
                        © 2026 Thock Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
