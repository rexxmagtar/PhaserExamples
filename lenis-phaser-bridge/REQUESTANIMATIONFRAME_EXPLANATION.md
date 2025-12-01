# What is `requestAnimationFrame`?

## Quick Answer

`requestAnimationFrame` is a **browser API** that tells the browser: *"Call this function before the next screen repaint"*.

It's the standard way to create smooth animations in JavaScript.

## How It Works

```javascript
function animate() {
  // Do something (update position, draw, etc.)
  
  requestAnimationFrame(animate);  // Schedule next frame
}

requestAnimationFrame(animate);  // Start the loop
```

**What happens:**
1. Browser calls your function before next screen refresh
2. Your function does work (updates, draws, etc.)
3. Your function schedules itself again
4. Browser repaints screen
5. Repeat ~60 times per second (60 FPS)

## Why Use It?

### ❌ Bad: `setInterval` or `setTimeout`
```javascript
setInterval(() => {
  updateAnimation();
}, 16);  // Try to run 60 times per second
```

**Problems:**
- Not synchronized with screen refresh
- Can cause stuttering/jank
- Wastes CPU when tab is hidden
- Timing is not precise

### ✅ Good: `requestAnimationFrame`
```javascript
function animate() {
  updateAnimation();
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

**Benefits:**
- Synchronized with screen refresh (smooth)
- Browser pauses when tab is hidden (saves CPU)
- Runs at optimal frame rate (usually 60 FPS)
- Browser optimizes timing automatically

## Frame Rate

- **Typical**: 60 FPS (frames per second)
- **High-end displays**: 120 FPS or 144 FPS
- **Browser decides**: Based on display capabilities

The browser calls your function as fast as the screen can refresh.

## The `time` Parameter

```javascript
function raf(time) {
  // 'time' is the current time in milliseconds
  // Since page loaded (high precision)
  console.log(time);  // e.g., 1234.567
  
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
```

**Useful for:**
- Calculating delta time between frames
- Timing animations
- Performance monitoring

## In Our Lenis Code

```javascript
function raf(time) {
  lenis.raf(time);  // Pass time to Lenis
  requestAnimationFrame(raf);  // Schedule next frame
}
requestAnimationFrame(raf);  // Start the loop
```

**What this does:**
1. Browser calls `raf(time)` ~60 times per second
2. We call `lenis.raf(time)` to update smooth scroll
3. We schedule the next frame
4. Browser repaints screen
5. Repeat

## Visual Timeline

```
Frame 1: raf(16.67) → lenis.raf(16.67) → screen repaint
Frame 2: raf(33.33) → lenis.raf(33.33) → screen repaint
Frame 3: raf(50.00) → lenis.raf(50.00) → screen repaint
...
```

Each frame is ~16.67ms apart (for 60 FPS).

## Comparison

| Method | Sync with Screen | Pauses When Hidden | Frame Rate |
|--------|------------------|---------------------|------------|
| `setInterval` | ❌ No | ❌ No | Fixed (your choice) |
| `setTimeout` | ❌ No | ❌ No | Fixed (your choice) |
| `requestAnimationFrame` | ✅ Yes | ✅ Yes | Browser optimal |

## Common Pattern

```javascript
// Start animation loop
function animate(time) {
  // Update game/animation state
  update(time);
  
  // Draw/render
  draw();
  
  // Schedule next frame
  requestAnimationFrame(animate);
}

// Start the loop
requestAnimationFrame(animate);
```

## Stopping the Loop

```javascript
let animationId;

function animate() {
  // Do work
  animationId = requestAnimationFrame(animate);
}

// Start
animationId = requestAnimationFrame(animate);

// Stop later
cancelAnimationFrame(animationId);
```

## In Our Context

**Why we need it:**
- Lenis needs to update scroll position every frame
- Smooth scrolling requires continuous updates
- `requestAnimationFrame` provides smooth, efficient updates

**Without it:**
- Lenis wouldn't update smoothly
- Scroll would be janky or not work at all

## Summary

- `requestAnimationFrame` = "Call this function before next screen refresh"
- Runs ~60 times per second (browser decides)
- Standard way to create smooth animations
- Browser optimizes it automatically
- Required for smooth scrolling with Lenis

