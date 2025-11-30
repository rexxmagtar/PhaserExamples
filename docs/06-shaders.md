# 🔮 Shader Effects Demo

## Overview
Phaser 3 uses **WebGL Pipelines** for custom shaders. These are GLSL fragment shaders that can be applied to cameras, game objects, or as post-processing effects.

## Unity Comparison
| Unity Shaders | Phaser WebGL |
|---------------|--------------|
| Shader Graph | ❌ No visual editor |
| HLSL | GLSL ES |
| Material | Pipeline |
| Shader.SetFloat() | `pipeline.set1f('name', value)` |
| Per-object shaders | Per-object or camera pipelines |
| Vertex shaders | Limited support |
| Post-processing stack | PostFXPipeline |

## Pipeline Types

### 1. PostFXPipeline (Post-Processing)
Applied after rendering, affects entire camera or specific objects:

```javascript
class GlowPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor(game) {
    super({
      game,
      name: 'GlowPipeline',
      fragShader: `
        precision mediump float;
        uniform sampler2D uMainSampler;
        uniform float uTime;
        varying vec2 outTexCoord;
        
        void main() {
          vec4 color = texture2D(uMainSampler, outTexCoord);
          // Add glow based on time
          float glow = sin(uTime * 3.0) * 0.5 + 0.5;
          color.rgb += glow * 0.3;
          gl_FragColor = color;
        }
      `
    });
  }
  
  onPreRender() {
    this.set1f('uTime', this.game.loop.time / 1000);
  }
}
```

### 2. Applying Pipelines

```javascript
// Register pipeline
this.renderer.pipelines.addPostPipeline('Glow', GlowPipeline);

// Apply to camera (affects entire scene)
this.cameras.main.setPostPipeline('Glow');

// Apply to specific game object
sprite.setPostPipeline('Glow');

// Get pipeline reference to modify uniforms
const pipeline = this.cameras.main.getPostPipeline('Glow');
pipeline.set1f('intensity', 0.5);
```

## Shader Recipes

### 🔥 Fire/Heat Distortion
```glsl
precision mediump float;
uniform sampler2D uMainSampler;
uniform float uTime;
varying vec2 outTexCoord;

void main() {
  vec2 uv = outTexCoord;
  
  // Distort UVs based on time
  uv.x += sin(uv.y * 20.0 + uTime * 5.0) * 0.01;
  uv.y += cos(uv.x * 20.0 + uTime * 3.0) * 0.01;
  
  vec4 color = texture2D(uMainSampler, uv);
  
  // Add warm tint
  color.r += 0.1;
  
  gl_FragColor = color;
}
```

### ✨ Glow/Bloom
```glsl
precision mediump float;
uniform sampler2D uMainSampler;
uniform float uIntensity;
varying vec2 outTexCoord;

void main() {
  vec4 color = texture2D(uMainSampler, outTexCoord);
  
  // Simple blur for glow
  vec4 blur = vec4(0.0);
  float blurSize = 0.005;
  
  for (float x = -2.0; x <= 2.0; x++) {
    for (float y = -2.0; y <= 2.0; y++) {
      blur += texture2D(uMainSampler, outTexCoord + vec2(x, y) * blurSize);
    }
  }
  blur /= 25.0;
  
  // Add bloom
  gl_FragColor = color + blur * uIntensity;
}
```

### 🌊 Wave/Water
```glsl
precision mediump float;
uniform sampler2D uMainSampler;
uniform float uTime;
varying vec2 outTexCoord;

void main() {
  vec2 uv = outTexCoord;
  
  // Wave distortion
  uv.y += sin(uv.x * 10.0 + uTime * 2.0) * 0.02;
  uv.x += sin(uv.y * 8.0 + uTime * 1.5) * 0.02;
  
  vec4 color = texture2D(uMainSampler, uv);
  
  // Blue tint
  color.b += 0.1;
  
  gl_FragColor = color;
}
```

### ⚡ Chromatic Aberration
```glsl
precision mediump float;
uniform sampler2D uMainSampler;
uniform float uAmount;
varying vec2 outTexCoord;

void main() {
  vec2 uv = outTexCoord;
  vec2 offset = (uv - 0.5) * uAmount;
  
  float r = texture2D(uMainSampler, uv + offset).r;
  float g = texture2D(uMainSampler, uv).g;
  float b = texture2D(uMainSampler, uv - offset).b;
  
  gl_FragColor = vec4(r, g, b, 1.0);
}
```

### 📺 CRT Scanlines
```glsl
precision mediump float;
uniform sampler2D uMainSampler;
uniform vec2 uResolution;
varying vec2 outTexCoord;

void main() {
  vec4 color = texture2D(uMainSampler, outTexCoord);
  
  // Scanlines
  float scanline = sin(outTexCoord.y * uResolution.y * 2.0) * 0.1;
  color.rgb -= scanline;
  
  // Vignette
  vec2 center = outTexCoord - 0.5;
  float vignette = 1.0 - dot(center, center) * 0.5;
  color.rgb *= vignette;
  
  gl_FragColor = color;
}
```

### 🎨 Pixelate
```glsl
precision mediump float;
uniform sampler2D uMainSampler;
uniform float uPixelSize;
uniform vec2 uResolution;
varying vec2 outTexCoord;

void main() {
  vec2 pixelatedUV = floor(outTexCoord * uResolution / uPixelSize) * uPixelSize / uResolution;
  gl_FragColor = texture2D(uMainSampler, pixelatedUV);
}
```

## Passing Uniforms

```javascript
// In pipeline class
onPreRender() {
  // Float
  this.set1f('uTime', this.game.loop.time / 1000);
  
  // Vec2
  this.set2f('uResolution', this.renderer.width, this.renderer.height);
  
  // Vec3/Vec4
  this.set3f('uColor', 1.0, 0.5, 0.2);
  this.set4f('uRect', 0, 0, 100, 100);
  
  // Array
  this.set1fv('uValues', [0.1, 0.2, 0.3]);
}
```

## Limitations vs Unity
- Fragment shaders only (limited vertex)
- No shader includes/libraries
- No render textures for multi-pass
- No compute shaders
- No geometry shaders
- GLSL ES 1.0 (WebGL 1) or ES 3.0 (WebGL 2)

## Try Modifying
- Combine multiple effects
- Create transitions (fade, wipe, zoom)
- Make effect intensity mouse-controlled
- Add audio-reactive shaders

