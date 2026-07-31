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
