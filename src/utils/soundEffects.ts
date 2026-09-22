// Web Audio API based real-time synthesizer for Kid YouTube Sound Effects (SFX)
// Zero external files, zero latency, lightweight and safe!

class SoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // 1. 띠용~ (Boing spring)
  playBoing() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.35);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.46);
  }

  // 2. 팡파레 / 레벨업 (Victory fanfare)
  playFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + (idx === 3 ? 0.6 : 0.25));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + (idx === 3 ? 0.65 : 0.3));
    });
  }

  // 3. 딩동댕 (Ding bell)
  playDing() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, now); // A6

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.82);
  }

  // 4. 찰칵! (Camera shutter)
  playCamera() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Click 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(800, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.05);

    // Shutter 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(300, now + 0.08);
    gain2.gain.setValueAtTime(0.25, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.2);
  }

  // 5. 삐빅 / 땡! (Buzzer)
  playBuzzer() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  // 6. 샤라랑~ 요정 반짝임 (Sparkle / Twinkle)
  playSparkle() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [1200, 1500, 1800, 2200, 2600, 3100];
    freqs.forEach((f, i) => {
      const t = now + i * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.32);
    });
  }
}

export const soundEffects = new SoundEngine();

export const SFX_BUTTONS = [
  { id: 'boing', name: '띠용~', emoji: '🎈', action: () => soundEffects.playBoing(), color: 'bg-amber-100 text-amber-900 hover:bg-amber-200' },
  { id: 'fanfare', name: '팡파레', emoji: '🎉', action: () => soundEffects.playFanfare(), color: 'bg-rose-100 text-rose-900 hover:bg-rose-200' },
  { id: 'ding', name: '딩동댕', emoji: '🔔', action: () => soundEffects.playDing(), color: 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200' },
  { id: 'sparkle', name: '샤라랑', emoji: '✨', action: () => soundEffects.playSparkle(), color: 'bg-purple-100 text-purple-900 hover:bg-purple-200' },
  { id: 'camera', name: '찰칵!', emoji: '📸', action: () => soundEffects.playCamera(), color: 'bg-sky-100 text-sky-900 hover:bg-sky-200' },
  { id: 'buzzer', name: '삐빅(땡)', emoji: '🚨', action: () => soundEffects.playBuzzer(), color: 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300' },
];
