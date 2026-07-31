/* Complete Chess Rules Engine for ChessX */

class ChessEngine {
  constructor() {
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    this.turn = 'w'; // 'w' or 'b'
    this.castling = { w: { k: true, q: true }, b: { k: true, q: true } };
    this.enPassant = null; // {r, c} square behind target pawn
    this.halfMoveClock = 0;
    this.fullMoveNumber = 1;
    this.history = [];
    this.resetBoard();
  }

  resetBoard() {
    this.loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  }

  loadFEN(fen) {
    const parts = fen.trim().split(/\s+/);
    const rows = parts[0].split('/');
    
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let r = 0; r < 8; r++) {
      let c = 0;
      for (const char of rows[r]) {
        if (!isNaN(char)) {
          c += parseInt(char);
        } else {
          const color = char === char.toUpperCase() ? 'w' : 'b';
          const type = char.toUpperCase();
          this.board[r][c] = color + type;
          c++;
        }
      }
    }

    this.turn = parts[1] || 'w';
    this.castling = {
      w: { k: parts[2]?.includes('K') || false, q: parts[2]?.includes('Q') || false },
      b: { k: parts[2]?.includes('k') || false, q: parts[2]?.includes('q') || false }
    };

    if (parts[3] && parts[3] !== '-') {
      const col = parts[3].charCodeAt(0) - 97;
      const row = 8 - parseInt(parts[3][1]);
      this.enPassant = { r: row, c: col };
    } else {
      this.enPassant = null;
    }

    this.halfMoveClock = parseInt(parts[4]) || 0;
    this.fullMoveNumber = parseInt(parts[5]) || 1;
    this.history = [];
  }

  generateFEN() {
    let fen = '';
    for (let r = 0; r < 8; r++) {
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (!piece) {
          empty++;
        } else {
          if (empty > 0) { fen += empty; empty = 0; }
          const char = piece[1];
          fen += piece[0] === 'w' ? char : char.toLowerCase();
        }
      }
      if (empty > 0) fen += empty;
      if (r < 7) fen += '/';
    }

    fen += ` ${this.turn} `;
    let castlingStr = '';
    if (this.castling.w.k) castlingStr += 'K';
    if (this.castling.w.q) castlingStr += 'Q';
    if (this.castling.b.k) castlingStr += 'k';
    if (this.castling.b.q) castlingStr += 'q';
    fen += (castlingStr || '-') + ' ';

    if (this.enPassant) {
      const file = String.fromCharCode(97 + this.enPassant.c);
      const rank = 8 - this.enPassant.r;
      fen += `${file}${rank}`;
    } else {
      fen += '-';
    }

    fen += ` ${this.halfMoveClock} ${this.fullMoveNumber}`;
    return fen;
  }

  getPiece(r, c) {
    if (r < 0 || r > 7 || c < 0 || c > 7) return null;
    return this.board[r][c];
  }

  setPiece(r, c, piece) {
    this.board[r][c] = piece;
  }

  getLegalMoves(turnColor = this.turn) {
    const pseudoMoves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && piece[0] === turnColor) {
          this.generatePieceMoves(r, c, piece, pseudoMoves);
        }
      }
    }

    // Filter out moves that leave own King in check
    const legalMoves = [];
    for (const move of pseudoMoves) {
      if (this.isMoveSafe(move, turnColor)) {
        legalMoves.push(move);
      }
    }

    return legalMoves;
  }

  generatePieceMoves(r, c, piece, moves) {
    const color = piece[0];
    const type = piece[1];
    const dir = color === 'w' ? -1 : 1;

    if (type === 'P') {
      // Single push
      if (this.getPiece(r + dir, c) === null) {
        moves.push({ from: { r, c }, to: { r: r + dir, c } });
        // Double push
        const startRank = color === 'w' ? 6 : 1;
        if (r === startRank && this.getPiece(r + 2 * dir, c) === null) {
          moves.push({ from: { r, c }, to: { r: r + 2 * dir, c } });
        }
      }
      // Captures
      for (const dc of [-1, 1]) {
        const target = this.getPiece(r + dir, c + dc);
        if (target && target[0] !== color) {
          moves.push({ from: { r, c }, to: { r: r + dir, c: c + dc } });
        }
        // En Passant
        if (this.enPassant && this.enPassant.r === r + dir && this.enPassant.c === c + dc) {
          moves.push({ from: { r, c }, to: { r: r + dir, c: c + dc }, isEnPassant: true });
        }
      }
    } else if (type === 'N') {
      const offsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
      for (const [dr, dc] of offsets) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const target = this.getPiece(nr, nc);
          if (!target || target[0] !== color) {
            moves.push({ from: { r, c }, to: { r: nr, c: nc } });
          }
        }
      }
    } else if (type === 'B' || type === 'R' || type === 'Q') {
      const dirs = [];
      if (type === 'B' || type === 'Q') dirs.push([-1,-1],[-1,1],[1,-1],[1,1]);
      if (type === 'R' || type === 'Q') dirs.push([-1,0],[1,0],[0,-1],[0,1]);
      
      for (const [dr, dc] of dirs) {
        let nr = r + dr, nc = c + dc;
        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const target = this.getPiece(nr, nc);
          if (!target) {
            moves.push({ from: { r, c }, to: { r: nr, c: nc } });
          } else {
            if (target[0] !== color) {
              moves.push({ from: { r, c }, to: { r: nr, c: nc } });
            }
            break;
          }
          nr += dr;
          nc += dc;
        }
      }
    } else if (type === 'K') {
      const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const target = this.getPiece(nr, nc);
          if (!target || target[0] !== color) {
            moves.push({ from: { r, c }, to: { r: nr, c: nc } });
          }
        }
      }

      // Castling
      if (!this.isSquareAttacked(r, c, color === 'w' ? 'b' : 'w')) {
        if (this.castling[color].k) {
          if (this.getPiece(r, c + 1) === null && this.getPiece(r, c + 2) === null &&
              !this.isSquareAttacked(r, c + 1, color === 'w' ? 'b' : 'w') &&
              !this.isSquareAttacked(r, c + 2, color === 'w' ? 'b' : 'w')) {
            moves.push({ from: { r, c }, to: { r, c: c + 2 }, isCastle: 'k' });
          }
        }
        if (this.castling[color].q) {
          if (this.getPiece(r, c - 1) === null && this.getPiece(r, c - 2) === null && this.getPiece(r, c - 3) === null &&
              !this.isSquareAttacked(r, c - 1, color === 'w' ? 'b' : 'w') &&
              !this.isSquareAttacked(r, c - 2, color === 'w' ? 'b' : 'w')) {
            moves.push({ from: { r, c }, to: { r, c: c - 2 }, isCastle: 'q' });
          }
        }
      }
    }
  }

  isSquareAttacked(sqR, sqC, attackerColor) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.getPiece(r, c);
        if (piece && piece[0] === attackerColor) {
          const type = piece[1];
          const dir = attackerColor === 'w' ? -1 : 1;

          if (type === 'P') {
            if (r + dir === sqR && (c - 1 === sqC || c + 1 === sqC)) return true;
          } else if (type === 'N') {
            const offsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
            for (const [dr, dc] of offsets) {
              if (r + dr === sqR && c + dc === sqC) return true;
            }
          } else if (type === 'K') {
            if (Math.abs(r - sqR) <= 1 && Math.abs(c - sqC) <= 1) return true;
          } else if (type === 'B' || type === 'R' || type === 'Q') {
            const dirs = [];
            if (type === 'B' || type === 'Q') dirs.push([-1,-1],[-1,1],[1,-1],[1,1]);
            if (type === 'R' || type === 'Q') dirs.push([-1,0],[1,0],[0,-1],[0,1]);
            for (const [dr, dc] of dirs) {
              let nr = r + dr, nc = c + dc;
              while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                if (nr === sqR && nc === sqC) return true;
                if (this.getPiece(nr, nc) !== null) break;
                nr += dr; nc += dc;
              }
            }
          }
        }
      }
    }
    return false;
  }

  isMoveSafe(move, color) {
    const savedBoard = this.board.map(row => [...row]);
    const piece = this.board[move.from.r][move.from.c];
    this.board[move.to.r][move.to.c] = piece;
    this.board[move.from.r][move.from.c] = null;

    if (move.isEnPassant) {
      const epDir = color === 'w' ? 1 : -1;
      this.board[move.to.r + epDir][move.to.c] = null;
    }

    let kingR = -1, kingC = -1;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.board[r][c] === color + 'K') {
          kingR = r; kingC = c; break;
        }
      }
    }

    const opponent = color === 'w' ? 'b' : 'w';
    const inCheck = this.isSquareAttacked(kingR, kingC, opponent);
    this.board = savedBoard;
    return !inCheck;
  }

  makeMove(move, promotionType = 'Q') {
    const piece = this.getPiece(move.from.r, move.from.c);
    const target = this.getPiece(move.to.r, move.to.c);
    const color = piece[0];

    // Record history for Undo
    this.history.push({
      fen: this.generateFEN(),
      move: move,
      piece: piece,
      captured: target,
      castling: JSON.parse(JSON.stringify(this.castling)),
      enPassant: this.enPassant ? { ...this.enPassant } : null,
      halfMoveClock: this.halfMoveClock
    });

    // Execute Move
    this.board[move.to.r][move.to.c] = piece;
    this.board[move.from.r][move.from.c] = null;

    // En Passant capture execution
    if (move.isEnPassant) {
      const epDir = color === 'w' ? 1 : -1;
      this.board[move.to.r + epDir][move.to.c] = null;
    }

    // Set En Passant target
    if (piece[1] === 'P' && Math.abs(move.to.r - move.from.r) === 2) {
      this.enPassant = { r: (move.from.r + move.to.r) / 2, c: move.from.c };
    } else {
      this.enPassant = null;
    }

    // Castling execution
    if (move.isCastle) {
      if (move.isCastle === 'k') {
        const rook = this.getPiece(move.from.r, 7);
        this.board[move.from.r][5] = rook;
        this.board[move.from.r][7] = null;
      } else if (move.isCastle === 'q') {
        const rook = this.getPiece(move.from.r, 0);
        this.board[move.from.r][3] = rook;
        this.board[move.from.r][0] = null;
      }
    }

    // Pawn Promotion
    if (piece[1] === 'P' && (move.to.r === 0 || move.to.r === 7)) {
      this.board[move.to.r][move.to.c] = color + promotionType;
    }

    // Revoke castling rights on King/Rook move
    if (piece[1] === 'K') {
      this.castling[color].k = false;
      this.castling[color].q = false;
    }
    if (piece[1] === 'R') {
      if (move.from.c === 7) this.castling[color].k = false;
      if (move.from.c === 0) this.castling[color].q = false;
    }

    // Update Clocks & Turn
    if (piece[1] === 'P' || target || move.isEnPassant) {
      this.halfMoveClock = 0;
    } else {
      this.halfMoveClock++;
    }

    if (color === 'b') this.fullMoveNumber++;
    this.turn = color === 'w' ? 'b' : 'w';

    return {
      isCapture: !!target || move.isEnPassant,
      isCheck: this.inCheck(this.turn),
      isCheckmate: this.isCheckmate(this.turn),
      isStalemate: this.isStalemate(this.turn)
    };
  }

  undoMove() {
    if (this.history.length === 0) return null;
    const last = this.history.pop();
    this.loadFEN(last.fen);
    return last;
  }

  inCheck(color = this.turn) {
    let kingR = -1, kingC = -1;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.board[r][c] === color + 'K') {
          kingR = r; kingC = c; break;
        }
      }
    }
    return this.isSquareAttacked(kingR, kingC, color === 'w' ? 'b' : 'w');
  }

  isCheckmate(color = this.turn) {
    return this.inCheck(color) && this.getLegalMoves(color).length === 0;
  }

  isStalemate(color = this.turn) {
    return !this.inCheck(color) && this.getLegalMoves(color).length === 0;
  }

  getMaterialDifference() {
    const val = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };
    let wScore = 0, bScore = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece) {
          if (piece[0] === 'w') wScore += val[piece[1]];
          else bScore += val[piece[1]];
        }
      }
    }
    return { wScore, bScore, diff: wScore - bScore };
  }
}

window.ChessEngine = ChessEngine;
