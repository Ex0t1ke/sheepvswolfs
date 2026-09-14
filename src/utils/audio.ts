/**
 * Web Audio API synthesizer for Sheep vs Wolves
 * Realistic, pleasant organic game sound effects without external asset loading.
 */

let audioCtx: AudioContext | null = null;
let isMuted = false;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundMuted(muted: boolean) {
  isMuted = muted;
}

export function getSoundMuted(): boolean {
  return isMuted;
}

export function playButtonClick() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(480, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + 0.05);

  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.06);
}

export function playFencePlace() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Wood knock / thud effect
  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(220, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1);

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(140, ctx.currentTime);
  osc2.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.12);

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

  osc.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc2.start();
  osc.stop(ctx.currentTime + 0.12);
  osc2.stop(ctx.currentTime + 0.12);
}

export function playFenceRemove() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(320, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.09);
}

export function playSheepBleat() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const vibrato = ctx.createOscillator();
  const vibratoGain = ctx.createGain();

  // Vibrato (tremolo pitch modulation) for "Baaaaa"
  vibrato.frequency.setValueAtTime(7.5, now);
  vibratoGain.gain.setValueAtTime(18, now);
  vibrato.connect(osc.frequency);

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(330, now);
  osc.frequency.exponentialRampToValueAtTime(370, now + 0.15);
  osc.frequency.exponentialRampToValueAtTime(310, now + 0.4);

  // Bandpass filter to sound more vocal
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1200, now);
  filter.Q.setValueAtTime(3.5, now);

  gain.gain.setValueAtTime(0.01, now);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
  gain.gain.setValueAtTime(0.14, now + 0.25);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  vibrato.start(now);
  osc.start(now);
  vibrato.stop(now + 0.46);
  osc.stop(now + 0.46);
}

export function playWolfHowl() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(360, now + 0.35);
  osc.frequency.exponentialRampToValueAtTime(260, now + 0.7);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(600, now);
  filter.frequency.exponentialRampToValueAtTime(1100, now + 0.35);
  filter.frequency.exponentialRampToValueAtTime(450, now + 0.75);

  gain.gain.setValueAtTime(0.01, now);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.76);
}

export function playWolfFrustrated() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Wolf whine / snort when blocked
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.linearRampToValueAtTime(240, now + 0.15);
  osc.frequency.linearRampToValueAtTime(160, now + 0.3);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.3);
}

export function playVictory() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Fanfare chord progression C-E-G-C
  const notes = [261.63, 329.63, 392.0, 523.25];
  const now = ctx.currentTime;

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * 0.12);

    const noteStart = now + idx * 0.12;
    gain.gain.setValueAtTime(0.01, noteStart);
    gain.gain.linearRampToValueAtTime(0.18, noteStart + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteStart);
    osc.stop(noteStart + 0.62);
  });
}

export function playDefeat() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Sad falling minor notes
  const notes = [330, 311, 293, 277];
  const now = ctx.currentTime;

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now + idx * 0.16);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, now + idx * 0.16);

    const noteStart = now + idx * 0.16;
    gain.gain.setValueAtTime(0.14, noteStart);
    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.28);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteStart);
    osc.stop(noteStart + 0.3);
  });
}

export function playStepSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Subtle soft grass tap
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(90 + Math.random() * 30, ctx.currentTime);

  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.04);
}
