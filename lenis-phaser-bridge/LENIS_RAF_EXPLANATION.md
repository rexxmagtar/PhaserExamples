# Why `lenis.raf(time)` is Required

## The Confusion

You thought: *"Lenis handles scroll logic internally, so why do I need to call `lenis.raf()`?"*

## The Answer

Lenis has **two parts** to its functionality:

### 1. Input Interception (Automatic) ✅
- Lenis **automatically** intercepts wheel/touch events
- This happens internally - you don't need to do anything
- Lenis prevents default scroll and captures the input

### 2. Smooth Animation (Requires Your Loop) ⚠️
- Lenis **needs** you to call `lenis.raf(time)` every frame
- This is how Lenis applies smooth easing/interpolation
- Without it, scroll would be instant/jumpy

## How It Works

```
User scrolls → Lenis intercepts input → Lenis sets target scroll position
                                                      ↓
                                    [Without raf loop: instant jump ❌]
                                                      ↓
                                    [With raf loop: smooth interpolation ✅]
                                                      ↓
                                    lenis.raf(time) applies easing every frame
                                                      ↓
                                    Scroll position smoothly approaches target
                                                      ↓
                                    Lenis emits 'scroll' event with new position
```

## What `lenis.raf(time)` Does

1. **Interpolates** between current scroll position and target position
2. **Applies easing** function (the smooth curve)
3. **Updates** internal scroll state
4. **Emits** 'scroll' events with updated position

## Without the RAF Loop

If you remove the `raf` loop:
- ✅ Lenis still intercepts input
- ✅ Lenis still prevents default scroll
- ❌ But scroll position jumps instantly (no smooth animation)
- ❌ No easing/interpolation applied

## Standard Lenis Pattern

This is **required** by Lenis - it's in all their examples:

```javascript
// From Lenis documentation:
function raf(time) {
  lenis.raf(time)  // ← REQUIRED: Updates smooth scroll every frame
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)
```

## In Our Code

```javascript
// Lines 138-142 in bridge.js
function raf(time) {
  lenis.raf(time);  // ← This applies the smooth easing
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
```

**What happens:**
1. User scrolls → Lenis intercepts (automatic)
2. Lenis sets target scroll position (automatic)
3. **Our loop** calls `lenis.raf(time)` every frame
4. Lenis interpolates smoothly toward target
5. Lenis emits 'scroll' event with new position
6. Our bridge passes it to Phaser

## Summary

- **Input interception**: Automatic (Lenis handles internally)
- **Smooth animation**: Requires `lenis.raf(time)` in your loop
- **This is standard**: All Lenis examples require this pattern

The `raf` loop is **not optional** - it's how Lenis applies smooth scrolling!

