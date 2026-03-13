import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Header = () => {
    const location = useLocation();
    const { isLoggedIn } = useAuth();
    const { cartCount } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path) => (location.pathname + location.search === path ? 'active' : '');

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname, location.search]);

    return (
        <header className="site-header">
            <div className="header-utility">
                <div className="container header-utility-inner">
                    <Link to="/support" className="header-utility-link">1:1 문의</Link>
                    <Link to="/cs" className="header-utility-link">고객센터</Link>
                </div>
            </div>

            <div className="container header-main">
                <Link to="/" aria-label="또각 홈" className="header-logo-link">
                    <img src="/thock-logo.svg" alt="또각 THOCK" className="header-logo" />
                </Link>

                <div className="header-actions">
                    <div className="header-auth-area">
                        {isLoggedIn ? (
                            <Link to="/mypage" className="header-mypage-link">
                                <User size={18} />
                                <span>마이페이지</span>
                            </Link>
                        ) : (
                            <div className="header-auth-links">
                                <Link to="/login" className="header-utility-link">로그인</Link>
                                <span className="header-auth-separator">|</span>
                                <Link to="/signup" className="header-signup-link">회원가입</Link>
                            </div>
                        )}
                    </div>

                    <Link to="/cart" className="header-cart-link" aria-label="장바구니">
                        <ShoppingCart size={22} color="var(--text-primary)" />
                        {cartCount > 0 && <span className="header-cart-badge">{cartCount}</span>}
                    </Link>
                </div>
            </div>

            <div className="header-nav-wrap">
                <div className="container">
                    <nav className="header-nav">
                        <button
                            type="button"
                            className="header-menu-toggle"
                            onClick={() => setIsMenuOpen((prev) => !prev)}
                            aria-label="카테고리 메뉴 열기"
                            aria-expanded={isMenuOpen}
                        >
                            <span className="header-menu-icon">
                                <span />
                                <span />
                                <span />
                            </span>
                        </button>

                        <div className="header-primary-links">
                            <Link to="/products" className={`nav-link ${isActive('/products')}`}>전체상품</Link>
                            <Link to="/products?category=KEYBOARD" className={`nav-link ${isActive('/products?category=KEYBOARD')}`}>키보드</Link>
                            <Link to="/products?category=SWITCH" className={`nav-link ${isActive('/products?category=SWITCH')}`}>스위치</Link>
                            <Link to="/products?category=KEYCAP" className={`nav-link ${isActive('/products?category=KEYCAP')}`}>키캡</Link>
                        </div>
                    </nav>

                    {isMenuOpen && (
                        <div className="header-category-menu">
                            <div className="header-category-links">
                                <Link to="/products?category=DIY_KIT" className="header-chip-link">DIY 키트</Link>
                                <Link to="/products?category=KEYBOARD" className="header-chip-link">신상 키보드</Link>
                                <Link to="/products?category=SWITCH" className="header-chip-link">인기 스위치</Link>
                                <Link to="/products?category=KEYCAP" className="header-chip-link">키캡 컬렉션</Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
