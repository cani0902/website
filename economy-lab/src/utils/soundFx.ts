class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.055,
    delay = 0,
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playClick() {
    this.playTone(540, 0.07, 'triangle', 0.045);
  }

  playCoin() {
    this.playTone(987.77, 0.07, 'sine', 0.05, 0);
    this.playTone(1318.51, 0.14, 'sine', 0.055, 0.055);
  }

  playCashRegister() {
    this.playTone(659.25, 0.08, 'triangle', 0.05, 0);
    this.playTone(880, 0.14, 'sine', 0.06, 0.07);
  }

  playEventAlert() {
    this.playTone(587.33, 0.1, 'triangle', 0.06, 0);
    this.playTone(440, 0.15, 'triangle', 0.06, 0.1);
  }

  playSuccess() {
    this.playTone(523.25, 0.12, 'sine', 0.06, 0);
    this.playTone(659.25, 0.12, 'sine', 0.06, 0.1);
    this.playTone(783.99, 0.24, 'sine', 0.07, 0.2);
  }
}

export const soundFx = new SoundEffects();
