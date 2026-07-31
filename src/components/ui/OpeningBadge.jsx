import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { detectOpening } from '../../data/openings';

export function OpeningBadge({ moveLog }) {
  const [opening, setOpening] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!moveLog || moveLog.length === 0) {
      setOpening(null);
      setVisible(false);
      return;
    }

    // Only check in the first 15 moves (opening phase)
    if (moveLog.length > 15) return;

    const sans = moveLog.map(m => m.san);
    const found = detectOpening(sans);

    if (found && found.name !== opening?.name) {
      setOpening(found);
      setVisible(true);
    }
  }, [moveLog]);

  if (!opening || !visible) return null;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        borderRadius: '20px',
        background: 'rgba(0,240,255,0.1)',
        border: '1px solid rgba(0,240,255,0.25)',
        color: '#00f0ff',
        fontSize: '0.78rem',
        fontWeight: 600,
        animation: 'openingFadeIn 0.4s ease',
        cursor: 'default',
        whiteSpace: 'nowrap',
      }}
      title={`ECO: ${opening.eco}`}
    >
      <style>{`
        @keyframes openingFadeIn {
          from { opacity:0; transform:translateY(4px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
      <BookOpen size={12} />
      {opening.name}
      <span style={{ opacity: 0.5, fontSize: '0.68rem', marginLeft: '2px' }}>{opening.eco}</span>
    </div>
  );
}
