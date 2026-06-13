import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, GraduationCap, Briefcase, Globe, Info, Save } from 'lucide-react';
import './ProfileSetup.css';

const ProfileSetup = () => {
    const navigate = useNavigate();

    // Basic mock profile state
    const [formData, setFormData] = useState({
        fullName: localStorage.getItem('userName') || '',
        email: localStorage.getItem('userEmail') || 'student@example.com',
        education: '',
        portfolio: '',
        reason: ''
    });

    const [skills, setSkills] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [loadingSkills, setLoadingSkills] = useState(true);

    useEffect(() => {
        // Pre-populate if profile already exists in DB
        const email = localStorage.getItem('userEmail');
        if (email) {
            fetch(`/api/users/${email}`)
                .then(res => {
                    if (res.ok) return res.json();
                })
                .then(user => {
                    if (user) {
                        setFormData({
                            fullName: user.fullName || localStorage.getItem('userName') || '',
                            email: user.email || email,
                            education: user.education || '',
                            portfolio: user.portfolio || '',
                            reason: user.reason || ''
                        });
                        if (user.skills) {
                            setSelectedSkills(user.skills);
                        }
                    }
                })
                .catch(err => console.error('Failed to pre-populate user profile:', err));
        }

        fetch('/api/skills')
            .then(res => res.json())
            .then(data => {
                setSkills(data.map(s => s.name));
                setLoadingSkills(false);
            })
            .catch(err => {
                console.error('Failed to fetch skills:', err);
                setLoadingSkills(false);
            });
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleSkill = (skill) => {
        if (selectedSkills.includes(skill)) {
            setSelectedSkills(selectedSkills.filter(s => s !== skill));
        } else {
            setSelectedSkills([...selectedSkills, skill]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let academicLevel = 'UG';
        if (formData.education.includes('Postgraduate') || formData.education.includes('Doctorate')) {
            academicLevel = 'PG';
        }

        const payload = { 
            ...formData, 
            skills: selectedSkills,
            academicLevel,
            experienceLevel: 'Beginner' // Default for new signups
        };

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                // Save user email to localStorage for context in other pages
                localStorage.setItem('userEmail', formData.email);
                navigate('/dashboard');
            } else {
                alert('Failed to save profile to database');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to connect to backend server');
        }
    };

    return (
        <div className="profile-setup-container animate-fade-in">
            <div className="profile-card glass-panel">
                <div className="card-header">
                    <h2>Complete Your Profile</h2>
                    <p>Tell us a bit about yourself so we can personalize your journey.</p>
                </div>

                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-grid">
                        {/* Full Name */}
                        <div className="form-group">
                            <label>Full Name *</label>
                            <div className="input-with-icon">
                                <User size={18} className="input-icon" />
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="e.g. John Doe"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email (Read-only mock) */}
                        <div className="form-group">
                            <label>Email Address</label>
                            <div className="input-with-icon disabled-input">
                                <Mail size={18} className="input-icon" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    readOnly
                                />
                            </div>
                            <small className="help-text">Your email is managed by your login provider.</small>
                        </div>

                        {/* Education Level */}
                        <div className="form-group">
                            <label>Education Level *</label>
                            <div className="input-with-icon">
                                <GraduationCap size={18} className="input-icon" />
                                <select name="education" value={formData.education} onChange={handleChange} required>
                                    <option value="" disabled>Select highest level</option>
                                    <option value="High School">High School</option>
                                    <option value="Undergraduate">Undergraduate (UG)</option>
                                    <option value="Postgraduate">Postgraduate (PG)</option>
                                    <option value="Doctorate">Doctorate (PhD)</option>
                                </select>
                            </div>
                        </div>

                        {/* Portfolio (Optional) */}
                        <div className="form-group">
                            <label>Portfolio / Website (Optional)</label>
                            <div className="input-with-icon">
                                <Globe size={18} className="input-icon" />
                                <input
                                    type="url"
                                    name="portfolio"
                                    value={formData.portfolio}
                                    onChange={handleChange}
                                    placeholder="https://yourportfolio.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Skills (Multi-select mock) */}
                    <div className="form-group mt-4">
                        <label>Current Skills * <span className="help-text">(Select up to 3)</span></label>
                        <div className="skills-grid">
                            {loadingSkills ? (
                                <p className="help-text">Loading skills...</p>
                            ) : (
                                skills.map(skill => (
                                    <button
                                        type="button"
                                        key={skill}
                                        className={`skill-tag ${selectedSkills.includes(skill) ? 'selected' : ''}`}
                                        onClick={() => toggleSkill(skill)}
                                    >
                                        {skill}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Reason for using platform */}
                    <div className="form-group mt-4">
                        <label>Why are you using Kidpreneurs? *</label>
                        <div className="input-with-icon textarea-wrapper">
                            <Info size={18} className="input-icon textarea-icon" />
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                placeholder="What startup ideas or skills are you looking to build?"
                                rows={4}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-actions mt-6">
                        <button type="submit" className="btn-primary w-full" disabled={selectedSkills.length === 0}>
                            <Save size={18} /> Save & Continue to Dashboard
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetup;
