import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import Whiteboard from './components/Whiteboard';

function App() {
  const [serverStatus, setServerStatus] = useState('Checking...');

  useEffect(() => {
    fetch(import.meta.env.VITE_SERVER_URL ? import.meta.env.VITE_SERVER_URL.replace(/ws/, 'http') : 'http://localhost:3002')
      .then(() => setServerStatus('Online'))
      .catch(() => setServerStatus('Offline'));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/whiteboard/:id" element={<Whiteboard />} />
        <Route path="/whiteboard" element={
          <div className="app-container">
            <header className="header">
              <h1>Multidraw</h1>
              <span className={`status ${serverStatus.toLowerCase()}`}>{serverStatus}</span>
            </header>
            <main className="canvas-container">
              <div className="placeholder">Whiteboard Area (Coming Soon)</div>
            </main>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
