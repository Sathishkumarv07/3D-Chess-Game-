/* ==========================================
   ChessX Consolidated Application Bundle
   Combined JS Files:
   1. Sound Engine (js/audio/sound.js)
   2. Particle VFX Engine (js/vfx/particles.js)
   3. Chess Rules Engine (js/engine/chess.js)
   4. Minimax AI Engine (js/engine/ai.js)
   5. UI Controller & Canvas Renderer (js/ui/app.js)
   ========================================== */

/* ------------------------------------------
   1. Sound Engine
   ------------------------------------------ */
class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.muted = false;
    this.globalVolume = 0.8;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playMove() {
    if (this.muted) return;
    this.init();

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(this.globalVolume * 0.7, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.08);
  }

  playCapture() {
    if (this.muted) return;
    this.init();

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, this.audioCtx.currentTime + 0.12);

    gain.gain.setValueAtTime(this.globalVolume * 1.0, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.12);
  }

  playCheck() {
    if (this.muted) return;
    this.init();

    const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
    freqs.forEach((f, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.audioCtx.currentTime + idx * 0.04);

      gain.gain.setValueAtTime(0, this.audioCtx.currentTime + idx * 0.04);
      gain.gain.linearRampToValueAtTime(this.globalVolume * 0.4, this.audioCtx.currentTime + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + idx * 0.04 + 0.3);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(this.audioCtx.currentTime + idx * 0.04);
      osc.stop(this.audioCtx.currentTime + idx * 0.04 + 0.3);
    });
  }

  playVictory() {
    if (this.muted) return;
    this.init();

    const notes = [
      { f: 523.25, t: 0.0 },  // C5
      { f: 659.25, t: 0.12 }, // E5
      { f: 783.99, t: 0.24 }, // G5
      { f: 1046.50, t: 0.36 } // C6
    ];

    notes.forEach(n => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, this.audioCtx.currentTime + n.t);

      gain.gain.setValueAtTime(0, this.audioCtx.currentTime + n.t);
      gain.gain.linearRampToValueAtTime(this.globalVolume * 0.5, this.audioCtx.currentTime + n.t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + n.t + 0.5);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(this.audioCtx.currentTime + n.t);
      osc.stop(this.audioCtx.currentTime + n.t + 0.5);
    });
  }

  playDefeat() {
    if (this.muted) return;
    this.init();

    const notes = [
      { f: 400, t: 0.0 },
      { f: 350, t: 0.15 },
      { f: 300, t: 0.30 }
    ];

    notes.forEach(n => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.f, this.audioCtx.currentTime + n.t);

      gain.gain.setValueAtTime(0, this.audioCtx.currentTime + n.t);
      gain.gain.linearRampToValueAtTime(this.globalVolume * 0.3, this.audioCtx.currentTime + n.t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + n.t + 0.4);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(this.audioCtx.currentTime + n.t);
      osc.stop(this.audioCtx.currentTime + n.t + 0.4);
    });
  }

  playClick() {
    if (this.muted) return;
    this.init();

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.audioCtx.currentTime + 0.015);

    gain.gain.setValueAtTime(this.globalVolume * 0.2, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.015);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.015);
  }
}

window.soundEngine = new SoundEngine();

/* ------------------------------------------
   2. Particle VFX Engine
   ------------------------------------------ */
class ParticleVFX {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.shakeDuration = 0;
    this.shakeIntensity = 0;
    this.boardEl = null;
  }

  init() {
    this.canvas = document.getElementById(this.canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.boardEl = document.querySelector('.board-container');
    if (this.canvas) {
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.loop();
    }
  }

  resize() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  triggerCapture(x, y) {
    const colors = ['#FF7675', '#D63031', '#FDCB6E', '#00CEC9'];
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: Math.random() * 0.03 + 0.02
      });
    }
  }

  triggerVictory() {
    const colors = ['#00CEC9', '#6C5CE7', '#00B894', '#FDCB6E', '#FFFFFF'];
    const width = this.canvas ? this.canvas.width : 500;
    const height = this.canvas ? this.canvas.height : 500;

    for (let i = 0; i < 120; i++) {
      this.particles.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.5),
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * -6 - 2,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: Math.random() * 0.015 + 0.008,
        gravity: 0.15
      });
    }
  }

  triggerShake(intensity = 8, duration = 300) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  loop() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.gravity) p.vy += p.gravity;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // Screen Shake effect
    if (this.shakeDuration > 0 && this.boardEl) {
      const dx = (Math.random() - 0.5) * this.shakeIntensity;
      const dy = (Math.random() - 0.5) * this.shakeIntensity;
      this.boardEl.style.transform = `translate(${dx}px, ${dy}px)`;
      this.shakeDuration -= 16;
    } else if (this.boardEl) {
      this.boardEl.style.transform = 'translate(0px, 0px)';
    }

    requestAnimationFrame(() => this.loop());
  }
}

window.vfxEngine = new ParticleVFX('vfx-canvas');

/* ------------------------------------------
   3. Chess Rules Engine
   ------------------------------------------ */
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

/* ------------------------------------------
   4. Minimax AI Engine
   ------------------------------------------ */
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

/* ------------------------------------------
   5. UI Controller & Canvas Renderer
   ------------------------------------------ */
class AppController {
  constructor() {
    this.engine = new ChessEngine();
    this.ai = new ChessAI(this.engine);
    
    // Game State
    this.isVsAI = true;
    this.isOnline = false;
    this.isSpectating = false;
    this.spectateInterval = null;
    this.enableHints = true;
    this.enableUndo = true;
    this.enableAnalysis = true;
    this.voiceStatus = 'Disabled';
    this.aiLevel = 6;
    this.playerColor = 'w';
    this.flipped = false;
    this.selectedSq = null;
    this.legalMoves = [];
    this.lastMove = null;
    this.pendingPromotionMove = null;
    this.matchmakingTimer = null;
    this.matchmakingSeconds = 0;
    
    // Clocks
    this.timeControl = 300; // 5 mins in seconds
    this.wTime = 300;
    this.bTime = 300;
    this.clockInterval = null;
    this.gameActive = false;

    // Piece Symbol Mapping (High-contrast Unicode Vectors)
    this.pieceSymbols = {
      wP: '♙', wN: '♘', wB: '♗', wR: '♖', wQ: '♕', wK: '♔',
      bP: '♟', bN: '♞', bB: '♝', bR: '♜', bQ: '♛', bK: '♚'
    };

    // Canvas Element
    this.canvas = document.getElementById('board-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    
    // Piece Image Mapping (SVG assets from Wikimedia Commons - Standard cburnett theme)
    this.pieceImages = {};
    this.imagesLoaded = false;
    this.loadPieceImages();

    this.init();
  }

  init() {
    if (window.vfxEngine) {
      window.vfxEngine.init();
    }
    this.bindEvents();
    this.bindAuthEvents();
    this.bindOnlineEvents();
    this.setupAuth();
    this.resizeCanvas();
    this.setupTheme();
    this.render();
  }

  loadPieceImages() {
    const urls = {
      wP: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg?v=1',
      wN: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg?v=1',
      wB: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg?v=1',
      wR: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg?v=1',
      wQ: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg?v=1',
      wK: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg?v=1',
      bP: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg?v=1',
      bN: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg?v=1',
      bB: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg?v=1',
      bR: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg?v=1',
      bQ: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg?v=1',
      bK: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg?v=1'
    };

    let loadedCount = 0;
    const totalCount = Object.keys(urls).length;

    for (const key in urls) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = urls[key];
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalCount) {
          this.imagesLoaded = true;
          this.render();
        }
      };
      img.onerror = () => {
        console.error(`Failed to load piece image for ${key}`);
      };
      this.pieceImages[key] = img;
    }
  }

  setupTheme() {
    let savedTheme = localStorage.getItem('chessx_theme');
    if (!savedTheme || savedTheme === 'wood') {
      savedTheme = 'redgiant';
      localStorage.setItem('chessx_theme', 'redgiant');
    }
    document.documentElement.setAttribute('data-theme', savedTheme);
    const settingsThemeSel = document.getElementById('settings-theme-select');
    if (settingsThemeSel) settingsThemeSel.value = savedTheme;
  }

  setupAuth() {
    const savedUser = localStorage.getItem('chessx_user');
    const authBtn = document.getElementById('btn-header-auth');
    const avatar = document.getElementById('header-avatar');
    const navLogin = document.getElementById('nav-login-item');

    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (authBtn) authBtn.style.display = 'none';
      if (avatar) {
        avatar.style.display = 'flex';
        avatar.innerText = user.name ? user.name.charAt(0).toUpperCase() : '👤';
        avatar.title = `${user.name} (${user.email}) - Click to Log Out`;
      }
      if (navLogin) navLogin.style.display = 'none';
    } else {
      if (authBtn) authBtn.style.display = 'inline-flex';
      if (avatar) avatar.style.display = 'none';
      if (navLogin) navLogin.style.display = 'flex';
    }
  }

  resizeCanvas() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.sqSize = this.canvas.width / 8;
    this.render();
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());

    // Navigation View Swapping
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const targetScreen = item.getAttribute('data-screen');
        const mode = item.getAttribute('data-mode');
        if (mode === 'friends') {
          this.startFriendsGame();
          return;
        }
        this.switchScreen(targetScreen);
        if (targetScreen === 'view-game' && !this.gameActive) {
          this.startNewGame();
        }
      });
    });

    const brandNav = document.getElementById('nav-brand');
    if (brandNav) {
      brandNav.addEventListener('click', () => {
        this.switchScreen('view-dashboard');
      });
    }

    // Theme Switcher & Settings Save
    const settingsThemeSel = document.getElementById('settings-theme-select');
    if (settingsThemeSel) {
      settingsThemeSel.addEventListener('change', (e) => {
        const theme = e.target.value;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('chessx_theme', theme);
        this.render();
        window.soundEngine.playClick();
      });
    }

    const btnSaveSettings = document.getElementById('btn-save-settings');
    if (btnSaveSettings) {
      btnSaveSettings.addEventListener('click', () => {
        alert('Settings preferences saved successfully!');
        window.soundEngine.playVictory();
      });
    }

    // Sound Toggle
    const soundBtn = document.getElementById('btn-toggle-sound');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const isMuted = window.soundEngine.toggleMute();
        soundBtn.innerText = isMuted ? '🔇' : '🔊';
      });
    }

    // Dashboard Quick Action Buttons
    const btnQuickAI = document.getElementById('btn-quick-ai');
    if (btnQuickAI) {
      btnQuickAI.addEventListener('click', () => this.switchScreen('view-ai-select'));
    }

    const btnQuickPass = document.getElementById('btn-quick-pass');
    if (btnQuickPass) {
      btnQuickPass.addEventListener('click', () => this.startFriendsGame());
    }

    const btnQuickOnline = document.getElementById('btn-quick-online');
    if (btnQuickOnline) {
      btnQuickOnline.addEventListener('click', () => this.switchScreen('view-online'));
    }

    // Dashboard Mode Cards Buttons
    const btnCardAI = document.getElementById('btn-card-ai');
    if (btnCardAI) {
      btnCardAI.addEventListener('click', () => this.switchScreen('view-ai-select'));
    }

    const btnCardFriends = document.getElementById('btn-card-friends');
    if (btnCardFriends) {
      btnCardFriends.addEventListener('click', () => this.startFriendsGame());
    }

    const btnCardOnline = document.getElementById('btn-card-online');
    if (btnCardOnline) {
      btnCardOnline.addEventListener('click', () => this.switchScreen('view-online'));
    }

    // AI Configuration Controls (Star Buttons)
    document.querySelectorAll('.bot-star-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.bot-star-btn').forEach(b => {
          b.classList.remove('active');
          b.style.borderColor = 'var(--border-glass)';
          b.style.boxShadow = 'none';
        });
        const targetBtn = e.currentTarget;
        targetBtn.classList.add('active');
        targetBtn.style.borderColor = 'var(--accent-cyan)';
        targetBtn.style.boxShadow = '0 0 8px rgba(0,206,201,0.2)';
        
        const lvl = parseInt(targetBtn.getAttribute('data-level'));
        const elo = targetBtn.getAttribute('data-elo');
        this.aiLevel = lvl;
        
        const eloValEl = document.getElementById('level-elo-val');
        if (eloValEl) eloValEl.innerText = elo + ' Elo';
        window.soundEngine.playClick();
      });
    });

    document.querySelectorAll('.color-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.color-choice').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.playerColor = btn.getAttribute('data-color');
      });
    });

    const btnStartAI = document.getElementById('btn-start-ai-match');
    if (btnStartAI) {
      btnStartAI.addEventListener('click', () => {
        this.isVsAI = true;
        this.isOnline = false;
        this.isSpectating = false;
        let color = this.playerColor;
        if (color === 'random') color = Math.random() < 0.5 ? 'w' : 'b';
        this.playerColor = color;
        this.flipped = color === 'b';
        const tcSelect = document.getElementById('time-control-select');
        this.timeControl = tcSelect ? parseInt(tcSelect.value) : 300;

        const checkHint = document.getElementById('check-enable-hint');
        const checkUndo = document.getElementById('check-enable-undo');
        const checkAnalysis = document.getElementById('check-enable-analysis');
        
        this.enableHints = checkHint ? checkHint.checked : true;
        this.enableUndo = checkUndo ? checkUndo.checked : true;
        this.enableAnalysis = checkAnalysis ? checkAnalysis.checked : true;

        const hintBtn = document.getElementById('btn-hint');
        const undoBtn = document.getElementById('btn-undo');
        if (hintBtn) hintBtn.style.display = this.enableHints ? 'inline-block' : 'none';
        if (undoBtn) undoBtn.style.display = this.enableUndo ? 'inline-block' : 'none';

        this.startNewGame();
        this.switchScreen('view-game');
      });
    }

    // Play Game Button
    const btnPlayGame = document.getElementById('btn-play-game');
    if (btnPlayGame) {
      btnPlayGame.addEventListener('click', () => {
        this.switchScreen('view-ai-select');
      });
    }

    // In-Game Action Bar
    const btnHint = document.getElementById('btn-hint');
    if (btnHint) btnHint.addEventListener('click', () => this.showHint());

    const btnUndo = document.getElementById('btn-undo');
    if (btnUndo) btnUndo.addEventListener('click', () => this.undoMove());

    const btnFlip = document.getElementById('btn-flip');
    if (btnFlip) {
      btnFlip.addEventListener('click', () => {
        this.flipped = !this.flipped;
        this.render();
      });
    }

    const btnResign = document.getElementById('btn-resign');
    if (btnResign) {
      btnResign.addEventListener('click', () => this.endGame('Opponent Won', 'You resigned the match.'));
    }

    // Canvas Pointer Click Logic
    if (this.canvas) {
      this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    }

    // Modal Action Buttons
    const btnRematch = document.getElementById('btn-modal-rematch');
    if (btnRematch) {
      btnRematch.addEventListener('click', () => {
        document.getElementById('modal-game-over').classList.remove('active');
        this.startNewGame();
      });
    }

    const btnMenu = document.getElementById('btn-modal-menu');
    if (btnMenu) {
      btnMenu.addEventListener('click', () => {
        document.getElementById('modal-game-over').classList.remove('active');
        this.switchScreen('view-dashboard');
      });
    }

    // Pawn Promotion Choice
    document.querySelectorAll('.promo-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        const pieceType = btn.getAttribute('data-piece');
        document.getElementById('modal-promotion').classList.remove('active');
        if (this.pendingPromotionMove) {
          this.executeMove(this.pendingPromotionMove, pieceType);
          this.pendingPromotionMove = null;
        }
      });
    });
  }

  startFriendsGame() {
    this.isVsAI = false;
    this.isOnline = false;
    this.playerColor = 'w';
    this.flipped = false;
    this.timeControl = 300;
    this.startNewGame();
    this.switchScreen('view-game');
  }

  bindOnlineEvents() {
    const btnQuickMatch = document.getElementById('btn-quick-matchmaking');
    const statusBox = document.getElementById('matchmaking-status-box');
    const timerText = document.getElementById('matchmaking-timer');
    const btnCancelMatch = document.getElementById('btn-cancel-matchmaking');
    const btnCreateRoom = document.getElementById('btn-create-room');
    const btnJoinRoom = document.getElementById('btn-join-room');
    const inputRoomCode = document.getElementById('input-room-code');

    // Quick Matchmaking
    if (btnQuickMatch) {
      btnQuickMatch.addEventListener('click', () => {
        if (statusBox) statusBox.style.display = 'block';
        this.matchmakingSeconds = 0;
        if (timerText) timerText.innerText = 'Searching time: 0s';
        window.soundEngine.playClick();

        if (this.matchmakingTimer) clearInterval(this.matchmakingTimer);
        this.matchmakingTimer = setInterval(() => {
          this.matchmakingSeconds++;
          if (timerText) timerText.innerText = `Searching time: ${this.matchmakingSeconds}s`;
          if (this.matchmakingSeconds >= 3) {
            clearInterval(this.matchmakingTimer);
            if (statusBox) statusBox.style.display = 'none';
            const randomName = ['CyberKnight_99', 'TacticsMaster', 'GrandmasterZero', 'DeepBlue2'][Math.floor(Math.random() * 4)];
            const randomElo = [1680, 1920, 2840, 2400][Math.floor(Math.random() * 4)];
            this.startOnlineMatch(randomName, randomElo);
          }
        }, 1000);
      });
    }

    if (btnCancelMatch) {
      btnCancelMatch.addEventListener('click', () => {
        if (this.matchmakingTimer) clearInterval(this.matchmakingTimer);
        if (statusBox) statusBox.style.display = 'none';
        window.soundEngine.playClick();
      });
    }

    // Create Room & Invite Friend Simulation
    if (btnCreateRoom) {
      btnCreateRoom.addEventListener('click', () => {
        const roomCode = 'CX-' + Math.floor(1000 + Math.random() * 9000);
        const inviteBox = document.getElementById('invite-friend-box');
        const shareCodeInput = document.getElementById('share-room-code');
        const inviteStatus = document.getElementById('invite-status-text');

        if (inviteBox && shareCodeInput) {
          inviteBox.style.display = 'block';
          shareCodeInput.value = roomCode;
          if (inviteStatus) inviteStatus.innerText = 'Waiting for friend to connect...';
          window.soundEngine.playClick();

          // Wait 4 seconds for simulated friend to connect
          setTimeout(() => {
            if (inviteStatus) inviteStatus.innerText = 'Friend connected! Game starting...';
            window.soundEngine.playVictory();
            setTimeout(() => {
              inviteBox.style.display = 'none';
              this.startOnlineMatch('Friend (Room ' + roomCode + ')', 1500);
            }, 1000);
          }, 4000);
        }
      });
    }

    // Copy Invite Room Code Button
    const btnCopyInvite = document.getElementById('btn-copy-invite');
    if (btnCopyInvite) {
      btnCopyInvite.addEventListener('click', () => {
        const codeInput = document.getElementById('share-room-code');
        if (codeInput) {
          navigator.clipboard.writeText(codeInput.value);
          alert(`Room Code ${codeInput.value} copied to clipboard! Share it with a friend.`);
          window.soundEngine.playClick();
        }
      });
    }

    // Join Room
    if (btnJoinRoom) {
      btnJoinRoom.addEventListener('click', () => {
        const code = inputRoomCode ? inputRoomCode.value.trim() : '';
        if (!code) {
          alert('Please enter a valid room code (e.g. CX-7842)');
          return;
        }
        alert(`Joined Room ${code}! Connected to host opponent.`);
        this.startOnlineMatch('Room Host (' + code + ')', 1600);
      });
    }

    // Lobby Challenge Buttons
    document.querySelectorAll('.btn-join-challenge').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-player') || 'Online Challenger';
        const elo = parseInt(btn.getAttribute('data-elo')) || 1600;
        this.startOnlineMatch(name, elo);
      });
    });

    // Voice Chat Toggle
    const btnToggleVoice = document.getElementById('btn-toggle-voice');
    const voiceStatusText = document.getElementById('voice-status-text');
    if (btnToggleVoice && voiceStatusText) {
      btnToggleVoice.addEventListener('click', () => {
        if (this.voiceStatus === 'Disabled') {
          this.voiceStatus = 'Connected 🟢';
          voiceStatusText.innerText = 'Connected 🟢';
          btnToggleVoice.style.borderColor = 'var(--success)';
        } else {
          this.voiceStatus = 'Disabled';
          voiceStatusText.innerText = 'Disabled';
          btnToggleVoice.style.borderColor = 'var(--border-glass)';
        }
        window.soundEngine.playClick();
      });
    }

    // Lobby Chat Box
    const btnSendLobbyChat = document.getElementById('btn-send-lobby-chat');
    const inputLobbyChat = document.getElementById('input-lobby-chat');
    const lobbyChatMessages = document.getElementById('lobby-chat-messages');

    if (btnSendLobbyChat && inputLobbyChat && lobbyChatMessages) {
      const sendMessage = () => {
        const text = inputLobbyChat.value.trim();
        if (!text) return;

        // Append user message
        const userMsgDiv = document.createElement('div');
        userMsgDiv.innerHTML = `<strong style="color: var(--accent-cyan);">You:</strong> ${text}`;
        lobbyChatMessages.appendChild(userMsgDiv);
        inputLobbyChat.value = '';
        lobbyChatMessages.scrollTop = lobbyChatMessages.scrollHeight;
        window.soundEngine.playClick();

        // Simulate bot reply
        setTimeout(() => {
          const replies = [
            "Nice move analysis!",
            "Matchmaking is very active right now.",
            "I prefer the Cyber Neon theme, looks stunning.",
            "Minimax AI at Level 8 is a beast, watch out!",
            "Let's play! Challenge me in the active lobby list."
          ];
          const bots = ["TacticsGM", "DeepKnight", "AlphaMind", "ChessXBot", "CyberChess"];
          const idx = Math.floor(Math.random() * replies.length);
          const botReplyDiv = document.createElement('div');
          botReplyDiv.innerHTML = `<strong style="color: var(--warning);">${bots[idx]}:</strong> ${replies[idx]}`;
          lobbyChatMessages.appendChild(botReplyDiv);
          lobbyChatMessages.scrollTop = lobbyChatMessages.scrollHeight;
          window.soundEngine.playCheck();
        }, 1500);
      };

      btnSendLobbyChat.addEventListener('click', sendMessage);
      inputLobbyChat.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
      });
    }

    // Spectator Mode Click Event
    document.querySelectorAll('.btn-spectate-lobby').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetBtn = e.currentTarget;
        const p1 = targetBtn.getAttribute('data-p1') || 'Player A';
        const p2 = targetBtn.getAttribute('data-p2') || 'Player B';
        this.startSpectating(p1, p2);
      });
    });

    // Exit Spectating Button
    const btnExitSpectate = document.getElementById('btn-exit-spectate');
    if (btnExitSpectate) {
      btnExitSpectate.addEventListener('click', () => {
        this.stopSpectating();
      });
    }
  }

  startOnlineMatch(oppName, oppElo) {
    this.isVsAI = true; // Use engine for moves simulation
    this.isOnline = true;
    this.isSpectating = false;
    this.playerColor = 'w';
    this.flipped = false;
    this.timeControl = 300;

    this.startNewGame();
    const oppNameEl = document.getElementById('opp-name');
    const oppEloEl = document.getElementById('opp-elo');
    if (oppNameEl) oppNameEl.innerText = `🌐 ${oppName}`;
    if (oppEloEl) oppEloEl.innerText = `Online Player`;
    this.switchScreen('view-game');
    window.soundEngine.playVictory();
  }

  startSpectating(p1, p2) {
    if (this.spectateInterval) clearInterval(this.spectateInterval);
    this.isSpectating = true;
    this.isVsAI = false;
    this.isOnline = false;
    this.playerColor = 'w';
    this.flipped = false;
    this.timeControl = 0; // Unlimited time

    this.startNewGame();
    
    // Set names
    const oppNameEl = document.getElementById('opp-name');
    const oppEloEl = document.getElementById('opp-elo');
    if (oppNameEl) oppNameEl.innerText = p2;
    if (oppEloEl) oppEloEl.innerText = "Grandmaster";

    // Set spectator banner
    const banner = document.getElementById('spectator-banner');
    const matchText = document.getElementById('spectator-match-players');
    if (banner && matchText) {
      banner.style.display = 'flex';
      matchText.innerText = `${p1} vs ${p2}`;
    }

    this.switchScreen('view-game');
    window.soundEngine.playVictory();

    // Start auto move loop
    this.spectateInterval = setInterval(() => {
      if (!this.gameActive) {
        this.stopSpectating();
        return;
      }

      // Calculate move for turn
      const bestMove = this.ai.getBestMove(4);
      if (bestMove) {
        this.executeMove(bestMove);
      } else {
        this.stopSpectating();
      }
    }, 1500);
  }

  stopSpectating() {
    if (this.spectateInterval) {
      clearInterval(this.spectateInterval);
      this.spectateInterval = null;
    }
    this.isSpectating = false;
    
    const banner = document.getElementById('spectator-banner');
    if (banner) banner.style.display = 'none';

    this.switchScreen('view-online');
    alert('Simulated live spectating match ended!');
    window.soundEngine.playDefeat();
  }

  switchScreen(screenId) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-screen') === screenId);
    });
    document.querySelectorAll('.screen-section').forEach(sec => {
      sec.classList.toggle('active', sec.id === screenId);
    });
    window.soundEngine.playClick();
    if (screenId === 'view-game') {
      setTimeout(() => this.resizeCanvas(), 50);
    }
  }

  startNewGame() {
    this.engine.resetBoard();
    this.selectedSq = null;
    this.legalMoves = [];
    this.lastMove = null;
    this.gameActive = true;
    this.wTime = this.timeControl;
    this.bTime = this.timeControl;

    const oppNameEl = document.getElementById('opp-name');
    const oppEloEl = document.getElementById('opp-elo');

    if (!this.isOnline) {
      if (oppNameEl) oppNameEl.innerText = this.isVsAI ? `AI Level ${this.aiLevel}` : 'Player 2 (Friend)';
      if (oppEloEl) oppEloEl.innerText = this.isVsAI ? `AI Bot` : 'Local Play';
    }

    this.startClock();
    this.updateUI();
    this.render();

    // Trigger AI first move if playing as Black
    if (this.isVsAI && this.playerColor === 'b') {
      setTimeout(() => this.triggerAIMove(), 500);
    }
  }

  startClock() {
    if (this.clockInterval) clearInterval(this.clockInterval);
    if (this.timeControl === 0) {
      document.getElementById('player-clock').innerText = '∞';
      document.getElementById('opp-clock').innerText = '∞';
      return;
    }

    this.clockInterval = setInterval(() => {
      if (!this.gameActive) return;
      if (this.engine.turn === 'w') {
        this.wTime--;
        if (this.wTime <= 0) this.endGame('Time Out!', 'Black wins on time.');
      } else {
        this.bTime--;
        if (this.bTime <= 0) this.endGame('Time Out!', 'White wins on time.');
      }
      this.updateClockDisplay();
    }, 1000);
  }

  updateClockDisplay() {
    const format = (s) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    };

    const pClock = document.getElementById('player-clock');
    const oClock = document.getElementById('opp-clock');

    if (!pClock || !oClock) return;

    if (this.playerColor === 'w') {
      pClock.innerText = format(this.wTime);
      oClock.innerText = format(this.bTime);
      pClock.classList.toggle('active', this.engine.turn === 'w');
      oClock.classList.toggle('active', this.engine.turn === 'b');
    } else {
      pClock.innerText = format(this.bTime);
      oClock.innerText = format(this.wTime);
      pClock.classList.toggle('active', this.engine.turn === 'b');
      oClock.classList.toggle('active', this.engine.turn === 'w');
    }
  }

  handleCanvasClick(e) {
    if (!this.gameActive) return;
    if (this.isSpectating) return;
    if (this.isVsAI && this.engine.turn !== this.playerColor) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let c = Math.floor(x / this.sqSize);
    let r = Math.floor(y / this.sqSize);

    if (this.flipped) {
      r = 7 - r;
      c = 7 - c;
    }

    if (r < 0 || r > 7 || c < 0 || c > 7) return;

    // Check if square is a legal move target
    const targetMove = this.legalMoves.find(m => m.to.r === r && m.to.c === c);

    if (targetMove) {
      // Check for pawn promotion
      const piece = this.engine.getPiece(targetMove.from.r, targetMove.from.c);
      if (piece && piece[1] === 'P' && (r === 0 || r === 7)) {
        this.pendingPromotionMove = targetMove;
        document.getElementById('modal-promotion').classList.add('active');
        return;
      }
      this.executeMove(targetMove);
    } else {
      // Select square if piece belongs to active turn
      const piece = this.engine.getPiece(r, c);
      if (piece && piece[0] === this.engine.turn) {
        this.selectedSq = { r, c };
        const allLegal = this.engine.getLegalMoves();
        this.legalMoves = allLegal.filter(m => m.from.r === r && m.from.c === c);
        window.soundEngine.playClick();
      } else {
        this.selectedSq = null;
        this.legalMoves = [];
      }
    }
    this.render();
  }

  executeMove(move, promotionType = 'Q') {
    const result = this.engine.makeMove(move, promotionType);
    this.lastMove = move;
    this.selectedSq = null;
    this.legalMoves = [];

    // Trigger Audio & VFX
    if (result.isCapture) {
      window.soundEngine.playCapture();
      const canvasX = (this.flipped ? 7 - move.to.c : move.to.c) * this.sqSize + this.sqSize / 2;
      const canvasY = (this.flipped ? 7 - move.to.r : move.to.r) * this.sqSize + this.sqSize / 2;
      if (window.vfxEngine) window.vfxEngine.triggerCapture(canvasX, canvasY);
    } else {
      window.soundEngine.playMove();
    }

    if (result.isCheck) {
      window.soundEngine.playCheck();
      if (window.vfxEngine) window.vfxEngine.triggerShake(6, 200);
    }

    this.updateUI();
    this.render();

    // Check game over
    if (result.isCheckmate) {
      const winner = this.engine.turn === 'w' ? 'Black' : 'White';
      this.endGame('🏆 Checkmate!', `${winner} wins the match!`);
      return;
    } else if (result.isStalemate) {
      this.endGame('⚖️ Stalemate', 'The match ended in a draw.');
      return;
    }

    // Trigger AI Move if VS AI mode
    if (this.isVsAI && this.engine.turn !== this.playerColor && this.gameActive) {
      setTimeout(() => this.triggerAIMove(), 400);
    }
  }

  triggerAIMove() {
    if (!this.gameActive) return;
    const aiMove = this.ai.getBestMove(this.aiLevel);
    if (aiMove) {
      this.executeMove(aiMove);
    }
  }

  showHint() {
    if (!this.gameActive) return;
    const best = this.ai.getBestMove(this.aiLevel);
    if (best) {
      this.selectedSq = best.from;
      this.legalMoves = [best];
      this.render();
      window.soundEngine.playClick();
    }
  }

  undoMove() {
    if (!this.gameActive) return;
    this.engine.undoMove();
    if (this.isVsAI) this.engine.undoMove(); // Undo AI move as well
    this.selectedSq = null;
    this.legalMoves = [];
    this.updateUI();
    this.render();
    window.soundEngine.playClick();
  }

  endGame(title, body) {
    this.gameActive = false;
    if (this.clockInterval) clearInterval(this.clockInterval);

    const titleEl = document.getElementById('game-over-title');
    const bodyEl = document.getElementById('game-over-body');
    if (titleEl) titleEl.innerText = title;
    if (bodyEl) bodyEl.innerText = body;
    document.getElementById('modal-game-over').classList.add('active');

    if (title.includes('Victory') || title.includes('Checkmate')) {
      window.soundEngine.playVictory();
      if (window.vfxEngine) window.vfxEngine.triggerVictory();
    } else {
      window.soundEngine.playDefeat();
    }
  }

  updateUI() {
    // Render SAN move log
    const historyList = document.getElementById('history-list');
    if (historyList) {
      historyList.innerHTML = '';
      
      const history = this.engine.history;
      for (let i = 0; i < history.length; i += 2) {
        const row = document.createElement('div');
        row.className = 'history-row';
        const moveNum = Math.floor(i / 2) + 1;
        const wSan = this.formatMoveSan(history[i].move, history[i].piece);
        const bSan = history[i + 1] ? this.formatMoveSan(history[i + 1].move, history[i + 1].piece) : '';
        row.innerHTML = `<span>${moveNum}.</span><span>${wSan}</span><span>${bSan}</span>`;
        historyList.appendChild(row);
      }
      historyList.scrollTop = historyList.scrollHeight;
    }

    // Captured pieces trays
    const mat = this.engine.getMaterialDifference();
    const pCap = document.getElementById('player-captured');
    const oCap = document.getElementById('opp-captured');
    if (pCap) pCap.innerText = mat.diff > 0 ? `+${mat.diff}` : '';
    if (oCap) oCap.innerText = mat.diff < 0 ? `+${Math.abs(mat.diff)}` : '';
  }

  formatMoveSan(move, piece) {
    const files = ['a','b','c','d','e','f','g','h'];
    const pChar = piece[1] === 'P' ? '' : piece[1];
    const toSq = `${files[move.to.c]}${8 - move.to.r}`;
    return `${pChar}${toSq}`;
  }

  drawUnicodePiece(r, c, piece, sz) {
    const drawR = this.flipped ? 7 - r : r;
    const drawC = this.flipped ? 7 - c : c;
    const sym = this.pieceSymbols[piece] || '';

    this.ctx.font = `${sz * 0.72}px sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    this.ctx.fillStyle = piece[0] === 'w' ? '#FFFFFF' : '#1A1A1A';
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 6;
    this.ctx.shadowOffsetY = 3;

    this.ctx.fillText(sym, drawC * sz + sz / 2, drawR * sz + sz / 2 + 2);

    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetY = 0;
  }

  render() {
    if (!this.ctx) return;
    const sz = this.sqSize;

    // Read colors from CSS Computed Variables
    const style = getComputedStyle(document.documentElement);
    const cLight = style.getPropertyValue('--board-light').trim();
    const cDark = style.getPropertyValue('--board-dark').trim();
    const cHighlight = style.getPropertyValue('--square-highlight').trim();
    const cLastMove = style.getPropertyValue('--square-lastmove').trim();
    const cCheck = style.getPropertyValue('--square-check').trim();

    // 1. Draw 8x8 Board Squares
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const drawR = this.flipped ? 7 - r : r;
        const drawC = this.flipped ? 7 - c : c;

        this.ctx.fillStyle = (r + c) % 2 === 0 ? cLight : cDark;
        this.ctx.fillRect(drawC * sz, drawR * sz, sz, sz);
      }
    }

    // 2. Draw Last Move Highlight
    if (this.lastMove) {
      const fR = this.flipped ? 7 - this.lastMove.from.r : this.lastMove.from.r;
      const fC = this.flipped ? 7 - this.lastMove.from.c : this.lastMove.from.c;
      const tR = this.flipped ? 7 - this.lastMove.to.r : this.lastMove.to.r;
      const tC = this.flipped ? 7 - this.lastMove.to.c : this.lastMove.to.c;

      this.ctx.fillStyle = cLastMove;
      this.ctx.fillRect(fC * sz, fR * sz, sz, sz);
      this.ctx.fillRect(tC * sz, tR * sz, sz, sz);
    }

    // 3. Draw Selected Square & Legal Destination Dots
    if (this.selectedSq) {
      const sR = this.flipped ? 7 - this.selectedSq.r : this.selectedSq.r;
      const sC = this.flipped ? 7 - this.selectedSq.c : this.selectedSq.c;

      this.ctx.fillStyle = cHighlight;
      this.ctx.fillRect(sC * sz, sR * sz, sz, sz);

      // Draw Legal Move Indicators
      for (const m of this.legalMoves) {
        const mR = this.flipped ? 7 - m.to.r : m.to.r;
        const mC = this.flipped ? 7 - m.to.c : m.to.c;

        this.ctx.fillStyle = cHighlight;
        this.ctx.beginPath();
        this.ctx.arc(mC * sz + sz / 2, mR * sz + sz / 2, sz * 0.18, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // 4. Draw King in Check Alert Overlay
    if (this.engine.inCheck()) {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (this.engine.board[r][c] === this.engine.turn + 'K') {
            const kR = this.flipped ? 7 - r : r;
            const kC = this.flipped ? 7 - c : c;
            this.ctx.fillStyle = cCheck;
            this.ctx.fillRect(kC * sz, kR * sz, sz, sz);
          }
        }
      }
    }

    // 5. Draw Pieces
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.engine.board[r][c];
        if (piece) {
          const drawR = this.flipped ? 7 - r : r;
          const drawC = this.flipped ? 7 - c : c;

          if (this.imagesLoaded && this.pieceImages[piece]) {
            try {
              // Draw real vector pieces
              const padding = sz * 0.08;
              this.ctx.drawImage(
                this.pieceImages[piece],
                drawC * sz + padding,
                drawR * sz + padding,
                sz - 2 * padding,
                sz - 2 * padding
              );
            } catch (err) {
              console.warn("Failed to draw SVG piece, falling back to Unicode:", err);
              this.drawUnicodePiece(r, c, piece, sz);
            }
          } else {
            this.drawUnicodePiece(r, c, piece, sz);
          }
        }
      }
    }
  }

  bindAuthEvents() {
    const authBtn = document.getElementById('btn-header-auth');
    if (authBtn) {
      authBtn.addEventListener('click', () => {
        this.switchScreen('view-login');
      });
    }

    const avatar = document.getElementById('header-avatar');
    if (avatar) {
      avatar.addEventListener('click', () => {
        if (confirm('Do you want to log out of ChessX?')) {
          localStorage.removeItem('chessx_user');
          this.setupAuth();
          this.switchScreen('view-dashboard');
          window.soundEngine.playClick();
        }
      });
    }

    // Auth Tabs Switcher
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    if (tabLogin && tabRegister) {
      tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        formLogin.style.display = 'block';
        formRegister.style.display = 'none';
        window.soundEngine.playClick();
      });

      tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        formRegister.style.display = 'block';
        formLogin.style.display = 'none';
        window.soundEngine.playClick();
      });
    }

    // Google Sign-In Action
    const btnGoogle = document.getElementById('btn-google-login');
    if (btnGoogle) {
      btnGoogle.addEventListener('click', () => {
        const googleUser = {
          name: 'Grandmaster Google Player',
          email: 'player@gmail.com',
          provider: 'google',
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('chessx_user', JSON.stringify(googleUser));
        this.setupAuth();
        window.soundEngine.playVictory();
        alert('Successfully signed in with Google!');
        this.switchScreen('view-dashboard');
      });
    }

    // Email Login Submit
    if (formLogin) {
      formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const user = {
          name: email.split('@')[0],
          email: email,
          provider: 'email',
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('chessx_user', JSON.stringify(user));
        this.setupAuth();
        window.soundEngine.playClick();
        alert(`Welcome back, ${user.name}!`);
        this.switchScreen('view-dashboard');
      });
    }

    // Register Form Submit
    if (formRegister) {
      formRegister.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const user = {
          name: username,
          email: email,
          provider: 'email',
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('chessx_user', JSON.stringify(user));
        this.setupAuth();
        window.soundEngine.playVictory();
        alert(`Account created successfully! Welcome, ${username}.`);
        this.switchScreen('view-dashboard');
      });
    }

    // Password Eye Toggles
    const toggleLoginPass = document.getElementById('btn-toggle-login-pass');
    if (toggleLoginPass) {
      toggleLoginPass.addEventListener('click', () => {
        const input = document.getElementById('login-password');
        input.type = input.type === 'password' ? 'text' : 'password';
      });
    }

    const toggleRegPass = document.getElementById('btn-toggle-reg-pass');
    if (toggleRegPass) {
      toggleRegPass.addEventListener('click', () => {
        const input = document.getElementById('reg-password');
        input.type = input.type === 'password' ? 'text' : 'password';
      });
    }

    // Forgot Password Modal
    const linkForgot = document.getElementById('link-forgot-pass');
    const modalForgot = document.getElementById('modal-forgot-password');
    const btnCloseForgot = document.getElementById('btn-close-forgot');
    const btnSendReset = document.getElementById('btn-send-reset');

    if (linkForgot && modalForgot) {
      linkForgot.addEventListener('click', (e) => {
        e.preventDefault();
        modalForgot.classList.add('active');
      });
    }

    if (btnCloseForgot) {
      btnCloseForgot.addEventListener('click', () => {
        modalForgot.classList.remove('active');
      });
    }

    if (btnSendReset) {
      btnSendReset.addEventListener('click', () => {
        const email = document.getElementById('forgot-email').value;
        if (!email) {
          alert('Please enter your account email address.');
          return;
        }
        alert(`Password reset link sent to ${email}!`);
        modalForgot.classList.remove('active');
      });
    }
  }
}

// Instantiate App Controller on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  window.appController = new AppController();
});
