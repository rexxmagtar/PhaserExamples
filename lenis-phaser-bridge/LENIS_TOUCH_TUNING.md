# Lenis Touch Scrolling Tuning Guide

## Problem: iOS-like Direct Finger Tracking

When scrolling slowly with touch, you want elements to move **exactly** with your finger speed, without acceleration/deceleration during the touch gesture.

## Solution: Lenis Touch Settings

Lenis provides several options to achieve iOS-like behavior:

### Key Settings for Direct Finger Tracking

#### 1. `syncTouch: true` ✅ **REQUIRED**
- Enables direct synchronization between finger movement and scroll position
- During touch, scroll follows finger more directly
- **Default:** `false` (if not set)

#### 2. `syncTouchLerp: 0.05` ✅ **KEY PARAMETER**
- Controls how much smoothing is applied **during active touch**
- **Lower values = more direct tracking** (closer to 1:1 finger movement)
- **Range:** `0.01` (almost instant) to `0.2` (more smoothing)
- **Recommended:** `0.05` for iOS-like feel, `0.01` for ultra-direct tracking

#### 3. `smoothTouch: true/false`
- Controls overall touch smoothing behavior
- `true`: Smooth scrolling with inertia after release
- `false`: Instant, no smoothing (may feel too abrupt)
- **Note:** When `syncTouch: true`, `syncTouchLerp` controls smoothing during touch

#### 4. `touchInertiaExponent: 1.5`
- Controls momentum/inertia **after** finger is released
- **Lower values (1.0-1.5):** Less momentum, stops faster
- **Higher values (1.5-2.0):** More momentum, continues scrolling longer
- **iOS-like:** Around `1.5`

## Configuration Examples

### Example 1: Ultra-Direct Finger Tracking (1:1)
```javascript
const lenis = new Lenis({
  syncTouch: true,
  syncTouchLerp: 0.01,        // Almost instant response
  smoothTouch: true,
  touchInertiaExponent: 1.2,  // Less momentum after release
});
```

### Example 2: iOS-like (Recommended)
```javascript
const lenis = new Lenis({
  syncTouch: true,
  syncTouchLerp: 0.05,        // Smooth but direct during touch
  smoothTouch: true,
  touchInertiaExponent: 1.5,  // Natural momentum
});
```

### Example 3: Smooth with Some Directness
```javascript
const lenis = new Lenis({
  syncTouch: true,
  syncTouchLerp: 0.1,         // More smoothing, less direct
  smoothTouch: true,
  touchInertiaExponent: 1.7,  // More momentum
});
```

### Example 4: No Smoothing at All (Instant)
```javascript
const lenis = new Lenis({
  smoothTouch: false,         // Disables all touch smoothing
  // syncTouch not needed if smoothTouch is false
});
```

## How It Works

### Without `syncTouch` (Default Behavior)
```
Finger moves → Lenis applies smoothing → Scroll position lags behind finger
Result: Acceleration/deceleration even during slow touch
```

### With `syncTouch: true` and Low `syncTouchLerp`
```
Finger moves → Scroll follows directly → Minimal lag
Result: Elements move with finger speed during touch
```

### The Lerp Value Explained
- **Lerp (Linear Interpolation)** blends between current position and target position
- `lerp = 0.0`: Instant (no smoothing)
- `lerp = 0.05`: Very direct (95% of way to target each frame)
- `lerp = 0.1`: Some smoothing (90% of way to target)
- `lerp = 0.2`: More smoothing (80% of way to target)

## Testing Different Values

1. **Start with:** `syncTouch: true`, `syncTouchLerp: 0.05`
2. **If still too smooth:** Lower `syncTouchLerp` to `0.01` or `0.02`
3. **If too instant/jerky:** Increase `syncTouchLerp` to `0.1` or `0.15`
4. **Adjust momentum:** Change `touchInertiaExponent` (1.0-2.0 range)

## Current Configuration

See `bridge.js` for the current settings. The configuration uses:
- `syncTouch: true` - Direct touch synchronization
- `syncTouchLerp: 0.05` - Minimal smoothing during touch
- `touchInertiaExponent: 1.5` - Natural momentum after release

## Alternative: Custom Touch Handler

If Lenis settings don't provide the exact behavior you want, you can:

1. **Disable Lenis touch handling:**
   ```javascript
   smoothTouch: false
   ```

2. **Handle touch events directly:**
   ```javascript
   let touchStartY = 0;
   let scrollStartY = 0;
   
   document.addEventListener('touchstart', (e) => {
     touchStartY = e.touches[0].clientY;
     scrollStartY = lenis.scroll;
   });
   
   document.addEventListener('touchmove', (e) => {
     const deltaY = touchStartY - e.touches[0].clientY;
     lenis.scrollTo(scrollStartY + deltaY, { immediate: true });
   });
   ```

However, using Lenis's built-in `syncTouch` is usually the better approach as it handles edge cases and integrates with the animation loop.

