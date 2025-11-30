/**
 * Boot Scene
 * First scene that loads - handles initial setup and minimal assets for loading screen
 */

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: GameConfig.scenes.BOOT });
  }

  preload() {
    // Load minimal assets needed for the loading screen
    // Example: loading bar graphics, logo, etc.
    
    // For now, we'll use generated graphics
    this.createLoadingAssets();
  }

  create() {
    // Set up any global game settings
    this.setupGameSettings();
    
    // Transition to the preload scene
    this.scene.start(GameConfig.scenes.PRELOAD);
  }

  createLoadingAssets() {
    // Create a simple loading bar texture
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Loading bar background
    graphics.fillStyle(0x1a1a25, 1);
    graphics.fillRect(0, 0, 400, 30);
    graphics.generateTexture('loading-bar-bg', 400, 30);
    graphics.clear();
    
    // Loading bar fill
    graphics.fillStyle(0x7b5cff, 1);
    graphics.fillRect(0, 0, 400, 30);
    graphics.generateTexture('loading-bar-fill', 400, 30);
    graphics.clear();
    
    graphics.destroy();
  }

  setupGameSettings() {
    // Set up audio settings
    this.sound.pauseOnBlur = true;
    
    // Set up input settings
    this.input.mouse.disableContextMenu();
  }
}

