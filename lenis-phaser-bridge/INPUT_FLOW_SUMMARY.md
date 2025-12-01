# Input Flow Summary

## Quick Proof: Phaser Never Handles Input

### Search Results in `bridge.js`:

❌ **NOT FOUND:**
- `this.input.on('wheel')` 
- `this.input.on('pointer')`
- `this.input.on('touch')`
- Any Phaser input handling code

✅ **FOUND:**
- `lenis.on('scroll')` - Listening to Lenis events
- `phaserScene.setScroll(scroll)` - Phaser only receives a number

---

## The Flow (Step by Step)

### 1️⃣ User Scrolls
```
User moves mouse wheel or touches screen
```

### 2️⃣ Browser Fires Event
```
Browser creates native wheel/touch event
```

### 3️⃣ Lenis Intercepts ⚡
```
Lenis.js intercepts the event BEFORE it reaches Phaser
- Prevents default scroll
- Captures scroll delta
- Calculates smooth position
```

### 4️⃣ Lenis Updates Position
```
Lenis.raf() called every frame
- Applies easing function
- Updates internal scroll state
```

### 5️⃣ Lenis Emits Event
```
Lenis fires 'scroll' event with calculated position
```

### 6️⃣ Bridge Translates
```
Bridge listens to Lenis event
- Receives scroll position (number)
- Calls phaserScene.setScroll(scroll)
```

### 7️⃣ Phaser Updates Visual
```
Phaser receives scroll position
- Updates container.y position
- Canvas renders new position
```

---

## Code Evidence

### Lenis Handles Input (lines 95-103)
```javascript
const lenis = new Lenis({
  smoothWheel: true,    // ← Handles wheel
  smoothTouch: true,    // ← Handles touch
  // ... Lenis does ALL input processing
});
```

### Bridge Listens to Lenis (lines 115-120)
```javascript
lenis.on('scroll', ({ scroll }) => {
  phaserScene.setScroll(scroll);  // ← Just pass number to Phaser
});
```

### Phaser Only Receives Number (lines 72-75)
```javascript
setScroll(scrollY) {  // ← Receives number, not input event
  this.scrollY = scrollY;
  this.updateListPosition();
}
```

### No Phaser Input Code
```javascript
// ❌ This code does NOT exist in bridge.js:
// this.input.on('wheel', ...)
// this.input.on('pointerdown', ...)
```

---

## Visual Proof

```
┌─────────────┐
│ User Input  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Browser   │
│   Event     │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ❌ Phaser never sees this
│    LENIS    │     ✅ Lenis intercepts here
│ Intercepts  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   LENIS     │
│ Calculates  │
│ Smooth Pos  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Bridge    │
│ Translates  │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ✅ Phaser only receives number
│   PHASER    │     ❌ Phaser never received input event
│ Updates Pos │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Canvas    │
│   Renders   │
└─────────────┘
```

---

## Conclusion

**Phaser's Role:**
- ❌ Does NOT handle input
- ✅ Only receives scroll position (number)
- ✅ Only updates visual position

**Lenis's Role:**
- ✅ Handles ALL input (wheel, touch)
- ✅ Intercepts browser events
- ✅ Calculates smooth scroll
- ✅ Emits scroll events

**Bridge's Role:**
- ✅ Translates Lenis events → Phaser position
- ❌ Never handles input directly

