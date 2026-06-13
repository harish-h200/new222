import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Rocket, Mail, Lock, LogIn } from 'lucide-react';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log('Logging in with', email);
        
        localStorage.setItem('userEmail', email);

        try {
            // Check if user already exists on the backend
            const response = await fetch(`/api/users/${email}`);
            if (response.ok) {
                const user = await response.json();
                localStorage.setItem('userName', user.fullName || '');
                navigate('/dashboard');
            } else {
                navigate('/onboarding/profile');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            navigate('/onboarding/profile');
        }
    };

    const handleGoogleAuth = async () => {
        const email = prompt("Enter your Google Account email:", "student@example.com");
        if (!email) return;

        localStorage.setItem('userEmail', email);

        try {
            const response = await fetch(`/api/users/${email}`);
            if (response.ok) {
                const user = await response.json();
                localStorage.setItem('userName', user.fullName || '');
                navigate('/dashboard');
            } else {
                navigate('/onboarding/profile');
            }
        } catch (error) {
            console.error('Error with Google Auth:', error);
            navigate('/onboarding/profile');
        }
    };

    return (
        <div className="auth-container animate-fade-in">
            <div className="auth-card glass-panel">
                <div className="auth-header">
                    <Rocket className="logo-icon mx-auto mb-4" size={40} />
                    <h2>Welcome Back</h2>
                    <p>Login to your Kidpreneurs account to continue your journey.</p>
                </div>

                <form className="auth-form" onSubmit={handleLogin}>
                    <div className="input-group">
                        <Mail className="input-icon" size={20} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <Lock className="input-icon" size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full mt-4">
                        <LogIn size={18} /> Sign In
                    </button>
                </form>

                <div className="auth-divider">
                    <span>OR</span>
                </div>

                <button className="btn-secondary w-full google-btn" onClick={handleGoogleAuth}>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="google-icon" />
                    Continue with Google
                </button>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/auth/register" className="text-gradient hover-trigger">Sign up here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
