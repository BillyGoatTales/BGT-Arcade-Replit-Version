export class MusicEngine {
  private audioContext: AudioContext | null = null;
  private backgroundMusic: AudioBuffer | null = null;
  private musicSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.3;

  constructor() {
    this.initializeAudio();
  }

  private initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = this.volume;
    } catch (error) {
      console.log('Audio not available');
    }
  }

  private createSynthTrack(frequency: number, duration: number): AudioBuffer {
    if (!this.audioContext) return null!;
    
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Create a more complex waveform for Web3/electronic music
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      
      // Main oscillator
      const main = Math.sin(2 * Math.PI * frequency * t);
      
      // Sub oscillator (octave down)
      const sub = Math.sin(2 * Math.PI * (frequency / 2) * t) * 0.3;
      
      // High frequency sparkle for Web3 feel
      const sparkle = Math.sin(2 * Math.PI * (frequency * 4) * t) * 0.1 * Math.sin(t * 2);
      
      // Apply envelope (fade in/out)
      const envelope = Math.min(t * 4, 1) * Math.max(1 - (t - duration + 1), 0);
      
      data[i] = (main + sub + sparkle) * envelope * 0.2;
    }

    return buffer;
  }

  public playBackgroundMusic(gameType: 'crypto' | 'bitcoin' | 'defi' = 'crypto') {
    if (!this.audioContext || !this.gainNode || this.isPlaying) return;

    try {
      // Create different melodies for different games
      const melodies = {
        crypto: [
          { freq: 220, duration: 0.5 }, // A3
          { freq: 277, duration: 0.5 }, // C#4
          { freq: 330, duration: 0.5 }, // E4
          { freq: 440, duration: 0.5 }, // A4
          { freq: 330, duration: 0.5 }, // E4
          { freq: 277, duration: 0.5 }, // C#4
          { freq: 220, duration: 1.0 }, // A3
        ],
        bitcoin: [
          { freq: 261, duration: 0.5 }, // C4
          { freq: 329, duration: 0.5 }, // E4
          { freq: 392, duration: 0.5 }, // G4
          { freq: 523, duration: 0.5 }, // C5
          { freq: 392, duration: 0.5 }, // G4
          { freq: 329, duration: 0.5 }, // E4
          { freq: 261, duration: 1.0 }, // C4
        ],
        defi: [
          { freq: 246, duration: 0.5 }, // B3
          { freq: 311, duration: 0.5 }, // D#4
          { freq: 369, duration: 0.5 }, // F#4
          { freq: 493, duration: 0.5 }, // B4
          { freq: 369, duration: 0.5 }, // F#4
          { freq: 311, duration: 0.5 }, // D#4
          { freq: 246, duration: 1.0 }, // B3
        ]
      };

      this.playMelodyLoop(melodies[gameType]);
      this.isPlaying = true;
    } catch (error) {
      console.log('Could not play background music');
    }
  }

  private playMelodyLoop(melody: { freq: number, duration: number }[]) {
    if (!this.audioContext || !this.gainNode) return;

    let currentTime = this.audioContext.currentTime;
    
    const playSequence = () => {
      melody.forEach((note, index) => {
        const noteBuffer = this.createSynthTrack(note.freq, note.duration);
        if (noteBuffer) {
          const source = this.audioContext!.createBufferSource();
          source.buffer = noteBuffer;
          source.connect(this.gainNode!);
          source.start(currentTime);
          currentTime += note.duration;
        }
      });

      // Schedule next loop
      if (this.isPlaying) {
        setTimeout(() => {
          if (this.isPlaying) playSequence();
        }, melody.reduce((sum, note) => sum + note.duration, 0) * 1000);
      }
    };

    playSequence();
  }

  public stopBackgroundMusic() {
    this.isPlaying = false;
    if (this.musicSource) {
      this.musicSource.stop();
      this.musicSource = null;
    }
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
  }

  public playSound(frequency: number, duration: number, type: OscillatorType = 'square') {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.value = 0.1;
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }
}