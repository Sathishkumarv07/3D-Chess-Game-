import React, { useEffect, useRef } from 'react';

/**
 * Vertical evaluation bar — shows advantage balance.
 * eval: positive = white advantage, negative = black advantage.
 * Range capped at ±10 pawns.
 */
export function EvalBar({ evaluation = 0 }) {
  const MAX = 10;
  const clamped = Math.max(-MAX, Math.min(MAX, evaluation));
  // White portion: 50% = equal; 100% = white totally winning
  const whitePct = ((clamped + MAX) / (MAX * 2)) * 100;
  const showEval = Math.abs(evaluation).toFixed(1);

  return (
    <div style={{
      width: '22px',
      height: '100%',
      minHeight: '300px',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '6px',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.1)',
      position: 'relative',
      cursor: 'default',
    }}
    title={`Evaluation: ${evaluation >= 0 ? '+' : ''}${showEval}`}
    >
      {/* Black portion (top) */}
      <div style={{
        flex: `0 0 ${100 - whitePct}%`,
        background: 'linear-gradient(180deg, #1a1a2e 0%, #2d2d4e 100%)',
        transition: 'flex 0.4s ease',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '4px',
      }}>
        {evaluation < -1 && (
          <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono, monospace', writingMode: 'vertical-rl', lineHeight: 1 }}>
            {showEval}
          </span>
        )}
      </div>

      {/* White portion (bottom) */}
      <div style={{
        flex: `0 0 ${whitePct}%`,
        background: 'linear-gradient(180deg, #e8e8e8 0%, #ffffff 100%)',
        transition: 'flex 0.4s ease',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: '4px',
      }}>
        {evaluation > 1 && (
          <span style={{ fontSize: '0.55rem', color: 'rgba(0,0,0,0.6)', fontFamily: 'JetBrains Mono, monospace', writingMode: 'vertical-rl', lineHeight: 1 }}>
            {showEval}
          </span>
        )}
      </div>

      {/* Center line */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: '1px',
        background: 'rgba(255,100,100,0.4)',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}
