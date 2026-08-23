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
