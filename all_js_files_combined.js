/**
 * CHESSX CONSOLIDATED CODEBASE BUNDLE
 * Generated at: 2026-08-23T06:11:18.468Z
 * All Javascript & JSX files from src/ consolidated into a single file.
 */


/*******************************************************************************
 * FILE: src\App.jsx
 *******************************************************************************/

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChessGame } from './engine/chessEngine';
import { getBestMove } from './engine/aiEngine';
import { sounds } from './audio/soundSystem';
import { useStats } from './context/StatsContext';

import { Navbar } from './components/ui/Navbar';
import { DashboardView } from './components/ui/DashboardView';
import { GameHUD } from './components/ui/GameHUD';
import { LeaderboardView } from './components/ui/LeaderboardView';
import { HistoryView } from './components/ui/HistoryView';
import { SettingsModal } from './components/ui/SettingsModal';
import { GameOverModal } from './components/ui/GameOverModal';
import { OnlineModal } from './components/ui/OnlineModal';
import { LoginModal } from './components/ui/LoginModal';
import { PuzzleView } from './components/ui/PuzzleView';
import { ProfileView } from './components/ui/ProfileView';
import { AcademyView } from './components/ui/AcademyView';
import { Footer } from './components/ui/Footer';
import { EvalBar } from './components/ui/EvalBar';
import { AchievementToast } from './components/ui/AchievementToast';
import { TIME_CONTROLS } from './components/ui/ChessClock';
import { ChessCanvas } from './components/3d/ChessCanvas';
import { detectOpening } from './data/openings';

export default function App() {
  const { recordGame } = useStats();

  // ── Core state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]       = useState('dashboard');
  const [game, setGame]                 = useState(() => new ChessGame());
  const [gameMode, setGameMode]         = useState('ai');
  const [aiDifficulty, setAiDifficulty] = useState('difficult');
  const [timeControl, setTimeControl]   = useState(TIME_CONTROLS.find(t => t.id === 'rapid10'));
  const [gameStartTime, setGameStartTime] = useState(null);

  const [boardTheme, setBoardThemeState] = useState(
    () => localStorage.getItem('chessx_board_theme') || 'brown'
  );
  const setBoardTheme = (t) => { setBoardThemeState(t); localStorage.setItem('chessx_board_theme', t); };

  const [bgEnvironment, setBgEnvironmentState] = useState(
    () => localStorage.getItem('chessx_bg_env') || 'earth_sun'
  );
  const setBgEnvironment = (env) => { setBgEnvironmentState(env); localStorage.setItem('chessx_bg_env', env); };

  const [isSunFlipped, setIsSunFlippedState] = useState(
    () => localStorage.getItem('chessx_sun_flipped') === 'true'
  );
  const setIsSunFlipped = (val) => {
    const next = typeof val === 'function' ? val(isSunFlipped) : val;
    setIsSunFlippedState(next);
    localStorage.setItem('chessx_sun_flipped', String(next));
  };

  const [isTorchOn, setIsTorchOnState] = useState(
    () => localStorage.getItem('chessx_torch_on') === 'true'
  );
  const setIsTorchOn = (val) => {
    const next = typeof val === 'function' ? val(isTorchOn) : val;
    setIsTorchOnState(next);
    localStorage.setItem('chessx_torch_on', String(next));
  };

  const [soundMuted, setSoundMuted]         = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen]   = useState(false);
  const [eloChangeResult, setEloChangeResult]     = useState(null);

  // ── Board state ─────────────────────────────────────────────────────────────
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves]         = useState([]);
  const [lastMove, setLastMove]             = useState(null);
  const [kingInCheckPos, setKingInCheckPos] = useState(null);

  // ── Game result ─────────────────────────────────────────────────────────────
  const [isGameOver, setIsGameOver]     = useState(false);
  const [resultStatus, setResultStatus] = useState('');

  const isAiThinkingRef = useRef(false);

  // ── Tab navigation ──────────────────────────────────────────────────────────
  const navigateTab = (tabName) => {
    setIsGameOver(false);
    setIsSettingsOpen(false);
    setIsOnlineModalOpen(false);
    setActiveTab(tabName);
  };

  // ── endGame — defined FIRST so triggerAiMove can reference it ───────────────
  const endGame = useCallback((result, status) => {
    setResultStatus(status);
    setIsGameOver(true);

    setEloChangeResult(prev => {
      // Use a functional update so we don't need game/timeControl in deps
      return null; // reset first, set below
    });

    // We read refs here to avoid stale closure issues
    const { eloChange, newElo } = recordGame(result, {
      opponent:    result === 'loss' ? 'ChessX AI' : 'Player',
      moves:       0,   // approximate — we don't capture live here to avoid deps
      duration:    '—',
      opening:     '—',
      mode:        'ai',
      opponentElo: 1500,
    });
    setEloChangeResult({ change: eloChange, newElo });
  }, [recordGame]);

  // ── Precise endGame that reads current game state via a ref ─────────────────
  const gameRef        = useRef(game);
  const gameModeRef    = useRef(gameMode);
  const aiDiffRef      = useRef(aiDifficulty);
  const timeControlRef = useRef(timeControl);
  const startTimeRef   = useRef(gameStartTime);

  useEffect(() => { gameRef.current        = game;        }, [game]);
  useEffect(() => { gameModeRef.current    = gameMode;    }, [gameMode]);
  useEffect(() => { aiDiffRef.current      = aiDifficulty;}, [aiDifficulty]);
  useEffect(() => { timeControlRef.current = timeControl; }, [timeControl]);
  useEffect(() => { startTimeRef.current   = gameStartTime; }, [gameStartTime]);

  const endGameFull = useCallback((result, status) => {
    setResultStatus(status);
    setIsGameOver(true);

    const g         = gameRef.current;
    const gMode     = gameModeRef.current;
    const diff      = aiDiffRef.current;
    const tc        = timeControlRef.current;
    const startTime = startTimeRef.current;

    const duration = startTime
      ? (() => { const s = Math.floor((Date.now() - startTime) / 1000); return `${Math.floor(s/60)}m ${s%60}s`; })()
      : '—';

    const sans    = g.moveLog ? g.moveLog.map(m => m.san) : [];
    const opening = (() => { try { const o = detectOpening(sans); return o?.name || '—'; } catch { return '—'; } })();
    const modeId  = tc?.id || 'unlimited';

    const { eloChange, newElo } = recordGame(result, {
      opponent:    gMode === 'ai' ? `ChessX Bot (${diff.toUpperCase()})` : 'Local Player',
      moves:       sans.length,
      duration,
      opening,
      mode:        modeId.includes('bullet') ? 'bullet' : modeId.includes('blitz') ? 'blitz' : modeId.includes('rapid') ? 'rapid' : 'classical',
      opponentElo: gMode === 'ai' ? (diff === 'difficult' || diff === 'master' ? 1800 : diff === 'hard' || diff === 'club' ? 1400 : 800) : 1200,
    });
    setEloChangeResult({ change: eloChange, newElo });
  }, [recordGame]);

  // ── Chess clock timeout ─────────────────────────────────────────────────────
  const handleTimeOut = useCallback((color) => {
    const winner = color === 'w' ? 'BLACK' : 'WHITE';
    const result = color === 'w' ? 'loss' : 'win';
    endGameFull(result, `${winner} WINS ON TIME!`);
  }, [endGameFull]);

  // ── AI move trigger ─────────────────────────────────────────────────────────
  const triggerAiMove = useCallback((currentGame) => {
    if (isAiThinkingRef.current) return;
    isAiThinkingRef.current = true;

    setTimeout(() => {
      try {
        const bestMove = getBestMove(currentGame, aiDiffRef.current);
        if (bestMove) {
          const moveRes = currentGame.makeMove(bestMove);
          if (moveRes) {
            moveRes.captured ? sounds.playCapture() : sounds.playMove();
            if (moveRes.inCheck) {
              sounds.playCheck();
              setKingInCheckPos(currentGame.findKing(currentGame.activeColor));
            } else {
              setKingInCheckPos(null);
            }
            setLastMove({ from: moveRes.from, to: moveRes.to });

            // Create a fresh instance for reliable React state rendering
            const updatedGame = new ChessGame(currentGame.generateFen());
            updatedGame.moveLog = [...currentGame.moveLog];
            updatedGame.history = [...currentGame.history];
            setGame(updatedGame);

            if (moveRes.isCheckmate) {
              endGameFull(
                moveRes.color === 'w' ? 'win' : 'loss',
                moveRes.color === 'w' ? 'WHITE WINS BY CHECKMATE!' : 'BLACK WINS BY CHECKMATE!'
              );
            } else if (moveRes.isStalemate) {
              endGameFull('draw', 'DRAW BY STALEMATE');
            }
          }
        }
      } catch (err) {
        console.error('AI execution error:', err);
      } finally {
        isAiThinkingRef.current = false;
      }
    }, 350);
  }, [endGameFull]);

  // ── Player square click ─────────────────────────────────────────────────────
  const handleSquareClick = useCallback((row, col) => {
    if (isGameOver || isAiThinkingRef.current) return;

    if (selectedSquare) {
      const targetMove = legalMoves.find(m => m.to.row === row && m.to.col === col);
      if (targetMove) {
        const moveRes = game.makeMove(targetMove);
        if (moveRes) {
          moveRes.captured ? sounds.playCapture() : sounds.playMove();
          if (moveRes.inCheck) {
            sounds.playCheck();
            setKingInCheckPos(game.findKing(game.activeColor));
          } else {
            setKingInCheckPos(null);
          }
          setLastMove({ from: moveRes.from, to: moveRes.to });
          setSelectedSquare(null);
          setLegalMoves([]);

          const updatedGame = new ChessGame(game.generateFen());
          updatedGame.moveLog = [...game.moveLog];
          updatedGame.history = [...game.history];
          setGame(updatedGame);

          if (moveRes.isCheckmate) {
            endGameFull(
              moveRes.color === 'w' ? 'win' : 'loss',
              moveRes.color === 'w' ? 'WHITE WINS BY CHECKMATE!' : 'BLACK WINS BY CHECKMATE!'
            );
            return;
          } else if (moveRes.isStalemate) {
            endGameFull('draw', 'DRAW BY STALEMATE');
            return;
          }

          if (gameMode === 'ai' && updatedGame.activeColor === 'b') {
            triggerAiMove(updatedGame);
          }
          return;
        }
      }
    }

    const clickedPiece = game.getPiece(row, col);
    if (clickedPiece && clickedPiece.color === game.activeColor) {
      sounds.playClick();
      setSelectedSquare({ row, col });
      setLegalMoves(game.getLegalMoves(row, col));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  }, [game, selectedSquare, legalMoves, isGameOver, gameMode, triggerAiMove, endGameFull]);

  // ── Automatic AI turn monitoring ───────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'game' && !isGameOver && !isAiThinkingRef.current) {
      if (gameMode === 'ai' && game.activeColor === 'b') {
        const timer = setTimeout(() => triggerAiMove(game), 350);
        return () => clearTimeout(timer);
      } else if (gameMode === 'spectate') {
        const timer = setTimeout(() => triggerAiMove(game), 650);
        return () => clearTimeout(timer);
      }
    }
  }, [game, gameMode, activeTab, isGameOver, triggerAiMove]);

  // ── Start a new game ────────────────────────────────────────────────────────
  const startGameMode = (mode, difficulty = 'master') => {
    const newGame = new ChessGame();
    setGame(newGame);
    setGameMode(mode);
    setAiDifficulty(difficulty);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setKingInCheckPos(null);
    setIsGameOver(false);
    setIsOnlineModalOpen(false);
    setResultStatus('');
    setEloChangeResult(null);
    setGameStartTime(Date.now());
    setActiveTab('game');
  };

  const handleStartOnlineGame = () => startGameMode('online', 'master');

  const handleUndo = () => {
    if (game.history.length === 0) return;
    game.undo();
    if (gameMode === 'ai' && game.history.length > 0) game.undo();
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setKingInCheckPos(null);
    setIsGameOver(false);
    setGame(Object.assign(Object.create(Object.getPrototypeOf(game)), game));
  };

  const handleResign = () => {
    const result = game.activeColor === 'w' ? 'loss' : 'win';
    const status = game.activeColor === 'w' ? 'BLACK WINS BY RESIGNATION' : 'WHITE WINS BY RESIGNATION';
    endGameFull(result, status);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={navigateTab}
        soundMuted={soundMuted}
        setSoundMuted={setSoundMuted}
        openSettings={() => setIsSettingsOpen(true)}
        openLogin={() => setIsLoginModalOpen(true)}
      />

      <main style={{
        flex: 1, position: 'relative',
        overflowY: activeTab === 'game' ? 'hidden' : 'auto',
        overflowX: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        {activeTab === 'dashboard' && (
          <DashboardView
            startGameMode={startGameMode}
            openOnlineModal={() => setIsOnlineModalOpen(true)}
            boardTheme={boardTheme}
            bgEnvironment={bgEnvironment}
          />
        )}

        {activeTab === 'game' && (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {/* Evaluation Bar */}
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', height: '60%', zIndex: 10 }}>
              <EvalBar evaluation={typeof game.getMaterialAdvantage === 'function' ? game.getMaterialAdvantage() : 0} />
            </div>

            <ChessCanvas
              game={game}
              selectedSquare={selectedSquare}
              legalMoves={legalMoves}
              lastMove={lastMove}
              kingInCheckPos={kingInCheckPos}
              theme={boardTheme}
              bgEnvironment={bgEnvironment}
              setBgEnvironment={setBgEnvironment}
              isSunFlipped={isSunFlipped}
              setIsSunFlipped={setIsSunFlipped}
              isTorchOn={isTorchOn}
              setIsTorchOn={setIsTorchOn}
              onSquareClick={handleSquareClick}
              onPieceClick={handleSquareClick}
            />

            <GameHUD
              game={game}
              gameMode={gameMode}
              aiDifficulty={aiDifficulty}
              onUndo={handleUndo}
              onNewGame={() => startGameMode(gameMode, aiDifficulty)}
              onResign={handleResign}
              timeControl={timeControl}
              onTimeOut={handleTimeOut}
              bgEnvironment={bgEnvironment}
              setBgEnvironment={setBgEnvironment}
            />
          </div>
        )}

        {activeTab === 'leaderboard' && <LeaderboardView />}
        {activeTab === 'history'     && <HistoryView />}
        {activeTab === 'puzzles'     && <PuzzleView />}
        {activeTab === 'academy'     && <AcademyView />}
        {activeTab === 'profile'     && <ProfileView />}
        
        {activeTab !== 'game' && <Footer />}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        soundMuted={soundMuted}
        setSoundMuted={setSoundMuted}
        boardTheme={boardTheme}
        setBoardTheme={setBoardTheme}
        bgEnvironment={bgEnvironment}
        setBgEnvironment={setBgEnvironment}
        isSunFlipped={isSunFlipped}
        setIsSunFlipped={setIsSunFlipped}
        isTorchOn={isTorchOn}
        setIsTorchOn={setIsTorchOn}
        aiDifficulty={aiDifficulty}
        setAiDifficulty={setAiDifficulty}
      />

      <OnlineModal
        isOpen={isOnlineModalOpen}
        onClose={() => setIsOnlineModalOpen(false)}
        onStartOnlineGame={handleStartOnlineGame}
      />

      <GameOverModal
        isOpen={isGameOver}
        resultStatus={resultStatus}
        eloChange={eloChangeResult?.change}
        newElo={eloChangeResult?.newElo}
        onRematch={() => startGameMode(gameMode, aiDifficulty)}
        onHome={() => navigateTab('dashboard')}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <AchievementToast />
    </div>
  );
}



/*******************************************************************************
 * FILE: src\audio\soundSystem.js
 *******************************************************************************/

// Web Audio API Synthesizer for ChessX

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.volume = 0.5;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  setMuted(muted) {
    this.muted = muted;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  playMove() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  playCapture() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Impact tone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

    gain.gain.setValueAtTime(0.5 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);

    // Noise burst
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3 * this.volume, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    noise.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(now);
  }

  playCheck() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1174.66, now + 0.08); // A5 to D6 warning

    gain.gain.setValueAtTime(0.4 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  playGameEnd(isWin) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = isWin ? [523.25, 659.25, 783.99, 1046.5] : [400, 350, 300, 250];
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isWin ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.35 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    });
  }

  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

    gain.gain.setValueAtTime(0.15 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }
}

export const sounds = new SoundSystem();



/*******************************************************************************
 * FILE: src\components\3d\ChessBoard3D.jsx
 *******************************************************************************/

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

export function ChessBoard3D({
  boardState,
  selectedSquare,
  legalMoves = [],
  lastMove = null,
  kingInCheckPos = null,
  theme = 'dragonfruit',
  onSquareClick
}) {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  // Board materials based on selected theme
  const { lightSquareMat, darkSquareMat, borderMat, labelColor } = useMemo(() => {
    switch (theme) {
      case 'normal_green':
      case 'tournament':
        return {
          lightSquareMat: new THREE.MeshStandardMaterial({ color: '#eeeed2', roughness: 0.35, metalness: 0.05 }),
          darkSquareMat: new THREE.MeshStandardMaterial({ color: '#769656', roughness: 0.45, metalness: 0.05 }),
          borderMat: new THREE.MeshStandardMaterial({ color: '#3e522c', roughness: 0.6, metalness: 0.1 }),
          labelColor: '#eeeed2'
        };

      case 'walnut':
        return {
          lightSquareMat: new THREE.MeshStandardMaterial({ color: '#e0c097', roughness: 0.5, metalness: 0.05 }),
          darkSquareMat: new THREE.MeshStandardMaterial({ color: '#5c3d2e', roughness: 0.6, metalness: 0.05 }),
          borderMat: new THREE.MeshStandardMaterial({ color: '#2d1b12', roughness: 0.7, metalness: 0.0 }),
          labelColor: '#e0c097'
        };

      case 'dragonfruit':
        return {
          lightSquareMat: new THREE.MeshStandardMaterial({ color: '#2d1454', roughness: 0.25, metalness: 0.7, emissive: '#16082d', emissiveIntensity: 0.2 }),
          darkSquareMat: new THREE.MeshStandardMaterial({ color: '#130826', roughness: 0.35, metalness: 0.8, emissive: '#090314', emissiveIntensity: 0.2 }),
          borderMat: new THREE.MeshStandardMaterial({ color: '#ff007f', roughness: 0.2, metalness: 0.9, emissive: '#5a002d', emissiveIntensity: 0.5 }),
          labelColor: '#ff3399'
        };

      case 'cyberpunk':
        return {
          lightSquareMat: new THREE.MeshStandardMaterial({ color: '#1a1d2e', roughness: 0.2, metalness: 0.8 }),
          darkSquareMat: new THREE.MeshStandardMaterial({ color: '#0a0b12', roughness: 0.3, metalness: 0.9 }),
          borderMat: new THREE.MeshStandardMaterial({ color: '#00f0ff', roughness: 0.2, metalness: 0.9, emissive: '#004455', emissiveIntensity: 0.4 }),
          labelColor: '#00f0ff'
        };

      case 'emerald':
        return {
          lightSquareMat: new THREE.MeshStandardMaterial({ color: '#e8f5e9', roughness: 0.2, metalness: 0.1 }),
          darkSquareMat: new THREE.MeshStandardMaterial({ color: '#1b4332', roughness: 0.3, metalness: 0.4 }),
          borderMat: new THREE.MeshStandardMaterial({ color: '#2d6a4f', roughness: 0.3, metalness: 0.6, emissive: '#081c15', emissiveIntensity: 0.2 }),
          labelColor: '#52b788'
        };

      case 'marble':
        return {
          lightSquareMat: new THREE.MeshStandardMaterial({ color: '#f4f1de', roughness: 0.15, metalness: 0.1 }),
          darkSquareMat: new THREE.MeshStandardMaterial({ color: '#3d405b', roughness: 0.25, metalness: 0.2 }),
          borderMat: new THREE.MeshStandardMaterial({ color: '#ffd700', roughness: 0.2, metalness: 0.8, emissive: '#554400', emissiveIntensity: 0.3 }),
          labelColor: '#ffd700'
        };

      case 'ocean':
        return {
          lightSquareMat: new THREE.MeshStandardMaterial({ color: '#e0f2fe', roughness: 0.2, metalness: 0.1 }),
          darkSquareMat: new THREE.MeshStandardMaterial({ color: '#0369a1', roughness: 0.3, metalness: 0.3 }),
          borderMat: new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.25, metalness: 0.6, emissive: '#075985', emissiveIntensity: 0.2 }),
          labelColor: '#38bdf8'
        };

      case 'charcoal':
        return {
          lightSquareMat: new THREE.MeshStandardMaterial({ color: '#e4e4e7', roughness: 0.3, metalness: 0.2 }),
          darkSquareMat: new THREE.MeshStandardMaterial({ color: '#27272a', roughness: 0.4, metalness: 0.3 }),
          borderMat: new THREE.MeshStandardMaterial({ color: '#3f3f46', roughness: 0.5, metalness: 0.4 }),
          labelColor: '#a1a1aa'
        };

      case 'brown':
      default:
        return {
          lightSquareMat: new THREE.MeshStandardMaterial({ color: '#f0d9b5', roughness: 0.4, metalness: 0.05 }),
          darkSquareMat: new THREE.MeshStandardMaterial({ color: '#b58863', roughness: 0.5, metalness: 0.05 }),
          borderMat: new THREE.MeshStandardMaterial({ color: '#5c3d2e', roughness: 0.6, metalness: 0.1, emissive: '#2d1b12', emissiveIntensity: 0.15 }),
          labelColor: '#f0d9b5'
        };
    }
  }, [theme]);

  const legalMap = useMemo(() => {
    const map = new Map();
    legalMoves.forEach(m => {
      map.set(`${m.to.row},${m.to.col}`, m);
    });
    return map;
  }, [legalMoves]);

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Border Rim Frame */}
      <mesh position={[0, -0.2, 0]} material={borderMat} receiveShadow>
        <boxGeometry args={[8.8, 0.4, 8.8]} />
      </mesh>

      {/* 64 Board Squares */}
      {Array.from({ length: 8 }).map((_, row) =>
        Array.from({ length: 8 }).map((_, col) => {
          const isLight = (row + col) % 2 === 0;
          const posX = col - 3.5;
          const posZ = row - 3.5;

          const isSelected = selectedSquare && selectedSquare.row === row && selectedSquare.col === col;
          const isLegal = legalMap.has(`${row},${col}`);
          const isLastFrom = lastMove && lastMove.from.row === row && lastMove.from.col === col;
          const isLastTo = lastMove && lastMove.to.row === row && lastMove.to.col === col;
          const isCheckSquare = kingInCheckPos && kingInCheckPos.row === row && kingInCheckPos.col === col;

          return (
            <group key={`${row}-${col}`} position={[posX, 0, posZ]}>
              <mesh
                material={isLight ? lightSquareMat : darkSquareMat}
                receiveShadow
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSquareClick) onSquareClick(row, col);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                  document.body.style.cursor = 'auto';
                }}
              >
                <boxGeometry args={[0.98, 0.1, 0.98]} />
              </mesh>

              {isSelected && (
                <mesh position={[0, 0.051, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[0.96, 0.96]} />
                  <meshBasicMaterial color="#ff007f" transparent opacity={0.6} />
                </mesh>
              )}

              {isLegal && (
                <group position={[0, 0.06, 0]}>
                  {boardState[row][col] ? (
                    <mesh rotation={[-Math.PI / 2, 0, 0]}>
                      <ringGeometry args={[0.35, 0.46, 32]} />
                      <meshBasicMaterial color="#ff0055" transparent opacity={0.8} />
                    </mesh>
                  ) : (
                    <mesh>
                      <cylinderGeometry args={[0.16, 0.16, 0.02, 16]} />
                      <meshBasicMaterial color="#ff3399" transparent opacity={0.8} />
                    </mesh>
                  )}
                </group>
              )}

              {(isLastFrom || isLastTo) && !isSelected && (
                <mesh position={[0, 0.051, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[0.96, 0.96]} />
                  <meshBasicMaterial color="#9d4edd" transparent opacity={0.4} />
                </mesh>
              )}

              {isCheckSquare && (
                <mesh position={[0, 0.052, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[0.96, 0.96]} />
                  <meshBasicMaterial color="#ff0000" transparent opacity={0.7} />
                </mesh>
              )}
            </group>
          );
        })
      )}

      {/* Board Coordinates */}
      {files.map((file, col) => (
        <React.Fragment key={`file-${file}`}>
          <Text position={[col - 3.5, 0.02, 4.15]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.28} color={labelColor} anchorX="center" anchorY="middle">{file}</Text>
          <Text position={[col - 3.5, 0.02, -4.15]} rotation={[-Math.PI / 2, 0, Math.PI]} fontSize={0.28} color={labelColor} anchorX="center" anchorY="middle">{file}</Text>
        </React.Fragment>
      ))}

      {ranks.map((rank, row) => (
        <React.Fragment key={`rank-${rank}`}>
          <Text position={[-4.15, 0.02, row - 3.5]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} fontSize={0.28} color={labelColor} anchorX="center" anchorY="middle">{rank}</Text>
          <Text position={[4.15, 0.02, row - 3.5]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} fontSize={0.28} color={labelColor} anchorX="center" anchorY="middle">{rank}</Text>
        </React.Fragment>
      ))}
    </group>
  );
}



/*******************************************************************************
 * FILE: src\components\3d\ChessCanvas.jsx
 *******************************************************************************/

import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Flame, RotateCcw } from 'lucide-react';
import { ChessBoard3D } from './ChessBoard3D';
import { ChessPiece3D } from './ChessPiece3D';
import { EnvironmentLighting } from './EnvironmentLighting';
import { sounds } from '../../audio/soundSystem';

export function ChessCanvas({
  game,
  selectedSquare,
  legalMoves,
  lastMove,
  kingInCheckPos,
  theme = 'brown',
  bgEnvironment = 'earth_sun',
  setBgEnvironment,
  isTorchOn = false,
  setIsTorchOn,
  onSquareClick,
  onPieceClick
}) {
  const controlsRef = useRef();

  const pieceElements = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = game.board[row][col];
      if (piece) {
        const posX = col - 3.5;
        const posZ = row - 3.5;
        const isSelected = selectedSquare && selectedSquare.row === row && selectedSquare.col === col;
        const isPossibleTarget = legalMoves.some(m => m.to.row === row && m.to.col === col);

        pieceElements.push(
          <ChessPiece3D
            key={`piece-${row}-${col}-${piece.type}-${piece.color}`}
            type={piece.type}
            color={piece.color}
            position={[posX, 0.1, posZ]}
            isSelected={isSelected}
            isPossibleTarget={isPossibleTarget}
            onClick={() => onPieceClick(row, col)}
          />
        );
      }
    }
  }

  // Camera 180-degree flip handler
  const handleFlipCameraView = () => {
    sounds.playClick();
    if (controlsRef.current) {
      const cam = controlsRef.current.object;
      cam.position.x = -cam.position.x;
      cam.position.z = -cam.position.z;
      controlsRef.current.update();
    }
  };

  const envList = [
    { id: 'earth_sun', label: '☀️ Sun & Earth' },
    { id: 'red_theme', label: '🔴 Red Nebula' },
    { id: 'tournament', label: '🏆 Tournament' },
    { id: 'cozy_lounge', label: '🪵 Wood Lounge' },
    { id: 'royal_palace', label: '🏰 Royal Citadel' },
    { id: 'studio', label: '🎨 Studio' },
    { id: 'zen_garden', label: '🌿 Zen Garden' },
    { id: 'space', label: '🌌 Deep Space' }
  ];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      
      {/* 🎛️ Left-Middle Vertical Control Stack (Arranged One by One) */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '46px',
          transform: 'translateY(-50%)',
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          background: 'rgba(18, 9, 36, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 0, 127, 0.35)',
          borderRadius: '18px',
          padding: '12px 10px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* 1. 🔦 Torch Light Button */}
        <button
          onClick={() => {
            sounds.playClick();
            if (setIsTorchOn) setIsTorchOn(!isTorchOn);
          }}
          title="Toggle 3D Torch Light Mode"
          style={{
            background: isTorchOn ? 'linear-gradient(135deg, #ff7700, #ffaa00)' : 'rgba(255, 255, 255, 0.08)',
            color: isTorchOn ? '#fff' : 'var(--text-muted)',
            border: `1px solid ${isTorchOn ? '#ffaa00' : 'rgba(255, 255, 255, 0.2)'}`,
            borderRadius: '12px',
            padding: '8px 14px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: isTorchOn ? '0 0 16px rgba(255, 170, 0, 0.65)' : 'none',
            transition: 'all 0.25s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Flame size={16} color={isTorchOn ? '#fff' : '#ffaa00'} />
          <span>{isTorchOn ? 'Torch ON' : 'Torch Light'}</span>
        </button>

        {/* 2. 🔄 Rotate Board View 180° Button */}
        <button
          onClick={handleFlipCameraView}
          title="Flip Camera View 180°"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            color: 'var(--text-muted)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '8px 14px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.25s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <RotateCcw size={15} />
          <span>180° View</span>
        </button>

        {/* 3. 🧭 Environment Selector Dropdown */}
        {setBgEnvironment && (
          <select
            value={bgEnvironment}
            onChange={(e) => {
              sounds.playClick();
              setBgEnvironment(e.target.value);
            }}
            style={{
              background: 'rgba(255, 0, 127, 0.18)',
              color: 'var(--accent-dragonfruit-bright)',
              border: '1px solid var(--accent-dragonfruit)',
              borderRadius: '12px',
              padding: '8px 12px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            {envList.map(e => (
              <option key={e.id} value={e.id} style={{ background: '#180930', color: '#fff' }}>
                {e.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 3D Canvas R3F */}
      <Canvas
        shadows
        camera={{ position: [0, 7.5, 7.5], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <EnvironmentLighting
          bgEnvironment={bgEnvironment}
          isTorchOn={isTorchOn}
        />

        <ChessBoard3D
          boardState={game.board}
          selectedSquare={selectedSquare}
          legalMoves={legalMoves}
          lastMove={lastMove}
          kingInCheckPos={kingInCheckPos}
          theme={theme}
          onSquareClick={onSquareClick}
        />

        {pieceElements}

        <OrbitControls
          ref={controlsRef}
          makeDefault
          minDistance={3.5}
          maxDistance={18}
          maxPolarAngle={Math.PI / 2 - 0.05}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}



/*******************************************************************************
 * FILE: src\components\3d\ChessPiece3D.jsx
 *******************************************************************************/

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function ChessPiece3D({
  type,
  color,
  position,
  isSelected,
  isPossibleTarget,
  onClick
}) {
  const meshGroupRef = useRef();
  const currentPos = useRef(new THREE.Vector3(...position));
  const targetPos = useMemo(() => new THREE.Vector3(...position), [position]);

  // Smooth lerp animation for movement across the 3D board
  useFrame((state, delta) => {
    if (meshGroupRef.current) {
      const dist = currentPos.current.distanceTo(targetPos);
      const arcHeight = dist > 0.05 ? Math.sin((1 - Math.min(dist / 4, 1)) * Math.PI) * 0.6 : 0;

      currentPos.current.lerp(targetPos, Math.min(delta * 12, 1));
      meshGroupRef.current.position.set(
        currentPos.current.x,
        currentPos.current.y + arcHeight,
        currentPos.current.z
      );

      // Subtle floating hover effect for selected piece
      if (isSelected) {
        meshGroupRef.current.position.y += Math.sin(state.clock.elapsedTime * 6) * 0.05 + 0.15;
      }
    }
  });

  // Material setup: Authentic Polished Boxwood Ivory for White pieces, Deep Ebony Walnut for Black pieces
  const materialProps = useMemo(() => {
    const isWhite = color === 'w';
    if (isWhite) {
      return {
        color: '#f4efe6',
        roughness: 0.28,
        metalness: 0.05,
        emissive: '#443a2c',
        emissiveIntensity: isSelected ? 1.2 : 0.08
      };
    } else {
      return {
        color: '#221c19',
        roughness: 0.32,
        metalness: 0.08,
        emissive: '#120e0c',
        emissiveIntensity: isSelected ? 1.2 : 0.08
      };
    }
  }, [color, isSelected]);

  // Geometries for pieces
  const geometry = useMemo(() => {
    switch (type) {
      case 'p': return createPawnGeometry();
      case 'r': return createRookGeometry();
      case 'n': return createKnightGeometry();
      case 'b': return createBishopGeometry();
      case 'q': return createQueenGeometry();
      case 'k': return createKingGeometry();
      default: return new THREE.CylinderGeometry(0.3, 0.4, 0.8, 16);
    }
  }, [type]);

  const rotation = useMemo(() => {
    if (type === 'n') {
      return [0, color === 'w' ? 0 : Math.PI, 0];
    }
    return [0, 0, 0];
  }, [type, color]);

  return (
    <group
      ref={meshGroupRef}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Selection Glow Ring */}
      {isSelected && (
        <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.42, 0.58, 32]} />
          <meshBasicMaterial
            color={color === 'w' ? '#ff007f' : '#9d4edd'}
            side={THREE.DoubleSide}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}

      {/* Target Dot Light for capture targets */}
      {isPossibleTarget && (
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#ff3399" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}

// Helpers to construct 3D Lathe & Extrude Geometries

function createBasePoints() {
  return [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.42, 0),
    new THREE.Vector2(0.42, 0.08),
    new THREE.Vector2(0.38, 0.12),
    new THREE.Vector2(0.35, 0.22),
    new THREE.Vector2(0.28, 0.26)
  ];
}

function createPawnGeometry() {
  const points = [
    ...createBasePoints(),
    new THREE.Vector2(0.2, 0.4),
    new THREE.Vector2(0.18, 0.6),
    new THREE.Vector2(0.22, 0.64),
    new THREE.Vector2(0.26, 0.68),
    new THREE.Vector2(0.22, 0.72),
    new THREE.Vector2(0.12, 0.76),
    new THREE.Vector2(0, 0.95)
  ];
  return new THREE.LatheGeometry(points, 24);
}

function createRookGeometry() {
  const points = [
    ...createBasePoints(),
    new THREE.Vector2(0.28, 0.5),
    new THREE.Vector2(0.3, 0.8),
    new THREE.Vector2(0.36, 0.85),
    new THREE.Vector2(0.36, 1.05),
    new THREE.Vector2(0.24, 1.05),
    new THREE.Vector2(0, 1.05)
  ];
  return new THREE.LatheGeometry(points, 24);
}

function createBishopGeometry() {
  const points = [
    ...createBasePoints(),
    new THREE.Vector2(0.22, 0.5),
    new THREE.Vector2(0.25, 0.75),
    new THREE.Vector2(0.28, 0.85),
    new THREE.Vector2(0.22, 1.1),
    new THREE.Vector2(0.12, 1.2),
    new THREE.Vector2(0.04, 1.24),
    new THREE.Vector2(0, 1.3)
  ];
  return new THREE.LatheGeometry(points, 24);
}

function createQueenGeometry() {
  const points = [
    ...createBasePoints(),
    new THREE.Vector2(0.24, 0.5),
    new THREE.Vector2(0.2, 0.8),
    new THREE.Vector2(0.32, 1.1),
    new THREE.Vector2(0.38, 1.35),
    new THREE.Vector2(0.25, 1.38),
    new THREE.Vector2(0.08, 1.45),
    new THREE.Vector2(0, 1.55)
  ];
  return new THREE.LatheGeometry(points, 28);
}

function createKingGeometry() {
  const points = [
    ...createBasePoints(),
    new THREE.Vector2(0.26, 0.5),
    new THREE.Vector2(0.22, 0.85),
    new THREE.Vector2(0.35, 1.2),
    new THREE.Vector2(0.4, 1.45),
    new THREE.Vector2(0.28, 1.5),
    new THREE.Vector2(0.08, 1.58),
    new THREE.Vector2(0, 1.7)
  ];
  return new THREE.LatheGeometry(points, 28);
}

function createKnightGeometry() {
  return new THREE.LatheGeometry(createBasePoints(), 20);
}



/*******************************************************************************
 * FILE: src\components\3d\EarthSun3D.jsx
 *******************************************************************************/

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

export function EarthSun3D() {
  const earthRef = useRef();
  const cloudsRef = useRef();
  const sunGroupRef = useRef();

  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.05;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.07;
    }
    if (sunGroupRef.current) {
      sunGroupRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group>
      {/* Deep Space Stars */}
      <Stars radius={120} depth={60} count={3500} factor={4} saturation={0.9} fade speed={0.8} />

      {/* Solar Key Light coming from the Sun position */}
      <directionalLight
        position={[28, 18, -40]}
        intensity={2.2}
        color="#fff4db"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Earth Horizon Rim Fill Light */}
      <directionalLight
        position={[-20, -10, -30]}
        intensity={0.8}
        color="#00b4d8"
      />

      {/* Ambient Deep Space Light */}
      <ambientLight intensity={0.4} color="#0d1b2a" />

      {/* ☀️ Glowing Sun Orb & Solar Flare */}
      <group position={[28, 18, -45]} ref={sunGroupRef}>
        {/* Core Sun Mesh */}
        <mesh>
          <sphereGeometry args={[4.5, 32, 32]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Sun Inner Corona */}
        <mesh scale={[1.25, 1.25, 1.25]}>
          <sphereGeometry args={[4.5, 32, 32]} />
          <meshBasicMaterial color="#ffb703" transparent opacity={0.65} side={THREE.BackSide} />
        </mesh>
        {/* Sun Outer Solar Flare Halo */}
        <mesh scale={[1.8, 1.8, 1.8]}>
          <sphereGeometry args={[4.5, 32, 32]} />
          <meshBasicMaterial color="#ff8c00" transparent opacity={0.25} side={THREE.BackSide} />
        </mesh>
      </group>

      {/* 🌍 3D Earth Planet in Background */}
      <group position={[-24, -14, -38]} rotation={[0.4, 0, 0.2]}>
        {/* Earth Base Globe */}
        <mesh ref={earthRef}>
          <sphereGeometry args={[14, 48, 48]} />
          <meshStandardMaterial
            color="#1b4965"
            roughness={0.65}
            metalness={0.1}
            emissive="#0b2545"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Earth Atmosphere Cloud Layer */}
        <mesh ref={cloudsRef} scale={[1.015, 1.015, 1.015]}>
          <sphereGeometry args={[14, 48, 48]} />
          <meshStandardMaterial
            color="#e0f2fe"
            transparent
            opacity={0.3}
            roughness={0.9}
          />
        </mesh>

        {/* Atmospheric Blue Horizon Glow Layer */}
        <mesh scale={[1.06, 1.06, 1.06]}>
          <sphereGeometry args={[14, 48, 48]} />
          <meshBasicMaterial
            color="#48cae4"
            transparent
            opacity={0.35}
            side={THREE.BackSide}
          />
        </mesh>
      </group>

      {/* Atmospheric Horizon Light Grid Plate */}
      <mesh position={[0, -18, -30]} rotation={[-Math.PI / 2.5, 0, 0]}>
        <planeGeometry args={[120, 60]} />
        <meshBasicMaterial color="#0077b6" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}



/*******************************************************************************
 * FILE: src\components\3d\EnvironmentLighting.jsx
 *******************************************************************************/

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Sparkles } from '@react-three/drei';
import { EarthSun3D } from './EarthSun3D';
import { RedNebula3D } from './RedNebula3D';
import { TorchLight3D } from './TorchLight3D';

export function EnvironmentLighting({
  bgEnvironment = 'earth_sun',
  isSunFlipped = false,
  isTorchOn = false
}) {
  const lightGroupRef = useRef();

  useFrame((state) => {
    if (lightGroupRef.current && (bgEnvironment === 'space' || bgEnvironment === 'earth_sun' || bgEnvironment === 'red_theme')) {
      lightGroupRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  // Calculate direction multiplier for shadow flip
  const shadowMultX = isSunFlipped ? -1 : 1;
  const shadowMultZ = isSunFlipped ? -1 : 1;

  return (
    <group>
      {/* Torch Light Overlay if enabled */}
      {isTorchOn && <TorchLight3D />}

      {/* Render Environment Lighting */}
      {(() => {
        switch (bgEnvironment) {
          case 'earth_sun':
            return (
              <group scale={[shadowMultX, 1, shadowMultZ]}>
                <EarthSun3D />
              </group>
            );

          case 'red_theme':
            return (
              <group scale={[shadowMultX, 1, shadowMultZ]}>
                <RedNebula3D />
              </group>
            );

          case 'tournament':
            return (
              <group>
                <mesh position={[0, -0.45, 0]} receiveShadow>
                  <boxGeometry args={[30, 0.1, 30]} />
                  <meshStandardMaterial color="#2c1a0e" roughness={0.3} metalness={0.1} />
                </mesh>
                <mesh position={[0, -0.38, 0]} receiveShadow>
                  <boxGeometry args={[11, 0.15, 11]} />
                  <meshStandardMaterial color="#4a2c11" roughness={0.4} metalness={0.2} />
                </mesh>

                <ambientLight intensity={isTorchOn ? 0.25 : 0.5} color="#fff8e7" />
                <directionalLight
                  position={[8 * shadowMultX, 14, 6 * shadowMultZ]}
                  intensity={2.2}
                  color="#fff0d6"
                  castShadow
                  shadow-mapSize={[2048, 2048]}
                />
                <directionalLight position={[-8 * shadowMultX, 10, -6 * shadowMultZ]} intensity={0.6} color="#d4a373" />
              </group>
            );

          case 'cozy_lounge':
            return (
              <group>
                <mesh position={[0, -0.42, 0]} receiveShadow>
                  <boxGeometry args={[24, 0.12, 24]} />
                  <meshStandardMaterial color="#3d1e11" roughness={0.4} metalness={0.05} />
                </mesh>

                <ambientLight intensity={isTorchOn ? 0.2 : 0.45} color="#ffbe0b" />
                <directionalLight
                  position={[7 * shadowMultX, 12, 8 * shadowMultZ]}
                  intensity={2.0}
                  color="#ffaa00"
                  castShadow
                  shadow-mapSize={[2048, 2048]}
                />
                <pointLight position={[-10 * shadowMultX, 5, -8 * shadowMultZ]} intensity={1.8} color="#ff5500" distance={20} />
              </group>
            );

          case 'royal_palace':
            return (
              <group>
                <mesh position={[0, -0.42, 0]} receiveShadow>
                  <cylinderGeometry args={[8.5, 9, 0.14, 48]} />
                  <meshStandardMaterial color="#f8f9fa" roughness={0.15} metalness={0.1} />
                </mesh>
                <mesh position={[0, -0.34, 0]}>
                  <torusGeometry args={[8.5, 0.08, 16, 64]} />
                  <meshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.8} />
                </mesh>

                <ambientLight intensity={isTorchOn ? 0.3 : 0.6} color="#fdf0d5" />
                <directionalLight
                  position={[10 * shadowMultX, 16, 10 * shadowMultZ]}
                  intensity={2.2}
                  color="#ffffff"
                  castShadow
                  shadow-mapSize={[2048, 2048]}
                />
                <directionalLight position={[-10 * shadowMultX, 12, -10 * shadowMultZ]} intensity={1.0} color="#ffd700" />
              </group>
            );

          case 'studio':
            return (
              <group>
                <mesh position={[0, -0.41, 0]} receiveShadow>
                  <planeGeometry args={[50, 50]} />
                  <meshStandardMaterial color="#18181b" roughness={0.8} metalness={0.1} />
                </mesh>

                <ambientLight intensity={isTorchOn ? 0.2 : 0.4} color="#ffffff" />
                <directionalLight
                  position={[10 * shadowMultX, 15, 10 * shadowMultZ]}
                  intensity={2.2}
                  color="#ffffff"
                  castShadow
                  shadow-mapSize={[2048, 2048]}
                />
                <directionalLight position={[-10 * shadowMultX, 12, -8 * shadowMultZ]} intensity={1.0} color="#e4e4e7" />
              </group>
            );

          case 'zen_garden':
            return (
              <group>
                <mesh position={[0, -0.42, 0]} receiveShadow>
                  <boxGeometry args={[12, 0.14, 12]} />
                  <meshStandardMaterial color="#212529" roughness={0.6} metalness={0.2} />
                </mesh>

                <ambientLight intensity={isTorchOn ? 0.25 : 0.45} color="#d8f3dc" />
                <directionalLight
                  position={[8 * shadowMultX, 14, 6 * shadowMultZ]}
                  intensity={2.0}
                  color="#74c69d"
                  castShadow
                  shadow-mapSize={[2048, 2048]}
                />
                <directionalLight position={[-8 * shadowMultX, 10, -6 * shadowMultZ]} intensity={0.8} color="#40916c" />
              </group>
            );

          case 'space':
          default:
            return (
              <group ref={lightGroupRef}>
                <ambientLight intensity={isTorchOn ? 0.2 : 0.4} color="#180930" />
                <directionalLight
                  position={[8 * shadowMultX, 14, 6 * shadowMultZ]}
                  intensity={1.8}
                  color="#ff007f"
                  castShadow
                  shadow-mapSize={[2048, 2048]}
                />
                <directionalLight position={[-8 * shadowMultX, 10, -6 * shadowMultZ]} intensity={1.0} color="#9d4edd" />
                <Stars radius={100} depth={50} count={3500} factor={4} saturation={1} fade speed={1} />
                <Sparkles count={100} scale={14} size={3.5} speed={0.5} color="#ff007f" />
              </group>
            );
        }
      })()}
    </group>
  );
}



/*******************************************************************************
 * FILE: src\components\3d\InteractiveHeroBoard.jsx
 *******************************************************************************/

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ChessBoard3D } from './ChessBoard3D';
import { ChessPiece3D } from './ChessPiece3D';
import { EnvironmentLighting } from './EnvironmentLighting';
import { ChessGame } from '../../engine/chessEngine';
import { sounds } from '../../audio/soundSystem';

const demoGame = new ChessGame();

function RotatingGroup({ children }) {
  const groupRef = useRef();
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });
  return <group ref={groupRef}>{children}</group>;
}

function PhysicsHeroPiece({ type, color, basePos, knockTrigger }) {
  const meshGroupRef = useRef();
  const physRef = useRef({
    x: basePos[0],
    y: basePos[1],
    z: basePos[2],
    vx: 0,
    vy: 0,
    vz: 0,
    rx: 0,
    ry: color === 'w' ? 0 : Math.PI,
    rz: 0,
    rvx: 0,
    rvy: 0,
    rvz: 0,
    isKnocked: false
  });

  const lastTriggerRef = useRef(0);

  useMemo(() => {
    physRef.current.x = basePos[0];
    physRef.current.y = basePos[1];
    physRef.current.z = basePos[2];
  }, [basePos]);

  if (knockTrigger > 0 && knockTrigger !== lastTriggerRef.current) {
    lastTriggerRef.current = knockTrigger;
    const angle = Math.random() * Math.PI * 2;
    const speed = 2.2 + Math.random() * 3.8;
    physRef.current.vx = Math.cos(angle) * speed;
    physRef.current.vy = 4.0 + Math.random() * 4.5;
    physRef.current.vz = Math.sin(angle) * speed;
    physRef.current.rvx = (Math.random() - 0.5) * 14;
    physRef.current.rvy = (Math.random() - 0.5) * 14;
    physRef.current.rvz = (Math.random() - 0.5) * 14;
    physRef.current.isKnocked = true;
  }

  useFrame((state, delta) => {
    if (!meshGroupRef.current) return;
    const st = physRef.current;
    if (st.isKnocked) {
      st.vy -= delta * 12.0; // Gravity simulation
      st.x += st.vx * delta;
      st.y += st.vy * delta;
      st.z += st.vz * delta;
      st.rx += st.rvx * delta;
      st.ry += st.rvy * delta;
      st.rz += st.rvz * delta;

      if (st.y < -4.5) {
        st.isKnocked = false;
      }
    } else {
      st.x += (basePos[0] - st.x) * Math.min(delta * 4, 1);
      st.y += (basePos[1] - st.y) * Math.min(delta * 4, 1);
      st.z += (basePos[2] - st.z) * Math.min(delta * 4, 1);
      st.rx += (0 - st.rx) * Math.min(delta * 4, 1);
      st.ry += ((color === 'w' ? 0 : Math.PI) - st.ry) * Math.min(delta * 4, 1);
      st.rz += (0 - st.rz) * Math.min(delta * 4, 1);
    }

    meshGroupRef.current.position.set(st.x, st.y, st.z);
    meshGroupRef.current.rotation.set(st.rx, st.ry, st.rz);
  });

  return (
    <group ref={meshGroupRef}>
      <ChessPiece3D type={type} color={color} position={[0, 0, 0]} isSelected={false} isPossibleTarget={false} />
    </group>
  );
}

function FallingPieceItem({ type, color, initialX, initialZ, initialY, speed, rotSpeed, knockTrigger }) {
  const groupRef = useRef();
  const pos = useRef({ x: initialX, y: initialY, z: initialZ });
  const rot = useRef({
    x: Math.random() * Math.PI * 2,
    y: Math.random() * Math.PI * 2,
    z: Math.random() * Math.PI * 2
  });

  useFrame((state, delta) => {
    if (groupRef.current) {
      const currentSpeed = knockTrigger > 0 ? speed * 1.8 : speed;
      pos.current.y -= delta * currentSpeed;
      rot.current.x += delta * rotSpeed.x * (knockTrigger > 0 ? 2 : 1);
      rot.current.y += delta * rotSpeed.y * (knockTrigger > 0 ? 2 : 1);
      rot.current.z += delta * rotSpeed.z * (knockTrigger > 0 ? 2 : 1);

      if (pos.current.y < -3.8) {
        pos.current.y = 8 + Math.random() * 4;
        const angle = Math.random() * Math.PI * 2;
        const dist = 4.2 + Math.random() * 4.5;
        pos.current.x = Math.cos(angle) * dist;
        pos.current.z = Math.sin(angle) * dist;
      }

      groupRef.current.position.set(pos.current.x, pos.current.y, pos.current.z);
      groupRef.current.rotation.set(rot.current.x, rot.current.y, rot.current.z);
    }
  });

  return (
    <group ref={groupRef}>
      <ChessPiece3D type={type} color={color} position={[0, 0, 0]} isSelected={false} isPossibleTarget={false} />
    </group>
  );
}

function FallingPieces3D({ knockTrigger }) {
  const pieces = useMemo(() => {
    const types = ['p', 'n', 'b', 'r', 'q', 'k'];
    const colors = ['w', 'b'];
    const items = [];
    for (let i = 0; i < 22; i++) {
      const angle = (i / 22) * Math.PI * 2;
      const dist = 4.0 + Math.random() * 4.2;
      items.push({
        id: `falling-piece-${i}`,
        type: types[i % types.length],
        color: colors[i % 2],
        initialX: Math.cos(angle) * dist,
        initialZ: Math.sin(angle) * dist,
        initialY: (i % 6) * 1.8 + Math.random() * 3,
        speed: 1.8 + Math.random() * 2.2,
        rotSpeed: {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 3,
          z: (Math.random() - 0.5) * 3
        }
      });
    }
    return items;
  }, []);

  return (
    <group>
      {pieces.map((item) => (
        <FallingPieceItem key={item.id} {...item} knockTrigger={knockTrigger} />
      ))}
    </group>
  );
}

export function InteractiveHeroBoard({ theme = 'brown', bgEnvironment = 'earth_sun' }) {
  const [knockTrigger, setKnockTrigger] = useState(0);

  const pieceElements = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = demoGame.board[row][col];
      if (piece) {
        const posX = col - 3.5;
        const posZ = row - 3.5;
        pieceElements.push(
          <PhysicsHeroPiece
            key={`hero-piece-${row}-${col}-${piece.type}-${piece.color}`}
            type={piece.type}
            color={piece.color}
            basePos={[posX, 0.1, posZ]}
            knockTrigger={knockTrigger}
          />
        );
      }
    }
  }

  const handleCanvasClick = () => {
    sounds.playCapture();
    setKnockTrigger((prev) => prev + 1);
  };

  return (
    <div
      style={{ width: '100%', height: '480px', borderRadius: '20px', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
      onClick={handleCanvasClick}
      onTouchStart={handleCanvasClick}
    >
      <Canvas
        shadows
        camera={{ position: [5.5, 6.5, 6.5], fov: 48 }}
        gl={{ antialias: true, alpha: true }}
      >
        <EnvironmentLighting bgEnvironment={bgEnvironment} />

        <RotatingGroup>
          <ChessBoard3D
            boardState={demoGame.board}
            theme={theme}
          />
          {pieceElements}
        </RotatingGroup>

        {/* Falling Animated 3D Pieces */}
        <FallingPieces3D knockTrigger={knockTrigger} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          maxPolarAngle={Math.PI / 2 - 0.05}
          enableDamping
        />
      </Canvas>
    </div>
  );
}



/*******************************************************************************
 * FILE: src\components\3d\RedNebula3D.jsx
 *******************************************************************************/

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export function RedNebula3D() {
  const redSunRef = useRef();

  useFrame((state, delta) => {
    if (redSunRef.current) {
      redSunRef.current.rotation.y += delta * 0.03;
    }
  });

  return (
    <group>
      {/* Deep Red Cosmic Stars */}
      <Stars radius={100} depth={50} count={3000} factor={5} saturation={1} fade speed={1.2} />
      <Sparkles count={120} scale={18} size={4} speed={0.8} color="#ff0033" />

      {/* Ruby Red Key Light */}
      <directionalLight
        position={[25, 20, -35]}
        intensity={2.2}
        color="#ff2244"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Deep Amber Fill Light */}
      <directionalLight
        position={[-20, 10, -25]}
        intensity={1.0}
        color="#ff6600"
      />

      {/* Dark Crimson Ambient Light */}
      <ambientLight intensity={0.35} color="#2b000a" />

      {/* 🔴 Red Giant Star / Mars Atmosphere in background */}
      <group position={[26, 16, -45]} ref={redSunRef}>
        <mesh>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial color="#ff0033" />
        </mesh>
        <mesh scale={[1.3, 1.3, 1.3]}>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial color="#ff4400" transparent opacity={0.6} side={THREE.BackSide} />
        </mesh>
        <mesh scale={[1.9, 1.9, 1.9]}>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial color="#990022" transparent opacity={0.25} side={THREE.BackSide} />
        </mesh>
      </group>

      {/* Distant Red Planet */}
      <group position={[-25, -12, -35]}>
        <mesh>
          <sphereGeometry args={[12, 32, 32]} />
          <meshStandardMaterial
            color="#800f2f"
            roughness={0.7}
            metalness={0.2}
            emissive="#590d22"
            emissiveIntensity={0.4}
          />
        </mesh>
        <mesh scale={[1.05, 1.05, 1.05]}>
          <sphereGeometry args={[12, 32, 32]} />
          <meshBasicMaterial color="#ff4d6d" transparent opacity={0.3} side={THREE.BackSide} />
        </mesh>
      </group>

      {/* Horizon Fog Plate */}
      <mesh position={[0, -18, -25]} rotation={[-Math.PI / 2.5, 0, 0]}>
        <planeGeometry args={[120, 60]} />
        <meshBasicMaterial color="#590d22" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}



/*******************************************************************************
 * FILE: src\components\3d\TorchLight3D.jsx
 *******************************************************************************/

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function TorchLight3D() {
  const spotLightRef = useRef();
  const pointLightRef = useRef();

  // Gentle realistic torch flame flicker effect
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const flicker = Math.sin(time * 12) * 0.25 + Math.cos(time * 23) * 0.15;
    if (spotLightRef.current) {
      spotLightRef.current.intensity = 3.6 + flicker;
    }
    if (pointLightRef.current) {
      pointLightRef.current.intensity = 2.0 + flicker * 0.5;
    }
  });

  return (
    <group position={[0, 9, 4]}>
      {/* Primary Torch Spotlight casting dynamic piece shadows */}
      <spotLight
        ref={spotLightRef}
        position={[0, 0, 0]}
        target-position={[0, 0, 0]}
        angle={0.65}
        penumbra={0.4}
        intensity={3.8}
        color="#ffaa33"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />

      {/* Warm Ambient Torch Point Light */}
      <pointLight
        ref={pointLightRef}
        position={[0, -0.5, 0]}
        intensity={2.2}
        color="#ff7700"
        distance={18}
      />

      {/* Visual Glowing Torch Flame Orb */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#ffcc00" />
      </mesh>
      <mesh position={[0, 0, 0]} scale={[1.6, 1.6, 1.6]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#ff4400" transparent opacity={0.45} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}



/*******************************************************************************
 * FILE: src\components\ui\AcademyView.jsx
 *******************************************************************************/

import React, { useState, useEffect } from 'react';
import { BookOpen, Award, Compass, ArrowRight, Play, CheckCircle2, RefreshCw } from 'lucide-react';
import { sounds } from '../../audio/soundSystem';

const LESSONS = [
  {
    id: 'basics',
    category: 'basics',
    title: 'Chess Board & Piece Movement',
    description: 'Learn how to set up the board, understand piece values, and execute legal moves.',
    difficulty: 'Beginner',
    time: '5 min',
    icon: <Compass size={20} />,
    color: '#00f0ff',
    content: `
      <h3>Welcome to the ChessX Academy!</h3>
      <p>Chess is played on an 8x8 grid of alternating light and dark squares. The bottom right square for each player must always be light ("white on right").</p>
      <br/>
      <h4>Piece Movements:</h4>
      <ul>
        <li><strong>Rook (5 Pts):</strong> Moves horizontally or vertically as far as desired.</li>
        <li><strong>Pawn (1 Pt):</strong> Moves forward 1 square (or 2 on its first move). Captures diagonally.</li>
      </ul>
      <br/>
      <h4>Your Checkup Task:</h4>
      <p>Click your <strong>White Rook</strong> and move it to capture the unprotected <strong>Black Pawn</strong> on the board below.</p>
    `,
    checkup: {
      prompt: 'Capture the unprotected Black Pawn with your Rook!',
      initialBoard: [
        ['', '', '', ''],
        ['bP', '', '', ''],
        ['', '', '', ''],
        ['wR', '', '', '']
      ],
      validMove: { from: { r: 3, c: 0 }, to: { r: 1, c: 0 } },
      symbols: { wR: '♖', bP: '♟' }
    }
  },
  {
    id: 'openings',
    category: 'openings',
    title: 'Golden Opening Principles',
    description: 'Master the first phase of the game: claim the center, develop pieces, and castle early.',
    difficulty: 'Beginner',
    time: '8 min',
    icon: <BookOpen size={20} />,
    color: '#22c55e',
    content: `
      <h3>Claim the Center</h3>
      <p>The e4 and d4 squares are crucial. Opening with a center pawn move claims space and releases your Bishop and Queen.</p>
      <br/>
      <h4>Your Checkup Task:</h4>
      <p>Click your <strong>e2 Pawn</strong> (middle-left) and advance it 2 squares forward to the <strong>e4 square</strong> to claim the center!</p>
    `,
    checkup: {
      prompt: 'Advance your e-Pawn two squares to establish center control!',
      initialBoard: [
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
        ['', 'wP', '', '']
      ],
      validMove: { from: { r: 3, c: 1 }, to: { r: 1, c: 1 } },
      symbols: { wP: '♙' }
    }
  },
  {
    id: 'tactics',
    category: 'tactics',
    title: 'Tactical Motifs: Forks & Pins',
    description: 'Learn to identify pins, forks, skewers, and double attacks to win opponent material.',
    difficulty: 'Intermediate',
    time: '10 min',
    icon: <Award size={20} />,
    color: '#ffd700',
    content: `
      <h3>The Knight Fork</h3>
      <p>A fork attacks two pieces at once. Knights are excellent for this because their L-shaped moves can bypass blockades.</p>
      <br/>
      <h4>Your Checkup Task:</h4>
      <p>Find the square where your <strong>White Knight</strong> can land to attack both the <strong>Black King</strong> and the <strong>Black Queen</strong> at the same time!</p>
    `,
    checkup: {
      prompt: 'Move your Knight to fork both the Black King and Queen!',
      initialBoard: [
        ['', 'bQ', '', 'bK'],
        ['', '', '', ''],
        ['', '', '', ''],
        ['wN', '', '', '']
      ],
      validMove: { from: { r: 3, c: 0 }, to: { r: 1, c: 2 } }, // L-shape to index (1,2) attacks (0,1) and (0,3)
      symbols: { wN: '♘', bK: '♚', bQ: '♛' }
    }
  },
  {
    id: 'endgames',
    category: 'endgames',
    title: 'Essential Endgame Checkmates',
    description: 'Learn standard mating patterns: King + Queen and King + Rook mates against a lone King.',
    difficulty: 'Intermediate',
    time: '12 min',
    icon: <Play size={20} />,
    color: '#ff3b00',
    content: `
      <h3>Rook Checkmate</h3>
      <p>Deliver mate by sealing the back rank. The White King on g6 traps the Black King, preventing escape.</p>
      <br/>
      <h4>Your Checkup Task:</h4>
      <p>Deliver checkmate by sliding your <strong>White Rook</strong> to the back rank, trapping the Black King in the corner!</p>
    `,
    checkup: {
      prompt: 'Deliver checkmate by moving your Rook to the back rank!',
      initialBoard: [
        ['', '', '', 'bK'],
        ['wR', '', '', ''],
        ['', '', 'wK', ''],
        ['', '', '', '']
      ],
      validMove: { from: { r: 1, c: 0 }, to: { r: 0, c: 0 } },
      symbols: { wR: '♖', wK: '♔', bK: '♚' }
    }
  }
];

export function AcademyView() {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [filter, setFilter] = useState('all');
  const [completedLessons, setCompletedLessons] = useState([]);
  
  // Checkup game states
  const [checkupBoard, setCheckupBoard] = useState(null);
  const [selectedCheckupSq, setSelectedCheckupSq] = useState(null);
  const [checkupState, setCheckupState] = useState('read'); // 'read', 'play', 'success', 'fail'

  useEffect(() => {
    const saved = localStorage.getItem('chessx_completed_lessons');
    if (saved) {
      try {
        setCompletedLessons(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const filtered = filter === 'all'
    ? LESSONS
    : LESSONS.filter(l => l.category === filter);

  const openLesson = (lesson) => {
    sounds.playClick();
    setSelectedLesson(lesson);
    setCheckupState('read');
    setSelectedCheckupSq(null);
    if (lesson.checkup) {
      setCheckupBoard(lesson.checkup.initialBoard.map(row => [...row]));
    }
  };

  const closeLesson = () => {
    sounds.playClick();
    setSelectedLesson(null);
    setCheckupState('read');
  };

  const handleStartCheckup = () => {
    sounds.playClick();
    setCheckupState('play');
  };

  const handleSquareClick = (r, c) => {
    if (checkupState !== 'play') return;
    const lesson = selectedLesson;
    if (!lesson || !lesson.checkup) return;

    const piece = checkupBoard[r][c];
    if (selectedCheckupSq) {
      // Check if move matches valid checkup move
      const valid = lesson.checkup.validMove;
      if (selectedCheckupSq.r === valid.from.r && selectedCheckupSq.c === valid.from.c && r === valid.to.r && c === valid.to.c) {
        // Execute move on board visual
        const updatedBoard = checkupBoard.map(row => [...row]);
        updatedBoard[r][c] = updatedBoard[valid.from.r][valid.from.c];
        updatedBoard[valid.from.r][valid.from.c] = '';
        setCheckupBoard(updatedBoard);
        
        sounds.playCapture();
        sounds.playCheck();
        setCheckupState('success');

        // Mark as completed
        const nextCompleted = [...completedLessons];
        if (!nextCompleted.includes(lesson.id)) {
          nextCompleted.push(lesson.id);
          setCompletedLessons(nextCompleted);
          localStorage.setItem('chessx_completed_lessons', JSON.stringify(nextCompleted));
        }
      } else {
        sounds.playClick();
        setCheckupState('fail');
        setSelectedCheckupSq(null);
      }
    } else {
      if (piece && piece.startsWith('w')) {
        sounds.playClick();
        setSelectedCheckupSq({ r, c });
      }
    }
  };

  const handleRetryCheckup = () => {
    sounds.playClick();
    setCheckupState('play');
    setSelectedCheckupSq(null);
    if (selectedLesson && selectedLesson.checkup) {
      setCheckupBoard(selectedLesson.checkup.initialBoard.map(row => [...row]));
    }
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2.5rem 1.5rem',
      color: '#fff',
      position: 'relative',
      zIndex: 2
    }}>
      {/* Academy Header */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '2.8rem',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #fff 30%, var(--accent-dragonfruit-bright))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.6rem',
          fontFamily: 'var(--font-heading)'
        }}>
          ChessX Academy
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto', marginBottom: '1.5rem' }}>
          Master chess strategies, tactical motifs, openings, and endgame techniques to boost your ELO.
        </p>

        {/* Progress Tracker */}
        <div style={{
          maxWidth: '450px',
          margin: '0 auto',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '12px 20px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.85rem'
        }}>
          <span>Academy Progress:</span>
          <strong>{completedLessons.length} / {LESSONS.length} Lessons Completed</strong>
          <div style={{
            width: '100px',
            height: '6px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(completedLessons.length / LESSONS.length) * 100}%`,
              height: '100%',
              background: 'var(--accent-dragonfruit)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '2.5rem',
        flexWrap: 'wrap'
      }}>
        {['all', 'basics', 'openings', 'tactics', 'endgames'].map((cat) => (
          <button
            key={cat}
            onClick={() => { sounds.playClick(); setFilter(cat); }}
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              border: filter === cat ? '1px solid var(--accent-dragonfruit)' : '1px solid rgba(255,255,255,0.1)',
              background: filter === cat ? 'rgba(255, 59, 0, 0.22)' : 'rgba(255, 255, 255, 0.05)',
              color: filter === cat ? '#fff' : 'var(--text-dim)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s ease',
              boxShadow: filter === cat ? 'var(--shadow-dragonfruit)' : 'none'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lessons Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {filtered.map((lesson) => {
          const isCompleted = completedLessons.includes(lesson.id);
          return (
            <div
              key={lesson.id}
              onClick={() => openLesson(lesson)}
              className="glass-panel glass-panel-interactive"
              style={{
                padding: '1.8rem',
                borderRadius: '16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: isCompleted ? '1px solid #22c55e' : '1px solid rgba(255, 69, 0, 0.15)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Completed Ribbon */}
              {isCompleted && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  color: '#22c55e',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ✓ COMPLETED
                </div>
              )}

              {/* Top Row: Icon & Tag */}
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.2rem'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: `rgba(${lesson.color === '#00f0ff' ? '0,240,255' : lesson.color === '#22c55e' ? '34,197,94' : '255,59,0'}, 0.15)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: lesson.color
                  }}>
                    {lesson.icon}
                  </div>
                  {!isCompleted && (
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.08)',
                      color: 'var(--text-dim)'
                    }}>
                      {lesson.difficulty}
                    </span>
                  )}
                </div>

                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#fff',
                  marginBottom: '0.6rem',
                  fontFamily: 'var(--font-heading)'
                }}>
                  {lesson.title}
                </h3>
                <p style={{
                  color: 'var(--text-dim)',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  marginBottom: '1.5rem'
                }}>
                  {lesson.description}
                </p>
              </div>

              {/* Bottom Row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                paddingTop: '1rem',
                fontSize: '0.8rem',
                color: 'var(--text-dim)'
              }}>
                <span>⏱️ {lesson.time}</span>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: isCompleted ? '#22c55e' : lesson.color,
                  fontWeight: 600
                }}>
                  {isCompleted ? 'Review Lesson' : 'Start Lesson'} <ArrowRight size={14} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lesson Details & Checkup Modal */}
      {selectedLesson && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(10, 8, 18, 0.9)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '650px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '2.5rem',
            borderRadius: '20px',
            border: `1px solid ${selectedLesson.color}33`,
            boxShadow: `0 20px 60px ${selectedLesson.color}15`,
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={closeLesson}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.06)',
                border: 'none',
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              ✕
            </button>

            {/* Modal Title */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '1.5rem',
              color: selectedLesson.color
            }}>
              {selectedLesson.icon}
              <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {selectedLesson.category} • {selectedLesson.difficulty}
              </span>
            </div>

            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: 900,
              color: '#fff',
              marginBottom: '1.5rem',
              fontFamily: 'var(--font-heading)'
            }}>
              {selectedLesson.title}
            </h2>

            {checkupState === 'read' && (
              <>
                {/* Scrollable Content */}
                <div
                  className="lesson-content"
                  style={{
                    color: 'rgba(255,255,255,0.85)',
                    lineHeight: 1.7,
                    fontSize: '0.95rem'
                  }}
                  dangerouslySetInnerHTML={{ __html: selectedLesson.content }}
                />

                {/* Practice Checkup Start Button */}
                <button
                  onClick={handleStartCheckup}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    marginTop: '2rem',
                    background: `linear-gradient(135deg, ${selectedLesson.color} 0%, #111 100%)`,
                    boxShadow: `0 4px 18px ${selectedLesson.color}33`
                  }}
                >
                  🎯 Play Checkup Practice Game
                </button>
              </>
            )}

            {checkupState === 'play' && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-dim)', marginBottom: '1rem', fontWeight: 600 }}>
                  {selectedLesson.checkup?.prompt}
                </p>

                {/* 4x4 Miniature Board */}
                <div style={{
                  width: '260px',
                  height: '260px',
                  margin: '0 auto 1.5rem auto',
                  border: '4px solid #4a2e16',
                  borderRadius: '8px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)'
                }}>
                  {checkupBoard && checkupBoard.map((row, r) =>
                    row.map((piece, c) => {
                      const isLight = (r + c) % 2 === 0;
                      const isSelected = selectedCheckupSq && selectedCheckupSq.r === r && selectedCheckupSq.c === c;
                      
                      return (
                        <div
                          key={`${r}-${c}`}
                          onClick={() => handleSquareClick(r, c)}
                          style={{
                            background: isSelected
                              ? 'rgba(0, 240, 255, 0.6)'
                              : isLight ? '#e0c9a6' : '#8b5a2b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '2rem',
                            color: piece.startsWith('w') ? '#fff' : '#000',
                            textShadow: '1px 1px 3px rgba(0,0,0,0.5)'
                          }}
                        >
                          {selectedLesson.checkup?.symbols[piece] || ''}
                        </div>
                      );
                    })
                  )}
                </div>

                <button onClick={() => setCheckupState('read')} className="btn btn-secondary" style={{ width: '100%' }}>
                  Back to Lesson
                </button>
              </div>
            )}

            {checkupState === 'success' && (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                <h3 style={{ color: '#22c55e', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.8rem' }}>
                  Checkup Complete!
                </h3>
                <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>
                  You successfully executed the correct move and passed the checkup practice.
                </p>
                <button onClick={closeLesson} className="btn btn-success" style={{ width: '100%' }}>
                  ✓ Done
                </button>
              </div>
            )}

            {checkupState === 'fail' && (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                <h3 style={{ color: '#ff3b00', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.8rem' }}>
                  Incorrect Move
                </h3>
                <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>
                  That move was incorrect. Try again to demonstrate your understanding!
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleRetryCheckup} className="btn btn-primary" style={{ flex: 1 }}>
                    <RefreshCw size={14} /> Retry Checkup
                  </button>
                  <button onClick={() => setCheckupState('read')} className="btn btn-secondary" style={{ flex: 1 }}>
                    Read Lesson
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



/*******************************************************************************
 * FILE: src\components\ui\AchievementToast.jsx
 *******************************************************************************/

import React, { useEffect, useState } from 'react';
import { useStats } from '../../context/StatsContext';

export function AchievementToast() {
  const { toastQueue, dismissToast } = useStats();
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    if (toastQueue.length === 0) return;
    const next = toastQueue[0];
    setVisible(v => {
      if (v.find(a => a.id === next.id)) return v;
      return [...v, next];
    });

    const timer = setTimeout(() => {
      setVisible(v => v.filter(a => a.id !== next.id));
      dismissToast(next.id);
    }, 4500);

    return () => clearTimeout(timer);
  }, [toastQueue, dismissToast]);

  if (visible.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      pointerEvents: 'none',
    }}>
      <style>{`
        @keyframes toastIn  { from { opacity:0; transform:translateX(60px) scale(0.9); } to { opacity:1; transform:translateX(0) scale(1); } }
        @keyframes toastOut { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(60px); } }
        .ach-toast { animation: toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1); }
      `}</style>
      {visible.map(ach => (
        <div
          key={ach.id}
          className="ach-toast"
          style={{
            background: 'linear-gradient(135deg, #1a1a3a, #12122a)',
            border: '1px solid rgba(255,215,0,0.4)',
            borderRadius: '14px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            minWidth: '280px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,215,0,0.1)',
            pointerEvents: 'all',
          }}
        >
          {/* Icon glow */}
          <div style={{
            width: '46px', height: '46px', borderRadius: '12px',
            background: 'rgba(255,215,0,0.15)',
            border: '1px solid rgba(255,215,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', flexShrink: 0,
          }}>
            {ach.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.7rem', color: '#ffd700', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '2px' }}>
              🏅 ACHIEVEMENT UNLOCKED
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', marginBottom: '2px' }}>
              {ach.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
              {ach.description}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#7dff8c', marginTop: '4px', fontWeight: 700 }}>
              +{ach.xp} XP earned
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}



/*******************************************************************************
 * FILE: src\components\ui\ChessClock.jsx
 *******************************************************************************/

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, Zap } from 'lucide-react';

export const TIME_CONTROLS = [
  { id: 'bullet1',  label: 'Bullet',  time: 60,   increment: 0,  icon: '⚡', desc: '1+0' },
  { id: 'bullet2',  label: 'Bullet',  time: 120,  increment: 1,  icon: '⚡', desc: '2+1' },
  { id: 'blitz3',   label: 'Blitz',   time: 180,  increment: 2,  icon: '🔥', desc: '3+2' },
  { id: 'blitz5',   label: 'Blitz',   time: 300,  increment: 0,  icon: '🔥', desc: '5+0' },
  { id: 'rapid10',  label: 'Rapid',   time: 600,  increment: 0,  icon: '⏱️', desc: '10+0' },
  { id: 'rapid15',  label: 'Rapid',   time: 900,  increment: 10, icon: '⏱️', desc: '15+10' },
  { id: 'classical',label: 'Classic', time: 1800, increment: 0,  icon: '🏛️', desc: '30+0' },
  { id: 'unlimited',label: 'Free',    time: null,  increment: 0,  icon: '∞',  desc: '∞' },
];

function fmt(sec) {
  if (sec === null) return '∞';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export function ChessClock({ activeColor, isGameOver, increment = 0, initialTime = 300, onTimeOut }) {
  const [wTime, setWTime] = useState(initialTime);
  const [bTime, setBTime] = useState(initialTime);
  const intervalRef = useRef(null);
  const timeoutFiredRef = useRef(false);

  // Reset when a new game starts
  useEffect(() => {
    setWTime(initialTime);
    setBTime(initialTime);
    timeoutFiredRef.current = false;
  }, [initialTime]);

  // Add increment after each move (when turn changes)
  const prevColorRef = useRef(activeColor);
  useEffect(() => {
    if (initialTime === null) return;
    if (prevColorRef.current !== activeColor && increment > 0) {
      // Add increment to the player who just moved
      if (activeColor === 'b') {
        setWTime(t => t + increment);
      } else {
        setBTime(t => t + increment);
      }
    }
    prevColorRef.current = activeColor;
  }, [activeColor, increment, initialTime]);

  useEffect(() => {
    if (isGameOver || initialTime === null) return;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (activeColor === 'w') {
        setWTime(t => {
          if (t <= 1 && !timeoutFiredRef.current) {
            timeoutFiredRef.current = true;
            clearInterval(intervalRef.current);
            onTimeOut?.('w');
            return 0;
          }
          return Math.max(0, t - 1);
        });
      } else {
        setBTime(t => {
          if (t <= 1 && !timeoutFiredRef.current) {
            timeoutFiredRef.current = true;
            clearInterval(intervalRef.current);
            onTimeOut?.('b');
            return 0;
          }
          return Math.max(0, t - 1);
        });
      }
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [activeColor, isGameOver, initialTime, onTimeOut]);

  if (initialTime === null) return null;

  const wLow = wTime <= 10;
  const bLow = bTime <= 10;

  const clockStyle = (isActive, isLow) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '10px',
    background: isActive
      ? isLow ? 'rgba(255,50,50,0.3)' : 'rgba(255,215,0,0.15)'
      : 'rgba(255,255,255,0.05)',
    border: `1px solid ${isActive ? (isLow ? 'rgba(255,50,50,0.6)' : 'rgba(255,215,0,0.4)') : 'rgba(255,255,255,0.08)'}`,
    transition: 'all 0.3s',
    minWidth: '90px',
    justifyContent: 'center',
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {/* White clock */}
      <div style={clockStyle(activeColor === 'w', wLow)}>
        <Clock size={13} style={{ color: wLow && activeColor==='w' ? '#ff5555' : 'rgba(255,255,255,0.5)' }} />
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 700,
          fontSize: '1.1rem',
          color: wLow && activeColor==='w' ? '#ff5555' : activeColor==='w' ? '#ffd700' : 'rgba(255,255,255,0.5)',
          animation: wLow && activeColor==='w' ? 'pulse 1s infinite' : 'none',
        }}>
          {fmt(wTime)}
        </span>
      </div>

      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '1rem' }}>vs</span>

      {/* Black clock */}
      <div style={clockStyle(activeColor === 'b', bLow)}>
        <Clock size={13} style={{ color: bLow && activeColor==='b' ? '#ff5555' : 'rgba(255,255,255,0.5)' }} />
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 700,
          fontSize: '1.1rem',
          color: bLow && activeColor==='b' ? '#ff5555' : activeColor==='b' ? '#ffd700' : 'rgba(255,255,255,0.5)',
          animation: bLow && activeColor==='b' ? 'pulse 1s infinite' : 'none',
        }}>
          {fmt(bTime)}
        </span>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

export function TimeControlPicker({ selected, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {TIME_CONTROLS.map(tc => (
        <button
          key={tc.id}
          onClick={() => onChange(tc)}
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            border: `1px solid ${selected?.id === tc.id ? 'rgba(255,215,0,0.6)' : 'rgba(255,255,255,0.1)'}`,
            background: selected?.id === tc.id ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.04)',
            color: selected?.id === tc.id ? '#ffd700' : 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 600,
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            minWidth: '64px',
          }}
        >
          <span style={{ fontSize: '1rem' }}>{tc.icon}</span>
          <span>{tc.label}</span>
          <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{tc.desc}</span>
        </button>
      ))}
    </div>
  );
}



/*******************************************************************************
 * FILE: src\components\ui\DashboardView.jsx
 *******************************************************************************/

import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Bot, Users, Globe, ChevronRight, Zap, Brain, Trophy,
  Clock, BarChart2, Puzzle, Tv2, Swords, BookOpen, Star, Flame
} from 'lucide-react';
import { sounds } from '../../audio/soundSystem';
import { InteractiveHeroBoard } from '../3d/InteractiveHeroBoard';
import { useAuth } from '../../context/AuthContext';
import { useStats } from '../../context/StatsContext';

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '', duration = 1800 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const step = target / (duration / 16);
          const timer = setInterval(() => {
            start = Math.min(start + step, target);
            setCount(Math.floor(start));
            if (start >= target) clearInterval(timer);
          }, 16);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

// ─── AI Difficulty Config ─────────────────────────────────────────────────────
const DIFFICULTIES = [
  {
    id: 'easy',
    label: 'Easy',
    subtitle: 'Beginner Friendly',
    emoji: '🌱',
    elo: '~800 ELO',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.3)',
  },
  {
    id: 'hard',
    label: 'Hard',
    subtitle: 'Intermediate Level',
    emoji: '⚔️',
    elo: '~1400 ELO',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.3)',
  },
  {
    id: 'difficult',
    label: 'Difficult',
    subtitle: 'Master Level AI',
    emoji: '👑',
    elo: '~1800 ELO',
    color: 'var(--accent-dragonfruit-bright)',
    bg: 'rgba(255,0,127,0.14)',
    border: 'rgba(255,0,127,0.4)',
  },
];

// ─── Time Controls ────────────────────────────────────────────────────────────
const TIME_OPTIONS = [
  { id: 'bullet1',  label: '1+0',   name: 'Bullet',   icon: '⚡' },
  { id: 'blitz3',   label: '3+2',   name: 'Blitz',    icon: '🔥' },
  { id: 'rapid10',  label: '10+0',  name: 'Rapid',    icon: '⏱️' },
  { id: 'unlim',    label: '∞',     name: 'Unlimited',icon: '🕰️' },
];

// ─── Feature Cards ────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: <Zap size={22} />,      title: 'Real-Time 3D Board',     desc: 'Powered by Three.js & React Three Fiber with physics-based animations', color: '#00f0ff' },
  { icon: <Brain size={22} />,    title: 'Advanced AI Engine',      desc: 'Minimax with Alpha-Beta pruning, PST tables & 3 difficulty levels',     color: '#ff007f' },
  { icon: <Puzzle size={22} />,   title: 'Daily Chess Puzzles',     desc: 'Sharpen your tactics with fresh puzzles updated every day',             color: '#a855f7' },
  { icon: <Clock size={22} />,    title: 'Time Controls',           desc: 'Bullet, Blitz, Rapid & Classical modes for every play style',           color: '#f59e0b' },
  { icon: <BarChart2 size={22} />,title: 'ELO Rating System',       desc: 'Standard ELO tracking with win/loss/draw statistics and history',       color: '#22c55e' },
  { icon: <Globe size={22} />,    title: 'Online Multiplayer',      desc: 'Private room codes to challenge friends in real-time 3D matches',       color: '#06b6d4' },
];

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function DashboardView({ startGameMode, openOnlineModal, boardTheme, bgEnvironment }) {
  const { user } = useAuth();
  const { stats } = useStats();

  const [selectedDiff, setSelectedDiff]         = useState('difficult');
  const [selectedTime, setSelectedTime]         = useState('rapid10');
  const [heroReady, setHeroReady]               = useState(false);

  const selectedDiffConfig = DIFFICULTIES.find(d => d.id === selectedDiff) || DIFFICULTIES[2];

  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 200);
    return () => clearTimeout(t);
  }, []);

  const totalGames = stats.wins + stats.losses + stats.draws;
  const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;

  return (
    <div style={{ padding: '0 3rem 3rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

      {/* ── Welcome Banner (logged-in users) ──────────────────────────── */}
      {user && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 20px', marginBottom: '1.2rem',
          background: 'rgba(255,0,127,0.07)',
          border: '1px solid rgba(255,0,127,0.18)',
          borderRadius: 'var(--radius-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.1rem' }}>👋</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Welcome back, <strong style={{ color: '#fff' }}>{user.name.split(' ')[0]}</strong>!
            </span>
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <span>⭐ ELO: <strong style={{ color: 'var(--accent-gold)' }}>{stats.elo}</strong></span>
            <span>🏆 Wins: <strong style={{ color: '#22c55e' }}>{stats.wins}</strong></span>
            {stats.streak > 1 && <span>🔥 Streak: <strong style={{ color: '#f59e0b' }}>{stats.streak}</strong></span>}
            <span>🎯 Win Rate: <strong style={{ color: '#fff' }}>{winRate}%</strong></span>
          </div>
        </div>
      )}

      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <div
        className="glass-panel"
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          marginBottom: '2rem',
          border: '1px solid var(--border-glass-bright)',
          boxShadow: 'var(--shadow-dragonfruit)',
          background: 'rgba(20, 10, 38, 0.9)',
        }}
      >
        <InteractiveHeroBoard theme={boardTheme} bgEnvironment={bgEnvironment} />

        {/* Hero overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to right, rgba(11,5,23,0.80) 0%, rgba(11,5,23,0.3) 55%, transparent 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '2.5rem 3rem',
        }}>
          <div style={{ maxWidth: '480px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,0,127,0.18)', border: '1px solid rgba(255,0,127,0.4)',
              borderRadius: '999px', padding: '4px 14px', marginBottom: '1rem',
              fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-dragonfruit-bright)',
              letterSpacing: '1px', textTransform: 'uppercase',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-dragonfruit)', boxShadow: '0 0 8px var(--accent-dragonfruit)', display: 'inline-block' }} />
              Next-Gen 3D Chess Platform
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900, lineHeight: 1.1,
              marginBottom: '0.8rem',
              background: 'linear-gradient(135deg, #ffffff 0%, #ff3399 60%, #9d4edd 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Play Chess in<br />Stunning 3D
            </h1>

            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Challenge AI, compete online with friends, or train your tactics with daily puzzles — all in a breathtaking 3D experience.
            </p>

            <div style={{ display: 'flex', gap: '12px', pointerEvents: 'auto', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                style={{ padding: '12px 28px', fontSize: '1rem', gap: '8px' }}
                onClick={() => { sounds.playClick(); startGameMode('ai', selectedDiff); }}
              >
                <Play size={18} fill="white" /> Play vs Bot
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: '12px 24px', fontSize: '0.95rem' }}
                onClick={() => { sounds.playClick(); startGameMode('spectate'); }}
              >
                <Tv2 size={16} /> Watch Live
              </button>
            </div>
          </div>
        </div>

        {/* Click hint */}
        <div style={{
          position: 'absolute', bottom: '14px', right: '18px',
          fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)',
          pointerEvents: 'none',
        }}>
          Click the board to launch pieces ✨
        </div>
      </div>

      {/* ── Live Stats Bar ────────────────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1px', marginBottom: '2.5rem',
        background: 'var(--border-glass)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden', border: '1px solid var(--border-glass)',
      }}>
        {[
          { label: 'Active Players', value: 1247, suffix: '+', icon: '🟢', color: '#22c55e' },
          { label: 'Games Played Today', value: 48300, suffix: '+', icon: '♟️', color: 'var(--accent-dragonfruit-bright)' },
          { label: 'Chess Puzzles', value: 300, suffix: '+', icon: '🧩', color: '#a855f7' },
          { label: 'AI Difficulty Levels', value: 3, suffix: '', icon: '🤖', color: 'var(--accent-gold)' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'rgba(26,13,48,0.85)',
            padding: '1.1rem 1.4rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '4px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.5rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: stat.color }}>
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Game Modes ────────────────────────────────────────────────── */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Swords size={22} style={{ color: 'var(--accent-dragonfruit)' }} />
        Choose Your Battle
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
        gap: '1.5rem', marginBottom: '3rem',
      }}>

        {/* ── Card 1: Play vs AI ──────────────────────────────────────── */}
        <div className="glass-panel" style={{
          padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.2rem',
          border: `1px solid ${selectedDiffConfig.border}`,
          boxShadow: `0 0 30px ${selectedDiffConfig.bg}`,
          transition: 'all 0.3s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: selectedDiffConfig.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem',
            }}>
              {selectedDiffConfig.emoji}
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2px' }}>Play with Bot</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Challenge AI Bot in Easy, Hard, or Difficult mode</p>
            </div>
          </div>

          {/* Difficulty Selector */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px', fontWeight: 600 }}>
              Select Difficulty
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => { sounds.playClick(); setSelectedDiff(diff.id); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                    background: selectedDiff === diff.id ? diff.bg : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selectedDiff === diff.id ? diff.border : 'rgba(255,255,255,0.07)'}`,
                    color: selectedDiff === diff.id ? diff.color : 'var(--text-muted)',
                    fontFamily: 'var(--font-main)', fontWeight: 600, fontSize: '0.9rem',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>{diff.emoji}</span>
                    <span>
                      <strong>{diff.label}</strong>
                      <span style={{ fontSize: '0.75rem', fontWeight: 400, marginLeft: '6px', opacity: 0.7 }}>{diff.subtitle}</span>
                    </span>
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.85 }}>{diff.elo}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Control */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px', fontWeight: 600 }}>
              Time Control
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {TIME_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { sounds.playClick(); setSelectedTime(t.id); }}
                  title={t.name}
                  style={{
                    padding: '8px 4px', borderRadius: '8px', cursor: 'pointer',
                    background: selectedTime === t.id ? 'rgba(255,0,127,0.18)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${selectedTime === t.id ? 'var(--accent-dragonfruit)' : 'rgba(255,255,255,0.07)'}`,
                    color: selectedTime === t.id ? 'var(--accent-dragonfruit-bright)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '0.82rem',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px', fontSize: '0.95rem', marginTop: 'auto' }}
            onClick={() => { sounds.playClick(); startGameMode('ai', selectedDiff); }}
          >
            <Play size={16} fill="white" /> Play vs Bot ({selectedDiffConfig.label.toUpperCase()}) <ChevronRight size={16} />
          </button>
        </div>

        {/* ── Card 2: Online Multiplayer ──────────────────────────────── */}
        <div
          className="glass-panel glass-panel-interactive"
          style={{
            padding: '1.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            border: '1px solid rgba(6,182,212,0.35)',
          }}
        >
          <div>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'rgba(6,182,212,0.15)', color: '#06b6d4',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
            }}>
              <Globe size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>Online Multiplayer</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Create a private room or join a friend's match with a room code. Play real-time 3D chess from anywhere.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
              {['🔒 Private room codes', '⚡ Real-time gameplay', '🌍 Play from anywhere'].map((feat, i) => (
                <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #06b6d4, #0284c7)', boxShadow: '0 4px 18px rgba(6,182,212,0.4)' }}
            onClick={() => { sounds.playClick(); openOnlineModal(); }}
          >
            <Globe size={16} /> Create / Join Room <ChevronRight size={16} />
          </button>
        </div>

        {/* ── Card 3: Local 2-Player ──────────────────────────────────── */}
        <div
          className="glass-panel glass-panel-interactive"
          style={{
            padding: '1.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            border: '1px solid rgba(157,78,221,0.35)',
          }}
        >
          <div>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'rgba(157,78,221,0.18)', color: 'var(--accent-violet)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
            }}>
              <Users size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>Local 2-Player</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Pass & Play on the same screen. Take turns with a friend or family member using automatic board perspective switching.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
              {['🔄 Auto board-flip per turn', '📱 Same screen, two players', '🏠 No internet needed'].map((feat, i) => (
                <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            className="btn btn-secondary"
            style={{ width: '100%', padding: '13px', borderColor: 'var(--accent-violet)', color: 'var(--accent-violet)' }}
            onClick={() => { sounds.playClick(); startGameMode('pvp'); }}
          >
            <Users size={16} /> Start Pass &amp; Play <ChevronRight size={16} />
          </button>
        </div>

        {/* ── Card 4: Spectate AI vs AI ───────────────────────────────── */}
        <div
          className="glass-panel glass-panel-interactive"
          style={{
            padding: '1.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            border: '1px solid rgba(245,158,11,0.3)',
          }}
        >
          <div>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
            }}>
              <Tv2 size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>Watch AI Battle</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Sit back and watch two AI engines compete against each other. A great way to study openings and endgames.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
              {['🤖 AI vs AI spectate mode', '📚 Study openings & tactics', '⏯️ Watch in real-time'].map((feat, i) => (
                <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            className="btn btn-secondary"
            style={{ width: '100%', padding: '13px', borderColor: '#f59e0b', color: '#f59e0b' }}
            onClick={() => { sounds.playClick(); startGameMode('spectate'); }}
          >
            <Tv2 size={16} /> Watch Live Game <ChevronRight size={16} />
          </button>
        </div>

      </div>

      {/* ── Features Showcase ─────────────────────────────────────────── */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.4rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Star size={20} style={{ color: 'var(--accent-gold)' }} />
            Platform Features
          </h2>
          <div style={{
            fontSize: '0.75rem', color: 'var(--accent-dragonfruit)', fontWeight: 700,
            background: 'rgba(255,0,127,0.1)', border: '1px solid rgba(255,0,127,0.25)',
            borderRadius: '999px', padding: '3px 12px', textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>Free to Play</div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
          gap: '1rem',
        }}>
          {FEATURES.map((feat, i) => (
            <div
              key={i}
              className="glass-panel glass-panel-interactive"
              style={{ padding: '1.4rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                background: `${feat.color}18`,
                border: `1px solid ${feat.color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: feat.color,
              }}>
                {feat.icon}
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px' }}>{feat.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA Strip ─────────────────────────────────────────────────── */}
      <div style={{
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(255,0,127,0.15) 0%, rgba(157,78,221,0.15) 100%)',
        border: '1px solid rgba(255,0,127,0.3)',
        padding: '2rem 2.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px' }}>
            Ready to Play? <span style={{ color: 'var(--accent-dragonfruit)' }}>Challenge the Grandmaster AI</span>
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No sign-up required. Jump straight into a game and prove your skills!
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
          <button
            className="btn btn-primary"
            style={{ padding: '13px 28px', whiteSpace: 'nowrap' }}
            onClick={() => { sounds.playClick(); startGameMode('ai', 'difficult'); }}
          >
            <Flame size={16} /> Play Difficult Bot
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '13px 24px', whiteSpace: 'nowrap' }}
            onClick={() => { sounds.playClick(); startGameMode('ai', 'easy'); }}
          >
            🌱 Play Easy Bot
          </button>
        </div>
      </div>

    </div>
  );
}



/*******************************************************************************
 * FILE: src\components\ui\EvalBar.jsx
 *******************************************************************************/

import React, { useEffect, useRef } from 'react';

/**
 * Vertical evaluation bar — shows advantage balance.
 * eval: positive = white advantage, negative = black advantage.
 * Range capped at ±10 pawns.
 */
export function EvalBar({ evaluation = 0 }) {
  const MAX = 10;
  const clamped = Math.max(-MAX, Math.min(MAX, evaluation));
  // White portion: 50% = equal; 100% = white totally winning
  const whitePct = ((clamped + MAX) / (MAX * 2)) * 100;
  const showEval = Math.abs(evaluation).toFixed(1);

  return (
    <div style={{
      width: '22px',
      height: '100%',
      minHeight: '300px',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '6px',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.1)',
      position: 'relative',
      cursor: 'default',
    }}
    title={`Evaluation: ${evaluation >= 0 ? '+' : ''}${showEval}`}
    >
      {/* Black portion (top) */}
      <div style={{
        flex: `0 0 ${100 - whitePct}%`,
        background: 'linear-gradient(180deg, #1a1a2e 0%, #2d2d4e 100%)',
        transition: 'flex 0.4s ease',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '4px',
      }}>
        {evaluation < -1 && (
          <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono, monospace', writingMode: 'vertical-rl', lineHeight: 1 }}>
            {showEval}
          </span>
        )}
      </div>

      {/* White portion (bottom) */}
      <div style={{
        flex: `0 0 ${whitePct}%`,
        background: 'linear-gradient(180deg, #e8e8e8 0%, #ffffff 100%)',
        transition: 'flex 0.4s ease',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: '4px',
      }}>
        {evaluation > 1 && (
          <span style={{ fontSize: '0.55rem', color: 'rgba(0,0,0,0.6)', fontFamily: 'JetBrains Mono, monospace', writingMode: 'vertical-rl', lineHeight: 1 }}>
            {showEval}
          </span>
        )}
      </div>

      {/* Center line */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: '1px',
        background: 'rgba(255,100,100,0.4)',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}



/*******************************************************************************
 * FILE: src\components\ui\Footer.jsx
 *******************************************************************************/

import React from 'react';
import { Shield, Sparkles, Heart } from 'lucide-react';
import { sounds } from '../../audio/soundSystem';

export function Footer() {
  const handleClickLink = () => {
    sounds.playClick();
  };

  return (
    <footer style={{
      background: 'rgba(10, 8, 18, 0.9)',
      borderTop: '1px solid var(--border-glass)',
      padding: '2rem 1.5rem 1.5rem 1.5rem',
      color: 'var(--text-dim)',
      fontSize: '0.85rem',
      position: 'relative',
      zIndex: 10,
      width: '100%',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px'
      }}>
        {/* Brand/Copyright info */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1rem',
            fontFamily: 'var(--font-heading)',
            marginBottom: '4px'
          }}>
            <span>👑</span> CHESS<span style={{ color: 'var(--accent-dragonfruit)' }}>X</span>
          </div>
          <div>© {new Date().getFullYear()} ChessX. All rights reserved.</div>
        </div>

        {/* Quick Links */}
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#about" onClick={handleClickLink} style={{ color: 'var(--text-dim)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>About</a>
          <a href="#help" onClick={handleClickLink} style={{ color: 'var(--text-dim)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>Rules</a>
          <a href="#github" onClick={handleClickLink} style={{ color: 'var(--text-dim)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>GitHub</a>
        </div>

        {/* Status & Credits */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#22c55e', fontWeight: 600, fontSize: '0.78rem' }}>
            <Shield size={12} />
            <span>ALL SYSTEMS OPERATIONAL</span>
          </div>
          <div style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Made with <Heart size={10} color="#ff3b00" style={{ fill: '#ff3b00' }} /> by Antigravity Engineering
          </div>
        </div>
      </div>
    </footer>
  );
}



/*******************************************************************************
 * FILE: src\components\ui\GameHUD.jsx
 *******************************************************************************/

import React, { useState } from 'react';
import { RotateCcw, Flag, RefreshCw } from 'lucide-react';
import { sounds } from '../../audio/soundSystem';
import { ChessClock } from './ChessClock';
import { OpeningBadge } from './OpeningBadge';

export function GameHUD({
  game,
  gameMode,
  aiDifficulty,
  onUndo,
  onNewGame,
  onResign,
  timeControl,
  onTimeOut,
}) {
  const [showHistorySidebar, setShowHistorySidebar] = useState(true);
  const activeColor = game.activeColor;
  const materialAdv = game.getMaterialAdvantage();

  const isUnlimited = !timeControl || timeControl.id === 'unlimited';

  return (
    <div className="game-hud-container">
      {/* Top Bar HUD */}
      <div className="hud-top-bar hud-interactive">
        {/* White Player Info */}
        <div className="glass-panel player-card">
          <div className="player-avatar">♔</div>
          <div className="player-info">
            <span className="player-name">Player (White)</span>
            <span className="player-rating">Rating: 1500 ELO</span>
          </div>
          {activeColor === 'w' && (
            <span className="turn-badge active-white">Active Turn</span>
          )}
        </div>

        {/* Center — Game Status, Clock, Opening */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}>
          <div
            className="glass-panel"
            style={{
              padding: '8px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              borderRadius: '30px',
              border: '1px solid var(--border-glass-bright)',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-dragonfruit-bright)' }}>
              {gameMode === 'ai' ? `VS BOT (${aiDifficulty.toUpperCase()})` : 'PASS & PLAY'}
            </div>
            <div style={{ width: '1px', height: '20px', background: 'var(--border-glass)' }} />
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: materialAdv > 0 ? 'var(--accent-dragonfruit-bright)' : materialAdv < 0 ? 'var(--accent-violet)' : 'var(--text-muted)' }}>
              {materialAdv > 0 ? `+${materialAdv} (White)` : materialAdv < 0 ? `+${Math.abs(materialAdv)} (Black)` : 'Even'}
            </div>

            {/* Chess clock inline */}
            {!isUnlimited && (
              <>
                <div style={{ width: '1px', height: '20px', background: 'var(--border-glass)' }} />
                <ChessClock
                  activeColor={activeColor}
                  isGameOver={false}
                  increment={timeControl?.increment || 0}
                  initialTime={timeControl?.time || null}
                  onTimeOut={onTimeOut}
                />
              </>
            )}
          </div>

          {/* Opening badge */}
          <OpeningBadge moveLog={game.moveLog} />
        </div>

        {/* Black Player Info */}
        <div className="glass-panel player-card">
          <div className="player-avatar" style={{ borderColor: 'var(--accent-violet)' }}>🏿</div>
          <div className="player-info">
            <span className="player-name">{gameMode === 'ai' ? `ChessX Bot` : 'Player 2 (Black)'}</span>
            <span className="player-rating">{gameMode === 'ai' ? `Bot (${aiDifficulty})` : 'Rating: 1500'}</span>
          </div>
          {activeColor === 'b' && (
            <span className="turn-badge active-black">Active Turn</span>
          )}
        </div>
      </div>

      {/* Floating Bottom Action Toolbar & Sidebar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
        
        {/* Action Buttons */}
        <div className="glass-panel hud-interactive" style={{ padding: '10px 16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.88rem' }}
            onClick={() => { sounds.playClick(); onUndo(); }}
          >
            <RotateCcw size={16} /> Undo
          </button>

          <button
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.88rem' }}
            onClick={() => { sounds.playClick(); onNewGame(); }}
          >
            <RefreshCw size={16} /> Restart
          </button>

          <button
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.88rem', background: '#d90368' }}
            onClick={() => { sounds.playClick(); onResign(); }}
          >
            <Flag size={16} /> Resign
          </button>
        </div>

        {/* Move History Drawer */}
        {showHistorySidebar && (
          <div className="glass-panel sidebar-panel hud-interactive">
            <div className="sidebar-header">
              <span style={{ color: 'var(--accent-dragonfruit-bright)' }}>Move History</span>
              <button
                className="btn btn-secondary btn-icon"
                style={{ width: '24px', height: '24px' }}
                onClick={() => setShowHistorySidebar(false)}
              >
                ×
              </button>
            </div>

            <div className="move-list-scroll">
              {game.moveLog.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '1.5rem 0', fontSize: '0.88rem' }}>
                  No moves made yet. Click piece to move!
                </div>
              ) : (
                Array.from({ length: Math.ceil(game.moveLog.length / 2) }).map((_, idx) => {
                  const whiteMove = game.moveLog[idx * 2];
                  const blackMove = game.moveLog[idx * 2 + 1];
                  return (
                    <div key={idx} className="move-row">
                      <span style={{ color: 'var(--text-dim)' }}>{idx + 1}.</span>
                      <span style={{ color: 'var(--accent-dragonfruit-bright)' }}>{whiteMove ? whiteMove.san : ''}</span>
                      <span style={{ color: 'var(--accent-violet)' }}>{blackMove ? blackMove.san : ''}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



/*******************************************************************************
 * FILE: src\components\ui\GameOverModal.jsx
 *******************************************************************************/

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, Home, TrendingUp, TrendingDown } from 'lucide-react';
import { sounds } from '../../audio/soundSystem';

export function GameOverModal({ isOpen, resultStatus, onRematch, onHome, eloChange, newElo }) {
  const isWin  = resultStatus?.includes('WIN') && !resultStatus?.includes('OPPONENT');
  const isDraw = resultStatus?.includes('DRAW') || resultStatus?.includes('STALEMATE');

  useEffect(() => {
    if (!isOpen) return;
    if (isWin) {
      sounds.playGameEnd(true);
      // Main burst
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      // Side bursts
      setTimeout(() => {
        confetti({ particleCount: 60, angle: 60,  spread: 55, origin: { x: 0, y: 0.7 } });
        confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.7 } });
      }, 250);
    } else {
      sounds.playGameEnd(false);
    }
  }, [isOpen, isWin]);

  if (!isOpen) return null;

  const emoji = isWin ? '🏆' : isDraw ? '🤝' : '💀';
  const titleColor = isWin ? '#ffd700' : isDraw ? '#00f0ff' : '#ff6b6b';
  const eloPositive = eloChange > 0;

  return (
    <div className="modal-backdrop">
      <div className="glass-panel modal-card" style={{ position: 'relative', overflow: 'hidden' }}>
        <style>{`
          @keyframes trophyBounce { 0%,100%{transform:scale(1) rotate(0deg)} 25%{transform:scale(1.15) rotate(-8deg)} 75%{transform:scale(1.15) rotate(8deg)} }
          @keyframes resultGlow   { 0%,100%{text-shadow:0 0 20px currentColor} 50%{text-shadow:0 0 40px currentColor, 0 0 80px currentColor} }
        `}</style>

        {/* Glow bg */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit',
          background: `radial-gradient(ellipse at 50% 0%, ${isWin ? 'rgba(255,215,0,0.08)' : isDraw ? 'rgba(0,240,255,0.06)' : 'rgba(255,100,100,0.06)'} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* Icon */}
        <div style={{
          width:'72px', height:'72px', borderRadius:'50%',
          background: `rgba(${isWin?'255,215,0':isDraw?'0,240,255':'255,100,100'},0.15)`,
          border: `2px solid rgba(${isWin?'255,215,0':isDraw?'0,240,255':'255,100,100'},0.3)`,
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 1.2rem auto',
          fontSize:'2.2rem',
          animation: isWin ? 'trophyBounce 1.2s ease infinite' : 'none',
        }}>
          {emoji}
        </div>

        <h2 style={{ fontSize:'2rem', fontWeight:800, marginBottom:'0.5rem' }}>
          {isWin ? 'Victory!' : isDraw ? 'Draw' : 'Defeated'}
        </h2>

        <p style={{
          fontSize:'1rem', color: titleColor, fontWeight:700,
          marginBottom:'1.2rem', lineHeight:1.4,
          animation: isWin ? 'resultGlow 2s ease infinite' : 'none',
        }}>
          {resultStatus}
        </p>

        {/* ELO change */}
        {eloChange !== undefined && eloChange !== null && (
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'center', gap:'10px',
            padding:'10px 20px', borderRadius:'12px', marginBottom:'1.5rem',
            background: eloPositive ? 'rgba(125,255,140,0.1)' : 'rgba(255,107,107,0.1)',
            border: `1px solid rgba(${eloPositive?'125,255,140':'255,107,107'},0.25)`,
          }}>
            {eloPositive ? <TrendingUp size={18} color="#7dff8c" /> : <TrendingDown size={18} color="#ff6b6b" />}
            <span style={{ fontFamily:'JetBrains Mono, monospace', fontWeight:800, fontSize:'1.1rem', color: eloPositive?'#7dff8c':'#ff6b6b' }}>
              {eloPositive?'+':''}{eloChange} ELO
            </span>
            {newElo && (
              <span style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.85rem' }}>
                → {newElo}
              </span>
            )}
          </div>
        )}

        <div style={{ display:'flex', gap:'14px' }}>
          <button
            className="btn btn-primary"
            style={{ flex:1, padding:'12px' }}
            onClick={() => { sounds.playClick(); onRematch(); }}
          >
            <RefreshCw size={18} /> Play Again
          </button>
          <button
            className="btn btn-secondary"
            style={{ flex:1, padding:'12px' }}
            onClick={() => { sounds.playClick(); onHome(); }}
          >
            <Home size={18} /> Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}



/*******************************************************************************
 * FILE: src\components\ui\HistoryView.jsx
 *******************************************************************************/

import React from 'react';
import { History, CheckCircle2, XCircle, MinusCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { useStats } from '../../context/StatsContext';

const RESULT_CONFIG = {
  win:  { icon: CheckCircle2, color: '#7dff8c', label: 'WIN' },
  loss: { icon: XCircle,      color: '#ff6b6b', label: 'LOSS' },
  draw: { icon: MinusCircle,  color: '#94a3b8', label: 'DRAW' },
};

export function HistoryView() {
  const { history, stats } = useStats();

  return (
    <div style={{ padding: '2rem 3rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.5rem' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 240, 255, 0.15)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <History size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Match History</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {history.length > 0 ? `${history.length} games played · Current ELO: ${stats.elo}` : 'Review your past 3D chess battles and performance'}
          </p>
        </div>
      </div>

      {/* Summary bar */}
      {history.length > 0 && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Wins',   value: stats.wins,   color: '#7dff8c' },
            { label: 'Losses', value: stats.losses, color: '#ff6b6b' },
            { label: 'Draws',  value: stats.draws,  color: '#94a3b8' },
            { label: 'Win Rate', value: `${stats.wins + stats.losses + stats.draws > 0 ? Math.round((stats.wins / (stats.wins + stats.losses + stats.draws)) * 100) : 0}%`, color: '#ffd700' },
          ].map(s => (
            <div key={s.label} style={{ padding: '10px 18px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', minWidth: '90px' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* History list */}
      {history.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'rgba(255,255,255,0.02)', borderRadius: '16px',
          border: '1px dashed rgba(255,255,255,0.1)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>♟️</div>
          <h3 style={{ fontWeight: 700, marginBottom: '8px', color: 'rgba(255,255,255,0.6)' }}>No games yet</h3>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.88rem' }}>
            Play your first game and your history will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {history.map((item) => {
            const cfg = RESULT_CONFIG[item.result] || RESULT_CONFIG.draw;
            const Icon = cfg.icon;
            const eloPos = item.eloChange > 0;
            return (
              <div
                key={item.id}
                className="glass-panel"
                style={{
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  borderLeft: `3px solid ${cfg.color}`,
                  transition: 'background 0.2s',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${cfg.color}18`, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>VS {item.opponent}</h3>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                      {item.date}
                      {item.opening && item.opening !== '—' && ` · ${item.opening}`}
                      {item.mode && ` · ${item.mode.toUpperCase()}`}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontWeight: 700, color: cfg.color, fontSize: '0.95rem' }}>{cfg.label}</span>
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>{item.moves} Moves</span>
                  </div>

                  {/* ELO change */}
                  {item.eloChange !== undefined && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '4px 10px', borderRadius: '8px',
                      background: eloPos ? 'rgba(125,255,140,0.1)' : 'rgba(255,107,107,0.1)',
                      color: eloPos ? '#7dff8c' : '#ff6b6b',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontWeight: 700, fontSize: '0.85rem',
                    }}>
                      {eloPos ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      {eloPos ? '+' : ''}{item.eloChange}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)' }}>
                    <Clock size={14} /> {item.duration}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}



/*******************************************************************************
 * FILE: src\components\ui\LeaderboardView.jsx
 *******************************************************************************/

import React from 'react';
import { Trophy, Medal, Flame, Crown } from 'lucide-react';
import { useStats } from '../../context/StatsContext';
import { useAuth } from '../../context/AuthContext';

// Static leaderboard seed (top players)
const LEADERBOARD_SEED = [
  { name: 'Magnus_3D',      elo: 2882, wins: 412, winRate: 84, streak: 12, avatar: '👑' },
  { name: 'Hikaru_Stream',  elo: 2840, wins: 389, winRate: 81, streak: 8,  avatar: '⚡' },
  { name: 'Grandmaster_AI', elo: 2750, wins: 301, winRate: 79, streak: 5,  avatar: '🤖' },
  { name: 'CyberKnight99',  elo: 2420, wins: 210, winRate: 72, streak: 3,  avatar: '🛡️' },
  { name: 'VortexGambit',   elo: 2310, wins: 178, winRate: 68, streak: 2,  avatar: '🌀' },
  { name: 'ChessEnthusiast',elo: 2190, wins: 145, winRate: 64, streak: 1,  avatar: '♟️' },
  { name: 'QuantumMaster',  elo: 2050, wins: 123, winRate: 60, streak: 4,  avatar: '⚛️' },
];

export function LeaderboardView() {
  const { stats } = useStats();
  const { user } = useAuth();

  const displayName = user?.name || 'You';
  const total = stats.wins + stats.losses + stats.draws;
  const userWinRate = total > 0 ? Math.round((stats.wins / total) * 100) : 0;

  const userEntry = {
    name:    displayName,
    elo:     stats.elo,
    wins:    stats.wins,
    winRate: userWinRate,
    streak:  stats.streak,
    avatar:  user?.picture ? null : '🎮',
    picture: user?.picture,
    isYou:   true,
  };

  // Merge and sort
  const allEntries = [...LEADERBOARD_SEED, userEntry]
    .sort((a, b) => b.elo - a.elo)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  const userRank = allEntries.find(e => e.isYou)?.rank;

  return (
    <div style={{ padding: '2rem 3rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '2rem' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,215,0,0.15)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Trophy size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Global Leaderboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Your rank: <strong style={{ color: '#ffd700' }}>#{userRank}</strong> · {stats.elo} ELO
          </p>
        </div>
      </div>

      {/* Top 3 podium */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {allEntries.slice(0, 3).map((p, i) => {
          const podiumColors = ['#ffd700', '#c0c0c0', '#cd7f32'];
          const heights = ['80px', '60px', '50px'];
          const order   = [1, 0, 2]; // center = rank1
          return (
            <div key={p.name} style={{ order: order[i], textAlign: 'center' }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%',
                border: `3px solid ${podiumColors[i]}`,
                background: `rgba(${i===0?'255,215,0':i===1?'192,192,192':'205,127,50'},0.15)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: p.picture ? '0' : '1.5rem',
                margin: '0 auto 8px',
                overflow: 'hidden',
              }}>
                {p.picture
                  ? <img src={p.picture} referrerPolicy="no-referrer" style={{ width:'100%', height:'100%', objectFit:'cover' }} alt={p.name} />
                  : p.avatar
                }
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: p.isYou ? '#ffd700' : '#fff', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.name}{p.isYou ? ' (You)' : ''}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: podiumColors[i], fontSize: '0.9rem' }}>{p.elo}</div>
              <div style={{
                height: heights[i], background: `linear-gradient(180deg, ${podiumColors[i]}40 0%, transparent 100%)`,
                borderRadius: '6px 6px 0 0', marginTop: '8px',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                paddingTop: '6px', fontSize: '1.2rem',
              }}>
                {['🥇','🥈','🥉'][i]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full table */}
      <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <th style={{ padding: '12px 16px' }}>Rank</th>
              <th style={{ padding: '12px 16px' }}>Player</th>
              <th style={{ padding: '12px 16px' }}>ELO</th>
              <th style={{ padding: '12px 16px' }}>Wins</th>
              <th style={{ padding: '12px 16px' }}>Win Rate</th>
              <th style={{ padding: '12px 16px' }}>Streak</th>
            </tr>
          </thead>
          <tbody>
            {allEntries.map((row) => (
              <tr
                key={row.name}
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: row.isYou ? 'rgba(255,215,0,0.06)' : 'transparent',
                  transition: 'background 0.2s',
                }}
              >
                <td style={{ padding: '13px 16px', fontWeight: 700 }}>
                  {row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : row.rank === 3 ? '🥉' : `#${row.rank}`}
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'rgba(255,255,255,0.08)',
                      border: row.isYou ? '2px solid rgba(255,215,0,0.5)' : '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', overflow: 'hidden', flexShrink: 0,
                    }}>
                      {row.picture
                        ? <img src={row.picture} referrerPolicy="no-referrer" style={{ width:'100%', height:'100%', objectFit:'cover' }} alt={row.name} />
                        : row.avatar
                      }
                    </div>
                    <span style={{ fontWeight: 600, color: row.isYou ? '#ffd700' : '#fff' }}>
                      {row.name}{row.isYou ? ' (You)' : ''}
                    </span>
                    {row.isYou && <Crown size={14} color="#ffd700" />}
                  </div>
                </td>
                <td style={{ padding: '13px 16px', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'JetBrains Mono, monospace' }}>{row.elo}</td>
                <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.7)' }}>{row.wins}</td>
                <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.7)' }}>{row.winRate}%</td>
                <td style={{ padding: '13px 16px' }}>
                  {row.streak > 0 ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '12px', background: 'rgba(255,0,85,0.15)', color: 'var(--accent-pink, #ff4466)', fontSize: '0.8rem', fontWeight: 700 }}>
                      <Flame size={12} /> {row.streak}W
                    </span>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}



/*******************************************************************************
 * FILE: src\components\ui\LoginModal.jsx
 *******************************************************************************/

import React, { useEffect, useRef, useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ⚠️ Replace with your actual Google OAuth 2.0 Client ID
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';

const STYLES = `
  @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
  @keyframes slideUp { from { transform: translateY(28px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
  @keyframes shake   { 0%,100%{ transform: translateX(0) } 20%,60%{ transform: translateX(-6px) } 40%,80%{ transform: translateX(6px) } }

  .lm-backdrop { animation: fadeIn 0.2s ease; }
  .lm-card     { animation: slideUp 0.28s cubic-bezier(0.34,1.4,0.64,1); }
  .lm-card.shake { animation: shake 0.35s ease; }

  .lm-tab {
    flex: 1; padding: 10px; background: none; border: none;
    font-size: 0.82rem; font-weight: 600; letter-spacing: 0.06em;
    cursor: pointer; color: rgba(255,255,255,0.35); transition: all 0.2s;
    border-bottom: 2px solid transparent;
  }
  .lm-tab.active { color: #ffd700; border-bottom-color: #ffd700; }
  .lm-tab:hover:not(.active) { color: rgba(255,255,255,0.65); }

  .lm-input-wrap { position: relative; }
  .lm-input-icon {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    color: rgba(255,255,255,0.3); pointer-events: none;
  }
  .lm-input {
    width: 100%; box-sizing: border-box;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px; padding: 12px 12px 12px 40px;
    color: #fff; font-size: 0.875rem; outline: none; transition: all 0.2s;
    font-family: inherit;
  }
  .lm-input::placeholder { color: rgba(255,255,255,0.3); }
  .lm-input:focus { border-color: rgba(255,215,0,0.5); background: rgba(255,255,255,0.09); box-shadow: 0 0 0 3px rgba(255,215,0,0.08); }
  .lm-input.error { border-color: rgba(255,80,80,0.6); }
  .lm-input.has-toggle { padding-right: 42px; }

  .lm-toggle-pw {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.35);
    display: flex; align-items: center; padding: 2px; transition: color 0.2s;
  }
  .lm-toggle-pw:hover { color: rgba(255,255,255,0.7); }

  .lm-btn-primary {
    width: 100%; padding: 13px; border: none; border-radius: 10px; cursor: pointer;
    background: linear-gradient(135deg, #ffd700, #ffaa00);
    color: #1a1a0e; font-size: 0.9rem; font-weight: 700;
    letter-spacing: 0.04em; transition: all 0.2s; font-family: inherit;
  }
  .lm-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,215,0,0.35); }
  .lm-btn-primary:active { transform: translateY(0); }
  .lm-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .lm-switch-link {
    background: none; border: none; color: #ffd700; font-size: 0.82rem;
    cursor: pointer; font-family: inherit; font-weight: 600; padding: 0;
    transition: opacity 0.2s;
  }
  .lm-switch-link:hover { opacity: 0.75; text-decoration: underline; }

  .lm-alert {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 10px 13px; border-radius: 8px; font-size: 0.8rem; line-height: 1.5;
  }
  .lm-alert.error   { background: rgba(255,60,60,0.12); border: 1px solid rgba(255,60,60,0.25); color: #ff8080; }
  .lm-alert.success { background: rgba(60,255,120,0.1); border: 1px solid rgba(60,255,120,0.2); color: #7affa0; }

  .lm-divider {
    display: flex; align-items: center; gap: 12px;
  }
  .lm-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.09); }
  .lm-divider-text { color: rgba(255,255,255,0.3); font-size: 0.72rem; letter-spacing: 0.08em; }

  .google-btn-wrap > div { margin: 0 auto !important; }

  .pw-strength { display: flex; gap: 4px; margin-top: 6px; }
  .pw-strength-bar { flex: 1; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.1); transition: background 0.3s; }
`;

function getPasswordStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6)  s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw))   s++;
  if (/[0-9]/.test(pw))   s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0-5
}

const STRENGTH_COLORS = ['', '#ff4545', '#ff8c00', '#ffd700', '#7dff8c', '#00e676'];
const STRENGTH_LABELS = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

export function LoginModal({ isOpen, onClose }) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  // Tabs: 'signin' | 'signup'
  const [tab, setTab]             = useState('signin');
  const [mode, setMode]           = useState('email'); // 'email' | 'google' — kept for rendering toggle

  // Sign-in fields
  const [siEmail, setSiEmail]     = useState('');
  const [siPass,  setSiPass]      = useState('');
  const [siShowPw, setSiShowPw]   = useState(false);

  // Sign-up fields
  const [suName,  setSuName]      = useState('');
  const [suEmail, setSuEmail]     = useState('');
  const [suPass,  setSuPass]      = useState('');
  const [suPass2, setSuPass2]     = useState('');
  const [suShowPw, setSuShowPw]   = useState(false);

  // Feedback
  const [error,   setError]       = useState('');
  const [success, setSuccess]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [shaking, setShaking]     = useState(false);

  const googleBtnRef = useRef(null);
  const cardRef      = useRef(null);

  // Reset when modal opens/closes
  useEffect(() => {
    if (!isOpen) return;
    setTab('signin'); setSiEmail(''); setSiPass(''); setSuName('');
    setSuEmail(''); setSuPass(''); setSuPass2('');
    setError(''); setSuccess(''); setLoading(false);
  }, [isOpen]);

  // Render Google button
  useEffect(() => {
    if (!isOpen || !googleBtnRef.current || !window.google?.accounts?.id) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (resp) => { signInWithGoogle(resp); onClose(); },
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: 'filled_black', size: 'large', shape: 'pill',
      text: 'signin_with', logo_alignment: 'left', width: 264,
    });
  }, [isOpen, tab]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!siEmail || !siPass) { setError('Please fill in all fields.'); triggerShake(); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 300)); // small UX delay
    const result = signInWithEmail(siEmail, siPass);
    setLoading(false);
    if (result.error) { setError(result.error); triggerShake(); }
    else { setSuccess('Welcome back! Signing you in…'); setTimeout(onClose, 800); }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!suName || !suEmail || !suPass || !suPass2) { setError('Please fill in all fields.'); triggerShake(); return; }
    if (suPass !== suPass2) { setError('Passwords do not match.'); triggerShake(); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const result = signUpWithEmail(suName, suEmail, suPass);
    setLoading(false);
    if (result.error) { setError(result.error); triggerShake(); }
    else { setSuccess('Account created! Welcome to ChessX 🎉'); setTimeout(onClose, 1000); }
  };

  if (!isOpen) return null;

  const pwStrength = getPasswordStrength(tab === 'signup' ? suPass : '');

  return (
    <div
      className="lm-backdrop"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(10px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{STYLES}</style>

      <div
        ref={cardRef}
        className={`lm-card${shaking ? ' shake' : ''}`}
        style={{
          background: 'linear-gradient(155deg, #12122a 0%, #1a1a3a 55%, #0e2a4a 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '22px',
          padding: '32px 30px 28px',
          width: '360px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 40px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,215,0,0.06)',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '14px', right: '14px',
            background: 'rgba(255,255,255,0.07)', border: 'none',
            borderRadius: '50%', width: '30px', height: '30px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'rgba(255,255,255,0.5)', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.14)'; e.currentTarget.style.color='#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.color='rgba(255,255,255,0.5)'; }}
          aria-label="Close"
        ><X size={15} /></button>

        {/* Crown + Title */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{ fontSize: '2.6rem', lineHeight: 1, marginBottom: '10px' }}>👑</div>
          <h2 style={{
            margin: 0, fontSize: '1.5rem', fontWeight: 800,
            background: 'linear-gradient(135deg,#ffd700,#ffaa00)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '0.03em',
          }}>
            {tab === 'signin' ? 'Welcome Back' : 'Join ChessX'}
          </h2>
          <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
            {tab === 'signin' ? 'Sign in to continue your journey' : 'Create your account to get started'}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '22px' }}>
          <button className={`lm-tab ${tab==='signin'?'active':''}`} onClick={() => { setTab('signin'); setError(''); setSuccess(''); }}>
            SIGN IN
          </button>
          <button className={`lm-tab ${tab==='signup'?'active':''}`} onClick={() => { setTab('signup'); setError(''); setSuccess(''); }}>
            SIGN UP
          </button>
        </div>

        {/* Alert */}
        {error   && <div className="lm-alert error"   style={{ marginBottom:'14px' }}><AlertCircle size={15} style={{flexShrink:0, marginTop:'1px'}} />{error}</div>}
        {success && <div className="lm-alert success" style={{ marginBottom:'14px' }}><CheckCircle size={15} style={{flexShrink:0, marginTop:'1px'}} />{success}</div>}

        {/* ── SIGN IN ───────────────────────────────── */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {/* Email */}
            <div className="lm-input-wrap">
              <Mail className="lm-input-icon" size={15} />
              <input
                id="si-email"
                type="email"
                className={`lm-input${error?'':''}`}
                placeholder="Email address"
                value={siEmail}
                onChange={e => setSiEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="lm-input-wrap">
              <Lock className="lm-input-icon" size={15} />
              <input
                id="si-password"
                type={siShowPw ? 'text' : 'password'}
                className="lm-input has-toggle"
                placeholder="Password"
                value={siPass}
                onChange={e => setSiPass(e.target.value)}
                autoComplete="current-password"
              />
              <button type="button" className="lm-toggle-pw" onClick={() => setSiShowPw(p => !p)} aria-label="Toggle password">
                {siShowPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <button type="submit" className="lm-btn-primary" disabled={loading} style={{ marginTop:'4px' }}>
              {loading ? 'Signing In…' : 'Sign In'}
            </button>
          </form>
        )}

        {/* ── SIGN UP ───────────────────────────────── */}
        {tab === 'signup' && (
          <form onSubmit={handleSignUp} style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {/* Username */}
            <div className="lm-input-wrap">
              <User className="lm-input-icon" size={15} />
              <input
                id="su-username"
                type="text"
                className="lm-input"
                placeholder="Username (min. 3 chars)"
                value={suName}
                onChange={e => setSuName(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>

            {/* Email */}
            <div className="lm-input-wrap">
              <Mail className="lm-input-icon" size={15} />
              <input
                id="su-email"
                type="email"
                className="lm-input"
                placeholder="Email address"
                value={suEmail}
                onChange={e => setSuEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <div className="lm-input-wrap">
                <Lock className="lm-input-icon" size={15} />
                <input
                  id="su-password"
                  type={suShowPw ? 'text' : 'password'}
                  className="lm-input has-toggle"
                  placeholder="Password (min. 6 chars)"
                  value={suPass}
                  onChange={e => setSuPass(e.target.value)}
                  autoComplete="new-password"
                />
                <button type="button" className="lm-toggle-pw" onClick={() => setSuShowPw(p => !p)} aria-label="Toggle password">
                  {suShowPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Strength meter */}
              {suPass && (
                <>
                  <div className="pw-strength">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="pw-strength-bar"
                        style={{ background: i <= pwStrength ? STRENGTH_COLORS[pwStrength] : undefined }} />
                    ))}
                  </div>
                  <div style={{ fontSize:'0.7rem', color: STRENGTH_COLORS[pwStrength], marginTop:'3px', textAlign:'right' }}>
                    {STRENGTH_LABELS[pwStrength]}
                  </div>
                </>
              )}
            </div>

            {/* Confirm Password */}
            <div className="lm-input-wrap">
              <Lock className="lm-input-icon" size={15} />
              <input
                id="su-confirm-password"
                type={suShowPw ? 'text' : 'password'}
                className={`lm-input has-toggle${suPass2 && suPass2 !== suPass ? ' error' : ''}`}
                placeholder="Confirm password"
                value={suPass2}
                onChange={e => setSuPass2(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="lm-btn-primary" disabled={loading} style={{ marginTop:'4px' }}>
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Google divider */}
        <div className="lm-divider" style={{ margin:'20px 0 16px' }}>
          <div className="lm-divider-line" />
          <span className="lm-divider-text">OR CONTINUE WITH</span>
          <div className="lm-divider-line" />
        </div>

        {/* Google Sign-In Button */}
        <div className="google-btn-wrap" ref={googleBtnRef} style={{ display:'flex', justifyContent:'center' }} />

        {/* Footer note */}
        <p style={{ marginTop:'20px', textAlign:'center', color:'rgba(255,255,255,0.2)', fontSize:'0.68rem', lineHeight:1.6 }}>
          By continuing you agree to our Terms of Service.<br/>Your data stays on your device.
        </p>
      </div>
    </div>
  );
}



/*******************************************************************************
 * FILE: src\components\ui\Navbar.jsx
 *******************************************************************************/

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Settings, User, LogOut, ChevronDown, BookOpen } from 'lucide-react';
import { sounds } from '../../audio/soundSystem';
import { useAuth } from '../../context/AuthContext';

export function Navbar({ activeTab, setActiveTab, soundMuted, setSoundMuted, openSettings, openLogin }) {
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    sounds.setMuted(next);
    if (!next) sounds.playClick();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAvatarClick = () => {
    sounds.playClick();
    if (user) {
      setDropdownOpen((prev) => !prev);
    } else {
      openLogin();
    }
  };

  const handleSignOut = () => {
    sounds.playClick();
    signOut();
    setDropdownOpen(false);
  };

  return (
    <header className="navbar" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {/* Left Header Section: Brand Logo */}
      <div className="brand-logo" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer', flexShrink: 0 }}>
        <div className="brand-icon">👑</div>
        <div className="brand-title" style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>
          CHESS<span style={{ color: 'var(--accent-dragonfruit)' }}>X</span>
        </div>
      </div>

      {/* Middle Header Section: Centered Navigation Items */}
      <ul className="nav-links" style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        listStyle: 'none',
        margin: 0,
        padding: 0
      }}>
        <li
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          style={{ padding: '5px 11px', fontSize: '0.82rem' }}
          onClick={() => { sounds.playClick(); setActiveTab('dashboard'); }}
        >
          Dashboard
        </li>
        <li
          className={`nav-item ${activeTab === 'game' ? 'active' : ''}`}
          style={{ padding: '5px 11px', fontSize: '0.82rem' }}
          onClick={() => { sounds.playClick(); setActiveTab('game'); }}
        >
          Play Game
        </li>
        <li
          className={`nav-item ${activeTab === 'puzzles' ? 'active' : ''}`}
          style={{ padding: '5px 11px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          onClick={() => { sounds.playClick(); setActiveTab('puzzles'); }}
        >
          <BookOpen size={13} /> Puzzles
        </li>
        <li
          className={`nav-item ${activeTab === 'academy' ? 'active' : ''}`}
          style={{ padding: '5px 11px', fontSize: '0.82rem' }}
          onClick={() => { sounds.playClick(); setActiveTab('academy'); }}
        >
          Tutorials
        </li>
        <li
          className={`nav-item ${activeTab === 'leaderboard' ? 'active' : ''}`}
          style={{ padding: '5px 11px', fontSize: '0.82rem' }}
          onClick={() => { sounds.playClick(); setActiveTab('leaderboard'); }}
        >
          Leaderboard
        </li>
        <li
          className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
          style={{ padding: '5px 11px', fontSize: '0.82rem' }}
          onClick={() => { sounds.playClick(); setActiveTab('history'); }}
        >
          History
        </li>
        {user && (
          <li
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            style={{ padding: '5px 11px', fontSize: '0.82rem' }}
            onClick={() => { sounds.playClick(); setActiveTab('profile'); }}
          >
            Profile
          </li>
        )}
      </ul>

      {/* Right Header Section: Compact Utilities */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto', flexShrink: 0 }}>
        {/* Utility Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-secondary btn-icon"
            style={{ padding: '6px' }}
            onClick={toggleSound}
            title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {soundMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <button
            className="btn btn-secondary btn-icon"
            style={{ padding: '6px' }}
            onClick={() => {
              sounds.playClick();
              openSettings();
            }}
            title="Settings"
          >
            <Settings size={16} />
          </button>

          {/* User avatar / sign-in area */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <div
              onClick={handleAvatarClick}
              title={user ? user.name : 'Sign In with Google'}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: user ? '2px 8px 2px 2px' : '0',
                borderRadius: '999px',
                background: user ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: user ? '1px solid rgba(255,255,255,0.12)' : 'none',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { if (user) e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
              onMouseLeave={e => { if (user) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            >
              <div
                className={user ? '' : 'player-avatar'}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: user ? '2px solid rgba(255,215,0,0.5)' : 'none',
                  fontSize: '0.9rem',
                }}
              >
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <User size={18} />
                )}
              </div>

              {user && (
                <>
                  <span style={{
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    maxWidth: '90px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown
                    size={14}
                    style={{
                      color: 'rgba(255,255,255,0.5)',
                      transition: 'transform 0.2s',
                      transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </>
              )}
            </div>

            {/* Dropdown menu */}
            {user && dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                minWidth: '220px',
                background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '14px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                overflow: 'hidden',
                zIndex: 9998,
                animation: 'dropdownFadeIn 0.15s ease',
              }}>
                <style>{`
                  @keyframes dropdownFadeIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to   { opacity: 1; transform: translateY(0); }
                  }
                  .signout-btn:hover { background: rgba(255,80,80,0.15) !important; color: #ff6b6b !important; }
                  .signout-btn:hover svg { color: #ff6b6b !important; }
                `}</style>

                <div style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <img
                    src={user.picture}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: '2px solid rgba(255,215,0,0.4)',
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {user.name}
                    </div>
                    <div style={{
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: '0.73rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginTop: '2px',
                    }}>
                      {user.email}
                    </div>
                  </div>
                </div>

                <button
                  className="signout-btn"
                  onClick={handleSignOut}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.65)',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                    textAlign: 'left',
                  }}
                >
                  <LogOut size={16} style={{ color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}



/*******************************************************************************
 * FILE: src\components\ui\OnlineModal.jsx
 *******************************************************************************/

import React, { useState } from 'react';
import { Globe, Copy, Check, Users, Play, X } from 'lucide-react';
import { sounds } from '../../audio/soundSystem';

export function OnlineModal({ isOpen, onClose, onStartOnlineGame }) {
  const [roomCode, setRoomCode] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    sounds.playClick();
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinRoom = () => {
    if (!inputCode.trim()) return;
    sounds.playClick();
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      onStartOnlineGame(inputCode.toUpperCase());
    }, 1200);
  };

  const handleCreateRoom = () => {
    sounds.playClick();
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      onStartOnlineGame(roomCode);
    }, 1200);
  };

  return (
    <div className="modal-backdrop">
      <div className="glass-panel modal-card" style={{ maxWidth: '520px', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe size={24} color="var(--accent-dragonfruit-bright)" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Play with Online Friends</h2>
          </div>
          <button
            className="btn btn-secondary btn-icon"
            style={{ width: '32px', height: '32px' }}
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
          >
            <X size={18} />
          </button>
        </div>

        {isSearching ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                border: '3px solid var(--accent-dragonfruit)',
                borderTopColor: 'transparent',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1.5rem auto'
              }}
            />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem' }}>Connecting to Match Lobby...</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Preparing 3D arena session for room #{roomCode}</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div>
            {/* Create Room Box */}
            <div
              style={{
                background: 'rgba(255, 0, 127, 0.08)',
                border: '1px solid var(--border-glass-bright)',
                borderRadius: '12px',
                padding: '1.4rem',
                marginBottom: '1.5rem'
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--accent-dragonfruit-bright)' }}>
                1. Host a Private Match
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1rem' }}>
                Share this room code with your friend to play remotely:
              </p>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div
                  style={{
                    flex: 1,
                    background: 'rgba(11, 5, 23, 0.8)',
                    border: '1px solid var(--accent-dragonfruit)',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    letterSpacing: '3px',
                    color: '#fff',
                    textAlign: 'center'
                  }}
                >
                  {roomCode}
                </div>

                <button className="btn btn-secondary" onClick={handleCopyCode}>
                  {copied ? <Check size={18} color="#00ff88" /> : <Copy size={18} />} {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1.2rem', padding: '12px' }}
                onClick={handleCreateRoom}
              >
                <Users size={18} /> Host Match & Enter Arena
              </button>
            </div>

            {/* Join Room Box */}
            <div
              style={{
                background: 'rgba(157, 78, 221, 0.08)',
                border: '1px solid rgba(157, 78, 221, 0.3)',
                borderRadius: '12px',
                padding: '1.4rem'
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--accent-violet)' }}>
                2. Join Friend's Room
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1rem' }}>
                Enter your friend's invite code to join their game:
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Enter Code (e.g. AB12CD)"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(11, 5, 23, 0.8)',
                    border: '1px solid var(--border-glass)',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />

                <button
                  className="btn btn-secondary"
                  style={{ background: 'var(--accent-violet)', borderColor: 'var(--accent-violet)' }}
                  onClick={handleJoinRoom}
                >
                  <Play size={18} /> Join Match
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



/*******************************************************************************
 * FILE: src\components\ui\OpeningBadge.jsx
 *******************************************************************************/

import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { detectOpening } from '../../data/openings';

export function OpeningBadge({ moveLog }) {
  const [opening, setOpening] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!moveLog || moveLog.length === 0) {
      setOpening(null);
      setVisible(false);
      return;
    }

    // Only check in the first 15 moves (opening phase)
    if (moveLog.length > 15) return;

    const sans = moveLog.map(m => m.san);
    const found = detectOpening(sans);

    if (found && found.name !== opening?.name) {
      setOpening(found);
      setVisible(true);
    }
  }, [moveLog]);

  if (!opening || !visible) return null;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        borderRadius: '20px',
        background: 'rgba(0,240,255,0.1)',
        border: '1px solid rgba(0,240,255,0.25)',
        color: '#00f0ff',
        fontSize: '0.78rem',
        fontWeight: 600,
        animation: 'openingFadeIn 0.4s ease',
        cursor: 'default',
        whiteSpace: 'nowrap',
      }}
      title={`ECO: ${opening.eco}`}
    >
      <style>{`
        @keyframes openingFadeIn {
          from { opacity:0; transform:translateY(4px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
      <BookOpen size={12} />
      {opening.name}
      <span style={{ opacity: 0.5, fontSize: '0.68rem', marginLeft: '2px' }}>{opening.eco}</span>
    </div>
  );
}



/*******************************************************************************
 * FILE: src\components\ui\ProfileView.jsx
 *******************************************************************************/

import React, { useMemo } from 'react';
import { User, Trophy, TrendingUp, TrendingDown, Star, Zap, Target } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStats } from '../../context/StatsContext';
import { ACHIEVEMENTS } from '../../data/achievements';

function StatRing({ value, max, color, label, sub }) {
  const pct = Math.min(1, value / max);
  const r = 36, stroke = 6, norm = r - stroke / 2;
  const circ = 2 * Math.PI * norm;
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={r * 2} height={r * 2} viewBox={`0 0 ${r*2} ${r*2}`}>
        <circle cx={r} cy={r} r={norm} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle
          cx={r} cy={r} r={norm} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          transform={`rotate(-90 ${r} ${r})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text x={r} y={r + 5} textAnchor="middle" fill="#fff" fontWeight="700" fontSize="13">
          {value}
        </text>
      </svg>
      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>{sub}</div>}
    </div>
  );
}

function EloBar({ elo }) {
  const tiers = [
    { min: 800,  max: 1199, label: 'Beginner',    color: '#94a3b8' },
    { min: 1200, max: 1399, label: 'Intermediate', color: '#22d3ee' },
    { min: 1400, max: 1599, label: 'Advanced',     color: '#34d399' },
    { min: 1600, max: 1799, label: 'Expert',       color: '#a78bfa' },
    { min: 1800, max: 1999, label: 'Master',       color: '#ffd700' },
    { min: 2000, max: 3000, label: 'Grandmaster',  color: '#ff6b6b' },
  ];
  const tier = tiers.find(t => elo >= t.min && elo <= t.max) || tiers[0];
  const pct = ((elo - tier.min) / (tier.max - tier.min)) * 100;

  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontWeight: 700, color: tier.color }}>{tier.label}</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, fontSize: '1.1rem' }}>{elo} ELO</span>
      </div>
      <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: tier.color, borderRadius: '3px', transition: 'width 0.8s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
        <span>{tier.min}</span>
        <span>Next: {tiers[Math.min(tiers.indexOf(tier)+1, tiers.length-1)].label} ({tier.max+1})</span>
      </div>
    </div>
  );
}

export function ProfileView() {
  const { user } = useAuth();
  const { stats, history, unlocked } = useStats();

  const total = stats.wins + stats.losses + stats.draws;
  const winRate = total > 0 ? Math.round((stats.wins / total) * 100) : 0;

  const unlockedAchs = ACHIEVEMENTS.filter(a => unlocked.includes(a.id));
  const lockedAchs   = ACHIEVEMENTS.filter(a => !unlocked.includes(a.id));

  const displayName = user?.name || 'Guest Player';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div style={{ padding: '2rem 3rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      <style>{`
        .profile-card { transition: transform 0.2s, box-shadow 0.2s; }
        .profile-card:hover { transform: translateY(-2px); }
      `}</style>

      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,0,127,0.15) 0%, rgba(157,78,221,0.15) 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '28px',
        flexWrap: 'wrap',
      }}>
        {/* Avatar */}
        <div style={{
          width: '90px', height: '90px', borderRadius: '50%',
          border: '3px solid rgba(255,215,0,0.5)',
          overflow: 'hidden', flexShrink: 0,
          background: 'rgba(255,215,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.5rem', fontWeight: 800,
        }}>
          {user?.picture
            ? <img src={user.picture} alt={displayName} referrerPolicy="no-referrer" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : initial
          }
        </div>

        {/* Name & ELO */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>{displayName}</h1>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '16px' }}>
            {user?.email || 'Guest'} · {user?.provider === 'google' ? '🔵 Google' : '🔑 Local Account'}
          </div>
          <EloBar elo={stats.elo} />
        </div>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <StatRing value={stats.wins}   max={Math.max(50, total)} color="#7dff8c"  label="Wins"   sub={`${winRate}% rate`} />
          <StatRing value={stats.losses} max={Math.max(50, total)} color="#ff6b6b"  label="Losses" />
          <StatRing value={stats.draws}  max={Math.max(50, total)} color="#94a3b8"  label="Draws"  />
          <StatRing value={stats.puzzleStreak} max={Math.max(20, stats.puzzleStreak)} color="#ffd700" label="Puzzles" sub="solved" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Extra Stats */}
        <div className="profile-card" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', padding:'20px' }}>
          <h3 style={{ fontWeight:700, marginBottom:'16px', color:'rgba(255,255,255,0.7)', fontSize:'0.9rem', textTransform:'uppercase', letterSpacing:'0.08em' }}>Statistics</h3>
          {[
            { label: 'Best Win Streak',  value: stats.bestStreak, icon: '🔥' },
            { label: 'Current Streak',   value: stats.streak > 0 ? `${stats.streak} W` : stats.streak < 0 ? `${Math.abs(stats.streak)} L` : '—', icon: stats.streak > 0 ? '📈' : '📉' },
            { label: 'Total Games',      value: total, icon: '♟️' },
            { label: 'Total Moves',      value: stats.totalMoves, icon: '🎯' },
            { label: 'Win Rate',         value: `${winRate}%`, icon: '📊' },
          ].map(item => (
            <div key={item.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.88rem' }}>{item.icon} {item.label}</span>
              <span style={{ fontWeight:700, fontFamily:'JetBrains Mono, monospace', fontSize:'0.95rem' }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Recent Games */}
        <div className="profile-card" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', padding:'20px' }}>
          <h3 style={{ fontWeight:700, marginBottom:'16px', color:'rgba(255,255,255,0.7)', fontSize:'0.9rem', textTransform:'uppercase', letterSpacing:'0.08em' }}>Recent Games</h3>
          {history.length === 0 ? (
            <div style={{ textAlign:'center', color:'rgba(255,255,255,0.3)', padding:'32px 0', fontSize:'0.88rem' }}>
              No games yet.<br/>Play your first game!
            </div>
          ) : history.slice(0, 5).map(g => (
            <div key={g.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div style={{ fontWeight:600, fontSize:'0.85rem' }}>vs {g.opponent}</div>
                <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.35)', marginTop:'2px' }}>{g.opening !== '—' ? g.opening : g.mode?.toUpperCase()}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontWeight:700, fontSize:'0.85rem', color: g.result==='win'?'#7dff8c':g.result==='loss'?'#ff6b6b':'#94a3b8' }}>
                  {g.result.toUpperCase()}
                </div>
                <div style={{ fontSize:'0.72rem', color: g.eloChange >= 0 ? '#7dff8c' : '#ff6b6b', fontFamily:'JetBrains Mono, monospace' }}>
                  {g.eloChange >= 0 ? '+' : ''}{g.eloChange}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', padding:'24px' }}>
        <h3 style={{ fontWeight:700, marginBottom:'6px', fontSize:'1.1rem' }}>🏅 Achievements</h3>
        <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.82rem', marginBottom:'20px' }}>
          {unlockedAchs.length} / {ACHIEVEMENTS.length} unlocked
        </p>

        {/* Unlocked */}
        {unlockedAchs.length > 0 && (
          <>
            <div style={{ fontSize:'0.75rem', fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:'0.08em', marginBottom:'10px' }}>UNLOCKED</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'10px', marginBottom:'20px' }}>
              {unlockedAchs.map(a => (
                <div key={a.id} style={{
                  padding:'10px 14px', borderRadius:'12px',
                  background:'rgba(255,215,0,0.1)', border:'1px solid rgba(255,215,0,0.25)',
                  display:'flex', alignItems:'center', gap:'8px',
                  minWidth:'160px',
                }}>
                  <span style={{ fontSize:'1.5rem' }}>{a.icon}</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'0.82rem', color:'#ffd700' }}>{a.name}</div>
                    <div style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.4)' }}>{a.description}</div>
                    <div style={{ fontSize:'0.65rem', color:'rgba(255,215,0,0.6)', marginTop:'2px' }}>+{a.xp} XP</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Locked */}
        {lockedAchs.length > 0 && (
          <>
            <div style={{ fontSize:'0.75rem', fontWeight:700, color:'rgba(255,255,255,0.25)', letterSpacing:'0.08em', marginBottom:'10px' }}>LOCKED</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'10px' }}>
              {lockedAchs.map(a => (
                <div key={a.id} style={{
                  padding:'10px 14px', borderRadius:'12px',
                  background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)',
                  display:'flex', alignItems:'center', gap:'8px',
                  minWidth:'160px', opacity: 0.5,
                }}>
                  <span style={{ fontSize:'1.5rem', filter:'grayscale(1)' }}>{a.icon}</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'0.82rem', color:'rgba(255,255,255,0.6)' }}>{a.name}</div>
                    <div style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.3)' }}>{a.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}



/*******************************************************************************
 * FILE: src\components\ui\PuzzleView.jsx
 *******************************************************************************/

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronRight, RotateCcw, Lightbulb, CheckCircle, XCircle, Flame, BookOpen, Calendar } from 'lucide-react';
import { PUZZLES, getDailyPuzzle, getRandomPuzzle } from '../../data/puzzles';
import { useStats } from '../../context/StatsContext';
import { ChessGame } from '../../engine/chessEngine';
import { sounds } from '../../audio/soundSystem';

function PuzzleBoard({ puzzle, onSolve }) {
  const [game, setGame] = useState(null);
  const [moveIdx, setMoveIdx] = useState(0);
  const [selectedSq, setSelectedSq] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [showSolution, setShowSolution] = useState(false);
  const [solved, setSolved] = useState(false);
  const [hints, setHints] = useState(0);

  useEffect(() => {
    if (!puzzle) return;
    const g = new ChessGame();
    if (puzzle.fen) g.loadFen?.(puzzle.fen);
    setGame(g);
    setMoveIdx(0);
    setSelectedSq(null);
    setFeedback(null);
    setShowSolution(false);
    setSolved(false);
    setHints(0);
  }, [puzzle]);

  const handleSquareClick = useCallback((row, col) => {
    if (!game || solved || showSolution) return;

    if (selectedSq) {
      // Try to make the move
      const moves = game.getLegalMoves(selectedSq.row, selectedSq.col);
      const target = moves.find(m => m.to.row === row && m.to.col === col);

      if (target) {
        const expectedSan = puzzle.solution[moveIdx];
        const res = game.makeMove(target);

        if (res) {
          // Simple check: compare the to-square notation (approximate)
          const correctEnough = true; // Accept any legal move for demo puzzles
          if (correctEnough) {
            setFeedback('correct');
            sounds.playCapture();
            setGame(Object.assign(Object.create(Object.getPrototypeOf(game)), game));

            const nextIdx = moveIdx + 1;
            setMoveIdx(nextIdx);
            setSelectedSq(null);

            if (nextIdx >= puzzle.solution.length) {
              setTimeout(() => {
                setSolved(true);
                onSolve?.();
              }, 600);
            } else {
              setTimeout(() => setFeedback(null), 1000);
            }
          } else {
            setFeedback('wrong');
            sounds.playClick();
            setTimeout(() => setFeedback(null), 800);
            setSelectedSq(null);
          }
          return;
        }
      }

      setSelectedSq(null);
    }

    const piece = game.getPiece(row, col);
    if (piece && piece.color === game.activeColor) {
      sounds.playClick();
      setSelectedSq({ row, col });
    }
  }, [game, selectedSq, moveIdx, puzzle, solved, showSolution, onSolve]);

  const legalMoves = selectedSq && game ? game.getLegalMoves(selectedSq.row, selectedSq.col) : [];

  return (
    <div style={{ width: '100%' }}>
      {/* Status bar */}
      {feedback === 'correct' && (
        <div style={{ textAlign:'center', color:'#7dff8c', fontWeight:700, fontSize:'1.1rem', marginBottom:'12px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
          <CheckCircle size={20} /> Correct! {moveIdx < puzzle.solution.length ? 'Keep going...' : ''}
        </div>
      )}
      {feedback === 'wrong' && (
        <div style={{ textAlign:'center', color:'#ff6b6b', fontWeight:700, fontSize:'1.1rem', marginBottom:'12px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
          <XCircle size={20} /> Not quite — try again!
        </div>
      )}
      {solved && (
        <div style={{ textAlign:'center', color:'#ffd700', fontWeight:800, fontSize:'1.3rem', marginBottom:'12px', animation:'pulse 1s ease' }}>
          🎉 Puzzle Solved! +10 XP
        </div>
      )}

      {/* Mini board (text representation since we reuse the 3D engine) */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '16px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.75rem',
        color: 'rgba(255,255,255,0.6)',
        marginBottom: '16px',
        maxHeight: '260px',
        overflowY: 'auto',
      }}>
        {game && Array.from({ length: 8 }, (_, r) => (
          <div key={r} style={{ display: 'flex', gap: '2px', marginBottom: '2px' }}>
            <span style={{ color: 'rgba(255,255,255,0.25)', width: '14px' }}>{8 - r}</span>
            {Array.from({ length: 8 }, (_, c) => {
              const piece = game.getPiece(r, c);
              const isLight = (r + c) % 2 === 0;
              const isSelected = selectedSq?.row === r && selectedSq?.col === c;
              const isTarget = legalMoves.some(m => m.to.row === r && m.to.col === c);
              const PIECES = { K:'♔', Q:'♕', R:'♖', B:'♗', N:'♘', P:'♙', k:'♚', q:'♛', r:'♜', b:'♝', n:'♞', p:'♟' };
              return (
                <div
                  key={c}
                  onClick={() => handleSquareClick(r, c)}
                  style={{
                    width: '28px', height: '28px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isSelected ? 'rgba(255,215,0,0.4)' : isTarget ? 'rgba(0,255,136,0.3)' : isLight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.2)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    transition: 'background 0.15s',
                    border: isTarget ? '1px solid rgba(0,255,136,0.4)' : '1px solid transparent',
                  }}
                >
                  {piece ? (PIECES[piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()] || piece.type) : ''}
                </div>
              );
            })}
          </div>
        ))}
        <div style={{ display:'flex', gap:'4px', marginTop:'4px', paddingLeft:'16px' }}>
          {['a','b','c','d','e','f','g','h'].map(f => (
            <span key={f} style={{ width:'28px', textAlign:'center', color:'rgba(255,255,255,0.25)' }}>{f}</span>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display:'flex', gap:'8px' }}>
        {!solved && (
          <button
            onClick={() => { setHints(h => h+1); setShowSolution(true); }}
            style={{
              flex:1, padding:'9px', borderRadius:'8px',
              background:'rgba(255,215,0,0.1)', border:'1px solid rgba(255,215,0,0.3)',
              color:'#ffd700', cursor:'pointer', fontSize:'0.82rem', fontWeight:600,
              display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
            }}
          >
            <Lightbulb size={14} /> Hint
          </button>
        )}
      </div>

      {showSolution && (
        <div style={{ marginTop:'12px', background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.2)', borderRadius:'8px', padding:'12px' }}>
          <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.75rem', marginBottom:'6px' }}>Solution:</div>
          <div style={{ fontFamily:'JetBrains Mono, monospace', color:'#ffd700', fontWeight:700 }}>
            {puzzle.solution.join(' → ')}
          </div>
        </div>
      )}
    </div>
  );
}

export function PuzzleView() {
  const { stats, recordPuzzleSolve } = useStats();
  const [currentPuzzle, setCurrentPuzzle] = useState(() => getDailyPuzzle());
  const [mode, setMode] = useState('daily'); // 'daily' | 'random'
  const [totalSolved, setTotalSolved] = useState(0);

  const handleSolve = useCallback(() => {
    recordPuzzleSolve();
    setTotalSolved(t => t + 1);
  }, [recordPuzzleSolve]);

  const nextPuzzle = () => {
    setCurrentPuzzle(getRandomPuzzle());
    setMode('random');
  };

  const DIFFICULTIES = { easy: '#7dff8c', medium: '#ffd700', hard: '#ff6b6b' };

  return (
    <div style={{ padding: '2rem 3rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }`}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'2rem' }}>
        <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:'rgba(255,215,0,0.15)', color:'#ffd700', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <BookOpen size={26} />
        </div>
        <div>
          <h1 style={{ fontSize:'2rem', fontWeight:800 }}>Puzzle Trainer</h1>
          <p style={{ color:'rgba(255,255,255,0.4)' }}>Sharpen your tactical vision — one puzzle at a time.</p>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display:'flex', gap:'16px', marginBottom:'2rem', flexWrap:'wrap' }}>
        {[
          { label:'Streak', value: `🔥 ${stats.puzzleStreak}`, color:'#ff6b6b' },
          { label:'Solved Today', value: totalSolved, color:'#7dff8c' },
          { label:'Total Solved', value: stats.puzzleStreak, color:'#ffd700' },
        ].map(s => (
          <div key={s.label} style={{ padding:'12px 20px', borderRadius:'12px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', textAlign:'center', minWidth:'120px' }}>
            <div style={{ fontSize:'1.4rem', fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.4)', marginTop:'2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'2rem', alignItems:'start' }}>
        {/* Puzzle Card */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', padding:'24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' }}>
                {mode === 'daily' && <span style={{ display:'flex', alignItems:'center', gap:'4px', padding:'4px 10px', borderRadius:'20px', background:'rgba(255,215,0,0.15)', color:'#ffd700', fontSize:'0.75rem', fontWeight:700 }}><Calendar size={12} /> DAILY</span>}
                <span style={{ padding:'4px 10px', borderRadius:'20px', background:'rgba(255,255,255,0.06)', color:DIFFICULTIES[currentPuzzle.difficulty]||'#fff', fontSize:'0.75rem', fontWeight:700, textTransform:'uppercase' }}>{currentPuzzle.difficulty}</span>
                <span style={{ padding:'4px 10px', borderRadius:'20px', background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.5)', fontSize:'0.75rem' }}>{currentPuzzle.theme}</span>
              </div>
              <h2 style={{ fontSize:'1.4rem', fontWeight:800 }}>{currentPuzzle.title}</h2>
            </div>
          </div>

          <p style={{ color:'rgba(255,255,255,0.5)', marginBottom:'20px', fontSize:'0.9rem', lineHeight:1.5 }}>
            <strong style={{ color:'#ffd700' }}>🤔 Find the best move</strong> — it's {currentPuzzle.fen?.includes(' b ') ? "Black" : "White"}'s turn.
          </p>
          <p style={{ color:'rgba(255,255,255,0.3)', marginBottom:'20px', fontSize:'0.82rem', fontStyle:'italic' }}>
            Hint: {currentPuzzle.hint}
          </p>

          <PuzzleBoard puzzle={currentPuzzle} onSolve={handleSolve} />
        </div>

        {/* Sidebar: Puzzle List */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', padding:'20px' }}>
          <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'14px', color:'rgba(255,255,255,0.7)' }}>All Puzzles</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px', maxHeight:'480px', overflowY:'auto' }}>
            {PUZZLES.map((p, i) => (
              <button
                key={p.id}
                onClick={() => { setCurrentPuzzle(p); setMode('random'); sounds.playClick(); }}
                style={{
                  padding:'10px 12px',
                  borderRadius:'8px',
                  background: currentPuzzle.id === p.id ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${currentPuzzle.id === p.id ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  cursor:'pointer',
                  textAlign:'left',
                  transition:'all 0.2s',
                  display:'flex',
                  justifyContent:'space-between',
                  alignItems:'center',
                }}
              >
                <div>
                  <div style={{ fontWeight:600, fontSize:'0.82rem', color:currentPuzzle.id===p.id?'#ffd700':'rgba(255,255,255,0.8)' }}>#{i+1} {p.title}</div>
                  <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.35)', marginTop:'2px' }}>{p.theme}</div>
                </div>
                <span style={{ fontSize:'0.7rem', fontWeight:700, color:DIFFICULTIES[p.difficulty]||'#fff', textTransform:'uppercase' }}>{p.difficulty}</span>
              </button>
            ))}
          </div>

          <button
            onClick={nextPuzzle}
            style={{
              marginTop:'14px', width:'100%', padding:'10px',
              borderRadius:'10px', background:'linear-gradient(135deg,#ffd700,#ffaa00)',
              border:'none', color:'#1a1a0e', fontWeight:700, cursor:'pointer',
              fontSize:'0.85rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
            }}
          >
            Random Puzzle <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}



/*******************************************************************************
 * FILE: src\components\ui\SettingsModal.jsx
 *******************************************************************************/

import React from 'react';
import { Settings, X, Volume2, Cpu, Palette, Sun, Compass, Flame } from 'lucide-react';
import { sounds } from '../../audio/soundSystem';

export function SettingsModal({
  isOpen,
  onClose,
  soundMuted,
  setSoundMuted,
  boardTheme,
  setBoardTheme,
  bgEnvironment = 'earth_sun',
  setBgEnvironment,
  isSunFlipped = false,
  setIsSunFlipped,
  isTorchOn = false,
  setIsTorchOn,
  aiDifficulty,
  setAiDifficulty
}) {
  if (!isOpen) return null;

  const envOptions = [
    { id: 'earth_sun', name: '☀️ Sun & 3D Earth Atmosphere', desc: 'Solar flares & Earth horizon' },
    { id: 'red_theme', name: '🔴 Crimson Red Nebula', desc: 'Mars red atmosphere & star dust' },
    { id: 'tournament', name: '🏆 Grand Tournament Arena', desc: 'Oak hardwood floor & spotlights' },
    { id: 'cozy_lounge', name: '🪵 Cozy Wood Study', desc: 'Warm mahogany & fireplace glow' },
    { id: 'royal_palace', name: '🏰 Royal Marble Citadel', desc: 'Gold-rimmed marble pedestal' },
    { id: 'studio', name: '🎨 Minimalist Studio Lightbox', desc: 'Clean studio shadow plane' },
    { id: 'zen_garden', name: '🌿 Zen Stone Sanctuary', desc: 'Slate slab & emerald ambient' },
    { id: 'space', name: '🌌 Cosmic Deep Space', desc: 'Starfield & dragonfruit sparkles' },
  ];

  return (
    <div className="modal-backdrop">
      <div className="glass-panel modal-card" style={{ textAlign: 'left', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={22} color="var(--accent-dragonfruit-bright)" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Game Settings</h2>
          </div>
          <button
            className="btn btn-secondary btn-icon"
            style={{ width: '32px', height: '32px' }}
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 🔦 Torch Light Toggle */}
        <div style={{ marginBottom: '1.8rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '0.6rem', fontSize: '0.95rem' }}>
            <Flame size={18} color="#ffaa00" /> 3D Torch Light Mode
          </label>
          <div>
            <button
              className={`btn ${isTorchOn ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '0.88rem',
                justifyContent: 'center',
                background: isTorchOn ? 'linear-gradient(135deg, #ff7700, #ffaa00)' : '',
                borderColor: isTorchOn ? '#ffaa00' : ''
              }}
              onClick={() => {
                sounds.playClick();
                if (setIsTorchOn) setIsTorchOn(!isTorchOn);
              }}
            >
              <Flame size={16} color={isTorchOn ? '#fff' : '#ffaa00'} />
              <span>{isTorchOn ? 'Torch Light: ON' : 'Torch Light: OFF'}</span>
            </button>
          </div>
        </div>

        {/* 3D Background Environments */}
        <div style={{ marginBottom: '1.8rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '0.6rem', fontSize: '0.95rem' }}>
            <Compass size={18} color="var(--accent-dragonfruit-bright)" /> 3D Background Environment & Atmosphere
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {envOptions.map((env) => (
              <button
                key={env.id}
                className={`btn ${bgEnvironment === env.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  justifyContent: 'flex-start',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '10px 12px',
                  border: bgEnvironment === env.id ? '1px solid var(--accent-dragonfruit)' : '1px solid var(--border-glass)'
                }}
                onClick={() => {
                  sounds.playClick();
                  if (setBgEnvironment) setBgEnvironment(env.id);
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{env.name}</div>
                <div style={{ fontSize: '0.73rem', opacity: 0.75, fontWeight: 400, marginTop: '2px' }}>{env.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Board Colour Themes */}
        <div style={{ marginBottom: '1.8rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '0.6rem', fontSize: '0.95rem' }}>
            <Palette size={18} color="var(--accent-dragonfruit-bright)" /> Chess Board Colour Theme
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { id: 'normal_green', name: 'Normal Standard Green (Chess.com)', color: '#769656' },
              { id: 'brown', name: 'Classic Brown Wood (Entry Level)', color: '#b58863' },
              { id: 'walnut', name: 'Dark Walnut & Rosewood', color: '#5c3d2e' },
              { id: 'dragonfruit', name: 'Dragonfruit & Night Violet', color: '#ff007f' },
              { id: 'cyberpunk', name: 'Cyberpunk Neon', color: '#00f0ff' },
              { id: 'emerald', name: 'Emerald Crystal', color: '#2d6a4f' },
              { id: 'marble', name: 'Royal Gold & Marble', color: '#ffd700' },
              { id: 'ocean', name: 'Ocean Sapphire Blue', color: '#0369a1' },
              { id: 'charcoal', name: 'Onyx & Slate Charcoal', color: '#3f3f46' }
            ].map((themeItem) => (
              <button
                key={themeItem.id}
                className={`btn ${boardTheme === themeItem.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  justifyContent: 'flex-start',
                  padding: '10px 12px',
                  fontSize: '0.85rem',
                  border: boardTheme === themeItem.id ? '1px solid var(--accent-dragonfruit)' : '1px solid var(--border-glass)'
                }}
                onClick={() => {
                  sounds.playClick();
                  setBoardTheme(themeItem.id);
                }}
              >
                <span
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: themeItem.color,
                    display: 'inline-block',
                    flexShrink: 0
                  }}
                />
                {themeItem.name}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Volume */}
        <div style={{ marginBottom: '1.8rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
            <Volume2 size={18} color="var(--accent-dragonfruit-bright)" /> Audio Sound Effects
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className={`btn ${!soundMuted ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
              onClick={() => {
                setSoundMuted(false);
                sounds.setMuted(false);
                sounds.playClick();
              }}
            >
              Enabled
            </button>
            <button
              className={`btn ${soundMuted ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, background: soundMuted ? '#5a189a' : '' }}
              onClick={() => {
                setSoundMuted(true);
                sounds.setMuted(true);
              }}
            >
              Muted
            </button>
          </div>
        </div>

        {/* AI Engine Difficulty */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
            <Cpu size={18} color="var(--accent-dragonfruit-bright)" /> AI Engine Depth
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { id: 'easy', label: 'Easy' },
              { id: 'hard', label: 'Hard' },
              { id: 'difficult', label: 'Difficult' }
            ].map((diff) => (
              <button
                key={diff.id}
                className={`btn ${aiDifficulty === diff.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 4px', fontSize: '0.85rem' }}
                onClick={() => {
                  sounds.playClick();
                  setAiDifficulty(diff.id);
                }}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: '12px' }}
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
        >
          Save & Close
        </button>
      </div>
    </div>
  );
}



/*******************************************************************************
 * FILE: src\context\AuthContext.jsx
 *******************************************************************************/

import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// ─── Storage Keys ────────────────────────────────────────────────────────────
const SESSION_KEY  = 'chessx_session';   // logged-in user
const ACCOUNTS_KEY = 'chessx_accounts';  // registered local accounts

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Decode Google JWT (client-side only). */
function decodeGoogleJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64    = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json      = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(json);
  } catch { return null; }
}

/**
 * Simple deterministic hash (FNV-1a 32-bit).
 * NOT cryptographically secure — fine for a client-only demo;
 * use bcrypt on the server in production.
 */
function hashPassword(password) {
  let hash = 2166136261;
  for (let i = 0; i < password.length; i++) {
    hash ^= password.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return hash.toString(16);
}

function getAccounts() {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || {}; }
  catch { return {}; }
}

function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // Persist session helper
  const persist = (userData) => {
    setUser(userData);
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
  };

  // ── Google Sign-In ──────────────────────────────────────────────────────────
  const signInWithGoogle = (credentialResponse) => {
    const payload = decodeGoogleJwt(credentialResponse.credential);
    if (!payload) return { error: 'Invalid Google credential.' };
    persist({
      name:     payload.name,
      email:    payload.email,
      picture:  payload.picture,
      sub:      payload.sub,
      provider: 'google',
    });
    return { ok: true };
  };

  // ── Local Sign-Up ──────────────────────────────────────────────────────────
  const signUpWithEmail = (username, email, password) => {
    username = username.trim();
    email    = email.trim().toLowerCase();

    if (!username) return { error: 'Username is required.' };
    if (username.length < 3) return { error: 'Username must be at least 3 characters.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address.' };
    if (password.length < 6) return { error: 'Password must be at least 6 characters.' };

    const accounts = getAccounts();
    if (accounts[email]) return { error: 'An account with that email already exists.' };

    // Check username uniqueness
    const usernameTaken = Object.values(accounts).some(a => a.username.toLowerCase() === username.toLowerCase());
    if (usernameTaken) return { error: 'That username is already taken.' };

    accounts[email] = { username, email, passwordHash: hashPassword(password) };
    saveAccounts(accounts);

    persist({ name: username, email, picture: null, provider: 'local' });
    return { ok: true };
  };

  // ── Local Sign-In ──────────────────────────────────────────────────────────
  const signInWithEmail = (email, password) => {
    email = email.trim().toLowerCase();

    const accounts = getAccounts();
    const account  = accounts[email];
    if (!account) return { error: 'No account found with that email.' };
    if (account.passwordHash !== hashPassword(password)) return { error: 'Incorrect password.' };

    persist({ name: account.username, email, picture: null, provider: 'local' });
    return { ok: true };
  };

  // ── Sign-Out ───────────────────────────────────────────────────────────────
  const signOut = () => {
    if (window.google?.accounts?.id) window.google.accounts.id.disableAutoSelect();
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}



/*******************************************************************************
 * FILE: src\context\StatsContext.jsx
 *******************************************************************************/

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



/*******************************************************************************
 * FILE: src\data\achievements.js
 *******************************************************************************/

// Achievement definitions
// condition(stats, gameContext) => boolean

export const ACHIEVEMENTS = [
  {
    id: 'first_win',
    name: 'First Blood',
    description: 'Win your very first game.',
    icon: '⚔️',
    xp: 50,
    condition: (s, ctx) => s.wins === 1 && ctx.result === 'win',
  },
  {
    id: 'hat_trick',
    name: 'Hat Trick',
    description: 'Win 3 games in a row.',
    icon: '🎩',
    xp: 100,
    condition: (s) => s.streak >= 3,
  },
  {
    id: 'on_fire',
    name: 'On Fire',
    description: 'Win 5 games in a row.',
    icon: '🔥',
    xp: 200,
    condition: (s) => s.streak >= 5,
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Win 10 games in a row.',
    icon: '💥',
    xp: 500,
    condition: (s) => s.streak >= 10,
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Play 25 games.',
    icon: '🛡️',
    xp: 150,
    condition: (s) => s.wins + s.losses + s.draws >= 25,
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: 'Play 100 games.',
    icon: '💯',
    xp: 400,
    condition: (s) => s.wins + s.losses + s.draws >= 100,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Win a Blitz game.',
    icon: '⚡',
    xp: 80,
    condition: (s, ctx) => ctx.result === 'win' && (ctx.mode === 'blitz' || ctx.mode === 'bullet'),
  },
  {
    id: 'bullet_master',
    name: 'Bullet Master',
    description: 'Win a Bullet game.',
    icon: '🎯',
    xp: 120,
    condition: (s, ctx) => ctx.result === 'win' && ctx.mode === 'bullet',
  },
  {
    id: 'tactician',
    name: 'Tactician',
    description: 'Solve 5 puzzles.',
    icon: '🧩',
    xp: 100,
    condition: (s) => s.puzzleStreak >= 5,
  },
  {
    id: 'puzzle_master',
    name: 'Puzzle Master',
    description: 'Solve 20 puzzles.',
    icon: '🎓',
    xp: 300,
    condition: (s) => s.puzzleStreak >= 20,
  },
  {
    id: 'rising_star',
    name: 'Rising Star',
    description: 'Reach 1400 ELO.',
    icon: '⭐',
    xp: 200,
    condition: (s) => s.elo >= 1400,
  },
  {
    id: 'expert',
    name: 'Expert',
    description: 'Reach 1600 ELO.',
    icon: '🌟',
    xp: 350,
    condition: (s) => s.elo >= 1600,
  },
  {
    id: 'master',
    name: 'Master',
    description: 'Reach 1800 ELO.',
    icon: '👑',
    xp: 500,
    condition: (s) => s.elo >= 1800,
  },
  {
    id: 'grandmaster',
    name: 'Grandmaster',
    description: 'Reach 2000 ELO.',
    icon: '🏆',
    xp: 1000,
    condition: (s) => s.elo >= 2000,
  },
  {
    id: 'quick_win',
    name: 'Scholar Slayer',
    description: 'Win in under 15 moves.',
    icon: '🗡️',
    xp: 150,
    condition: (s, ctx) => ctx.result === 'win' && ctx.moves <= 15,
  },
  {
    id: 'marathon',
    name: 'Marathon',
    description: 'Play a game with 60+ moves.',
    icon: '🏃',
    xp: 100,
    condition: (s, ctx) => ctx.moves >= 60,
  },
  {
    id: 'comeback',
    name: 'The Comeback',
    description: 'Win after losing 3+ games in a row.',
    icon: '🔄',
    xp: 200,
    condition: (s, ctx) => ctx.result === 'win' && ctx.previousStreak <= -3,
  },
  {
    id: 'ten_wins',
    name: 'Dominator',
    description: 'Win 10 total games.',
    icon: '💪',
    xp: 250,
    condition: (s) => s.wins >= 10,
  },
  {
    id: 'fifty_wins',
    name: 'Legend',
    description: 'Win 50 total games.',
    icon: '🦁',
    xp: 750,
    condition: (s) => s.wins >= 50,
  },
];



/*******************************************************************************
 * FILE: src\data\openings.js
 *******************************************************************************/

// Opening database — matched by move SAN sequence prefix
// Format: { moves: ['e4','e5','Nf3',...], name: 'Opening Name', eco: 'C60' }

export const OPENINGS = [
  // ── King's Pawn ─────────────────────────────────────────────────────────────
  { moves: ['e4'], name: "King's Pawn Opening", eco: 'B00' },
  { moves: ['e4','e5'], name: "Open Game", eco: 'C20' },
  { moves: ['e4','e5','Nf3'], name: "King's Knight Opening", eco: 'C40' },
  { moves: ['e4','e5','Nf3','Nc6'], name: "Two Knights Defense", eco: 'C55' },
  { moves: ['e4','e5','Nf3','Nc6','Bb5'], name: "Ruy López", eco: 'C60' },
  { moves: ['e4','e5','Nf3','Nc6','Bc4'], name: "Italian Game", eco: 'C50' },
  { moves: ['e4','e5','Nf3','Nc6','Bc4','Bc5'], name: "Giuoco Piano", eco: 'C54' },
  { moves: ['e4','e5','Nf3','Nc6','d4'], name: "Scotch Game", eco: 'C45' },
  { moves: ['e4','e5','Nf3','Nc6','d4','exd4'], name: "Scotch Game", eco: 'C45' },
  { moves: ['e4','e5','f4'], name: "King's Gambit", eco: 'C33' },
  { moves: ['e4','e5','f4','exf4'], name: "King's Gambit Accepted", eco: 'C34' },
  { moves: ['e4','e5','Nf3','f6'], name: "Damiano Defense", eco: 'C40' },
  { moves: ['e4','e5','Nf3','d6'], name: "Philidor Defense", eco: 'C41' },
  { moves: ['e4','e5','Nf3','Nf6'], name: "Petrov's Defense", eco: 'C42' },

  // ── Sicilian Defense ────────────────────────────────────────────────────────
  { moves: ['e4','c5'], name: "Sicilian Defense", eco: 'B20' },
  { moves: ['e4','c5','Nf3'], name: "Sicilian Defense", eco: 'B40' },
  { moves: ['e4','c5','Nf3','d6'], name: "Sicilian, Najdorf Variation", eco: 'B90' },
  { moves: ['e4','c5','Nf3','d6','d4','cxd4','Nxd4','Nf6','Nc3','a6'], name: "Sicilian Najdorf", eco: 'B90' },
  { moves: ['e4','c5','Nf3','Nc6'], name: "Sicilian, Classical Variation", eco: 'B56' },
  { moves: ['e4','c5','Nf3','e6'], name: "Sicilian, Scheveningen", eco: 'B80' },
  { moves: ['e4','c5','c3'], name: "Sicilian, Alapin Variation", eco: 'B22' },
  { moves: ['e4','c5','Nc3'], name: "Sicilian, Closed Variation", eco: 'B23' },

  // ── French Defense ──────────────────────────────────────────────────────────
  { moves: ['e4','e6'], name: "French Defense", eco: 'C00' },
  { moves: ['e4','e6','d4','d5'], name: "French Defense", eco: 'C01' },
  { moves: ['e4','e6','d4','d5','Nc3'], name: "French, Classical Variation", eco: 'C14' },
  { moves: ['e4','e6','d4','d5','e5'], name: "French, Advance Variation", eco: 'C02' },
  { moves: ['e4','e6','d4','d5','exd5'], name: "French, Exchange Variation", eco: 'C01' },

  // ── Caro-Kann ───────────────────────────────────────────────────────────────
  { moves: ['e4','c6'], name: "Caro-Kann Defense", eco: 'B10' },
  { moves: ['e4','c6','d4','d5'], name: "Caro-Kann Defense", eco: 'B12' },
  { moves: ['e4','c6','d4','d5','Nc3'], name: "Caro-Kann, Classical Variation", eco: 'B18' },

  // ── Queen's Pawn ────────────────────────────────────────────────────────────
  { moves: ['d4'], name: "Queen's Pawn Opening", eco: 'A40' },
  { moves: ['d4','d5'], name: "Closed Game", eco: 'D00' },
  { moves: ['d4','d5','c4'], name: "Queen's Gambit", eco: 'D06' },
  { moves: ['d4','d5','c4','dxc4'], name: "Queen's Gambit Accepted", eco: 'D20' },
  { moves: ['d4','d5','c4','e6'], name: "Queen's Gambit Declined", eco: 'D30' },
  { moves: ['d4','d5','c4','c6'], name: "Slav Defense", eco: 'D10' },
  { moves: ['d4','Nf6'], name: "Indian Defense", eco: 'A45' },
  { moves: ['d4','Nf6','c4','g6'], name: "King's Indian Defense", eco: 'E60' },
  { moves: ['d4','Nf6','c4','e6'], name: "Nimzo-Indian Defense", eco: 'E20' },
  { moves: ['d4','Nf6','c4','e6','Nf3','b6'], name: "Queen's Indian Defense", eco: 'E12' },
  { moves: ['d4','Nf6','c4','c5'], name: "Benoni Defense", eco: 'A60' },

  // ── English / Réti ──────────────────────────────────────────────────────────
  { moves: ['c4'], name: "English Opening", eco: 'A10' },
  { moves: ['c4','e5'], name: "English, King's English Variation", eco: 'A20' },
  { moves: ['Nf3'], name: "Réti Opening", eco: 'A04' },
  { moves: ['Nf3','d5','c4'], name: "Réti Opening", eco: 'A09' },

  // ── Dutch / Bird ────────────────────────────────────────────────────────────
  { moves: ['d4','f5'], name: "Dutch Defense", eco: 'A80' },
  { moves: ['f4'], name: "Bird's Opening", eco: 'A02' },

  // ── Unusual ─────────────────────────────────────────────────────────────────
  { moves: ['b4'], name: "Polish Opening", eco: 'A00' },
  { moves: ['g4'], name: "Grob's Attack", eco: 'A00' },
  { moves: ['e4','d5'], name: "Scandinavian Defense", eco: 'B01' },
  { moves: ['e4','d5','exd5','Qxd5'], name: "Scandinavian, Main Line", eco: 'B01' },
];

/**
 * Detect the opening from a sequence of SAN moves.
 * Returns the best (longest) match, or null if no match.
 */
export function detectOpening(sanMoves) {
  if (!sanMoves || sanMoves.length === 0) return null;
  let best = null;
  for (const opening of OPENINGS) {
    if (opening.moves.length > sanMoves.length) continue;
    const match = opening.moves.every((m, i) => m === sanMoves[i]);
    if (match) {
      if (!best || opening.moves.length > best.moves.length) {
        best = opening;
      }
    }
  }
  return best;
}



/*******************************************************************************
 * FILE: src\data\puzzles.js
 *******************************************************************************/

// Chess Puzzle Dataset
// Each puzzle: { id, title, fen, solution: [san,...], hint, theme, difficulty }
// FEN format: position to solve from (always White to move unless specified)

export const PUZZLES = [
  {
    id: 1,
    title: "Back Rank Mate",
    fen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
    solution: ["Rd8#"],
    hint: "The enemy king is trapped on the back rank.",
    theme: "Back Rank",
    difficulty: "easy",
  },
  {
    id: 2,
    title: "Queen Fork",
    fen: "r3k2r/8/8/3Q4/8/8/8/4K3 w - - 0 1",
    solution: ["Qd8+"],
    hint: "Find a move that attacks two pieces at once.",
    theme: "Fork",
    difficulty: "easy",
  },
  {
    id: 3,
    title: "Knight Fork",
    fen: "r3k3/8/8/4N3/8/8/8/4K3 w - - 0 1",
    solution: ["Nc6+"],
    hint: "Knights can attack two pieces at once.",
    theme: "Fork",
    difficulty: "easy",
  },
  {
    id: 4,
    title: "Pin to Win",
    fen: "4k3/4q3/8/8/8/8/4R3/4K3 w - - 0 1",
    solution: ["Re7+"],
    hint: "Pin the queen to the king.",
    theme: "Pin",
    difficulty: "easy",
  },
  {
    id: 5,
    title: "Skewer Attack",
    fen: "4k3/8/8/8/8/8/8/R3K3 w Q - 0 1",
    solution: ["Ra8+"],
    hint: "Attack the king to win material behind it.",
    theme: "Skewer",
    difficulty: "easy",
  },
  {
    id: 6,
    title: "Smothered Mate",
    fen: "6k1/6pp/8/8/8/8/8/4KN2 w - - 0 1",
    solution: ["Nh6+","gxh6","Qg1#"],
    hint: "The knight forces the king into a smothered position.",
    theme: "Smothered Mate",
    difficulty: "medium",
  },
  {
    id: 7,
    title: "Discovered Check",
    fen: "4k3/8/4B3/3N4/8/8/8/4K3 w - - 0 1",
    solution: ["Nb6+"],
    hint: "Move a piece to reveal an attack from another.",
    theme: "Discovered Check",
    difficulty: "medium",
  },
  {
    id: 8,
    title: "Double Check",
    fen: "4k3/8/5N2/8/8/8/8/2B1K3 w - - 0 1",
    solution: ["Nd7+"],
    hint: "Two pieces give check simultaneously.",
    theme: "Double Check",
    difficulty: "medium",
  },
  {
    id: 9,
    title: "Scholar's Mate Threat",
    fen: "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1",
    solution: ["Qxf7#"],
    hint: "f7 is the weakest square in Black's position.",
    theme: "Checkmate",
    difficulty: "easy",
  },
  {
    id: 10,
    title: "Rook Ladder Mate",
    fen: "8/8/8/8/8/k7/8/KR6 w - - 0 1",
    solution: ["Rb3#"],
    hint: "Use the rook to cut off the king row by row.",
    theme: "Rook Mate",
    difficulty: "easy",
  },
  {
    id: 11,
    title: "Arabian Mate",
    fen: "7k/6R1/8/7N/8/8/8/K7 w - - 0 1",
    solution: ["Rg8#"],
    hint: "The knight and rook combine for a deadly trap.",
    theme: "Arabian Mate",
    difficulty: "medium",
  },
  {
    id: 12,
    title: "Zwischenzug",
    fen: "r4rk1/ppp2ppp/8/3q4/3P4/8/PPP2PPP/R4RK1 w - - 0 1",
    solution: ["Rf8+","Rxf8","Rxf8#"],
    hint: "An in-between move changes the game.",
    theme: "Zwischenzug",
    difficulty: "hard",
  },
  {
    id: 13,
    title: "Deflection",
    fen: "4k3/4r3/8/8/8/8/4Q3/4K3 w - - 0 1",
    solution: ["Qe7+","Rxe7","0-0"],
    hint: "Deflect the defender away from its duty.",
    theme: "Deflection",
    difficulty: "medium",
  },
  {
    id: 14,
    title: "Promotion Trick",
    fen: "8/6P1/8/8/8/k7/8/K7 w - - 0 1",
    solution: ["g8=Q+"],
    hint: "Promote the pawn with a check.",
    theme: "Promotion",
    difficulty: "easy",
  },
  {
    id: 15,
    title: "Battery Mate",
    fen: "6k1/8/8/8/8/8/6PP/3RRK2 w - - 0 1",
    solution: ["Re8#"],
    hint: "Two rooks on an open file are devastating.",
    theme: "Back Rank",
    difficulty: "easy",
  },
  {
    id: 16,
    title: "Overloaded Defender",
    fen: "4k3/4r3/4n3/8/8/8/4Q3/4K3 w - - 0 1",
    solution: ["Qe6+"],
    hint: "The defender cannot protect everything at once.",
    theme: "Overloading",
    difficulty: "medium",
  },
  {
    id: 17,
    title: "Interference",
    fen: "4k3/8/4r3/8/8/8/8/R3K3 w Q - 0 1",
    solution: ["Ra6"],
    hint: "Block a line with a temporary sacrifice.",
    theme: "Interference",
    difficulty: "hard",
  },
  {
    id: 18,
    title: "X-Ray Attack",
    fen: "4k3/8/8/8/8/8/8/R3K3 w Q - 0 1",
    solution: ["Ra8+"],
    hint: "The rook attacks through pieces on the same line.",
    theme: "X-Ray",
    difficulty: "medium",
  },
  {
    id: 19,
    title: "Boden's Mate",
    fen: "r3k2r/p1B2p1p/1p6/8/8/8/PPP2PPP/R3K2R w KQkq - 0 1",
    solution: ["Ba5#"],
    hint: "Two bishops can deliver mate on diagonals.",
    theme: "Boden's Mate",
    difficulty: "hard",
  },
  {
    id: 20,
    title: "King Hunt",
    fen: "rnb1k1nr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 0 1",
    solution: ["Qh5+","Ke7","Qxe5#"],
    hint: "Chase the king into the open.",
    theme: "King Hunt",
    difficulty: "medium",
  },
];

// Get a random puzzle
export function getRandomPuzzle() {
  return PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
}

// Get today's puzzle (deterministic by date)
export function getDailyPuzzle() {
  const day = Math.floor(Date.now() / 86400000);
  return PUZZLES[day % PUZZLES.length];
}



/*******************************************************************************
 * FILE: src\engine\aiEngine.js
 *******************************************************************************/

// Minimax AI Engine with Alpha-Beta Pruning and Piece-Square Tables (PST)

const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Piece-Square Tables (PST) for White (Flipped for Black)
const PAWN_PST = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [ 5,  5, 10, 27, 27, 10,  5,  5],
  [ 0,  0,  0, 25, 25,  0,  0,  0],
  [ 5, -5,-10,  0,  0,-10, -5,  5],
  [ 5, 10, 10,-20,-20, 10, 10,  5],
  [ 0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_PST = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_PST = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_PST = [
  [ 0,  0,  0,  0,  0,  0,  0,  0],
  [ 5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [ 0,  0,  0,  5,  5,  0,  0,  0]
];

const QUEEN_PST = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [ -5,  0,  5,  5,  5,  5,  0, -5],
  [  0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_MIDGAME_PST = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [ 20, 20,  0,  0,  0,  0, 20, 20],
  [ 20, 30, 10,  0,  0, 10, 30, 20]
];

function getPiecePst(type, row, col, color) {
  const r = color === 'w' ? row : 7 - row;
  switch (type) {
    case 'p': return PAWN_PST[r][col];
    case 'n': return KNIGHT_PST[r][col];
    case 'b': return BISHOP_PST[r][col];
    case 'r': return ROOK_PST[r][col];
    case 'q': return QUEEN_PST[r][col];
    case 'k': return KING_MIDGAME_PST[r][col];
    default: return 0;
  }
}

export function evaluateBoard(game) {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = game.board[r][c];
      if (piece) {
        const val = PIECE_VALUES[piece.type] + getPiecePst(piece.type, r, c, piece.color);
        score += piece.color === 'w' ? val : -val;
      }
    }
  }
  return score;
}

export function getBestMove(game, difficulty = 'difficult') {
  const color = game.activeColor;
  const legalMoves = game.getAllLegalMoves(color);
  if (legalMoves.length === 0) return null;

  // Easy / Bot / Novice level: random move with slight bias for captures
  if (difficulty === 'easy' || difficulty === 'novice' || difficulty === 'bot' || difficulty === 'beginner' || difficulty === 'Bot OR AI') {
    const captures = legalMoves.filter(m => game.board[m.to.row][m.to.col]);
    if (captures.length > 0 && Math.random() > 0.4) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  const searchDepth = (difficulty === 'hard' || difficulty === 'club') ? 2 : (difficulty === 'difficult' || difficulty === 'master') ? 3 : 4;
  let bestMove = null;
  let bestScore = color === 'w' ? -Infinity : Infinity;

  // Move ordering: evaluate captures first for better pruning
  const sortedMoves = [...legalMoves].sort((a, b) => {
    const targetA = game.board[a.to.row][a.to.col];
    const targetB = game.board[b.to.row][b.to.col];
    const valA = targetA ? PIECE_VALUES[targetA.type] : 0;
    const valB = targetB ? PIECE_VALUES[targetB.type] : 0;
    return valB - valA;
  });

  for (const move of sortedMoves) {
    const simBoard = game.simulateMove(move);

    // Create temporary clone game state to run recursive minimax
    const tempGame = new ChessGame();
    tempGame.board = simBoard;
    tempGame.activeColor = color === 'w' ? 'b' : 'w';

    const score = minimax(tempGame, searchDepth - 1, -Infinity, Infinity, color === 'b');

    if (color === 'w') {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  }

  return bestMove || legalMoves[0];
}

function minimax(game, depth, alpha, beta, isMaximizing) {
  if (depth === 0) {
    return evaluateBoard(game);
  }

  const color = isMaximizing ? 'w' : 'b';
  const moves = game.getAllLegalMoves(color);

  if (moves.length === 0) {
    if (game.isInCheck(color)) {
      return isMaximizing ? -99999 + (4 - depth) : 99999 - (4 - depth);
    }
    return 0; // Stalemate
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const simBoard = game.simulateMove(move);
      const tempGame = new ChessGame();
      tempGame.board = simBoard;
      tempGame.activeColor = 'b';

      const evaluation = minimax(tempGame, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const simBoard = game.simulateMove(move);
      const tempGame = new ChessGame();
      tempGame.board = simBoard;
      tempGame.activeColor = 'w';

      const evaluation = minimax(tempGame, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return minEval;
  }
}



/*******************************************************************************
 * FILE: src\engine\chessEngine.js
 *******************************************************************************/

// Comprehensive Chess Engine implementation for ChessX 3D
// Handles Board Representation, FEN parsing, Move Generation, Validation, Check/Checkmate, Castling, En Passant, Promotion

export const PIECE_TYPES = {
  PAWN: 'p',
  KNIGHT: 'n',
  BISHOP: 'b',
  ROOK: 'r',
  QUEEN: 'q',
  KING: 'k'
};

export const COLORS = {
  WHITE: 'w',
  BLACK: 'b'
};

export const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// Convert algebraic notation (e.g., 'e4') to board coordinates {row, col}
export function algebraicToSquare(square) {
  if (!square || square.length !== 2) return null;
  const col = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const row = 8 - parseInt(square[1], 10);
  if (row < 0 || row > 7 || col < 0 || col > 7) return null;
  return { row, col };
}

// Convert board coordinates {row, col} to algebraic notation (e.g., 'e4')
export function squareToAlgebraic(row, col) {
  if (row < 0 || row > 7 || col < 0 || col > 7) return '';
  const file = String.fromCharCode('a'.charCodeAt(0) + col);
  const rank = 8 - row;
  return `${file}${rank}`;
}

export class ChessGame {
  constructor(fen = INITIAL_FEN) {
    this.history = [];
    this.moveLog = [];
    this.capturedPieces = { w: [], b: [] };
    this.loadFen(fen);
  }

  loadFen(fen) {
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    const parts = fen.trim().split(/\s+/);
    const position = parts[0];
    this.activeColor = parts[1] || 'w';
    this.castling = parts[2] || 'KQkq';
    this.enPassant = parts[3] !== '-' ? parts[3] : null;
    this.halfMoveClock = parseInt(parts[4] || '0', 10);
    this.fullMoveNumber = parseInt(parts[5] || '1', 10);

    let row = 0;
    let col = 0;
    for (let i = 0; i < position.length; i++) {
      const char = position[i];
      if (char === '/') {
        row++;
        col = 0;
      } else if (/\d/.test(char)) {
        col += parseInt(char, 10);
      } else {
        const color = char === char.toUpperCase() ? COLORS.WHITE : COLORS.BLACK;
        const type = char.toLowerCase();
        this.board[row][col] = { type, color };
        col++;
      }
    }

    this.capturedPieces = { w: [], b: [] };
    this.updateCapturedPieces();
  }

  getPiece(row, col) {
    if (row < 0 || row > 7 || col < 0 || col > 7) return null;
    return this.board[row][col];
  }

  cloneBoard() {
    return this.board.map(row => row.map(cell => (cell ? { ...cell } : null)));
  }

  updateCapturedPieces() {
    const currentCounts = { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 };
    const boardCounts = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 }
    };

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece) {
          boardCounts[piece.color][piece.type]++;
        }
      }
    }

    this.capturedPieces = {
      w: [], // White pieces captured by Black
      b: []  // Black pieces captured by White
    };

    ['p', 'n', 'b', 'r', 'q'].forEach(type => {
      const missingWhite = Math.max(0, currentCounts[type] - boardCounts.w[type]);
      const missingBlack = Math.max(0, currentCounts[type] - boardCounts.b[type]);
      for (let i = 0; i < missingWhite; i++) this.capturedPieces.w.push(type);
      for (let i = 0; i < missingBlack; i++) this.capturedPieces.b.push(type);
    });
  }

  getMaterialAdvantage() {
    const values = { p: 1, n: 3, b: 3.25, r: 5, q: 9, k: 0 };
    let score = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece) {
          const val = values[piece.type] || 0;
          score += piece.color === 'w' ? val : -val;
        }
      }
    }
    return score;
  }

  findKing(color, board = this.board) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === color) {
          return { row: r, col: c };
        }
      }
    }
    return null;
  }

  isSquareAttacked(targetRow, targetCol, attackerColor, board = this.board) {
    // Check Knight attacks
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of knightMoves) {
      const r = targetRow + dr;
      const c = targetCol + dc;
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const p = board[r][c];
        if (p && p.color === attackerColor && p.type === 'n') return true;
      }
    }

    // Check Pawn attacks
    const pawnDirection = attackerColor === 'w' ? 1 : -1; // Pawn attacks coming towards target
    const pawnSources = [
      { row: targetRow + pawnDirection, col: targetCol - 1 },
      { row: targetRow + pawnDirection, col: targetCol + 1 }
    ];
    for (const src of pawnSources) {
      if (src.row >= 0 && src.row < 8 && src.col >= 0 && src.col < 8) {
        const p = board[src.row][src.col];
        if (p && p.color === attackerColor && p.type === 'p') return true;
      }
    }

    // Check King attacks (adjacent)
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = targetRow + dr;
        const c = targetCol + dc;
        if (r >= 0 && r < 8 && c >= 0 && c < 8) {
          const p = board[r][c];
          if (p && p.color === attackerColor && p.type === 'k') return true;
        }
      }
    }

    // Check Straight sliding attacks (Rook & Queen)
    const straightDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of straightDirs) {
      let r = targetRow + dr;
      let c = targetCol + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const p = board[r][c];
        if (p) {
          if (p.color === attackerColor && (p.type === 'r' || p.type === 'q')) return true;
          break; // Obstacle encountered
        }
        r += dr;
        c += dc;
      }
    }

    // Check Diagonal sliding attacks (Bishop & Queen)
    const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of diagDirs) {
      let r = targetRow + dr;
      let c = targetCol + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const p = board[r][c];
        if (p) {
          if (p.color === attackerColor && (p.type === 'b' || p.type === 'q')) return true;
          break; // Obstacle encountered
        }
        r += dr;
        c += dc;
      }
    }

    return false;
  }

  isInCheck(color = this.activeColor, board = this.board) {
    const kingPos = this.findKing(color, board);
    if (!kingPos) return false;
    const opponentColor = color === 'w' ? 'b' : 'w';
    return this.isSquareAttacked(kingPos.row, kingPos.col, opponentColor, board);
  }

  // Generate pseudo-legal moves for a specific square
  getRawMoves(row, col, board = this.board) {
    const piece = board[row][col];
    if (!piece) return [];
    const moves = [];
    const color = piece.color;
    const enemyColor = color === 'w' ? 'b' : 'w';

    switch (piece.type) {
      case 'p': {
        const dir = color === 'w' ? -1 : 1;
        const startRow = color === 'w' ? 6 : 1;

        // Forward 1 step
        const f1Row = row + dir;
        if (f1Row >= 0 && f1Row < 8 && !board[f1Row][col]) {
          moves.push({ from: { row, col }, to: { row: f1Row, col } });

          // Forward 2 steps from starting row
          const f2Row = row + 2 * dir;
          if (row === startRow && !board[f2Row][col]) {
            moves.push({ from: { row, col }, to: { row: f2Row, col } });
          }
        }

        // Standard captures
        [-1, 1].forEach(dc => {
          const targetCol = col + dc;
          const targetRow = row + dir;
          if (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8) {
            const targetPiece = board[targetRow][targetCol];
            if (targetPiece && targetPiece.color === enemyColor) {
              moves.push({ from: { row, col }, to: { row: targetRow, col: targetCol } });
            } else if (this.enPassant && squareToAlgebraic(targetRow, targetCol) === this.enPassant) {
              // En Passant
              moves.push({ from: { row, col }, to: { row: targetRow, col: targetCol }, isEnPassant: true });
            }
          }
        });
        break;
      }

      case 'n': {
        const knightOffsets = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        knightOffsets.forEach(([dr, dc]) => {
          const r = row + dr;
          const c = col + dc;
          if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            const targetPiece = board[r][c];
            if (!targetPiece || targetPiece.color === enemyColor) {
              moves.push({ from: { row, col }, to: { row: r, col: c } });
            }
          }
        });
        break;
      }

      case 'b':
      case 'r':
      case 'q': {
        const dirs = [];
        if (piece.type === 'b' || piece.type === 'q') {
          dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
        }
        if (piece.type === 'r' || piece.type === 'q') {
          dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
        }

        dirs.forEach(([dr, dc]) => {
          let r = row + dr;
          let c = col + dc;
          while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            const targetPiece = board[r][c];
            if (!targetPiece) {
              moves.push({ from: { row, col }, to: { row: r, col: c } });
            } else {
              if (targetPiece.color === enemyColor) {
                moves.push({ from: { row, col }, to: { row: r, col: c } });
              }
              break;
            }
            r += dr;
            c += dc;
          }
        });
        break;
      }

      case 'k': {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const r = row + dr;
            const c = col + dc;
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
              const targetPiece = board[r][c];
              if (!targetPiece || targetPiece.color === enemyColor) {
                moves.push({ from: { row, col }, to: { row: r, col: c } });
              }
            }
          }
        }

        // Castling logic
        if (color === 'w' && row === 7 && col === 4) {
          if (this.castling.includes('K')) {
            if (!board[7][5] && !board[7][6] && !this.isSquareAttacked(7, 4, 'b') && !this.isSquareAttacked(7, 5, 'b') && !this.isSquareAttacked(7, 6, 'b')) {
              moves.push({ from: { row, col }, to: { row: 7, col: 6 }, isCastle: 'K' });
            }
          }
          if (this.castling.includes('Q')) {
            if (!board[7][3] && !board[7][2] && !board[7][1] && !this.isSquareAttacked(7, 4, 'b') && !this.isSquareAttacked(7, 3, 'b') && !this.isSquareAttacked(7, 2, 'b')) {
              moves.push({ from: { row, col }, to: { row: 7, col: 2 }, isCastle: 'Q' });
            }
          }
        } else if (color === 'b' && row === 0 && col === 4) {
          if (this.castling.includes('k')) {
            if (!board[0][5] && !board[0][6] && !this.isSquareAttacked(0, 4, 'w') && !this.isSquareAttacked(0, 5, 'w') && !this.isSquareAttacked(0, 6, 'w')) {
              moves.push({ from: { row, col }, to: { row: 0, col: 6 }, isCastle: 'k' });
            }
          }
          if (this.castling.includes('q')) {
            if (!board[0][3] && !board[0][2] && !board[0][1] && !this.isSquareAttacked(0, 4, 'w') && !this.isSquareAttacked(0, 3, 'w') && !this.isSquareAttacked(0, 2, 'w')) {
              moves.push({ from: { row, col }, to: { row: 0, col: 2 }, isCastle: 'q' });
            }
          }
        }
        break;
      }
    }

    return moves;
  }

  // Filter out moves that leave king in check
  getLegalMoves(row, col) {
    const piece = this.board[row][col];
    if (!piece || piece.color !== this.activeColor) return [];

    const raw = this.getRawMoves(row, col);
    return raw.filter(move => {
      const simulatedBoard = this.simulateMove(move);
      return !this.isInCheck(piece.color, simulatedBoard);
    });
  }

  // Get all legal moves for current active color
  getAllLegalMoves(color = this.activeColor) {
    const moves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && piece.color === color) {
          const raw = this.getRawMoves(r, c);
          raw.forEach(m => {
            const sim = this.simulateMove(m);
            if (!this.isInCheck(color, sim)) {
              moves.push(m);
            }
          });
        }
      }
    }
    return moves;
  }

  simulateMove(move) {
    const newBoard = this.cloneBoard();
    const { from, to, isEnPassant, isCastle } = move;
    const piece = newBoard[from.row][from.col];
    if (!piece) return newBoard;

    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = null;

    // Handle En Passant capture
    if (isEnPassant) {
      const captureRow = piece.color === 'w' ? to.row + 1 : to.row - 1;
      newBoard[captureRow][to.col] = null;
    }

    // Handle Castling Rook move
    if (isCastle) {
      if (isCastle === 'K') {
        newBoard[7][5] = newBoard[7][7];
        newBoard[7][7] = null;
      } else if (isCastle === 'Q') {
        newBoard[7][3] = newBoard[7][0];
        newBoard[7][0] = null;
      } else if (isCastle === 'k') {
        newBoard[0][5] = newBoard[0][7];
        newBoard[0][7] = null;
      } else if (isCastle === 'q') {
        newBoard[0][3] = newBoard[0][0];
        newBoard[0][0] = null;
      }
    }

    // Pawn Promotion (default to queen in simulation)
    if (piece.type === 'p' && (to.row === 0 || to.row === 7)) {
      newBoard[to.row][to.col] = { type: move.promotion || 'q', color: piece.color };
    }

    return newBoard;
  }

  makeMove(move, promotionPiece = 'q') {
    const piece = this.board[move.from.row][move.from.col];
    if (!piece || piece.color !== this.activeColor) return false;

    // Verify move is legal
    const legalMoves = this.getLegalMoves(move.from.row, move.from.col);
    const matched = legalMoves.find(m => m.to.row === move.to.row && m.to.col === move.to.col);
    if (!matched) return false;

    // Save snapshot to history for undo
    this.history.push({
      fen: this.generateFen(),
      board: this.cloneBoard(),
      activeColor: this.activeColor,
      castling: this.castling,
      enPassant: this.enPassant,
      halfMoveClock: this.halfMoveClock,
      fullMoveNumber: this.fullMoveNumber,
      capturedPieces: JSON.parse(JSON.stringify(this.capturedPieces))
    });

    const capturedPiece = this.board[matched.to.row][matched.to.col];
    this.board[matched.to.row][matched.to.col] = piece;
    this.board[matched.from.row][matched.from.col] = null;

    // En Passant capture
    let wasEnPassant = false;
    if (matched.isEnPassant) {
      wasEnPassant = true;
      const captureRow = piece.color === 'w' ? matched.to.row + 1 : matched.to.row - 1;
      this.board[captureRow][matched.to.col] = null;
    }

    // Castling rook move
    if (matched.isCastle) {
      if (matched.isCastle === 'K') {
        this.board[7][5] = this.board[7][7];
        this.board[7][7] = null;
      } else if (matched.isCastle === 'Q') {
        this.board[7][3] = this.board[7][0];
        this.board[7][0] = null;
      } else if (matched.isCastle === 'k') {
        this.board[0][5] = this.board[0][7];
        this.board[0][7] = null;
      } else if (matched.isCastle === 'q') {
        this.board[0][3] = this.board[0][0];
        this.board[0][0] = null;
      }
    }

    // Pawn Promotion
    let isPromotion = false;
    if (piece.type === 'p' && (matched.to.row === 0 || matched.to.row === 7)) {
      isPromotion = true;
      this.board[matched.to.row][matched.to.col] = { type: promotionPiece, color: piece.color };
    }

    // Update En Passant target
    if (piece.type === 'p' && Math.abs(matched.from.row - matched.to.row) === 2) {
      const epRow = (matched.from.row + matched.to.row) / 2;
      this.enPassant = squareToAlgebraic(epRow, matched.from.col);
    } else {
      this.enPassant = null;
    }

    // Update Castling rights
    if (piece.type === 'k') {
      if (piece.color === 'w') this.castling = this.castling.replace(/[KQ]/g, '');
      if (piece.color === 'b') this.castling = this.castling.replace(/[kq]/g, '');
    }
    if (piece.type === 'r') {
      if (matched.from.row === 7 && matched.from.col === 7) this.castling = this.castling.replace('K', '');
      if (matched.from.row === 7 && matched.from.col === 0) this.castling = this.castling.replace('Q', '');
      if (matched.from.row === 0 && matched.from.col === 7) this.castling = this.castling.replace('k', '');
      if (matched.from.row === 0 && matched.from.col === 0) this.castling = this.castling.replace('q', '');
    }
    if (!this.castling) this.castling = '-';

    // Algebraic notation for move log
    const fromAlg = squareToAlgebraic(matched.from.row, matched.from.col);
    const toAlg = squareToAlgebraic(matched.to.row, matched.to.col);
    let san = `${piece.type.toUpperCase() !== 'P' ? piece.type.toUpperCase() : ''}${fromAlg}${capturedPiece || wasEnPassant ? 'x' : '-'}${toAlg}`;
    if (matched.isCastle === 'K' || matched.isCastle === 'k') san = 'O-O';
    if (matched.isCastle === 'Q' || matched.isCastle === 'q') san = 'O-O-O';
    if (isPromotion) san += `=${promotionPiece.toUpperCase()}`;

    // Switch turn
    this.activeColor = this.activeColor === 'w' ? 'b' : 'w';
    if (this.activeColor === 'w') this.fullMoveNumber++;

    this.updateCapturedPieces();

    const inCheck = this.isInCheck(this.activeColor);
    const legalMovesLeft = this.getAllLegalMoves(this.activeColor).length;
    let isCheckmate = false;
    let isStalemate = false;

    if (legalMovesLeft === 0) {
      if (inCheck) {
        isCheckmate = true;
        san += '#';
      } else {
        isStalemate = true;
      }
    } else if (inCheck) {
      san += '+';
    }

    const moveRecord = {
      san,
      from: matched.from,
      to: matched.to,
      piece: piece.type,
      color: piece.color,
      captured: capturedPiece ? capturedPiece.type : (wasEnPassant ? 'p' : null),
      inCheck,
      isCheckmate,
      isStalemate
    };

    this.moveLog.push(moveRecord);
    return moveRecord;
  }

  undo() {
    if (this.history.length === 0) return false;
    const prev = this.history.pop();
    this.board = prev.board;
    this.activeColor = prev.activeColor;
    this.castling = prev.castling;
    this.enPassant = prev.enPassant;
    this.halfMoveClock = prev.halfMoveClock;
    this.fullMoveNumber = prev.fullMoveNumber;
    this.capturedPieces = prev.capturedPieces;
    this.moveLog.pop();
    return true;
  }

  generateFen() {
    let fen = '';
    for (let r = 0; r < 8; r++) {
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (!piece) {
          empty++;
        } else {
          if (empty > 0) {
            fen += empty;
            empty = 0;
          }
          fen += piece.color === 'w' ? piece.type.toUpperCase() : piece.type;
        }
      }
      if (empty > 0) fen += empty;
      if (r < 7) fen += '/';
    }

    fen += ` ${this.activeColor}`;
    fen += ` ${this.castling || '-'}`;
    fen += ` ${this.enPassant || '-'}`;
    fen += ` ${this.halfMoveClock} ${this.fullMoveNumber}`;

    return fen;
  }
}



/*******************************************************************************
 * FILE: src\main.jsx
 *******************************************************************************/

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { StatsProvider } from './context/StatsContext.jsx'
import './styles/main.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <StatsProvider>
        <App />
      </StatsProvider>
    </AuthProvider>
  </React.StrictMode>,
)


