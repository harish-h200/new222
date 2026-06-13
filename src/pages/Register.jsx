import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Rocket, Mail, Lock, UserPlus, User } from 'lucide-react';
import './Auth.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = (e) => {
        e.preventDefault();
        console.log('Registering', name, email);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', name);
        navigate('/onboarding/profile');
    };

    const handleGoogleAuth = () => {
        const email = prompt("Enter your Google Account email:", "student@example.com");
        if (!email) return;
        localStorage.setItem('userEmail', email);
        navigate('/onboarding/profile');
    };

    return (
        <div className="auth-container animate-fade-in">
            <div className="auth-card glass-panel">
                <div className="auth-header">
                    <Rocket className="logo-icon mx-auto mb-4" size={40} />
                    <h2>Join Kidpreneurs</h2>
                    <p>Create your account and start building VC-grade problem statements.</p>
                </div>

                <form className="auth-form" onSubmit={handleRegister}>
                    <div className="input-group">
                        <User className="input-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
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
                            placeholder="Create Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full mt-4">
                        <UserPlus size={18} /> Create Account
                    </button>
                </form>

                <div className="auth-divider">
                    <span>OR</span>
                </div>

                <button className="btn-secondary w-full google-btn" onClick={handleGoogleAuth}>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="google-icon" />
                    Sign up with Google
                </button>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/auth/login" className="text-gradient hover-trigger">Log in</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
