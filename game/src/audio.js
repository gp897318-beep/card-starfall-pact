// audio.js — tiny WebAudio bleeps, generated in code, no audio files.
let audioCtx = null;
let muted = false;
function beep(freq, dur, type, vol) {
  if (muted) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol || 0.12, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + dur);
  } catch (e) { /* audio unavailable: stay silent */ }
}
function sfxPlace() { beep(660, 0.12, 'sine', 0.14); setTimeout(() => beep(990, 0.16, 'sine', 0.12), 70); }
function sfxLine() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.2, 'triangle', 0.15), i * 90)); }
function sfxHit() { beep(180, 0.18, 'sawtooth', 0.10); }
function sfxHeal() { beep(880, 0.15, 'sine', 0.10); setTimeout(() => beep(1175, 0.2, 'sine', 0.10), 90); }
function sfxWin() { [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => beep(f, 0.3, 'triangle', 0.15), i * 120)); }
function sfxLose() { [400, 350, 300, 200].forEach((f, i) => setTimeout(() => beep(f, 0.3, 'sine', 0.12), i * 140)); }
function sfxClick() { beep(440, 0.06, 'sine', 0.08); }
function toggleMute() { muted = !muted; return muted; }
