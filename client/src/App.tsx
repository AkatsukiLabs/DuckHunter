import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthCallback } from './components/auth/AuthCallback';
import { LoginScreen } from './components/LoginScreen';
import { GameScreen } from './components/GameScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import useGameStore from './store/gameStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isConnected = useGameStore(state => state.cavos.isAuthenticated);
  
  if (!isConnected) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  const handleAuthComplete = (success: boolean) => {
    if (success) {
      // Redirect to username flow
      window.location.href = '/login?step=username';
    } else {
      // Redirect back to login
      window.location.href = '/login';
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route 
          path="/auth/callback" 
          element={<AuthCallback onAuthComplete={handleAuthComplete} />} 
        />
        <Route path="/game" element={
          <ProtectedRoute>
            <GameScreen />
          </ProtectedRoute>
        } />
        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <LeaderboardScreen onBack={() => window.location.href = '/game'} />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;