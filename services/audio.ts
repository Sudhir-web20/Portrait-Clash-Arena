class AudioService {
  private enabled = true;

  play(type: 'vote' | 'victory' | 'achievement' | 'whoosh') {
    if (!this.enabled) return;
    
    // Provide haptic feedback for mobile devices
    this.haptic(type);

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'vote') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'victory') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'achievement') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  }

  haptic(type: 'vote' | 'victory' | 'achievement' | 'whoosh') {
    if (!('vibrate' in navigator)) return;
    
    switch (type) {
      case 'vote':
        navigator.vibrate(10); // Light tap
        break;
      case 'victory':
        navigator.vibrate([20, 50, 20]); // Double tap
        break;
      case 'achievement':
        navigator.vibrate([100, 30, 100, 30, 150]); // Success pattern
        break;
      case 'whoosh':
        navigator.vibrate(5); // Ultra light
        break;
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

export const audioService = new AudioService();
