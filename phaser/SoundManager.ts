export class SoundManager {
    private ctx: AudioContext | null = null;
    private enabled: boolean = true;

    constructor() {
        try {
            // @ts-ignore
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        } catch (e) {
            console.error("Web Audio API not supported", e);
            this.enabled = false;
        }
    }

    private createOscillator(type: OscillatorType, frequency: number, duration: number, volume: number = 0.5) {
        if (!this.ctx || !this.enabled) return;

        // Resume context if suspended (browser autoplay policy)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

        gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playSelect() {
        // High pitched "pop"
        this.createOscillator('sine', 880, 0.1, 0.3); // A5
    }

    playSwap() {
        // "Whoosh" (approximate with slide)
        if (!this.ctx || !this.enabled) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playMatch() {
        // Pleasant major chord (C Major: C, E, G)
        setTimeout(() => this.createOscillator('sine', 523.25, 0.2, 0.3), 0);   // C5
        setTimeout(() => this.createOscillator('sine', 659.25, 0.2, 0.3), 50);  // E5
        setTimeout(() => this.createOscillator('sine', 783.99, 0.4, 0.3), 100); // G5
    }

    playInvalid() {
        // Low "error" buzz
        this.createOscillator('sawtooth', 150, 0.2, 0.2);
        setTimeout(() => this.createOscillator('sawtooth', 100, 0.2, 0.2), 100);
    }

    playGameOver() {
        // Sad descending tones
        setTimeout(() => this.createOscillator('triangle', 600, 0.3, 0.4), 0);
        setTimeout(() => this.createOscillator('triangle', 500, 0.3, 0.4), 300);
        setTimeout(() => this.createOscillator('triangle', 400, 0.3, 0.4), 600);
        setTimeout(() => this.createOscillator('triangle', 300, 1.0, 0.4), 900);
    }
}
