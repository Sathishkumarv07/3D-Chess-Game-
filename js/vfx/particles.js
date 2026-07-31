/* 2D Canvas Particle Engine & Visual Effects for ChessX */

class ParticleVFX {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.shakeDuration = 0;
    this.shakeIntensity = 0;
    this.boardEl = document.querySelector('.board-container');
    
    if (this.canvas) {
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.loop();
    }
  }

  resize() {
    if (!this.canvas) return;
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
