# Additional Appendix

> **ChessX Technical & Design Documentation**  
> **Document Version:** 1.0.0  
> **Status:** Approved Specification  

---

## A. REST & WebSocket API Quick Reference

### Auth Endpoints
- `POST /api/v1/auth/register`: Create new user account.
- `POST /api/v1/auth/login`: Authenticate and return JWT access/refresh tokens.
- `POST /api/v1/auth/refresh`: Issue new access token using valid refresh token.
- `POST /api/v1/auth/logout`: Revoke active refresh token.

### User & Leaderboard Endpoints
- `GET /api/v1/users/me`: Fetch current authenticated user profile.
- `PUT /api/v1/users/me`: Update profile details (bio, country, theme).
- `GET /api/v1/leaderboard/{category}`: Retrieve top 100 global rankings (`blitz`, `rapid`, `bullet`).

### Game & AI Endpoints
- `POST /api/v1/matches/create`: Create private or casual match room.
- `GET /api/v1/matches/history`: List user match history with pagination.
- `POST /api/v1/ai/move`: Query AI engine for best move given a FEN string and difficulty level.

### Real-Time WebSocket Endpoint
- `WS /ws/match/{game_id}?token={jwt_token}`: Real-time match state channel for board moves, clocks, and chat.

---

## B. Complete Project Folder Structure

```
chessx/
├── docs/                       # Project Documentation Suite (Volumes 1-10 + Appendix)
├── client/                     # Web & Mobile Client Application
│   ├── assets/                 # Graphics, Piece Sets, Audio Files, Icons
│   │   ├── pieces/             # Neo-Classic, Alpha, Cyber 3D SVG piece sets
│   │   ├── themes/             # Wood, Glass, Cyber, Marble board textures
│   │   └── audio/              # Move, Capture, Check, Victory sounds
│   ├── css/                    # Modular Vanilla CSS Tokens & Layouts
│   │   ├── variables.css       # Design Tokens (Colors, Typography)
│   │   ├── components.css      # Card, Button, Input, Modal Styles
│   │   └── board.css           # Chessboard & Particle Canvas Styles
│   ├── js/                     # Client JavaScript Logic
│   │   ├── engine/             # Client Move Validator & FEN Parser
│   │   ├── ui/                 # Screen Controller & Renderers
│   │   ├── vfx/                # Canvas Particle Engine & FX Shaders
│   │   └── audio/              # Sound Manager (Web Audio API)
│   └── index.html              # Main HTML5 Application Entrypoint
├── server/                     # FastAPI Backend Application
│   ├── app/                    # Application Source Package
│   ├── alembic/                # DB Migration Scripts
│   ├── tests/                  # PyTest Automated Test Suite
│   └── Dockerfile              # Production Docker Container Specification
└── README.md                   # Repository Overview
```

---

## C. Coding Standards & Naming Conventions

### Python (Backend)
- Adhere strictly to **PEP 8**.
- Use explicit type annotations for all function parameters and return values.
- Naming: `snake_case` for variables/functions, `PascalCase` for classes, `UPPER_CASE` for constants.
- Docstrings: Google style format for public methods and modules.

### JavaScript & CSS (Frontend)
- Naming: `camelCase` for JS variables/functions, `PascalCase` for components/classes.
- CSS: Follow BEM (Block-Element-Modifier) or CSS Variable Token naming conventions (e.g. `--color-primary`, `.board__square--selected`).

---

## D. Git Branching & Commit Workflow

ChessX follows the **GitFlow** branching model:

- `main`: Production-ready releases.
- `develop`: Integration branch for current sprint features.
- `feature/<feature-name>`: Short-lived branches created from `develop` for specific features (e.g. `feature/ai-minimax-pruning`).
- `bugfix/<issue-name>`: Patch branches for resolving triaged bugs.

### Commit Message Standard (Conventional Commits)
- `feat: add piece drag lift animation to board canvas`
- `fix: resolve clock desync on reconnect`
- `docs: update volume 3 engine bitboard specification`

---

## E. UI Design System Tokens

```css
:root {
  /* Color Tokens */
  --color-brand-primary: #6C5CE7;
  --color-brand-accent: #A29BFE;
  --color-secondary-cyan: #00CEC9;
  --color-success: #00B894;
  --color-warning: #FDCB6E;
  --color-danger: #D63031;
  --color-bg-dark-0: #0F0F1A;
  --color-bg-surface-1: #1A1A2E;
  --color-bg-surface-2: #16213E;

  /* Font Guidelines */
  --font-family-body: 'Inter', system-ui, sans-serif;
  --font-family-heading: 'Outfit', sans-serif;
  --font-family-mono: 'Fira Code', monospace;
}
```

---

## F. Third-Party Dependencies & License Audit

| Package / Library | License | Usage Purpose |
| :--- | :--- | :--- |
| **FastAPI** | MIT License | High-performance Python backend web framework. |
| **SQLAlchemy** | MIT License | Python SQL Toolkit and ORM. |
| **Redis / redis-py** | BSD 3-Clause | Caching, Session Store, & Pub/Sub broker. |
| **PyTest** | MIT License | Automated unit & integration testing framework. |
| **Playwright** | Apache 2.0 | End-to-end browser testing engine. |
| **Lucide Icons** | ISC License | Open-source vector UI icon set. |
| **Google Fonts (Inter, Outfit, Fira Code)** | SIL Open Font License (OFL) | Web typography design system fonts. |

---

*End of Additional Appendix & ChessX Documentation Suite*
