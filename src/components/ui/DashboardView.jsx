import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Bot, Users, Globe, ChevronRight, Zap, Brain, Trophy,
  Clock, BarChart2, Puzzle, Tv2, Swords, BookOpen, Star, Flame
} from 'lucide-react';
import { sounds } from '../../audio/soundSystem';
import { InteractiveHeroBoard } from '../3d/InteractiveHeroBoard';
import { useAuth } from '../../context/AuthContext';
import { useStats } from '../../context/StatsContext';

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '', duration = 1800 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const step = target / (duration / 16);
          const timer = setInterval(() => {
            start = Math.min(start + step, target);
            setCount(Math.floor(start));
            if (start >= target) clearInterval(timer);
          }, 16);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

// ─── AI Difficulty Config ─────────────────────────────────────────────────────
const DIFFICULTIES = [
  {
    id: 'easy',
    label: 'Easy',
    subtitle: 'Beginner Friendly',
    emoji: '🌱',
    elo: '~800 ELO',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.3)',
  },
  {
    id: 'hard',
    label: 'Hard',
    subtitle: 'Intermediate Level',
    emoji: '⚔️',
    elo: '~1400 ELO',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.3)',
  },
  {
    id: 'difficult',
    label: 'Difficult',
    subtitle: 'Master Level AI',
    emoji: '👑',
    elo: '~1800 ELO',
    color: 'var(--accent-dragonfruit-bright)',
    bg: 'rgba(255,0,127,0.14)',
    border: 'rgba(255,0,127,0.4)',
  },
];

// ─── Time Controls ────────────────────────────────────────────────────────────
const TIME_OPTIONS = [
  { id: 'bullet1',  label: '1+0',   name: 'Bullet',   icon: '⚡' },
  { id: 'blitz3',   label: '3+2',   name: 'Blitz',    icon: '🔥' },
  { id: 'rapid10',  label: '10+0',  name: 'Rapid',    icon: '⏱️' },
  { id: 'unlim',    label: '∞',     name: 'Unlimited',icon: '🕰️' },
];

// ─── Feature Cards ────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: <Zap size={22} />,      title: 'Real-Time 3D Board',     desc: 'Powered by Three.js & React Three Fiber with physics-based animations', color: '#00f0ff' },
  { icon: <Brain size={22} />,    title: 'Advanced AI Engine',      desc: 'Minimax with Alpha-Beta pruning, PST tables & 3 difficulty levels',     color: '#ff007f' },
  { icon: <Puzzle size={22} />,   title: 'Daily Chess Puzzles',     desc: 'Sharpen your tactics with fresh puzzles updated every day',             color: '#a855f7' },
  { icon: <Clock size={22} />,    title: 'Time Controls',           desc: 'Bullet, Blitz, Rapid & Classical modes for every play style',           color: '#f59e0b' },
  { icon: <BarChart2 size={22} />,title: 'ELO Rating System',       desc: 'Standard ELO tracking with win/loss/draw statistics and history',       color: '#22c55e' },
  { icon: <Globe size={22} />,    title: 'Online Multiplayer',      desc: 'Private room codes to challenge friends in real-time 3D matches',       color: '#06b6d4' },
];

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function DashboardView({ startGameMode, openOnlineModal, boardTheme, bgEnvironment, lowSpecMode = false }) {
  const { user } = useAuth();
  const { stats } = useStats();

  const [selectedDiff, setSelectedDiff]         = useState('difficult');
  const [selectedTime, setSelectedTime]         = useState('rapid10');
  const [heroReady, setHeroReady]               = useState(false);

  const selectedDiffConfig = DIFFICULTIES.find(d => d.id === selectedDiff) || DIFFICULTIES[2];

  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 200);
    return () => clearTimeout(t);
  }, []);

  const totalGames = stats.wins + stats.losses + stats.draws;
  const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;

  return (
    <div style={{ padding: '0 3rem 3rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

      {/* ── Welcome Banner (logged-in users) ──────────────────────────── */}
      {user && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 20px', marginBottom: '1.2rem',
          background: 'rgba(255,0,127,0.07)',
          border: '1px solid rgba(255,0,127,0.18)',
          borderRadius: 'var(--radius-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.1rem' }}>👋</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Welcome back, <strong style={{ color: '#fff' }}>{user.name.split(' ')[0]}</strong>!
            </span>
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <span>⭐ ELO: <strong style={{ color: 'var(--accent-gold)' }}>{stats.elo}</strong></span>
            <span>🏆 Wins: <strong style={{ color: '#22c55e' }}>{stats.wins}</strong></span>
            {stats.streak > 1 && <span>🔥 Streak: <strong style={{ color: '#f59e0b' }}>{stats.streak}</strong></span>}
            <span>🎯 Win Rate: <strong style={{ color: '#fff' }}>{winRate}%</strong></span>
          </div>
        </div>
      )}

      {/* ── Hero Section (Unboxed Landing Layout) ────────────────────── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '520px',
          borderRadius: '24px',
          overflow: 'hidden',
          marginBottom: '2.5rem',
          background: 'radial-gradient(ellipse at top right, rgba(255, 0, 127, 0.14) 0%, rgba(15, 8, 30, 0) 70%), linear-gradient(180deg, rgba(15, 8, 30, 0.4) 0%, rgba(10, 5, 20, 0.8) 100%)',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <InteractiveHeroBoard theme={boardTheme} bgEnvironment={bgEnvironment} lowSpecMode={lowSpecMode} />

        {/* Hero overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(90deg, rgba(10, 5, 20, 0.88) 0%, rgba(10, 5, 20, 0.45) 50%, transparent 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '3rem 3.5rem',
        }}>
          <div style={{ maxWidth: '520px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,0,127,0.18)', border: '1px solid rgba(255,0,127,0.4)',
              borderRadius: '999px', padding: '5px 16px', marginBottom: '1.2rem',
              fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-dragonfruit-bright)',
              letterSpacing: '1px', textTransform: 'uppercase',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-dragonfruit)', boxShadow: '0 0 10px var(--accent-dragonfruit)', display: 'inline-block' }} />
              Next-Gen 3D Chess Platform
            </div>

            <h1 style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)', fontWeight: 900, lineHeight: 1.1,
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #ffffff 0%, #ff3399 60%, #9d4edd 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Play Chess in<br />Stunning 3D
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.8rem' }}>
              Challenge AI Bot, compete online with friends, or train your tactics with daily puzzles — all in a breathtaking 3D environment.
            </p>

            <div style={{ display: 'flex', gap: '14px', pointerEvents: 'auto', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                style={{ padding: '14px 32px', fontSize: '1rem', gap: '10px' }}
                onClick={() => { sounds.playClick(); startGameMode('ai', selectedDiff); }}
              >
                <Play size={18} fill="white" /> Play vs Bot
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: '14px 26px', fontSize: '0.98rem' }}
                onClick={() => { sounds.playClick(); startGameMode('spectate'); }}
              >
                <Tv2 size={16} /> Watch Live
              </button>
            </div>
          </div>
        </div>

        {/* Touch / Click hint */}
        <div style={{
          position: 'absolute', bottom: '16px', right: '22px',
          fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)',
          background: 'rgba(0,0,0,0.35)', padding: '5px 14px', borderRadius: '20px',
          backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.1)',
          pointerEvents: 'none',
        }}>
          ✨ Touch board to jump pieces!
        </div>
      </div>

      {/* ── Live Stats Bar ────────────────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1px', marginBottom: '2.5rem',
        background: 'var(--border-glass)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden', border: '1px solid var(--border-glass)',
      }}>
        {[
          { label: 'Active Players', value: 1247, suffix: '+', icon: '🟢', color: '#22c55e' },
          { label: 'Games Played Today', value: 48300, suffix: '+', icon: '♟️', color: 'var(--accent-dragonfruit-bright)' },
          { label: 'Chess Puzzles', value: 300, suffix: '+', icon: '🧩', color: '#a855f7' },
          { label: 'AI Difficulty Levels', value: 3, suffix: '', icon: '🤖', color: 'var(--accent-gold)' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'rgba(26,13,48,0.85)',
            padding: '1.1rem 1.4rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '4px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.5rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: stat.color }}>
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Game Modes ────────────────────────────────────────────────── */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Swords size={22} style={{ color: 'var(--accent-dragonfruit)' }} />
        Choose Your Battle
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
        gap: '1.5rem', marginBottom: '3rem',
      }}>

        {/* ── Card 1: Play vs AI ──────────────────────────────────────── */}
        <div className="glass-panel" style={{
          padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.2rem',
          border: `1px solid ${selectedDiffConfig.border}`,
          boxShadow: `0 0 30px ${selectedDiffConfig.bg}`,
          transition: 'all 0.3s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: selectedDiffConfig.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem',
            }}>
              {selectedDiffConfig.emoji}
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2px' }}>Play with Bot</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Challenge AI Bot in Easy, Hard, or Difficult mode</p>
            </div>
          </div>

          {/* Difficulty Selector */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px', fontWeight: 600 }}>
              Select Difficulty
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => { sounds.playClick(); setSelectedDiff(diff.id); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                    background: selectedDiff === diff.id ? diff.bg : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selectedDiff === diff.id ? diff.border : 'rgba(255,255,255,0.07)'}`,
                    color: selectedDiff === diff.id ? diff.color : 'var(--text-muted)',
                    fontFamily: 'var(--font-main)', fontWeight: 600, fontSize: '0.9rem',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>{diff.emoji}</span>
                    <span>
                      <strong>{diff.label}</strong>
                      <span style={{ fontSize: '0.75rem', fontWeight: 400, marginLeft: '6px', opacity: 0.7 }}>{diff.subtitle}</span>
                    </span>
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.85 }}>{diff.elo}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Control */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px', fontWeight: 600 }}>
              Time Control
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {TIME_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { sounds.playClick(); setSelectedTime(t.id); }}
                  title={t.name}
                  style={{
                    padding: '8px 4px', borderRadius: '8px', cursor: 'pointer',
                    background: selectedTime === t.id ? 'rgba(255,0,127,0.18)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${selectedTime === t.id ? 'var(--accent-dragonfruit)' : 'rgba(255,255,255,0.07)'}`,
                    color: selectedTime === t.id ? 'var(--accent-dragonfruit-bright)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '0.82rem',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px', fontSize: '0.95rem', marginTop: 'auto' }}
            onClick={() => { sounds.playClick(); startGameMode('ai', selectedDiff); }}
          >
            <Play size={16} fill="white" /> Play vs Bot ({selectedDiffConfig.label.toUpperCase()}) <ChevronRight size={16} />
          </button>
        </div>

        {/* ── Card 2: Online Multiplayer ──────────────────────────────── */}
        <div
          className="glass-panel glass-panel-interactive"
          style={{
            padding: '1.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            border: '1px solid rgba(6,182,212,0.35)',
          }}
        >
          <div>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'rgba(6,182,212,0.15)', color: '#06b6d4',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
            }}>
              <Globe size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>Online Multiplayer</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Create a private room or join a friend's match with a room code. Play real-time 3D chess from anywhere.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
              {['🔒 Private room codes', '⚡ Real-time gameplay', '🌍 Play from anywhere'].map((feat, i) => (
                <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #06b6d4, #0284c7)', boxShadow: '0 4px 18px rgba(6,182,212,0.4)' }}
            onClick={() => { sounds.playClick(); openOnlineModal(); }}
          >
            <Globe size={16} /> Create / Join Room <ChevronRight size={16} />
          </button>
        </div>

        {/* ── Card 3: Local 2-Player ──────────────────────────────────── */}
        <div
          className="glass-panel glass-panel-interactive"
          style={{
            padding: '1.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            border: '1px solid rgba(157,78,221,0.35)',
          }}
        >
          <div>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'rgba(157,78,221,0.18)', color: 'var(--accent-violet)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
            }}>
              <Users size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>Local 2-Player</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Pass & Play on the same screen. Take turns with a friend or family member using automatic board perspective switching.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
              {['🔄 Auto board-flip per turn', '📱 Same screen, two players', '🏠 No internet needed'].map((feat, i) => (
                <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            className="btn btn-secondary"
            style={{ width: '100%', padding: '13px', borderColor: 'var(--accent-violet)', color: 'var(--accent-violet)' }}
            onClick={() => { sounds.playClick(); startGameMode('pvp'); }}
          >
            <Users size={16} /> Start Pass &amp; Play <ChevronRight size={16} />
          </button>
        </div>

        {/* ── Card 4: Spectate AI vs AI ───────────────────────────────── */}
        <div
          className="glass-panel glass-panel-interactive"
          style={{
            padding: '1.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            border: '1px solid rgba(245,158,11,0.3)',
          }}
        >
          <div>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
            }}>
              <Tv2 size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>Watch AI Battle</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Sit back and watch two AI engines compete against each other. A great way to study openings and endgames.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
              {['🤖 AI vs AI spectate mode', '📚 Study openings & tactics', '⏯️ Watch in real-time'].map((feat, i) => (
                <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            className="btn btn-secondary"
            style={{ width: '100%', padding: '13px', borderColor: '#f59e0b', color: '#f59e0b' }}
            onClick={() => { sounds.playClick(); startGameMode('spectate'); }}
          >
            <Tv2 size={16} /> Watch Live Game <ChevronRight size={16} />
          </button>
        </div>

      </div>

      {/* ── Features Showcase ─────────────────────────────────────────── */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.4rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Star size={20} style={{ color: 'var(--accent-gold)' }} />
            Platform Features
          </h2>
          <div style={{
            fontSize: '0.75rem', color: 'var(--accent-dragonfruit)', fontWeight: 700,
            background: 'rgba(255,0,127,0.1)', border: '1px solid rgba(255,0,127,0.25)',
            borderRadius: '999px', padding: '3px 12px', textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>Free to Play</div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
          gap: '1rem',
        }}>
          {FEATURES.map((feat, i) => (
            <div
              key={i}
              className="glass-panel glass-panel-interactive"
              style={{ padding: '1.4rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                background: `${feat.color}18`,
                border: `1px solid ${feat.color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: feat.color,
              }}>
                {feat.icon}
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px' }}>{feat.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA Strip ─────────────────────────────────────────────────── */}
      <div style={{
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(255,0,127,0.15) 0%, rgba(157,78,221,0.15) 100%)',
        border: '1px solid rgba(255,0,127,0.3)',
        padding: '2rem 2.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px' }}>
            Ready to Play? <span style={{ color: 'var(--accent-dragonfruit)' }}>Challenge the Grandmaster AI</span>
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No sign-up required. Jump straight into a game and prove your skills!
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
          <button
            className="btn btn-primary"
            style={{ padding: '13px 28px', whiteSpace: 'nowrap' }}
            onClick={() => { sounds.playClick(); startGameMode('ai', 'difficult'); }}
          >
            <Flame size={16} /> Play Difficult Bot
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '13px 24px', whiteSpace: 'nowrap' }}
            onClick={() => { sounds.playClick(); startGameMode('ai', 'easy'); }}
          >
            🌱 Play Easy Bot
          </button>
        </div>
      </div>

    </div>
  );
}
