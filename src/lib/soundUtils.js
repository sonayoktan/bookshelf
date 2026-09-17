// Ultra-responsive, zero-latency book page flip sound utility
// Pre-decodes MP3 into memory using Web Audio API for instantaneous playback
// Includes instant HTML5 Audio caching and synthesized fallback

const soundUrl = `${import.meta.env.BASE_URL || '/'}page-flip.mp3`.replace('//', '/');

let audioCtx = null;
let decodedBuffer = null;
let preloadedAudio = null;
let isPreloading = false;
let lastPlayTime = 0;

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

// Pre-decode audio buffer into memory on startup
async function initAudioEngine() {
  if (typeof window === 'undefined') return;

  // 1. Preload HTML5 Audio as secondary fast fallback
  try {
    preloadedAudio = new Audio(soundUrl);
    preloadedAudio.preload = 'auto';
    preloadedAudio.volume = 0.85;
  } catch (e) {
    // Ignore SSR or unsupported
  }

  // 2. Fetch and pre-decode with Web Audio API for true zero-latency
  if (isPreloading || decodedBuffer) return;
  isPreloading = true;

  try {
    const ctx = getAudioContext();
    const response = await fetch(soundUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();

    if (ctx) {
      decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
    }
  } catch (e) {
    // Silently fall back to HTML5 Audio / Synthesizer
  } finally {
    isPreloading = false;
  }
}

// Unlock audio context on the earliest user interaction
function setupUnlockListeners() {
  if (typeof window === 'undefined') return;

  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    // Also initiate decoding if not started yet
    if (!decodedBuffer && !isPreloading) {
      initAudioEngine();
    }
    window.removeEventListener('pointerdown', unlock, true);
    window.removeEventListener('keydown', unlock, true);
  };

  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('keydown', unlock, true);
}

if (typeof window !== 'undefined') {
  initAudioEngine();
  setupUnlockListeners();
}

/**
 * Plays a realistic book page flip sound effect with zero latency
 */
export function playPageFlipSound() {
  if (typeof window === 'undefined') return;

  const now = performance ? performance.now() : Date.now();
  if (now - lastPlayTime < 70) {
    return;
  }
  lastPlayTime = now;

  try {
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      // Method 1 (Instantaneous): Play pre-decoded buffer with Web Audio API (0ms latency)
      if (decodedBuffer) {
        const source = ctx.createBufferSource();
        source.buffer = decodedBuffer;

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.85;

        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);
        return;
      }
    }

    // Method 2: Use preloaded HTML5 Audio instance by resetting currentTime
    if (preloadedAudio) {
      preloadedAudio.currentTime = 0;
      preloadedAudio.volume = 0.85;
      const playPromise = preloadedAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          playSynthesizedPageFlip();
        });
      }
      return;
    }

    // Method 3: Synthesize realistic page flip sound in real-time
    playSynthesizedPageFlip();
  } catch (err) {
    playSynthesizedPageFlip();
  }
}

/**
 * Synthesizes a crisp, realistic page flip using Web Audio API
 */
function playSynthesizedPageFlip() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const duration = 0.24;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Filtered pink paper noise
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.05;
      b1 = 0.95 * b1 + white * 0.1;
      b2 = 0.85 * b2 + white * 0.25;
      const pink = (b0 + b1 + b2) * 0.35;

      const t = i / bufferSize;
      const env = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.35)), 2.0);
      data[i] = pink * env;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1900, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + duration);
    filter.Q.value = 1.3;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.55, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start(ctx.currentTime);
  } catch (e) {
    // Silent fail
  }
}
