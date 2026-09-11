import React from 'react';
import { Settings, X, Volume2, Cpu, Palette, Sun, Compass, Flame, Zap } from 'lucide-react';
import { sounds } from '../../audio/soundSystem';

export function SettingsModal({
  isOpen,
  onClose,
  soundMuted,
  setSoundMuted,
  boardTheme,
  setBoardTheme,
  bgEnvironment = 'earth_sun',
  setBgEnvironment,
  isSunFlipped = false,
  setIsSunFlipped,
  isTorchOn = false,
  setIsTorchOn,
  lowSpecMode = false,
  setLowSpecMode,
  aiDifficulty,
  setAiDifficulty
}) {
  if (!isOpen) return null;

  const envOptions = [
    { id: 'earth_sun', name: '☀️ Sun & 3D Earth Atmosphere', desc: 'Solar flares & Earth horizon' },
    { id: 'red_theme', name: '🔴 Crimson Red Nebula', desc: 'Mars red atmosphere & star dust' },
    { id: 'tournament', name: '🏆 Grand Tournament Arena', desc: 'Oak hardwood floor & spotlights' },
    { id: 'cozy_lounge', name: '🪵 Cozy Wood Study', desc: 'Warm mahogany & fireplace glow' },
    { id: 'royal_palace', name: '🏰 Royal Marble Citadel', desc: 'Gold-rimmed marble pedestal' },
    { id: 'studio', name: '🎨 Minimalist Studio Lightbox', desc: 'Clean studio shadow plane' },
    { id: 'zen_garden', name: '🌿 Zen Stone Sanctuary', desc: 'Slate slab & emerald ambient' },
    { id: 'space', name: '🌌 Cosmic Deep Space', desc: 'Starfield & dragonfruit sparkles' },
  ];

  return (
    <div className="modal-backdrop">
      <div className="glass-panel modal-card" style={{ textAlign: 'left', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={22} color="var(--accent-dragonfruit-bright)" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Game Settings</h2>
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

        {/* ⚡ Performance & Graphics Mode */}
        <div style={{ marginBottom: '1.8rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '0.6rem', fontSize: '0.95rem' }}>
            <Zap size={18} color="#22c55e" /> Graphics & Performance Mode
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              className={`btn ${lowSpecMode ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '12px 14px',
                fontSize: '0.88rem',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '4px',
                background: lowSpecMode ? 'rgba(34, 197, 94, 0.2)' : '',
                borderColor: lowSpecMode ? '#22c55e' : '',
                color: lowSpecMode ? '#22c55e' : ''
              }}
              onClick={() => {
                sounds.playClick();
                if (setLowSpecMode) setLowSpecMode(true);
              }}
            >
              <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} fill="#22c55e" /> Fast Laptop Mode
              </span>
              <span style={{ fontSize: '0.74rem', opacity: 0.8, fontWeight: 400 }}>
                Low GPU, 0 lag, smooth 60fps
              </span>
            </button>

            <button
              className={`btn ${!lowSpecMode ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '12px 14px',
                fontSize: '0.88rem',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '4px',
                background: !lowSpecMode ? 'linear-gradient(135deg, var(--accent-dragonfruit), var(--accent-dragonfruit-bright))' : '',
                borderColor: !lowSpecMode ? 'var(--accent-dragonfruit)' : '',
                color: !lowSpecMode ? '#fff' : ''
              }}
              onClick={() => {
                sounds.playClick();
                if (setLowSpecMode) setLowSpecMode(false);
              }}
            >
              <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🌟</span> Ultra 3D Mode
              </span>
              <span style={{ fontSize: '0.74rem', opacity: 0.8, fontWeight: 400 }}>
                Full shadow maps & particles
              </span>
            </button>
          </div>
        </div>

        {/* 🔦 Torch Light Toggle */}
        <div style={{ marginBottom: '1.8rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '0.6rem', fontSize: '0.95rem' }}>
            <Flame size={18} color="#ffaa00" /> 3D Torch Light Mode
          </label>
          <div>
            <button
              className={`btn ${isTorchOn ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '0.88rem',
                justifyContent: 'center',
                background: isTorchOn ? 'linear-gradient(135deg, #ff7700, #ffaa00)' : '',
                borderColor: isTorchOn ? '#ffaa00' : ''
              }}
              onClick={() => {
                sounds.playClick();
                if (setIsTorchOn) setIsTorchOn(!isTorchOn);
              }}
            >
              <Flame size={16} color={isTorchOn ? '#fff' : '#ffaa00'} />
              <span>{isTorchOn ? 'Torch Light: ON' : 'Torch Light: OFF'}</span>
            </button>
          </div>
        </div>

        {/* 3D Background Environments */}
        <div style={{ marginBottom: '1.8rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '0.6rem', fontSize: '0.95rem' }}>
            <Compass size={18} color="var(--accent-dragonfruit-bright)" /> 3D Background Environment & Atmosphere
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {envOptions.map((env) => (
              <button
                key={env.id}
                className={`btn ${bgEnvironment === env.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  justifyContent: 'flex-start',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '10px 12px',
                  border: bgEnvironment === env.id ? '1px solid var(--accent-dragonfruit)' : '1px solid var(--border-glass)'
                }}
                onClick={() => {
                  sounds.playClick();
                  if (setBgEnvironment) setBgEnvironment(env.id);
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{env.name}</div>
                <div style={{ fontSize: '0.73rem', opacity: 0.75, fontWeight: 400, marginTop: '2px' }}>{env.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Board Colour Themes */}
        <div style={{ marginBottom: '1.8rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '0.6rem', fontSize: '0.95rem' }}>
            <Palette size={18} color="var(--accent-dragonfruit-bright)" /> Chess Board Colour Theme
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { id: 'normal_green', name: 'Normal Standard Green (Chess.com)', color: '#769656' },
              { id: 'brown', name: 'Classic Brown Wood (Entry Level)', color: '#b58863' },
              { id: 'walnut', name: 'Dark Walnut & Rosewood', color: '#5c3d2e' },
              { id: 'dragonfruit', name: 'Dragonfruit & Night Violet', color: '#ff007f' },
              { id: 'cyberpunk', name: 'Cyberpunk Neon', color: '#00f0ff' },
              { id: 'emerald', name: 'Emerald Crystal', color: '#2d6a4f' },
              { id: 'marble', name: 'Royal Gold & Marble', color: '#ffd700' },
              { id: 'ocean', name: 'Ocean Sapphire Blue', color: '#0369a1' },
              { id: 'charcoal', name: 'Onyx & Slate Charcoal', color: '#3f3f46' }
            ].map((themeItem) => (
              <button
                key={themeItem.id}
                className={`btn ${boardTheme === themeItem.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  justifyContent: 'flex-start',
                  padding: '10px 12px',
                  fontSize: '0.85rem',
                  border: boardTheme === themeItem.id ? '1px solid var(--accent-dragonfruit)' : '1px solid var(--border-glass)'
                }}
                onClick={() => {
                  sounds.playClick();
                  setBoardTheme(themeItem.id);
                }}
              >
                <span
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: themeItem.color,
                    display: 'inline-block',
                    flexShrink: 0
                  }}
                />
                {themeItem.name}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Volume */}
        <div style={{ marginBottom: '1.8rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
            <Volume2 size={18} color="var(--accent-dragonfruit-bright)" /> Audio Sound Effects
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className={`btn ${!soundMuted ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
              onClick={() => {
                setSoundMuted(false);
                sounds.setMuted(false);
                sounds.playClick();
              }}
            >
              Enabled
            </button>
            <button
              className={`btn ${soundMuted ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, background: soundMuted ? '#5a189a' : '' }}
              onClick={() => {
                setSoundMuted(true);
                sounds.setMuted(true);
              }}
            >
              Muted
            </button>
          </div>
        </div>

        {/* AI Engine Difficulty */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
            <Cpu size={18} color="var(--accent-dragonfruit-bright)" /> AI Engine Depth
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { id: 'easy', label: 'Easy' },
              { id: 'hard', label: 'Hard' },
              { id: 'difficult', label: 'Difficult' }
            ].map((diff) => (
              <button
                key={diff.id}
                className={`btn ${aiDifficulty === diff.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 4px', fontSize: '0.85rem' }}
                onClick={() => {
                  sounds.playClick();
                  setAiDifficulty(diff.id);
                }}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: '12px' }}
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
        >
          Save & Close
        </button>
      </div>
    </div>
  );
}
