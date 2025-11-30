/**
 * Fire Demo Scene
 * Demonstrates realistic fire using particles + shaders
 * With runtime parameter controls
 */

// ==========================================
// FIRE SHADER - Heat distortion + Glow
// ==========================================

class FireGlowPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor(game) {
    super({
      game,
      name: 'FireGlowPipeline',
      fragShader: `
        precision mediump float;
        
        uniform sampler2D uMainSampler;
        uniform float uTime;
        uniform float uIntensity;
        uniform vec2 uResolution;
        
        varying vec2 outTexCoord;
        
        void main() {
          vec2 uv = outTexCoord;
          
          // Heat distortion - wave effect rising up
          float distortionStrength = 0.003 * uIntensity;
          float speed = 3.0;
          float frequency = 15.0;
          
          // Only distort upper part of screen (where heat rises)
          float heightFactor = 1.0 - uv.y;
          
          // Distortion waves
          uv.x += sin(uv.y * frequency + uTime * speed) * distortionStrength * heightFactor;
          uv.x += sin(uv.y * frequency * 0.5 + uTime * speed * 1.3) * distortionStrength * 0.5 * heightFactor;
          
          // Get base color
          vec4 color = texture2D(uMainSampler, uv);
          
          // Glow effect - sample nearby pixels
          float glowSize = 0.004;
          vec4 glow = vec4(0.0);
          
          for (float x = -2.0; x <= 2.0; x++) {
            for (float y = -2.0; y <= 2.0; y++) {
              glow += texture2D(uMainSampler, uv + vec2(x, y) * glowSize);
            }
          }
          glow /= 25.0;
          
          // Add glow (emphasize warm colors)
          vec4 warmGlow = glow * vec4(1.2, 0.8, 0.4, 1.0);
          color += warmGlow * uIntensity * 0.5;
          
          // Slight vignette for atmosphere
          float vignette = 1.0 - length(uv - 0.5) * 0.3;
          color.rgb *= vignette;
          
          gl_FragColor = color;
        }
      `
    });
    
    this._intensity = 1.0;
  }
  
  onPreRender() {
    this.set1f('uTime', this.game.loop.time / 1000);
    this.set1f('uIntensity', this._intensity);
    this.set2f('uResolution', this.renderer.width, this.renderer.height);
  }
  
  setIntensity(value) {
    this._intensity = value;
  }
}

// ==========================================
// FIRE DEMO SCENE
// ==========================================

class FireDemoScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FireDemoScene' });
  }

  init() {
    // Fire parameters (editable at runtime)
    this.fireParams = {
      // Size
      scale: 1.0,
      
      // Speed
      speedMin: 100,
      speedMax: 250,
      
      // Lifespan
      lifespanMin: 200,
      lifespanMax: 500,
      
      // Colors (as hex numbers)
      coreColors: [0xffffff, 0xffffcc, 0xffff88],   // White/light yellow core
      mainColors: [0xffcc00, 0xff9900, 0xff6600],   // Yellow to orange
      outerColors: [0xff4400, 0xff2200, 0xcc0000],  // Orange to red
      
      // Emission rate
      frequency: 10,
      quantity: 4,
      
      // Shader
      shaderIntensity: 0.8
    };
  }

  create() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;
    
    this.cameras.main.setBackgroundColor('#0a0a0f');
    
    // Register shader
    if (this.renderer.pipelines) {
      this.renderer.pipelines.addPostPipeline('FireGlowPipeline', FireGlowPipeline);
    }
    
    // Create particle textures
    this.createFireTextures();
    
    // Title
    this.add.text(centerX, 30, '🔥 Fire Shader + Particles Demo', {
      fontFamily: 'Cormorant Garamond, Georgia, serif',
      fontSize: '32px',
      color: '#ffffff',
      resolution: 2
    }).setOrigin(0.5);
    
    // Create main fire in CENTER
    this.fireX = centerX;
    this.fireY = centerY + 150;
    this.createFire(this.fireX, this.fireY);
    
    // Apply fire shader
    this.applyFireShader();
    
    // Create control panel
    this.createControlPanel();
    
    // Back button
    this.createBackButton();
  }

  createFireTextures() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Fire particle - SMALL and soft (key to realistic fire!)
    const size = 16;
    for (let i = size; i > 0; i--) {
      const alpha = Math.pow(i / size, 2) * 0.8;  // Quadratic falloff
      graphics.fillStyle(0xffffff, alpha);
      graphics.fillCircle(size, size, i);
    }
    graphics.generateTexture('fire-particle', size * 2, size * 2);
    graphics.clear();
    
    // Ember particle - tiny dot
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(2, 2, 2);
    graphics.generateTexture('ember-particle', 4, 4);
    graphics.clear();
    
    // Smoke particle - very soft
    for (let i = 24; i > 0; i--) {
      const alpha = Math.pow(i / 24, 3) * 0.15;
      graphics.fillStyle(0xffffff, alpha);
      graphics.fillCircle(24, 24, i);
    }
    graphics.generateTexture('smoke-particle', 48, 48);
    
    graphics.destroy();
  }

  createFire(x, y) {
    const p = this.fireParams;
    const scale = p.scale;
    
    // ============================================
    // KEY TO REALISTIC FIRE:
    // - MANY small particles (not few big ones)
    // - Fast emission rate
    // - Short lifespan
    // - Narrow emission angle
    // - Particles overlap and blend
    // ============================================
    
    // LAYER 1: Inner core (white/yellow, fastest, brightest)
    this.coreFlames = this.add.particles(x, y, 'fire-particle', {
      speed: { min: 150, max: 300 },
      angle: { min: -95, max: -85 },            // Very narrow - straight up
      scale: { start: 1.2 * scale, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: { min: 200, max: 400 },         // SHORT life = tight flame
      frequency: 10,                             // FAST emission
      quantity: 3,
      blendMode: 'ADD',
      tint: p.coreColors,
      emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 0, 15 * scale) }
    });
    
    // LAYER 2: Main flames (orange, medium speed)
    this.mainFlames = this.add.particles(x, y, 'fire-particle', {
      speed: { min: 100, max: 250 },
      angle: { min: -105, max: -75 },           // Slightly wider
      scale: { start: 1.5 * scale, end: 0.1 },
      alpha: { start: 0.9, end: 0 },
      lifespan: { min: 300, max: 600 },
      frequency: 8,
      quantity: 4,
      blendMode: 'ADD',
      tint: p.mainColors,
      emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 0, 25 * scale) }
    });
    
    // LAYER 3: Outer flames (red/dark orange, slower, wider)
    this.outerFlames = this.add.particles(x, y, 'fire-particle', {
      speed: { min: 60, max: 180 },
      angle: { min: -115, max: -65 },           // Wider spread
      scale: { start: 2.0 * scale, end: 0.3 },
      alpha: { start: 0.7, end: 0 },
      lifespan: { min: 400, max: 800 },
      frequency: 12,
      quantity: 3,
      blendMode: 'ADD',
      tint: p.outerColors,
      emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 0, 35 * scale) }
    });
    
    // LAYER 4: Flickering tips (random licks of flame)
    this.flickerFlames = this.add.particles(x, y, 'fire-particle', {
      speed: { min: 200, max: 400 },
      angle: { min: -110, max: -70 },
      scale: { start: 0.8 * scale, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: { min: 150, max: 350 },
      frequency: 30,
      quantity: 1,
      blendMode: 'ADD',
      tint: [0xffff00, 0xff8800, 0xff4400],
      // Random horizontal acceleration for flicker
      accelerationX: { min: -200, max: 200 }
    });
    
    // LAYER 5: Embers (tiny sparks)
    this.embers = this.add.particles(x, y - 20, 'ember-particle', {
      speed: { min: 80, max: 200 },
      angle: { min: -140, max: -40 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: { min: 800, max: 2000 },
      frequency: 50,
      quantity: 1,
      blendMode: 'ADD',
      tint: [0xff6600, 0xffaa00, 0xff4400],
      accelerationX: { min: -50, max: 50 },
      accelerationY: { min: -100, max: -50 }
    });
    
    // LAYER 6: Smoke (rises slowly)
    this.smoke = this.add.particles(x, y - 60 * scale, 'smoke-particle', {
      speed: { min: 20, max: 50 },
      angle: { min: -100, max: -80 },
      scale: { start: 0.5 * scale, end: 3.0 * scale },
      alpha: { start: 0.15, end: 0 },
      lifespan: { min: 2000, max: 4000 },
      frequency: 150,
      quantity: 1,
      tint: [0x222222, 0x333333, 0x444444],
      emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 0, 20 * scale) }
    });
    
    // Base glow (stationary glow at fire base)
    this.baseGlow = this.add.particles(x, y + 10, 'fire-particle', {
      speed: 0,
      scale: { start: 3 * scale, end: 3 * scale },
      alpha: { start: 0.3, end: 0.3 },
      lifespan: 100,
      frequency: 50,
      quantity: 1,
      blendMode: 'ADD',
      tint: 0xff4400
    });
  }

  updateFire() {
    const p = this.fireParams;
    const scale = p.scale;
    const x = this.fireX;
    const y = this.fireY;
    
    // Recreate emit zones with new scale
    const coreZone = { type: 'random', source: new Phaser.Geom.Circle(0, 0, 15 * scale) };
    const mainZone = { type: 'random', source: new Phaser.Geom.Circle(0, 0, 25 * scale) };
    const outerZone = { type: 'random', source: new Phaser.Geom.Circle(0, 0, 35 * scale) };
    
    // Update core flames
    this.coreFlames.setConfig({
      speed: { min: p.speedMin * 1.5, max: p.speedMax * 1.2 },
      scale: { start: 1.2 * scale, end: 0 },
      lifespan: { min: p.lifespanMin, max: p.lifespanMax * 0.8 },
      frequency: p.frequency,
      quantity: p.quantity,
      tint: p.coreColors,
      emitZone: coreZone
    });
    
    // Update main flames
    this.mainFlames.setConfig({
      speed: { min: p.speedMin, max: p.speedMax },
      scale: { start: 1.5 * scale, end: 0.1 },
      lifespan: { min: p.lifespanMin * 1.2, max: p.lifespanMax * 1.2 },
      frequency: p.frequency * 0.8,
      quantity: p.quantity + 1,
      tint: p.mainColors,
      emitZone: mainZone
    });
    
    // Update outer flames
    this.outerFlames.setConfig({
      speed: { min: p.speedMin * 0.6, max: p.speedMax * 0.7 },
      scale: { start: 2.0 * scale, end: 0.3 },
      lifespan: { min: p.lifespanMin * 1.5, max: p.lifespanMax * 1.6 },
      frequency: p.frequency * 1.2,
      quantity: p.quantity,
      tint: p.outerColors,
      emitZone: outerZone
    });
    
    // Update positions
    this.smoke.setPosition(x, y - 60 * scale);
    this.baseGlow.setConfig({
      scale: { start: 3 * scale, end: 3 * scale }
    });
  }

  applyFireShader() {
    if (this.renderer.pipelines) {
      this.cameras.main.setPostPipeline('FireGlowPipeline');
      this.firePipeline = this.cameras.main.getPostPipeline('FireGlowPipeline');
    }
  }

  createControlPanel() {
    const { width, height } = this.cameras.main;
    const panelX = 50;
    const panelY = 100;
    const panelWidth = 280;
    const panelHeight = 450;
    
    // Panel background
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a25, 0.9);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 12);
    panel.lineStyle(2, 0xff6600, 0.5);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 12);
    
    // Panel title
    this.add.text(panelX + panelWidth / 2, panelY + 20, '⚙️ Fire Controls', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      resolution: 2
    }).setOrigin(0.5);
    
    let yPos = panelY + 55;
    const sliderWidth = 200;
    
    // SIZE slider
    yPos = this.createSliderControl(panelX + 20, yPos, 'Size', 0.5, 3.0, this.fireParams.scale, (val) => {
      this.fireParams.scale = val;
      this.updateFire();
    });
    
    // SPEED slider
    yPos = this.createSliderControl(panelX + 20, yPos, 'Speed', 50, 400, this.fireParams.speedMax, (val) => {
      this.fireParams.speedMin = val * 0.5;
      this.fireParams.speedMax = val;
      this.updateFire();
    });
    
    // LIFESPAN slider
    yPos = this.createSliderControl(panelX + 20, yPos, 'Lifespan', 300, 2000, this.fireParams.lifespanMax, (val) => {
      this.fireParams.lifespanMin = val * 0.5;
      this.fireParams.lifespanMax = val;
      this.updateFire();
    });
    
    // EMISSION RATE slider
    yPos = this.createSliderControl(panelX + 20, yPos, 'Emission', 10, 80, this.fireParams.frequency, (val) => {
      this.fireParams.frequency = val;
      this.updateFire();
    });
    
    // SHADER INTENSITY slider
    yPos = this.createSliderControl(panelX + 20, yPos, 'Shader FX', 0, 2, this.fireParams.shaderIntensity, (val) => {
      this.fireParams.shaderIntensity = val;
      if (this.firePipeline) {
        this.firePipeline.setIntensity(val);
      }
    });
    
    // COLOR PRESETS
    yPos += 10;
    this.add.text(panelX + 20, yPos, 'Color Presets:', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#8a879c',
      resolution: 2
    });
    yPos += 25;
    
    // Color preset buttons
    const presets = [
      { name: '🔥', core: [0xffff00, 0xffcc00], main: [0xff6600, 0xff4400], outer: [0xff3300, 0xff0000] },
      { name: '💙', core: [0x00ffff, 0x88ffff], main: [0x0088ff, 0x0066cc], outer: [0x0044aa, 0x003388] },
      { name: '💚', core: [0x88ff88, 0xaaffaa], main: [0x00ff00, 0x00cc00], outer: [0x008800, 0x006600] },
      { name: '💜', core: [0xff88ff, 0xffaaff], main: [0xff00ff, 0xcc00cc], outer: [0x880088, 0x660066] },
      { name: '🤍', core: [0xffffff, 0xeeeeff], main: [0xccccff, 0xaaaaee], outer: [0x8888cc, 0x6666aa] }
    ];
    
    presets.forEach((preset, i) => {
      const btn = this.add.text(panelX + 30 + i * 48, yPos, preset.name, {
        fontSize: '28px'
      }).setInteractive({ useHandCursor: true });
      
      btn.on('pointerup', () => {
        this.fireParams.coreColors = preset.core;
        this.fireParams.mainColors = preset.main;
        this.fireParams.outerColors = preset.outer;
        this.updateFire();
      });
      
      btn.on('pointerover', () => btn.setScale(1.2));
      btn.on('pointerout', () => btn.setScale(1));
    });
    
    // Shader toggle
    yPos += 50;
    let shaderEnabled = true;
    const toggleBtn = this.add.text(panelX + panelWidth / 2, yPos, '✓ Shader ON', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      color: '#00ff88',
      resolution: 2
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    toggleBtn.on('pointerup', () => {
      shaderEnabled = !shaderEnabled;
      if (shaderEnabled) {
        this.cameras.main.setPostPipeline('FireGlowPipeline');
        this.firePipeline = this.cameras.main.getPostPipeline('FireGlowPipeline');
        this.firePipeline.setIntensity(this.fireParams.shaderIntensity);
        toggleBtn.setText('✓ Shader ON').setColor('#00ff88');
      } else {
        this.cameras.main.resetPostPipeline();
        toggleBtn.setText('✗ Shader OFF').setColor('#ff6666');
      }
    });
  }

  createSliderControl(x, y, label, min, max, initialValue, onChange) {
    const sliderWidth = 200;
    
    // Label
    this.add.text(x, y, label, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#8a879c',
      resolution: 2
    });
    
    // Value display
    const valueText = this.add.text(x + sliderWidth + 20, y, initialValue.toFixed(1), {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#ff6600',
      resolution: 2
    });
    
    y += 22;
    
    // Track
    const track = this.add.graphics();
    track.fillStyle(0x333344, 1);
    track.fillRoundedRect(x, y, sliderWidth, 8, 4);
    
    // Fill
    const initialPercent = (initialValue - min) / (max - min);
    const fill = this.add.graphics();
    fill.fillStyle(0xff6600, 1);
    fill.fillRoundedRect(x, y, sliderWidth * initialPercent, 8, 4);
    
    // Handle
    const handle = this.add.circle(x + sliderWidth * initialPercent, y + 4, 10, 0xff6600);
    handle.setStrokeStyle(2, 0xffffff);
    handle.setInteractive({ useHandCursor: true, draggable: true });
    
    handle.on('drag', (pointer, dragX) => {
      const clampedX = Phaser.Math.Clamp(dragX, x, x + sliderWidth);
      handle.x = clampedX;
      
      const percent = (clampedX - x) / sliderWidth;
      const value = min + (max - min) * percent;
      
      fill.clear();
      fill.fillStyle(0xff6600, 1);
      fill.fillRoundedRect(x, y, sliderWidth * percent, 8, 4);
      
      valueText.setText(value.toFixed(1));
      onChange(value);
    });
    
    return y + 35;
  }

  createBackButton() {
    const btn = this.add.text(30, 30, '← Back', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '20px',
      color: '#ff6600',
      resolution: 2
    }).setInteractive({ useHandCursor: true });
    
    btn.on('pointerover', () => btn.setColor('#ffaa00'));
    btn.on('pointerout', () => btn.setColor('#ff6600'));
    btn.on('pointerup', () => {
      this.cameras.main.resetPostPipeline();
      this.scene.start('MenuScene');
    });
  }
}
