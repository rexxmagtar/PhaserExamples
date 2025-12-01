# Smooth Scroll & Parallax Solutions Guide

A comprehensive guide to the best smooth scrolling libraries with parallax support for modern web applications.

## 🏆 Top Solutions Overview

### 1. **Lenis** ⭐ (Recommended)
**Best for:** Modern projects, React/Vue integration, balanced performance

- **Pros:**
  - Lightweight (~5KB gzipped)
  - Modern API with excellent performance
  - Works with React, Vue, and vanilla JS
  - Smooth easing and momentum scrolling
  - Great TypeScript support

- **Cons:**
  - Relatively new (less community resources)
  - Parallax needs manual implementation

- **Installation:**
  ```html
  <script src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.29/bundled/lenis.min.js"></script>
  ```

- **Basic Usage:**
  ```javascript
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  ```

- **GitHub:** https://github.com/studio-freight/lenis

---

### 2. **GSAP ScrollTrigger** ⭐⭐⭐
**Best for:** Complex animations, professional projects, maximum control

- **Pros:**
  - Industry standard, battle-tested
  - Extremely powerful and flexible
  - Pinning, scrubbing, timeline control
  - Excellent documentation
  - Works with GSAP animations

- **Cons:**
  - Requires GSAP license for commercial use
  - Steeper learning curve
  - Larger bundle size

- **Installation:**
  ```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
  ```

- **Basic Usage:**
  ```javascript
  gsap.registerPlugin(ScrollTrigger);

  // Smooth scroll
  gsap.to("body", {
    scrollTo: { y: 0, autoKill: false },
    duration: 1,
    ease: "power2.inOut"
  });

  // Parallax
  gsap.to(".parallax-element", {
    yPercent: -50,
    ease: "none",
    scrollTrigger: {
      trigger: ".parallax-element",
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });
  ```

- **Website:** https://greensock.com/scrolltrigger/

---

### 3. **Locomotive Scroll**
**Best for:** Modern designs, easy parallax setup, good performance

- **Pros:**
  - Lightweight and fast
  - Easy parallax with data attributes
  - Smooth scrolling out of the box
  - Good documentation

- **Cons:**
  - Less flexible than GSAP
  - Some mobile compatibility issues

- **Installation:**
  ```html
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/locomotive-scroll@4.1.4/dist/locomotive-scroll.min.css">
  <script src="https://cdn.jsdelivr.net/npm/locomotive-scroll@4.1.4/dist/locomotive-scroll.min.js"></script>
  ```

- **Basic Usage:**
  ```javascript
  const scroll = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true
  });

  // Parallax with data attributes
  // <div data-scroll data-scroll-speed="2">Parallax Element</div>
  ```

- **GitHub:** https://github.com/locomotivemtl/locomotive-scroll

---

### 4. **Rellax.js**
**Best for:** Simple parallax effects, minimal setup

- **Pros:**
  - Ultra-lightweight (~1KB)
  - Dead simple to use
  - No dependencies
  - Great performance

- **Cons:**
  - Only parallax, no smooth scroll
  - Limited features

- **Installation:**
  ```html
  <script src="https://cdn.jsdelivr.net/gh/dixonandmoe/rellax@master/rellax.min.js"></script>
  ```

- **Basic Usage:**
  ```javascript
  var rellax = new Rellax('.rellax', {
    speed: -7,
    center: false,
    wrapper: null,
    round: true,
    vertical: true,
    horizontal: false
  });

  // HTML: <div class="rellax" data-rellax-speed="7">Content</div>
  ```

- **GitHub:** https://github.com/dixonandmoe/rellax

---

### 5. **ScrollMagic**
**Best for:** Complex scroll-based storytelling, timeline animations

- **Pros:**
  - Powerful scroll-based animations
  - Great for storytelling websites
  - Works with GSAP, TweenMax
  - Scene-based control

- **Cons:**
  - More complex API
  - Requires animation library for best results
  - Larger bundle size

- **Installation:**
  ```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/ScrollMagic/2.0.8/ScrollMagic.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/ScrollMagic/2.0.8/plugins/animation.gsap.min.js"></script>
  ```

- **Basic Usage:**
  ```javascript
  var controller = new ScrollMagic.Controller();

  var scene = new ScrollMagic.Scene({
    triggerElement: "#trigger",
    duration: 400
  })
  .setTween(TweenMax.to("#animate", 1, {left: "50%"}))
  .addTo(controller);
  ```

- **Website:** http://scrollmagic.io/

---

### 6. **AOS (Animate On Scroll)**
**Best for:** Simple fade-ins, reveals, quick implementations

- **Pros:**
  - Very easy to use
  - Data attribute based
  - Lightweight
  - Good for simple animations

- **Cons:**
  - Limited to basic animations
  - No smooth scroll built-in
  - Less control

- **Installation:**
  ```html
  <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
  <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
  ```

- **Basic Usage:**
  ```javascript
  AOS.init({
    duration: 1000,
    easing: 'ease-in-out',
    once: true
  });

  // HTML: <div data-aos="fade-up">Content</div>
  ```

- **GitHub:** https://github.com/michalsnik/aos

---

## 🎯 Comparison Table

| Library | Size | Smooth Scroll | Parallax | Complexity | Best For |
|---------|------|---------------|----------|------------|----------|
| **Lenis** | ~5KB | ✅ Excellent | Manual | Low | Modern projects |
| **GSAP ScrollTrigger** | ~45KB | ✅ Excellent | ✅ Built-in | High | Professional projects |
| **Locomotive Scroll** | ~15KB | ✅ Excellent | ✅ Easy | Medium | Modern designs |
| **Rellax.js** | ~1KB | ❌ | ✅ Built-in | Very Low | Simple parallax |
| **ScrollMagic** | ~30KB | Manual | ✅ Built-in | High | Storytelling |
| **AOS** | ~5KB | ❌ | ❌ | Very Low | Simple reveals |

---

## 🚀 Recommended Combinations

### For Maximum Performance & Features:
**Lenis + GSAP ScrollTrigger**
- Lenis for smooth scrolling
- GSAP ScrollTrigger for complex animations

### For Quick Implementation:
**Locomotive Scroll** (all-in-one)

### For Simple Parallax:
**Rellax.js** (lightweight parallax only)

### For Complex Animations:
**GSAP ScrollTrigger** (most powerful)

---

## 📝 Implementation Best Practices

### 1. Performance Optimization
```css
/* Use will-change for animated elements */
.parallax-element {
  will-change: transform;
}

/* Prefer transforms over position changes */
.parallax-element {
  transform: translateY(var(--offset));
  /* NOT: top: var(--offset); */
}
```

### 2. Mobile Considerations
- Test on real devices
- Consider disabling smooth scroll on mobile
- Use `prefers-reduced-motion` media query
- Limit parallax intensity on mobile

### 3. Accessibility
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 4. Code Example: Lenis with Parallax
```javascript
const lenis = new Lenis();

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Parallax implementation
lenis.on('scroll', ({ scroll }) => {
  document.querySelectorAll('[data-parallax]').forEach(el => {
    const speed = parseFloat(el.dataset.parallax) || 0.5;
    const rect = el.getBoundingClientRect();
    const offset = (window.innerHeight - rect.top) * speed;
    el.style.transform = `translateY(${offset}px)`;
  });
});
```

---

## 🎨 Common Parallax Patterns

### 1. Background Parallax
```javascript
// Background moves slower than content
element.style.transform = `translateY(${scroll * 0.5}px)`;
```

### 2. Element Parallax
```javascript
// Element moves at different speed
element.style.transform = `translateY(${scroll * -0.3}px)`;
```

### 3. Scale on Scroll
```javascript
// Element scales as you scroll
const scale = 1 + (scroll / 1000);
element.style.transform = `scale(${scale})`;
```

### 4. Opacity Fade
```javascript
// Element fades in/out
const opacity = Math.max(0, Math.min(1, scroll / 500));
element.style.opacity = opacity;
```

---

## 🔗 Resources

- **Lenis:** https://github.com/studio-freight/lenis
- **GSAP ScrollTrigger:** https://greensock.com/scrolltrigger/
- **Locomotive Scroll:** https://locomotivemtl.github.io/locomotive-scroll/
- **Rellax.js:** https://github.com/dixonandmoe/rellax
- **ScrollMagic:** http://scrollmagic.io/
- **AOS:** https://github.com/michalsnik/aos

---

## 💡 Quick Start Recommendation

For most projects, start with **Lenis** for smooth scrolling and implement parallax manually. It provides the best balance of:
- Performance
- Flexibility
- Modern API
- Small bundle size

If you need complex animations, add **GSAP ScrollTrigger** for advanced scroll-based animations.

