import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, GraduationCap, Briefcase, Globe, Info, Save } from 'lucide-react';
import './ProfileSetup.css';

const MOCK_SKILLS = [
    'JavaScript', 'Python', 'React', 'Node.js', 'Machine Learning',
    'Data Science', 'Aerodynamics', 'Finance Modeling', 'Blockchain',
    'UI/UX Design', 'Hardware IoT', 'Robotics'
];

const ProfileSetup = () => {
    const navigate = useNavigate();

    // Basic mock profile state
    const [formData, setFormData] = useState({
        fullName: '',
        email: 'student@example.com', // Mocking read-only field (if came from Google)
        education: '',
        portfolio: '',
        reason: ''
    });

    const [selectedSkills, setSelectedSkills] = useState([]);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate POST /api/user/profile
        const payload = { ...formData, skills: selectedSkills };
        console.log('Sending Profile Setup payload:', payload);

        // Navigate to student dashboard main page
        navigate('/dashboard');
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
                            {MOCK_SKILLS.map(skill => (
                                <button
                                    type="button"
                                    key={skill}
                                    className={`skill-tag ${selectedSkills.includes(skill) ? 'selected' : ''}`}
                                    onClick={() => toggleSkill(skill)}
                                >
                                    {skill}
                                </button>
                            ))}
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
