import React, { useState, useEffect } from 'react';
import { StartScreen } from './components/StartScreen';
import { Game, GameResults } from './components/Game';
import { SummaryScreen } from './components/SummaryScreen';
import { AdminScreen } from './components/AdminScreen';
import { AuditDashboard } from './components/AuditDashboard';
import { WasteItem, getRandomItems, getInventory, saveInventory } from './data/inventory';
import { submitAuditRecord } from './services/auditApi';

type GameState = 'start' | 'playing' | 'summary' | 'admin' | 'audit';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [inventory, setInventory] = useState<WasteItem[]>([]);
  const [currentItems, setCurrentItems] = useState<WasteItem[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string>('All');
  
  // Track paired user session and attempt stage (1st Attempt vs 2nd Attempt)
  const [sessionId, setSessionId] = useState(() => Math.random().toString(36).substring(2, 10));
  const [attemptType, setAttemptType] = useState<'1st Attempt' | '2nd Attempt'>('1st Attempt');
  const [results, setResults] = useState<GameResults | null>(null);
  const [round1Results, setRound1Results] = useState<GameResults | null>(null);

  useEffect(() => {
    setInventory(getInventory());
  }, []);

  const handleStartGame = (scenario: string) => {
    // Starting fresh baseline session (Round 1)
    setSelectedScenario(scenario);
    setAttemptType('1st Attempt');
    setRound1Results(null);
    setSessionId(Math.random().toString(36).substring(2, 10));
    setCurrentItems(getRandomItems(inventory, scenario, 10));
    setGameState('playing');
  };

  const handleGameComplete = async (gameResults: GameResults) => {
    if (attemptType === '1st Attempt') {
      setRound1Results(gameResults);
    }
    setResults(gameResults);

    // Save to backend cloud database immediately
    try {
      await submitAuditRecord({
        sessionId,
        scenario: selectedScenario,
        attemptType,
        score: gameResults.score,
        totalItems: gameResults.totalItems,
        accuracyPercent: gameResults.accuracyPercent,
        wastedCost: gameResults.wastedCost,
        correctCount: gameResults.correct,
        incorrectCount: gameResults.incorrect,
        timeSpentSeconds: gameResults.timeSpentSeconds,
        mistakes: gameResults.mistakes || []
      });
    } catch (err) {
      console.error('Failed to submit score to audit API:', err);
    }

    setGameState('summary');
  };

  const handleRestart = () => {
    if (attemptType === '1st Attempt') {
      // Advance to 2nd Attempt for the same session to measure knowledge increment
      setAttemptType('2nd Attempt');
      setCurrentItems(getRandomItems(inventory, selectedScenario, 10));
      setGameState('playing');
    } else {
      // Start a new 2-round assessment cycle with a fresh session
      setAttemptType('1st Attempt');
      setSessionId(Math.random().toString(36).substring(2, 10));
      setCurrentItems(getRandomItems(inventory, selectedScenario, 10));
      setGameState('playing');
    }
  };

  const handleNewScenarios = () => {
    setAttemptType('1st Attempt');
    setGameState('start');
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#f0f4f8] text-slate-900 font-sans">
      {gameState === 'start' && (
        <StartScreen 
          inventory={inventory} 
          onStart={handleStartGame} 
          onOpenAudit={() => setGameState('audit')} 
        />
      )}

      {gameState === 'playing' && currentItems.length > 0 && (
        <Game 
          items={currentItems} 
          scenario={selectedScenario} 
          attemptType={attemptType}
          onComplete={handleGameComplete} 
          onExit={() => {
            setAttemptType('1st Attempt');
            setRound1Results(null);
            setGameState('start');
          }} 
        />
      )}

      {gameState === 'summary' && results && (
        <SummaryScreen 
          results={results} 
          round1Results={round1Results}
          attemptType={attemptType}
          onRestart={handleRestart} 
          onNewScenarios={handleNewScenarios} 
          onExit={() => {
            setAttemptType('1st Attempt');
            setRound1Results(null);
            setGameState('start');
          }} 
        />
      )}

      {gameState === 'admin' && (
        <AdminScreen 
          inventory={inventory} 
          onSave={(inv) => {
            setInventory(inv); 
            saveInventory(inv);
          }} 
          onClose={() => setGameState('audit')} 
        />
      )}

      {gameState === 'audit' && (
        <AuditDashboard 
          onBack={() => setGameState('start')} 
          onManageItems={() => setGameState('admin')}
        />
      )}
    </div>
  );
}
