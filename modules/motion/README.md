<div align="center">
    <a href="https://inspatial.io" target="_blank">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-light.svg">
        <source media="(prefers-color-scheme: dark)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg">
        <img src="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg" alt="InSpatial" width="300"/>
    </picture>
    </a>

<br>
   <br>

<a href="https://inspatial.io" target="_blank">
<p align="center">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/logo-light.svg">
        <source media="(prefers-color-scheme: dark)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/logo-dark.svg">
        <img src="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/logo-dark.svg" height="75" alt="InSpatial">
    </picture>
</p>
</a>

_Reality is your canvas_

<h3 align="center">
    InSpatial is a universal development environment (UDE) <br> for building cross-platform and spatial (AR/MR/VR) applications
  </h3>

[![InSpatial Dev](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/dev-badge.svg)](https://www.inspatial.dev)
[![InSpatial Cloud](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/cloud-badge.svg)](https://www.inspatial.cloud)
[![InSpatial App](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/app-badge.svg)](https://www.inspatial.io)
[![InSpatial Store](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/store-badge.svg)](https://www.inspatial.store)

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Discord](https://img.shields.io/badge/discord-join_us-5a66f6.svg?style=flat-square)](https://discord.gg/inspatiallabs)
[![Twitter](https://img.shields.io/badge/twitter-follow_us-1d9bf0.svg?style=flat-square)](https://twitter.com/inspatiallabs)
[![LinkedIn](https://img.shields.io/badge/linkedin-connect_with_us-0a66c2.svg?style=flat-square)](https://www.linkedin.com/company/inspatiallabs)

</div>

##

<div align="center">

| InSpatial                                        | Description                          | Link             |
| --- | --- | ---- |
| [![InSpatial Dev](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/dev-badge.svg)](https://www.inspatial.dev)     | Universal Libraries & Frameworks     | [inspatial.dev](https://www.inspatial.dev)   |
| [![InSpatial Cloud](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/cloud-badge.svg)](https://www.inspatial.cloud) | Backend APIs and SDKs                | [inspatial.cloud](https://www.inspatial.cloud) |
| [![InSpatial App](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/app-badge.svg)](https://www.inspatial.io)     | Build and manage your InSpatial apps | [inspatial.app](https://www.inspatial.io)   |
| [![InSpatial Store](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/store-badge.svg)](https://www.inspatial.store) | Deploy and discover InSpatial apps   | [inspatial.store](https://www.inspatial.store) |

</div>

---

## 🔍 InSpatial Motion (🟡 Preview)

InSpatial Motion or InMotion for short is a powerful, universal animation module built on AnimeJS core principles and logic which brings everything to life with silky-smooth performance across all platforms and environments.

### 👨‍💻 What Can I Do With InSpatial Motion?

- **Animate Anything**: Smoothly animate DOM elements, objects, SVG, canvas, and even plain JavaScript values
- **Timeline Orchestration**: Create complex, synchronized animation sequences with precise timing control
- **Physics-Based Motion**: Build realistic 2D/3D interactions with spring & bullet physics
- **Interactive Experiences**: Create draggable elements with smooth physics and smart constraints
- **Cross-Platform Compatibility**: Works seamlessly in browsers, Deno, Node.js, and spatial environments

## 🌟 Features

- 🌍 Universal runtime support (Browser, Deno, Node.js)
- 🔍 Advanced easing functions with custom cubic-bezier curves
- 🎮 Interactive draggable system with physics and constraints
- 📝 Declarative keyframe animations with percentage and duration syntax
- 🎯 Precise timeline control with labels and nested sequences
- ⚡ High-performance rendering with optimized update cycles
- 🔄 Additive animation composition for complex motion
- 🔍 Scroll-triggered animations with viewport detection
- 🎨 SVG morphing and path animations
- 🛡️ Type-safe APIs with comprehensive TypeScript support
- 🔄 Promise-based animation control with async/await
- 🧪 Clean testing architecture for server-side validation
- 📝 Comprehensive callback system for animation lifecycle
- 🧩 Modular architecture with tree-shakable exports
- 📸 2D/3D spring and bullet physics with customizable propeties
- 📈 Animation sequencing with stagger and offset support
- 📦 Scoped animation contexts with automatic cleanup

## 🔮 Coming Soon

- 🌐 `<InMotion>` Component via InSpatial Kit
- 📊 Visual timeline client extension
- ⚡ Performance profiling and debugging tools


## ✨ Advanced Features ✨

<table>
  <tr>
    <td>
      <h4>🔄 Timeline Composition</h4>
      <p>Create complex animation sequences with precise timing control, labels, and nested timelines.</p>
      <pre><code>createMotionTimeline()
  .add(element, { x: 100 })
  .add(otherElement, { opacity: 0 }, "-=0.5")
  .label("midpoint")
  .add(thirdElement, { scale: 2 }, "midpoint")</code></pre>
    </td>
    <td>
      <h4>🧩 Physics Integration </h4>
      <p>Advanced 3D physics simulation powered by Bullet Physics for realistic motion dynamics.</p>
      <pre><code>const physics = createMotionPhysics();
physics.createRigidBody(mesh, {
  mass: 1,
  shape: 'box'
});</code></pre>
    </td>
  </tr>
  <tr>
    <td>
      <h4>⚡ Performance Optimization</h4>
      <p>Additive animation composition and optimized rendering for smooth 60fps performance.</p>
      <pre><code>createMotion(elements, {
  x: 100,
  composition: "blend",
  duration: 1000,
  ease: "outExpo"
})</code></pre>
    </td>
    <td>
      <h4>📋 Scroll Animations</h4>
      <p>Trigger animations based on scroll position with precise viewport detection.</p>
      <pre><code>createMotionScroll({
  target: element,
  onEnter: () => animate(element, { opacity: 1 }),
  onLeave: () => animate(element, { opacity: 0 })
})</code></pre>
    </td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <h4>📚 Universal Compatibility</h4>
      <p>Works seamlessly across all JavaScript environments with consistent APIs and behavior.</p>
      <pre><code>import { createMotion } from "@in/motion";</code></pre>
    </td>
  </tr>
</table>

<div align="center">
  <h4>🚀 Keep reading to learn how to use all these amazing features! 🚀</h4>
</div>

### Why Choose InSpatial Motion?

1. **Universal Compatibility**: Works seamlessly across all JavaScript environments
2. **Modern Architecture**: Built from the ground up with TypeScript and modern JavaScript
3. **Performance First**: Optimized for 60fps with advanced composition techniques
4. **Developer Experience**: Intuitive APIs with comprehensive TypeScript support
5. **Open Source**: Apache 2.0 license with no commercial restrictions
6. **Future-Ready**: Designed for spatial computing (XR), games and emerging platforms


## 📦 Install InSpatial Motion:

Choose your preferred package manager:

```bash
deno install jsr:@in/motion
```

##

```bash
npx jsr add @in/motion
```

##

```bash
yarn dlx jsr add @in/motion
```

##

```bash
pnpm dlx jsr add @in/motion
```

##

```bash
bunx jsr add @in/motion
```

## 🛠️ Step-by-Step Usage Guide

Here are the essential usage patterns for working with InSpatial Motion:

### 1. **Basic Animations**

```typescript
import { createMotion } from "@in/motion"

// Animate a DOM element or any object
createMotion(element, {
  x: 100,          // Move 100px to the right
  opacity: 0.5,    // Fade to 50% opacity
  scale: 1.2,      // Scale to 120%
  duration: 1000,  // Animation lasts 1 second
  ease: "outCubic" // Smooth easing curve
});
```

### 2. **Timeline Composition**

```typescript
import { createMotionTimeline } from "@in/motion"

// Create complex animation sequences
const timeline = createMotionTimeline()
  .add(header, { y: -50, opacity: 0 })
  .add(content, { y: 20, opacity: 0 }, "-=0.3") // Start 0.3s earlier
  .add(footer, { y: 50, opacity: 0 }, "-=0.2")
  .label("fadeIn")
  .add([header, content, footer], { 
    y: 0, 
    opacity: 1, 
    duration: 0.8,
    ease: "outExpo"
  }, "fadeIn");
```

### 3. **Interactive Dragging**

```typescript
import { createMotionDraggable } from "@in/motion"

// Create physics-based draggable interactions
createMotionDraggable(element, {
  bounds: { left: 0, right: 500, top: 0, bottom: 300 },
  snap: { x: [0, 100, 200, 300], y: [0, 150, 300] },
  releaseStiffness: 150,
  releaseDamping: 0.7,
  onDrag: (draggable) => {
    console.log(`Position: ${draggable.x}, ${draggable.y}`);
  }
});
```

### 4. **Scroll-Triggered Animations**

```typescript
import { createMotionScroll } from "@in/motion"

// Animate elements as they enter the viewport
createMotionScroll({
  target: element,
  enter: "top bottom-=100px", // Trigger when element is 100px from bottom
  onEnter: () => {
    createMotion(element, {
      y: 0,
      opacity: 1,
      duration: 800,
      ease: "outCubic"
    });
  }
});
```

---

### 🔄 Timeline System - Orchestrate Complex Sequences

Create sophisticated animation choreography with precise timing control and nested sequences.

```typescript
import { createMotionTimeline, createMotion } from "@in/motion"

// Build complex animation sequences
const masterTimeline = createMotionTimeline({
  defaults: { duration: 0.6, ease: "outCubic" }
})
  .add(titleElement, { 
    x: 0, 
    y: 0, 
    opacity: 1,
    scale: 1
  })
  .label("titleComplete")
  .add(menuItems, {
    x: 0,
    opacity: 1,
    stagger: 0.1 // Animate each item 0.1s apart
  }, "titleComplete-=0.2")
  .call(() => console.log("Animation sequence complete!"));
```

#### Timeline Functions

| Function         | Description              |
| ---- | --- |
| `add()` | Add animations to the timeline with optional position |
| `label()` | Create named position markers for precise timing |
| `call()` | Execute functions at specific timeline positions |
| `set()` | Instantly set property values without animation |
| `sync()` | Synchronize with other timelines or animations |

#### Timeline Methods

| Method         | Description            |
| ----- | ---- |
| `play()` | Start or resume timeline playback |
| `pause()` | Pause timeline execution |
| `reverse()` | Play timeline in reverse direction |

### 🧩 Spring System

Create natural, spring-based animations using mass, and damping, velocity etc... for realistic interactions.

```typescript
import { createMotionSpring, createMotionDraggable } from "@in/motion"

// Configure spring physics for natural motion
const spring = createMotionSpring({
  mass: 1,        // Object mass (affects momentum)
  stiffness: 100, // Spring strength (affects speed)
  damping: 0.8,   // Energy loss (affects bounce)
  velocity: 0     // Initial velocity
});

// Apply spring to draggable interactions
createMotionDraggable(element, {
  releaseStiffness: spring.stiffness,
  releaseDamping: spring.damping,
  snap: [0, 100, 200], // Snap to these positions
  onRelease: (draggable) => {
    // Custom physics on release
    createMotion(element, {
      x: draggable.snapX,
      ease: spring.ease,
      duration: spring.duration
    });
  }
});
```

---

## 🛡️ Performance Tradeoffs

InSpatial Motion leverages modern JavaScript/Typescript capabilities, which provides strong performance benefits but comes with compatibility considerations:

### Performance Benefits

- **Native ES Modules**: Tree-shaking eliminates unused code for smaller bundles
- **TypeScript Native**: Zero runtime overhead from type checking
- **Additive Composition**: Multiple animations blend efficiently without conflicts
- **Optimized Rendering**: Smart batching and RAF optimization for 60fps performance
- **Memory Efficient**: Automatic cleanup and garbage collection optimization

### Compatibility Considerations

- **Bundle Size Sources**:
  - **TypeScript Types**: Comprehensive types add development value but increase bundle size
  - **Extensive Tests**: The tests make up two-third of bundle size
 

### When to Use InMotion

Consider using InSpatial Motion's enhanced performance features for:

- Modern web applications requiring smooth animations
- Cross-platform applications (web, mobile, desktop)
- Interactive data visualizations
- Spatial computing and AR/VR experiences
- Applications prioritizing developer experience and type safety

For maximum performance with less stringent compatibility requirements, you can configure InSpatial Motion to use lower compatibility levels.

## 🧪 Testing

### Unit Tests (InDOM)

The Motion system includes comprehensive unit tests: This will run all the (DOM-ful) tests

```bash
deno task test
```

Run comprehensive test suite covering all animation features, physics calculations, and cross-platform compatibility.

### Unit Tests (Universal Rendering)

To verify animations work without DOM dependencies (DOM-less):

```bash
deno task test:clean
```

Clean tests validate core animation logic, timing calculations, and callback systems using plain JavaScript objects instead of DOM elements.

### Integration Tests (InDOM)

For full animation system testing with DOM:

```bash
deno task test:animation
deno task test:timeline
deno task test:draggable
...
```

> Note: Integration tests require a DOM environment (browser or InDOM).

---

### Integration Tests (Universal Rendering)

For full animation system testing with DOM:

```bash
deno task test:animation-clean
deno task test:timeline-clean
deno task test:draggable-clean
...
```

---

## 🤔 FAQ

### "Can I use InSpatial Motion with React/Vue/Svelte/Solid/Astro/Angular/React-Native/NativScript/Lynx"

Yes! InSpatial Motion is framework-agnostic and works with any framework. Use refs to target elements and lifecycle hooks to manage animations.

### "How does performance compare to native CSS animations?"

InSpatial Motion uses optimized JavaScript for complex sequencing while leveraging CSS transforms for optimal rendering performance. For simple transitions, CSS is faster; for complex interactions, Motion provides better control and flexibility.

### "Can I animate SVG paths and complex graphics?"

Absolutely! Motion includes advanced SVG animation support with path morphing, draw animations, and transform controls specifically designed for scalable graphics.

### "Is server-side rendering supported?"

Yes! Motion's clean testing architecture ensures animations work in server environments. The module gracefully handles missing DOM APIs and provides predictable behavior during SSR.

### "How do I handle memory leaks with complex animations?"

Motion automatically manages cleanup through its scoped animation system. Use `animation.revert()` or `scope.revert()` to explicitly clean up resources when needed.

## 🎯 API Reference

### Core Functions

| Function         | Description              |
| ---- | --- |
| `createMotion()` | Create basic animations for any target |
| `createMotionTimeline()` | Build complex animation sequences |
| `createMotionDraggable()` | Add physics-based drag interactions |
| `createMotionScroll()` | Trigger animations on scroll |
| `createMotionSpring()` | Generate spring-based easing functions |
| `createMotionScope()`   | Create scoped animation contexts |
| `createMotionTimer()`   | Basic timing and callback system |

### Animation System

| Class/Type  | Description           |
| ----- | --- |
| `JSAnimation` | Core animation instance with lifecycle control |
| `InMotionTimeline` | Timeline composition with complex sequencing |

### Physics System

| Feature       | Description             |
| ---- | ----- |
| `InMotionSpring` | Configurable spring physics system |
| `InMotionDraggable` | Interactive drag with physics constraints |
| `ScrollObserver` | Viewport-based animation triggers |

### TypeScript Interfaces

This package exports the following TypeScript interfaces and types:

| Interface        | Description                |
| ---- | ----- |
| `AnimationParams`  | Configuration for basic animations  |
| `TimelineParams`  | Timeline creation and sequencing options  |
| `DraggableParams`  | Draggable behavior and physics settings  |
| `SpringParams`  | Spring physics configuration  |
| `ScrollObserverParams`  | Scroll-triggered animation options  |
| `EasingFunction`  | Custom easing function signature  |
| `TweenOptions`  | Property animation configuration  |
| `Callback`  | Animation lifecycle callback signature  |
| `TargetsParam`  | Valid animation target types  |
| `TimerParams`  | Basic timer and lifecycle configuration |
| `ScopeParams` | Animation scope and cleanup configuration |

---

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

---

## 📄 License

InSpatial Dev is released under the Apache-2.0 License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Ready to shape the future of spatial computing?</strong>
  <br>
  <a href="https://www.inspatiallabs.com">Start Building with InSpatial</a>
</div>
