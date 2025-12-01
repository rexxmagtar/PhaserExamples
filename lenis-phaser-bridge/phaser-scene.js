/**
 * Phaser Scene - Vertical Images with Shaders and Particles
 * Separate from bridge logic - only handles rendering
 */

// ============================================
// SHADER PIPELINES
// ============================================

class DistortionPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor(game) {
    super({
      game,
      name: 'DistortionPipeline',
      fragShader: `
        precision mediump float;
        uniform sampler2D uMainSampler;
        uniform float uTime;
        uniform float uIntensity;
        varying vec2 outTexCoord;
        
        void main() {
          vec2 uv = outTexCoord;
          
          // Distortion effect based on time only (no position dependency)
          float distortion = sin(uTime * 3.0) * uIntensity;
          distortion += sin(uTime * 2.0) * uIntensity * 0.5*uv.x * uv.y;
          
          // Apply uniform distortion to UV coordinates
          uv.x += distortion;
          uv.y += distortion * 0.5;
          
          vec4 color = texture2D(uMainSampler, uv);
          
          // Slight chromatic aberration (time-based only)
          float r = texture2D(uMainSampler, uv + vec2(distortion * 0.01, 0.0)).r;
          float g = color.g;
          float b = texture2D(uMainSampler, uv - vec2(distortion * 0.01, 0.0)).b;
          
          gl_FragColor = vec4(r, g, b, color.a);
        }
      `
    });
    
    this._intensity = 0.03;
  }
  
  onPreRender() {
    this.set1f('uTime', this.game.loop.time / 1000);
    this.set1f('uIntensity', this._intensity);
  }
  
  setIntensity(value) {
    this._intensity = value;
  }
}

class WaveDistortionPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor(game) {
    super({
      game,
      name: 'WaveDistortionPipeline',
      fragShader: `
        precision mediump float;
        uniform sampler2D uMainSampler;
        uniform float uTime;
        uniform float uAmplitude;
        varying vec2 outTexCoord;
        
        void main() {
          vec2 uv = outTexCoord;
          
          // Wave distortion based on time only (no position dependency)
          float waveX = sin(uTime * 2.0) * uAmplitude;
          float waveY = sin(uTime * 1.5) * uAmplitude * 0.5;
          
          // Apply uniform wave distortion
          uv.x += waveX;
          uv.y += waveY;
          
          vec4 color = texture2D(uMainSampler, uv);
          gl_FragColor = color;
        }
      `
    });
    
    this._amplitude = 0.015;
  }
  
  onPreRender() {
    this.set1f('uTime', this.game.loop.time / 1000);
    this.set1f('uAmplitude', this._amplitude);
  }
  
  setAmplitude(value) {
    this._amplitude = value;
  }
}

class ChromaticAberrationPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor(game) {
    super({
      game,
      name: 'ChromaticAberrationPipeline',
      fragShader: `
        precision mediump float;
        uniform sampler2D uMainSampler;
        uniform float uAmount;
        uniform float uTime;
        varying vec2 outTexCoord;
        
        void main() {
          vec2 uv = outTexCoord;
          // Chromatic aberration based on time only (no position dependency)
          float timeOffset = sin(uTime * 2.0) * uAmount;
          vec2 offset = vec2(timeOffset, 0.0);
          
          float r = texture2D(uMainSampler, uv + offset).r;
          float g = texture2D(uMainSampler, uv).g;
          float b = texture2D(uMainSampler, uv - offset).b;
          float a = texture2D(uMainSampler, uv).a;
          
          gl_FragColor = vec4(r, g, b, a);
        }
      `
    });
    
    this._amount = 0.008;
  }
  
  onPreRender() {
    this.set1f('uAmount', this._amount);
    this.set1f('uTime', this.game.loop.time / 1000);
  }
  
  setAmount(value) {
    this._amount = value;
  }
}

class PixelatePipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor(game) {
    super({
      game,
      name: 'PixelatePipeline',
      fragShader: `
        precision mediump float;
        uniform sampler2D uMainSampler;
        uniform vec2 uResolution;
        uniform float uPixelSize;
        varying vec2 outTexCoord;
        
        void main() {
          vec2 uv = outTexCoord;
          vec2 dxy = uPixelSize / uResolution;
          vec2 coord = dxy * floor(uv / dxy);
          vec4 color = texture2D(uMainSampler, coord);
          gl_FragColor = color;
        }
      `
    });
    
    this._pixelSize = 8.0;
  }
  
  onPreRender() {
    const { width, height } = this.game.scale;
    this.set2f('uResolution', width, height);
    this.set1f('uPixelSize', this._pixelSize);
  }
  
  setPixelSize(value) {
    this._pixelSize = value;
  }
}

class GlowPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor(game) {
    super({
      game,
      name: 'GlowPipeline',
      fragShader: `
        precision mediump float;
        uniform sampler2D uMainSampler;
        uniform float uTime;
        uniform float uIntensity;
        varying vec2 outTexCoord;
        
        void main() {
          vec4 color = texture2D(uMainSampler, outTexCoord);
          
          // Simple blur for glow
          float blurSize = 0.003;
          vec4 blur = vec4(0.0);
          for (float x = -2.0; x <= 2.0; x++) {
            for (float y = -2.0; y <= 2.0; y++) {
              blur += texture2D(uMainSampler, outTexCoord + vec2(x, y) * blurSize);
            }
          }
          blur /= 25.0;
          
          // Pulsing glow
          float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
          
          gl_FragColor = color + blur * uIntensity * pulse;
        }
      `
    });
    
    this._intensity = 0.4;
  }
  
  onPreRender() {
    this.set1f('uTime', this.game.loop.time / 1000);
    this.set1f('uIntensity', this._intensity);
  }
  
  setIntensity(value) {
    this._intensity = value;
  }
}

class TextDistortionPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor(game) {
    super({
      game,
      name: 'TextDistortionPipeline',
      fragShader: `
        precision mediump float;
        uniform sampler2D uMainSampler;
        uniform float uTime;
        uniform float uIntensity;
        varying vec2 outTexCoord;
        
        void main() {
          vec2 uv = outTexCoord;
          
          // Simple time-based distortion for text
          float distortion = sin(uTime * 2.0) * uIntensity;
          
          // Apply minimal distortion
          uv.x += distortion * 0.02;
          uv.y += distortion * 0.01;
          
          vec4 color = texture2D(uMainSampler, uv);
          gl_FragColor = color;
        }
      `
    });
    
    this._intensity = 0.05;
  }
  
  onPreRender() {
    this.set1f('uTime', this.game.loop.time / 1000);
    this.set1f('uIntensity', this._intensity);
  }
  
  setIntensity(value) {
    this._intensity = value;
  }
}

// ============================================
// PHASER SCENE
// ============================================

class ScrollScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ScrollScene' });
    this.scrollY = 0;
    this.pages = [];
    this.pageEffects = [];
    this.pagesContainer = null;
    this.currentPageIndex = 0;
    this.fpsText = null;
    this.memoryText = null;
    this.lastMemoryUpdate = 0;
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // Note: Input is enabled for mini-game button interactions
    // Scroll input is still handled by Lenis via bridge.js
    
    // Register all shader pipelines
    this.renderer.pipelines.addPostPipeline('Distortion', DistortionPipeline);
    this.renderer.pipelines.addPostPipeline('WaveDistortion', WaveDistortionPipeline);
    this.renderer.pipelines.addPostPipeline('ChromaticAberration', ChromaticAberrationPipeline);
    this.renderer.pipelines.addPostPipeline('Pixelate', PixelatePipeline);
    this.renderer.pipelines.addPostPipeline('Glow', GlowPipeline);
    this.renderer.pipelines.addPostPipeline('TextDistortion', TextDistortionPipeline);
    
    // Create container for all pages
    this.pagesContainer = this.add.container(width / 2, 0);
    
    // Create particle textures
    this.createParticleTextures();
    
    // Create pages (vertical/portrait images like PDF viewer)
    this.pages = [];
    this.pageEffects = []; // Track effects per page
    const pageCount = 12; // More pages for more effects
    // Portrait orientation: width < height (like A4 or Letter paper)
    // Use 85% of screen width for page width, then calculate height with portrait aspect ratio
    const pageWidth = width * 0.85;
    const portraitAspectRatio = 11 / 8.5; // Letter size ratio (or use 297/210 for A4)
    const pageHeight = pageWidth * portraitAspectRatio; // Taller than wide (portrait)
    
    // Store page dimensions for later use
    this.pageWidth = pageWidth;
    this.pageHeight = pageHeight;
    
    for (let i = 0; i < pageCount; i++) {
      const pageY = i * pageHeight;
      
      // Create page container
      const pageContainer = this.add.container(0, pageY);
      
      // Create page background (simulating an image - vertical/portrait orientation)
      // In real use, you'd load actual images here
      const pageBg = this.add.rectangle(0, 0, pageWidth, pageHeight, 0x2a2a2a);
      
      // Add some visual content to simulate an image
      // Create a gradient-like effect with multiple rectangles
      const colors = [
        [0x4a90e2, 0x357abd], // Blue
        [0xe24a4a, 0xbd3535], // Red
        [0x4ae24a, 0x35bd35], // Green
        [0xe2e24a, 0xbdbd35], // Yellow
        [0xe24ae2, 0xbd35bd], // Magenta
        [0x4ae2e2, 0x35bdbd], // Cyan
        [0xe2a44a, 0xbd8535], // Orange
        [0x9b4ae2, 0x7b35bd]  // Purple
      ];
      
      const [color1, color2] = colors[i % colors.length];
      
      // Create vertical gradient effect
      const gradientSteps = 20;
      for (let j = 0; j < gradientSteps; j++) {
        const ratio = j / gradientSteps;
        const currentColor = Phaser.Display.Color.Interpolate.ColorWithColor(
          Phaser.Display.Color.ValueToColor(color1),
          Phaser.Display.Color.ValueToColor(color2),
          gradientSteps,
          j
        );
        const colorValue = Phaser.Display.Color.GetColor(
          currentColor.r, currentColor.g, currentColor.b
        );
        const rect = this.add.rectangle(
          0,
          -pageHeight / 2 + (j * pageHeight / gradientSteps),
          pageWidth,
          pageHeight / gradientSteps + 1,
          colorValue
        );
        pageContainer.add(rect);
      }
      
      // Add page background
      pageContainer.add(pageBg);
      pageContainer.sendToBack(pageBg);
      
      // Add effects based on page number
      const effectType = this.getEffectForPage(i);
      this.pageEffects.push({
        pageIndex: i,
        effectType: effectType,
        pageY: pageY,
        shaderPipeline: null,
        particles: [],
        shaderEnabled: true // Track shader state
      });
      
      // Apply shader effects - we'll apply to page background and all shapes
      let shaderName = null;
      if (['distortion', 'wave', 'chromatic', 'pixelate'].includes(effectType)) {
        // Map effect type to shader pipeline name
        const shaderMap = {
          'distortion': 'Distortion',
          'wave': 'WaveDistortion',
          'chromatic': 'ChromaticAberration',
          'pixelate': 'Pixelate'
        };
        
        shaderName = shaderMap[effectType];
        if (shaderName) {
          // Apply shader to page background
          pageBg.setPostPipeline(shaderName);
          this.pageEffects[i].shaderPipeline = pageBg.getPostPipeline(shaderName);
          this.pageEffects[i].shaderName = shaderName;
          this.pageEffects[i].pageBg = pageBg;
        }
      }
      
      // For simple text page, no shaders at all
      if (effectType === 'simpletext') {
        // No shaders, no particles - just simple text
        shaderName = null;
      }
      
      // For text distortion page, only apply shader to text, not background or shapes
      if (effectType === 'textdistortion') {
        // Don't apply shader to background or shapes, only to text (will be done after text is created)
        shaderName = 'TextDistortion'; // Store shader name for toggle button
        this.pageEffects[i].shaderName = shaderName;
        this.pageEffects[i].shaderEnabled = true;
      }
      
      // For simple text page, text shuffle page, and parallax page, skip default shapes
      if (effectType !== 'simpletext' && effectType !== 'textshuffle' && effectType !== 'parallax') {
        // Add geometric shapes to make effects more visible
        // Pass shader name so shapes can have shader applied too
        this.addGeometricShapes(pageContainer, i, pageWidth, pageHeight, shaderName);
      }
      
      // For text shuffle page, create shuffling text effect
      if (effectType === 'textshuffle') {
        this.createTextShuffleEffect(pageContainer, i, pageWidth, pageHeight);
      }
      
      // For parallax page, create parallax layers
      if (effectType === 'parallax') {
        this.createParallaxEffect(pageContainer, i, pageWidth, pageHeight);
      }
      
      // Add page number text
      const pageText = this.add.text(0, 0, `Page ${i + 1}`, {
        fontSize: '48px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
      });
      pageText.setOrigin(0.5);
      
      // For simple text page, add only text (no shaders, no shapes, no particles)
      if (effectType === 'simpletext') {
        // Just add simple text elements - no effects for maximum performance
        const text1 = this.add.text(0, -pageHeight / 4, 'Simple', {
          fontSize: '56px',
          color: '#ffffff',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 4
        });
        text1.setOrigin(0.5);
        
        const text2 = this.add.text(0, pageHeight / 4, 'Text Page', {
          fontSize: '56px',
          color: '#ffffff',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 4
        });
        text2.setOrigin(0.5);
        
        pageContainer.add([pageText, text1, text2]);
      } else if (effectType === 'parallax') {
        // For parallax page, add page text (parallax objects already added in createParallaxEffect)
        pageContainer.add(pageText);
      } else if (effectType === 'textdistortion') {
        // For text distortion page, apply shader only to text and add more text elements
        pageText.setPostPipeline('TextDistortion');
        this.pageEffects[i].textElements = [pageText];
        
        // Add additional text elements to show the distortion effect
        const text1 = this.add.text(-pageWidth / 4, -pageHeight / 4, 'DISTORTED', {
          fontSize: '64px',
          color: '#ff6b6b',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 3
        });
        text1.setOrigin(0.5);
        text1.setPostPipeline('TextDistortion');
        this.pageEffects[i].textElements.push(text1);
        
        const text2 = this.add.text(pageWidth / 4, pageHeight / 4, 'TEXT', {
          fontSize: '64px',
          color: '#4ecdc4',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 3
        });
        text2.setOrigin(0.5);
        text2.setPostPipeline('TextDistortion');
        this.pageEffects[i].textElements.push(text2);
        
        const text3 = this.add.text(0, -pageHeight / 6, 'EFFECT', {
          fontSize: '56px',
          color: '#f7dc6f',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 3
        });
        text3.setOrigin(0.5);
        text3.setPostPipeline('TextDistortion');
        this.pageEffects[i].textElements.push(text3);
        
        pageContainer.add([pageText, text1, text2, text3]);
      } else {
        pageContainer.add(pageText);
      }
      
      // Add particle effects to specific pages
      if (effectType === 'rain') {
        this.createRainEffect(pageContainer, pageY, width, height);
      } else if (effectType === 'fire') {
        this.createFireEffect(pageContainer, pageY, width, height);
      } else if (effectType === 'smoke') {
        this.createSmokeEffect(pageContainer, pageY, width, height);
      } else if (effectType === 'magic') {
        this.createMagicEffect(pageContainer, pageY, width, height);
      } else if (effectType === 'minigame') {
        this.createMiniGame(pageContainer, pageY, width, height, i);
      }
      
      this.pagesContainer.add(pageContainer);
      this.pages.push(pageContainer);
      
      // Store page container reference in effects for visibility control
      this.pageEffects[i].pageContainer = pageContainer;
      
      // Add shader toggle button if page has a shader (textshuffle doesn't use shader, so no button)
      if ((shaderName || effectType === 'textdistortion') && effectType !== 'textshuffle') {
        this.addShaderToggleButton(pageContainer, i, pageWidth, pageHeight, shaderName || 'TextDistortion', effectType);
      }
      
      // Initially hide all pages except first 3 (for performance)
      // They will be shown/hidden dynamically in updatePagesPosition
      if (i > 2) {
        pageContainer.setVisible(false);
        // Also hide/stop particles on hidden pages
        const effect = this.pageEffects[i];
        if (effect && effect.particles) {
          effect.particles.forEach(particleEmitter => {
            if (particleEmitter) {
              particleEmitter.setVisible(false);
              if (typeof particleEmitter.stop === 'function') {
                particleEmitter.stop();
              }
            }
          });
        }
      }
    }
    
    // Calculate total content height
    this.contentHeight = pageCount * pageHeight;
    
    // Update scroll content height to match Phaser content
    const scrollContent = document.getElementById('scroll-content');
    if (scrollContent) {
      scrollContent.style.height = `${this.contentHeight + height}px`;
    }
    
    // Initial position
    this.scrollY = 0;
    this.currentPageIndex = 0;
    this.updatePagesPosition();
    
    // Create FPS and Memory Tracker
    this.createPerformanceTracker();
  }
  
  createPerformanceTracker() {
    const { width, height } = this.cameras.main;
    
    // Background panel for tracker
    const panelBg = this.add.rectangle(10, 10, 200, 80, 0x000000, 0.7);
    panelBg.setOrigin(0, 0);
    panelBg.setScrollFactor(0); // Fixed to camera
    panelBg.setDepth(1000); // Always on top
    
    // FPS text
    this.fpsText = this.add.text(20, 20, 'FPS: --', {
      fontSize: '20px',
      color: '#00ff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.fpsText.setOrigin(0, 0);
    this.fpsText.setScrollFactor(0); // Fixed to camera
    this.fpsText.setDepth(1001);
    
    // Memory text
    this.memoryText = this.add.text(20, 50, 'Memory: --', {
      fontSize: '18px',
      color: '#00aaff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.memoryText.setOrigin(0, 0);
    this.memoryText.setScrollFactor(0); // Fixed to camera
    this.memoryText.setDepth(1001);
    
    // Initialize last memory update time
    this.lastMemoryUpdate = 0;
  }
  
  update() {
    // Update FPS every frame
    if (this.fpsText) {
      const fps = Math.round(this.game.loop.actualFps);
      const color = fps >= 55 ? '#00ff00' : fps >= 30 ? '#ffff00' : '#ff0000';
      this.fpsText.setText(`FPS: ${fps}`);
      this.fpsText.setColor(color);
    }
    
    // Update memory every second (to avoid performance impact)
    const now = this.time.now;
    if (this.memoryText && now - this.lastMemoryUpdate > 1000) {
      this.lastMemoryUpdate = now;
      
      // Try to get memory info (Chrome/Edge only)
      if (performance.memory) {
        const usedMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
        const totalMB = (performance.memory.totalJSHeapSize / 1048576).toFixed(2);
        const limitMB = (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2);
        this.memoryText.setText(`Memory: ${usedMB}MB / ${totalMB}MB (${limitMB}MB limit)`);
      } else {
        // Fallback for browsers without memory API
        this.memoryText.setText('Memory: N/A (not supported)');
      }
    }
  }

  createParticleTextures() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Raindrop particle
    graphics.fillStyle(0xffffff);
    graphics.fillRect(0, 0, 2, 10);
    graphics.generateTexture('particle-rain', 2, 10);
    graphics.clear();
    
    // Fire particle (glow)
    for (let i = 16; i > 0; i--) {
      const alpha = (i / 16) * 0.8;
      graphics.fillStyle(0xffffff, alpha);
      graphics.fillCircle(16, 16, i);
    }
    graphics.generateTexture('particle-glow', 32, 32);
    graphics.clear();
    
    // Fire ember (circle)
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('particle-circle', 8, 8);
    graphics.clear();
    
    // Confetti particles (small squares)
    graphics.fillStyle(0xffffff);
    graphics.fillRect(0, 0, 6, 6);
    graphics.generateTexture('particle-confetti', 6, 6);
    graphics.clear();
    
    graphics.destroy();
  }

  addGeometricShapes(container, pageIndex, pageWidth, pageHeight, shaderName = null) {
    // Create various geometric shapes to make effects more visible
    const shapes = [];
    const shapeCount = 15; // Number of shapes per page
    
    // Different shape types
    const shapeTypes = ['cube', 'triangle', 'circle', 'star', 'hexagon'];
    
    for (let i = 0; i < shapeCount; i++) {
      const shapeType = shapeTypes[i % shapeTypes.length];
      const x = Phaser.Math.Between(-pageWidth / 2 + 50, pageWidth / 2 - 50);
      const y = Phaser.Math.Between(-pageHeight / 2 + 50, pageHeight / 2 - 50);
      const size = Phaser.Math.Between(30, 80);
      const rotation = Phaser.Math.Between(0, 360);
      
      // Bright colors for visibility
      const colors = [0xffffff, 0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xffa07a, 0x98d8c8, 0xf7dc6f, 0xbb8fce, 0xffd93d, 0x6bcf7f];
      const color = colors[i % colors.length];
      
      let shape;
      
      switch (shapeType) {
        case 'cube':
          // Draw a cube (square with 3D effect)
          shape = this.add.graphics();
          shape.fillStyle(color, 0.9);
          shape.fillRect(-size / 2, -size / 2, size, size);
          shape.lineStyle(3, 0x000000, 1);
          shape.strokeRect(-size / 2, -size / 2, size, size);
          // Add 3D effect lines
          const offset = size * 0.3;
          shape.lineStyle(2, color, 0.6);
          shape.beginPath();
          shape.moveTo(size / 2, -size / 2);
          shape.lineTo(size / 2 + offset, -size / 2 - offset);
          shape.lineTo(size / 2 + offset, size / 2 - offset);
          shape.lineTo(size / 2, size / 2);
          shape.strokePath();
          shape.beginPath();
          shape.moveTo(-size / 2, size / 2);
          shape.lineTo(size / 2 + offset, size / 2 - offset);
          shape.lineTo(size / 2, size / 2);
          shape.strokePath();
          shape.setPosition(x, y);
          shape.setRotation(Phaser.Math.DegToRad(rotation));
          break;
          
        case 'triangle':
          // Draw a triangle
          shape = this.add.graphics();
          shape.fillStyle(color, 0.9);
          shape.beginPath();
          shape.moveTo(0, -size / 2);
          shape.lineTo(-size / 2, size / 2);
          shape.lineTo(size / 2, size / 2);
          shape.closePath();
          shape.fillPath();
          shape.lineStyle(3, 0x000000, 1);
          shape.strokePath();
          shape.setPosition(x, y);
          shape.setRotation(Phaser.Math.DegToRad(rotation));
          break;
          
        case 'circle':
          // Draw a circle
          shape = this.add.circle(x, y, size / 2, color, 0.9);
          shape.setStrokeStyle(3, 0x000000, 1);
          break;
          
        case 'star':
          // Draw a star
          shape = this.add.graphics();
          shape.fillStyle(color, 0.9);
          const points = 5;
          const outerRadius = size / 2;
          const innerRadius = size / 4;
          shape.beginPath();
          for (let p = 0; p < points * 2; p++) {
            const radius = p % 2 === 0 ? outerRadius : innerRadius;
            const angle = (p * Math.PI / points) - Math.PI / 2;
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;
            if (p === 0) {
              shape.moveTo(px, py);
            } else {
              shape.lineTo(px, py);
            }
          }
          shape.closePath();
          shape.fillPath();
          shape.lineStyle(3, 0x000000, 1);
          shape.strokePath();
          shape.setPosition(x, y);
          shape.setRotation(Phaser.Math.DegToRad(rotation));
          break;
          
        case 'hexagon':
          // Draw a hexagon
          shape = this.add.graphics();
          shape.fillStyle(color, 0.9);
          const hexPoints = 6;
          shape.beginPath();
          for (let p = 0; p < hexPoints; p++) {
            const angle = (p * 2 * Math.PI / hexPoints) - Math.PI / 2;
            const px = Math.cos(angle) * size / 2;
            const py = Math.sin(angle) * size / 2;
            if (p === 0) {
              shape.moveTo(px, py);
            } else {
              shape.lineTo(px, py);
            }
          }
          shape.closePath();
          shape.fillPath();
          shape.lineStyle(3, 0x000000, 1);
          shape.strokePath();
          shape.setPosition(x, y);
          shape.setRotation(Phaser.Math.DegToRad(rotation));
          break;
      }
      
      if (shape) {
        // Apply shader to shape if provided
        if (shaderName) {
          shape.setPostPipeline(shaderName);
        }
        container.add(shape);
        shapes.push(shape);
      }
    }
    
    // Add some overlapping shapes for depth
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(-pageWidth / 2 + 100, pageWidth / 2 - 100);
      const y = Phaser.Math.Between(-pageHeight / 2 + 100, pageHeight / 2 - 100);
      const size = Phaser.Math.Between(40, 100);
      const color = Phaser.Math.Between(0x888888, 0xffffff);
      
      const circle = this.add.circle(x, y, size / 2, color, 0.5);
      circle.setStrokeStyle(2, 0x000000, 0.8);
      // Apply shader to circle if provided
      if (shaderName) {
        circle.setPostPipeline(shaderName);
      }
      container.add(circle);
    }
    
    // Add some lines/patterns
    const lineGraphics = this.add.graphics();
    lineGraphics.lineStyle(2, 0xffffff, 0.3);
    for (let i = 0; i < 8; i++) {
      const x1 = Phaser.Math.Between(-pageWidth / 2, pageWidth / 2);
      const y1 = Phaser.Math.Between(-pageHeight / 2, pageHeight / 2);
      const x2 = Phaser.Math.Between(-pageWidth / 2, pageWidth / 2);
      const y2 = Phaser.Math.Between(-pageHeight / 2, pageHeight / 2);
      lineGraphics.lineBetween(x1, y1, x2, y2);
    }
    // Apply shader to line graphics if provided
    if (shaderName) {
      lineGraphics.setPostPipeline(shaderName);
    }
    container.add(lineGraphics);
  }

  addShaderToggleButton(container, pageIndex, pageWidth, pageHeight, shaderName, effectType) {
    // Create toggle button in top-right corner of page
    const buttonX = pageWidth / 2 - 60;
    const buttonY = -pageHeight / 2 + 30;
    
    // Button background
    const buttonBg = this.add.rectangle(buttonX, buttonY, 100, 40, 0x333333, 0.8);
    buttonBg.setStrokeStyle(2, 0xffffff, 1);
    buttonBg.setInteractive({ useHandCursor: true });
    
    // Button text
    const buttonText = this.add.text(buttonX, buttonY, 'Shader ON', {
      fontSize: '18px',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);
    buttonText.setInteractive({ useHandCursor: true });
    
    const effect = this.pageEffects[pageIndex];
    
    // Toggle function
    const toggleShader = () => {
      effect.shaderEnabled = !effect.shaderEnabled;
      
      if (effectType === 'textdistortion') {
        // For text distortion, toggle shader on all text elements
        if (effect.textElements) {
          effect.textElements.forEach(text => {
            if (effect.shaderEnabled) {
              // Only add if not already present
              if (!text.getPostPipeline(shaderName)) {
                text.setPostPipeline(shaderName);
              }
            } else {
              // Remove the shader pipeline
              const pipeline = text.getPostPipeline(shaderName);
              if (pipeline) {
                text.removePostPipeline(shaderName);
              }
            }
          });
        }
      } else {
        // For other shaders, toggle on background and shapes
        if (effect.pageBg) {
          if (effect.shaderEnabled) {
            // Only add if not already present
            if (!effect.pageBg.getPostPipeline(shaderName)) {
              effect.pageBg.setPostPipeline(shaderName);
              effect.shaderPipeline = effect.pageBg.getPostPipeline(shaderName);
            }
          } else {
            // Remove the shader pipeline
            const pipeline = effect.pageBg.getPostPipeline(shaderName);
            if (pipeline) {
              effect.pageBg.removePostPipeline(shaderName);
            }
            effect.shaderPipeline = null;
          }
        }
        
        // Toggle shader on all shapes in container
        container.list.forEach(item => {
          if (item !== buttonBg && item !== buttonText && item !== effect.pageBg) {
            // Skip page number text and button elements
            const isPageText = item.type === 'Text' && item.text && item.text.includes('Page');
            if (!isPageText && item.removePostPipeline) {
              const hasShader = item.getPostPipeline(shaderName);
              
              if (effect.shaderEnabled) {
                // Add shader if not already present
                if (!hasShader) {
                  item.setPostPipeline(shaderName);
                }
              } else {
                // Remove shader if present
                if (hasShader) {
                  item.removePostPipeline(shaderName);
                }
              }
            }
          }
        });
      }
      
      // Update button appearance
      if (effect.shaderEnabled) {
        buttonText.setText('Shader ON');
        buttonText.setColor('#00ff00');
        buttonBg.setFillStyle(0x333333, 0.8);
      } else {
        buttonText.setText('Shader OFF');
        buttonText.setColor('#ff0000');
        buttonBg.setFillStyle(0x333333, 0.6);
      }
    };
    
    // Add click handlers
    buttonBg.on('pointerdown', toggleShader);
    buttonText.on('pointerdown', toggleShader);
    
    // Add to container
    container.add([buttonBg, buttonText]);
    
    // Store button reference
    effect.toggleButton = { bg: buttonBg, text: buttonText };
  }

  createParallaxEffect(container, pageIndex, pageWidth, pageHeight) {
    // Create multiple layers with different parallax speeds
    // Speed 1.0 = moves with page (background)
    // Speed > 1.0 = moves faster (foreground)
    // Speed < 1.0 = moves slower (far background)
    
    const parallaxLayers = [];
    
    // Background layer (slowest - moves at 0.3x speed)
    const bgCircle1 = this.add.circle(-pageWidth / 3, -pageHeight / 4, 80, 0x4a90e2, 0.6);
    const bgCircle2 = this.add.circle(pageWidth / 3, pageHeight / 4, 100, 0xe24a4a, 0.6);
    container.add([bgCircle1, bgCircle2]);
    parallaxLayers.push({ objects: [bgCircle1, bgCircle2], speed: 0.3 });
    
    // Mid-background layer (0.6x speed)
    const midRect1 = this.add.rectangle(-pageWidth / 4, -pageHeight / 6, 120, 120, 0x4ae24a, 0.7);
    const midRect2 = this.add.rectangle(pageWidth / 4, pageHeight / 6, 100, 100, 0xe2e24a, 0.7);
    container.add([midRect1, midRect2]);
    parallaxLayers.push({ objects: [midRect1, midRect2], speed: 0.6 });
    
    // Midground layer (normal speed - 1.0x)
    const midText = this.add.text(0, -pageHeight / 8, 'PARALLAX', {
      fontSize: '72px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    midText.setOrigin(0.5);
    container.add(midText);
    parallaxLayers.push({ objects: [midText], speed: 1.0 });
    
    // Foreground layer (faster - 1.5x speed)
    const fgTriangle1 = this.add.triangle(-pageWidth / 3, pageHeight / 4, 0, -40, -40, 40, 40, 40, 0xff6b6b);
    const fgTriangle2 = this.add.triangle(pageWidth / 3, -pageHeight / 4, 0, -40, -40, 40, 40, 40, 0x4ecdc4);
    container.add([fgTriangle1, fgTriangle2]);
    parallaxLayers.push({ objects: [fgTriangle1, fgTriangle2], speed: 1.5 });
    
    // Very foreground layer (fastest - 2.0x speed)
    const vfgStar1 = this.add.graphics();
    vfgStar1.fillStyle(0xf7dc6f);
    const starPoints1 = [];
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? 30 : 15;
      const angle = (i * Math.PI / 5) - Math.PI / 2;
      starPoints1.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    vfgStar1.fillPoints(starPoints1, true);
    vfgStar1.setPosition(-pageWidth / 5, pageHeight / 5);
    
    const vfgStar2 = this.add.graphics();
    vfgStar2.fillStyle(0xbb8fce);
    const starPoints2 = [];
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? 25 : 12;
      const angle = (i * Math.PI / 5) - Math.PI / 2;
      starPoints2.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    vfgStar2.fillPoints(starPoints2, true);
    vfgStar2.setPosition(pageWidth / 5, -pageHeight / 5);
    
    container.add([vfgStar1, vfgStar2]);
    parallaxLayers.push({ objects: [vfgStar1, vfgStar2], speed: 2.0 });
    
    // Store base Y positions for parallax calculation
    parallaxLayers.forEach(layer => {
      layer.objects.forEach(obj => {
        obj.baseY = obj.y; // Store original Y position relative to container
      });
    });
    
    // Store parallax data for scroll updates
    this.pageEffects[pageIndex].parallaxLayers = parallaxLayers;
  }

  createTextShuffleEffect(container, pageIndex, pageWidth, pageHeight) {
    // Create multiple text elements that shuffle characters
    const texts = [
      { text: 'SHUFFLE', y: -pageHeight / 3, color: 0xff6b6b },
      { text: 'TEXT', y: 0, color: 0x4ecdc4 },
      { text: 'EFFECT', y: pageHeight / 3, color: 0xf7dc6f }
    ];
    
    const textObjects = [];
    const originalTexts = [];
    
    // Characters to use for shuffling
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    
    texts.forEach((item, index) => {
      const textObj = this.add.text(0, item.y, item.text, {
        fontSize: '64px',
        color: Phaser.Display.Color.ValueToColor(item.color).rgba,
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
      });
      textObj.setOrigin(0.5);
      container.add(textObj);
      
      textObjects.push(textObj);
      originalTexts.push(item.text);
      
      // Store original text and create shuffle animation
      textObj.originalText = item.text;
      textObj.shuffleIndex = 0;
      textObj.isShuffling = false;
    });
    
    // Store references for update
    this.pageEffects[pageIndex].shuffleTexts = textObjects;
    this.pageEffects[pageIndex].originalTexts = originalTexts;
    
    // Create shuffle animation timer
    this.time.addEvent({
      delay: 100, // Update every 100ms
      callback: () => {
        if (!this.pageEffects[pageIndex].shuffleTexts) return;
        
        textObjects.forEach((textObj, index) => {
          if (!textObj.active) return;
          
          // Alternate between shuffling and showing original
          const time = this.game.loop.time;
          const cycleTime = 3000; // 3 seconds per cycle
          const phase = (time % cycleTime) / cycleTime;
          
          if (phase < 0.7) {
            // Shuffling phase - random characters
            let shuffled = '';
            for (let i = 0; i < originalTexts[index].length; i++) {
              shuffled += chars[Math.floor(Math.random() * chars.length)];
            }
            textObj.setText(shuffled);
          } else {
            // Show original text
            textObj.setText(originalTexts[index]);
          }
        });
      },
      loop: true
    });
  }

  getEffectForPage(pageIndex) {
    // Map pages to different effects
    // pageIndex 0 = Page 1, pageIndex 1 = Page 2, ..., pageIndex 9 = Page 10, etc.
    const effects = [
      'normal',              // Page 1 (index 0): No effect
      'distortion',          // Page 2 (index 1): Distortion shader
      'rain',               // Page 3 (index 2): Rain particles
      'wave',               // Page 4 (index 3): Wave distortion shader
      'fire',               // Page 5 (index 4): Fire particles
      'chromatic',          // Page 6 (index 5): Chromatic aberration shader
      'smoke',              // Page 7 (index 6): Smoke particles
      'pixelate',           // Page 8 (index 7): Pixelate shader
      'textshuffle',        // Page 9 (index 8): Text shuffling effect (lightweight, no shader)
      'magic',              // Page 10 (index 9): Magic sparkles particles - RED PAGE WITH PARTICLES
      'parallax',           // Page 11 (index 10): Parallax effect - objects move at different speeds
      'minigame'            // Page 12 (index 11): Mini-game with button and confetti
    ];
    return effects[pageIndex] || 'normal';
  }

  createRainEffect(container, pageY, width, height) {
    // Rain particles - positioned relative to container (center of container, top)
    const rain = this.add.particles(0, -this.pageHeight / 2, 'particle-rain', {
      x: { min: -this.pageWidth / 2, max: this.pageWidth / 2 },
      y: 0,
      speedY: { min: 400, max: 600 },
      speedX: { min: -30, max: 30 },
      scale: { start: 1, end: 1 },
      alpha: { start: 0.7, end: 0.3 },
      lifespan: 2000,
      frequency: 15,
      quantity: 4,
      tint: 0x88aacc
    });
    
    // Rain splash at bottom of page (relative to container)
    const splash = this.add.particles(0, this.pageHeight / 2 - 20, 'particle-circle', {
      x: { min: -this.pageWidth / 2, max: this.pageWidth / 2 },
      speed: { min: 30, max: 60 },
      angle: { min: -150, max: -30 },
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 400,
      frequency: 30,
      quantity: 2,
      tint: 0x88aacc
    });
    
    // Add particles to container so they move with the page
    container.add([rain, splash]);
    
    // Store references
    const pageIndex = Math.floor(pageY / this.pageHeight);
    if (this.pageEffects[pageIndex]) {
      this.pageEffects[pageIndex].particles.push(rain, splash);
    }
  }

  createFireEffect(container, pageY, width, height) {
    const fireX = 0; // Center of container
    const fireY = this.pageHeight / 2 - 100; // Near bottom of page (relative to container)
    
    // Core fire
    const fire = this.add.particles(fireX, fireY, 'particle-glow', {
      speed: { min: 60, max: 140 },
      angle: { min: -100, max: -80 },
      scale: { start: 0.7, end: 0 },
      alpha: { start: 0.9, end: 0 },
      lifespan: { min: 600, max: 1200 },
      frequency: 25,
      quantity: 3,
      blendMode: 'ADD',
      tint: [0xff4500, 0xff6600, 0xff8c00, 0xffff00]
    });
    
    // Embers
    const embers = this.add.particles(fireX, fireY, 'particle-circle', {
      speed: { min: 100, max: 180 },
      angle: { min: -110, max: -70 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: { min: 1000, max: 1800 },
      frequency: 80,
      quantity: 1,
      blendMode: 'ADD',
      tint: [0xff6600, 0xffff00]
    });
    
    // Add particles to container so they move with the page
    container.add([fire, embers]);
    
    // Store references
    const pageIndex = Math.floor(pageY / this.pageHeight);
    if (this.pageEffects[pageIndex]) {
      this.pageEffects[pageIndex].particles.push(fire, embers);
    }
  }

  createSmokeEffect(container, pageY, width, height) {
    const smokeX = 0; // Center of container
    const smokeY = this.pageHeight / 2 - 150; // Near bottom of page
    
    // Smoke particles
    const smoke = this.add.particles(smokeX, smokeY, 'particle-glow', {
      speed: { min: 20, max: 60 },
      angle: { min: -90, max: -70 },
      scale: { start: 0.3, end: 1.2 },
      alpha: { start: 0.6, end: 0 },
      lifespan: { min: 2000, max: 3000 },
      frequency: 100,
      quantity: 2,
      tint: [0x666666, 0x888888, 0xaaaaaa]
    });
    
    // Add particles to container
    container.add(smoke);
    
    // Store references
    const pageIndex = Math.floor(pageY / this.pageHeight);
    if (this.pageEffects[pageIndex]) {
      this.pageEffects[pageIndex].particles.push(smoke);
    }
  }

  createMagicEffect(container, pageY, width, height) {
    // Magic sparkles - multiple emitters across the page
    const magic1 = this.add.particles(-this.pageWidth / 4, -this.pageHeight / 3, 'particle-circle', {
      speed: { min: 30, max: 80 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.2, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: { min: 800, max: 1500 },
      frequency: 200,
      quantity: 1,
      blendMode: 'ADD',
      tint: [0xff00ff, 0x00ffff, 0xffff00, 0xff00ff]
    });
    
    const magic2 = this.add.particles(this.pageWidth / 4, this.pageHeight / 3, 'particle-circle', {
      speed: { min: 30, max: 80 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.2, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: { min: 800, max: 1500 },
      frequency: 200,
      quantity: 1,
      blendMode: 'ADD',
      tint: [0x00ffff, 0xff00ff, 0xffff00, 0x00ffff]
    });
    
    const magic3 = this.add.particles(0, 0, 'particle-glow', {
      speed: { min: 50, max: 120 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: { min: 1000, max: 2000 },
      frequency: 150,
      quantity: 1,
      blendMode: 'ADD',
      tint: [0xffff00, 0xff00ff, 0x00ffff]
    });
    
    // Add particles to container
    container.add([magic1, magic2, magic3]);
    
    // Store references
    const pageIndex = Math.floor(pageY / this.pageHeight);
    if (this.pageEffects[pageIndex]) {
      this.pageEffects[pageIndex].particles.push(magic1, magic2, magic3);
    }
  }

  createMiniGame(container, pageY, width, height, pageIndex) {
    // Initialize game state for this page
    if (!this.pageEffects[pageIndex].gameState) {
      this.pageEffects[pageIndex].gameState = {
        clicks: 0,
        completed: false,
        button: null,
        completeText: null,
        confetti: null
      };
    }
    
    const gameState = this.pageEffects[pageIndex].gameState;
    
    // Create button
    const buttonBg = this.add.rectangle(0, 0, 200, 80, 0x4ecdc4);
    buttonBg.setStrokeStyle(4, 0xffffff, 1);
    
    const buttonText = this.add.text(0, 0, 'Click Me!', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });
    buttonText.setOrigin(0.5);
    
    // Make button interactive
    buttonBg.setInteractive({ useHandCursor: true });
    buttonText.setInteractive({ useHandCursor: true });
    
    // Click handler
    const onClick = () => {
      if (gameState.completed) return;
      
      gameState.clicks++;
      
      // Button animation on click
      this.tweens.add({
        targets: [buttonBg, buttonText],
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      });
      
      // Update button text
      const remaining = 3 - gameState.clicks;
      if (remaining > 0) {
        buttonText.setText(`${remaining} more!`);
      } else {
        // Game complete!
        gameState.completed = true;
        buttonText.setText('Done!');
        buttonBg.setFillStyle(0x6bcf7f);
        
        // Show completion text with animation
        this.showCompletionMessage(container, gameState);
        
        // Create confetti
        this.createConfetti(container, gameState);
      }
    };
    
    // Set up click handlers
    buttonBg.on('pointerdown', onClick);
    buttonText.on('pointerdown', onClick);
    
    // Add button to container
    container.add([buttonBg, buttonText]);
    gameState.button = { bg: buttonBg, text: buttonText };
    
    // Instructions text
    const instructions = this.add.text(0, -this.pageHeight / 4, 'Press the button 3 times!', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    });
    instructions.setOrigin(0.5);
    container.add(instructions);
  }

  showCompletionMessage(container, gameState) {
    // Create "Task Complete" text
    const completeText = this.add.text(0, this.pageHeight / 4, 'Task Complete!', {
      fontSize: '64px',
      color: '#ffd93d',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    completeText.setOrigin(0.5);
    completeText.setAlpha(0);
    completeText.setScale(0);
    
    // Animate text appearance
    this.tweens.add({
      targets: completeText,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });
    
    // Add pulsing animation
    this.tweens.add({
      targets: completeText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    container.add(completeText);
    gameState.completeText = completeText;
  }

  createConfetti(container, gameState) {
    const { width: screenWidth, height: screenHeight } = this.cameras.main;
    
    // Create confetti from top of page
    const confetti = this.add.particles(0, -this.pageHeight / 2, 'particle-confetti', {
      x: { min: -screenWidth / 2, max: screenWidth / 2 },
      y: -this.pageHeight / 2,
      speedY: { min: 200, max: 400 },
      speedX: { min: -100, max: 100 },
      angle: { min: -30, max: 30 },
      scale: { start: 1, end: 0.5 },
      alpha: { start: 1, end: 0 },
      rotate: { start: 0, end: 360 },
      lifespan: { min: 2000, max: 3000 },
      frequency: 50,
      quantity: 5,
      tint: [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xffa07a, 0x98d8c8, 0xf7dc6f, 0xbb8fce, 0xffd93d]
    });
    
    // Add confetti to container
    container.add(confetti);
    gameState.confetti = confetti;
    
    // Stop confetti after 5 seconds
    this.time.delayedCall(5000, () => {
      if (confetti && confetti.active) {
        confetti.stop();
      }
    });
  }

  updatePagesPosition() {
    // Move container up based on scroll (negative = scroll down)
    this.pagesContainer.y = -this.scrollY;
    
    // Update parallax effects - objects move at different speeds
    this.pageEffects.forEach((effect, index) => {
      if (effect.parallaxLayers && effect.pageContainer && effect.pageContainer.visible) {
        const pageY = index * this.pageHeight;
        
        // Calculate scroll offset relative to page
        // When scrollY = pageY, we're at the top of the page
        // When scrollY = pageY + pageHeight, we're at the bottom
        const scrollOffset = this.scrollY - pageY;
        
        // Update each parallax layer
        effect.parallaxLayers.forEach(layer => {
          // Parallax offset: objects move at different speeds relative to scroll
          // Speed 1.0 = no offset (moves with container)
          // Speed < 1.0 = negative offset (moves slower)
          // Speed > 1.0 = positive offset (moves faster)
          const parallaxOffset = scrollOffset * (layer.speed - 1.0);
          
          layer.objects.forEach(obj => {
            if (obj && obj.active && obj.baseY !== undefined) {
              // Apply parallax offset to base Y position
              obj.y = obj.baseY + parallaxOffset;
            }
          });
        });
      }
    });
    
    // Performance optimization: Only show pages close to the current view
    // Show: current page, 1 page before, 1 page after (3 pages total)
    const { height } = this.cameras.main;
    const currentPageY = this.scrollY + height / 2;
    const newCurrentPageIndex = Math.floor(currentPageY / this.pageHeight);
    
    // Only update visibility if we've moved to a different page
    if (newCurrentPageIndex !== this.currentPageIndex) {
      this.currentPageIndex = newCurrentPageIndex;
      
      // Determine which pages should be visible
      const visiblePageIndices = [
        Math.max(0, this.currentPageIndex - 1),  // Previous page
        this.currentPageIndex,                     // Current page
        Math.min(this.pages.length - 1, this.currentPageIndex + 1)  // Next page
      ];
      
      // Show/hide pages based on visibility
      this.pages.forEach((pageContainer, index) => {
        const shouldBeVisible = visiblePageIndices.includes(index);
        
        if (pageContainer) {
          // Set visibility of the entire page container
          pageContainer.setVisible(shouldBeVisible);
          
          // Also control particle emitters - stop/start them for better performance
          const effect = this.pageEffects[index];
          if (effect && effect.particles) {
            effect.particles.forEach(particleEmitter => {
              if (particleEmitter) {
                if (shouldBeVisible) {
                  // Make particles visible and active
                  particleEmitter.setVisible(true);
                  if (typeof particleEmitter.start === 'function') {
                    particleEmitter.start();
                  }
                } else {
                  // Hide and stop particles to save performance
                  particleEmitter.setVisible(false);
                  if (typeof particleEmitter.stop === 'function') {
                    particleEmitter.stop();
                  }
                }
              }
            });
          }
        }
      });
    }
  }

  // ✅ PHASER ONLY RECEIVES SCROLL POSITION (number)
  // ❌ PHASER NEVER RECEIVES INPUT EVENTS
  // This method is called by the bridge, not by Phaser's input system
  setScroll(scrollY) {
    this.scrollY = scrollY;
    this.updatePagesPosition();
  }
}

// ============================================
// INITIALIZE PHASER
// ============================================
const phaserConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'phaser-container',
  backgroundColor: '#1a1a1a',
  scene: ScrollScene
};

// Make game accessible globally for bridge.js
const game = new Phaser.Game(phaserConfig);
window.phaserGame = game; // Expose for bridge.js

// Handle window resize
window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});

