# Volume 6 – Database Design

> **ChessX Technical & Design Documentation**  
> **Document Version:** 1.0.0  
> **Status:** Approved Specification  

---

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    Users ||--o{ Games : "plays (white/black)"
    Users ||--o{ Moves : "executes"
    Users ||--o{ Friends : "has friends"
    Users ||--o{ Achievements : "earns"
    Users ||--o1 Statistics : "owns"
    Users ||--o{ Notifications : "receives"
    Users ||--o{ SavedGames : "saves"
    Users ||--o{ Reports : "submits/reported"
    Games ||--o{ Moves : "contains"
    Games ||--o{ SavedGames : "references"
    Users }|--|| Themes : "equipped theme"
    Leaderboard }|--|| Users : "references player"
```

---

## 2. Table Specifications (11 Tables)

### Table 1: `users`
Primary identity store for all registered players and platform administrators.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(32) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    avatar_url VARCHAR(512),
    bio TEXT,
    country_code VARCHAR(3),
    equipped_theme_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

### Table 2: `games`
Records every completed or ongoing match session.

```sql
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    white_player_id UUID REFERENCES users(id) ON DELETE SET NULL,
    black_player_id UUID REFERENCES users(id) ON DELETE SET NULL,
    game_mode VARCHAR(20) NOT NULL, -- 'vs_ai', 'online_casual', 'online_ranked', 'tournament'
    time_control VARCHAR(20) NOT NULL, -- '1+0', '3+2', '5+0', '10+0'
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'WHITE_WIN', 'BLACK_WIN', 'DRAW'
    end_reason VARCHAR(30), -- 'CHECKMATE', 'RESIGNATION', 'TIMEOUT', 'STALEMATE', 'AGREED_DRAW'
    final_fen VARCHAR(100) NOT NULL,
    pgn_data TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE
);
```

---

### Table 3: `moves`
Sequential log of every individual ply executed across matches.

```sql
CREATE TABLE moves (
    id BIGSERIAL PRIMARY KEY,
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ply_number INT NOT NULL,
    move_san VARCHAR(10) NOT NULL, -- e.g. 'Nf3'
    move_uci VARCHAR(6) NOT NULL,  -- e.g. 'g1f3'
    fen_after VARCHAR(100) NOT NULL,
    time_spent_ms INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

### Table 4: `leaderboard`
Calculated standing snapshots for rapid lookup.

```sql
CREATE TABLE leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(20) NOT NULL, -- 'BLITZ', 'RAPID', 'BULLET', 'OVERALL'
    elo_rating INT NOT NULL DEFAULT 1500,
    rank_position INT,
    games_played INT DEFAULT 0,
    win_rate NUMERIC(5,2) DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_category UNIQUE (user_id, category)
);
```

---

### Table 5: `friends`
Social graph mapping player connections and friendship requests.

```sql
CREATE TABLE friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'BLOCKED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_friendship UNIQUE (user_id, friend_id)
);
```

---

### Table 6: `achievements`
Badges unlocked by players based on gameplay milestones.

```sql
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_key VARCHAR(50) NOT NULL, -- 'FIRST_WIN', 'WIN_STREAK_10', 'PUZZLE_MASTER'
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_badge UNIQUE (user_id, badge_key)
);
```

---

### Table 7: `statistics`
Detailed historical rating metrics per player.

```sql
CREATE TABLE statistics (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    blitz_elo INT DEFAULT 1500,
    rapid_elo INT DEFAULT 1500,
    bullet_elo INT DEFAULT 1500,
    ai_elo INT DEFAULT 1500,
    total_wins INT DEFAULT 0,
    total_losses INT DEFAULT 0,
    total_draws INT DEFAULT 0,
    best_win_streak INT DEFAULT 0,
    current_win_streak INT DEFAULT 0
);
```

---

### Table 8: `notifications`
In-app alerts and notifications system.

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL, -- 'FRIEND_REQUEST', 'TOURNAMENT_START', 'SYSTEM_ALERT'
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

### Table 9: `themes`
Visual board and piece set configurations.

```sql
CREATE TABLE themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    board_light_color VARCHAR(10) NOT NULL,
    board_dark_color VARCHAR(10) NOT NULL,
    piece_set_name VARCHAR(50) NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE
);
```

---

### Table 10: `saved_games`
Personal collections of bookmarked PGNs and match analysis.

```sql
CREATE TABLE saved_games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id UUID REFERENCES games(id) ON DELETE SET NULL,
    title VARCHAR(100) NOT NULL,
    notes TEXT,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

### Table 11: `reports`
Fair-play and moderation reporting table.

```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(50) NOT NULL, -- 'CHEATING_ENGINE', 'ABUSIVE_CHAT', 'STALLING'
    details TEXT,
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'REVIEWED', 'DISMISSED', 'ACTIONED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Database Indexes & Constraints

```sql
-- Indexes for High-Frequency Queries
CREATE INDEX idx_games_players ON games (white_player_id, black_player_id);
CREATE INDEX idx_games_status ON games (status);
CREATE INDEX idx_moves_game_id_ply ON moves (game_id, ply_number);
CREATE INDEX idx_leaderboard_category_elo ON leaderboard (category, elo_rating DESC);
CREATE INDEX idx_notifications_user_unread ON notifications (user_id, is_read);
```

---

## 4. Sample Record Insertions

```sql
-- Insert Sample User
INSERT INTO users (id, username, email, hashed_password) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'GrandmasterZero', 'gm@chessx.com', '$argon2id$v=19$m=65536,t=3,p=4$c2FsdHNhbHQ$hashhashhash');

-- Insert Sample Game
INSERT INTO games (id, white_player_id, black_player_id, game_mode, time_control, status, end_reason, final_fen) VALUES
('b11ebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, 'vs_ai', '5+0', 'WHITE_WIN', 'CHECKMATE', 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 5');
```

---

*End of Volume 6 – Database Design*
