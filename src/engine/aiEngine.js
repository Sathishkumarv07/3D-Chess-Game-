// Minimax AI Engine with Alpha-Beta Pruning and Piece-Square Tables (PST)

const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Piece-Square Tables (PST) for White (Flipped for Black)
const PAWN_PST = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [ 5,  5, 10, 27, 27, 10,  5,  5],
  [ 0,  0,  0, 25, 25,  0,  0,  0],
  [ 5, -5,-10,  0,  0,-10, -5,  5],
  [ 5, 10, 10,-20,-20, 10, 10,  5],
  [ 0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_PST = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_PST = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_PST = [
  [ 0,  0,  0,  0,  0,  0,  0,  0],
  [ 5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [ 0,  0,  0,  5,  5,  0,  0,  0]
];

const QUEEN_PST = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [ -5,  0,  5,  5,  5,  5,  0, -5],
  [  0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_MIDGAME_PST = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [ 20, 20,  0,  0,  0,  0, 20, 20],
  [ 20, 30, 10,  0,  0, 10, 30, 20]
];

function getPiecePst(type, row, col, color) {
  const r = color === 'w' ? row : 7 - row;
  switch (type) {
    case 'p': return PAWN_PST[r][col];
    case 'n': return KNIGHT_PST[r][col];
    case 'b': return BISHOP_PST[r][col];
    case 'r': return ROOK_PST[r][col];
    case 'q': return QUEEN_PST[r][col];
    case 'k': return KING_MIDGAME_PST[r][col];
    default: return 0;
  }
}

export function evaluateBoard(game) {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = game.board[r][c];
      if (piece) {
        const val = PIECE_VALUES[piece.type] + getPiecePst(piece.type, r, c, piece.color);
        score += piece.color === 'w' ? val : -val;
      }
    }
  }
  return score;
}

export function getBestMove(game, difficulty = 'difficult') {
  const color = game.activeColor;
  const legalMoves = game.getAllLegalMoves(color);
  if (legalMoves.length === 0) return null;

  // Easy / Bot / Novice level: random move with slight bias for captures
  if (difficulty === 'easy' || difficulty === 'novice' || difficulty === 'bot' || difficulty === 'beginner' || difficulty === 'Bot OR AI') {
    const captures = legalMoves.filter(m => game.board[m.to.row][m.to.col]);
    if (captures.length > 0 && Math.random() > 0.4) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  const searchDepth = (difficulty === 'hard' || difficulty === 'club') ? 2 : (difficulty === 'difficult' || difficulty === 'master') ? 3 : 4;
  let bestMove = null;
  let bestScore = color === 'w' ? -Infinity : Infinity;

  // Move ordering: evaluate captures first for better pruning
  const sortedMoves = [...legalMoves].sort((a, b) => {
    const targetA = game.board[a.to.row][a.to.col];
    const targetB = game.board[b.to.row][b.to.col];
    const valA = targetA ? PIECE_VALUES[targetA.type] : 0;
    const valB = targetB ? PIECE_VALUES[targetB.type] : 0;
    return valB - valA;
  });

  for (const move of sortedMoves) {
    const simBoard = game.simulateMove(move);

    // Create temporary clone game state to run recursive minimax
    const tempGame = new ChessGame();
    tempGame.board = simBoard;
    tempGame.activeColor = color === 'w' ? 'b' : 'w';

    const score = minimax(tempGame, searchDepth - 1, -Infinity, Infinity, color === 'b');

    if (color === 'w') {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  }

  return bestMove || legalMoves[0];
}

function minimax(game, depth, alpha, beta, isMaximizing) {
  if (depth === 0) {
    return evaluateBoard(game);
  }

  const color = isMaximizing ? 'w' : 'b';
  const moves = game.getAllLegalMoves(color);

  if (moves.length === 0) {
    if (game.isInCheck(color)) {
      return isMaximizing ? -99999 + (4 - depth) : 99999 - (4 - depth);
    }
    return 0; // Stalemate
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const simBoard = game.simulateMove(move);
      const tempGame = new ChessGame();
      tempGame.board = simBoard;
      tempGame.activeColor = 'b';

      const evaluation = minimax(tempGame, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const simBoard = game.simulateMove(move);
      const tempGame = new ChessGame();
      tempGame.board = simBoard;
      tempGame.activeColor = 'w';

      const evaluation = minimax(tempGame, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return minEval;
  }
}
