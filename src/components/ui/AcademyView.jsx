import React, { useState, useEffect } from 'react';
import { BookOpen, Award, Compass, ArrowRight, Play, CheckCircle2, RefreshCw } from 'lucide-react';
import { sounds } from '../../audio/soundSystem';

const LESSONS = [
  {
    id: 'basics',
    category: 'basics',
    title: 'Chess Board & Piece Movement',
    description: 'Learn how to set up the board, understand piece values, and execute legal moves.',
    difficulty: 'Beginner',
    time: '5 min',
    icon: <Compass size={20} />,
    color: '#00f0ff',
    content: `
      <h3>Welcome to the ChessX Academy!</h3>
      <p>Chess is played on an 8x8 grid of alternating light and dark squares. The bottom right square for each player must always be light ("white on right").</p>
      <br/>
      <h4>Piece Movements:</h4>
      <ul>
        <li><strong>Rook (5 Pts):</strong> Moves horizontally or vertically as far as desired.</li>
        <li><strong>Pawn (1 Pt):</strong> Moves forward 1 square (or 2 on its first move). Captures diagonally.</li>
      </ul>
      <br/>
      <h4>Your Checkup Task:</h4>
      <p>Click your <strong>White Rook</strong> and move it to capture the unprotected <strong>Black Pawn</strong> on the board below.</p>
    `,
    checkup: {
      prompt: 'Capture the unprotected Black Pawn with your Rook!',
      initialBoard: [
        ['', '', '', ''],
        ['bP', '', '', ''],
        ['', '', '', ''],
        ['wR', '', '', '']
      ],
      validMove: { from: { r: 3, c: 0 }, to: { r: 1, c: 0 } },
      symbols: { wR: '♖', bP: '♟' }
    }
  },
  {
    id: 'openings',
    category: 'openings',
    title: 'Golden Opening Principles',
    description: 'Master the first phase of the game: claim the center, develop pieces, and castle early.',
    difficulty: 'Beginner',
    time: '8 min',
    icon: <BookOpen size={20} />,
    color: '#22c55e',
    content: `
      <h3>Claim the Center</h3>
      <p>The e4 and d4 squares are crucial. Opening with a center pawn move claims space and releases your Bishop and Queen.</p>
      <br/>
      <h4>Your Checkup Task:</h4>
      <p>Click your <strong>e2 Pawn</strong> (middle-left) and advance it 2 squares forward to the <strong>e4 square</strong> to claim the center!</p>
    `,
    checkup: {
      prompt: 'Advance your e-Pawn two squares to establish center control!',
      initialBoard: [
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
        ['', 'wP', '', '']
      ],
      validMove: { from: { r: 3, c: 1 }, to: { r: 1, c: 1 } },
      symbols: { wP: '♙' }
    }
  },
  {
    id: 'tactics',
    category: 'tactics',
    title: 'Tactical Motifs: Forks & Pins',
    description: 'Learn to identify pins, forks, skewers, and double attacks to win opponent material.',
    difficulty: 'Intermediate',
    time: '10 min',
    icon: <Award size={20} />,
    color: '#ffd700',
    content: `
      <h3>The Knight Fork</h3>
      <p>A fork attacks two pieces at once. Knights are excellent for this because their L-shaped moves can bypass blockades.</p>
      <br/>
      <h4>Your Checkup Task:</h4>
      <p>Find the square where your <strong>White Knight</strong> can land to attack both the <strong>Black King</strong> and the <strong>Black Queen</strong> at the same time!</p>
    `,
    checkup: {
      prompt: 'Move your Knight to fork both the Black King and Queen!',
      initialBoard: [
        ['', 'bQ', '', 'bK'],
        ['', '', '', ''],
        ['', '', '', ''],
        ['wN', '', '', '']
      ],
      validMove: { from: { r: 3, c: 0 }, to: { r: 1, c: 2 } }, // L-shape to index (1,2) attacks (0,1) and (0,3)
      symbols: { wN: '♘', bK: '♚', bQ: '♛' }
    }
  },
  {
    id: 'endgames',
    category: 'endgames',
    title: 'Essential Endgame Checkmates',
    description: 'Learn standard mating patterns: King + Queen and King + Rook mates against a lone King.',
    difficulty: 'Intermediate',
    time: '12 min',
    icon: <Play size={20} />,
    color: '#ff3b00',
    content: `
      <h3>Rook Checkmate</h3>
      <p>Deliver mate by sealing the back rank. The White King on g6 traps the Black King, preventing escape.</p>
      <br/>
      <h4>Your Checkup Task:</h4>
      <p>Deliver checkmate by sliding your <strong>White Rook</strong> to the back rank, trapping the Black King in the corner!</p>
    `,
    checkup: {
      prompt: 'Deliver checkmate by moving your Rook to the back rank!',
      initialBoard: [
        ['', '', '', 'bK'],
        ['wR', '', '', ''],
        ['', '', 'wK', ''],
        ['', '', '', '']
      ],
      validMove: { from: { r: 1, c: 0 }, to: { r: 0, c: 0 } },
      symbols: { wR: '♖', wK: '♔', bK: '♚' }
    }
  },
  {
    id: 'knight_bishop',
    category: 'basics',
    title: 'Knight & Bishop Dynamics',
    description: 'Master close-combat Knights vs long-range Bishops and position them for maximum dominance.',
    difficulty: 'Beginner',
    time: '6 min',
    icon: <Compass size={20} />,
    color: '#00f0ff',
    content: `
      <h3>Knights vs. Bishops</h3>
      <p>Bishops excel on open diagonals and long ranges. Knights thrive in closed positions and excel at hopping over obstacles.</p>
      <br/>
      <h4>Your Checkup Task:</h4>
      <p>Move your <strong>White Bishop</strong> along the long light diagonal to pin the <strong>Black Rook</strong> against the Black King!</p>
    `,
    checkup: {
      prompt: 'Move your Bishop along the diagonal to pin the Black Rook!',
      initialBoard: [
        ['', '', '', 'bK'],
        ['', '', 'bR', ''],
        ['', '', '', ''],
        ['wB', '', '', '']
      ],
      validMove: { from: { r: 3, c: 0 }, to: { r: 1, c: 2 } },
      symbols: { wB: '♗', bR: '♜', bK: '♚' }
    }
  },
  {
    id: 'castling_safety',
    category: 'openings',
    title: 'Castling & King Safety',
    description: 'Protect your King early with Kingside or Queenside castling while activating your Rooks.',
    difficulty: 'Beginner',
    time: '7 min',
    icon: <BookOpen size={20} />,
    color: '#22c55e',
    content: `
      <h3>Shield Your King Early</h3>
      <p>Castling moves your King out of danger in the center and brings a Rook into active play near the center files.</p>
      <br/>
      <h4>Your Checkup Task:</h4>
      <p>Click your <strong>White King</strong> and castle 2 squares right to safety on the Kingside!</p>
    `,
    checkup: {
      prompt: 'Move your King two squares to the right to castle!',
      initialBoard: [
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
        ['wK', '', '', 'wR']
      ],
      validMove: { from: { r: 3, c: 0 }, to: { r: 3, c: 2 } },
      symbols: { wK: '♔', wR: '♖' }
    }
  },
  {
    id: 'discovered_attacks',
    category: 'tactics',
    title: 'Discovered Attacks & Skewers',
    description: 'Unleash hidden sniper attacks by moving an obstructing piece to deliver double threats.',
    difficulty: 'Intermediate',
    time: '9 min',
    icon: <Award size={20} />,
    color: '#ffd700',
    content: `
      <h3>Discovered Checks</h3>
      <p>A discovered attack occurs when one piece moves out of the line of sight of another piece, unleashing a hidden attack.</p>
      <br/>
      <h4>Your Checkup Task:</h4>
      <p>Move your <strong>White Knight</strong> out of the file to discover check on the Black King with your Queen!</p>
    `,
    checkup: {
      prompt: 'Move your Knight aside to unleash a discovered check with your Queen!',
      initialBoard: [
        ['', 'bK', '', ''],
        ['', '', '', ''],
        ['', 'wN', '', ''],
        ['', 'wQ', '', '']
      ],
      validMove: { from: { r: 2, c: 1 }, to: { r: 1, c: 3 } },
      symbols: { wN: '♘', wQ: '♕', bK: '♚' }
    }
  },
  {
    id: 'passed_pawns',
    category: 'tactics',
    title: 'Passed Pawns & Promotion',
    description: 'Create unstoppable passed pawns that can march freely to the 8th rank to become Queens.',
    difficulty: 'Intermediate',
    time: '8 min',
    icon: <Award size={20} />,
    color: '#a855f7',
    content: `
      <h3>The Passed Pawn</h3>
      <p>A passed pawn has no enemy pawns ahead of it on its file or adjacent files. It is a potential future Queen!</p>
      <br/>
      <h4>Your Checkup Task:</h4>
      <p>Push your passed <strong>White Pawn</strong> to the 8th rank to promote it into a Queen!</p>
    `,
    checkup: {
      prompt: 'Push your passed Pawn forward to the 8th rank to promote!',
      initialBoard: [
        ['', '', '', ''],
        ['', 'wP', '', ''],
        ['', '', '', ''],
        ['', '', '', '']
      ],
      validMove: { from: { r: 1, c: 1 }, to: { r: 0, c: 1 } },
      symbols: { wP: '♙' }
    }
  },
  {
    id: 'back_rank_mate',
    category: 'endgames',
    title: 'Back-Rank Checkmate Patterns',
    description: 'Exploit opponent Kings trapped behind their pawn wall on the 8th rank.',
    difficulty: 'Advanced',
    time: '10 min',
    icon: <Play size={20} />,
    color: '#ff3b00',
    content: `
      <h3>Back-Rank Vulnerability</h3>
      <p>When pawns block a King from stepping forward, a Rook or Queen on the back rank delivers instantaneous checkmate.</p>
      <br/>
      <h4>Your Checkup Task:</h4>
      <p>Infiltrate the 8th rank with your <strong>White Queen</strong> to deliver back-rank checkmate!</p>
    `,
    checkup: {
      prompt: 'Move your Queen to the 8th rank for a back-rank checkmate!',
      initialBoard: [
        ['bP', 'bP', 'bP', 'bK'],
        ['', '', '', ''],
        ['', 'wQ', '', ''],
        ['', '', '', '']
      ],
      validMove: { from: { r: 2, c: 1 }, to: { r: 0, c: 1 } },
      symbols: { wQ: '♕', bK: '♚', bP: '♟' }
    }
  },
  {
    id: 'endgame_opposition',
    category: 'endgames',
    title: 'King & Pawn Endgame: Opposition',
    description: 'Master King Opposition to outmaneuver the enemy King and escort your pawn safely.',
    difficulty: 'Advanced',
    time: '11 min',
    icon: <Play size={20} />,
    color: '#ff007f',
    content: `
      <h3>Key Squares & Opposition</h3>
      <p>Taking the Opposition means placing your King directly across from the enemy King with one square in between.</p>
      <br/>
      <h4>Your Checkup Task:</h4>
      <p>Step your <strong>White King</strong> directly in front of the Black King to take the Opposition!</p>
    `,
    checkup: {
      prompt: 'Move your King directly opposite the Black King to claim Opposition!',
      initialBoard: [
        ['', 'bK', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
        ['', 'wK', '', '']
      ],
      validMove: { from: { r: 3, c: 1 }, to: { r: 2, c: 1 } },
      symbols: { wK: '♔', bK: '♚' }
    }
  }
];

export function AcademyView() {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [filter, setFilter] = useState('all');
  const [completedLessons, setCompletedLessons] = useState([]);
  
  // Checkup game states
  const [checkupBoard, setCheckupBoard] = useState(null);
  const [selectedCheckupSq, setSelectedCheckupSq] = useState(null);
  const [checkupState, setCheckupState] = useState('read'); // 'read', 'play', 'success', 'fail'

  useEffect(() => {
    const saved = localStorage.getItem('chessx_completed_lessons');
    if (saved) {
      try {
        setCompletedLessons(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const filtered = filter === 'all'
    ? LESSONS
    : LESSONS.filter(l => l.category === filter);

  const openLesson = (lesson) => {
    sounds.playClick();
    setSelectedLesson(lesson);
    setCheckupState('read');
    setSelectedCheckupSq(null);
    if (lesson.checkup) {
      setCheckupBoard(lesson.checkup.initialBoard.map(row => [...row]));
    }
  };

  const closeLesson = () => {
    sounds.playClick();
    setSelectedLesson(null);
    setCheckupState('read');
  };

  const handleStartCheckup = () => {
    sounds.playClick();
    setCheckupState('play');
  };

  const handleSquareClick = (r, c) => {
    if (checkupState !== 'play') return;
    const lesson = selectedLesson;
    if (!lesson || !lesson.checkup) return;

    const piece = checkupBoard[r][c];
    if (selectedCheckupSq) {
      // Check if move matches valid checkup move
      const valid = lesson.checkup.validMove;
      if (selectedCheckupSq.r === valid.from.r && selectedCheckupSq.c === valid.from.c && r === valid.to.r && c === valid.to.c) {
        // Execute move on board visual
        const updatedBoard = checkupBoard.map(row => [...row]);
        updatedBoard[r][c] = updatedBoard[valid.from.r][valid.from.c];
        updatedBoard[valid.from.r][valid.from.c] = '';
        setCheckupBoard(updatedBoard);
        
        sounds.playCapture();
        sounds.playCheck();
        setCheckupState('success');

        // Mark as completed
        const nextCompleted = [...completedLessons];
        if (!nextCompleted.includes(lesson.id)) {
          nextCompleted.push(lesson.id);
          setCompletedLessons(nextCompleted);
          localStorage.setItem('chessx_completed_lessons', JSON.stringify(nextCompleted));
        }
      } else {
        sounds.playClick();
        setCheckupState('fail');
        setSelectedCheckupSq(null);
      }
    } else {
      if (piece && piece.startsWith('w')) {
        sounds.playClick();
        setSelectedCheckupSq({ r, c });
      }
    }
  };

  const handleRetryCheckup = () => {
    sounds.playClick();
    setCheckupState('play');
    setSelectedCheckupSq(null);
    if (selectedLesson && selectedLesson.checkup) {
      setCheckupBoard(selectedLesson.checkup.initialBoard.map(row => [...row]));
    }
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2.5rem 1.5rem',
      color: '#fff',
      position: 'relative',
      zIndex: 2
    }}>
      {/* Academy Header */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '2.8rem',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #fff 30%, var(--accent-dragonfruit-bright))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.6rem',
          fontFamily: 'var(--font-heading)'
        }}>
          ChessX Academy
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto', marginBottom: '1.5rem' }}>
          Master chess strategies, tactical motifs, openings, and endgame techniques to boost your ELO.
        </p>

        {/* Progress Tracker */}
        <div style={{
          maxWidth: '450px',
          margin: '0 auto',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '12px 20px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.85rem'
        }}>
          <span>Academy Progress:</span>
          <strong>{completedLessons.length} / {LESSONS.length} Lessons Completed</strong>
          <div style={{
            width: '100px',
            height: '6px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(completedLessons.length / LESSONS.length) * 100}%`,
              height: '100%',
              background: 'var(--accent-dragonfruit)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '2.5rem',
        flexWrap: 'wrap'
      }}>
        {['all', 'basics', 'openings', 'tactics', 'endgames'].map((cat) => (
          <button
            key={cat}
            onClick={() => { sounds.playClick(); setFilter(cat); }}
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              border: filter === cat ? '1px solid var(--accent-dragonfruit)' : '1px solid rgba(255,255,255,0.1)',
              background: filter === cat ? 'rgba(255, 59, 0, 0.22)' : 'rgba(255, 255, 255, 0.05)',
              color: filter === cat ? '#fff' : 'var(--text-dim)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s ease',
              boxShadow: filter === cat ? 'var(--shadow-dragonfruit)' : 'none'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lessons Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {filtered.map((lesson) => {
          const isCompleted = completedLessons.includes(lesson.id);
          return (
            <div
              key={lesson.id}
              onClick={() => openLesson(lesson)}
              className="glass-panel glass-panel-interactive"
              style={{
                padding: '1.8rem',
                borderRadius: '16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: isCompleted ? '1px solid #22c55e' : '1px solid rgba(255, 69, 0, 0.15)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Completed Ribbon */}
              {isCompleted && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  color: '#22c55e',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ✓ COMPLETED
                </div>
              )}

              {/* Top Row: Icon & Tag */}
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.2rem'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: `rgba(${lesson.color === '#00f0ff' ? '0,240,255' : lesson.color === '#22c55e' ? '34,197,94' : '255,59,0'}, 0.15)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: lesson.color
                  }}>
                    {lesson.icon}
                  </div>
                  {!isCompleted && (
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.08)',
                      color: 'var(--text-dim)'
                    }}>
                      {lesson.difficulty}
                    </span>
                  )}
                </div>

                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#fff',
                  marginBottom: '0.6rem',
                  fontFamily: 'var(--font-heading)'
                }}>
                  {lesson.title}
                </h3>
                <p style={{
                  color: 'var(--text-dim)',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  marginBottom: '1.5rem'
                }}>
                  {lesson.description}
                </p>
              </div>

              {/* Bottom Row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                paddingTop: '1rem',
                fontSize: '0.8rem',
                color: 'var(--text-dim)'
              }}>
                <span>⏱️ {lesson.time}</span>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: isCompleted ? '#22c55e' : lesson.color,
                  fontWeight: 600
                }}>
                  {isCompleted ? 'Review Lesson' : 'Start Lesson'} <ArrowRight size={14} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lesson Details & Checkup Modal */}
      {selectedLesson && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(10, 8, 18, 0.9)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '650px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '2.5rem',
            borderRadius: '20px',
            border: `1px solid ${selectedLesson.color}33`,
            boxShadow: `0 20px 60px ${selectedLesson.color}15`,
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={closeLesson}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.06)',
                border: 'none',
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              ✕
            </button>

            {/* Modal Title */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '1.5rem',
              color: selectedLesson.color
            }}>
              {selectedLesson.icon}
              <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {selectedLesson.category} • {selectedLesson.difficulty}
              </span>
            </div>

            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: 900,
              color: '#fff',
              marginBottom: '1.5rem',
              fontFamily: 'var(--font-heading)'
            }}>
              {selectedLesson.title}
            </h2>

            {checkupState === 'read' && (
              <>
                {/* Scrollable Content */}
                <div
                  className="lesson-content"
                  style={{
                    color: 'rgba(255,255,255,0.85)',
                    lineHeight: 1.7,
                    fontSize: '0.95rem'
                  }}
                  dangerouslySetInnerHTML={{ __html: selectedLesson.content }}
                />

                {/* Practice Checkup Start Button */}
                <button
                  onClick={handleStartCheckup}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    marginTop: '2rem',
                    background: `linear-gradient(135deg, ${selectedLesson.color} 0%, #111 100%)`,
                    boxShadow: `0 4px 18px ${selectedLesson.color}33`
                  }}
                >
                  🎯 Play Checkup Practice Game
                </button>
              </>
            )}

            {checkupState === 'play' && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-dim)', marginBottom: '1rem', fontWeight: 600 }}>
                  {selectedLesson.checkup?.prompt}
                </p>

                {/* 4x4 Miniature Board */}
                <div style={{
                  width: '260px',
                  height: '260px',
                  margin: '0 auto 1.5rem auto',
                  border: '4px solid #4a2e16',
                  borderRadius: '8px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)'
                }}>
                  {checkupBoard && checkupBoard.map((row, r) =>
                    row.map((piece, c) => {
                      const isLight = (r + c) % 2 === 0;
                      const isSelected = selectedCheckupSq && selectedCheckupSq.r === r && selectedCheckupSq.c === c;
                      
                      return (
                        <div
                          key={`${r}-${c}`}
                          onClick={() => handleSquareClick(r, c)}
                          style={{
                            background: isSelected
                              ? 'rgba(0, 240, 255, 0.6)'
                              : isLight ? '#e0c9a6' : '#8b5a2b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '2rem',
                            color: piece.startsWith('w') ? '#fff' : '#000',
                            textShadow: '1px 1px 3px rgba(0,0,0,0.5)'
                          }}
                        >
                          {selectedLesson.checkup?.symbols[piece] || ''}
                        </div>
                      );
                    })
                  )}
                </div>

                <button onClick={() => setCheckupState('read')} className="btn btn-secondary" style={{ width: '100%' }}>
                  Back to Lesson
                </button>
              </div>
            )}

            {checkupState === 'success' && (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                <h3 style={{ color: '#22c55e', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.8rem' }}>
                  Checkup Complete!
                </h3>
                <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>
                  You successfully executed the correct move and passed the checkup practice.
                </p>
                <button onClick={closeLesson} className="btn btn-success" style={{ width: '100%' }}>
                  ✓ Done
                </button>
              </div>
            )}

            {checkupState === 'fail' && (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                <h3 style={{ color: '#ff3b00', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.8rem' }}>
                  Incorrect Move
                </h3>
                <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>
                  That move was incorrect. Try again to demonstrate your understanding!
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleRetryCheckup} className="btn btn-primary" style={{ flex: 1 }}>
                    <RefreshCw size={14} /> Retry Checkup
                  </button>
                  <button onClick={() => setCheckupState('read')} className="btn btn-secondary" style={{ flex: 1 }}>
                    Read Lesson
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
