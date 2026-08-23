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
