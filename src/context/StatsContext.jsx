import React, { createContext, useContext, useState, useCallback } from 'react';
import { ACHIEVEMENTS } from '../data/achievements';

const StatsContext = createContext(null);

const STATS_KEY    = 'chessx_stats';
const HISTORY_KEY  = 'chessx_history';
const ACHIEVED_KEY = 'chessx_achievements';

function defaultStats() {
  return { elo: 1200, wins: 0, losses: 0, draws: 0, streak: 0, bestStreak: 0, puzzleStreak: 0, totalMoves: 0 };
}

function loadStats() {
  try { return { ...defaultStats(), ...JSON.parse(localStorage.getItem(STATS_KEY)) }; }
  catch { return defaultStats(); }
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}

function loadUnlocked() {
  try { return JSON.parse(localStorage.getItem(ACHIEVED_KEY)) || []; }
  catch { return []; }
}

// ELO calculation (standard K=32)
function calcElo(myElo, opponentElo, result /* 1=win, 0.5=draw, 0=loss */) {
  const K = 32;
  const expected = 1 / (1 + Math.pow(10, (opponentElo - myElo) / 400));
  const change = Math.round(K * (result - expected));
  return { newElo: Math.max(800, myElo + change), change };
}

export function StatsProvider({ children }) {
  const [stats, setStats]       = useState(loadStats);
  const [history, setHistory]   = useState(loadHistory);
  const [unlocked, setUnlocked] = useState(loadUnlocked);
  const [toastQueue, setToastQueue] = useState([]); // achievements to show

  const saveStats = (s) => {
    localStorage.setItem(STATS_KEY, JSON.stringify(s));
    setStats(s);
  };

  const saveHistory = (h) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
    setHistory(h);
  };

  const saveUnlocked = (u) => {
    localStorage.setItem(ACHIEVED_KEY, JSON.stringify(u));
    setUnlocked(u);
  };

  // Check and unlock new achievements
  const checkAchievements = useCallback((newStats, newUnlocked, gameContext = {}) => {
    const toUnlock = [];
    for (const ach of ACHIEVEMENTS) {
      if (newUnlocked.includes(ach.id)) continue;
      if (ach.condition(newStats, gameContext)) {
        toUnlock.push(ach);
      }
    }
    if (toUnlock.length > 0) {
      const ids = [...newUnlocked, ...toUnlock.map(a => a.id)];
      saveUnlocked(ids);
      setToastQueue(q => [...q, ...toUnlock]);
      return ids;
    }
    return newUnlocked;
  }, []);

  // Called after every game ends
  const recordGame = useCallback((result /* 'win'|'loss'|'draw' */, gameContext = {}) => {
    const opponentElo = gameContext.opponentElo || 1200;
    const resultVal   = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
    const { newElo, change } = calcElo(stats.elo, opponentElo, resultVal);

    const newStreak    = result === 'win' ? stats.streak + 1 : 0;
    const newBestStreak = Math.max(stats.bestStreak, newStreak);

    const newStats = {
      ...stats,
      elo:        newElo,
      wins:       stats.wins   + (result === 'win'  ? 1 : 0),
      losses:     stats.losses + (result === 'loss' ? 1 : 0),
      draws:      stats.draws  + (result === 'draw' ? 1 : 0),
      streak:     newStreak,
      bestStreak: newBestStreak,
      totalMoves: stats.totalMoves + (gameContext.moves || 0),
    };
    saveStats(newStats);

    // Save to history
    const entry = {
      id:          Date.now(),
      date:        new Date().toLocaleString(),
      opponent:    gameContext.opponent || 'Unknown',
      result,
      eloChange:   change,
      moves:       gameContext.moves || 0,
      duration:    gameContext.duration || '—',
      opening:     gameContext.opening || '—',
      mode:        gameContext.mode || 'ai',
    };
    const newHistory = [entry, ...history].slice(0, 50);
    saveHistory(newHistory);

    // Check achievements
    const ctx = { ...gameContext, result, eloChange: change };
    checkAchievements(newStats, unlocked, ctx);

    return { eloChange: change, newElo };
  }, [stats, history, unlocked, checkAchievements]);

  // Called after solving a puzzle
  const recordPuzzleSolve = useCallback(() => {
    const newStats = { ...stats, puzzleStreak: stats.puzzleStreak + 1 };
    saveStats(newStats);
    checkAchievements(newStats, unlocked, { puzzle: true });
  }, [stats, unlocked, checkAchievements]);

  const dismissToast = useCallback((id) => {
    setToastQueue(q => q.filter(a => a.id !== id));
  }, []);

  return (
    <StatsContext.Provider value={{
      stats, history, unlocked,
      toastQueue, dismissToast,
      recordGame, recordPuzzleSolve,
    }}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const ctx = useContext(StatsContext);
  if (!ctx) throw new Error('useStats must be used within StatsProvider');
  return ctx;
}
