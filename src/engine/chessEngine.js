// Comprehensive Chess Engine implementation for ChessX 3D
// Handles Board Representation, FEN parsing, Move Generation, Validation, Check/Checkmate, Castling, En Passant, Promotion

export const PIECE_TYPES = {
  PAWN: 'p',
  KNIGHT: 'n',
  BISHOP: 'b',
  ROOK: 'r',
  QUEEN: 'q',
  KING: 'k'
};

export const COLORS = {
  WHITE: 'w',
  BLACK: 'b'
};

export const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// Convert algebraic notation (e.g., 'e4') to board coordinates {row, col}
export function algebraicToSquare(square) {
  if (!square || square.length !== 2) return null;
  const col = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const row = 8 - parseInt(square[1], 10);
  if (row < 0 || row > 7 || col < 0 || col > 7) return null;
  return { row, col };
}

// Convert board coordinates {row, col} to algebraic notation (e.g., 'e4')
export function squareToAlgebraic(row, col) {
  if (row < 0 || row > 7 || col < 0 || col > 7) return '';
  const file = String.fromCharCode('a'.charCodeAt(0) + col);
  const rank = 8 - row;
  return `${file}${rank}`;
}

export class ChessGame {
  constructor(fen = INITIAL_FEN) {
    this.history = [];
    this.moveLog = [];
    this.capturedPieces = { w: [], b: [] };
    this.loadFen(fen);
  }

  loadFen(fen) {
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    const parts = fen.trim().split(/\s+/);
    const position = parts[0];
    this.activeColor = parts[1] || 'w';
    this.castling = parts[2] || 'KQkq';
    this.enPassant = parts[3] !== '-' ? parts[3] : null;
    this.halfMoveClock = parseInt(parts[4] || '0', 10);
    this.fullMoveNumber = parseInt(parts[5] || '1', 10);

    let row = 0;
    let col = 0;
    for (let i = 0; i < position.length; i++) {
      const char = position[i];
      if (char === '/') {
        row++;
        col = 0;
      } else if (/\d/.test(char)) {
        col += parseInt(char, 10);
      } else {
        const color = char === char.toUpperCase() ? COLORS.WHITE : COLORS.BLACK;
        const type = char.toLowerCase();
        this.board[row][col] = { type, color };
        col++;
      }
    }

    this.capturedPieces = { w: [], b: [] };
    this.updateCapturedPieces();
  }

  getPiece(row, col) {
    if (row < 0 || row > 7 || col < 0 || col > 7) return null;
    return this.board[row][col];
  }

  cloneBoard() {
    return this.board.map(row => row.map(cell => (cell ? { ...cell } : null)));
  }

  updateCapturedPieces() {
    const currentCounts = { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 };
    const boardCounts = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 }
    };

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece) {
          boardCounts[piece.color][piece.type]++;
        }
      }
    }

    this.capturedPieces = {
      w: [], // White pieces captured by Black
      b: []  // Black pieces captured by White
    };

    ['p', 'n', 'b', 'r', 'q'].forEach(type => {
      const missingWhite = Math.max(0, currentCounts[type] - boardCounts.w[type]);
      const missingBlack = Math.max(0, currentCounts[type] - boardCounts.b[type]);
      for (let i = 0; i < missingWhite; i++) this.capturedPieces.w.push(type);
      for (let i = 0; i < missingBlack; i++) this.capturedPieces.b.push(type);
    });
  }

  getMaterialAdvantage() {
    const values = { p: 1, n: 3, b: 3.25, r: 5, q: 9, k: 0 };
    let score = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece) {
          const val = values[piece.type] || 0;
          score += piece.color === 'w' ? val : -val;
        }
      }
    }
    return score;
  }

  findKing(color, board = this.board) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === color) {
          return { row: r, col: c };
        }
      }
    }
    return null;
  }

  isSquareAttacked(targetRow, targetCol, attackerColor, board = this.board) {
    // Check Knight attacks
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of knightMoves) {
      const r = targetRow + dr;
      const c = targetCol + dc;
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const p = board[r][c];
        if (p && p.color === attackerColor && p.type === 'n') return true;
      }
    }

    // Check Pawn attacks
    const pawnDirection = attackerColor === 'w' ? 1 : -1; // Pawn attacks coming towards target
    const pawnSources = [
      { row: targetRow + pawnDirection, col: targetCol - 1 },
      { row: targetRow + pawnDirection, col: targetCol + 1 }
    ];
    for (const src of pawnSources) {
      if (src.row >= 0 && src.row < 8 && src.col >= 0 && src.col < 8) {
        const p = board[src.row][src.col];
        if (p && p.color === attackerColor && p.type === 'p') return true;
      }
    }

    // Check King attacks (adjacent)
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = targetRow + dr;
        const c = targetCol + dc;
        if (r >= 0 && r < 8 && c >= 0 && c < 8) {
          const p = board[r][c];
          if (p && p.color === attackerColor && p.type === 'k') return true;
        }
      }
    }

    // Check Straight sliding attacks (Rook & Queen)
    const straightDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of straightDirs) {
      let r = targetRow + dr;
      let c = targetCol + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const p = board[r][c];
        if (p) {
          if (p.color === attackerColor && (p.type === 'r' || p.type === 'q')) return true;
          break; // Obstacle encountered
        }
        r += dr;
        c += dc;
      }
    }

    // Check Diagonal sliding attacks (Bishop & Queen)
    const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of diagDirs) {
      let r = targetRow + dr;
      let c = targetCol + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const p = board[r][c];
        if (p) {
          if (p.color === attackerColor && (p.type === 'b' || p.type === 'q')) return true;
          break; // Obstacle encountered
        }
        r += dr;
        c += dc;
      }
    }

    return false;
  }

  isInCheck(color = this.activeColor, board = this.board) {
    const kingPos = this.findKing(color, board);
    if (!kingPos) return false;
    const opponentColor = color === 'w' ? 'b' : 'w';
    return this.isSquareAttacked(kingPos.row, kingPos.col, opponentColor, board);
  }

  // Generate pseudo-legal moves for a specific square
  getRawMoves(row, col, board = this.board) {
    const piece = board[row][col];
    if (!piece) return [];
    const moves = [];
    const color = piece.color;
    const enemyColor = color === 'w' ? 'b' : 'w';

    switch (piece.type) {
      case 'p': {
        const dir = color === 'w' ? -1 : 1;
        const startRow = color === 'w' ? 6 : 1;

        // Forward 1 step
        const f1Row = row + dir;
        if (f1Row >= 0 && f1Row < 8 && !board[f1Row][col]) {
          moves.push({ from: { row, col }, to: { row: f1Row, col } });

          // Forward 2 steps from starting row
          const f2Row = row + 2 * dir;
          if (row === startRow && !board[f2Row][col]) {
            moves.push({ from: { row, col }, to: { row: f2Row, col } });
          }
        }

        // Standard captures
        [-1, 1].forEach(dc => {
          const targetCol = col + dc;
          const targetRow = row + dir;
          if (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8) {
            const targetPiece = board[targetRow][targetCol];
            if (targetPiece && targetPiece.color === enemyColor) {
              moves.push({ from: { row, col }, to: { row: targetRow, col: targetCol } });
            } else if (this.enPassant && squareToAlgebraic(targetRow, targetCol) === this.enPassant) {
              // En Passant
              moves.push({ from: { row, col }, to: { row: targetRow, col: targetCol }, isEnPassant: true });
            }
          }
        });
        break;
      }

      case 'n': {
        const knightOffsets = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        knightOffsets.forEach(([dr, dc]) => {
          const r = row + dr;
          const c = col + dc;
          if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            const targetPiece = board[r][c];
            if (!targetPiece || targetPiece.color === enemyColor) {
              moves.push({ from: { row, col }, to: { row: r, col: c } });
            }
          }
        });
        break;
      }

      case 'b':
      case 'r':
      case 'q': {
        const dirs = [];
        if (piece.type === 'b' || piece.type === 'q') {
          dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
        }
        if (piece.type === 'r' || piece.type === 'q') {
          dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
        }

        dirs.forEach(([dr, dc]) => {
          let r = row + dr;
          let c = col + dc;
          while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            const targetPiece = board[r][c];
            if (!targetPiece) {
              moves.push({ from: { row, col }, to: { row: r, col: c } });
            } else {
              if (targetPiece.color === enemyColor) {
                moves.push({ from: { row, col }, to: { row: r, col: c } });
              }
              break;
            }
            r += dr;
            c += dc;
          }
        });
        break;
      }

      case 'k': {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const r = row + dr;
            const c = col + dc;
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
              const targetPiece = board[r][c];
              if (!targetPiece || targetPiece.color === enemyColor) {
                moves.push({ from: { row, col }, to: { row: r, col: c } });
              }
            }
          }
        }

        // Castling logic
        if (color === 'w' && row === 7 && col === 4) {
          if (this.castling.includes('K')) {
            if (!board[7][5] && !board[7][6] && !this.isSquareAttacked(7, 4, 'b') && !this.isSquareAttacked(7, 5, 'b') && !this.isSquareAttacked(7, 6, 'b')) {
              moves.push({ from: { row, col }, to: { row: 7, col: 6 }, isCastle: 'K' });
            }
          }
          if (this.castling.includes('Q')) {
            if (!board[7][3] && !board[7][2] && !board[7][1] && !this.isSquareAttacked(7, 4, 'b') && !this.isSquareAttacked(7, 3, 'b') && !this.isSquareAttacked(7, 2, 'b')) {
              moves.push({ from: { row, col }, to: { row: 7, col: 2 }, isCastle: 'Q' });
            }
          }
        } else if (color === 'b' && row === 0 && col === 4) {
          if (this.castling.includes('k')) {
            if (!board[0][5] && !board[0][6] && !this.isSquareAttacked(0, 4, 'w') && !this.isSquareAttacked(0, 5, 'w') && !this.isSquareAttacked(0, 6, 'w')) {
              moves.push({ from: { row, col }, to: { row: 0, col: 6 }, isCastle: 'k' });
            }
          }
          if (this.castling.includes('q')) {
            if (!board[0][3] && !board[0][2] && !board[0][1] && !this.isSquareAttacked(0, 4, 'w') && !this.isSquareAttacked(0, 3, 'w') && !this.isSquareAttacked(0, 2, 'w')) {
              moves.push({ from: { row, col }, to: { row: 0, col: 2 }, isCastle: 'q' });
            }
          }
        }
        break;
      }
    }

    return moves;
  }

  // Filter out moves that leave king in check
  getLegalMoves(row, col) {
    const piece = this.board[row][col];
    if (!piece || piece.color !== this.activeColor) return [];

    const raw = this.getRawMoves(row, col);
    return raw.filter(move => {
      const simulatedBoard = this.simulateMove(move);
      return !this.isInCheck(piece.color, simulatedBoard);
    });
  }

  // Get all legal moves for current active color
  getAllLegalMoves(color = this.activeColor) {
    const moves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && piece.color === color) {
          const raw = this.getRawMoves(r, c);
          raw.forEach(m => {
            const sim = this.simulateMove(m);
            if (!this.isInCheck(color, sim)) {
              moves.push(m);
            }
          });
        }
      }
    }
    return moves;
  }

  simulateMove(move) {
    const newBoard = this.cloneBoard();
    const { from, to, isEnPassant, isCastle } = move;
    const piece = newBoard[from.row][from.col];
    if (!piece) return newBoard;

    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = null;

    // Handle En Passant capture
    if (isEnPassant) {
      const captureRow = piece.color === 'w' ? to.row + 1 : to.row - 1;
      newBoard[captureRow][to.col] = null;
    }

    // Handle Castling Rook move
    if (isCastle) {
      if (isCastle === 'K') {
        newBoard[7][5] = newBoard[7][7];
        newBoard[7][7] = null;
      } else if (isCastle === 'Q') {
        newBoard[7][3] = newBoard[7][0];
        newBoard[7][0] = null;
      } else if (isCastle === 'k') {
        newBoard[0][5] = newBoard[0][7];
        newBoard[0][7] = null;
      } else if (isCastle === 'q') {
        newBoard[0][3] = newBoard[0][0];
        newBoard[0][0] = null;
      }
    }

    // Pawn Promotion (default to queen in simulation)
    if (piece.type === 'p' && (to.row === 0 || to.row === 7)) {
      newBoard[to.row][to.col] = { type: move.promotion || 'q', color: piece.color };
    }

    return newBoard;
  }

  makeMove(move, promotionPiece = 'q') {
    const piece = this.board[move.from.row][move.from.col];
    if (!piece || piece.color !== this.activeColor) return false;

    // Verify move is legal
    const legalMoves = this.getLegalMoves(move.from.row, move.from.col);
    const matched = legalMoves.find(m => m.to.row === move.to.row && m.to.col === move.to.col);
    if (!matched) return false;

    // Save snapshot to history for undo
    this.history.push({
      fen: this.generateFen(),
      board: this.cloneBoard(),
      activeColor: this.activeColor,
      castling: this.castling,
      enPassant: this.enPassant,
      halfMoveClock: this.halfMoveClock,
      fullMoveNumber: this.fullMoveNumber,
      capturedPieces: JSON.parse(JSON.stringify(this.capturedPieces))
    });

    const capturedPiece = this.board[matched.to.row][matched.to.col];
    this.board[matched.to.row][matched.to.col] = piece;
    this.board[matched.from.row][matched.from.col] = null;

    // En Passant capture
    let wasEnPassant = false;
    if (matched.isEnPassant) {
      wasEnPassant = true;
      const captureRow = piece.color === 'w' ? matched.to.row + 1 : matched.to.row - 1;
      this.board[captureRow][matched.to.col] = null;
    }

    // Castling rook move
    if (matched.isCastle) {
      if (matched.isCastle === 'K') {
        this.board[7][5] = this.board[7][7];
        this.board[7][7] = null;
      } else if (matched.isCastle === 'Q') {
        this.board[7][3] = this.board[7][0];
        this.board[7][0] = null;
      } else if (matched.isCastle === 'k') {
        this.board[0][5] = this.board[0][7];
        this.board[0][7] = null;
      } else if (matched.isCastle === 'q') {
        this.board[0][3] = this.board[0][0];
        this.board[0][0] = null;
      }
    }

    // Pawn Promotion
    let isPromotion = false;
    if (piece.type === 'p' && (matched.to.row === 0 || matched.to.row === 7)) {
      isPromotion = true;
      this.board[matched.to.row][matched.to.col] = { type: promotionPiece, color: piece.color };
    }

    // Update En Passant target
    if (piece.type === 'p' && Math.abs(matched.from.row - matched.to.row) === 2) {
      const epRow = (matched.from.row + matched.to.row) / 2;
      this.enPassant = squareToAlgebraic(epRow, matched.from.col);
    } else {
      this.enPassant = null;
    }

    // Update Castling rights
    if (piece.type === 'k') {
      if (piece.color === 'w') this.castling = this.castling.replace(/[KQ]/g, '');
      if (piece.color === 'b') this.castling = this.castling.replace(/[kq]/g, '');
    }
    if (piece.type === 'r') {
      if (matched.from.row === 7 && matched.from.col === 7) this.castling = this.castling.replace('K', '');
      if (matched.from.row === 7 && matched.from.col === 0) this.castling = this.castling.replace('Q', '');
      if (matched.from.row === 0 && matched.from.col === 7) this.castling = this.castling.replace('k', '');
      if (matched.from.row === 0 && matched.from.col === 0) this.castling = this.castling.replace('q', '');
    }
    if (!this.castling) this.castling = '-';

    // Algebraic notation for move log
    const fromAlg = squareToAlgebraic(matched.from.row, matched.from.col);
    const toAlg = squareToAlgebraic(matched.to.row, matched.to.col);
    let san = `${piece.type.toUpperCase() !== 'P' ? piece.type.toUpperCase() : ''}${fromAlg}${capturedPiece || wasEnPassant ? 'x' : '-'}${toAlg}`;
    if (matched.isCastle === 'K' || matched.isCastle === 'k') san = 'O-O';
    if (matched.isCastle === 'Q' || matched.isCastle === 'q') san = 'O-O-O';
    if (isPromotion) san += `=${promotionPiece.toUpperCase()}`;

    // Switch turn
    this.activeColor = this.activeColor === 'w' ? 'b' : 'w';
    if (this.activeColor === 'w') this.fullMoveNumber++;

    this.updateCapturedPieces();

    const inCheck = this.isInCheck(this.activeColor);
    const legalMovesLeft = this.getAllLegalMoves(this.activeColor).length;
    let isCheckmate = false;
    let isStalemate = false;

    if (legalMovesLeft === 0) {
      if (inCheck) {
        isCheckmate = true;
        san += '#';
      } else {
        isStalemate = true;
      }
    } else if (inCheck) {
      san += '+';
    }

    const moveRecord = {
      san,
      from: matched.from,
      to: matched.to,
      piece: piece.type,
      color: piece.color,
      captured: capturedPiece ? capturedPiece.type : (wasEnPassant ? 'p' : null),
      inCheck,
      isCheckmate,
      isStalemate
    };

    this.moveLog.push(moveRecord);
    return moveRecord;
  }

  undo() {
    if (this.history.length === 0) return false;
    const prev = this.history.pop();
    this.board = prev.board;
    this.activeColor = prev.activeColor;
    this.castling = prev.castling;
    this.enPassant = prev.enPassant;
    this.halfMoveClock = prev.halfMoveClock;
    this.fullMoveNumber = prev.fullMoveNumber;
    this.capturedPieces = prev.capturedPieces;
    this.moveLog.pop();
    return true;
  }

  generateFen() {
    let fen = '';
    for (let r = 0; r < 8; r++) {
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (!piece) {
          empty++;
        } else {
          if (empty > 0) {
            fen += empty;
            empty = 0;
          }
          fen += piece.color === 'w' ? piece.type.toUpperCase() : piece.type;
        }
      }
      if (empty > 0) fen += empty;
      if (r < 7) fen += '/';
    }

    fen += ` ${this.activeColor}`;
    fen += ` ${this.castling || '-'}`;
    fen += ` ${this.enPassant || '-'}`;
    fen += ` ${this.halfMoveClock} ${this.fullMoveNumber}`;

    return fen;
  }
}
