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
