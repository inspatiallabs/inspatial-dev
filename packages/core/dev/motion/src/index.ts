/**
 * # InMotion
 * @module @inspatial/motion
 *
 * InSpatial Motion is a universal animation system for creating smooth, performant animations.
 * It provides a lightweight, powerful alternative to CSS animations with precise timing control.
 *
 * @example Basic Usage
 * ```typescript
 * import { createMotion } from "@inspatial/motion";
 *
 * // Simple animation
 * createMotion(".element", {
 *   translateX: 250,
 *   opacity: 1,
 *   duration: 1000
 * });
 * ```
 *
 * @features
 * - High-performance animation engine
 * - SVG morphing, path animation, and drawing
 * - Touch-friendly draggable elements
 * - Timeline-based animation sequencing
 * - Spring physics for natural motion
 * - Fine-grained control over easing and timing
 * - Staggered animations with grid support
 * - Media query integration
 *
 * @since 0.1.0
 * @category InSpatial Motion
 */

// Physics module
// export * as InMotionPhysics from "./physics/index.ts";

// Core animation engine and components
export { InMotion } from "./engine.ts";
export { createTimer as createMotionTimer, Timer } from "./timer.ts";
export {
  createMotion,
  JSAnimation,
  createMotionAnimation,
  Animatable,
} from "./animation.ts";
export { createMotionTimeline, InMotionTimeline } from "./timeline.ts";
export { createMotionDraggable, InMotionDraggable } from "./draggable.ts";
export { createMotionScope, InMotionScope } from "./scope.ts";
export {
  createMotionScroll,
  ScrollObserver,
  scrollContainers,
} from "./scroll.ts";
export { createMotionSpring, InMotionSpring } from "./spring.ts";

// Utilities
export * as inMotion from "./utils/index.ts";
export { svg as createMotionSVG } from "./svg.ts";
export { inSequence } from "./sequence.ts";
export { eases } from "./eases.ts";

// Re-export types
export * as InMotionType from "./types.ts";
