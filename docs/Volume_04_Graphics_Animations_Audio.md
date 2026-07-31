# Volume 4 – Graphics, Animations & Audio

> **ChessX Technical & Design Documentation**  
> **Document Version:** 1.0.0  
> **Status:** Approved Specification  

---

## 1. Graphics & Asset Specifications

### 1.1 Board Themes

ChessX features 4 distinct visual board themes rendered via high-resolution 2D Canvas or WebGL shaders:

| Theme Name | Light Square | Dark Square | Border Color | Aesthetic Style |
| :--- | :--- | :--- | :--- | :--- |
| **Classic Wood** | `#E0C9A6` (Mahogany) | `#8B5A2B` (Dark Walnut) | `#4A2E16` | Traditional polished wooden tournament board. |
| **Obsidian Glass** | `#34495E` (Translucent Gray) | `#1C2833` (Deep Obsidian) | `#0F171E` | Glassmorphic, modern minimalist style with subtle reflections. |
| **Cyberpunk Neon** | `#1A1C2E` (Electric Navy) | `#0F0E17` (Void Black) | `#6C5CE7` | Glowing gridlines with neon cyan/magenta square accents. |
| **Royal Marble** | `#E8E8E8` (Carrara White) | `#5A6B7C` (Slate Blue Marble)| `#2C3E50` | Elegant veined marble texture with polished finish. |

---

### 1.2 Piece Set Designs

1. **Neo-Classic 2D (Default)**: Clean, high-contrast vector piece set optimized for readability in fast time controls.
2. **Alpha Flat**: Modern geometric flat design piece set with soft shadows.
3. **Cyber 3D Iso**: Isometric pre-rendered 3D piece set with metallic shaders and dynamic edge lighting.

---

### 1.3 UI Icons & Background Shaders
- **Icon Set**: Custom SVG icon sprite system based on Lucide-Icons, styled with CSS variables (`--color-primary`, `--color-accent`).
- **Dynamic Backgrounds**: Animated SVG noise & gradient radial background shaders (`#0F0F1A` to `#16213E`) with slow particle drift.

---

## 2. Animations Framework

All client animations run on a 60 FPS requestAnimationFrame loop with hardware acceleration (`transform: translate3d`).

```mermaid
graph TD
    Trigger[Event Trigger: Piece Move] --> Calc[Compute Distance Vector deltaX, deltaY]
    Calc --> Ease[Apply Cubic-Bezier Curve cubic-bezier(0.25, 1, 0.5, 1)]
    Ease --> Render[Render Frame to Canvas (150ms duration)]
    Render --> Finish[Emit Motion Complete Callback]
```

### 2.1 Screen & UI Transitions
- **Splash Preloader**: Logo pulse scale `1.0 -> 1.05` over 1.2s infinite ease-in-out.
- **Login / Card Slide**: Slide-up transition `translateY(40px) -> translateY(0px)` with opacity fade `0 -> 1` (350ms).
- **Screen View Swapping**: Cross-fade opacity transition (200ms) with background blur adjustment.

---

### 2.2 Board & Gameplay Animations

| Animation Event | Duration | Curve / Easing | Visual Behavior |
| :--- | :--- | :--- | :--- |
| **Piece Move Slide** | 150ms | `cubic-bezier(0.25, 1, 0.5, 1)` | Piece slides smoothly from origin square center to target square center. |
| **Piece Drag Lift** | Instant | Direct Pointer Follow | Selected piece lifts up 15%, scales `1.15x`, casts drop shadow offset `(0px, 12px)`. |
| **Capture Blast** | 250ms | `ease-out` | Target piece scales down `1.0 -> 0.0` with 15-degree rotation while capture particle erupts. |
| **Pawn Promotion** | 400ms | `elastic.out(1, 0.5)` | Pawn transforms into radial light orb, exploding into selected promotion piece (Queen/Rook). |
| **Check Alert Pulse** | 600ms | Infinite Loop Pulse | Red square background overlay behind checked King pulses opacity `0.3 -> 0.8 -> 0.3`. |
| **Checkmate Impact** | 500ms | `bounce.out` | Dramatic camera zoom-in `1.0x -> 1.08x` on checked King with screen shake. |

---

## 3. Particle Systems & Visual Effects (VFX)

ChessX includes a lightweight 2D WebGL/Canvas Particle Engine capable of rendering up to 2,000 simultaneous particles without dropped frames:

```javascript
class Particle {
  constructor(x, y, color, vx, vy, life, size) {
    this.x = x; this.y = y;
    this.color = color;
    this.vx = vx; this.vy = vy;
    this.life = life; this.maxLife = life;
    this.size = size;
  }
  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    this.size *= 0.96; // Shrink over time
  }
}
```

### 3.1 VFX Catalog

1. **Fire Burst (Capture Effect)**: Spawns 35 orange/red particles upon heavy piece capture (Rook/Queen), drifting upward with gravity offset.
2. **Lightning Strike (Check Effect)**: Procedural lightning bolt line drawn from top of board down to King square on Check.
3. **Pawn Glow Trail**: Subtle blue particle stream following pawn during multi-square initial push.
4. **Screen Shake (Explosion)**: Translates board root container along random offset vectors `[-6px, +6px]` for 200ms on Checkmate or Queen capture.
5. **Camera Zoom (Mate Lens)**: Smooth CSS/WebGL camera focus scaling onto mating square.
6. **Victory Celebration (Fireworks & Confetti)**:
   - **Confetti**: 150 colorful rectangular paper particles tumbling with air resistance physics.
   - **Fireworks**: Rocket trails shooting up into screen center, bursting into radial multi-colored particle spheres.
   - **Space Celebration (Cyber Theme)**: Warp-speed starfield particles accelerating past board edges on grand victory.

---

## 4. Audio Architecture & Sound Design

Sound effects are synthesized or pre-loaded via **Web Audio API** for zero latency playback with polyphonic mixing and volume control.

```javascript
class SoundManager {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.buffers = new Map();
  }
  playSound(name, volume = 1.0, pitchShift = 1.0) {
    const source = this.ctx.createBufferSource();
    source.buffer = this.buffers.get(name);
    source.playbackRate.value = pitchShift;
    const gainNode = this.ctx.createGain();
    gainNode.gain.value = volume * globalAudioVolume;
    source.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    source.start(0);
  }
}
```

### 4.1 Audio Sound Asset Catalog

| Sound Asset | Audio File Format | Audio Description & Frequency | Trigger Condition |
| :--- | :--- | :--- | :--- |
| `move.wav` | WAV (44.1kHz 16-bit) | Soft wooden click impact (220Hz - 440Hz short envelope). | Executing standard non-capturing move. |
| `capture.wav` | WAV (44.1kHz 16-bit) | Deep wooden thud with subtle metallic snap (150Hz resonant). | Capturing an opponent piece. |
| `check.wav` | WAV (44.1kHz 16-bit) | Crisp brass alert tone / chime chord. | King placed in Check state. |
| `castle.wav` | WAV (44.1kHz 16-bit) | Double slide wooden shuffle sound. | Executing Kingside/Queenside castle. |
| `promote.wav` | WAV (44.1kHz 16-bit) | Ascending synth chime chord (C5 -> E5 -> G5). | Pawn promotion execution. |
| `victory.mp3` | MP3 (320kbps) | Triumphant orchestral brass fanfare (4 seconds). | Winning match via Checkmate / Resignation. |
| `defeat.mp3` | MP3 (320kbps) | Low brass minor chord decay tone (3 seconds). | Losing match via Checkmate / Resignation. |
| `button_click.wav`| WAV (44.1kHz 16-bit) | Ultra-short tactile UI click (12ms). | Clicking buttons/tabs across UI screens. |
| `bg_ambient.mp3` | MP3 (192kbps) | Relaxing, low-volume lo-fi ambient piano loop. | Optional background music toggle in Settings. |

---

*End of Volume 4 – Graphics, Animations & Audio*
