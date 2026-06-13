import React from 'react';
import { Rocket, LogIn, UserPlus, LogOut, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = localStorage.getItem('userEmail');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <nav className="navbar glass-panel">
            <div className="container nav-container">
                <Link to="/" className="nav-logo">
                    <Rocket className="logo-icon" size={28} />
                    <span className="logo-text text-gradient">Kidpreneurs</span>
                </Link>
                <div className="nav-links">
                    {email ? (
                        <>
                            <Link to="/dashboard" className="btn-secondary nav-btn"><LayoutDashboard size={16} /> Dashboard</Link>
                            <button onClick={handleLogout} className="btn-primary nav-btn"><LogOut size={16} /> Log Out</button>
                        </>
                    ) : (
                        <>
                            <Link to="/auth/login" className="btn-secondary nav-btn"><LogIn size={16} /> Log In</Link>
                            <Link to="/auth/register" className="btn-primary nav-btn"><UserPlus size={16} /> Get Started</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
