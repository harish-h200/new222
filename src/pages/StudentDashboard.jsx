import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Brain, Compass, Key, Settings, BarChart2, Map } from 'lucide-react';
import './StudentDashboard.css';

// Placeholder components for nested routes
const ProfileView = () => <div className="dashboard-content-box"><h3>Your Profile</h3><p>Manage your skills, education, and portfolio.</p></div>;
const DomainAllocation = () => <div className="dashboard-content-box"><h3>Domain Allocation</h3><p>Your ideal domain fit based on test results.</p></div>;
const PeriodicTests = () => <div className="dashboard-content-box"><h3>Periodic Tests & Analytics</h3><p>Track your learning tree progress and test scores.</p></div>;

const StudentDashboard = () => {
    const location = useLocation();

    const navItems = [
        { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview' },
        { path: '/dashboard/profile', icon: <Settings size={20} />, label: 'Profile' },
        { path: '/test', icon: <Brain size={20} />, label: 'Psychometric Test', external: true },
        { path: '/dashboard/domain-allocation', icon: <Compass size={20} />, label: 'Domain Allocation' },
        { path: '/select-problem', icon: <Key size={20} />, label: 'Problem Selection', external: true },
        { path: '/roadmap', icon: <Map size={20} />, label: 'Roadmap Generator', external: true },
        { path: '/dashboard/analytics', icon: <BarChart2 size={20} />, label: 'Tests & Progress' },
    ];

    return (
        <div className="dashboard-layout animate-fade-in">
            <aside className="dashboard-sidebar glass-panel">
                <div className="sidebar-header">
                    <h3>Student Portal</h3>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>

            <main className="dashboard-main glass-panel">
                <Routes>
                    <Route path="/" element={
                        <div className="dashboard-content-box">
                            <h2>Welcome to Kidpreneurs</h2>
                            <p className="mt-4">You have successfully setup your profile. Your next step is to take the <strong>Psychometric Test</strong> to uncover your natural domain affinities and start generating VC-grade problem statements.</p>
                            <Link to="/test" className="btn-primary mt-6">Take Psychometric Test</Link>
                        </div>
                    } />
                    <Route path="/profile" element={<ProfileView />} />
                    <Route path="/domain-allocation" element={<DomainAllocation />} />
                    <Route path="/analytics" element={<PeriodicTests />} />
                </Routes>
            </main>
        </div>
    );
};

export default StudentDashboard;
