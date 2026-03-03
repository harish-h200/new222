import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Filter, Zap } from 'lucide-react';
import './ProblemSelection.css';

const MOCK_PROBLEMS = [
    { id: 1, title: 'Autonomous Swarm Satellites', domains: ['Aero', 'CSE'], desc: 'Develop AI algorithms to coordinate a massive swarm of nano-satellites for global internet coverage without collisions.' },
    { id: 2, title: 'Automated Landing Rocket', domains: ['Aero', 'CSE'], desc: 'Build the core control system for a reusable launch vehicle capable of pinpoint autonomous landing.' },
    { id: 3, title: 'Real-time AI Market Predictor', domains: ['CSE', 'Finance'], desc: 'Create a deep learning model that ingests heterogeneous data streams to predict micro-fluctuations in global markets.' },
    { id: 4, title: 'Quantum High-Frequency Trading Bot', domains: ['Finance', 'CSE'], desc: 'Design a simulation of a trading system utilizing quantum algorithms to execute trades faster than the speed of light allows theoretically.' },
    { id: 5, title: 'Cognitive Software Debugger', domains: ['CSE'], desc: 'Engineer an AI that can autonomously review, understand, and rewrite legacy codebases of automated robotics.' },
    { id: 6, title: 'Next-Gen Hypersonic Drone Propulsion', domains: ['Aero'], desc: 'Design the thermodynamic models and CAD for an air-breathing hypersonic propulsion engine.' },
    { id: 7, title: 'Decentralized Space Commerce Ledger', domains: ['Finance', 'Aero', 'CSE'], desc: 'Architect a blockchain network capable of handling interstellar financial transactions resilient to high latency and relativistic effects.' }
];

const ProblemSelection = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // Domains passed from Psychometric test
    const recommendedDomains = location.state?.domains || ['CSE'];
    const [selectedFilter, setSelectedFilter] = useState('All');

    const allAvailableDomains = ['CSE', 'Aero', 'Finance'];

    const handleSelectProblem = (problem) => {
        navigate('/roadmap', { state: { problem, domains: recommendedDomains } });
    };

    const filteredProblems = MOCK_PROBLEMS.filter(p => {
        if (selectedFilter === 'All') return true;
        if (selectedFilter === 'Recommended') {
            return p.domains.some(d => recommendedDomains.includes(d));
        }
        return p.domains.includes(selectedFilter);
    });

    return (
        <div className="selection-container container animate-fade-in">
            <div className="selection-header">
                <h2>Choose Your Mission</h2>
                <p className="subtitle">Select a futuristic problem statement based on your aligned domains to generate your roadmap.</p>

                <div className="filters-wrapper">
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
                    {allAvailableDomains.map(d => (
                        <button
                            key={d}
                            className={`filter-btn ${selectedFilter === d ? 'active' : ''}`}
                            onClick={() => setSelectedFilter(d)}
                        >
                            {d === 'CSE' ? 'Computer Science' : d === 'Aero' ? 'Aerospace' : 'Finance'} Only
                        </button>
                    ))}
                </div>
            </div>

            <div className="problems-grid">
                {filteredProblems.map(problem => (
                    <div key={problem.id} className="problem-card glass-panel">
                        <div className={`problem-icon-wrapper ${problem.domains.includes('Aero') && problem.domains.includes('CSE') ? 'hybrid' : problem.domains[0].toLowerCase()}`}>
                            <Zap size={24} />
                        </div>
                        <div className="problem-domains">
                            {problem.domains.map(d => (
                                <span key={d} className={`tag tag-${d.toLowerCase()}`}>{d}</span>
                            ))}
                        </div>
                        <h3>{problem.title}</h3>
                        <p>{problem.desc}</p>
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
