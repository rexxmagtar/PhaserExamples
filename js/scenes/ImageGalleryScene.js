/**
 * Image Gallery Scene
 * Demonstrates virtual scrolling with lazy loading/unloading
 * Only images in viewport (+3 buffer) are loaded in memory
 */

class ImageGalleryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ImageGalleryScene' });
  }

  init() {
    this.scrollY = 0;
    this.velocity = 0;
    this.isDragging = false;
    
    // Image settings - portrait/tall orientation, single column
    this.imageWidth = 600;
    this.imageHeight = 1200;  // Tall enough to cover most of screen
    this.padding = 20;
    this.columns = 1;  // Single column - one image per row like PDF viewer
    
    // Buffer: load 3 rows above and below viewport
    this.bufferRows = 3;
    
    // Track loaded images
    this.loadedImages = new Map();  // key -> { sprite, loaded }
    this.visibleRange = { start: 0, end: 0 };
    
    // Total images for the gallery
    this.totalImages = 50;
    
    // Simulated network settings - slow connection
    this.simulateNetwork = true;
    this.networkDelayMin = 5000;   // Minimum delay in ms (5 seconds)
    this.networkDelayMax = 8000;   // Maximum delay in ms (8 seconds)
    this.networkFailRate = 0.05;   // 5% chance of "failure" (for demo)
  }

  create() {
    const { width, height } = this.cameras.main;
    
    this.cameras.main.setBackgroundColor('#0a0a0f');
    
    // Calculate layout - single column centered
    this.galleryWidth = this.imageWidth + this.padding * 2;
    this.startX = width / 2;  // Center horizontally for single column
    
    this.rowHeight = this.imageHeight + this.padding;
    this.totalRows = Math.ceil(this.totalImages / this.columns);
    this.contentHeight = this.totalRows * this.rowHeight + this.padding;
    
    // Viewport
    this.viewportY = 100;
    this.viewportHeight = height - 150;
    
    // Title
    this.add.text(width / 2, 35, '🖼️ Virtual Scroll Gallery', {
      fontFamily: 'Cormorant Garamond, Georgia, serif',
      fontSize: '32px',
      color: '#ffffff',
      resolution: 2
    }).setOrigin(0.5);
    
    this.add.text(width / 2, 70, 'Procedural images with simulated slow connection (5-8 seconds)', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#8a879c',
      resolution: 2
    }).setOrigin(0.5);
    
    // Create container for images (positioned at viewport)
    this.imageContainer = this.add.container(0, this.viewportY);
    this.imageContainer.setDepth(1);
    this.imageContainer.setVisible(true);
    
    // Create mask for viewport (world coordinates matching container)
    const maskGraphics = this.add.graphics();
    maskGraphics.fillStyle(0xffffff);
    maskGraphics.fillRect(0, this.viewportY, width, this.viewportHeight);
    const mask = maskGraphics.createGeometryMask();
    this.imageContainer.setMask(mask);
    
    // Debug: Add a test rectangle to verify container is visible (remove after debugging)
    // const testRect = this.add.rectangle(width/2, 50, 200, 100, 0xff0000);
    // this.imageContainer.add(testRect);
    
    // Placeholder graphics
    this.createPlaceholderTexture();
    
    // Create scrollbar
    this.createScrollbar();
    
    // Setup input
    this.setupInput();
    
    // Stats display
    this.createStatsDisplay();
    
    // Initialize container position
    this.clampScroll();
    
    // Initial load
    this.updateVisibleImages();
    
    // Back button
    this.createBackButton();
    
    // Instructions
    this.add.text(width / 2, height - 25, 'Scroll with mouse wheel or drag | Watch memory stats', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#5a5870',
      resolution: 2
    }).setOrigin(0.5);
  }

  createPlaceholderTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Placeholder background
    graphics.fillStyle(0x2a2a35);
    graphics.fillRoundedRect(0, 0, this.imageWidth, this.imageHeight, 8);
    
    // Loading icon
    graphics.fillStyle(0x4a4a55);
    graphics.fillCircle(this.imageWidth / 2, this.imageHeight / 2, 30);
    
    // Spinner lines
    graphics.lineStyle(3, 0x7b5cff);
    graphics.arc(this.imageWidth / 2, this.imageHeight / 2, 20, 0, Math.PI * 1.5);
    graphics.stroke();
    
    graphics.generateTexture('placeholder', this.imageWidth, this.imageHeight);
    graphics.destroy();
  }

  getImagePosition(index) {
    const col = index % this.columns;
    const row = Math.floor(index / this.columns);
    
    return {
      x: this.startX + col * (this.imageWidth + this.padding),
      y: row * this.rowHeight + this.padding + this.imageHeight / 2
    };
  }

  updateVisibleImages() {
    const { height } = this.cameras.main;
    
    // Calculate visible row range
    const scrollOffset = -this.scrollY;
    const firstVisibleRow = Math.floor(scrollOffset / this.rowHeight);
    const lastVisibleRow = Math.ceil((scrollOffset + this.viewportHeight) / this.rowHeight);
    
    // Add buffer
    const startRow = Math.max(0, firstVisibleRow - this.bufferRows);
    const endRow = Math.min(this.totalRows - 1, lastVisibleRow + this.bufferRows);
    
    // Calculate image indices
    const startIndex = startRow * this.columns;
    const endIndex = Math.min(this.totalImages - 1, (endRow + 1) * this.columns - 1);
    
    // Track what should be visible
    const shouldBeVisible = new Set();
    for (let i = startIndex; i <= endIndex; i++) {
      shouldBeVisible.add(i);
    }
    
    // Unload images outside range
    for (const [index, data] of this.loadedImages) {
      if (!shouldBeVisible.has(index)) {
        this.unloadImage(index);
      }
    }
    
    // Load images in range
    for (let i = startIndex; i <= endIndex; i++) {
      if (!this.loadedImages.has(i)) {
        this.loadImage(i);
      }
    }
    
    // Update stats
    this.visibleRange = { start: startIndex, end: endIndex };
    this.updateStats();
  }

  loadImage(index) {
    const pos = this.getImagePosition(index);
    const textureKey = `gallery-img-${index}`;
    const colors = [0x7b5cff, 0x00f5d4, 0xff6b6b, 0xffe66d, 0x95e1d3, 0xf38181, 0x4ecdc4, 0xff9f43];
    const color = colors[index % colors.length];
    
    // Create placeholder sprite first (position will be relative to container)
    const sprite = this.add.image(0, 0, 'placeholder');
    sprite.setDisplaySize(this.imageWidth, this.imageHeight);
    this.imageContainer.add(sprite);
    // Set position after adding to container (positions are relative to container)
    sprite.setPosition(pos.x, pos.y);
    
    // Loading progress bar background
    const progressBg = this.add.graphics();
    progressBg.fillStyle(0x333344, 1);
    progressBg.fillRoundedRect(pos.x - 60, pos.y + 20, 120, 8, 4);
    this.imageContainer.add(progressBg);
    
    // Loading progress bar fill
    const progressBar = this.add.graphics();
    this.imageContainer.add(progressBar);
    
    // Loading text with percentage
    const loadingText = this.add.text(0, 0, 'Loading...', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#888899',
      resolution: 2
    }).setOrigin(0.5);
    this.imageContainer.add(loadingText);
    // Set position after adding to container
    loadingText.setPosition(pos.x, pos.y - 10);
    
    // Store reference
    this.loadedImages.set(index, {
      sprite: sprite,
      loadingText: loadingText,
      progressBg: progressBg,
      progressBar: progressBar,
      loaded: false,
      textureKey: textureKey
    });
    
    // Simulate network loading with random delay
    const delay = Phaser.Math.Between(this.networkDelayMin, this.networkDelayMax);
    const simulateFail = Math.random() < this.networkFailRate;
    
    // Animate loading progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      const data = this.loadedImages.get(index);
      if (!data) {
        clearInterval(progressInterval);
        return;
      }
      
      // Random progress increments (simulate chunked loading)
      progress += Phaser.Math.Between(5, 15);
      if (progress > 95) progress = 95; // Cap at 95% until "complete"
      
      // Update progress bar
      if (data.progressBar) {
        data.progressBar.clear();
        data.progressBar.fillStyle(color, 1);
        data.progressBar.fillRoundedRect(pos.x - 60, pos.y + 20, 120 * (progress / 100), 8, 4);
      }
      
      // Update text
      if (data.loadingText) {
        data.loadingText.setText(`Loading... ${progress}%`);
      }
    }, delay / 10);
    
    // Complete loading after delay
    this.time.delayedCall(delay, () => {
      clearInterval(progressInterval);
      
      const data = this.loadedImages.get(index);
      if (!data) return; // Already unloaded
      
      if (simulateFail) {
        // Simulate load failure
        if (data.loadingText) {
          data.loadingText.setText('❌ Failed');
          data.loadingText.setColor('#ff6666');
        }
        if (data.progressBar) {
          data.progressBar.clear();
          data.progressBar.fillStyle(0xff4444, 1);
          data.progressBar.fillRoundedRect(pos.x - 60, pos.y + 20, 120, 8, 4);
        }
        
        // Retry after short delay
        this.time.delayedCall(500, () => {
          this.completeImageLoad(index, pos, color, textureKey);
        });
      } else {
        this.completeImageLoad(index, pos, color, textureKey);
      }
    });
    
    this.updateStats();
  }

  completeImageLoad(index, pos, color, textureKey) {
    const data = this.loadedImages.get(index);
    if (!data) return;
    
    // Generate the image texture
    this.generateImageTexture(index, textureKey, color);
    
    // Update sprite
    data.sprite.setTexture(textureKey);
    data.sprite.setDisplaySize(this.imageWidth, this.imageHeight);
    data.loaded = true;
    
    // Clean up loading UI
    if (data.loadingText) {
      data.loadingText.destroy();
      data.loadingText = null;
    }
    if (data.progressBg) {
      data.progressBg.destroy();
      data.progressBg = null;
    }
    if (data.progressBar) {
      data.progressBar.destroy();
      data.progressBar = null;
    }
    
    // Add border
    const border = this.add.graphics();
    border.lineStyle(2, color, 0.6);
    border.strokeRoundedRect(
      pos.x - this.imageWidth / 2,
      pos.y - this.imageHeight / 2,
      this.imageWidth,
      this.imageHeight,
      8
    );
    this.imageContainer.add(border);
    data.border = border;
    
    // Add label
    const label = this.add.text(
      0, 0,
      `#${index + 1}`,
      {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: { x: 6, y: 3 },
        resolution: 2
      }
    );
    this.imageContainer.add(label);
    // Set position after adding to container
    label.setPosition(pos.x - this.imageWidth / 2 + 10, pos.y - this.imageHeight / 2 + 10);
    data.label = label;
    
    // Fade in effect
    data.sprite.alpha = 0;
    this.tweens.add({
      targets: data.sprite,
      alpha: 1,
      duration: 300
    });
    
    this.updateStats();
  }

  generateImageTexture(index, textureKey, color) {
    // Don't regenerate if already exists
    if (this.textures.exists(textureKey)) return;
    
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Background
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(0, 0, this.imageWidth, this.imageHeight, 8);
    
    // Unique pattern based on index
    const pattern = index % 6;
    
    if (pattern === 0) {
      // Circles
      graphics.fillStyle(0xffffff, 0.15);
      graphics.fillCircle(this.imageWidth * 0.25, this.imageHeight * 0.35, 45);
      graphics.fillCircle(this.imageWidth * 0.75, this.imageHeight * 0.55, 35);
      graphics.fillStyle(0x000000, 0.1);
      graphics.fillCircle(this.imageWidth * 0.5, this.imageHeight * 0.7, 25);
    } else if (pattern === 1) {
      // Diagonal stripes
      graphics.fillStyle(0xffffff, 0.1);
      for (let i = -2; i < 8; i++) {
        graphics.fillRect(i * 60 - 30, 0, 25, this.imageHeight * 2);
      }
    } else if (pattern === 2) {
      // Gradient blocks
      graphics.fillStyle(0x000000, 0.25);
      graphics.fillRect(0, this.imageHeight * 0.6, this.imageWidth, this.imageHeight * 0.4);
      graphics.fillStyle(0xffffff, 0.15);
      graphics.fillRect(0, 0, this.imageWidth, this.imageHeight * 0.25);
    } else if (pattern === 3) {
      // Grid - adapted for tall images
      graphics.fillStyle(0xffffff, 0.08);
      const gridCols = Math.floor(this.imageWidth / 50);
      const gridRows = Math.floor(this.imageHeight / 50);
      for (let x = 0; x < gridCols; x++) {
        for (let y = 0; y < gridRows; y++) {
          if ((x + y) % 2 === 0) {
            graphics.fillRect(x * 50, y * 50, 50, 50);
          }
        }
      }
    } else if (pattern === 4) {
      // Center focus
      graphics.fillStyle(0x000000, 0.2);
      graphics.fillCircle(this.imageWidth / 2, this.imageHeight / 2, 80);
      graphics.fillStyle(0xffffff, 0.3);
      graphics.fillCircle(this.imageWidth / 2, this.imageHeight / 2, 40);
    } else {
      // Corner accents
      graphics.fillStyle(0xffffff, 0.2);
      graphics.fillTriangle(0, 0, 80, 0, 0, 80);
      graphics.fillTriangle(this.imageWidth, this.imageHeight, this.imageWidth - 80, this.imageHeight, this.imageWidth, this.imageHeight - 80);
      graphics.fillStyle(0x000000, 0.15);
      graphics.fillTriangle(this.imageWidth, 0, this.imageWidth - 60, 0, this.imageWidth, 60);
    }
    
    // Image number badge
    graphics.fillStyle(0xffffff, 0.9);
    graphics.fillRoundedRect(this.imageWidth / 2 - 30, this.imageHeight / 2 - 18, 60, 36, 6);
    
    graphics.generateTexture(textureKey, this.imageWidth, this.imageHeight);
    graphics.destroy();
  }

  unloadImage(index) {
    const data = this.loadedImages.get(index);
    if (data) {
      // Destroy sprite and associated elements
      if (data.sprite) data.sprite.destroy();
      if (data.loadingText) data.loadingText.destroy();
      if (data.progressBg) data.progressBg.destroy();
      if (data.progressBar) data.progressBar.destroy();
      if (data.border) data.border.destroy();
      if (data.label) data.label.destroy();
      
      // Remove texture from cache to free memory
      if (data.loaded && this.textures.exists(data.textureKey)) {
        this.textures.remove(data.textureKey);
      }
      
      this.loadedImages.delete(index);
    }
  }

  createScrollbar() {
    const { width } = this.cameras.main;
    const x = width - 25;
    const y = this.viewportY;
    const height = this.viewportHeight;
    
    // Track
    this.scrollTrack = this.add.graphics();
    this.scrollTrack.fillStyle(0x333344, 0.5);
    this.scrollTrack.fillRoundedRect(x, y, 10, height, 5);
    
    // Thumb
    const thumbHeight = Math.max(30, (this.viewportHeight / this.contentHeight) * height);
    this.scrollThumb = this.add.graphics();
    this.scrollThumbHeight = thumbHeight;
    this.scrollTrackHeight = height;
    this.scrollTrackX = x;
    this.scrollTrackY = y;
    
    this.updateScrollbar();
  }

  updateScrollbar() {
    const maxScroll = Math.max(0, this.contentHeight - this.viewportHeight);
    const scrollPercent = maxScroll > 0 ? -this.scrollY / maxScroll : 0;
    const thumbY = this.scrollTrackY + scrollPercent * (this.scrollTrackHeight - this.scrollThumbHeight);
    
    this.scrollThumb.clear();
    this.scrollThumb.fillStyle(0x7b5cff, 0.8);
    this.scrollThumb.fillRoundedRect(this.scrollTrackX, thumbY, 10, this.scrollThumbHeight, 5);
  }

  setupInput() {
    const { width, height } = this.cameras.main;
    
    // Mouse wheel - smooth scrolling
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      this.scrollY -= deltaY * 1.2;  // Increased sensitivity for smoother feel
      this.clampScroll();
      this.updateScrollbar();
      this.updateVisibleImages();
    });
    
    // Drag to scroll
    const hitArea = this.add.rectangle(
      width / 2,
      this.viewportY + this.viewportHeight / 2,
      width - 50,
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
        this.velocity = deltaY / deltaTime * 16;
      }
      
      // Smooth drag scrolling
      this.scrollY += deltaY;
      this.clampScroll();
      this.updateScrollbar();
      this.updateVisibleImages();
      
      lastY = pointer.y;
      lastTime = this.time.now;
    });
    
    hitArea.on('dragend', () => {
      this.isDragging = false;
      this.applyMomentum();
    });
  }

  clampScroll() {
    const maxScroll = Math.max(0, this.contentHeight - this.viewportHeight);
    this.scrollY = Phaser.Math.Clamp(this.scrollY, -maxScroll, 0);
    // Don't set container position here - let update() handle smooth interpolation
  }

  applyMomentum() {
    this.tweens.add({
      targets: this,
      scrollY: this.scrollY + this.velocity * 15,
      duration: 800,
      ease: 'Cubic.easeOut',
      onUpdate: () => {
        this.clampScroll();
        this.updateScrollbar();
        this.updateVisibleImages();
      }
    });
  }

  createStatsDisplay() {
    const { width } = this.cameras.main;
    
    // Stats panel
    const panelX = 20;
    const panelY = this.viewportY;
    
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a25, 0.9);
    panel.fillRoundedRect(panelX, panelY, 180, 120, 8);
    panel.lineStyle(1, 0x7b5cff, 0.5);
    panel.strokeRoundedRect(panelX, panelY, 180, 120, 8);
    
    this.add.text(panelX + 90, panelY + 15, '📊 Memory Stats', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#8a879c',
      resolution: 2
    }).setOrigin(0.5);
    
    this.statsText = this.add.text(panelX + 15, panelY + 35, '', {
      fontFamily: 'Courier New, monospace',
      fontSize: '12px',
      color: '#00ff88',
      resolution: 2,
      lineSpacing: 4
    });
  }

  updateStats() {
    const loadedCount = this.loadedImages.size;
    const fullyLoaded = [...this.loadedImages.values()].filter(d => d.loaded).length;
    
    this.statsText.setText(
      `Total images: ${this.totalImages}\n` +
      `In memory:    ${loadedCount}\n` +
      `Loaded:       ${fullyLoaded}\n` +
      `Range:        ${this.visibleRange.start}-${this.visibleRange.end}\n` +
      `Saved:        ${this.totalImages - loadedCount} unloaded`
    );
  }

  createBackButton() {
    const btn = this.add.text(20, 35, '← Back', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#7b5cff',
      resolution: 2
    }).setInteractive({ useHandCursor: true });
    
    btn.on('pointerover', () => btn.setColor('#00f5d4'));
    btn.on('pointerout', () => btn.setColor('#7b5cff'));
    btn.on('pointerup', () => {
      // Cleanup all images
      for (const [index] of this.loadedImages) {
        this.unloadImage(index);
      }
      this.scene.start('MenuScene');
    });
  }

  update() {
    // Smooth container position interpolation for fluid scrolling
    const targetY = this.viewportY + this.scrollY;
    this.imageContainer.y = Phaser.Math.Linear(
      this.imageContainer.y,
      targetY,
      0.15  // Smooth interpolation factor
    );
  }
}

