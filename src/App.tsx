import React, { useState, useEffect } from 'react'
import './App.css'
import Logo from './components/Logo'
import Auth from './components/Auth'
import FeaturedProducts from './components/FeaturedProducts'
import RecommendedProducts from './components/RecommendedProducts'
import SearchPage from './components/SearchPage'

const App: React.FC = () => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [currentPage, setCurrentPage] = useState<'home' | 'search'>('home');

    useEffect(() => {
        if (showAuthModal) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [showAuthModal]);

    const renderMainContent = () => {
        if (currentPage === 'search') {
            return <SearchPage />;
        }

        return (
            <>
                <section className="hero">
                    <h1>Compare Prices Across Platforms</h1>
                    <p>Find the best deals on groceries and household items</p>
                    <button
                        className="cta-button"
                        onClick={() => setCurrentPage('search')}
                    >
                        Start Comparing
                    </button>
                </section>

                <FeaturedProducts />
                <RecommendedProducts />
            </>
        );
    };

    return (
        <div className="app">
            <div className="parallax-background"></div>
            <div className="particles">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 20}s`,
                            animationDuration: `${20 + Math.random() * 10}s`
                        }}
                    />
                ))}
            </div>

            {showAuthModal && (
                <div className="auth-overlay" onClick={() => setShowAuthModal(false)}>
                    <div className="auth-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setShowAuthModal(false)}>×</button>
                        <Auth isModal={true} onClose={() => setShowAuthModal(false)} />
                    </div>
                </div>
            )}

            <header className="app-header">
                <div className="header-content">
                    <Logo />
                    <nav>
                        <ul>
                            <li>
                                <button
                                    className="nav-link"
                                    onClick={() => setCurrentPage('home')}
                                >
                                    Home
                                </button>
                            </li>
                            <li>
                                <button
                                    className="nav-link"
                                    onClick={() => setCurrentPage('search')}
                                >
                                    Search
                                </button>
                            </li>
                            <li><a href="#deals">Best Deals</a></li>
                            <li><a href="#about">About</a></li>
                        </ul>
                    </nav>
                    <div onClick={() => setShowAuthModal(true)}>
                        <Auth isModal={false} onClose={() => setShowAuthModal(true)} />
                    </div>
                </div>
            </header>

            <main className="app-main">
                {renderMainContent()}
            </main>

            <footer className="app-footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>Compare-It</h3>
                        <p>Find the best prices across multiple platforms</p>
                    </div>
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><button className="footer-link" onClick={() => setCurrentPage('home')}>Home</button></li>
                            <li><button className="footer-link" onClick={() => setCurrentPage('search')}>Search</button></li>
                            <li><a href="#deals">Best Deals</a></li>
                            <li><a href="#about">About</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Contact</h4>
                        <ul>
                            <li><a href="mailto:support@compare-it.com">support@compare-it.com</a></li>
                            <li><a href="tel:+1234567890">+1 (234) 567-890</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2024 Compare-It. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}

export default App 