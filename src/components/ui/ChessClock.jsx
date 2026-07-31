import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, Zap } from 'lucide-react';

export const TIME_CONTROLS = [
  { id: 'bullet1',  label: 'Bullet',  time: 60,   increment: 0,  icon: '⚡', desc: '1+0' },
  { id: 'bullet2',  label: 'Bullet',  time: 120,  increment: 1,  icon: '⚡', desc: '2+1' },
  { id: 'blitz3',   label: 'Blitz',   time: 180,  increment: 2,  icon: '🔥', desc: '3+2' },
  { id: 'blitz5',   label: 'Blitz',   time: 300,  increment: 0,  icon: '🔥', desc: '5+0' },
  { id: 'rapid10',  label: 'Rapid',   time: 600,  increment: 0,  icon: '⏱️', desc: '10+0' },
  { id: 'rapid15',  label: 'Rapid',   time: 900,  increment: 10, icon: '⏱️', desc: '15+10' },
  { id: 'classical',label: 'Classic', time: 1800, increment: 0,  icon: '🏛️', desc: '30+0' },
  { id: 'unlimited',label: 'Free',    time: null,  increment: 0,  icon: '∞',  desc: '∞' },
];

function fmt(sec) {
  if (sec === null) return '∞';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export function ChessClock({ activeColor, isGameOver, increment = 0, initialTime = 300, onTimeOut }) {
  const [wTime, setWTime] = useState(initialTime);
  const [bTime, setBTime] = useState(initialTime);
  const intervalRef = useRef(null);
  const timeoutFiredRef = useRef(false);

  // Reset when a new game starts
  useEffect(() => {
    setWTime(initialTime);
    setBTime(initialTime);
    timeoutFiredRef.current = false;
  }, [initialTime]);

  // Add increment after each move (when turn changes)
  const prevColorRef = useRef(activeColor);
  useEffect(() => {
    if (initialTime === null) return;
    if (prevColorRef.current !== activeColor && increment > 0) {
      // Add increment to the player who just moved
      if (activeColor === 'b') {
        setWTime(t => t + increment);
      } else {
        setBTime(t => t + increment);
      }
    }
    prevColorRef.current = activeColor;
  }, [activeColor, increment, initialTime]);

  useEffect(() => {
    if (isGameOver || initialTime === null) return;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (activeColor === 'w') {
        setWTime(t => {
          if (t <= 1 && !timeoutFiredRef.current) {
            timeoutFiredRef.current = true;
            clearInterval(intervalRef.current);
            onTimeOut?.('w');
            return 0;
          }
          return Math.max(0, t - 1);
        });
      } else {
        setBTime(t => {
          if (t <= 1 && !timeoutFiredRef.current) {
            timeoutFiredRef.current = true;
            clearInterval(intervalRef.current);
            onTimeOut?.('b');
            return 0;
          }
          return Math.max(0, t - 1);
        });
      }
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [activeColor, isGameOver, initialTime, onTimeOut]);

  if (initialTime === null) return null;

  const wLow = wTime <= 10;
  const bLow = bTime <= 10;

  const clockStyle = (isActive, isLow) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '10px',
    background: isActive
      ? isLow ? 'rgba(255,50,50,0.3)' : 'rgba(255,215,0,0.15)'
      : 'rgba(255,255,255,0.05)',
    border: `1px solid ${isActive ? (isLow ? 'rgba(255,50,50,0.6)' : 'rgba(255,215,0,0.4)') : 'rgba(255,255,255,0.08)'}`,
    transition: 'all 0.3s',
    minWidth: '90px',
    justifyContent: 'center',
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {/* White clock */}
      <div style={clockStyle(activeColor === 'w', wLow)}>
        <Clock size={13} style={{ color: wLow && activeColor==='w' ? '#ff5555' : 'rgba(255,255,255,0.5)' }} />
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 700,
          fontSize: '1.1rem',
          color: wLow && activeColor==='w' ? '#ff5555' : activeColor==='w' ? '#ffd700' : 'rgba(255,255,255,0.5)',
          animation: wLow && activeColor==='w' ? 'pulse 1s infinite' : 'none',
        }}>
          {fmt(wTime)}
        </span>
      </div>

      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '1rem' }}>vs</span>

      {/* Black clock */}
      <div style={clockStyle(activeColor === 'b', bLow)}>
        <Clock size={13} style={{ color: bLow && activeColor==='b' ? '#ff5555' : 'rgba(255,255,255,0.5)' }} />
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 700,
          fontSize: '1.1rem',
          color: bLow && activeColor==='b' ? '#ff5555' : activeColor==='b' ? '#ffd700' : 'rgba(255,255,255,0.5)',
          animation: bLow && activeColor==='b' ? 'pulse 1s infinite' : 'none',
        }}>
          {fmt(bTime)}
        </span>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

export function TimeControlPicker({ selected, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {TIME_CONTROLS.map(tc => (
        <button
          key={tc.id}
          onClick={() => onChange(tc)}
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            border: `1px solid ${selected?.id === tc.id ? 'rgba(255,215,0,0.6)' : 'rgba(255,255,255,0.1)'}`,
            background: selected?.id === tc.id ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.04)',
            color: selected?.id === tc.id ? '#ffd700' : 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 600,
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            minWidth: '64px',
          }}
        >
          <span style={{ fontSize: '1rem' }}>{tc.icon}</span>
          <span>{tc.label}</span>
          <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{tc.desc}</span>
        </button>
      ))}
    </div>
  );
}
