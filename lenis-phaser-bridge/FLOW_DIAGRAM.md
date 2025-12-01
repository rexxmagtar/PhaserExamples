# Flow Diagram: User Input → Canvas Movement

## Complete Flow Path

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: USER INPUT                                             │
│ User scrolls mouse wheel or touches screen                      │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: BROWSER NATIVE EVENT                                    │
│ Browser fires:                                                  │
│ - wheel event (mouse)                                           │
│ - touchmove/touchstart (mobile)                                 │
│                                                                 │
│ ❌ PHASER DOES NOT RECEIVE THIS EVENT                          │
│ (Canvas has pointer-events: none)                              │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: LENIS INTERCEPTS EVENT                                  │
│ Lenis.js intercepts the native scroll event                     │
│ Location: Lenis library (CDN)                                   │
│                                                                 │
│ Lenis:                                                          │
│ - Prevents default scroll behavior                              │
│ - Captures scroll delta (deltaY)                                │
│ - Applies smooth easing calculations                            │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: LENIS SMOOTH SCROLL CALCULATION                         │
│ Lenis calculates smooth scroll position using:                  │
│ - duration: 1.2                                                │
│ - easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))     │
│ - Updates internal scroll state                                 │
│                                                                 │
│ Location: bridge.js lines 95-103                                │
│                                                                 │
│ ❌ PHASER NOT INVOLVED YET                                      │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: LENIS RAF LOOP                                          │
│ Lenis.raf() called every frame via requestAnimationFrame        │
│ Location: bridge.js lines 126-130                               │
│                                                                 │
│ function raf(time) {                                            │
│   lenis.raf(time);  // Lenis updates scroll position smoothly   │
│   requestAnimationFrame(raf);                                    │
│ }                                                               │
│                                                                 │
│ ❌ PHASER NOT INVOLVED                                          │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: LENIS EMITS SCROLL EVENT                                │
│ Lenis fires 'scroll' event with:                                │
│ - scroll: current scroll position                               │
│ - limit: max scroll position                                    │
│ - velocity: scroll velocity                                    │
│ - direction: 'up' or 'down'                                     │
│ - progress: 0 to 1                                              │
│                                                                 │
│ Location: bridge.js lines 115-120                                │
│                                                                 │
│ lenis.on('scroll', ({ scroll, ... }) => {                       │
│   // This is where we bridge to Phaser                          │
│ });                                                             │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: BRIDGE CALLS PHASER                                     │
│ Bridge receives Lenis scroll event and calls Phaser             │
│ Location: bridge.js lines 115-120                               │
│                                                                 │
│ lenis.on('scroll', ({ scroll }) => {                            │
│   if (phaserScene) {                                            │
│     phaserScene.setScroll(scroll);  // ← BRIDGE POINT          │
│   }                                                             │
│ });                                                             │
│                                                                 │
│ ✅ THIS IS THE FIRST TIME PHASER IS INVOLVED                   │
│ (Phaser only receives scroll position, NOT the input event)   │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 8: PHASER UPDATES POSITION                                 │
│ Phaser scene receives scroll value and updates container        │
│ Location: bridge.js lines 72-75                                 │
│                                                                 │
│ setScroll(scrollY) {                                            │
│   this.scrollY = scrollY;                                       │
│   this.updateListPosition();                                    │
│ }                                                               │
│                                                                 │
│ updateListPosition() {                                          │
│   this.listContainer.y = -this.scrollY;  // Move container     │
│ }                                                               │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 9: CANVAS RENDERS                                          │
│ Phaser's render loop draws the updated container position       │
│ Location: Phaser internal rendering                             │
│                                                                 │
│ ✅ VISUAL RESULT: Canvas content moves smoothly                 │
└─────────────────────────────────────────────────────────────────┘
```

## Key Proof Points

### ❌ Phaser NEVER Handles Input

1. **No Phaser Input Listeners**
   - Search `bridge.js` for `this.input.on()` → **NOT FOUND**
   - Phaser's input system is completely unused
   - No `this.input.on('wheel')` or any input handlers

2. **Canvas Blocks Input**
   - `#phaser-container` has `pointer-events: none` (line 38 in index.html)
   - This means scroll events pass THROUGH the canvas to the document
   - Canvas never receives the input event

3. **Phaser Only Receives Data**
   - Phaser's `setScroll()` method (line 72) only receives a number
   - It's a one-way data flow: Lenis → Bridge → Phaser
   - Phaser has no knowledge of the original input event

### ✅ Lenis Handles ALL Input

1. **Lenis Intercepts Native Events**
   - Lenis library intercepts `wheel` and `touch` events at the document level
   - Prevents default browser scroll behavior
   - Calculates smooth scroll position

2. **Lenis Controls Scroll State**
   - Lenis maintains scroll position internally
   - Applies easing and smoothing
   - Emits scroll events with calculated values

3. **Bridge is Passive**
   - Bridge.js only listens to Lenis events
   - Bridge never handles input directly
   - Bridge is just a translator: Lenis scroll → Phaser position

## Code Evidence

### No Phaser Input Code
```javascript
// ❌ NOT PRESENT in bridge.js:
// this.input.on('wheel', ...)
// this.input.on('pointerdown', ...)
// Any Phaser input handling
```

### Lenis Handles Input
```javascript
// ✅ Lenis intercepts and processes input:
const lenis = new Lenis({
  smoothWheel: true,    // Handles wheel events
  smoothTouch: true,    // Handles touch events
  // ... Lenis does all the input processing
});
```

### Bridge is Just a Translator
```javascript
// ✅ Bridge only translates Lenis → Phaser:
lenis.on('scroll', ({ scroll }) => {
  phaserScene.setScroll(scroll);  // Just pass the number
});
```

## Summary

**Input Flow:**
```
User Input → Browser Event → Lenis Intercepts → Lenis Calculates → 
Lenis Emits Event → Bridge Translates → Phaser Updates Position → Canvas Renders
```

**Phaser's Role:**
- ❌ Does NOT handle input
- ❌ Does NOT receive scroll events
- ✅ Only receives scroll position (number) from bridge
- ✅ Only updates visual position based on received value

**Lenis's Role:**
- ✅ Handles ALL input (wheel, touch)
- ✅ Intercepts native browser events
- ✅ Calculates smooth scroll position
- ✅ Emits scroll events with calculated values

