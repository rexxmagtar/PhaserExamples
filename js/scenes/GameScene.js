/**
 * Game Scene
 * Main gameplay scene
 */

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: GameConfig.scenes.GAME });
  }

  init() {
    // Initialize game variables
    this.score = 0;
    this.isGameOver = false;
  }

  create() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Background
    if (this.textures.exists('sky')) {
      this.add.image(centerX, centerY, 'sky').setDisplaySize(width, height);
    } else {
      this.cameras.main.setBackgroundColor('#12121a');
    }
    
    // Create game objects
    this.createGameObjects();
    
    // Set up input
    this.setupInput();
    
    // Create UI
    this.createUI();
    
    // Fade in
    this.cameras.main.fadeIn(300);
  }

  createGameObjects() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    
    // Particles (demo)
    if (this.textures.exists('red')) {
      this.particles = this.add.particles(0, 0, 'red', {
        speed: 100,
        scale: { start: 1, end: 0 },
        blendMode: 'ADD'
      });
    }
    
    // Logo as player (demo - replace with your own game logic)
    if (this.textures.exists('logo')) {
      this.player = this.physics.add.image(centerX, 100, 'logo');
      this.player.setVelocity(100, 200);
      this.player.setBounce(1, 1);
      this.player.setCollideWorldBounds(true);
      
      if (this.particles) {
        this.particles.startFollow(this.player);
      }
    }
    
    // Add your game objects here:
    // - Player sprite
    // - Enemies
    // - Platforms
    // - Collectibles
    // - etc.
  }

  setupInput() {
    // Keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // WASD keys
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
    
    // Pause key
    this.input.keyboard.on('keydown-ESC', () => {
      this.pauseGame();
    });
    
    // Space key
    this.input.keyboard.on('keydown-SPACE', () => {
      // Jump or action
    });
  }

  createUI() {
    const { width } = this.cameras.main;
    
    // Score text
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    
    // Pause button
    const pauseBtn = this.add.text(width - 20, 20, '⏸', {
      fontSize: '32px'
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    
    pauseBtn.on('pointerup', () => this.pauseGame());
    
    // Back to menu button
    const menuBtn = this.add.text(width - 60, 20, '🏠', {
      fontSize: '28px'
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    
    menuBtn.on('pointerup', () => {
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => {
        this.scene.start(GameConfig.scenes.MENU);
      });
    });
  }

  update(time, delta) {
    if (this.isGameOver) return;
    
    // Update score
    this.scoreText.setText(`Score: ${this.score}`);
    
    // Add your game update logic here:
    // - Player movement
    // - Physics checks
    // - Enemy AI
    // - etc.
    
    // Example: Handle player movement if you have a controllable player
    // this.handlePlayerMovement();
  }

  handlePlayerMovement() {
    if (!this.player) return;
    
    const speed = 200;
    
    // Horizontal movement
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }
    
    // Jumping
    if ((this.cursors.up.isDown || this.wasd.up.isDown) && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }
  }

  addScore(points) {
    this.score += points;
    
    // Score pop animation
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true
    });
  }

  pauseGame() {
    // Simple pause - could be expanded to a full pause scene
    if (this.scene.isPaused()) {
      this.scene.resume();
    } else {
      this.scene.pause();
    }
  }

  gameOver() {
    this.isGameOver = true;
    
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Darken screen
    const overlay = this.add.rectangle(centerX, centerY, width, height, 0x000000, 0.7);
    
    // Game over text
    this.add.text(centerX, centerY - 50, 'GAME OVER', {
      fontFamily: 'Cormorant Garamond, Georgia, serif',
      fontSize: '64px',
      color: '#ff5c8d'
    }).setOrigin(0.5);
    
    // Final score
    this.add.text(centerX, centerY + 20, `Final Score: ${this.score}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Restart prompt
    const restartText = this.add.text(centerX, centerY + 100, 'Click to Restart', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '20px',
      color: '#8a879c'
    }).setOrigin(0.5);
    
    // Blinking effect
    this.tweens.add({
      targets: restartText,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
    
    // Click to restart
    this.input.once('pointerup', () => {
      this.scene.restart();
    });
  }
}

