import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './PsychometricTest.css';

const questions = [
    {
        id: 1,
        text: "When facing a complex system, what excites you most?",
        options: [
            { text: "Writing logic to automate its behavior", domain: "CSE", weight: 2 },
            { text: "Understanding the physical forces acting upon it", domain: "Aero", weight: 2 },
            { text: "Analyzing its economic viability and market impact", domain: "Finance", weight: 2 }
        ]
    },
    {
        id: 2,
        text: "Which of these futuristic scenarios sounds most appealing as a career project?",
        options: [
            { text: "Developing a sentient AI assistant", domain: "CSE", weight: 2 },
            { text: "Designing a reusable orbital spacecraft", domain: "Aero", weight: 2 },
            { text: "Creating a decentralized global currency system", domain: "Finance", weight: 2 }
        ]
    },
    {
        id: 3,
        text: "In your free time, what kind of problems do you naturally gravitate towards?",
        options: [
            { text: "Optimizing software or fixing bugs", domain: "CSE", weight: 2 },
            { text: "Building models or understanding aerodynamics", domain: "Aero", weight: 2 },
            { text: "Tracking investments or predicting market trends", domain: "Finance", weight: 2 },
            { text: "Programming drone flight paths (Software + Physics)", domain: "Cross", weight: { CSE: 1, Aero: 1 } }
        ]
    },
    {
        id: 4,
        text: "How do you prefer to validate your work?",
        options: [
            { text: "Running unit tests and code compilation", domain: "CSE", weight: 1 },
            { text: "Wind tunnel simulations and material stress tests", domain: "Aero", weight: 1 },
            { text: "Statistical backtesting and financial modeling", domain: "Finance", weight: 1 }
        ]
    }
];

const PsychometricTest = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isFinished, setIsFinished] = useState(false);
    const [recommendedDomains, setRecommendedDomains] = useState([]);

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

    const calculateResults = () => {
        const scores = { CSE: 0, Aero: 0, Finance: 0 };

        Object.values(answers).forEach(opt => {
            if (opt.domain === "Cross") {
                scores.CSE += opt.weight.CSE;
                scores.Aero += opt.weight.Aero;
            } else {
                scores[opt.domain] += opt.weight;
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
                    <h2>Test Complete!</h2>
                    <p className="results-subtitle">Based on your responses, your aptitude aligns perfectly with:</p>

                    <div className="domains-wrapper">
                        {recommendedDomains.map(domain => (
                            <div key={domain} className={`domain-badge domain-${domain.toLowerCase()}`}>
                                {domain === 'CSE' ? 'Computer Science' : domain === 'Aero' ? 'Aerospace Engineering' : 'Financial Technology'}
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
