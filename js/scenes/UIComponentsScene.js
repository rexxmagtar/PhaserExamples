/**
 * UI Components Demo Scene
 * Demonstrates custom UI: buttons, sliders, toggles, progress bars
 */

class UIComponentsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIComponentsScene' });
  }

  init() {
    this.sliderValue = 50;
    this.toggleState = false;
    this.progressValue = 0;
  }

  create() {
    const { width, height } = this.cameras.main;
    
    this.cameras.main.setBackgroundColor('#0a0a0f');
    
    // Title
    this.add.text(width / 2, 30, '🎛️ UI Components Demo', {
      fontFamily: 'Cormorant Garamond, Georgia, serif',
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Create panels
    this.createButtonsPanel(100, 100);
    this.createSliderPanel(100, 280);
    this.createTogglePanel(450, 100);
    this.createProgressPanel(450, 280);
    this.createRadioPanel(100, 420);
    this.createDropdownPanel(450, 420);
    
    // Back button
    this.createBackButton();
  }

  createButtonsPanel(x, y) {
    // Panel background
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a25, 0.8);
    panel.fillRoundedRect(x, y, 300, 150, 12);
    panel.lineStyle(1, 0x7b5cff, 0.3);
    panel.strokeRoundedRect(x, y, 300, 150, 12);
    
    // Panel title
    this.add.text(x + 150, y + 20, 'Buttons', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#8a879c'
    }).setOrigin(0.5);
    
    // Primary button
    this.createButton(x + 80, y + 70, 'Primary', 0x7b5cff, () => {
      console.log('Primary clicked!');
    });
    
    // Secondary button
    this.createButton(x + 220, y + 70, 'Secondary', 0x333344, () => {
      console.log('Secondary clicked!');
    });
    
    // Icon button
    this.createIconButton(x + 150, y + 120, '⚙️', () => {
      console.log('Settings clicked!');
    });
  }

  createButton(x, y, text, color, callback) {
    const container = this.add.container(x, y);
    
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-60, -20, 120, 40, 8);
    
    const label = this.add.text(0, 0, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    container.add([bg, label]);
    container.setSize(120, 40);
    container.setInteractive({ useHandCursor: true });
    
    // States
    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(Phaser.Display.Color.ValueToColor(color).lighten(20).color, 1);
      bg.fillRoundedRect(-60, -20, 120, 40, 8);
    });
    
    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(-60, -20, 120, 40, 8);
    });
    
    container.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50
      });
    });
    
    container.on('pointerup', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 100
      });
      callback();
    });
    
    return container;
  }

  createIconButton(x, y, icon, callback) {
    const btn = this.add.text(x, y, icon, {
      fontSize: '28px'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    btn.on('pointerover', () => btn.setScale(1.2));
    btn.on('pointerout', () => btn.setScale(1));
    btn.on('pointerup', callback);
    
    return btn;
  }

  createSliderPanel(x, y) {
    // Panel
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a25, 0.8);
    panel.fillRoundedRect(x, y, 300, 120, 12);
    panel.lineStyle(1, 0x7b5cff, 0.3);
    panel.strokeRoundedRect(x, y, 300, 120, 12);
    
    this.add.text(x + 150, y + 20, 'Slider', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#8a879c'
    }).setOrigin(0.5);
    
    // Slider value display
    this.sliderValueText = this.add.text(x + 150, y + 95, `Value: ${this.sliderValue}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#5a5870'
    }).setOrigin(0.5);
    
    // Create slider
    this.createSlider(x + 40, y + 55, 220, 0, 100, this.sliderValue, (val) => {
      this.sliderValue = Math.round(val);
      this.sliderValueText.setText(`Value: ${this.sliderValue}`);
    });
  }

  createSlider(x, y, width, min, max, value, onChange) {
    const container = this.add.container(x, y);
    
    // Track background
    const trackBg = this.add.graphics();
    trackBg.fillStyle(0x333344, 1);
    trackBg.fillRoundedRect(0, -4, width, 8, 4);
    container.add(trackBg);
    
    // Track fill
    const trackFill = this.add.graphics();
    container.add(trackFill);
    
    // Handle
    const handleX = ((value - min) / (max - min)) * width;
    const handle = this.add.circle(handleX, 0, 12, 0x7b5cff);
    handle.setStrokeStyle(3, 0xffffff);
    container.add(handle);
    
    // Make interactive
    handle.setInteractive({ useHandCursor: true, draggable: true });
    
    const updateFill = (hx) => {
      trackFill.clear();
      trackFill.fillStyle(0x7b5cff, 1);
      trackFill.fillRoundedRect(0, -4, hx, 8, 4);
    };
    
    updateFill(handleX);
    
    handle.on('drag', (pointer, dragX) => {
      const clampedX = Phaser.Math.Clamp(dragX, 0, width);
      handle.x = clampedX;
      updateFill(clampedX);
      
      const percent = clampedX / width;
      const newValue = min + (max - min) * percent;
      onChange(newValue);
    });
    
    // Click on track to jump
    const hitArea = this.add.rectangle(width / 2, 0, width, 30, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);
    container.sendToBack(hitArea);
    
    hitArea.on('pointerdown', (pointer) => {
      const localX = pointer.x - x;
      const clampedX = Phaser.Math.Clamp(localX, 0, width);
      handle.x = clampedX;
      updateFill(clampedX);
      
      const percent = clampedX / width;
      const newValue = min + (max - min) * percent;
      onChange(newValue);
    });
    
    return container;
  }

  createTogglePanel(x, y) {
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a25, 0.8);
    panel.fillRoundedRect(x, y, 300, 150, 12);
    panel.lineStyle(1, 0x7b5cff, 0.3);
    panel.strokeRoundedRect(x, y, 300, 150, 12);
    
    this.add.text(x + 150, y + 20, 'Toggles', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#8a879c'
    }).setOrigin(0.5);
    
    // Toggle 1
    this.add.text(x + 30, y + 60, 'Sound Effects', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#e8e6f0'
    });
    this.createToggle(x + 250, y + 60, true, (val) => {
      console.log('Sound:', val);
    });
    
    // Toggle 2
    this.add.text(x + 30, y + 100, 'Music', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#e8e6f0'
    });
    this.createToggle(x + 250, y + 100, false, (val) => {
      console.log('Music:', val);
    });
    
    // Checkbox
    this.add.text(x + 30, y + 135, 'Notifications', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#e8e6f0'
    });
    this.createCheckbox(x + 250, y + 135, false, (val) => {
      console.log('Notifications:', val);
    });
  }

  createToggle(x, y, initialState, onChange) {
    let isOn = initialState;
    const container = this.add.container(x, y);
    
    const bg = this.add.graphics();
    const knob = this.add.circle(0, 0, 9, 0xffffff);
    
    container.add([bg, knob]);
    
    const updateVisual = () => {
      bg.clear();
      bg.fillStyle(isOn ? 0x00f5d4 : 0x444455, 1);
      bg.fillRoundedRect(-25, -12, 50, 24, 12);
      
      this.tweens.add({
        targets: knob,
        x: isOn ? 12 : -12,
        duration: 150,
        ease: 'Back.easeOut'
      });
    };
    
    container.setSize(50, 24);
    container.setInteractive({ useHandCursor: true });
    
    container.on('pointerup', () => {
      isOn = !isOn;
      updateVisual();
      onChange(isOn);
    });
    
    updateVisual();
    knob.x = isOn ? 12 : -12; // Set initial position without animation
    
    return container;
  }

  createCheckbox(x, y, initialState, onChange) {
    let isChecked = initialState;
    const container = this.add.container(x, y);
    
    const box = this.add.graphics();
    const check = this.add.text(0, 0, '✓', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);
    check.visible = isChecked;
    
    container.add([box, check]);
    
    const updateVisual = () => {
      box.clear();
      box.fillStyle(isChecked ? 0x7b5cff : 0x333344, 1);
      box.fillRoundedRect(-12, -12, 24, 24, 4);
      box.lineStyle(2, isChecked ? 0x7b5cff : 0x555566, 1);
      box.strokeRoundedRect(-12, -12, 24, 24, 4);
      check.visible = isChecked;
    };
    
    container.setSize(24, 24);
    container.setInteractive({ useHandCursor: true });
    
    container.on('pointerup', () => {
      isChecked = !isChecked;
      updateVisual();
      onChange(isChecked);
      
      if (isChecked) {
        this.tweens.add({
          targets: check,
          scaleX: [0, 1.2, 1],
          scaleY: [0, 1.2, 1],
          duration: 200
        });
      }
    });
    
    updateVisual();
    return container;
  }

  createProgressPanel(x, y) {
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a25, 0.8);
    panel.fillRoundedRect(x, y, 300, 120, 12);
    panel.lineStyle(1, 0x7b5cff, 0.3);
    panel.strokeRoundedRect(x, y, 300, 120, 12);
    
    this.add.text(x + 150, y + 20, 'Progress Bars', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#8a879c'
    }).setOrigin(0.5);
    
    // Animated progress bar
    this.progressBar = this.createProgressBar(x + 30, y + 55, 240, 12, 0x7b5cff);
    
    // Health bar style
    this.healthBar = this.createProgressBar(x + 30, y + 85, 240, 8, 0xff5c8d);
    this.healthBar.setProgress(0.75);
    
    // Animate progress
    this.tweens.add({
      targets: this,
      progressValue: 1,
      duration: 3000,
      repeat: -1,
      yoyo: true,
      onUpdate: () => {
        this.progressBar.setProgress(this.progressValue);
      }
    });
  }

  createProgressBar(x, y, width, height, color) {
    const container = this.add.container(x, y);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x333344, 1);
    bg.fillRoundedRect(0, 0, width, height, height / 2);
    container.add(bg);
    
    const fill = this.add.graphics();
    container.add(fill);
    
    const percentText = this.add.text(width + 10, height / 2, '0%', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#8a879c'
    }).setOrigin(0, 0.5);
    container.add(percentText);
    
    container.setProgress = (percent) => {
      fill.clear();
      if (percent > 0) {
        fill.fillStyle(color, 1);
        fill.fillRoundedRect(0, 0, width * percent, height, height / 2);
      }
      percentText.setText(`${Math.round(percent * 100)}%`);
    };
    
    container.setProgress(0);
    return container;
  }

  createRadioPanel(x, y) {
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a25, 0.8);
    panel.fillRoundedRect(x, y, 300, 120, 12);
    panel.lineStyle(1, 0x7b5cff, 0.3);
    panel.strokeRoundedRect(x, y, 300, 120, 12);
    
    this.add.text(x + 150, y + 20, 'Radio Buttons', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#8a879c'
    }).setOrigin(0.5);
    
    const options = ['Easy', 'Medium', 'Hard'];
    this.radioButtons = [];
    
    options.forEach((opt, i) => {
      const radio = this.createRadioButton(x + 30 + i * 90, y + 70, opt, i === 1, () => {
        this.radioButtons.forEach((r, j) => {
          if (j !== i) r.setSelected(false);
        });
      });
      this.radioButtons.push(radio);
    });
  }

  createRadioButton(x, y, label, initialState, onChange) {
    let isSelected = initialState;
    const container = this.add.container(x, y);
    
    const circle = this.add.graphics();
    const dot = this.add.circle(10, 0, 5, 0x7b5cff);
    dot.visible = isSelected;
    
    const text = this.add.text(28, 0, label, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#e8e6f0'
    }).setOrigin(0, 0.5);
    
    container.add([circle, dot, text]);
    
    const updateVisual = () => {
      circle.clear();
      circle.lineStyle(2, isSelected ? 0x7b5cff : 0x555566, 1);
      circle.strokeCircle(10, 0, 10);
      dot.visible = isSelected;
    };
    
    container.setSize(80, 24);
    container.setInteractive({ useHandCursor: true });
    
    container.on('pointerup', () => {
      if (!isSelected) {
        isSelected = true;
        updateVisual();
        onChange();
      }
    });
    
    container.setSelected = (val) => {
      isSelected = val;
      updateVisual();
    };
    
    updateVisual();
    return container;
  }

  createDropdownPanel(x, y) {
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a25, 0.8);
    panel.fillRoundedRect(x, y, 300, 120, 12);
    panel.lineStyle(1, 0x7b5cff, 0.3);
    panel.strokeRoundedRect(x, y, 300, 120, 12);
    
    this.add.text(x + 150, y + 20, 'Dropdown (Simplified)', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#8a879c'
    }).setOrigin(0.5);
    
    this.createDropdown(x + 40, y + 55, 220, ['Option 1', 'Option 2', 'Option 3'], (val) => {
      console.log('Selected:', val);
    });
  }

  createDropdown(x, y, width, options, onChange) {
    let isOpen = false;
    let selectedIndex = 0;
    const container = this.add.container(x, y);
    
    // Main button
    const bg = this.add.graphics();
    bg.fillStyle(0x333344, 1);
    bg.fillRoundedRect(0, 0, width, 36, 6);
    container.add(bg);
    
    const label = this.add.text(15, 18, options[selectedIndex], {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#e8e6f0'
    }).setOrigin(0, 0.5);
    container.add(label);
    
    const arrow = this.add.text(width - 25, 18, '▼', {
      fontSize: '12px',
      color: '#8a879c'
    }).setOrigin(0.5);
    container.add(arrow);
    
    // Dropdown list
    const dropdownContainer = this.add.container(0, 40);
    dropdownContainer.visible = false;
    container.add(dropdownContainer);
    
    const dropBg = this.add.graphics();
    dropBg.fillStyle(0x252530, 1);
    dropBg.fillRoundedRect(0, 0, width, options.length * 36, 6);
    dropdownContainer.add(dropBg);
    
    options.forEach((opt, i) => {
      const optBg = this.add.rectangle(width / 2, 18 + i * 36, width - 4, 32, 0x333344, 0);
      optBg.setInteractive({ useHandCursor: true });
      
      const optText = this.add.text(15, 18 + i * 36, opt, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '14px',
        color: '#e8e6f0'
      }).setOrigin(0, 0.5);
      
      optBg.on('pointerover', () => optBg.setFillStyle(0x7b5cff, 0.3));
      optBg.on('pointerout', () => optBg.setFillStyle(0x333344, 0));
      optBg.on('pointerup', () => {
        selectedIndex = i;
        label.setText(options[i]);
        dropdownContainer.visible = false;
        isOpen = false;
        arrow.setAngle(0);
        onChange(options[i]);
      });
      
      dropdownContainer.add([optBg, optText]);
    });
    
    // Toggle dropdown
    const hitArea = this.add.rectangle(width / 2, 18, width, 36, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);
    
    hitArea.on('pointerup', () => {
      isOpen = !isOpen;
      dropdownContainer.visible = isOpen;
      arrow.setAngle(isOpen ? 180 : 0);
    });
    
    return container;
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

