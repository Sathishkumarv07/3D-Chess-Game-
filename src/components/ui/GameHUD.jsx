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
        <div className="glass-panel hud-interactive" style={{ padding: '10px 16px', display: 'flex', gap: '12px' }}>
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
