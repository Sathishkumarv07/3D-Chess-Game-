/* Synthesized Web Audio Engine for ChessX */

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
