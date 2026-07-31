/* Main UI Controller & Board Canvas Renderer for ChessX */

class AppController {
  constructor() {
    this.engine = new ChessEngine();
    this.ai = new ChessAI(this.engine);
    
    // Game State
    this.isVsAI = true;
    this.aiLevel = 5;
    this.playerColor = 'w';
    this.flipped = false;
    this.selectedSq = null;
    this.legalMoves = [];
    this.lastMove = null;
    this.pendingPromotionMove = null;
    
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
    this.bindEvents();
    this.bindAuthEvents();
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
    const themeSel = document.getElementById('settings-theme-select') || document.getElementById('theme-selector');
    if (themeSel) themeSel.value = savedTheme;
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
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.sqSize = this.canvas.width / 8;
    this.render();
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());

    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const targetScreen = item.getAttribute('data-screen');
        this.switchScreen(targetScreen);
        if (targetScreen === 'view-game' && !this.gameActive) {
          this.startNewGame();
        }
      });
    });

    document.getElementById('nav-brand').addEventListener('click', () => {
      this.switchScreen('view-dashboard');
    });

    // Theme Switcher
    document.getElementById('theme-selector').addEventListener('change', (e) => {
      const theme = e.target.value;
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('chessx_theme', theme);
      this.render();
      window.soundEngine.playClick();
    });

    // Sound Toggle
    document.getElementById('btn-toggle-sound').addEventListener('click', () => {
      const isMuted = window.soundEngine.toggleMute();
      document.getElementById('btn-toggle-sound').innerText = isMuted ? '🔇' : '🔊';
    });

    // Dashboard Actions
    document.getElementById('btn-quick-ai').addEventListener('click', () => {
      this.switchScreen('view-ai-select');
    });

    document.getElementById('btn-quick-pass').addEventListener('click', () => {
      this.isVsAI = false;
      this.startNewGame();
      this.switchScreen('view-game');
    });

    // AI Configuration Controls
    const aiRange = document.getElementById('ai-level-range');
    if (aiRange) {
      aiRange.addEventListener('input', (e) => {
        const lvl = parseInt(e.target.value);
        this.aiLevel = lvl;
        const elos = [800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2500, 2800];
        document.getElementById('level-elo-val').innerText = elos[lvl - 1];
      });
    }

    document.querySelectorAll('.color-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.color-choice').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.playerColor = btn.getAttribute('data-color');
      });
    });

    document.getElementById('btn-start-ai-match').addEventListener('click', () => {
      this.isVsAI = true;
      let color = this.playerColor;
      if (color === 'random') color = Math.random() < 0.5 ? 'w' : 'b';
      this.playerColor = color;
      this.flipped = color === 'b';
      this.timeControl = parseInt(document.getElementById('time-control-select').value);
      this.startNewGame();
      this.switchScreen('view-game');
    });

    // In-Game Action Bar
    document.getElementById('btn-hint').addEventListener('click', () => this.showHint());
    document.getElementById('btn-undo').addEventListener('click', () => this.undoMove());
    document.getElementById('btn-flip').addEventListener('click', () => {
      this.flipped = !this.flipped;
      this.render();
    });
    document.getElementById('btn-resign').addEventListener('click', () => this.endGame('Opponent Won', 'You resigned the match.'));
    
    const btnPlayGame = document.getElementById('btn-play-game');
    if (btnPlayGame) {
      btnPlayGame.addEventListener('click', () => {
        this.switchScreen('view-ai-select');
      });
    }

    // Canvas Pointer Click Logic
    if (this.canvas) {
      this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    }

    // Modal Action Buttons
    document.getElementById('btn-modal-rematch').addEventListener('click', () => {
      document.getElementById('modal-game-over').classList.remove('active');
      this.startNewGame();
    });

    document.getElementById('btn-modal-menu').addEventListener('click', () => {
      document.getElementById('modal-game-over').classList.remove('active');
      this.switchScreen('view-dashboard');
    });

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

    document.getElementById('opp-name').innerText = this.isVsAI ? `AI Level ${this.aiLevel}` : 'Player 2';
    document.getElementById('opp-elo').innerText = this.isVsAI ? `AI Bot` : 'Local Play';

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

    document.getElementById('game-over-title').innerText = title;
    document.getElementById('game-over-body').innerText = body;
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

    // Captured pieces trays
    const mat = this.engine.getMaterialDifference();
    document.getElementById('player-captured').innerText = mat.diff > 0 ? `+${mat.diff}` : '';
    document.getElementById('opp-captured').innerText = mat.diff < 0 ? `+${Math.abs(mat.diff)}` : '';
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
