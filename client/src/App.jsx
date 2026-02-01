import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import Whiteboard from './components/Whiteboard';

function App() {
  const [serverStatus, setServerStatus] = useState('Checking...');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetch(import.meta.env.VITE_SERVER_URL ? import.meta.env.VITE_SERVER_URL.replace(/ws/, 'http') : 'http://localhost:3002')
      .then(() => setServerStatus('Online'))
      .catch(() => setServerStatus('Offline'));
  }, []);

  // Show loading state while checking auth
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1c1c1c', color: 'white' }}>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/home" replace /> : <LandingPage />} />
        <Route path="/home" element={user ? <HomePage /> : <Navigate to="/" replace />} />
        <Route path="/whiteboard/:id" element={user ? <Whiteboard /> : <Navigate to="/" replace />} />
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
