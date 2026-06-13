import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './PsychometricTest.css';

const PsychometricTest = () => {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isFinished, setIsFinished] = useState(false);
    const [recommendedDomains, setRecommendedDomains] = useState([]);
    const [alreadyCompleted, setAlreadyCompleted] = useState(false);

    useEffect(() => {
        const email = localStorage.getItem('userEmail');
        if (email) {
            setLoading(true);
            fetch(`/api/users/${email}/domain-allocations`)
                .then(res => res.json())
                .then(allocations => {
                    if (allocations && allocations.length > 0) {
                        setRecommendedDomains(allocations.map(a => a.domain));
                        setIsFinished(true);
                        setAlreadyCompleted(true);
                        setLoading(false);
                    } else {
                        loadQuestions();
                    }
                })
                .catch(err => {
                    console.error('Failed to fetch allocations:', err);
                    loadQuestions();
                });
        } else {
            loadQuestions();
        }

        function loadQuestions() {
            fetch('/api/questions')
                .then(res => res.json())
                .then(data => {
                    setQuestions(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Failed to fetch questions:', err);
                    setLoading(false);
                });
        }
    }, []);

    const handleOptionSelect = (questionId, option) => {
        setAnswers(prev => ({ ...prev, [questionId]: option }));
    };

    const handleNext = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            calculateResults();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    const calculateResults = async () => {
        const scores = { 'AI/ML': 0, Backend: 0, Data: 0 };

        Object.values(answers).forEach(opt => {
            if (opt.domain === "Cross") {
                const wAI = typeof opt.weight === 'object' ? (opt.weight?.['AI/ML'] || 0) : opt.weight;
                const wData = typeof opt.weight === 'object' ? (opt.weight?.Data || 0) : opt.weight;
                scores['AI/ML'] += wAI;
                scores.Data += wData;
            } else {
                const w = typeof opt.weight === 'object' ? (opt.weight?.[opt.domain] || 0) : opt.weight;
                scores[opt.domain] += w;
            }
        });

        // Find the top domains (can be multiple if scores are close)
        const sortedDomains = Object.entries(scores).sort((a, b) => b[1] - a[1]);
        const maxScore = sortedDomains[0][1];

        const recommendations = sortedDomains
            .filter(([_, score]) => score >= maxScore - 1) // Recommend top ones or ones very close to top
            .map(([domain]) => domain);

        setRecommendedDomains(recommendations);
        setIsFinished(true);

        // Save results and allocations to database
        const email = localStorage.getItem('userEmail');
        if (email) {
            try {
                await fetch('/api/test-results', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, scores })
                });
            } catch (err) {
                console.error('Failed to save test results to DB:', err);
            }
        }
    };

    const proceedToProblemSelection = () => {
        // Navigate to problem selection, passing state
        navigate('/select-problem', { state: { domains: recommendedDomains } });
    };

    if (isFinished) {
        return (
            <div className="test-container container animate-fade-in">
                <div className="results-card glass-panel">
                    <CheckCircle className="success-icon" size={64} />
                    <h2>{alreadyCompleted ? "Your Test Results" : "Test Complete!"}</h2>
                    <p className="results-subtitle">
                        {alreadyCompleted 
                            ? "You have already completed the psychometric test. Your aptitude aligns with:" 
                            : "Based on your responses, your aptitude aligns perfectly with:"}
                    </p>

                    <div className="domains-wrapper">
                        {recommendedDomains.map(domain => (
                            <div key={domain} className={`domain-badge domain-${domain.toLowerCase().replace('/', '-')}`}>
                                {domain === 'AI/ML' ? 'AI & Machine Learning' : domain === 'Backend' ? 'Backend Systems' : 'Data Engineering'}
                            </div>
                        ))}
                    </div>

                    <p className="results-desc">
                        We have tailored a list of futuristic problem statements specifically for you.
                        You can choose to focus on a single domain or tackle a multidisciplinary challenge.
                    </p>

                    <button className="btn-primary btn-large mt-8" onClick={proceedToProblemSelection}>
                        View Problem Statements <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="test-container container animate-fade-in">
                <div className="results-card glass-panel" style={{ textAlign: 'center', padding: '60px 40px' }}>
                    <p className="results-subtitle">Loading psychometric questions...</p>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="test-container container animate-fade-in">
                <div className="results-card glass-panel" style={{ textAlign: 'center', padding: '60px 40px' }}>
                    <p className="results-subtitle">No questions loaded from database.</p>
                </div>
            </div>
        );
    }

    const question = questions[currentStep];
    const progressPercentage = ((currentStep + 1) / questions.length) * 100;

    return (
        <div className="test-container container animate-fade-in">
            <div className="test-header">
                <h2>Psychometric Mapping</h2>
                <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <div className="step-indicator">Question {currentStep + 1} of {questions.length}</div>
            </div>

            <div className="question-card glass-panel">
                <h3 className="question-text">{question.text}</h3>

                <div className="options-grid">
                    {question.options.map((opt, idx) => {
                        const isSelected = answers[question.id]?.text === opt.text;
                        return (
                            <button
                                key={idx}
                                className={`option-btn ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleOptionSelect(question.id, opt)}
                            >
                                {opt.text}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="navigation-buttons">
                <button
                    className="btn-secondary"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    style={{ opacity: currentStep === 0 ? 0.5 : 1, cursor: currentStep === 0 ? 'not-allowed' : 'pointer' }}
                >
                    <ArrowLeft size={20} /> Previous
                </button>
                <button
                    className="btn-primary"
                    onClick={handleNext}
                    disabled={!answers[question.id]}
                    style={{ opacity: !answers[question.id] ? 0.5 : 1, cursor: !answers[question.id] ? 'not-allowed' : 'pointer' }}
                >
                    {currentStep === questions.length - 1 ? 'Finish Test' : 'Next Question'} <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default PsychometricTest;
