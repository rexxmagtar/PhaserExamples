/**
 * Bubble Pop Demo Scene
 * Click bubbles to pop them and score points!
 * Demonstrates: Input handling, spawning, tweens, particles
 */

class BubblePopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BubblePopScene' });
  }

  init() {
    this.score = 0;
    this.bubbles = [];
    this.colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181, 0x7b5cff, 0x00f5d4];
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // Background gradient
    this.cameras.main.setBackgroundColor('#0a0a0f');
    this.createBackground();
    
    // Create particle texture
    this.createParticleTexture();
    
    // Score display
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '28px',
      color: '#ffffff'
    });
    
    // Instructions
    this.add.text(width / 2, height - 30, 'Click the bubbles to pop them!', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      color: '#8a879c'
    }).setOrigin(0.5);
    
    // Spawn timer
    this.spawnTimer = this.time.addEvent({
      delay: 600,
      callback: this.spawnBubble,
      callbackScope: this,
      loop: true
    });
    
    // Spawn initial bubbles
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(i * 100, () => this.spawnBubble());
    }
    
    // Back button
    this.createBackButton();
  }

  createBackground() {
    const { width, height } = this.cameras.main;
    
    // Subtle gradient circles
    const graphics = this.add.graphics();
    graphics.fillStyle(0x7b5cff, 0.03);
    graphics.fillCircle(width * 0.2, height * 0.3, 200);
    graphics.fillStyle(0x00f5d4, 0.03);
    graphics.fillCircle(width * 0.8, height * 0.7, 250);
  }

  createParticleTexture() {
    // Create a simple circle texture for particles
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('particle', 16, 16);
    graphics.destroy();
  }

  spawnBubble() {
    const { width, height } = this.cameras.main;
    
    // Random properties
    const x = Phaser.Math.Between(50, width - 50);
    const size = Phaser.Math.Between(30, 70);
    const color = Phaser.Math.RND.pick(this.colors);
    
    // Create bubble using graphics
    const bubble = this.add.graphics();
    bubble.fillStyle(color, 0.7);
    bubble.fillCircle(0, 0, size);
    bubble.lineStyle(3, 0xffffff, 0.5);
    bubble.strokeCircle(0, 0, size);
    
    // Add shine effect
    bubble.fillStyle(0xffffff, 0.4);
    bubble.fillCircle(-size * 0.3, -size * 0.3, size * 0.2);
    
    // Position and setup
    bubble.x = x;
    bubble.y = height + size;
    bubble.setData('size', size);
    bubble.setData('color', color);
    
    // Make interactive
    bubble.setInteractive(
      new Phaser.Geom.Circle(0, 0, size),
      Phaser.Geom.Circle.Contains
    );
    bubble.input.cursor = 'pointer';
    
    // Click handler
    bubble.on('pointerdown', () => this.popBubble(bubble));
    
    // Hover effect
    bubble.on('pointerover', () => {
      this.tweens.add({
        targets: bubble,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100
      });
    });
    
    bubble.on('pointerout', () => {
      this.tweens.add({
        targets: bubble,
        scaleX: 1,
        scaleY: 1,
        duration: 100
      });
    });
    
    // Float up animation
    this.tweens.add({
      targets: bubble,
      y: -size,
      duration: Phaser.Math.Between(4000, 7000),
      ease: 'Linear',
      onComplete: () => {
        if (bubble.active) {
          bubble.destroy();
        }
      }
    });
    
    // Wobble animation
    this.tweens.add({
      targets: bubble,
      x: bubble.x + Phaser.Math.Between(-30, 30),
      duration: Phaser.Math.Between(1000, 2000),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Pulse animation
    this.tweens.add({
      targets: bubble,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: Phaser.Math.Between(500, 800),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    this.bubbles.push(bubble);
  }

  popBubble(bubble) {
    const size = bubble.getData('size');
    const color = bubble.getData('color');
    
    // Calculate score (smaller = more points)
    const points = Math.floor(100 - size);
    this.score += points;
    this.scoreText.setText(`Score: ${this.score}`);
    
    // Score popup
    const popup = this.add.text(bubble.x, bubble.y, `+${points}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '24px',
      color: '#' + color.toString(16).padStart(6, '0'),
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: popup,
      y: popup.y - 50,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => popup.destroy()
    });
    
    // Particle burst
    const particles = this.add.particles(bubble.x, bubble.y, 'particle', {
      speed: { min: 100, max: 250 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      tint: color,
      blendMode: 'ADD',
      quantity: 15,
      emitting: false
    });
    particles.explode();
    
    // Cleanup particles after burst
    this.time.delayedCall(700, () => particles.destroy());
    
    // Pop animation
    this.tweens.add({
      targets: bubble,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 150,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        const index = this.bubbles.indexOf(bubble);
        if (index > -1) this.bubbles.splice(index, 1);
        bubble.destroy();
      }
    });
    
    // Screen shake
    this.cameras.main.shake(100, 0.005);
    
    // Play sound if available
    // this.sound.play('pop');
  }

  createBackButton() {
    const btn = this.add.text(this.cameras.main.width - 20, 20, '← Back', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#7b5cff'
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    
    btn.on('pointerover', () => btn.setColor('#00f5d4'));
    btn.on('pointerout', () => btn.setColor('#7b5cff'));
    btn.on('pointerup', () => {
      this.spawnTimer.destroy();
      this.scene.start('MenuScene');
    });
  }

  update() {
    // Clean up destroyed bubbles
    this.bubbles = this.bubbles.filter(b => b.active);
  }
}

