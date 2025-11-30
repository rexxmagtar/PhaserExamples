/**
 * Particle Showcase Demo Scene
 * Demonstrates various particle effects: fire, explosions, rain, magic, smoke
 */

class ParticleShowcaseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ParticleShowcaseScene' });
  }

  init() {
    this.currentEffect = 0;
    this.effects = ['fire', 'explosion', 'rain', 'magic', 'smoke', 'confetti'];
    this.emitters = [];
  }

  create() {
    const { width, height } = this.cameras.main;
    
    this.cameras.main.setBackgroundColor('#0a0a0f');
    
    // Create particle textures
    this.createParticleTextures();
    
    // Title
    this.titleText = this.add.text(width / 2, 30, '🔥 Fire Effect', {
      fontFamily: 'Cormorant Garamond, Georgia, serif',
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Navigation buttons
    this.createNavButtons();
    
    // Instructions
    this.add.text(width / 2, height - 50, 'Click anywhere to spawn effect | Arrow keys or buttons to switch', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#8a879c'
    }).setOrigin(0.5);
    
    // Start with fire effect
    this.showEffect('fire');
    
    // Click to spawn
    this.input.on('pointerdown', (pointer) => {
      if (pointer.y > 80 && pointer.y < height - 80) {
        this.spawnEffectAt(pointer.x, pointer.y);
      }
    });
    
    // Keyboard navigation
    this.input.keyboard.on('keydown-LEFT', () => this.prevEffect());
    this.input.keyboard.on('keydown-RIGHT', () => this.nextEffect());
    
    // Back button
    this.createBackButton();
  }

  createParticleTextures() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Circle particle
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('particle-circle', 16, 16);
    graphics.clear();
    
    // Soft glow particle (fake gradient with multiple circles)
    for (let i = 16; i > 0; i--) {
      const alpha = (i / 16) * 0.5;
      graphics.fillStyle(0xffffff, alpha);
      graphics.fillCircle(16, 16, i);
    }
    graphics.generateTexture('particle-glow', 32, 32);
    graphics.clear();
    
    // Square particle
    graphics.fillStyle(0xffffff);
    graphics.fillRect(0, 0, 8, 8);
    graphics.generateTexture('particle-square', 8, 8);
    graphics.clear();
    
    // Raindrop
    graphics.fillStyle(0xffffff);
    graphics.fillRect(0, 0, 2, 10);
    graphics.generateTexture('particle-rain', 2, 10);
    graphics.clear();
    
    // Star shape (draw manually with polygon)
    graphics.fillStyle(0xffffff);
    const starPoints = [];
    const cx = 8, cy = 8;
    const outerRadius = 8, innerRadius = 4;
    const points = 5;
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI / points) - Math.PI / 2;
      starPoints.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius
      });
    }
    graphics.fillPoints(starPoints, true);
    graphics.generateTexture('particle-star', 16, 16);
    graphics.clear();
    
    graphics.destroy();
  }

  clearEmitters() {
    this.emitters.forEach(e => e.destroy());
    this.emitters = [];
  }

  showEffect(type) {
    this.clearEmitters();
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;
    
    switch (type) {
      case 'fire':
        this.titleText.setText('🔥 Fire Effect');
        this.createFire(centerX, height - 100);
        break;
      case 'explosion':
        this.titleText.setText('💥 Explosion Effect');
        this.createExplosionDemo(centerX, centerY);
        break;
      case 'rain':
        this.titleText.setText('🌧️ Rain Effect');
        this.createRain();
        break;
      case 'magic':
        this.titleText.setText('✨ Magic Sparkles');
        this.createMagic(centerX, centerY);
        break;
      case 'smoke':
        this.titleText.setText('💨 Smoke Effect');
        this.createSmoke(centerX, height - 80);
        break;
      case 'confetti':
        this.titleText.setText('🎉 Confetti Effect');
        this.createConfetti();
        break;
    }
  }

  createFire(x, y) {
    // Core fire
    const fire = this.add.particles(x, y, 'particle-glow', {
      speed: { min: 50, max: 120 },
      angle: { min: -100, max: -80 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: { min: 500, max: 1000 },
      frequency: 30,
      quantity: 2,
      blendMode: 'ADD',
      tint: [0xff4500, 0xff6600, 0xff8c00, 0xffff00]
    });
    this.emitters.push(fire);
    
    // Embers
    const embers = this.add.particles(x, y, 'particle-circle', {
      speed: { min: 80, max: 150 },
      angle: { min: -110, max: -70 },
      scale: { start: 0.2, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: { min: 800, max: 1500 },
      frequency: 100,
      quantity: 1,
      blendMode: 'ADD',
      tint: [0xff6600, 0xffff00]
    });
    this.emitters.push(embers);
  }

  createExplosionDemo(x, y) {
    // Create repeating explosions
    this.explosionTimer = this.time.addEvent({
      delay: 1500,
      callback: () => this.createExplosion(
        Phaser.Math.Between(150, this.cameras.main.width - 150),
        Phaser.Math.Between(150, this.cameras.main.height - 150)
      ),
      loop: true
    });
    
    // Initial explosion
    this.createExplosion(x, y);
  }

  createExplosion(x, y) {
    // Main burst
    const explosion = this.add.particles(x, y, 'particle-glow', {
      speed: { min: 150, max: 350 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      blendMode: 'ADD',
      tint: [0xff4500, 0xff6600, 0xffff00],
      quantity: 30,
      emitting: false
    });
    explosion.explode();
    this.time.delayedCall(700, () => explosion.destroy());
    
    // Smoke ring
    const smoke = this.add.particles(x, y, 'particle-circle', {
      speed: { min: 50, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 1.5 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 1000,
      tint: 0x444444,
      quantity: 15,
      emitting: false
    });
    smoke.explode();
    this.time.delayedCall(1100, () => smoke.destroy());
    
    // Screen shake
    this.cameras.main.shake(200, 0.01);
  }

  createRain() {
    const { width, height } = this.cameras.main;
    
    const rain = this.add.particles(0, 0, 'particle-rain', {
      x: { min: 0, max: width },
      y: -10,
      speedY: { min: 300, max: 500 },
      speedX: { min: -50, max: -30 },
      scale: { start: 1, end: 1 },
      alpha: { start: 0.6, end: 0.3 },
      lifespan: 2000,
      frequency: 20,
      quantity: 3,
      tint: 0x6699cc
    });
    this.emitters.push(rain);
    
    // Splash effect at bottom
    const splash = this.add.particles(0, height - 10, 'particle-circle', {
      x: { min: 0, max: width },
      speed: { min: 20, max: 50 },
      angle: { min: -150, max: -30 },
      scale: { start: 0.1, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 300,
      frequency: 50,
      quantity: 1,
      tint: 0x88aacc
    });
    this.emitters.push(splash);
  }

  createMagic(x, y) {
    // Orbiting sparkles
    const magic = this.add.particles(x, y, 'particle-star', {
      speed: { min: 30, max: 80 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: { min: 1000, max: 2000 },
      frequency: 50,
      quantity: 2,
      blendMode: 'ADD',
      tint: [0x00ffff, 0xff00ff, 0xffff00, 0x00ff00, 0xff6600]
    });
    this.emitters.push(magic);
    
    // Central glow
    const glow = this.add.particles(x, y, 'particle-glow', {
      speed: { min: 5, max: 20 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0.2 },
      alpha: { start: 0.5, end: 0 },
      lifespan: 1500,
      frequency: 200,
      quantity: 1,
      blendMode: 'ADD',
      tint: [0x7b5cff, 0x00f5d4]
    });
    this.emitters.push(glow);
    
    // Animate magic position
    this.tweens.add({
      targets: [magic, glow],
      x: { value: '+=100', duration: 2000, yoyo: true, repeat: -1 },
      y: { value: '-=50', duration: 1500, yoyo: true, repeat: -1 },
      ease: 'Sine.easeInOut'
    });
  }

  createSmoke(x, y) {
    const smoke = this.add.particles(x, y, 'particle-glow', {
      speed: { min: 20, max: 60 },
      angle: { min: -100, max: -80 },
      scale: { start: 0.3, end: 1.5 },
      alpha: { start: 0.5, end: 0 },
      lifespan: { min: 2000, max: 4000 },
      frequency: 100,
      quantity: 1,
      tint: [0x555555, 0x666666, 0x777777]
    });
    this.emitters.push(smoke);
  }

  createConfetti() {
    const { width } = this.cameras.main;
    
    const confetti = this.add.particles(0, -20, 'particle-square', {
      x: { min: 0, max: width },
      speedY: { min: 100, max: 200 },
      speedX: { min: -50, max: 50 },
      rotate: { min: 0, max: 360 },
      scale: { min: 0.5, max: 1 },
      alpha: { start: 1, end: 0.8 },
      lifespan: 4000,
      frequency: 50,
      quantity: 2,
      tint: [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181, 0x7b5cff, 0x00f5d4]
    });
    this.emitters.push(confetti);
  }

  spawnEffectAt(x, y) {
    const type = this.effects[this.currentEffect];
    
    if (type === 'explosion') {
      this.createExplosion(x, y);
    } else if (type === 'magic') {
      // Burst of magic
      const burst = this.add.particles(x, y, 'particle-star', {
        speed: { min: 100, max: 200 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.6, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 800,
        blendMode: 'ADD',
        tint: [0x00ffff, 0xff00ff, 0xffff00],
        quantity: 20,
        emitting: false
      });
      burst.explode();
      this.time.delayedCall(900, () => burst.destroy());
    }
  }

  prevEffect() {
    if (this.explosionTimer) this.explosionTimer.destroy();
    this.currentEffect = (this.currentEffect - 1 + this.effects.length) % this.effects.length;
    this.showEffect(this.effects[this.currentEffect]);
  }

  nextEffect() {
    if (this.explosionTimer) this.explosionTimer.destroy();
    this.currentEffect = (this.currentEffect + 1) % this.effects.length;
    this.showEffect(this.effects[this.currentEffect]);
  }

  createNavButtons() {
    const { width } = this.cameras.main;
    
    // Previous
    const prevBtn = this.add.text(50, 30, '◀ Prev', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#7b5cff'
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    
    prevBtn.on('pointerover', () => prevBtn.setColor('#00f5d4'));
    prevBtn.on('pointerout', () => prevBtn.setColor('#7b5cff'));
    prevBtn.on('pointerup', () => this.prevEffect());
    
    // Next
    const nextBtn = this.add.text(width - 50, 30, 'Next ▶', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#7b5cff'
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
    
    nextBtn.on('pointerover', () => nextBtn.setColor('#00f5d4'));
    nextBtn.on('pointerout', () => nextBtn.setColor('#7b5cff'));
    nextBtn.on('pointerup', () => this.nextEffect());
  }

  createBackButton() {
    const btn = this.add.text(this.cameras.main.width - 20, this.cameras.main.height - 20, '← Back to Menu', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      color: '#7b5cff'
    }).setOrigin(1, 1).setInteractive({ useHandCursor: true });
    
    btn.on('pointerover', () => btn.setColor('#00f5d4'));
    btn.on('pointerout', () => btn.setColor('#7b5cff'));
    btn.on('pointerup', () => {
      this.clearEmitters();
      if (this.explosionTimer) this.explosionTimer.destroy();
      this.scene.start('MenuScene');
    });
  }
}

