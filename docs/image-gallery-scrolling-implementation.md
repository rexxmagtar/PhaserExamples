# Image Gallery Scrolling Implementation

## Overview
This document describes how the virtual scrolling system is implemented in `ImageGalleryScene.js`, including the main layers, logic, and what was custom-built vs. using Phaser's built-in features.

## Two Approaches to Scrolling in Phaser

Phaser supports **two main approaches** for scrolling:

### 1. **Container Movement** (What We're Using) ✅
Move the container that holds all content, while keeping the camera fixed.

```javascript
// Our approach
this.imageContainer.y = this.viewportY + this.scrollY;
```

**Advantages:**
- ✅ Better for UI/scroll views (like our gallery)
- ✅ Easier to implement viewport masking
- ✅ More control over scroll boundaries
- ✅ Works better with virtual scrolling (lazy loading)
- ✅ Camera stays fixed for UI elements (title, buttons, scrollbar)
- ✅ Easier to calculate visible ranges for virtual scrolling

### 2. **Camera Movement** (Alternative Approach - Phaser's Suggestion)
Keep content fixed, move the camera to view different parts.

```javascript
// Alternative approach (not used in our implementation)
this.cameras.main.scrollY += deltaY;
// or
this.cameras.main.setScroll(this.cameras.main.scrollX, this.cameras.main.scrollY + deltaY);
```

**When to Use Camera Movement:**
- ✅ Game world scrolling (side-scrollers, top-down games)
- ✅ When you want the entire scene to scroll
- ✅ When you have a large game world
- ✅ When UI elements should scroll with content

**Why We Didn't Use Camera Movement:**
- ❌ Would scroll UI elements (title, buttons, scrollbar) - we want them fixed
- ❌ Harder to implement viewport masking for a specific area
- ❌ More complex to calculate visible ranges for virtual scrolling
- ❌ Would require multiple cameras (one for UI, one for content)

**Phaser's Official Documentation:**
Phaser's docs suggest camera movement for game world scrolling, but for UI scroll views (like our gallery), container movement is more appropriate.

---

## Architecture Layers

### 1. **Display Layer** (Phaser Built-in)
- **Container**: `this.imageContainer` - Phaser Container object that holds all images
- **Mask**: Geometry mask created from Graphics to clip content to viewport
- **Graphics/Sprites**: Phaser's built-in rendering objects

**What's Custom:**
- Container positioning logic
- Mask coordinate calculations
- Child positioning relative to container

**What's Phaser:**
- `this.add.container()` - Container creation
- `maskGraphics.createGeometryMask()` - Mask creation
- `container.setMask()` - Mask application

---

### 2. **State Management Layer** (Custom)
- **Scroll State**: `this.scrollY` - Current scroll offset (negative = scrolled down)
- **Velocity Tracking**: `this.velocity` - For momentum/inertia scrolling
- **Image Tracking**: `this.loadedImages` - Map of loaded images with metadata
- **Visible Range**: `this.visibleRange` - Tracks which images should be visible

**What's Custom:**
- All state management logic
- Virtual scrolling range calculations
- Memory management (loading/unloading)

---

### 3. **Input Layer** (Phaser Built-in + Custom Logic)

#### Mouse Wheel Scrolling
```javascript
this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
  this.scrollY -= deltaY * 1.2;
  this.clampScroll();
  this.updateScrollbar();
  this.updateVisibleImages();
});
```

**What's Phaser:**
- `this.input.on('wheel')` - Event system
- `deltaY` - Browser-provided scroll delta

**What's Custom:**
- Scroll calculation (`deltaY * 1.2`)
- Clamping logic
- Update triggers

#### Drag Scrolling
```javascript
hitArea.setInteractive({ draggable: true });
hitArea.on('dragstart', ...);
hitArea.on('drag', ...);
hitArea.on('dragend', ...);
```

**What's Phaser:**
- `setInteractive({ draggable: true })` - Enables drag
- `on('dragstart')`, `on('drag')`, `on('dragend')` - Drag events

**What's Custom:**
- Velocity calculation during drag
- Momentum application after drag
- Scroll position updates

---

### 4. **Virtual Scrolling Logic** (Custom)

#### Core Algorithm: `updateVisibleImages()`

**Step 1: Calculate Visible Range**
```javascript
const scrollOffset = -this.scrollY;
const firstVisibleRow = Math.floor(scrollOffset / this.rowHeight);
const lastVisibleRow = Math.ceil((scrollOffset + this.viewportHeight) / this.rowHeight);
```

**Step 2: Add Buffer Zone**
```javascript
const startRow = Math.max(0, firstVisibleRow - this.bufferRows);
const endRow = Math.min(this.totalRows - 1, lastVisibleRow + this.bufferRows);
```

**Step 3: Load/Unload Images**
- Unloads images outside the buffered range
- Loads images within the buffered range
- Only keeps images in memory that are visible (+ buffer)

**What's Custom:**
- Entire virtual scrolling algorithm
- Buffer zone calculation
- Lazy loading/unloading logic

---

### 5. **Smooth Scrolling** (Custom Implementation)

#### Interpolation in `update()` Loop
```javascript
update() {
  const targetY = this.viewportY + this.scrollY;
  this.imageContainer.y = Phaser.Math.Linear(
    this.imageContainer.y,
    targetY,
    0.15  // Smooth interpolation factor
  );
}
```

**What's Phaser:**
- `Phaser.Math.Linear()` - Linear interpolation function
- `update()` - Phaser's game loop callback

**What's Custom:**
- Interpolation factor (0.15)
- Target position calculation
- Smooth scrolling behavior

#### Momentum Scrolling
```javascript
applyMomentum() {
  this.tweens.add({
    targets: this,
    scrollY: this.scrollY + this.velocity * 15,
    duration: 800,
    ease: 'Cubic.easeOut',
    ...
  });
}
```

**What's Phaser:**
- `this.tweens.add()` - Phaser's tween system
- `'Cubic.easeOut'` - Built-in easing function

**What's Custom:**
- Velocity calculation
- Momentum formula (`velocity * 15`)
- Duration and easing selection

---

### 6. **Scroll Constraints** (Custom)

#### Clamping Logic: `clampScroll()`
```javascript
clampScroll() {
  const maxScroll = Math.max(0, this.contentHeight - this.viewportHeight);
  this.scrollY = Phaser.Math.Clamp(this.scrollY, -maxScroll, 0);
}
```

**What's Phaser:**
- `Phaser.Math.Clamp()` - Clamping utility

**What's Custom:**
- Max scroll calculation
- Boundary logic
- Scroll limits

---

### 7. **Scrollbar** (Custom)

#### Visual Scrollbar
- Custom Graphics objects for track and thumb
- Manual position calculations
- Updates based on scroll percentage

**What's Phaser:**
- `this.add.graphics()` - Graphics creation
- Drawing methods (`fillRoundedRect`, etc.)

**What's Custom:**
- Entire scrollbar implementation
- Position calculations
- Visual styling

---

## Key Custom Components

### 1. **Virtual Scrolling System**
- Calculates which images should be visible
- Loads/unloads images dynamically
- Manages memory efficiently
- Buffer zone for smooth scrolling

### 2. **Smooth Interpolation**
- Custom interpolation factor (0.15)
- Smooth container movement
- Prevents janky scrolling

### 3. **Momentum/Inertia**
- Velocity tracking during drag
- Momentum application after drag end
- Easing for natural feel

### 4. **Memory Management**
- Automatic unloading of off-screen images
- Texture cleanup
- Prevents memory leaks

### 5. **Loading System**
- Simulated network delays
- Progress bars
- Loading states
- Failure simulation

---

## Phaser Features Used (Out of the Box)

### Core Systems
- **Container**: Groups objects together
- **Mask**: Clips content to viewport
- **Graphics**: Drawing API for UI elements
- **Tweens**: Animation system for momentum
- **Input Events**: Mouse wheel, drag events
- **Scene System**: Scene lifecycle management

### Utilities
- `Phaser.Math.Linear()` - Interpolation
- `Phaser.Math.Clamp()` - Value clamping
- `Phaser.Math.Between()` - Random numbers
- `this.time.delayedCall()` - Timed callbacks
- `this.textures.exists()` - Texture management

---

## Data Flow

```
User Input (Wheel/Drag)
    ↓
Update scrollY
    ↓
clampScroll() - Constrain to bounds
    ↓
updateVisibleImages() - Calculate visible range
    ↓
Load/Unload images based on range
    ↓
update() - Smooth interpolation
    ↓
Container position updates
    ↓
Visual update on screen
```

---

## Performance Optimizations

1. **Virtual Scrolling**: Only renders visible images
2. **Buffer Zone**: Pre-loads images just outside viewport
3. **Texture Cleanup**: Removes textures when images unload
4. **Smooth Interpolation**: Reduces visual jank
5. **Efficient Calculations**: Minimal math per frame

---

## Summary

**Custom Written:**
- Virtual scrolling algorithm
- Memory management system
- Smooth scrolling interpolation
- Momentum/inertia system
- Scrollbar implementation
- Loading state management
- Image positioning logic

**Phaser Built-in:**
- Container system
- Mask system
- Input event system
- Tween/animation system
- Graphics drawing API
- Math utilities
- Scene lifecycle

The implementation combines Phaser's powerful rendering and input systems with custom virtual scrolling logic to create a smooth, memory-efficient image gallery.

