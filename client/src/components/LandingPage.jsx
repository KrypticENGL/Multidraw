import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from "react-icons/fc";
import { FaUserSecret } from "react-icons/fa";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signInAnonymously,
    updateProfile,
    GoogleAuthProvider
} from "firebase/auth";
import { auth } from '../firebase';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLogin, setIsLogin] = useState(true);

    // Auto-dismiss error after 3 seconds
    React.useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            navigate('/home');
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
            console.error(err);
        }
    };

    const handleSocialLogin = async (providerName) => {
        setError('');
        let provider;
        if (providerName === 'google') provider = new GoogleAuthProvider();

        try {
            await signInWithPopup(auth, provider);
            navigate('/home');
        } catch (err) {
            setError(`Failed to login with ${providerName}.`);
            console.error(err);
        }
    };

    const handleAnonymousLogin = async () => {
        setError('');
        try {
            const result = await signInAnonymously(auth);
            // Generate random guest name
            const randomNumber = Math.floor(Math.random() * 9999);
            const guestName = `Guest_${randomNumber}`;

            // Update the user's display name
            await updateProfile(result.user, {
                displayName: guestName
            });

            navigate('/home');
        } catch (err) {
            setError('Failed to sign in anonymously.');
            console.error(err);
        }
    };

    return (
        <div className="landing-container">
            {error && <div className="error-toast">{error}</div>}
            <div className="main-card">
                <div className="left-panel">
                    {/* Ensure the image name matches exactly what is in public/ */}
                    <img src="/unnamed.jpg" alt="Abstract Art" className="panel-image" />
                    <div className="overlay-text">
                        <h2>Welcome to</h2>
                        <h1>MultiDraw</h1>
                    </div>
                </div>

                <div className="right-panel">
                    <div className="login-form-container">
                        <h2 className="login-header">{isLogin ? 'Login' : 'Sign Up'}</h2>

                        <form onSubmit={handleAuth}>
                            <div className="input-group">
                                <label>E-mail</label>
                                <input
                                    type="email"
                                    placeholder="someone@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    placeholder="********"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="login-btn">
                                {isLogin ? 'Login' : 'Sign Up'}
                            </button>

                            <div className="toggle-auth">
                                <span onClick={() => setIsLogin(!isLogin)}>
                                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                                </span>
                            </div>

                            <div className="divider">
                                <span>Or</span>
                            </div>

                            <div className="social-login">
                                <button type="button" className="social-btn" onClick={() => handleSocialLogin('google')}>
                                    <FcGoogle size={24} /> Google
                                </button>
                                <button type="button" className="social-btn guest-btn" onClick={handleAnonymousLogin}>
                                    <FaUserSecret size={24} /> Continue as Guest
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
