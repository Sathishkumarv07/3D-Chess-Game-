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
        
        {activeTab !== 'game' && <Footer navigateTab={navigateTab} />}
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
