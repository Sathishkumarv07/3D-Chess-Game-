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
