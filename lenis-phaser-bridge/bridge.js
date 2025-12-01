/**
 * Lenis + Phaser Bridge
 * Bridge logic only - connects Lenis scroll to Phaser scene
 * Phaser scene is defined in phaser-scene.js
 */

// ============================================
// INITIALIZE LENIS (Standard body/document scroll)
// ============================================
// ✅ LENIS HANDLES ALL INPUT (wheel, touch events)
// Lenis intercepts native browser scroll events
// Phaser never sees the input - it's blocked by pointer-events: none
// ============================================
// LENIS CONFIGURATION OPTIONS
// ============================================
// For iOS-like direct finger tracking during slow touch:
// - syncTouch: true → Enables direct touch synchronization
// - syncTouchLerp: 0.05 → Very low lerp = minimal smoothing (closer to 0 = more direct)
// - smoothTouch: true → Keep smooth for inertia after release, but syncTouch overrides during touch
// - touchInertiaExponent: 1.5 → Controls momentum after finger release (lower = less momentum)

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  
  // Mouse wheel settings
  smoothWheel: true,
  wheelMultiplier: 1,
  
  // Touch settings for iOS-like behavior
  smoothTouch: false,           // Enable smooth touch (affects inertia after release)
  touchMultiplier: 1,
  syncTouch: true,             // ✅ KEY: Sync touch directly with finger movement
  syncTouchLerp: 0.05,         // ✅ KEY: Very low = minimal smoothing during touch (0.01-0.1 range)
  touchInertiaExponent: 1.5,    // Controls momentum after release (1.0 = no momentum, 2.0 = more momentum)
  
  // Alternative: For even more direct tracking, try:
  // syncTouchLerp: 0.01,  // Almost 1:1 finger tracking
  // Or for completely instant touch (no smoothing at all):
  // smoothTouch: false,   // Disables all touch smoothing (may feel too instant)
});

// ============================================
// BRIDGE: Lenis Scroll → Phaser Movement
// ============================================
// ❌ PHASER NEVER HANDLES INPUT - No this.input.on() anywhere!
// ✅ LENIS HANDLES ALL INPUT - We just listen to Lenis events
let phaserScene = null;

// Wait for Phaser scene to be ready (scene is created in phaser-scene.js)
// The game object is created in phaser-scene.js and exposed as window.phaserGame
function initBridge() {
  const game = window.phaserGame;
  if (!game) {
    // Phaser scene not loaded yet, wait a bit
    setTimeout(initBridge, 100);
    return;
  }
  
  game.events.once('ready', () => {
    phaserScene = game.scene.getScene('ScrollScene');
    
    // ✅ LISTEN TO LENIS (not browser events, not Phaser input)
    // Lenis has already processed the input and calculated smooth scroll
    lenis.on('scroll', ({ scroll, limit, velocity, direction, progress }) => {
      if (phaserScene) {
        // Bridge: Pass Lenis scroll position to Phaser
        // Phaser only receives a number, not the original input event
        phaserScene.setScroll(scroll);
      }
    });
  });
}

// Start bridge initialization
initBridge();

// ============================================
// LENIS ANIMATION LOOP (REQUIRED BY LENIS)
// ============================================
// ⚠️ IMPORTANT: Lenis requires you to call lenis.raf() every frame
// Lenis intercepts input internally, but needs this loop to:
// - Apply smooth easing/interpolation between scroll positions
// - Update scroll position gradually (not instantly)
// - Emit scroll events with updated values
//
// Without this loop, Lenis would intercept input but scroll would be instant/jumpy
// This is standard Lenis usage - see their docs/examples
//
// requestAnimationFrame: Browser API that calls function before next screen refresh
// Runs ~60 times per second, synchronized with screen for smooth animations
function raf(time) {
  lenis.raf(time);  // Lenis applies smooth interpolation this frame
  requestAnimationFrame(raf);  // Schedule next frame (~16ms later at 60fps)
}
requestAnimationFrame(raf);  // Start the animation loop

// Handle window resize
window.addEventListener('resize', () => {
  const game = window.phaserGame;
  if (game) {
    game.scale.resize(window.innerWidth, window.innerHeight);
  }
});

