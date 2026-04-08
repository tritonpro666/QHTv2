import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import MainMenu from './pages/MainMenu';
import GameBoard from './pages/GameBoard';
import DebugOverlay from './components/DebugOverlay';
import { useGameStore } from './store/gameStore';

function App() {
  const { rehydrateProfile } = useGameStore();

  React.useEffect(() => {
    rehydrateProfile();
  }, [rehydrateProfile]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/menu" element={<MainMenu />} />
        <Route path="/game" element={<GameBoard />} />
      </Routes>
      <DebugOverlay />
    </Router>
  );
}

export default App;
