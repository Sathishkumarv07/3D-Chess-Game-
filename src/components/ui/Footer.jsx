import React from 'react';
import { sounds } from '../../audio/soundSystem';

export function Footer({ navigateTab }) {
  const handleNav = (tabName) => (e) => {
    e.preventDefault();
    sounds.playClick();
    if (navigateTab) {
      navigateTab(tabName);
    }
  };

  return (
    <footer style={{
      background: 'rgba(10, 8, 18, 0.95)',
      borderTop: '1px solid var(--border-glass-bright)',
      padding: '2.2rem 2rem 1.8rem 2rem',
      color: 'var(--text-dim)',
      fontSize: '0.88rem',
      position: 'relative',
      zIndex: 10,
      width: '100%',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1300px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '24px'
      }}>
        {/* Brand / Copyright */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.15rem',
            fontFamily: 'var(--font-heading)',
            marginBottom: '6px'
          }}>
            <span>👑</span> CHESS<span style={{ color: 'var(--accent-dragonfruit)' }}>X</span> 3D
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} ChessX 3D Platform. Master tactics &amp; play in real-time 3D.
          </div>
        </div>

        {/* Navigation Quick Links: Dashboard, Tutorials, Puzzles, Bot */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          <a
            href="#dashboard"
            onClick={handleNav('dashboard')}
            style={{ color: 'var(--text-dim)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
          >
            🏠 Dashboard
          </a>
          <a
            href="#tutorials"
            onClick={handleNav('academy')}
            style={{ color: 'var(--text-dim)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-dragonfruit-bright)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
          >
            🎓 Tutorials &amp; Academy
          </a>
          <a
            href="#worldtour"
            onClick={handleNav('worldtour')}
            style={{ color: 'var(--text-dim)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#00f0ff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
          >
            🌍 World Tour
          </a>
          <a
            href="#puzzles"
            onClick={handleNav('puzzles')}
            style={{ color: 'var(--text-dim)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#a855f7'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
          >
            🧩 Daily Puzzles
          </a>
          <a
            href="#bot"
            onClick={handleNav('game')}
            style={{ color: 'var(--text-dim)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#22c55e'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
          >
            🤖 Play vs Bot
          </a>
          <a
            href="#leaderboard"
            onClick={handleNav('leaderboard')}
            style={{ color: 'var(--text-dim)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
          >
            🏆 Leaderboard
          </a>
        </div>
      </div>
    </footer>
  );
}
