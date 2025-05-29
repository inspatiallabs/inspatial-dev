
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
