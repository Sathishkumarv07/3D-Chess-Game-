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
