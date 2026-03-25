import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './PsychometricTest.css';

const questions = [
    {
        id: 1,
        text: "When facing a complex problem, what excites you most?",
        options: [
            { text: "Building intelligent models that can learn and predict", domain: "AI/ML", weight: 2 },
            { text: "Designing robust and scalable architectures", domain: "Backend", weight: 2 },
            { text: "Structuring and processing massive amounts of information", domain: "Data", weight: 2 }
        ]
    },
    {
        id: 2,
        text: "Which of these futuristic scenarios sounds most appealing as a career project?",
        options: [
            { text: "Developing a sentient AI assistant", domain: "AI/ML", weight: 2 },
            { text: "Building the core infrastructure of the next fast global network", domain: "Backend", weight: 2 },
            { text: "Creating a real-time global analytics pipeline", domain: "Data", weight: 2 }
        ]
    },
    {
        id: 3,
        text: "In your free time, what kind of problems do you naturally gravitate towards?",
        options: [
            { text: "Experimenting with LLMs and new algorithms", domain: "AI/ML", weight: 2 },
            { text: "Optimizing software and fixing system bottlenecks", domain: "Backend", weight: 2 },
            { text: "Organizing files efficiently or writing scripts for automation", domain: "Data", weight: 2 },
            { text: "Training models on large datasets (AI + Data)", domain: "Cross", weight: { 'AI/ML': 1, Data: 1 } }
        ]
    },
    {
        id: 4,
        text: "How do you prefer to validate your work?",
        options: [
            { text: "Checking accuracy, F1 scores, and model evaluations", domain: "AI/ML", weight: 1 },
            { text: "Running load tests and system performance benchmarks", domain: "Backend", weight: 1 },
            { text: "Verifying data integrity and pipeline throughput", domain: "Data", weight: 1 }
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
        const scores = { 'AI/ML': 0, Backend: 0, Data: 0 };

        Object.values(answers).forEach(opt => {
            if (opt.domain === "Cross") {
                scores['AI/ML'] += opt.weight['AI/ML'];
                scores.Data += opt.weight.Data;
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
