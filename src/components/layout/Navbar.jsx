import React from 'react';
import { Rocket, LogIn, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar glass-panel">
            <div className="container nav-container">
                <Link to="/" className="nav-logo">
                    <Rocket className="logo-icon" size={28} />
                    <span className="logo-text text-gradient">Kidpreneurs</span>
                </Link>
                <div className="nav-links">
                    <Link to="/login" className="btn-secondary nav-btn"><LogIn size={16} /> Log In</Link>
                    <Link to="/register" className="btn-primary nav-btn"><UserPlus size={16} /> Get Started</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
