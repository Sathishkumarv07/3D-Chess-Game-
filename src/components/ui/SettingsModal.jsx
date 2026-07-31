import React from 'react';
import { Settings, X, Volume2, Cpu, Palette } from 'lucide-react';
import { sounds } from '../../audio/soundSystem';

export function SettingsModal({
  isOpen,
  onClose,
  soundMuted,
  setSoundMuted,
  boardTheme,
  setBoardTheme,
  aiDifficulty,
  setAiDifficulty
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="glass-panel modal-card" style={{ textAlign: 'left' }}>
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
