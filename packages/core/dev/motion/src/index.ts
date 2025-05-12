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
export * as InMotionPhysics from "./physics/index.d.ts";

// Core animation engine and components
export { engine as InMotion } from "./engine.ts";
export { createTimer as createMotionTimer, Timer } from "./timer.ts";
export {
  animate as createMotion,
  JSAnimation,
  createAnimatable as createMotionAnimation,
  Animatable,
} from "./animation.ts";
export {
  createTimeline as createMotionTimeline,
  Timeline,
} from "./timeline.ts";
export {
  createDraggable as createMotionDraggable,
  Draggable,
} from "./draggable.ts";
export { createScope as createMotionScope, Scope } from "./scope.ts";
export {
  onScroll as createMotionScroll,
  ScrollObserver,
  scrollContainers,
} from "./scroll.ts";
export { createSpring as createMotionSpring, Spring } from "./spring.ts";

// Utilities
export * as inMotion from "./utils/index.ts";
export { svg as createMotionSVG } from "./svg.ts";
export { stagger as inSequence } from "./stagger.ts";
export { eases } from "./eases.ts";

// Re-export types
export type * from "./types.ts";
