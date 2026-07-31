// Opening database — matched by move SAN sequence prefix
// Format: { moves: ['e4','e5','Nf3',...], name: 'Opening Name', eco: 'C60' }

export const OPENINGS = [
  // ── King's Pawn ─────────────────────────────────────────────────────────────
  { moves: ['e4'], name: "King's Pawn Opening", eco: 'B00' },
  { moves: ['e4','e5'], name: "Open Game", eco: 'C20' },
  { moves: ['e4','e5','Nf3'], name: "King's Knight Opening", eco: 'C40' },
  { moves: ['e4','e5','Nf3','Nc6'], name: "Two Knights Defense", eco: 'C55' },
  { moves: ['e4','e5','Nf3','Nc6','Bb5'], name: "Ruy López", eco: 'C60' },
  { moves: ['e4','e5','Nf3','Nc6','Bc4'], name: "Italian Game", eco: 'C50' },
  { moves: ['e4','e5','Nf3','Nc6','Bc4','Bc5'], name: "Giuoco Piano", eco: 'C54' },
  { moves: ['e4','e5','Nf3','Nc6','d4'], name: "Scotch Game", eco: 'C45' },
  { moves: ['e4','e5','Nf3','Nc6','d4','exd4'], name: "Scotch Game", eco: 'C45' },
  { moves: ['e4','e5','f4'], name: "King's Gambit", eco: 'C33' },
  { moves: ['e4','e5','f4','exf4'], name: "King's Gambit Accepted", eco: 'C34' },
  { moves: ['e4','e5','Nf3','f6'], name: "Damiano Defense", eco: 'C40' },
  { moves: ['e4','e5','Nf3','d6'], name: "Philidor Defense", eco: 'C41' },
  { moves: ['e4','e5','Nf3','Nf6'], name: "Petrov's Defense", eco: 'C42' },

  // ── Sicilian Defense ────────────────────────────────────────────────────────
  { moves: ['e4','c5'], name: "Sicilian Defense", eco: 'B20' },
  { moves: ['e4','c5','Nf3'], name: "Sicilian Defense", eco: 'B40' },
  { moves: ['e4','c5','Nf3','d6'], name: "Sicilian, Najdorf Variation", eco: 'B90' },
  { moves: ['e4','c5','Nf3','d6','d4','cxd4','Nxd4','Nf6','Nc3','a6'], name: "Sicilian Najdorf", eco: 'B90' },
  { moves: ['e4','c5','Nf3','Nc6'], name: "Sicilian, Classical Variation", eco: 'B56' },
  { moves: ['e4','c5','Nf3','e6'], name: "Sicilian, Scheveningen", eco: 'B80' },
  { moves: ['e4','c5','c3'], name: "Sicilian, Alapin Variation", eco: 'B22' },
  { moves: ['e4','c5','Nc3'], name: "Sicilian, Closed Variation", eco: 'B23' },

  // ── French Defense ──────────────────────────────────────────────────────────
  { moves: ['e4','e6'], name: "French Defense", eco: 'C00' },
  { moves: ['e4','e6','d4','d5'], name: "French Defense", eco: 'C01' },
  { moves: ['e4','e6','d4','d5','Nc3'], name: "French, Classical Variation", eco: 'C14' },
  { moves: ['e4','e6','d4','d5','e5'], name: "French, Advance Variation", eco: 'C02' },
  { moves: ['e4','e6','d4','d5','exd5'], name: "French, Exchange Variation", eco: 'C01' },

  // ── Caro-Kann ───────────────────────────────────────────────────────────────
  { moves: ['e4','c6'], name: "Caro-Kann Defense", eco: 'B10' },
  { moves: ['e4','c6','d4','d5'], name: "Caro-Kann Defense", eco: 'B12' },
  { moves: ['e4','c6','d4','d5','Nc3'], name: "Caro-Kann, Classical Variation", eco: 'B18' },

  // ── Queen's Pawn ────────────────────────────────────────────────────────────
  { moves: ['d4'], name: "Queen's Pawn Opening", eco: 'A40' },
  { moves: ['d4','d5'], name: "Closed Game", eco: 'D00' },
  { moves: ['d4','d5','c4'], name: "Queen's Gambit", eco: 'D06' },
  { moves: ['d4','d5','c4','dxc4'], name: "Queen's Gambit Accepted", eco: 'D20' },
  { moves: ['d4','d5','c4','e6'], name: "Queen's Gambit Declined", eco: 'D30' },
  { moves: ['d4','d5','c4','c6'], name: "Slav Defense", eco: 'D10' },
  { moves: ['d4','Nf6'], name: "Indian Defense", eco: 'A45' },
  { moves: ['d4','Nf6','c4','g6'], name: "King's Indian Defense", eco: 'E60' },
  { moves: ['d4','Nf6','c4','e6'], name: "Nimzo-Indian Defense", eco: 'E20' },
  { moves: ['d4','Nf6','c4','e6','Nf3','b6'], name: "Queen's Indian Defense", eco: 'E12' },
  { moves: ['d4','Nf6','c4','c5'], name: "Benoni Defense", eco: 'A60' },

  // ── English / Réti ──────────────────────────────────────────────────────────
  { moves: ['c4'], name: "English Opening", eco: 'A10' },
  { moves: ['c4','e5'], name: "English, King's English Variation", eco: 'A20' },
  { moves: ['Nf3'], name: "Réti Opening", eco: 'A04' },
  { moves: ['Nf3','d5','c4'], name: "Réti Opening", eco: 'A09' },

  // ── Dutch / Bird ────────────────────────────────────────────────────────────
  { moves: ['d4','f5'], name: "Dutch Defense", eco: 'A80' },
  { moves: ['f4'], name: "Bird's Opening", eco: 'A02' },

  // ── Unusual ─────────────────────────────────────────────────────────────────
  { moves: ['b4'], name: "Polish Opening", eco: 'A00' },
  { moves: ['g4'], name: "Grob's Attack", eco: 'A00' },
  { moves: ['e4','d5'], name: "Scandinavian Defense", eco: 'B01' },
  { moves: ['e4','d5','exd5','Qxd5'], name: "Scandinavian, Main Line", eco: 'B01' },
];

/**
 * Detect the opening from a sequence of SAN moves.
 * Returns the best (longest) match, or null if no match.
 */
export function detectOpening(sanMoves) {
  if (!sanMoves || sanMoves.length === 0) return null;
  let best = null;
  for (const opening of OPENINGS) {
    if (opening.moves.length > sanMoves.length) continue;
    const match = opening.moves.every((m, i) => m === sanMoves[i]);
    if (match) {
      if (!best || opening.moves.length > best.moves.length) {
        best = opening;
      }
    }
  }
  return best;
}
