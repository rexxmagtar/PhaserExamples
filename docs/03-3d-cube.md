# 🎲 3D Cube Demo

## Overview
Phaser is a **2D engine** - it has NO native 3D support. However, we can **fake 3D** using several techniques demonstrated here.

## The Truth About 3D in Phaser
❌ No 3D meshes
❌ No 3D materials/shaders
❌ No perspective camera
❌ No depth buffer

✅ Fake 3D with math (isometric, projection)
✅ Pre-rendered 3D sprites
✅ Canvas 2D transforms for simple shapes
✅ Integrate Three.js alongside Phaser

## Techniques Demonstrated

### 1. Software 3D Projection
We manually calculate 3D→2D projection:

```javascript
// 3D point
const point3D = { x: 0, y: 0, z: 0 };

// Rotation matrices (simplified)
const cosX = Math.cos(rotationX), sinX = Math.sin(rotationX);
const cosY = Math.cos(rotationY), sinY = Math.sin(rotationY);

// Rotate around Y axis
let x = point3D.x * cosY - point3D.z * sinY;
let z = point3D.x * sinY + point3D.z * cosY;

// Rotate around X axis  
let y = point3D.y * cosX - z * sinX;
z = point3D.y * sinX + z * cosX;

// Project to 2D (perspective)
const scale = focalLength / (focalLength + z);
const screen2D = {
  x: centerX + x * scale,
  y: centerY + y * scale
};
```

### 2. Drawing with Graphics
```javascript
const graphics = this.add.graphics();

// Draw cube faces
graphics.fillStyle(0x7b5cff, 1);
graphics.beginPath();
graphics.moveTo(points[0].x, points[0].y);
graphics.lineTo(points[1].x, points[1].y);
graphics.lineTo(points[2].x, points[2].y);
graphics.lineTo(points[3].x, points[3].y);
graphics.closePath();
graphics.fill();
```

### 3. Isometric Projection (Simpler)
```javascript
// Isometric conversion
function toIsometric(x, y, z) {
  return {
    screenX: (x - y) * tileWidth / 2,
    screenY: (x + y) * tileHeight / 2 - z * tileHeight
  };
}
```

## For Real 3D: Use Three.js
If you need actual 3D, integrate Three.js:

```javascript
// In your HTML, add Three.js
// Then in Phaser scene:
create() {
  // Create Three.js renderer on same canvas or separate
  this.threeRenderer = new THREE.WebGLRenderer({ alpha: true });
  
  // Create scene and camera
  this.threeScene = new THREE.Scene();
  this.threeCamera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
  
  // Add cube
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x7b5cff });
  this.cube = new THREE.Mesh(geometry, material);
  this.threeScene.add(this.cube);
}

update() {
  this.cube.rotation.x += 0.01;
  this.threeRenderer.render(this.threeScene, this.threeCamera);
}
```

## Unity Comparison
| Unity | Phaser + Fake 3D |
|-------|------------------|
| Transform.Rotate() | Manual rotation matrices |
| MeshRenderer | Graphics.fillPolygon() |
| Camera (Perspective) | Manual projection math |
| Lighting | ❌ Fake with color gradients |
| Materials | ❌ Solid colors only |

## Try Modifying
- Adjust rotation speed with arrow keys
- Change cube size
- Try different projection (orthographic vs perspective)
- Add more shapes (pyramid, sphere wireframe)

