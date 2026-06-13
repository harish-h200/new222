import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import PsychometricTest from './pages/PsychometricTest';
import ProblemSelection from './pages/ProblemSelection';
import RoadmapGenerator from './pages/RoadmapGenerator';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileSetup from './pages/ProfileSetup';
import StudentDashboard from './pages/StudentDashboard';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Navigate to="/auth/login" replace />} />
            <Route path="/register" element={<Navigate to="/auth/register" replace />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/onboarding/profile" element={<ProfileSetup />} />
            <Route path="/dashboard/*" element={<StudentDashboard />} />
            <Route path="/test" element={<PsychometricTest />} />
            <Route path="/select-problem" element={<ProblemSelection />} />
            <Route path="/roadmap" element={<RoadmapGenerator />} />
            <Route path="/dashboard/roadmap" element={<RoadmapGenerator />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
