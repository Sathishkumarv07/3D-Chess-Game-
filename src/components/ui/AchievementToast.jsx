import React, { useEffect, useState } from 'react';
import { useStats } from '../../context/StatsContext';

export function AchievementToast() {
  const { toastQueue, dismissToast } = useStats();
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    if (toastQueue.length === 0) return;
    const next = toastQueue[0];
    setVisible(v => {
      if (v.find(a => a.id === next.id)) return v;
      return [...v, next];
    });

    const timer = setTimeout(() => {
      setVisible(v => v.filter(a => a.id !== next.id));
      dismissToast(next.id);
    }, 4500);

    return () => clearTimeout(timer);
  }, [toastQueue, dismissToast]);

  if (visible.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      pointerEvents: 'none',
    }}>
      <style>{`
        @keyframes toastIn  { from { opacity:0; transform:translateX(60px) scale(0.9); } to { opacity:1; transform:translateX(0) scale(1); } }
        @keyframes toastOut { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(60px); } }
        .ach-toast { animation: toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1); }
      `}</style>
      {visible.map(ach => (
        <div
          key={ach.id}
          className="ach-toast"
          style={{
            background: 'linear-gradient(135deg, #1a1a3a, #12122a)',
            border: '1px solid rgba(255,215,0,0.4)',
            borderRadius: '14px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            minWidth: '280px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,215,0,0.1)',
            pointerEvents: 'all',
          }}
        >
          {/* Icon glow */}
          <div style={{
            width: '46px', height: '46px', borderRadius: '12px',
            background: 'rgba(255,215,0,0.15)',
            border: '1px solid rgba(255,215,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', flexShrink: 0,
          }}>
            {ach.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.7rem', color: '#ffd700', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '2px' }}>
              🏅 ACHIEVEMENT UNLOCKED
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', marginBottom: '2px' }}>
              {ach.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
              {ach.description}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#7dff8c', marginTop: '4px', fontWeight: 700 }}>
              +{ach.xp} XP earned
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
