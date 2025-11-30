/**
 * Main Game Entry Point
 * Initializes the Phaser game with all scenes and configurations
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  initGame();
});

function initGame() {
  // Phaser configuration - simple and clean
  const config = {
    type: Phaser.AUTO,
    width: GameConfig.width,
    height: GameConfig.height,
    parent: 'game-canvas',
    backgroundColor: '#0a0a0f',
    
    // Physics configuration
    physics: GameConfig.physics,
    
    // All game scenes
    scene: [
      BootScene,
      PreloadScene,
      MenuScene,
      GameScene,
      // Demo scenes
      BubblePopScene,
      ParticleShowcaseScene,
      Cube3DScene,
      UIComponentsScene,
      ScrollListScene,
      ShaderEffectsScene,
      FireDemoScene
    ],
    
    // Scale settings - FIT with zoom for crisp rendering
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GameConfig.width,
      height: GameConfig.height
    },
    
    // Render settings
    render: {
      pixelArt: false,
      antialias: true,
      antialiasGL: true,
      roundPixels: true
    },
    
    // Audio settings
    audio: {
      disableWebAudio: false
    }
  };
  
  // Create the game instance
  const game = new Phaser.Game(config);
  
  // Store game reference globally (useful for debugging)
  window.game = game;
  
  // ==========================================
  // FPS TRACKER
  // ==========================================
  game.events.on('ready', () => {
    // Create FPS display container
    const fpsContainer = document.createElement('div');
    fpsContainer.id = 'fps-tracker';
    fpsContainer.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: #00ff88;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid #00ff88;
      z-index: 9999;
      pointer-events: none;
      min-width: 120px;
    `;
    document.body.appendChild(fpsContainer);
    
    // Update FPS display
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 0;
    let minFps = 999;
    let maxFps = 0;
    
    const updateFPS = () => {
      frameCount++;
      const now = performance.now();
      const delta = now - lastTime;
      
      // Update every 500ms for stable reading
      if (delta >= 500) {
        fps = Math.round((frameCount / delta) * 1000);
        
        // Track min/max (reset after 5 seconds)
        if (fps > 0 && fps < 999) {
          minFps = Math.min(minFps, fps);
          maxFps = Math.max(maxFps, fps);
        }
        
        // Get memory if available
        let memoryInfo = '';
        if (performance.memory) {
          const usedMB = Math.round(performance.memory.usedJSHeapSize / 1048576);
          memoryInfo = `<br>MEM: ${usedMB} MB`;
        }
        
        // Color based on FPS
        let color = '#00ff88';  // Green = good
        if (fps < 30) color = '#ff4444';  // Red = bad
        else if (fps < 50) color = '#ffaa00';  // Orange = ok
        
        fpsContainer.style.color = color;
        fpsContainer.style.borderColor = color;
        fpsContainer.innerHTML = `
          FPS: ${fps}<br>
          MIN: ${minFps} | MAX: ${maxFps}${memoryInfo}
        `;
        
        frameCount = 0;
        lastTime = now;
      }
      
      requestAnimationFrame(updateFPS);
    };
    
    updateFPS();
    
    // Reset min/max every 5 seconds
    setInterval(() => {
      minFps = fps;
      maxFps = fps;
    }, 5000);
    
    // Toggle FPS display with F key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'f' || e.key === 'F') {
        fpsContainer.style.display = 
          fpsContainer.style.display === 'none' ? 'block' : 'none';
      }
    });
  });
  
  // Handle window focus/blur for pausing
  window.addEventListener('blur', () => {
    // Optional: Pause game when window loses focus
    // game.scene.pause(GameConfig.scenes.GAME);
  });
  
  window.addEventListener('focus', () => {
    // Optional: Resume game when window gains focus
    // game.scene.resume(GameConfig.scenes.GAME);
  });
}
