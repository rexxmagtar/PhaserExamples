/**
 * Menu Scene - Demo Hub
 * Navigate to various Phaser feature demonstrations
 */

class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: GameConfig.scenes.MENU });
  }

  create() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    
    // Background
    this.cameras.main.setBackgroundColor('#0a0a0f');
    this.createBackground();
    
    // Title
    const title = this.add.text(centerX, 60, '🎮 Phaser Sandbox', {
      fontFamily: 'Cormorant Garamond, Georgia, serif',
      fontSize: '56px',
      color: '#ffffff',
      resolution: 2  // Render text at 2x for crispness
    }).setOrigin(0.5);
    
    // Subtitle
    this.add.text(centerX, 110, 'Explore Phaser.js capabilities', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '20px',
      color: '#8a879c',
      resolution: 2
    }).setOrigin(0.5);
    
    // Demo buttons
    const demos = [
      { 
        key: 'BubblePopScene', 
        icon: '🫧', 
        title: 'Bubble Pop', 
        desc: 'Input, tweens, particles',
        color: 0x4ecdc4
      },
      { 
        key: 'ParticleShowcaseScene', 
        icon: '✨', 
        title: 'Particles', 
        desc: 'Fire, explosions, effects',
        color: 0xff6b6b
      },
      { 
        key: 'Cube3DScene', 
        icon: '🎲', 
        title: '3D Cube', 
        desc: 'Fake 3D projection',
        color: 0x7b5cff
      },
      { 
        key: 'UIComponentsScene', 
        icon: '🎛️', 
        title: 'UI Components', 
        desc: 'Buttons, sliders, toggles',
        color: 0xffe66d
      },
      { 
        key: 'ScrollListScene', 
        icon: '📜', 
        title: 'Scroll List', 
        desc: 'Masking, momentum scroll',
        color: 0x95e1d3
      },
      { 
        key: 'ShaderEffectsScene', 
        icon: '🔮', 
        title: 'Shaders', 
        desc: 'WebGL post-processing',
        color: 0xf38181
      },
      { 
        key: 'FireDemoScene', 
        icon: '🔥', 
        title: 'Fire Effect', 
        desc: 'Particles + shader combo',
        color: 0xff6600
      },
      { 
        key: 'ImageGalleryScene', 
        icon: '🖼️', 
        title: 'Image Gallery', 
        desc: 'Virtual scroll, lazy load',
        color: 0x00aaff
      }
    ];
    
    // Create grid of demo cards (4 columns for 8 demos)
    const cols = 4;
    const cardWidth = 240;
    const cardHeight = 130;
    const gapX = 25;
    const gapY = 25;
    const startX = centerX - ((cols - 1) * (cardWidth + gapX)) / 2;
    const startY = 160;
    
    demos.forEach((demo, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardWidth + gapX);
      const y = startY + row * (cardHeight + gapY);
      
      this.createDemoCard(x, y, cardWidth, cardHeight, demo, index);
    });
    
    // Footer
    this.add.text(centerX, height - 50, 'Click a demo to explore | Check /docs for documentation', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#5a5870',
      resolution: 2
    }).setOrigin(0.5);
    
    this.add.text(centerX, height - 20, 'Built with Phaser 3 🎮', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      color: '#3a3850',
      resolution: 2
    }).setOrigin(0.5);
    
    // Fade in
    this.cameras.main.fadeIn(300);
  }

  createBackground() {
    const { width, height } = this.cameras.main;
    
    // Gradient orbs
    const graphics = this.add.graphics();
    graphics.fillStyle(0x7b5cff, 0.05);
    graphics.fillCircle(width * 0.2, height * 0.3, 200);
    graphics.fillStyle(0x00f5d4, 0.05);
    graphics.fillCircle(width * 0.8, height * 0.7, 250);
    graphics.fillStyle(0xff6b6b, 0.03);
    graphics.fillCircle(width * 0.5, height * 0.2, 150);
    
    // Animated particles in background
    this.createBackgroundParticles();
  }

  createBackgroundParticles() {
    // Create particle texture
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('menu-particle', 8, 8);
    graphics.destroy();
    
    // Floating particles
    const { width, height } = this.cameras.main;
    const particles = this.add.particles(0, 0, 'menu-particle', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      speed: { min: 10, max: 30 },
      angle: { min: -180, max: 180 },
      scale: { min: 0.1, max: 0.3 },
      alpha: { min: 0.1, max: 0.3 },
      lifespan: 6000,
      frequency: 500,
      quantity: 1,
      blendMode: 'ADD'
    });
    
    // Send to back
    particles.setDepth(-1);
  }

  createDemoCard(x, y, width, height, demo, index) {
    const container = this.add.container(x, y);
    
    // Card background
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a25, 0.9);
    bg.fillRoundedRect(-width/2, -height/2, width, height, 12);
    
    // Accent line
    const accent = this.add.graphics();
    accent.fillStyle(demo.color, 1);
    accent.fillRect(-width/2, -height/2, width, 4);
    
    // Glow effect (hidden initially)
    const glow = this.add.graphics();
    glow.fillStyle(demo.color, 0.1);
    glow.fillRoundedRect(-width/2 - 5, -height/2 - 5, width + 10, height + 10, 14);
    glow.alpha = 0;
    
    // Icon
    const icon = this.add.text(0, -28, demo.icon, {
      fontSize: '40px'
    }).setOrigin(0.5);
    
    // Title
    const title = this.add.text(0, 18, demo.title, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#e8e6f0',
      resolution: 2  // 2x resolution for crisp text
    }).setOrigin(0.5);
    
    // Description
    const desc = this.add.text(0, 42, demo.desc, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#8a879c',
      resolution: 2
    }).setOrigin(0.5);
    
    container.add([glow, bg, accent, icon, title, desc]);
    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });
    
    // Initial animation
    container.alpha = 0;
    container.y = y + 30;
    
    this.tweens.add({
      targets: container,
      alpha: 1,
      y: y,
      duration: 400,
      delay: index * 80,
      ease: 'Back.easeOut'
    });
    
    // Hover effects
    container.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150
      });
      
      this.tweens.add({
        targets: glow,
        alpha: 1,
        duration: 150
      });
      
      bg.clear();
      bg.fillStyle(0x252530, 0.95);
      bg.fillRoundedRect(-width/2, -height/2, width, height, 12);
    });
    
    container.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 150
      });
      
      this.tweens.add({
        targets: glow,
        alpha: 0,
        duration: 150
      });
      
      bg.clear();
      bg.fillStyle(0x1a1a25, 0.9);
      bg.fillRoundedRect(-width/2, -height/2, width, height, 12);
    });
    
    container.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50
      });
    });
    
    container.on('pointerup', () => {
      // Flash effect
      this.cameras.main.flash(150, 
        (demo.color >> 16) & 0xff,
        (demo.color >> 8) & 0xff,
        demo.color & 0xff
      );
      
      // Transition to scene
      this.cameras.main.fadeOut(200);
      this.time.delayedCall(200, () => {
        this.scene.start(demo.key);
      });
    });
    
    return container;
  }
}
