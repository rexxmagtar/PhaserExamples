# Lenis + Phaser Bridge Demo

Simple demo showing how to connect Lenis.js smooth scroll to Phaser canvas movement.

## How It Works

1. **Lenis.js** controls the document/body scroll (standard approach)
2. **Phaser** renders a fixed canvas overlay with a list of colored items
3. **Bridge** listens to Lenis scroll events and updates Phaser content position

## Files

- `index.html` - Simple HTML structure
- `bridge.js` - Phaser scene + Lenis initialization + bridge logic

## Key Concepts

- Lenis intercepts native scroll events and provides smooth scrolling
- Phaser canvas is fixed overlay (pointer-events: none to allow scroll through)
- Scroll position from Lenis is passed to Phaser scene via `setScroll()`
- Phaser moves its container based on scroll position

## Usage

Open `index.html` in a browser. Scroll with mouse wheel or touch to see smooth scrolling control Phaser content movement.

