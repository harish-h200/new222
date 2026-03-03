import React from 'react';
import { ArrowRight, Brain, Rocket, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    return (
        <div className="home-container animate-fade-in">
            <header className="hero-section">
                <h1 className="hero-title">
                    Forge Your Future as a <span className="text-gradient">Kidpreneur</span>
                </h1>
                <p className="hero-subtitle">
                    Transform your raw skills into high-impact, VC-grade problem statements. Experience personalized, AI-driven learning trees designed to launch your startup journey.
                </p>
                <div className="hero-actions">
                    <Link to="/auth/register" className="btn-primary btn-large">
                        Get Started <ArrowRight size={20} />
                    </Link>
                    <button className="btn-secondary btn-large" onClick={() => window.scrollTo(0, 800)}>
                        Explore Platform
                    </button>
                </div>
            </header>

            <section className="features-grid container" id="features">
                <div className="feature-card glass-panel">
                    <Brain className="feature-icon" size={32} />
                    <h3>Psychometric Discovery</h3>
                    <p>Uncover your hidden strengths and get dynamically allocated to high-growth domains that fit your unique profile.</p>
                </div>
                <div className="feature-card glass-panel">
                    <Rocket className="feature-icon" size={32} />
                    <h3>VC-Grade Validation</h3>
                    <p>Draft and refine problem statements that address real-world challenges, ready to be pitched to actual investors.</p>
                </div>
                <div className="feature-card glass-panel">
                    <TrendingUp className="feature-icon" size={32} />
                    <h3>Dynamic Learning Trees</h3>
                    <p>Follow an AI-generated, multi-branch curriculum tailored specifically to your chosen problem and experience level.</p>
                </div>
            </section>
        </div>
    );
};

export default Home;
