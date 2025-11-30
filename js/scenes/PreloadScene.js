/**
 * Preload Scene
 * Loads all game assets and shows loading progress
 */

class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: GameConfig.scenes.PRELOAD });
  }

  preload() {
    // Create loading UI
    this.createLoadingUI();
    
    // Set up loading events
    this.setupLoadingEvents();
    
    // Load all game assets
    this.loadAssets();
  }

  create() {
    // Create any animations here
    this.createAnimations();
    
    // Hide HTML loading screen if present
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }
    
    // Small delay before transitioning to menu
    this.time.delayedCall(500, () => {
      this.scene.start(GameConfig.scenes.MENU);
    });
  }

  createLoadingUI() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Background
    this.cameras.main.setBackgroundColor('#0a0a0f');
    
    // Title text
    this.add.text(centerX, centerY - 80, GameConfig.title, {
      fontFamily: 'Cormorant Garamond, Georgia, serif',
      fontSize: '48px',
      color: '#e8e6f0'
    }).setOrigin(0.5);
    
    // Loading bar background
    this.loadingBarBg = this.add.image(centerX, centerY + 20, 'loading-bar-bg');
    
    // Loading bar fill (will be cropped based on progress)
    this.loadingBarFill = this.add.image(centerX - 200, centerY + 20, 'loading-bar-fill');
    this.loadingBarFill.setOrigin(0, 0.5);
    
    // Progress text
    this.progressText = this.add.text(centerX, centerY + 70, 'Loading... 0%', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#8a879c'
    }).setOrigin(0.5);
    
    // Asset text (shows what's currently loading)
    this.assetText = this.add.text(centerX, centerY + 100, '', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#5a5870'
    }).setOrigin(0.5);
  }

  setupLoadingEvents() {
    // Update progress bar as files load
    this.load.on('progress', (value) => {
      this.loadingBarFill.setCrop(0, 0, 400 * value, 30);
      this.progressText.setText(`Loading... ${Math.floor(value * 100)}%`);
    });
    
    // Show current file being loaded
    this.load.on('fileprogress', (file) => {
      this.assetText.setText(`Loading: ${file.key}`);
    });
    
    // Clean up when complete
    this.load.on('complete', () => {
      this.progressText.setText('Loading... 100%');
      this.assetText.setText('Complete!');
    });
  }

  loadAssets() {
    // ========================================
    // IMAGES
    // ========================================
    
    // Backgrounds
    // this.load.image('bg-menu', `${GameConfig.paths.backgrounds}menu-bg.png`);
    // this.load.image('bg-game', `${GameConfig.paths.backgrounds}game-bg.png`);
    
    // Sprites
    // this.load.image('player', `${GameConfig.paths.sprites}player.png`);
    // this.load.spritesheet('player-sheet', `${GameConfig.paths.sprites}player-sheet.png`, {
    //   frameWidth: 64,
    //   frameHeight: 64
    // });
    
    // UI elements
    // this.load.image('btn-play', `${GameConfig.paths.ui}btn-play.png`);
    // this.load.image('btn-settings', `${GameConfig.paths.ui}btn-settings.png`);
    
    // ========================================
    // AUDIO
    // ========================================
    
    // Music
    // this.load.audio('music-menu', `${GameConfig.paths.music}menu.mp3`);
    // this.load.audio('music-game', `${GameConfig.paths.music}game.mp3`);
    
    // Sound effects
    // this.load.audio('sfx-click', `${GameConfig.paths.sfx}click.wav`);
    // this.load.audio('sfx-jump', `${GameConfig.paths.sfx}jump.wav`);
    
    // ========================================
    // DEMO ASSETS (from Phaser Labs)
    // ========================================
    // Remove these once you add your own assets
    this.load.setBaseURL('https://labs.phaser.io');
    this.load.image('sky', 'assets/skies/space3.png');
    this.load.image('logo', 'assets/sprites/phaser3-logo.png');
    this.load.image('red', 'assets/particles/red.png');
    this.load.setBaseURL(''); // Reset base URL
  }

  createAnimations() {
    // Create sprite animations here
    // Example:
    // this.anims.create({
    //   key: 'player-idle',
    //   frames: this.anims.generateFrameNumbers('player-sheet', { start: 0, end: 3 }),
    //   frameRate: 8,
    //   repeat: -1
    // });
  }
}

