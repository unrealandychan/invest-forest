// Procedural Nature Soundscape Synthesizer via Web Audio API

export class SoundscapeService {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private windGain: GainNode | null = null;
  private streamGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  private initAudio() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleSoundscape(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public start(): void {
    if (this.isPlaying) return;
    this.initAudio();
    if (!this.ctx) return;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // 1. Procedural Wind (Filtered Pink/Brown Noise)
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.05;
      b1 = 0.96 * b1 + white * 0.11;
      b2 = 0.86 * b2 + white * 0.25;
      output[i] = (b0 + b1 + b2) * 0.3;
    }

    const windSource = this.ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.setValueAtTime(320, this.ctx.currentTime);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    windSource.connect(windFilter);
    windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);
    windSource.start();

    // 2. Procedural Gentle Water Stream (Resonant High-Passed Noise)
    const streamSource = this.ctx.createBufferSource();
    streamSource.buffer = noiseBuffer;
    streamSource.loop = true;

    const streamFilter = this.ctx.createBiquadFilter();
    streamFilter.type = 'bandpass';
    streamFilter.frequency.setValueAtTime(650, this.ctx.currentTime);
    streamFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    this.streamGain = this.ctx.createGain();
    this.streamGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    streamSource.connect(streamFilter);
    streamFilter.connect(this.streamGain);
    this.streamGain.connect(this.masterGain);
    streamSource.start();

    this.isPlaying = true;
  }

  public stop(): void {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;
    this.masterGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
    setTimeout(() => {
      this.ctx?.suspend();
      this.isPlaying = false;
    }, 500);
  }

  // Play serene bell/chime on DCA deposit
  public playPlantingChime(): void {
    try {
      this.initAudio();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, this.ctx.currentTime); // 528 Hz Solfeggio frequency
      osc.frequency.exponentialRampToValueAtTime(1056, this.ctx.currentTime + 0.8);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 1.2);
    } catch {
      // Audio autoplay policy fallback
    }
  }
}

export const soundscapeService = new SoundscapeService();
