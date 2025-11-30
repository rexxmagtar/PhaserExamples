/**
 * Game Configuration
 * Central configuration file for Phaser game settings
 */

const GameConfig = {
  // Game dimensions (2K resolution for crisp rendering)
  width: 2560,
  height: 1440,
  
  
  // Game info
  title: 'Phaser Sandbox',
  version: '1.0.0',
  
  // Physics settings
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 200 },
      debug: false // Set to true during development
    }
  },
  
  // Asset paths
  paths: {
    images: 'assets/images/',
    backgrounds: 'assets/images/backgrounds/',
    sprites: 'assets/images/sprites/',
    ui: 'assets/images/ui/',
    audio: 'assets/audio/',
    music: 'assets/audio/music/',
    sfx: 'assets/audio/sfx/',
    fonts: 'assets/fonts/'
  },
  
  // Scene keys
  scenes: {
    BOOT: 'BootScene',
    PRELOAD: 'PreloadScene',
    MENU: 'MenuScene',
    GAME: 'GameScene',
    // Demo scenes
    BUBBLE_POP: 'BubblePopScene',
    PARTICLES: 'ParticleShowcaseScene',
    CUBE_3D: 'Cube3DScene',
    UI_COMPONENTS: 'UIComponentsScene',
    SCROLL_LIST: 'ScrollListScene',
    SHADERS: 'ShaderEffectsScene'
  },
  
  // Audio settings
  audio: {
    musicVolume: 0.5,
    sfxVolume: 0.7,
    muted: false
  },
  
  // Gameplay settings
  gameplay: {
    // Add your game-specific settings here
  }
};

// Freeze the config to prevent accidental modifications
Object.freeze(GameConfig);
Object.freeze(GameConfig.physics);
Object.freeze(GameConfig.paths);
Object.freeze(GameConfig.scenes);
Object.freeze(GameConfig.audio);
