# 🫧 Bubble Pop Demo

## Overview
A simple click-to-pop game demonstrating **input handling**, **spawning objects**, **tweens**, and **particle effects** on destruction.

## Unity Comparison
| Unity | Phaser |
|-------|--------|
| `OnMouseDown()` | `sprite.on('pointerdown', callback)` |
| `Instantiate()` | `this.add.sprite()` |
| Animator + Animation | `this.tweens.add()` |
| Particle System burst | `particles.explode()` |

## Key Concepts Demonstrated

### 1. Input Handling
```javascript
// Make sprite interactive
bubble.setInteractive({ useHandCursor: true });

// Listen for click
bubble.on('pointerdown', () => {
  this.popBubble(bubble);
});
```

### 2. Spawning with Timers
```javascript
// Spawn bubble every 500ms
this.time.addEvent({
  delay: 500,
  callback: this.spawnBubble,
  callbackScope: this,
  loop: true
});
```

### 3. Tweens (Like DOTween/LeanTween)
```javascript
this.tweens.add({
  targets: bubble,
  scaleX: 1.2,
  scaleY: 1.2,
  duration: 500,
  yoyo: true,
  repeat: -1,
  ease: 'Sine.easeInOut'
});
```

### 4. Destroying with Effects
```javascript
// Burst particles then destroy
particles.explode(10, bubble.x, bubble.y);
bubble.destroy();
```

## Easing Functions Available
- `Linear`, `Quad`, `Cubic`, `Quart`, `Quint`
- `Sine`, `Expo`, `Circ`, `Back`, `Bounce`, `Elastic`
- Each has `.easeIn`, `.easeOut`, `.easeInOut`

## Try Modifying
- Change spawn rate in `spawnDelay`
- Adjust bubble size range
- Try different easing functions
- Add score multiplier for quick pops

