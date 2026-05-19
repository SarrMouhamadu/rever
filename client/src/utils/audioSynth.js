/**
 * Web Audio API Synth to play high-end custom notification sounds without external audio assets.
 */
class AudioSynth {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(type = 'doux') {
    try {
      this.init();
      const now = this.ctx.currentTime;

      if (type === 'doux') {
        // Warm, cozy dual-tone chime (sine waves)
        this.playTone(523.25, 'sine', 0.15, now, 0.4); // C5
        this.playTone(659.25, 'sine', 0.15, now + 0.08, 0.3); // E5
      } else if (type === 'alerte') {
        // High-pitched attention alert bleep
        this.playTone(880, 'triangle', 0.2, now, 0.3); // A5
        this.playTone(880, 'triangle', 0.15, now + 0.12, 0.3);
      } else if (type === 'cosmique') {
        // Spacey retro frequency sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.3);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (err) {
      console.warn('Web Audio playback failed:', err);
    }
  }

  playTone(freq, type, duration, startTime, volume) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export const audioSynth = new AudioSynth();
export default audioSynth;
