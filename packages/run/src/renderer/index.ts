// Primary mode-based API (recommended approach)
export { createRenderer, type RenderModeOptions } from "./modes.ts";

// Legacy universal renderer (for backwards compatibility)
export { createUniversalRenderer, createRenderer as createAutoRenderer, detectEnvironment } from "./universal.ts";

// Base renderer factory (for advanced users)
export { createRenderer as createBaseRenderer } from "./create-renderer.ts";

// Individual renderers (for direct control)
export { DOMRenderer } from "./dom.ts";
export { HTMLRenderer } from "./html.ts";
export { AndroidXRRenderer } from "./android-xr.ts";
export { VisionOSRenderer } from "./vision-os.ts";
export { HorizonOSRenderer } from "./horizon-os.ts";
export { GenericXRRenderer } from "./generic-xr.ts";
export { XRRenderer } from "./xr.ts";
export { NativeScriptRenderer } from "./nativescript.ts";
