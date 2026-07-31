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
