# Volume 2 – UI/UX Design

> **ChessX Technical & Design Documentation**  
> **Document Version:** 1.0.0  
> **Status:** Approved Specification  

---

## 1. Design System Foundations

### 1.1 Color Tokens & Palette
ChessX uses a dark-mode first design system designed for maximum focus, high contrast ratio, and premium feel:

- **Primary Brand Color**: `#6C5CE7` (Deep Indigo / Electric Violet)
- **Primary Hover/Accent**: `#A29BFE` (Soft Lavender)
- **Secondary Accent**: `#00CEC9` (Vibrant Cyan)
- **Success / Move Indicator**: `#00B894` (Emerald Green)
- **Warning / Check Alert**: `#FDCB6E` (Amber Gold)
- **Danger / Error / Mate**: `#D63031` (Crimson Red)
- **Background Dark Surface 0**: `#0F0F1A` (Deep Void)
- **Background Surface 1**: `#1A1A2E` (Dark Slate)
- **Background Surface 2**: `#16213E` (Elevated Card Slate)
- **Text Primary**: `#FFFFFF` (Pure White)
- **Text Secondary**: `#A0A5BA` (Muted Steel)

### 1.2 Typography Guidelines
- **Primary Font Family**: `'Inter', system-ui, -apple-system, sans-serif`
- **Heading Display Font**: `'Outfit', sans-serif`
- **Monospace Font (PGN / Notation / Clocks)**: `'Fira Code', monospace`
- **Scale**:
  - Display H1: `36px / 1.2` (Bold 700)
  - Section H2: `28px / 1.3` (SemiBold 600)
  - Component H3: `20px / 1.4` (Medium 500)
  - Body Text: `15px / 1.5` (Regular 400)
  - Caption / Badges: `12px / 1.4` (Regular 400)

---

## 2. Screen Specifications (16 Screens)

---

### Screen 1: Splash Screen

- **Purpose**: Initial application launch window, establishing brand identity while preloading essential static assets, sound sets, and establishing initial session handshakes.
- **Wireframe**:
```
+-------------------------------------------------------+
|                                                       |
|                                                       |
|                     [ CHESS X ]                       |
|               Master the Grandmaster Mind             |
|                                                       |
|             +---------------------------+             |
|             |======= Progress =======|  |             |
|             +---------------------------+             |
|                   Loading Assets...                   |
|                                                       |
+-------------------------------------------------------+
```
- **Components**: Animated Logo SVG, Subtitle text, Smooth Progress Bar, Status label text.
- **Layout**: Centered flexbox column layout on deep void background (`#0F0F1A`).
- **Navigation**: Automatically transitions to **Login** (if unauthenticated) or **Home Dashboard** (if valid JWT exists).
- **User Flow**: Launch App -> Asset Preload (0.8s - 1.5s) -> Session Check -> Target Screen.
- **Color Palette**: Dark Surface (`#0F0F1A`), Brand Primary (`#6C5CE7`), Accent Cyan (`#00CEC9`).
- **Typography**: Outfit H1 (48px), Inter Body (14px).
- **Icons**: Shield Chess King SVG logo.
- **Animations**: Logo pulsing glow, smooth progress fill (0ms to 100% ease-in-out), fade-out screen transition (300ms).
- **Validation**: Verifies local storage JWT token validity with `/api/v1/auth/verify`.
- **Responsive Design**: Full viewport width (`100vw`), height (`100vh`).
- **Accessibility**: Screen reader label `aria-label="ChessX Loading System"`, aria-live progress updates.

---

### Screen 2: Login Screen

- **Purpose**: Authenticate existing user accounts via email/username and password.
- **Wireframe**:
```
+-------------------------------------------------------+
|  < Back                                               |
|                    WELCOME BACK                       |
|                 Log in to ChessX                      |
|                                                       |
|   Email or Username                                   |
|   [ player@chessx.com                              ]  |
|                                                       |
|   Password                                            |
|   [ ****************                               ]  |
|   [ ] Remember Me                 Forgot Password?    |
|                                                       |
|   [               LOG IN BUTTON                   ]   |
|                                                       |
|   Don't have an account? Register Here                |
+-------------------------------------------------------+
```
- **Components**: Header, Email Input, Password Input (with show/hide toggle), Remember Me checkbox, Forgot Password link, Login Button, Social OAuth options (Google).
- **Layout**: Glassmorphic centered modal card (`#1A1A2E`, 20px blur, 1px border `#ffffff15`).
- **Navigation**:
  - Log In -> **Home Dashboard**
  - Register Here -> **Register Screen**
  - Forgot Password? -> **Forgot Password Screen**
- **User Flow**: Enter Credentials -> Click Submit -> Auth Validation -> Issue JWT -> Redirect to Dashboard.
- **Color Palette**: Surface Card (`#1A1A2E`), Brand Primary (`#6C5CE7`), Text White (`#FFFFFF`).
- **Typography**: Display H2 (28px), Body (15px), Caption (13px).
- **Icons**: Mail Icon, Lock Icon, Eye/Eye-Off Icon, Arrow Left.
- **Animations**: Card slide-up (400ms cubic-bezier), input focus outline glow, button active scale down (0.98).
- **Validation**: Non-empty fields, valid email format regex, server error banner display on 401 Unauthorized.
- **Responsive Design**: Stacked form fields on mobile (< 600px width).
- **Accessibility**: Accessible form labels, `tabindex` ordering, `aria-required="true"`.

---

### Screen 3: Register Screen

- **Purpose**: Create a new ChessX player account with username, email, and password.
- **Wireframe**:
```
+-------------------------------------------------------+
|  < Back                                               |
|                   CREATE ACCOUNT                      |
|                Join the ChessX Realm                  |
|                                                       |
|   Username                                            |
|   [ GrandmasterPro                                 ]  |
|   Email Address                                       |
|   [ user@domain.com                                ]  |
|   Password                                            |
|   [ ****************                               ]  |
|   Password Strength: [=== STRONG ===]                 |
|                                                       |
|   [              CREATE ACCOUNT                    ]  |
|                                                       |
|   Already have an account? Log In                     |
+-------------------------------------------------------+
```
- **Components**: Username input, Email input, Password input, Password Strength Indicator, Terms acceptance checkbox, Submit Button.
- **Layout**: Centered glassmorphic card (Max width 460px).
- **Navigation**:
  - Success -> **Home Dashboard**
  - Log In -> **Login Screen**
- **User Flow**: Enter Details -> Real-time strength & availability check -> Submit -> Automatic Auth -> Dashboard.
- **Color Palette**: Background Surface (`#1A1A2E`), Success (`#00B894`), Error (`#D63031`).
- **Typography**: H2 (28px), Body (15px).
- **Icons**: User Icon, Mail Icon, Shield Lock Icon.
- **Animations**: Real-time strength bar fill transition, shake animation on invalid submission.
- **Validation**: Username (3-20 chars alphanumeric), Email regex, Password (min 8 chars, 1 number, 1 special char).
- **Responsive Design**: Adaptive padding for screen heights < 700px.
- **Accessibility**: Real-time error messages tied with `aria-describedby`.

---

### Screen 4: Forgot Password Screen

- **Purpose**: Initiate account recovery by sending a password reset token/link to registered email.
- **Wireframe**:
```
+-------------------------------------------------------+
|  < Back to Login                                      |
|                  RESET PASSWORD                       |
|   Enter your email to receive recovery instructions.  |
|                                                       |
|   Email Address                                       |
|   [ user@domain.com                                ]  |
|                                                       |
|   [            SEND RESET LINK                     ]  |
+-------------------------------------------------------+
```
- **Components**: Back Button, Instructional text, Email Input field, Send Reset Link Button, Success alert banner.
- **Layout**: Minimalist centered card layout.
- **Navigation**:
  - Back -> **Login Screen**
  - Success -> Email Sent Banner -> Return to Login.
- **User Flow**: Enter Email -> Click Send -> Receive API Confirmation -> Show check-email notice.
- **Color Palette**: Dark Slate (`#1A1A2E`), Accent Violet (`#6C5CE7`).
- **Typography**: H2 (24px), Body (14px).
- **Icons**: Mail Send Icon, Checkmark Circle Icon.
- **Animations**: Button spinner during HTTP request, success card reveal.
- **Validation**: Valid email address string required.
- **Responsive Design**: Fully responsive scaling.
- **Accessibility**: Focus ring on reset button and clear status announcements.

---

### Screen 5: Home Dashboard Screen

- **Purpose**: Main hub for navigation, quick matchmaking launch, news, current statistics, and user status.
- **Wireframe**:
```
+-------------------------------------------------------------------+
| CHESSX  [Play] [Lobby] [Tournaments] [Leaderboard]  (P) User123   |
+-------------------------------------------------------------------+
|  +---------------------------+  +-------------------------------+ |
|  | QUICK PLAY                |  | USER QUICK STATS              | |
|  | [ Vs AI Opponent        ] |  | Elo: 1540 | Wins: 42 | Loss: 12| |
|  | [ Online Matchmaking    ] |  +-------------------------------+ |
|  | [ Pass & Play Offline   ] |  | RECENT MATCHES                | |
|  |                           |  | vs PlayerX (Win +12 Elo)      | |
|  +---------------------------+  | vs Bot_Pro (Loss -8 Elo)      | |
|  +---------------------------+  +-------------------------------+ |
|  | DAILY CHESS PUZZLE        |  | ACTIVE TOURNAMENTS            | |
|  | Mate in 2 [Solve Now]     |  | Blitz Masters - 14:00 UTC     | |
|  +---------------------------+  +-------------------------------+ |
+-------------------------------------------------------------------+
```
- **Components**: Navigation Navbar, User Info Header, Quick Play Action Cards, Daily Puzzle Banner, Recent Matches Widget, Active Tournaments List.
- **Layout**: CSS Grid 2-Column Desktop layout / 1-Column Mobile layout.
- **Navigation**: Direct access to all core volumes and screens via top bar or quick action cards.
- **User Flow**: Dashboard -> Select Play Mode -> Transition to Board / Lobby / AI Selection.
- **Color Palette**: Dark Void (`#0F0F1A`), Card Surface (`#1A1A2E`), Accent Cyan (`#00CEC9`).
- **Typography**: H1 Header (28px), Section Title (20px), Card Body (15px).
- **Icons**: Sword Play Icon, Trophy Icon, Bot Icon, User Avatar, Fire Icon.
- **Animations**: Hover elevation (y-axis -4px, shadow expand), smooth card entry.
- **Validation**: Automatic token refresh check in background.
- **Responsive Design**: Collapsible mobile drawer menu (< 850px viewport).
- **Accessibility**: Keyboard navigable grid items, `role="navigation"`, high contrast card outlines.

---

### Screen 6: Profile Screen

- **Purpose**: Display user avatar, rating breakdown (Bullet, Blitz, Rapid, Classical), match statistics, achievements, and account metadata.
- **Wireframe**:
```
+-------------------------------------------------------------------+
| < Dashboard                       PLAYER PROFILE                  |
| +---------------------------------------------------------------+ |
| | [ AVATAR ]  GrandmasterPro (Elo: 1850) [Edit Profile]        | |
| | Member since: Jan 2026 | Country: USA                          | |
| +---------------------------------------------------------------+ |
| | RATINGS: Blitz: 1850 | Rapid: 1720 | Bullet: 1910 | vs AI: 2100 | |
| +---------------------------------------------------------------+ |
| | ACHIEVEMENTS: [First Win] [10 Win Streak] [Puzzle Master]     | |
| +---------------------------------------------------------------+ |
+-------------------------------------------------------------------+
```
- **Components**: Avatar uploader/picker, Username badge, Elo Rating cards, Performance charts (Win/Loss/Draw ratios), Achievement badges array, Edit Profile Modal trigger.
- **Layout**: Top profile banner with 3-column stats cards underneath.
- **Navigation**: Dashboard -> Profile -> Edit Modal -> Match History.
- **User Flow**: View stats -> Click achievement to read details -> Edit bio/avatar.
- **Color Palette**: Slate Surface (`#1A1A2E`), Accent Lavender (`#A29BFE`), Gold (`#FDCB6E`).
- **Typography**: Display Name (26px), Stat Numbers (22px Bold), Labels (13px).
- **Icons**: Shield, Star, Crown, Edit Pencil, Flag.
- **Animations**: Stat counting numbers animation on mount, badge hover shine effect.
- **Validation**: Bio max 250 chars, image upload format check (PNG/JPG < 2MB).
- **Responsive Design**: Stacked stat cards on narrow viewports.
- **Accessibility**: Descriptive alt tags for avatars and badges.

---

### Screen 7: Settings Screen

- **Purpose**: Configure gameplay options, sound volumes, visual themes, piece sets, and security settings.
- **Wireframe**:
```
+-------------------------------------------------------------------+
| < Dashboard                         SETTINGS                      |
| [ Gameplay ] [ Audio & VFX ] [ Board Theme ] [ Account Security ] |
|                                                                   |
| BOARD THEME PREVIEW                 PIECE SET                     |
| +---------------+                   +---------------+             |
| |  WOOD THEME   |                   |  NEO-CLASSIC  |             |
| +---------------+                   +---------------+             |
|                                                                   |
| [x] Enable Sound Effects     Volume: [========|====] 80%          |
| [x] Enable Particle Effects  (Fire/Lightning/Glow)                |
| [x] Highlight Legal Moves    [x] Auto-Queen Promotion             |
|                                                                   |
| [ SAVE PREFERENCES ]                                              |
+-------------------------------------------------------------------+
```
- **Components**: Tabbed settings switcher, Theme thumbnail previews, Piece set selectors, Audio sliders, VFX toggles, Gameplay switches, Save Button.
- **Layout**: Tabbed configuration grid with live preview panel.
- **Navigation**: Dashboard -> Settings -> Save -> Returns instant board theme state update.
- **User Flow**: Select Theme -> Live preview updates -> Toggle audio -> Click Save Preferences.
- **Color Palette**: Dark Void (`#0F0F1A`), Accent Primary (`#6C5CE7`), Cyan (`#00CEC9`).
- **Typography**: Tab Title (18px), Setting Label (15px).
- **Icons**: Gear Icon, Volume Icon, Palette Icon, Lock Icon.
- **Animations**: Live theme preview transition, toggle switch slide animation (200ms).
- **Validation**: Values saved immediately to LocalStorage and synced to backend user preferences API.
- **Responsive Design**: Scrolling vertical tabs on mobile.
- **Accessibility**: Full keyboard support for sliders and toggle switches (`role="switch"`).

---

### Screen 8: AI Selection Screen

- **Purpose**: Select AI opponent difficulty level, time controls, playing color (White/Black/Random), and assist options before starting a match vs computer.
- **Wireframe**:
```
+-------------------------------------------------------------------+
| < Dashboard                     SELECT AI OPPONENT                |
|                                                                   |
|  DIFFICULTY LEVEL                                                 |
|  ( ) Level 1 - Novice (800 Elo)                                   |
|  ( ) Level 5 - Intermediate (1500 Elo)                            |
|  (•) Level 10 - Grandmaster (2800 Elo)                            |
|                                                                   |
|  PLAY AS                                TIME CONTROL              |
|  [ WHITE ] [ RANDOM ] [ BLACK ]         [ 5 Min Blitz      V ]    |
|                                                                   |
|  OPTIONS:                                                         |
|  [x] Allow Move Hints    [x] Allow Undo Move                      |
|                                                                   |
|  [                     START GAME VS AI                         ] |
+-------------------------------------------------------------------+
```
- **Components**: Level slider/radio selection (Levels 1 to 10), Color Selector buttons, Time Control dropdown, Assist Toggles (Undo/Hints), Start Game button.
- **Layout**: Centered multi-option selection box.
- **Navigation**: Dashboard -> AI Selection -> **Chess Board Screen**.
- **User Flow**: Pick Level -> Choose Color -> Set Time -> Click Start -> Initialize Game State.
- **Color Palette**: Surface (`#1A1A2E`), Active Violet (`#6C5CE7`), Emerald Green (`#00B894`).
- **Typography**: H2 (26px), Level Badge (16px Bold).
- **Icons**: Robot Icon, Clock Icon, Lightbulb Hint Icon, Undo Icon.
- **Animations**: Level selector active glow border, start button pulse.
- **Validation**: Time control selection must be non-null.
- **Responsive Design**: Vertical button stacks for color choice on narrow screens.
- **Accessibility**: Radiogroup semantics (`role="radiogroup"`), aria-checked states.

---

### Screen 9: Online Lobby Screen

- **Purpose**: Browse active public rooms, initiate quick matchmaking queues, or create custom private match rooms with room codes.
- **Wireframe**:
```
+-------------------------------------------------------------------+
| < Dashboard                       ONLINE LOBBY                    |
| [ QUICK MATCHMAKING ]                 [ CREATE PRIVATE ROOM ]     |
| Mode: [ 3+0 Bullet ] [ 5+3 Blitz V ]                              |
|                                                                   |
| OPEN MATCH ROOMS                                                  |
| Player Name         Rating      Time Control    Action            |
| ----------------------------------------------------------------- |
| ChessMaster99       1640        5+0 Blitz       [ JOIN MATCH ]    |
| KnightRider         1420        10+0 Rapid      [ JOIN MATCH ]    |
| Rookie2026          1100        3+2 Bullet      [ JOIN MATCH ]    |
+-------------------------------------------------------------------+
```
- **Components**: Quick Match button, Create Room button, Mode Filter Dropdown, Public Rooms Table, Room Code Input box for direct join.
- **Layout**: Header control bar over full-width rooms table.
- **Navigation**: Lobby -> Quick Match Queue / Room Join -> **Chess Board Screen**.
- **User Flow**: Click Quick Match -> Display Queue Modal ("Searching for opponent...") -> Match Found -> Navigate to Board.
- **Color Palette**: Dark Void (`#0F0F1A`), Table Surface (`#1A1A2E`), Action Cyan (`#00CEC9`).
- **Typography**: Table Header (14px Bold), Row Text (14px Regular).
- **Icons**: Globe Icon, Key Room Code Icon, Search Spinner.
- **Animations**: Searching radar wave animation in matchmaking popup, table row hover highlight.
- **Validation**: Private room code validation (6-character alphanumeric).
- **Responsive Design**: Rooms converted to mobile card list format under 720px width.
- **Accessibility**: Live region status announcements when match searching.

---

### Screen 10: Tournament Screen

- **Purpose**: View ongoing, upcoming, and completed tournaments; register for events; track tournament bracket trees.
- **Wireframe**:
```
+-------------------------------------------------------------------+
| < Dashboard                       TOURNAMENT HUB                  |
| [ Active Events ] [ Upcoming ] [ Completed ]                      |
|                                                                   |
| +---------------------------------------------------------------+ |
| | WEEKEND BLITZ CHAMPIONSHIP                                    | |
| | Format: Swiss (5 Rounds) | Players: 64/128 | Prize: Gold Badge| |
| | Starts In: 01h 24m 12s                       [ REGISTER NOW ] | |
| +---------------------------------------------------------------+ |
|                                                                   |
| BRACKET PREVIEW (Swiss Standings)                                 |
| Rank 1: MasterMind (4.5 pts) | Rank 2: ChessWizard (4.0 pts)      |
+-------------------------------------------------------------------+
```
- **Components**: Event status tabs, Tournament Hero Card, Countdown Timer, Registration Action button, Live Swiss/Knockout Bracket Tree viewer.
- **Layout**: Main featured event banner over interactive standings/bracket grid.
- **Navigation**: Dashboard -> Tournament Hub -> Register -> Join Tournament Board.
- **User Flow**: Select Event -> View Rules & Bracket -> Click Register -> Auto-redirected when round starts.
- **Color Palette**: Surface (`#1A1A2E`), Gold Accent (`#FDCB6E`), Primary Violet (`#6C5CE7`).
- **Typography**: Tournament Title (22px Bold), Timer (20px Monospace).
- **Icons**: Trophy Icon, Calendar Clock Icon, Users Group Icon.
- **Animations**: Real-time countdown timer tick, bracket zoom/pan controls.
- **Validation**: Rating eligibility validation (e.g. Under-1600 tournament limits).
- **Responsive Design**: Horizontal swipeable bracket view on mobile.
- **Accessibility**: Accessible tree navigation attributes for bracket viewers.

---

### Screen 11: Leaderboard Screen

- **Purpose**: Display top-ranked global chess players categorized by match type (Overall, Blitz, Rapid, Bullet).
- **Wireframe**:
```
+-------------------------------------------------------------------+
| < Dashboard                     GLOBAL LEADERBOARD                |
| [ Overall ] [ Blitz ] [ Rapid ] [ Bullet ]                        |
|                                                                   |
| Rank    Player               Rating      Win Rate    Games        |
| ----------------------------------------------------------------- |
|  #1 👑  GrandmasterZero      2840 Elo    78.4%       1,420        |
|  #2 🥈  AlphaChess           2790 Elo    74.2%       980          |
|  #3 🥉  TacticsKing          2710 Elo    71.0%       2,150        |
|  ...                                                              |
|  #142   You (User123)        1540 Elo    55.1%       120          |
+-------------------------------------------------------------------+
```
- **Components**: Category Tabs, Search Bar (Find Player), Leaderboard Table, Top 3 Podium Highlights, User Rank Sticky Footer.
- **Layout**: Top 3 visual podium cards followed by ranked data table.
- **Navigation**: Dashboard -> Leaderboard -> Click Row -> View Target **Profile Screen**.
- **User Flow**: Select Category -> Filter by search -> View top players -> Inspect profiles.
- **Color Palette**: Slate (`#1A1A2E`), Gold (`#FDCB6E`), Silver (`#DFE6E9`), Bronze (`#CD7F32`).
- **Typography**: Rank Number (18px Bold), Rating (16px Monospace).
- **Icons**: Crown Icon, Medals (1st, 2nd, 3rd), Search Icon.
- **Animations**: Smooth table sorting transitions, podium shine effect.
- **Validation**: Search input debounce (300ms).
- **Responsive Design**: Collapses win rate and total games columns on narrow mobile screens.
- **Accessibility**: ARIA table roles (`role="table"`, `role="row"`, `role="cell"`).

---

### Screen 12: Match History Screen

- **Purpose**: Review past played games, filter by outcome (Win/Loss/Draw), download PGN files, and launch replay analysis.
- **Wireframe**:
```
+-------------------------------------------------------------------+
| < Profile                       MATCH HISTORY                     |
| Filter: [ All Matches V ]                                         |
|                                                                   |
| Date        Opponent         Result    Mode        Action         |
| ----------------------------------------------------------------- |
| 2026-07-19  Bot Level 8      WIN       vs AI       [ REPLAY/PGN ] |
| 2026-07-18  Player_X         LOSS      Online      [ REPLAY/PGN ] |
| 2026-07-15  CheckmateKid     DRAW      Online      [ REPLAY/PGN ] |
+-------------------------------------------------------------------+
```
- **Components**: Date range & outcome filter dropdowns, Match list table, Result indicators (Green Win, Red Loss, Grey Draw), Replay & Export PGN buttons.
- **Layout**: Vertical tabular list layout with search & filter header bar.
- **Navigation**: Profile -> Match History -> Click Replay -> Open Board in Replay Mode.
- **User Flow**: Browse History -> Click Replay -> Load FEN sequence onto Chess Board.
- **Color Palette**: Dark Void (`#0F0F1A`), Win Green (`#00B894`), Loss Red (`#D63031`).
- **Typography**: Date (13px), Result Badge (14px Bold).
- **Icons**: Download PGN Icon, Eye Replay Icon, Filter Icon.
- **Animations**: Row expand preview showing initial board position thumbnail.
- **Validation**: Paginated fetching (20 records per page).
- **Responsive Design**: Converts table rows into distinct match summary cards on mobile.
- **Accessibility**: Keyboard navigable table rows with explicit aria-labels.

---

### Screen 13: Chess Board Screen (Core Gameplay)

- **Purpose**: The central interactive game arena where moves are executed, clocks run, particle effects fire, and move logs record.
- **Wireframe**:
```
+-------------------------------------------------------------------+
| < Exit    [ Opponent: Bot Level 10 (2800) ]       Clock: 04:32    |
+-------------------------------------------------------------------+
|  +-----------------------+  Captured: p, p, n                     |
|  | r n b q k b n r | 8   |  ------------------------------------- |
|  | p p p p p p p p | 7   |  MOVE HISTORY                          |
|  | . . . . . . . . | 6   |  1. e4   e5                            |
|  | . . . . . . . . | 5   |  2. Nf3  Nc6                           |
|  | . . . . P . . . | 4   |  3. Bb5  a6                            |
|  | . . . . . . . . | 3   |  ------------------------------------- |
|  | P P P P . P P P | 2   |  [ Resign ] [ Offer Draw ] [ Hint ]    |
|  | R N B Q K B N R | 1   |                                        |
|  | a b c d e f g h       |  Captured: P, B                        |
|  +-----------------------+  ------------------------------------- |
|                             [ You: Player1 (1540) ]  Clock: 04:58 |
+-------------------------------------------------------------------+
```
- **Components**: Interactive 8x8 Board (HTML5 Canvas/SVG), Rank & File notation guides, Opponent & Player cards with active clocks, Captured pieces trays, Move notation log (SAN), In-game action bar (Resign, Draw, Hint, Undo), Evaluation Bar (optional).
- **Layout**: 2-Column layout (Board left, Clocks/Move log right) on Desktop; Vertical stacked layout on Mobile.
- **Navigation**: Lobby/AI -> Board -> Resign/Checkmate -> **Game Over Modal**.
- **User Flow**: Click piece -> Valid legal destination squares highlight -> Click destination square -> Piece slides/animates -> Board state updates -> Sound plays -> Clock toggles.
- **Color Palette**:
  - Light Squares: `#E0C9A6` (Wood Light) / `#34495E` (Cyber Dark)
  - Dark Squares: `#8B5A2B` (Wood Dark) / `#1C2833` (Cyber Light)
  - Move Highlight: `#00CEC9` translucent overlay
  - Check Alert: `#D63031` pulsing square background
- **Typography**: Clocks (24px Monospace Bold), SAN Notation (14px Monospace).
- **Icons**: Flag Resign Icon, Handshake Draw Icon, Lightbulb Hint Icon, Flip Board Icon.
- **Animations**: Piece drag/slide (150ms ease-out), capture particle explosion, king check red glow pulse.
- **Validation**: Strict client + server legal move verification (prevents illegal moves, pins, self-check).
- **Responsive Design**: Board dynamically resizes maintaining 1:1 aspect ratio (`max-width: 90vh`).
- **Accessibility**: Drag-and-drop & click-to-move input dual modes, keyboard move entry (`e2e4`), screen-reader move announcements ("Knight to F3").

---

### Screen 14: Game Over Screen (Modal / Overlay)

- **Purpose**: Announce match end outcome (Checkmate, Stalemate, Resignation, Time Out, Draw), show Elo adjustments, and offer rematch or analysis actions.
- **Wireframe**:
```
+-------------------------------------------------------+
|                   🏆 VICTORY!                         |
|           You won by Checkmate in 34 moves            |
|                                                       |
|   Elo Change: +16  (New Rating: 1556 Elo)             |
|   Accuracy: 88.4%  |  Best Move Streak: 12            |
|                                                       |
|   [ REMATCH ]    [ ANALYZE GAME ]    [ RETURN LOBBY ] |
+-------------------------------------------------------+
```
- **Components**: Result Header (Victory / Defeat / Draw), Outcome reason statement, Elo Rating Change badge, Game Accuracy percentage, Action buttons (Rematch, Analyze, Lobby).
- **Layout**: Centered modal overlay over darkened blurred chessboard.
- **Navigation**: Game Over -> Rematch (Reset Board) OR Analyze (Replay Mode) OR Lobby (**Online Lobby**).
- **User Flow**: Match ends -> Trigger Audio Victory/Defeat theme -> Spawn Particle Fireworks/Confetti -> Display Modal -> Player chooses next action.
- **Color Palette**: Victory Emerald (`#00B894`), Defeat Red (`#D63031`), Gold (`#FDCB6E`).
- **Typography**: Header (32px Bold), Elo Diff (20px Bold).
- **Icons**: Trophy, Cross Swords, Home, Replay Arrow.
- **Animations**: Particle fireworks eruption (1.5s), modal pop-in with elastic bounce (300ms).
- **Validation**: Rematch requires acceptance from both connected WebSocket players in online mode.
- **Responsive Design**: Full responsive scaling on mobile screens.
- **Accessibility**: Keyboard focus automatically pinned inside modal (`aria-modal="true"`).

---

### Screen 15: About Screen

- **Purpose**: Display platform version details, credits, software licenses, links to source repositories, and technology acknowledgements.
- **Wireframe**:
```
+-------------------------------------------------------------------+
| < Dashboard                         ABOUT CHESSX                  |
|                                                                   |
|   CHESSX PLATFORM v1.0.0 (Build 2026.07)                          |
|   Master the Grandmaster Mind                                     |
|                                                                   |
|   DEVELOPED BY:                                                   |
|   DeepMind Antigravity Engineering Team                           |
|                                                                   |
|   OPEN SOURCE ACKNOWLEDGEMENTS:                                   |
|   FastAPI, Python, Redis, PostgreSQL, Stockfish Evaluation Concepts|
|                                                                   |
|   [ View Github Repository ]         [ Open Source Licenses ]     |
+-------------------------------------------------------------------+
```
- **Components**: Logo banner, Version string badge, Developer Credits card, Open Source Third-Party Library acknowledgements, External links.
- **Layout**: Centered article column layout (Max width 600px).
- **Navigation**: Dashboard -> About.
- **User Flow**: Read info -> Open repository link or licenses popup.
- **Color Palette**: Dark Void (`#0F0F1A`), Card Surface (`#1A1A2E`), Link Lavender (`#A29BFE`).
- **Typography**: Version H2 (22px), Body Text (14px).
- **Icons**: Info Circle Icon, Github Logo, File Code License Icon.
- **Animations**: Smooth fade-in on render.
- **Validation**: External links open securely in new tab (`rel="noopener noreferrer"`).
- **Responsive Design**: Adapts cleanly to all screen sizes.
- **Accessibility**: High contrast text compliance.

---

### Screen 16: Help & Support Screen

- **Purpose**: Provide game rules reference, FAQ section, keyboard shortcuts cheat sheet, and user support bug reporting form.
- **Wireframe**:
```
+-------------------------------------------------------------------+
| < Dashboard                      HELP & SUPPORT                   |
| [ Rules of Chess ] [ Keyboard Shortcuts ] [ FAQ ] [ Report Bug ]  |
|                                                                   |
|  KEYBOARD SHORTCUTS CHEAT SHEET                                   |
|  Spacebar  : Flip Board Perspective                               |
|  Left Arrow: Step Back 1 Move                                     |
|  Right Arrow: Step Forward 1 Move                                 |
|  Z Key     : Request Undo                                         |
|                                                                   |
|  REPORT AN ISSUE                                                  |
|  Issue Category: [ Gameplay Bug V ]                               |
|  Description:    [ Write problem description...                 ] |
|                  [ SUBMIT TICKET ]                                |
+-------------------------------------------------------------------+
```
- **Components**: Accordion FAQ list, Keyboard shortcuts reference table, Chess rules quick guide, Issue reporting form (Category dropdown, Description textarea, Submit button).
- **Layout**: Tabbed accordion view with reporting form at bottom.
- **Navigation**: Dashboard -> Help & Support -> Submit -> Receive Confirmation.
- **User Flow**: Browse FAQ -> View shortcuts -> Fill bug form if needed -> Submit.
- **Color Palette**: Surface (`#1A1A2E`), Accent Primary (`#6C5CE7`), Warning Amber (`#FDCB6E`).
- **Typography**: Accordion Header (16px SemiBold), Code key badge (13px Monospace).
- **Icons**: Help Circle Icon, Keyboard Icon, Bug Icon, Send Ticket Icon.
- **Animations**: Accordion expand/collapse smooth max-height transition (250ms).
- **Validation**: Bug description must be at least 20 characters.
- **Responsive Design**: Stacked accordion panels on mobile.
- **Accessibility**: Keyboard navigable accordions (`aria-expanded="true/false"`).

---

*End of Volume 2 – UI/UX Design*
