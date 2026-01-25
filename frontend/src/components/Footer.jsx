
import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-subtle)',
            padding: '40px 0',
            marginTop: 'auto'
        }}>
            <div className="container" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                <div style={{ marginBottom: '25px', fontWeight: '800', fontSize: '1.8rem', color: '#fff', letterSpacing: '2px' }}>THOCK</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '30px', fontSize: '0.95rem' }}>
                    <span style={{ cursor: 'pointer' }}>이용약관</span>
                    <span style={{ cursor: 'pointer' }}>개인정보처리방침</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>고객센터</span>
                </div>
                <div style={{ borderBottom: '1px solid #333', width: '200px', margin: '0 auto 30px' }}></div>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.8', marginBottom: '20px' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>(주)또각</span> | 대표: 김개발 | 사업자등록번호: 123-45-67890<br />
                    통신판매업신고: 제 2024-서울강남-1234호 | 주소: 서울특별시 강남구 테헤란로 123<br />
                    이메일: <span style={{ color: 'var(--accent-primary)' }}>support@thock.com</span> | 제휴문의: partner@thock.com
                </p>
                <p style={{ fontSize: '0.85rem', marginTop: '20px', color: 'var(--text-muted)' }}>
                    © 2024 Thock. Premium Keyboard Enthusiasts Platform. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
