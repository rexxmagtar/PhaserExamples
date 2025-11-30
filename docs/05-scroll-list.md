# 📜 Scroll List Demo

## Overview
Demonstrates scrollable content using Phaser's **masking** and **input** systems. Shows vertical scrolling, momentum, and animated list items.

## Unity Comparison
| Unity Scroll Rect | Phaser Approach |
|-------------------|-----------------|
| Content | Container with all items |
| Viewport | Mask (Graphics or BitmapMask) |
| Scrollbar | Manual slider (optional) |
| Scroll Sensitivity | Wheel delta multiplier |
| Elastic | Tween back when overscrolled |
| Inertia | Track velocity, apply decay |

## Key Concepts

### 1. Container + Mask
```javascript
// Create container for all scroll content
this.scrollContainer = this.add.container(x, y);

// Create mask shape
const maskShape = this.add.graphics();
maskShape.fillRect(x, y, width, height);

// Apply mask
const mask = maskShape.createGeometryMask();
this.scrollContainer.setMask(mask);
```

### 2. Mouse Wheel Scrolling
```javascript
this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
  // deltaY is positive when scrolling down
  this.scrollContainer.y -= deltaY * scrollSpeed;
  
  // Clamp to bounds
  this.scrollContainer.y = Phaser.Math.Clamp(
    this.scrollContainer.y,
    minY,  // top limit
    maxY   // bottom limit (usually 0 or viewport y)
  );
});
```

### 3. Drag Scrolling (Touch-friendly)
```javascript
// Create invisible interactive zone
const hitArea = this.add.rectangle(x, y, width, height, 0x000000, 0);
hitArea.setInteractive({ draggable: true });

let lastY = 0;

hitArea.on('dragstart', (pointer) => {
  lastY = pointer.y;
});

hitArea.on('drag', (pointer) => {
  const delta = pointer.y - lastY;
  this.scrollContainer.y += delta;
  lastY = pointer.y;
});
```

### 4. Momentum/Inertia
```javascript
// Track velocity during drag
let velocity = 0;

hitArea.on('drag', (pointer) => {
  velocity = pointer.velocity.y;
  // ... move container
});

hitArea.on('dragend', () => {
  // Apply momentum
  this.tweens.add({
    targets: this.scrollContainer,
    y: this.scrollContainer.y + velocity * 0.5,
    duration: 500,
    ease: 'Cubic.easeOut',
    onComplete: () => this.clampScroll()
  });
});
```

### 5. Elastic/Bounce Back
```javascript
clampScroll() {
  const minY = this.viewportY - (this.contentHeight - this.viewportHeight);
  const maxY = this.viewportY;
  
  if (this.scrollContainer.y > maxY) {
    this.tweens.add({
      targets: this.scrollContainer,
      y: maxY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  } else if (this.scrollContainer.y < minY) {
    this.tweens.add({
      targets: this.scrollContainer,
      y: minY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  }
}
```

### 6. Animated List Items (Staggered)
```javascript
items.forEach((item, index) => {
  // Start off-screen
  item.alpha = 0;
  item.x += 50;
  
  // Animate in with delay
  this.tweens.add({
    targets: item,
    alpha: 1,
    x: item.x - 50,
    duration: 300,
    delay: index * 50,  // stagger
    ease: 'Back.easeOut'
  });
});
```

## Scrollbar Implementation
```javascript
createScrollbar(x, y, height, contentHeight, viewportHeight) {
  const track = this.add.graphics();
  track.fillStyle(0x333333, 0.5);
  track.fillRect(x, y, 8, height);
  
  const thumbHeight = (viewportHeight / contentHeight) * height;
  const thumb = this.add.graphics();
  thumb.fillStyle(0x7b5cff);
  thumb.fillRoundedRect(x, y, 8, thumbHeight, 4);
  
  // Update thumb position based on scroll
  updateScrollbar = () => {
    const scrollPercent = (this.viewportY - this.scrollContainer.y) / 
                          (this.contentHeight - this.viewportHeight);
    thumb.y = y + scrollPercent * (height - thumbHeight);
  };
}
```

## Virtual Scrolling (Performance)
For very long lists (1000+ items), only render visible items:

```javascript
update() {
  const visibleStart = Math.floor(-this.scrollContainer.y / itemHeight);
  const visibleEnd = visibleStart + Math.ceil(viewportHeight / itemHeight);
  
  this.items.forEach((item, index) => {
    item.visible = index >= visibleStart && index <= visibleEnd;
  });
}
```

## Try Modifying
- Add horizontal scrolling
- Implement snap-to-item (like carousel)
- Add pull-to-refresh gesture
- Create infinite scroll (load more at bottom)

