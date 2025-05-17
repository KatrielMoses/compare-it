import React, { useState } from 'react';

interface AuthProps {
    isModal?: boolean;
    onClose?: () => void;
}

const Auth: React.FC<AuthProps> = ({ isModal, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle authentication logic here
        console.log('Form submitted:', { email, password, name });
        if (onClose) {
            onClose();
        }
    };

    if (!isModal) {
        return (
            <button className="auth-btn" onClick={onClose}>
                Login / Sign Up
            </button>
        );
    }

    return (
        <div className="auth-form-container">
            <div className="auth-tabs">
                <button
                    className={`auth-tab ${isLogin ? 'active' : ''}`}
                    onClick={() => setIsLogin(true)}
                >
                    Login
                </button>
                <button
                    className={`auth-tab ${!isLogin ? 'active' : ''}`}
                    onClick={() => setIsLogin(false)}
                >
                    Sign Up
                </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                {!isLogin && (
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            required
                        />
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                </div>

                <button type="submit" className="submit-btn">
                    {isLogin ? 'Login' : 'Sign Up'}
                </button>

                {isLogin && (
                    <button type="button" className="forgot-password">
                        Forgot Password?
                    </button>
                )}
            </form>
        </div>
    );
};

export default Auth;