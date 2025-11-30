/**
 * Shader Effects Demo Scene
 * Demonstrates WebGL Post-Processing Pipelines
 */

// ==========================================
// SHADER PIPELINES
// ==========================================

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
    
    this._intensity = 0.5;
  }
  
  onPreRender() {
    this.set1f('uTime', this.game.loop.time / 1000);
    this.set1f('uIntensity', this._intensity);
  }
  
  setIntensity(value) {
    this._intensity = value;
  }
}

class WavePipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor(game) {
    super({
      game,
      name: 'WavePipeline',
      fragShader: `
        precision mediump float;
        uniform sampler2D uMainSampler;
        uniform float uTime;
        uniform float uAmplitude;
        varying vec2 outTexCoord;
        
        void main() {
          vec2 uv = outTexCoord;
          
          // Wave distortion
          uv.y += sin(uv.x * 10.0 + uTime * 2.0) * uAmplitude;
          uv.x += sin(uv.y * 8.0 + uTime * 1.5) * uAmplitude * 0.5;
          
          vec4 color = texture2D(uMainSampler, uv);
          
          // Slight blue tint for water effect
          color.b += 0.05;
          
          gl_FragColor = color;
        }
      `
    });
    
    this._amplitude = 0.01;
  }
  
  onPreRender() {
    this.set1f('uTime', this.game.loop.time / 1000);
    this.set1f('uAmplitude', this._amplitude);
  }
  
  setAmplitude(value) {
    this._amplitude = value;
  }
}

class ChromaticPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor(game) {
    super({
      game,
      name: 'ChromaticPipeline',
      fragShader: `
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
          float a = texture2D(uMainSampler, uv).a;
          
          gl_FragColor = vec4(r, g, b, a);
        }
      `
    });
    
    this._amount = 0.005;
  }
  
  onPreRender() {
    this.set1f('uAmount', this._amount);
  }
  
  setAmount(value) {
    this._amount = value;
  }
}

class CRTPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor(game) {
    super({
      game,
      name: 'CRTPipeline',
      fragShader: `
        precision mediump float;
        uniform sampler2D uMainSampler;
        uniform vec2 uResolution;
        uniform float uTime;
        varying vec2 outTexCoord;
        
        void main() {
          vec2 uv = outTexCoord;
          
          // Barrel distortion
          vec2 dc = abs(0.5 - uv);
          dc *= dc;
          uv.x -= 0.5; uv.x *= 1.0 + (dc.y * 0.1); uv.x += 0.5;
          uv.y -= 0.5; uv.y *= 1.0 + (dc.x * 0.1); uv.y += 0.5;
          
          // Get color with slight RGB shift
          vec4 color = texture2D(uMainSampler, uv);
          
          // Scanlines
          float scanline = sin(uv.y * uResolution.y * 1.5) * 0.04;
          color.rgb -= scanline;
          
          // Flicker
          float flicker = sin(uTime * 10.0) * 0.01;
          color.rgb += flicker;
          
          // Vignette
          float vignette = 1.0 - dot(uv - 0.5, uv - 0.5) * 0.5;
          color.rgb *= vignette;
          
          // Check bounds
          if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
            color = vec4(0.0, 0.0, 0.0, 1.0);
          }
          
          gl_FragColor = color;
        }
      `
    });
  }
  
  onPreRender() {
    this.set2f('uResolution', this.renderer.width, this.renderer.height);
    this.set1f('uTime', this.game.loop.time / 1000);
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
        uniform float uPixelSize;
        uniform vec2 uResolution;
        varying vec2 outTexCoord;
        
        void main() {
          vec2 pixelatedUV = floor(outTexCoord * uResolution / uPixelSize) * uPixelSize / uResolution;
          gl_FragColor = texture2D(uMainSampler, pixelatedUV);
        }
      `
    });
    
    this._pixelSize = 4.0;
  }
  
  onPreRender() {
    this.set1f('uPixelSize', this._pixelSize);
    this.set2f('uResolution', this.renderer.width, this.renderer.height);
  }
  
  setPixelSize(value) {
    this._pixelSize = value;
  }
}

class VHSPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor(game) {
    super({
      game,
      name: 'VHSPipeline',
      fragShader: `
        precision mediump float;
        uniform sampler2D uMainSampler;
        uniform float uTime;
        varying vec2 outTexCoord;
        
        float rand(vec2 co) {
          return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        void main() {
          vec2 uv = outTexCoord;
          
          // Tracking lines
          float trackingNoise = rand(vec2(uTime * 0.1, floor(uv.y * 20.0))) * 0.002;
          uv.x += trackingNoise;
          
          // Color bleeding / RGB shift
          float shift = 0.003 + sin(uTime) * 0.001;
          float r = texture2D(uMainSampler, uv + vec2(shift, 0.0)).r;
          float g = texture2D(uMainSampler, uv).g;
          float b = texture2D(uMainSampler, uv - vec2(shift, 0.0)).b;
          
          vec4 color = vec4(r, g, b, 1.0);
          
          // Static noise
          float noise = rand(uv + uTime) * 0.08;
          color.rgb += noise - 0.04;
          
          // Scan lines
          float scanline = sin(uv.y * 800.0) * 0.02;
          color.rgb -= scanline;
          
          // Occasional glitch bar
          if (mod(uTime, 3.0) < 0.1) {
            float glitchY = mod(uTime * 5.0, 1.0);
            if (abs(uv.y - glitchY) < 0.02) {
              uv.x += 0.1;
              color = texture2D(uMainSampler, uv);
            }
          }
          
          gl_FragColor = color;
        }
      `
    });
  }
  
  onPreRender() {
    this.set1f('uTime', this.game.loop.time / 1000);
  }
}

// ==========================================
// SCENE
// ==========================================

class ShaderEffectsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShaderEffectsScene' });
  }

  init() {
    this.currentEffect = 0;
    this.effects = ['none', 'glow', 'wave', 'chromatic', 'crt', 'pixelate', 'vhs'];
    this.effectNames = {
      'none': 'No Effect',
      'glow': '✨ Glow / Bloom',
      'wave': '🌊 Wave / Water',
      'chromatic': '🌈 Chromatic Aberration',
      'crt': '📺 CRT Monitor',
      'pixelate': '👾 Pixelate',
      'vhs': '📼 VHS Glitch'
    };
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // Register pipelines
    this.registerPipelines();
    
    this.cameras.main.setBackgroundColor('#0a0a0f');
    
    // Create demo content to apply effects to
    this.createDemoContent();
    
    // Title
    this.titleText = this.add.text(width / 2, 30, '🔮 No Effect', {
      fontFamily: 'Cormorant Garamond, Georgia, serif',
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Info
    this.add.text(width / 2, 70, 'WebGL Post-Processing Pipelines (GLSL Shaders)', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#8a879c'
    }).setOrigin(0.5);
    
    // Controls
    this.add.text(width / 2, height - 30, 'Arrow keys or click buttons to switch effects', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#8a879c'
    }).setOrigin(0.5);
    
    // Navigation
    this.createNavButtons();
    
    // Keyboard
    this.input.keyboard.on('keydown-LEFT', () => this.prevEffect());
    this.input.keyboard.on('keydown-RIGHT', () => this.nextEffect());
    
    // Back button
    this.createBackButton();
  }

  registerPipelines() {
    // Only register if renderer supports pipelines (WebGL)
    if (this.renderer.pipelines) {
      try {
        this.renderer.pipelines.addPostPipeline('GlowPipeline', GlowPipeline);
        this.renderer.pipelines.addPostPipeline('WavePipeline', WavePipeline);
        this.renderer.pipelines.addPostPipeline('ChromaticPipeline', ChromaticPipeline);
        this.renderer.pipelines.addPostPipeline('CRTPipeline', CRTPipeline);
        this.renderer.pipelines.addPostPipeline('PixelatePipeline', PixelatePipeline);
        this.renderer.pipelines.addPostPipeline('VHSPipeline', VHSPipeline);
      } catch (e) {
        console.warn('Could not register pipelines:', e);
      }
    }
  }

  createDemoContent() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Create a container with demo graphics
    this.demoContainer = this.add.container(0, 0);
    
    // Background gradient circles
    const bg = this.add.graphics();
    bg.fillStyle(0x7b5cff, 0.2);
    bg.fillCircle(centerX - 100, centerY, 150);
    bg.fillStyle(0x00f5d4, 0.2);
    bg.fillCircle(centerX + 100, centerY + 50, 120);
    bg.fillStyle(0xff6b6b, 0.15);
    bg.fillCircle(centerX, centerY - 80, 100);
    this.demoContainer.add(bg);
    
    // Animated shapes
    const shapes = [];
    
    // Central rotating square
    const square = this.add.graphics();
    square.fillStyle(0x7b5cff, 0.8);
    square.fillRect(-40, -40, 80, 80);
    square.x = centerX;
    square.y = centerY;
    shapes.push(square);
    this.demoContainer.add(square);
    
    this.tweens.add({
      targets: square,
      rotation: Math.PI * 2,
      duration: 4000,
      repeat: -1
    });
    
    // Orbiting circles
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const circle = this.add.graphics();
      circle.fillStyle([0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181, 0x00f5d4][i], 0.9);
      circle.fillCircle(0, 0, 20);
      circle.x = centerX + Math.cos(angle) * 120;
      circle.y = centerY + Math.sin(angle) * 120;
      shapes.push(circle);
      this.demoContainer.add(circle);
      
      this.tweens.add({
        targets: circle,
        x: centerX + Math.cos(angle + Math.PI * 2) * 120,
        y: centerY + Math.sin(angle + Math.PI * 2) * 120,
        duration: 5000,
        repeat: -1,
        ease: 'Linear',
        onUpdate: () => {
          const t = (this.time.now / 5000) + (i / 6);
          circle.x = centerX + Math.cos(t * Math.PI * 2) * 120;
          circle.y = centerY + Math.sin(t * Math.PI * 2) * 120;
        }
      });
    }
    
    // Pulsing center
    const pulse = this.add.graphics();
    pulse.fillStyle(0xffffff, 0.5);
    pulse.fillCircle(0, 0, 30);
    pulse.x = centerX;
    pulse.y = centerY;
    this.demoContainer.add(pulse);
    
    this.tweens.add({
      targets: pulse,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 1500,
      repeat: -1
    });
    
    // Demo text
    const demoText = this.add.text(centerX, centerY + 180, 'Shader Demo Content', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.demoContainer.add(demoText);
    
    this.tweens.add({
      targets: demoText,
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }

  applyEffect(effectName) {
    // Remove all current pipelines
    this.cameras.main.resetPostPipeline();
    
    // Apply new pipeline
    switch (effectName) {
      case 'glow':
        this.cameras.main.setPostPipeline('GlowPipeline');
        break;
      case 'wave':
        this.cameras.main.setPostPipeline('WavePipeline');
        break;
      case 'chromatic':
        this.cameras.main.setPostPipeline('ChromaticPipeline');
        break;
      case 'crt':
        this.cameras.main.setPostPipeline('CRTPipeline');
        break;
      case 'pixelate':
        this.cameras.main.setPostPipeline('PixelatePipeline');
        break;
      case 'vhs':
        this.cameras.main.setPostPipeline('VHSPipeline');
        break;
      default:
        // No effect
        break;
    }
    
    // Update title
    this.titleText.setText(`🔮 ${this.effectNames[effectName]}`);
  }

  prevEffect() {
    this.currentEffect = (this.currentEffect - 1 + this.effects.length) % this.effects.length;
    this.applyEffect(this.effects[this.currentEffect]);
  }

  nextEffect() {
    this.currentEffect = (this.currentEffect + 1) % this.effects.length;
    this.applyEffect(this.effects[this.currentEffect]);
  }

  createNavButtons() {
    const { width } = this.cameras.main;
    
    const prevBtn = this.add.text(50, 50, '◀ Prev', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#7b5cff'
    }).setInteractive({ useHandCursor: true });
    
    prevBtn.on('pointerover', () => prevBtn.setColor('#00f5d4'));
    prevBtn.on('pointerout', () => prevBtn.setColor('#7b5cff'));
    prevBtn.on('pointerup', () => this.prevEffect());
    
    const nextBtn = this.add.text(width - 50, 50, 'Next ▶', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#7b5cff'
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    
    nextBtn.on('pointerover', () => nextBtn.setColor('#00f5d4'));
    nextBtn.on('pointerout', () => nextBtn.setColor('#7b5cff'));
    nextBtn.on('pointerup', () => this.nextEffect());
  }

  createBackButton() {
    const { height } = this.cameras.main;
    
    const btn = this.add.text(20, height - 50, '← Back to Menu', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      color: '#7b5cff'
    }).setInteractive({ useHandCursor: true });
    
    btn.on('pointerover', () => btn.setColor('#00f5d4'));
    btn.on('pointerout', () => btn.setColor('#7b5cff'));
    btn.on('pointerup', () => {
      this.cameras.main.resetPostPipeline();
      this.scene.start('MenuScene');
    });
  }
}

