import React from 'react';

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="container footer-container">
                <div className="footer-top">
                    <div className="footer-brand">
                        <div className="footer-brand-title">THOCK</div>
                        <p className="footer-brand-text">
                            프리미엄 커스텀 키보드 플랫폼, 또각.<br />
                            당신만의 완벽한 타건감을 찾아보세요.
                        </p>
                        <div className="footer-social-list">
                            {['Instagram', 'Twitter', 'Facebook'].map((sns) => (
                                <div key={sns} className="footer-social-item">
                                    <span>{sns[0]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="footer-links-wrap">
                        <div>
                            <h4 className="footer-link-title">SHOP</h4>
                            <ul className="footer-link-list">
                                <li>전체 상품</li>
                                <li>키보드</li>
                                <li>스위치</li>
                                <li>키캡</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="footer-link-title">SUPPORT</h4>
                            <ul className="footer-link-list">
                                <li>공지사항</li>
                                <li>자주 묻는 질문</li>
                                <li>1:1 문의</li>
                                <li>배송 안내</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-policy-links">
                        <span>이용약관</span>
                        <span>개인정보처리방침</span>
                    </div>

                    <p className="footer-copyright">© 2026 Thock Inc. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
