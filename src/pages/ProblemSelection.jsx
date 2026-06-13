import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Filter, Zap } from 'lucide-react';
import './ProblemSelection.css';

const domainSkillMapping = {
    'AI/ML': ['python', 'machine-learning', 'statistics', 'deep-learning', 'llm', 'rag', 'vector-db', 'mlops'],
    'Backend': ['system-design', 'backend', 'algorithms'],
    'Data': ['data-engineering', 'etl', 'pipelines']
};

const ProblemSelection = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // Domains/Tags passed from Psychometric test
    const recommendedDomains = location.state?.domains || ['AI/ML'];
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [goals, setGoals] = useState([]);

    useEffect(() => {
        async function fetchGoals() {
            try {
                const res = await fetch('/api/goals');
                if (res.ok) {
                    const data = await res.json();
                    setGoals(data);
                } else {
                    console.error("Error fetching goals from local API");
                }
            } catch (err) {
                console.error("Failed to connect to local API:", err);
            }
        }
        fetchGoals();
    }, []);

    // Get all unique tags from goals
    const allAvailableTags = Array.from(new Set(goals.flatMap(p => p.required_core_skills || [])));

    const handleSelectProblem = (problem) => {
        navigate('/dashboard/roadmap', { state: { problem, domains: recommendedDomains } });
    };

    // Filter goals based on core skills / mock domains
    const filteredProblems = goals.filter(p => {
        if (selectedFilter === 'All') return true;

        const tags = p.required_core_skills || [];
        if (selectedFilter === 'Recommended') {
            const recommendedSkills = recommendedDomains.flatMap(d => domainSkillMapping[d] || []);
            return tags.some(t => recommendedSkills.includes(t)) || tags.length === 0;
        }
        return tags.includes(selectedFilter);
    });

    return (
        <div className="selection-container container animate-fade-in">
            <div className="selection-header">
                <h2>Choose Your Mission</h2>
                <p className="subtitle">Select a futuristic problem statement based on your aligned domains to generate your roadmap.</p>

                <div className="filters-wrapper" style={{ flexWrap: 'wrap' }}>
                    <Filter size={18} className="text-secondary" />
                    <button
                        className={`filter-btn ${selectedFilter === 'All' ? 'active' : ''}`}
                        onClick={() => setSelectedFilter('All')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn ${selectedFilter === 'Recommended' ? 'active' : ''}`}
                        onClick={() => setSelectedFilter('Recommended')}
                    >
                        Recommended for You
                    </button>
                    {allAvailableTags.map(tag => (
                        <button
                            key={tag}
                            className={`filter-btn ${selectedFilter === tag ? 'active' : ''}`}
                            onClick={() => setSelectedFilter(tag)}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            <div className="problems-grid">
                {filteredProblems.map(problem => (
                    <div key={problem.id} className="problem-card glass-panel">
                        <div className="problem-icon-wrapper hybrid">
                            <Zap size={24} />
                        </div>
                        <div className="problem-domains">
                            {(problem.required_core_skills || []).map(d => (
                                <span key={d} className={`tag tag-${d.toLowerCase()}`}>{d}</span>
                            ))}
                        </div>
                        <h3>{problem.title}</h3>
                        <p>{problem.description || `Master the skills required for ${problem.title}.`}</p>
                        <button className="btn-primary mt-auto" onClick={() => handleSelectProblem(problem)}>
                            Construct Roadmap <ArrowRight size={16} style={{ marginLeft: '4px' }} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProblemSelection;

