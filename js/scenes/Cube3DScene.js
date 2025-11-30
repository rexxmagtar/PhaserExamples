/**
 * 3D Cube Demo Scene
 * Demonstrates fake 3D using software projection
 * Note: Phaser is 2D only - this is a mathematical simulation
 */

class Cube3DScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Cube3DScene' });
  }

  init() {
    // Rotation angles
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = 0;
    
    // Auto-rotate
    this.autoRotate = true;
    
    // Cube size
    this.cubeSize = 100;
    
    // Projection settings
    this.focalLength = 300;
    
    // Define cube vertices (8 corners)
    const s = this.cubeSize;
    this.vertices = [
      { x: -s, y: -s, z: -s },  // 0: back-bottom-left
      { x:  s, y: -s, z: -s },  // 1: back-bottom-right
      { x:  s, y:  s, z: -s },  // 2: back-top-right
      { x: -s, y:  s, z: -s },  // 3: back-top-left
      { x: -s, y: -s, z:  s },  // 4: front-bottom-left
      { x:  s, y: -s, z:  s },  // 5: front-bottom-right
      { x:  s, y:  s, z:  s },  // 6: front-top-right
      { x: -s, y:  s, z:  s },  // 7: front-top-left
    ];
    
    // Define faces (indices into vertices array)
    this.faces = [
      { indices: [0, 1, 2, 3], color: 0x7b5cff },  // Back
      { indices: [4, 5, 6, 7], color: 0x9d85ff },  // Front
      { indices: [0, 4, 7, 3], color: 0x5a3fd4 },  // Left
      { indices: [1, 5, 6, 2], color: 0x6b4ce6 },  // Right
      { indices: [3, 2, 6, 7], color: 0x00f5d4 },  // Top
      { indices: [0, 1, 5, 4], color: 0x00b89c },  // Bottom
    ];
  }

  create() {
    const { width, height } = this.cameras.main;
    this.centerX = width / 2;
    this.centerY = height / 2;
    
    this.cameras.main.setBackgroundColor('#0a0a0f');
    
    // Graphics for drawing
    this.graphics = this.add.graphics();
    
    // Title
    this.add.text(width / 2, 30, '🎲 Fake 3D Cube (Software Projection)', {
      fontFamily: 'Cormorant Garamond, Georgia, serif',
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Info text
    this.add.text(width / 2, 70, 'Phaser is 2D only - this uses math to simulate 3D', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#8a879c'
    }).setOrigin(0.5);
    
    // Controls info
    this.add.text(width / 2, height - 30, 'Arrow keys: Rotate | Space: Toggle auto-rotate | +/-: Zoom', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#8a879c'
    }).setOrigin(0.5);
    
    // Status text
    this.statusText = this.add.text(20, height - 60, '', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#5a5870'
    });
    
    // Setup input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-SPACE', () => {
      this.autoRotate = !this.autoRotate;
    });
    this.input.keyboard.on('keydown-PLUS', () => {
      this.cubeSize = Math.min(this.cubeSize + 10, 200);
      this.updateVertices();
    });
    this.input.keyboard.on('keydown-MINUS', () => {
      this.cubeSize = Math.max(this.cubeSize - 10, 30);
      this.updateVertices();
    });
    
    // Also handle numpad and regular +/-
    this.input.keyboard.on('keydown-NUMPAD_ADD', () => {
      this.cubeSize = Math.min(this.cubeSize + 10, 200);
      this.updateVertices();
    });
    this.input.keyboard.on('keydown-NUMPAD_SUBTRACT', () => {
      this.cubeSize = Math.max(this.cubeSize - 10, 30);
      this.updateVertices();
    });
    
    // Mouse drag rotation
    this.isDragging = false;
    this.lastPointer = { x: 0, y: 0 };
    
    this.input.on('pointerdown', (pointer) => {
      this.isDragging = true;
      this.lastPointer = { x: pointer.x, y: pointer.y };
      this.autoRotate = false;
    });
    
    this.input.on('pointerup', () => {
      this.isDragging = false;
    });
    
    this.input.on('pointermove', (pointer) => {
      if (this.isDragging) {
        const dx = pointer.x - this.lastPointer.x;
        const dy = pointer.y - this.lastPointer.y;
        this.rotationY += dx * 0.01;
        this.rotationX += dy * 0.01;
        this.lastPointer = { x: pointer.x, y: pointer.y };
      }
    });
    
    // Back button
    this.createBackButton();
  }

  updateVertices() {
    const s = this.cubeSize;
    this.vertices = [
      { x: -s, y: -s, z: -s },
      { x:  s, y: -s, z: -s },
      { x:  s, y:  s, z: -s },
      { x: -s, y:  s, z: -s },
      { x: -s, y: -s, z:  s },
      { x:  s, y: -s, z:  s },
      { x:  s, y:  s, z:  s },
      { x: -s, y:  s, z:  s },
    ];
  }

  rotatePoint(point, rx, ry, rz) {
    let { x, y, z } = point;
    
    // Rotate around X axis
    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    let y1 = y * cosX - z * sinX;
    let z1 = y * sinX + z * cosX;
    y = y1;
    z = z1;
    
    // Rotate around Y axis
    const cosY = Math.cos(ry), sinY = Math.sin(ry);
    let x1 = x * cosY - z * sinY;
    z1 = x * sinY + z * cosY;
    x = x1;
    z = z1;
    
    // Rotate around Z axis
    const cosZ = Math.cos(rz), sinZ = Math.sin(rz);
    x1 = x * cosZ - y * sinZ;
    y1 = x * sinZ + y * cosZ;
    x = x1;
    y = y1;
    
    return { x, y, z };
  }

  projectTo2D(point3D) {
    // Perspective projection
    const scale = this.focalLength / (this.focalLength + point3D.z);
    return {
      x: this.centerX + point3D.x * scale,
      y: this.centerY + point3D.y * scale,
      scale: scale
    };
  }

  update(time, delta) {
    // Handle keyboard rotation
    const rotSpeed = 0.03;
    if (this.cursors.left.isDown) this.rotationY -= rotSpeed;
    if (this.cursors.right.isDown) this.rotationY += rotSpeed;
    if (this.cursors.up.isDown) this.rotationX -= rotSpeed;
    if (this.cursors.down.isDown) this.rotationX += rotSpeed;
    
    // Auto-rotation
    if (this.autoRotate) {
      this.rotationY += 0.01;
      this.rotationX += 0.005;
    }
    
    // Clear and redraw
    this.graphics.clear();
    
    // Transform all vertices
    const transformedVertices = this.vertices.map(v => 
      this.rotatePoint(v, this.rotationX, this.rotationY, this.rotationZ)
    );
    
    // Project to 2D
    const projectedVertices = transformedVertices.map(v => this.projectTo2D(v));
    
    // Calculate face depths for sorting (painter's algorithm)
    const facesWithDepth = this.faces.map((face, index) => {
      const avgZ = face.indices.reduce((sum, i) => sum + transformedVertices[i].z, 0) / 4;
      return { face, index, avgZ };
    });
    
    // Sort faces by depth (draw far faces first)
    facesWithDepth.sort((a, b) => a.avgZ - b.avgZ);
    
    // Draw faces
    facesWithDepth.forEach(({ face }) => {
      const points = face.indices.map(i => projectedVertices[i]);
      
      // Calculate face normal for lighting
      const v1 = transformedVertices[face.indices[0]];
      const v2 = transformedVertices[face.indices[1]];
      const v3 = transformedVertices[face.indices[2]];
      
      // Simple lighting based on Z component of normal
      const nx = (v2.y - v1.y) * (v3.z - v1.z) - (v2.z - v1.z) * (v3.y - v1.y);
      const ny = (v2.z - v1.z) * (v3.x - v1.x) - (v2.x - v1.x) * (v3.z - v1.z);
      const nz = (v2.x - v1.x) * (v3.y - v1.y) - (v2.y - v1.y) * (v3.x - v1.x);
      const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
      const normalZ = nz / len;
      
      // Back-face culling (don't draw faces pointing away)
      if (normalZ < 0) return;
      
      // Adjust color brightness based on lighting
      const brightness = 0.5 + normalZ * 0.5;
      const r = ((face.color >> 16) & 0xff) * brightness;
      const g = ((face.color >> 8) & 0xff) * brightness;
      const b = (face.color & 0xff) * brightness;
      const color = (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b);
      
      // Draw filled face
      this.graphics.fillStyle(color, 0.9);
      this.graphics.beginPath();
      this.graphics.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        this.graphics.lineTo(points[i].x, points[i].y);
      }
      this.graphics.closePath();
      this.graphics.fill();
      
      // Draw edges
      this.graphics.lineStyle(2, 0xffffff, 0.5);
      this.graphics.beginPath();
      this.graphics.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        this.graphics.lineTo(points[i].x, points[i].y);
      }
      this.graphics.closePath();
      this.graphics.stroke();
    });
    
    // Draw vertices as dots
    projectedVertices.forEach(p => {
      this.graphics.fillStyle(0xffffff, 0.8);
      this.graphics.fillCircle(p.x, p.y, 4 * p.scale);
    });
    
    // Update status
    this.statusText.setText(
      `Rotation: X=${this.rotationX.toFixed(2)} Y=${this.rotationY.toFixed(2)}\n` +
      `Auto-rotate: ${this.autoRotate ? 'ON' : 'OFF'} | Size: ${this.cubeSize}`
    );
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
}

