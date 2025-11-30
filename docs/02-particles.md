# ✨ Particle Showcase Demo

## Overview
Demonstrates Phaser's **Particle Emitter** system with various configurations: explosions, fire, rain, smoke, magic sparkles, and more.

## Unity Comparison
| Unity Particle System | Phaser Equivalent |
|-----------------------|-------------------|
| Start Lifetime | `lifespan` |
| Start Speed | `speed: { min, max }` |
| Start Size | `scale: { start, end }` |
| Start Color | `tint` (no gradient) |
| Emission Rate | `frequency` + `quantity` |
| Shape (Cone, Sphere) | `angle: { min, max }` |
| Gravity Modifier | `gravityX`, `gravityY` |
| Color over Lifetime | ❌ Limited (use `tint` or alpha) |
| Size over Lifetime | `scale: { start, end }` |
| Renderer (Additive) | `blendMode: 'ADD'` |

## Key Particle Properties

```javascript
this.add.particles(x, y, 'textureKey', {
  // Emission
  frequency: 50,        // ms between emissions (-1 = manual only)
  quantity: 1,          // particles per emission
  
  // Lifespan
  lifespan: 2000,       // ms
  
  // Movement
  speed: { min: 100, max: 200 },
  angle: { min: -30, max: 30 },    // emission cone
  gravityY: 300,
  
  // Appearance
  scale: { start: 1, end: 0 },
  alpha: { start: 1, end: 0 },
  rotate: { start: 0, end: 360 },
  tint: 0xff0000,       // color tint
  blendMode: 'ADD',     // 'NORMAL', 'ADD', 'MULTIPLY', 'SCREEN'
  
  // Bounds
  bounds: { x, y, width, height }  // particles die outside
});
```

## Effect Recipes

### 🔥 Fire
```javascript
{
  speed: { min: 50, max: 100 },
  angle: { min: -10, max: 10 },
  scale: { start: 0.5, end: 0 },
  alpha: { start: 1, end: 0 },
  gravityY: -150,       // flames rise
  lifespan: 800,
  blendMode: 'ADD',
  tint: [0xff4500, 0xff6600, 0xffff00]  // random from array
}
```

### 💥 Explosion
```javascript
{
  speed: { min: 200, max: 400 },
  angle: { min: 0, max: 360 },
  scale: { start: 0.8, end: 0 },
  lifespan: 600,
  gravityY: 200,
  blendMode: 'ADD'
}
emitter.explode(50);  // burst 50 particles
```

### 🌧️ Rain
```javascript
{
  x: { min: 0, max: 800 },
  y: 0,
  speedY: { min: 300, max: 500 },
  scale: { start: 0.1, end: 0.1 },
  alpha: 0.6,
  lifespan: 2000,
  quantity: 3
}
```

### ✨ Magic Sparkles
```javascript
{
  speed: { min: 20, max: 60 },
  angle: { min: 0, max: 360 },
  scale: { start: 0.4, end: 0 },
  alpha: { start: 1, end: 0 },
  lifespan: 1500,
  blendMode: 'ADD',
  tint: [0x00ffff, 0xff00ff, 0xffff00]
}
```

## Limitations vs Unity
- No sub-emitters
- No trails
- No texture sheet animation on particles
- No collision with world
- No 3D particle effects
- Limited color gradient (use tint array for random)

## Try Modifying
- Click anywhere to spawn an explosion
- Adjust gravity direction for different effects
- Combine multiple emitters for complex effects

