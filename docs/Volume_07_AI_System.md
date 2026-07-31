# Volume 7 – AI System

> **ChessX Technical & Design Documentation**  
> **Document Version:** 1.0.0  
> **Status:** Approved Specification  

---

## 1. AI Architecture Overview

The ChessX AI Engine is an in-house evaluation and decision system combining **Minimax Search**, **Alpha-Beta Pruning**, **Piece-Square Table (PST) Positional Heuristics**, **PolyGlot Opening Books**, and **Syzygy Endgame Tablebases**.

```mermaid
graph TD
    Request[AI Move Request (FEN, Level)] --> BookCheck{Match in Opening Book?}
    BookCheck -- Yes --> PlayBook[Play Instant Book Move]
    BookCheck -- No --> CheckEndgame{Piece Count <= 5?}
    CheckEndgame -- Yes --> PlayTablebase[Query Syzygy Tablebase]
    CheckEndgame -- No --> Search[Iterative Deepening Minimax Search]
    Search --> AlphaBeta[Alpha-Beta Pruning + Move Ordering]
    AlphaBeta --> Eval[Static Board Evaluator]
    Eval --> ReturnMove[Return Best Move]
```

---

## 2. Minimax Algorithm & Alpha-Beta Pruning

The AI evaluates game trees using depth-limited **Minimax with Alpha-Beta Pruning**:

$$\alpha = \max(\alpha, \text{score}), \quad \beta = \min(\beta, \text{score})$$

If $\alpha \ge \beta$, the remaining subtrees are pruned immediately, drastically cutting evaluation nodes from $O(b^d)$ down to $O(b^{d/2})$.

```python
def alpha_beta(board: Board, depth: int, alpha: float, beta: float, is_maximizing: bool) -> float:
    if depth == 0 or board.is_game_over():
        return evaluate_board(board)

    moves = get_ordered_moves(board)
    if is_maximizing:
        max_eval = -float('inf')
        for move in moves:
            board.make_move(move)
            eval_score = alpha_beta(board, depth - 1, alpha, beta, False)
            board.undo_move()
            max_eval = max(max_eval, eval_score)
            alpha = max(alpha, eval_score)
            if beta <= alpha:
                break  # Beta Cutoff
        return max_eval
    else:
        min_eval = float('inf')
        for move in moves:
            board.make_move(move)
            eval_score = alpha_beta(board, depth - 1, alpha, beta, True)
            board.undo_move()
            min_eval = min(min_eval, eval_score)
            beta = min(beta, eval_score)
            if beta <= alpha:
                break  # Alpha Cutoff
        return min_eval
```

---

## 3. Move Ordering Heuristics

To maximize Alpha-Beta cutoffs, moves are sorted prior to evaluation:

1. **MVV-LVA (Most Valuable Victim - Least Valuable Attacker)**: Evaluates captures first (e.g. Pawn capturing Queen scored highest).
2. **Killer Moves**: Non-capture moves that previously caused a beta cutoff at the same ply level.
3. **History Heuristic**: Moves that frequently cause cutoffs across all positions stored in a global lookup table.
4. **Transposition Table (TT)**: Hash table storing previously searched positions using 64-bit Zobrist Hashing.

---

## 4. Board Evaluation Function

The evaluation function computes position evaluation $V$ in centipawns (100 centipawns = 1 Pawn):

$$V = V_{\text{material}} + V_{\text{positional}} + V_{\text{pawn\_structure}} + V_{\text{king\_safety}}$$

### 4.1 Material Weights
- Pawn = 100
- Knight = 320
- Bishop = 330
- Rook = 500
- Queen = 900
- King = 20000

### 4.2 Positional Piece-Square Tables (PST)
PSTs reward pieces occupying central controlling squares (e.g., Knights on `d4`/`e4`/`d5`/`e5` gain +20 bonus; Knights on rim squares `a1`/`h1` penalize -50).

---

## 5. Opening Book & Endgame Strategy

- **Opening Book**: PolyGlot binary book (`master_openings.bin`). For the first 8-12 plies, AI picks moves instantly with weighted randomness to ensure game variety.
- **Endgame Strategy**: When piece count $\le 5$, the engine triggers Syzygy Tablebase probing to execute 100% perfect theoretical endgames (e.g. King + Rook vs King).

---

## 6. Difficulty Level Scaling (Levels 1 - 10)

| Level | Target Elo | Max Search Depth | Random Error Rate | Time Budget |
| :--- | :--- | :--- | :--- | :--- |
| **Level 1** | 800 | Depth 1 | 35% random moves | < 50ms |
| **Level 2** | 1000 | Depth 2 | 20% random moves | < 80ms |
| **Level 3** | 1200 | Depth 3 | 10% random moves | < 120ms |
| **Level 4** | 1400 | Depth 4 | 5% random moves | < 200ms |
| **Level 5** | 1600 | Depth 5 | 0% (Pure Minimax) | < 350ms |
| **Level 6** | 1800 | Depth 6 | 0% | < 500ms |
| **Level 7** | 2000 | Depth 7 + TT | 0% | < 700ms |
| **Level 8** | 2200 | Depth 8 + TT | 0% | < 900ms |
| **Level 9** | 2500 | Depth 10 + TT | 0% | < 1200ms |
| **Level 10**| 2800+ | Depth 12+ Iterative | 0% | Max allocated budget |

---

## 7. Future AI Improvements (v2.0 Roadmap)

1. **NNUE (Efficiently Updatable Neural Networks)**: Integrate lightweight neural network evaluation functions for grandmaster-level positional understanding.
2. **Personalized Playstyles**: Introduce bot personas (Aggressive Tactical Bot, Defensive Positional Bot, Endgame Specialist).

---

*End of Volume 7 – AI System*
