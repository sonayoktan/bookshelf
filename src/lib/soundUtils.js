// Realistic page flip sound utility
// Uses cached HTML5 audio with an advanced Web Audio API synthesized fallback

let preloadedAudio = null;

const soundUrl = `${import.meta.env.BASE_URL || '/'}page-flip.mp3`.replace('//', '/');

// Preload audio asset
if (typeof window !== 'undefined') {
  try {
    preloadedAudio = new Audio(soundUrl);
    preloadedAudio.preload = 'auto';
  } catch (e) {
    // Ignore during SSR or if audio not supported
  }
}

let lastPlayTime = 0;

/**
 * Plays a realistic book page flip sound effect
 */
export function playPageFlipSound() {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  if (now - lastPlayTime < 120) {
    return;
  }
  lastPlayTime = now;

  try {
    // Primary method: Native HTML5 Audio
    const audio = new Audio(soundUrl);
    audio.volume = 0.8;
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // If autoplay or network policy prevents loading, fallback to Web Audio API
        playSynthesizedPageFlip();
      });
    }
  } catch (err) {
    playSynthesizedPageFlip();
  }
}

/**
 * Synthesizes a crisp, realistic page flip using Web Audio API
 * Used as an instant offline/bulletproof fallback
 */
function playSynthesizedPageFlip() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const duration = 0.28;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Filtered pink / paper noise
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.05;
      b1 = 0.95 * b1 + white * 0.1;
      b2 = 0.85 * b2 + white * 0.25;
      const pink = (b0 + b1 + b2) * 0.35;

      // Realistic page turn envelope: initial scrape, swell, and soft paper flap
      const t = i / bufferSize;
      const env = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.4)), 2.2);
      data[i] = pink * env;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Bandpass filter to model paper frequency resonant sweep (1800Hz down to 500Hz)
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + duration);
    filter.Q.value = 1.4;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start(ctx.currentTime);
  } catch (e) {
    // Fail silently if browser audio is completely disabled
  }
}
