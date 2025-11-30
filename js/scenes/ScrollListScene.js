/**
 * Scroll List Demo Scene
 * Demonstrates scrollable content with masking, momentum, and animations
 */

class ScrollListScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ScrollListScene' });
  }

  init() {
    this.scrollY = 0;
    this.velocity = 0;
    this.isDragging = false;
    this.items = [];
  }

  create() {
    const { width, height } = this.cameras.main;
    
    this.cameras.main.setBackgroundColor('#0a0a0f');
    
    // Title
    this.add.text(width / 2, 30, '📜 Scroll List Demo', {
      fontFamily: 'Cormorant Garamond, Georgia, serif',
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Instructions
    this.add.text(width / 2, height - 30, 'Mouse wheel or drag to scroll | Click items to select', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#8a879c'
    }).setOrigin(0.5);
    
    // Create scrollable area
    this.viewportX = 100;
    this.viewportY = 80;
    this.viewportWidth = width - 200;
    this.viewportHeight = height - 160;
    this.itemHeight = 80;
    this.itemPadding = 10;
    this.itemCount = 20;
    this.contentHeight = this.itemCount * (this.itemHeight + this.itemPadding);
    
    // Viewport border
    const border = this.add.graphics();
    border.lineStyle(2, 0x7b5cff, 0.5);
    border.strokeRect(this.viewportX, this.viewportY, this.viewportWidth, this.viewportHeight);
    
    // Create mask
    const maskShape = this.add.graphics();
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(this.viewportX, this.viewportY, this.viewportWidth, this.viewportHeight);
    const mask = maskShape.createGeometryMask();
    
    // Scroll container
    this.scrollContainer = this.add.container(this.viewportX, this.viewportY);
    this.scrollContainer.setMask(mask);
    
    // Create list items
    this.createListItems();
    
    // Create scrollbar
    this.createScrollbar();
    
    // Setup input
    this.setupScrollInput();
    
    // Animate items in
    this.animateItemsIn();
    
    // Back button
    this.createBackButton();
  }

  createListItems() {
    const colors = [0x7b5cff, 0x00f5d4, 0xff6b6b, 0xffe66d, 0x95e1d3];
    const icons = ['🎮', '🎨', '🎵', '📚', '⚡', '🌟', '🔥', '💎', '🎯', '🚀'];
    
    for (let i = 0; i < this.itemCount; i++) {
      const y = i * (this.itemHeight + this.itemPadding);
      const color = colors[i % colors.length];
      const icon = icons[i % icons.length];
      
      const item = this.createListItem(
        0, y, 
        this.viewportWidth - 30, 
        this.itemHeight, 
        `Item ${i + 1}`,
        `This is the description for item ${i + 1}`,
        icon,
        color,
        i
      );
      
      this.scrollContainer.add(item);
      this.items.push(item);
    }
  }

  createListItem(x, y, width, height, title, description, icon, accentColor, index) {
    const container = this.add.container(x, y);
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a25, 1);
    bg.fillRoundedRect(0, 0, width, height, 8);
    
    // Accent bar
    const accent = this.add.graphics();
    accent.fillStyle(accentColor, 1);
    accent.fillRoundedRect(0, 0, 4, height, { tl: 8, bl: 8, tr: 0, br: 0 });
    
    // Icon
    const iconText = this.add.text(30, height / 2, icon, {
      fontSize: '28px'
    }).setOrigin(0.5);
    
    // Title
    const titleText = this.add.text(60, height / 2 - 12, title, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#e8e6f0'
    });
    
    // Description
    const descText = this.add.text(60, height / 2 + 10, description, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#8a879c'
    });
    
    // Badge
    const badge = this.add.text(width - 20, height / 2, `#${index + 1}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#5a5870'
    }).setOrigin(1, 0.5);
    
    container.add([bg, accent, iconText, titleText, descText, badge]);
    container.setSize(width, height);
    container.setData('index', index);
    
    // Make interactive
    const hitArea = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);
    
    hitArea.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x252530, 1);
      bg.fillRoundedRect(0, 0, width, height, 8);
      
      this.tweens.add({
        targets: container,
        x: 10,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });
    
    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x1a1a25, 1);
      bg.fillRoundedRect(0, 0, width, height, 8);
      
      this.tweens.add({
        targets: container,
        x: 0,
        duration: 150
      });
    });
    
    hitArea.on('pointerup', () => {
      // Flash effect
      this.cameras.main.flash(100, 123, 92, 255, false);
      
      // Pulse animation
      this.tweens.add({
        targets: container,
        scaleX: 1.02,
        scaleY: 1.02,
        duration: 100,
        yoyo: true
      });
      
      console.log(`Selected: ${title}`);
    });
    
    // Initial state for animation
    container.alpha = 0;
    container.x = 50;
    
    return container;
  }

  animateItemsIn() {
    this.items.forEach((item, index) => {
      this.tweens.add({
        targets: item,
        alpha: 1,
        x: 0,
        duration: 400,
        delay: index * 50,
        ease: 'Back.easeOut'
      });
    });
  }

  createScrollbar() {
    const x = this.viewportX + this.viewportWidth - 15;
    const y = this.viewportY;
    const height = this.viewportHeight;
    
    // Track
    const track = this.add.graphics();
    track.fillStyle(0x333344, 0.5);
    track.fillRoundedRect(x, y, 8, height, 4);
    
    // Thumb
    const thumbHeight = Math.max(30, (this.viewportHeight / this.contentHeight) * height);
    this.scrollThumb = this.add.graphics();
    this.scrollThumb.fillStyle(0x7b5cff, 0.8);
    this.scrollThumb.fillRoundedRect(0, 0, 8, thumbHeight, 4);
    this.scrollThumb.x = x;
    this.scrollThumb.y = y;
    this.scrollThumbHeight = thumbHeight;
    this.scrollTrackHeight = height;
  }

  updateScrollbar() {
    if (!this.scrollThumb) return;
    
    const maxScroll = this.contentHeight - this.viewportHeight;
    const scrollPercent = -this.scrollY / maxScroll;
    const thumbTravel = this.scrollTrackHeight - this.scrollThumbHeight;
    
    this.scrollThumb.y = this.viewportY + scrollPercent * thumbTravel;
  }

  setupScrollInput() {
    // Mouse wheel
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      this.scrollY -= deltaY * 0.5;
      this.clampScroll();
      this.updateScrollbar();
    });
    
    // Drag to scroll
    const hitArea = this.add.rectangle(
      this.viewportX + this.viewportWidth / 2,
      this.viewportY + this.viewportHeight / 2,
      this.viewportWidth,
      this.viewportHeight,
      0x000000, 0
    );
    hitArea.setInteractive({ draggable: true });
    
    let lastY = 0;
    let lastTime = 0;
    
    hitArea.on('dragstart', (pointer) => {
      this.isDragging = true;
      lastY = pointer.y;
      lastTime = this.time.now;
      this.velocity = 0;
    });
    
    hitArea.on('drag', (pointer) => {
      const deltaY = pointer.y - lastY;
      const deltaTime = this.time.now - lastTime;
      
      if (deltaTime > 0) {
        this.velocity = deltaY / deltaTime * 16; // Normalize to ~60fps
      }
      
      this.scrollY += deltaY;
      this.clampScroll(true); // Allow overscroll
      this.updateScrollbar();
      
      lastY = pointer.y;
      lastTime = this.time.now;
    });
    
    hitArea.on('dragend', () => {
      this.isDragging = false;
      this.applyMomentum();
    });
  }

  clampScroll(allowOverscroll = false) {
    const maxScroll = this.contentHeight - this.viewportHeight;
    const min = -maxScroll;
    const max = 0;
    
    if (allowOverscroll) {
      // Allow some overscroll (elastic)
      const overscrollLimit = 50;
      this.scrollY = Phaser.Math.Clamp(this.scrollY, min - overscrollLimit, max + overscrollLimit);
    } else {
      this.scrollY = Phaser.Math.Clamp(this.scrollY, min, max);
    }
    
    this.scrollContainer.y = this.viewportY + this.scrollY;
  }

  applyMomentum() {
    // Apply momentum with decay
    this.tweens.add({
      targets: this,
      scrollY: this.scrollY + this.velocity * 10,
      duration: 500,
      ease: 'Cubic.easeOut',
      onUpdate: () => {
        this.clampScroll();
        this.updateScrollbar();
      },
      onComplete: () => {
        this.bounceBack();
      }
    });
  }

  bounceBack() {
    const maxScroll = this.contentHeight - this.viewportHeight;
    const min = -maxScroll;
    const max = 0;
    
    let targetY = this.scrollY;
    
    if (this.scrollY > max) {
      targetY = max;
    } else if (this.scrollY < min) {
      targetY = min;
    } else {
      return; // No bounce needed
    }
    
    this.tweens.add({
      targets: this,
      scrollY: targetY,
      duration: 300,
      ease: 'Back.easeOut',
      onUpdate: () => {
        this.scrollContainer.y = this.viewportY + this.scrollY;
        this.updateScrollbar();
      }
    });
  }

  createBackButton() {
    const btn = this.add.text(20, 20, '← Back', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#7b5cff'
    }).setInteractive({ useHandCursor: true });
    
    btn.on('pointerover', () => btn.setColor('#00f5d4'));
    btn.on('pointerout', () => btn.setColor('#7b5cff'));
    btn.on('pointerup', () => this.scene.start('MenuScene'));
  }

  update() {
    // Continuous scroll clamping
    if (!this.isDragging) {
      // Smooth scroll position update
      this.scrollContainer.y = Phaser.Math.Linear(
        this.scrollContainer.y,
        this.viewportY + this.scrollY,
        0.3
      );
    }
  }
}

