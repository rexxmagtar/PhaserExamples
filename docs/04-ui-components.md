# 🎛️ UI Components Demo

## Overview
Phaser has **no built-in UI system** like Unity's uGUI or UI Toolkit. Everything is built manually using Graphics, Text, and input events. This demo shows how to create common UI components.

## Unity Comparison
| Unity UI | Phaser Approach |
|----------|-----------------|
| Button | Graphics + Text + pointer events |
| Slider | Graphics + drag events |
| Toggle | Graphics + state management |
| InputField | DOM element overlay (or bitmap font input) |
| Panel | Graphics.fillRect() |
| Layout Groups | Manual positioning |
| Canvas Scaler | `scale` config in Phaser |

## Components Demonstrated

### 1. Button
```javascript
createButton(x, y, text, callback) {
  const btn = this.add.container(x, y);
  
  // Background
  const bg = this.add.graphics();
  bg.fillStyle(0x7b5cff);
  bg.fillRoundedRect(-75, -25, 150, 50, 8);
  
  // Label
  const label = this.add.text(0, 0, text, { ... }).setOrigin(0.5);
  
  btn.add([bg, label]);
  btn.setSize(150, 50);
  btn.setInteractive({ useHandCursor: true });
  
  btn.on('pointerover', () => { /* hover state */ });
  btn.on('pointerout', () => { /* normal state */ });
  btn.on('pointerdown', () => { /* pressed state */ });
  btn.on('pointerup', callback);
  
  return btn;
}
```

### 2. Slider
```javascript
createSlider(x, y, width, min, max, value, onChange) {
  const track = this.add.graphics();
  track.fillStyle(0x333333);
  track.fillRoundedRect(0, -4, width, 8, 4);
  
  const fill = this.add.graphics();
  const handle = this.add.circle(0, 0, 12, 0x7b5cff);
  
  handle.setInteractive({ draggable: true });
  
  handle.on('drag', (pointer, dragX) => {
    const clampedX = Phaser.Math.Clamp(dragX, 0, width);
    handle.x = clampedX;
    
    // Calculate value
    const percent = clampedX / width;
    const newValue = min + (max - min) * percent;
    onChange(newValue);
    
    // Update fill
    fill.clear();
    fill.fillStyle(0x7b5cff);
    fill.fillRoundedRect(0, -4, clampedX, 8, 4);
  });
}
```

### 3. Toggle/Checkbox
```javascript
createToggle(x, y, initialState, onChange) {
  let isOn = initialState;
  
  const bg = this.add.graphics();
  const knob = this.add.circle(0, 0, 10, 0xffffff);
  
  const container = this.add.container(x, y, [bg, knob]);
  container.setSize(50, 26);
  container.setInteractive({ useHandCursor: true });
  
  const updateVisual = () => {
    bg.clear();
    bg.fillStyle(isOn ? 0x00ff88 : 0x666666);
    bg.fillRoundedRect(-25, -13, 50, 26, 13);
    
    this.tweens.add({
      targets: knob,
      x: isOn ? 12 : -12,
      duration: 150
    });
  };
  
  container.on('pointerup', () => {
    isOn = !isOn;
    updateVisual();
    onChange(isOn);
  });
  
  updateVisual();
  return container;
}
```

### 4. Progress Bar
```javascript
createProgressBar(x, y, width, height) {
  const bg = this.add.graphics();
  bg.fillStyle(0x333333);
  bg.fillRect(x, y, width, height);
  
  const fill = this.add.graphics();
  
  return {
    setProgress: (percent) => {
      fill.clear();
      fill.fillStyle(0x00ff88);
      fill.fillRect(x, y, width * percent, height);
    }
  };
}
```

## For Complex UI: Use DOM
For text inputs, dropdowns, etc., use HTML elements:

```javascript
// Create DOM element
const input = document.createElement('input');
input.type = 'text';
input.style.position = 'absolute';
document.body.appendChild(input);

// Position over game canvas
const bounds = this.game.canvas.getBoundingClientRect();
input.style.left = bounds.left + 100 + 'px';
input.style.top = bounds.top + 50 + 'px';
```

Or use Phaser's DOM plugin:
```javascript
this.add.dom(400, 300).createFromHTML('<input type="text">');
```

## Limitations vs Unity
- No anchoring system
- No auto-layout
- No rich text (use bitmap fonts)
- Text input requires DOM or complex bitmap rendering
- No built-in scrollable containers

## Try Modifying
- Add keyboard navigation between elements
- Create a volume slider that saves to localStorage
- Build a color picker with RGB sliders

