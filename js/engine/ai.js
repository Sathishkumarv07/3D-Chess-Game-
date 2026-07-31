/* Minimax AI Engine with Alpha-Beta Pruning & PST Evaluations */

class ChessAI {
  constructor(engine) {
    this.engine = engine;
    
    // Piece-Square Positional Evaluation Tables
    this.pst = {
      P: [
        [ 0,  0,  0,  0,  0,  0,  0,  0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [ 5,  5, 10, 27, 27, 10,  5,  5],
        [ 0,  0,  0, 20, 20,  0,  0,  0],
        [ 5, -5,-10,  0,  0,-10, -5,  5],
        [ 5, 10, 10,-20,-20, 10, 10,  5],
        [ 0,  0,  0,  0,  0,  0,  0,  0]
      ],
      N: [
        [-50,-40,-30,-30,-30,-30,-40,-50],
        [-40,-20,  0,  0,  0,  0,-20,-40],
        [-30,  0, 10, 15, 15, 10,  0,-30],
        [-30,  5, 15, 20, 20, 15,  5,-30],
        [-30,  0, 15, 20, 20, 15,  0,-30],
        [-30,  5, 10, 15, 15, 10,  5,-30],
        [-40,-20,  0,  5,  5,  0,-20,-40],
        [-50,-40,-30,-30,-30,-30,-40,-50]
      ],
      B: [
        [-20,-10,-10,-10,-10,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5, 10, 10,  5,  0,-10],
        [-10,  5,  5, 10, 10,  5,  5,-10],
        [-10,  0, 10, 10, 10, 10,  0,-10],
        [-10, 10, 10, 10, 10, 10, 10,-10],
        [-10,  5,  0,  0,  0,  0,  5,-10],
        [-20,-10,-10,-10,-10,-10,-10,-20]
      ],
      R: [
        [ 0,  0,  0,  0,  0,  0,  0,  0],
        [ 5, 10, 10, 10, 10, 10, 10,  5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [ 0,  0,  0,  5,  5,  0,  0,  0]
      ],
      Q: [
        [-20,-10,-10, -5, -5,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5,  5,  5,  5,  0,-10],
        [ -5,  0,  5,  5,  5,  5,  0, -5],
        [  0,  0,  5,  5,  5,  5,  0, -5],
        [-10,  5,  5,  5,  5,  5,  0,-10],
        [-10,  0,  5,  0,  0,  0,  0,-10],
        [-20,-10,-10, -5, -5,-10,-10,-20]
      ],
      K: [
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-20,-30,-30,-40,-40,-30,-30,-20],
        [-10,-20,-20,-20,-20,-20,-20,-10],
        [ 20, 20,  0,  0,  0,  0, 20, 20],
        [ 20, 30, 10,  0,  0, 10, 30, 20]
      ]
    };
  }

  evaluateBoard() {
    const val = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 20000 };
    let score = 0;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.engine.board[r][c];
        if (piece) {
          const color = piece[0];
          const type = piece[1];
          let pieceVal = val[type];
          
          // Positional bonus
          const pstTable = this.pst[type];
          let pstVal = 0;
          if (pstTable) {
            pstVal = color === 'w' ? pstTable[r][c] : pstTable[7 - r][c];
          }

          const total = pieceVal + pstVal;
          if (color === 'w') score += total;
          else score -= total;
        }
      }
    }
    return score;
  }

  getBestMove(level = 5) {
    const moves = this.engine.getLegalMoves();
    if (moves.length === 0) return null;

    // Difficulty scaling mapping
    let depth = 3;
    let randomProb = 0;

    if (level <= 2) { depth = 1; randomProb = 0.4; }
    else if (level <= 4) { depth = 2; randomProb = 0.15; }
    else if (level <= 7) { depth = 3; randomProb = 0.0; }
    else { depth = 4; randomProb = 0.0; }

    // Random mistake chance for low levels
    if (Math.random() < randomProb) {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    const isMaximizing = this.engine.turn === 'w';
    let bestMove = null;
    let bestValue = isMaximizing ? -Infinity : Infinity;
    let alpha = -Infinity;
    let beta = Infinity;

    for (const move of moves) {
      const fenBefore = this.engine.generateFEN();
      this.engine.makeMove(move);
      const boardVal = this.minimax(depth - 1, alpha, beta, !isMaximizing);
      this.engine.loadFEN(fenBefore);

      if (isMaximizing) {
        if (boardVal > bestValue) {
          bestValue = boardVal;
          bestMove = move;
        }
        alpha = Math.max(alpha, boardVal);
      } else {
        if (boardVal < bestValue) {
          bestValue = boardVal;
          bestMove = move;
        }
        beta = Math.min(beta, boardVal);
      }
    }

    return bestMove || moves[0];
  }

  minimax(depth, alpha, beta, isMaximizing) {
    if (depth === 0) {
      return this.evaluateBoard();
    }

    const moves = this.engine.getLegalMoves();
    if (moves.length === 0) {
      if (this.engine.inCheck()) {
        return isMaximizing ? -99999 + (4 - depth) : 99999 - (4 - depth);
      }
      return 0; // Stalemate
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const fenBefore = this.engine.generateFEN();
        this.engine.makeMove(move);
        const evaluation = this.minimax(depth - 1, alpha, beta, false);
        this.engine.loadFEN(fenBefore);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break; // Prune
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const fenBefore = this.engine.generateFEN();
        this.engine.makeMove(move);
        const evaluation = this.minimax(depth - 1, alpha, beta, true);
        this.engine.loadFEN(fenBefore);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break; // Prune
      }
      return minEval;
    }
  }
}

window.ChessAI = ChessAI;
