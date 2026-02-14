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

    const isActive = (path) => location.pathname + location.search === path ? 'active' : '';

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname, location.search]);

    return (
        <header className="app-header" style={{ height: 'auto', display: 'block', background: '#fff', borderBottom: '1px solid var(--border-subtle)' }}>

            {/* 1. Top Utility Bar */}
            <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', padding: '8px 0', fontSize: '0.85rem' }}>
                    <Link to="/support" style={{ color: 'var(--text-secondary)' }}>1:1 문의</Link>
                    <Link to="/cs" style={{ color: 'var(--text-secondary)' }}>고객센터</Link>
                </div>
            </div>

            {/* 2. Main Header Area */}
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>

                {/* Logo Section */}
                <Link to="/" style={{ display: 'inline-grid', gap: '1px', color: 'var(--text-primary)', textDecoration: 'none', lineHeight: 1 }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.2px' }}>또각</span>
                    <span style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.3px' }}>THOCK</span>
                </Link>

                {/* Main Actions (User + Cart) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.95rem' }}>
                        {isLoggedIn ? (
                            <Link to="/mypage" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                <User size={18} />
                                <span>마이페이지</span>
                            </Link>
                        ) : (
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <Link to="/login" style={{ color: 'var(--text-secondary)' }}>로그인</Link>
                                <span style={{ color: 'var(--border-subtle)', fontSize: '0.8rem' }}>|</span>
                                <Link to="/signup" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>회원가입</Link>
                            </div>
                        )}
                    </div>

                    <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px', height: '40px', background: 'var(--bg-secondary)', borderRadius: '50%' }}>
                        <ShoppingCart size={22} color="var(--text-primary)" />
                        {cartCount > 0 && (
                            <span style={{
                                position: 'absolute', top: -4, right: -4,
                                background: 'var(--accent-primary)', color: 'white',
                                fontSize: '0.75rem', padding: '2px 7px', borderRadius: '12px', fontWeight: 'bold',
                                border: '2px solid #fff'
                            }}>{cartCount}</span>
                        )}
                    </Link>
                </div>
            </div>

            {/* 3. Navigation Menu Bar */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', background: '#fff' }}>
                <div className="container">
                    <nav style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '15px 0' }}>
                        <button
                            type="button"
                            className="nav-link"
                            onClick={() => setIsMenuOpen((prev) => !prev)}
                            aria-label="카테고리 메뉴 열기"
                            aria-expanded={isMenuOpen}
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '22px', background: 'none', padding: 0 }}
                        >
                            <span style={{ display: 'inline-grid', gap: '4px' }}>
                                <span style={{ width: '16px', height: '2px', borderRadius: '2px', background: 'currentColor' }} />
                                <span style={{ width: '16px', height: '2px', borderRadius: '2px', background: 'currentColor' }} />
                                <span style={{ width: '16px', height: '2px', borderRadius: '2px', background: 'currentColor' }} />
                            </span>
                        </button>
                        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Link to="/products" className={`nav-link ${isActive('/products')}`} style={{ fontWeight: 600 }}>전체상품</Link>
                            <Link to="/products?category=KEYBOARD" className={`nav-link ${isActive('/products?category=KEYBOARD')}`} style={{ fontWeight: 600 }}>키보드</Link>
                            <Link to="/products?category=SWITCH" className={`nav-link ${isActive('/products?category=SWITCH')}`} style={{ fontWeight: 600 }}>스위치</Link>
                            <Link to="/products?category=KEYCAP" className={`nav-link ${isActive('/products?category=KEYCAP')}`} style={{ fontWeight: 600 }}>키캡</Link>
                        </div>
                    </nav>

                    {isMenuOpen && (
                        <div style={{ borderTop: '1px dashed var(--border-subtle)', padding: '14px 0 16px' }}>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <Link to="/products?category=DIY_KIT" className="nav-link" style={{ fontWeight: 600, padding: '6px 12px', borderRadius: '999px', background: 'var(--bg-secondary)' }}>DIY 키트</Link>
                                <Link to="/products?category=KEYBOARD" className="nav-link" style={{ fontWeight: 600, padding: '6px 12px', borderRadius: '999px', background: 'var(--bg-secondary)' }}>신상 키보드</Link>
                                <Link to="/products?category=SWITCH" className="nav-link" style={{ fontWeight: 600, padding: '6px 12px', borderRadius: '999px', background: 'var(--bg-secondary)' }}>인기 스위치</Link>
                                <Link to="/products?category=KEYCAP" className="nav-link" style={{ fontWeight: 600, padding: '6px 12px', borderRadius: '999px', background: 'var(--bg-secondary)' }}>키캡 컬렉션</Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .nav-link {
                    color: var(--text-secondary);
                    text-decoration: none;
                    font-size: 1rem;
                    transition: color 0.2s;
                    position: relative;
                }
                .nav-link:hover, .nav-link.active {
                    color: var(--accent-primary);
                }
                .nav-link.active::after {
                    content: '';
                    position: absolute;
                    bottom: -16px;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: var(--accent-primary);
                }
            `}</style>
        </header>
    );
};

export default Header;
