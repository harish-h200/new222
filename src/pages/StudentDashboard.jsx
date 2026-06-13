import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Brain, Compass, Key, Settings, BarChart2, Map } from 'lucide-react';
import './StudentDashboard.css';

const ProfileView = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const email = localStorage.getItem('userEmail');

    useEffect(() => {
        if (!email) {
            setLoading(false);
            return;
        }
        fetch(`/api/users/${email}`)
            .then(res => res.json())
            .then(data => {
                setUser(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [email]);

    if (loading) return <div className="dashboard-content-box"><p>Loading profile data...</p></div>;
    if (!user) return <div className="dashboard-content-box"><h3>No Profile Found</h3><p>Please register or set up your profile first.</p></div>;

    return (
        <div className="dashboard-content-box animate-fade-in">
            <h2>Your Profile</h2>
            <p>Here are your registered profile details and skills.</p>

            <div className="profile-details-grid">
                <div className="profile-detail-card">
                    <label>Full Name</label>
                    <div className="profile-detail-value">{user.fullName || 'Not Provided'}</div>
                </div>
                <div className="profile-detail-card">
                    <label>Email Address</label>
                    <div className="profile-detail-value">{user.email}</div>
                </div>
                <div className="profile-detail-card">
                    <label>Education</label>
                    <div className="profile-detail-value">{user.education || 'Not Provided'}</div>
                </div>
                <div className="profile-detail-card">
                    <label>Experience Level</label>
                    <div className="profile-detail-value">{user.experienceLevel || 'Beginner'}</div>
                </div>
                <div className="profile-detail-card full-width">
                    <label>Portfolio / Social Link</label>
                    <div className="profile-detail-value">
                        {user.portfolio ? (
                            <a href={user.portfolio.startsWith('http') ? user.portfolio : `https://${user.portfolio}`} target="_blank" rel="noopener noreferrer" style={{ color: '#a5b4fc', textDecoration: 'underline' }}>
                                {user.portfolio}
                            </a>
                        ) : 'Not Provided'}
                    </div>
                </div>
                <div className="profile-detail-card full-width">
                    <label>Reason for Joining</label>
                    <div className="profile-detail-value">{user.reason || 'Not Provided'}</div>
                </div>
                <div className="profile-detail-card full-width">
                    <label>Selected Skills</label>
                    <div className="skills-container">
                        {user.skills && user.skills.length > 0 ? (
                            user.skills.map((skill, index) => (
                                <span key={index} className="skill-tag">{skill}</span>
                            ))
                        ) : (
                            <span style={{ color: 'var(--text-secondary)' }}>No skills selected.</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DomainAllocation = () => {
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const email = localStorage.getItem('userEmail');

    useEffect(() => {
        if (!email) {
            setLoading(false);
            return;
        }
        fetch(`/api/users/${email}/domain-allocations`)
            .then(res => res.json())
            .then(data => {
                setAllocations(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [email]);

    const domainInfo = {
        'AI/ML': {
            title: 'AI & Machine Learning',
            desc: 'Focuses on designing and deploying intelligent models, training neural networks, working with computer vision/NLP, and building agents.'
        },
        'Backend': {
            title: 'Backend Systems',
            desc: 'Centers around designing high-performance databases, constructing REST/GraphQL APIs, implementing authentication, security, and cloud scalability workflows.'
        },
        'Data': {
            title: 'Data Engineering',
            desc: 'Concentrates on building scalable data pipelines, streaming real-time information, managing storage schemas, ETL/ELT pipelines, and data analytics.'
        }
    };

    if (loading) return <div className="dashboard-content-box"><p>Loading domain allocations...</p></div>;

    return (
        <div className="dashboard-content-box animate-fade-in">
            <h2>Domain Allocations</h2>
            <p className="mb-6">Your startup development track is determined by your psychometric responses. Here is your domain alignment details:</p>

            {allocations.length === 0 ? (
                <div className="dashboard-content-box mt-6" style={{ padding: '40px', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
                    <p>You have not been allocated any domains yet because you haven't taken the Psychometric Test.</p>
                    <Link to="/test" className="btn-primary mt-4 inline-block">Take Psychometric Test Now</Link>
                </div>
            ) : (
                allocations.map((alloc) => {
                    const info = domainInfo[alloc.domain] || { title: alloc.domain, desc: 'Dynamic specialized technological domain calculated based on your responses.' };
                    return (
                        <div key={alloc.id} className="allocation-card animate-fade-in">
                            <div className="allocation-header">
                                <span className="allocation-badge">{info.title}</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Allocated: {new Date(alloc.allocatedAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="allocation-desc">
                                {info.desc}
                            </div>
                            <div className="allocation-reason">
                                <strong>Why this was allocated:</strong> {alloc.reason}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

const PeriodicTests = () => {
    const [testResults, setTestResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const email = localStorage.getItem('userEmail');

    useEffect(() => {
        if (!email) {
            setLoading(false);
            return;
        }
        fetch(`/api/users/${email}/test-results`)
            .then(res => res.json())
            .then(data => {
                setTestResults(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [email]);

    if (loading) return <div className="dashboard-content-box"><p>Loading test analytics...</p></div>;

    const latestResult = testResults[0];

    return (
        <div className="dashboard-content-box animate-fade-in">
            <h2>Aptitude Test Analytics</h2>
            <p className="mb-6">Analyze your psychometric alignment and domain fit levels from your evaluations.</p>

            {!latestResult ? (
                <div className="dashboard-content-box mt-6" style={{ padding: '40px', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
                    <p>No aptitude test analytics available. Complete the psychometric evaluation to see your scoring stats!</p>
                    <Link to="/test" className="btn-primary mt-4 inline-block">Take Psychometric Test Now</Link>
                </div>
            ) : (
                <div className="glass-panel animate-fade-in" style={{ padding: '24px', borderRadius: '12px' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Latest Score Breakdown</h3>
                    
                    {Object.entries(latestResult.scores).map(([domain, score]) => {
                        const percentage = Math.min((score / 10) * 100, 100);
                        return (
                            <div key={domain} className="metric-row">
                                <div className="metric-header">
                                    <span>{domain === 'AI/ML' ? 'AI & Machine Learning' : domain === 'Backend' ? 'Backend Systems' : 'Data Engineering'}</span>
                                    <span>{score} pts ({Math.round(percentage)}%)</span>
                                </div>
                                <div className="metric-bar-bg">
                                    <div className="metric-bar-fill" style={{ width: `${percentage}%` }}></div>
                                </div>
                            </div>
                        );
                    })}

                    <p style={{ marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Evaluated on: {new Date(latestResult.createdAt).toLocaleString()}
                    </p>
                </div>
            )}
        </div>
    );
};

const StudentDashboard = () => {
    const location = useLocation();
    const [hasAllocations, setHasAllocations] = useState(false);
    const email = localStorage.getItem('userEmail');

    useEffect(() => {
        if (!email) return;
        fetch(`/api/users/${email}/domain-allocations`)
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    setHasAllocations(true);
                }
            })
            .catch(err => console.error(err));
    }, [email]);

    const navItems = [
        { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview' },
        { path: '/dashboard/profile', icon: <Settings size={20} />, label: 'Profile' },
        { path: '/test', icon: <Brain size={20} />, label: 'Psychometric Test' },
        { path: '/dashboard/domain-allocation', icon: <Compass size={20} />, label: 'Domain Allocation' },
        { path: '/select-problem', icon: <Key size={20} />, label: 'Problem Selection' },
        { path: '/dashboard/roadmap', icon: <Map size={20} />, label: 'Roadmap Generator' },
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
                            <h2>Welcome to Kidpreneurs, {localStorage.getItem('userName') || 'Entrepreneur'}!</h2>
                            {hasAllocations ? (
                                <>
                                    <p className="mt-4">You have completed the psychometric test and unlocked your domain alignments. You can now select a problem statement and generate your personalized learning roadmap.</p>
                                    <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                                        <Link to="/select-problem" className="btn-primary">Select Problem Statement</Link>
                                        <Link to="/test" className="btn-secondary">View Test Results</Link>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="mt-4">You have successfully setup your profile. Your next step is to take the <strong>Psychometric Test</strong> to uncover your natural domain affinities and start generating VC-grade problem statements.</p>
                                    <Link to="/test" className="btn-primary mt-6">Take Psychometric Test</Link>
                                </>
                            )}
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
