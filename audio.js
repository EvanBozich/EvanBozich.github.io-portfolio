// =============================================
// audio.js — Web Audio Engine for portfolio
// =============================================

let audioCtx = null;
let ambientPlaying = false;
let ambientNodes = null;

// --- Lazy-init AudioContext (must be after a user gesture) ---
function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}

// =============================================
// SOUND EFFECTS
// =============================================

// Short retro frequency sweep on click
function playClick() {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
}

// Very faint high tick on hover (only fires when ambient is on)
function playHover() {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
}

// =============================================
// AMBIENT DRONE
// =============================================

function startAmbient() {
    const ctx = getAudioCtx();

    // --- Layer 1: filtered white noise hiss ---
    const bufferSize = ctx.sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 400;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0;
    noiseGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start();

    // --- Layer 2: deep sub drone (55 Hz / Low A) ---
    const drone = ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = 55;

    const droneGain = ctx.createGain();
    droneGain.gain.value = 0;
    droneGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 2.5);

    drone.connect(droneGain);
    droneGain.connect(ctx.destination);
    drone.start();

    // --- Layer 3: LFO-modulated shimmer (220 Hz) ---
    const shimmer = ctx.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.value = 220;

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.2; // Very slow wobble

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 8;

    lfo.connect(lfoGain);
    lfoGain.connect(shimmer.frequency);

    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0;
    shimmerGain.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 3);

    shimmer.connect(shimmerGain);
    shimmerGain.connect(ctx.destination);
    shimmer.start();
    lfo.start();

    // Store refs so we can stop them later
    ambientNodes = { noiseSource, noiseGain, drone, droneGain, shimmer, shimmerGain, lfo };
}

function stopAmbient() {
    if (!ambientNodes) return;
    const ctx = getAudioCtx();
    const { noiseGain, droneGain, shimmerGain, noiseSource, drone, shimmer, lfo } = ambientNodes;

    // Graceful fade-out over 1.5 s
    noiseGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
    droneGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
    shimmerGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);

    setTimeout(() => {
        try { noiseSource.stop(); drone.stop(); shimmer.stop(); lfo.stop(); } catch (e) { }
        ambientNodes = null;
    }, 1600);
}

// =============================================
// TOGGLE BUTTON
// =============================================

const iconOff = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
  <line x1="23" y1="9" x2="17" y2="15"/>
  <line x1="17" y1="9" x2="23" y2="15"/>
</svg>`;

const iconOn = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
</svg>`;

function initAudioToggle() {
    const soundToggle = document.getElementById('soundToggle');
    const soundIcon = document.getElementById('soundIcon');
    const soundLabel = document.getElementById('soundLabel');

    soundToggle.addEventListener('click', () => {
        playClick();
        ambientPlaying = !ambientPlaying;

        if (ambientPlaying) {
            startAmbient();
            soundToggle.classList.add('active');
            soundIcon.innerHTML = iconOn;
            soundLabel.textContent = 'ON';
        } else {
            stopAmbient();
            soundToggle.classList.remove('active');
            soundIcon.innerHTML = iconOff;
            soundLabel.textContent = 'AMBIENT';
        }
    });
}

// =============================================
// ATTACH SOUNDS TO INTERACTIVE ELEMENTS
// =============================================

function initInteractionSounds() {
    document.querySelectorAll('a, button, .skill-tag').forEach(el => {
        el.addEventListener('click', () => playClick());
        el.addEventListener('mouseenter', () => { if (ambientPlaying) playHover(); });
    });
}

// =============================================
// INIT — run after DOM is ready
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    initAudioToggle();
    initInteractionSounds();
});