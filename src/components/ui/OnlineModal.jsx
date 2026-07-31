import React, { useState } from 'react';
import { Globe, Copy, Check, Users, Play, X } from 'lucide-react';
import { sounds } from '../../audio/soundSystem';

export function OnlineModal({ isOpen, onClose, onStartOnlineGame }) {
  const [roomCode, setRoomCode] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    sounds.playClick();
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinRoom = () => {
    if (!inputCode.trim()) return;
    sounds.playClick();
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      onStartOnlineGame(inputCode.toUpperCase());
    }, 1200);
  };

  const handleCreateRoom = () => {
    sounds.playClick();
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      onStartOnlineGame(roomCode);
    }, 1200);
  };

  return (
    <div className="modal-backdrop">
      <div className="glass-panel modal-card" style={{ maxWidth: '520px', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe size={24} color="var(--accent-dragonfruit-bright)" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Play with Online Friends</h2>
          </div>
          <button
            className="btn btn-secondary btn-icon"
            style={{ width: '32px', height: '32px' }}
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
          >
            <X size={18} />
          </button>
        </div>

        {isSearching ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                border: '3px solid var(--accent-dragonfruit)',
                borderTopColor: 'transparent',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1.5rem auto'
              }}
            />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem' }}>Connecting to Match Lobby...</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Preparing 3D arena session for room #{roomCode}</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div>
            {/* Create Room Box */}
            <div
              style={{
                background: 'rgba(255, 0, 127, 0.08)',
                border: '1px solid var(--border-glass-bright)',
                borderRadius: '12px',
                padding: '1.4rem',
                marginBottom: '1.5rem'
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--accent-dragonfruit-bright)' }}>
                1. Host a Private Match
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1rem' }}>
                Share this room code with your friend to play remotely:
              </p>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div
                  style={{
                    flex: 1,
                    background: 'rgba(11, 5, 23, 0.8)',
                    border: '1px solid var(--accent-dragonfruit)',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    letterSpacing: '3px',
                    color: '#fff',
                    textAlign: 'center'
                  }}
                >
                  {roomCode}
                </div>

                <button className="btn btn-secondary" onClick={handleCopyCode}>
                  {copied ? <Check size={18} color="#00ff88" /> : <Copy size={18} />} {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1.2rem', padding: '12px' }}
                onClick={handleCreateRoom}
              >
                <Users size={18} /> Host Match & Enter Arena
              </button>
            </div>

            {/* Join Room Box */}
            <div
              style={{
                background: 'rgba(157, 78, 221, 0.08)',
                border: '1px solid rgba(157, 78, 221, 0.3)',
                borderRadius: '12px',
                padding: '1.4rem'
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--accent-violet)' }}>
                2. Join Friend's Room
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1rem' }}>
                Enter your friend's invite code to join their game:
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Enter Code (e.g. AB12CD)"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(11, 5, 23, 0.8)',
                    border: '1px solid var(--border-glass)',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />

                <button
                  className="btn btn-secondary"
                  style={{ background: 'var(--accent-violet)', borderColor: 'var(--accent-violet)' }}
                  onClick={handleJoinRoom}
                >
                  <Play size={18} /> Join Match
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
