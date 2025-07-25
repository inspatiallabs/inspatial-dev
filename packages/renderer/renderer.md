# InSpatial Renderer

The InSpatial Renderer is a coordinated rendering system that supports multiple rendering targets (DOM, Spatial, and Native) through a unified API. This system allows seamless switching between different rendering backends while maintaining a consistent programming model.

## Features

- **Unified API** across DOM, Spatial, and Native rendering targets
- **Directive-based rendering** to control which renderer handles specific components
- **Cross-renderer event system** for consistent event handling
- **Extensible renderer architecture** supporting multiple Spatial and Native renderer implementations
- **Automatic fallback** when primary renderer is not available

## Architecture

The renderer system is built on a modular architecture that consists of:

- **Core** - Core types, interfaces, and registry mechanisms
- **DOM** - DOM-specific renderer implementation
- **Spatial** - Spatial renderer implementations (3D & XR)
- **Native** - Native renderer implementations (iOS, Android, VisionOS)
- **Event** - Cross-renderer event system
- **Render** - Unified renderer that coordinates across targets

## Usage

### Basic Rendering

```typescript
import { universalRenderer } from "@inspatial/renderer";

// Create an element using the DOM renderer
const element = await universalRenderer.createElement("div", {
  className: "indom-element"
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  color: 0xff0000
  },
  "Hello World"
);

// Render to a container
await universalRenderer.render(element, document.getElementById("app"));
```

### Switching Renderer Targets

```typescript
import { universalRenderer } from "@inspatial/renderer";

// Switch to Spatial rendering
universalRenderer.setTarget("Spatial");

// Create a plane using the Spatial renderer
const plane = await universalRenderer.createElement("plane", {
  className: "inSpatial-element"
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  color: 0xff0000
});

// Render to a canvas
await universalRenderer.render(plane, document.getElementById("canvas"));
```

### Using Directives

```typescript
import { directiveHandler } from "@inspatial/renderer/core";

// Process directives in props
const { processedProps, extractedDirectives } =
  directiveHandler.processDirectives({
    className: "main-container",
    "dom:style": { color: "red" },
    "Spatial:material": "phong",
    "native:fontFamily": "Inder",
  });

// Now processedProps only contains: { className: "main-container" }
// And extractedDirectives contains the target-specific props
```

### Cross-Renderer Events

```typescript
import { eventBridge } from "@inspatial/renderer/event";

// Link events between DOM, NATIVE & Spatial elements
eventBridge.createEventLink(
  { target: "dom", nodeId: "button1" },
  { target: "native", nodeId: "button1" },
  { target: "Spatial", nodeId: "plane1" },

  [
    ["click", "tap"],
    ["mousedown", "pointerdown"],
    ["mouseup", "pointerup"],
  ]
);

// Now events will be automatically forwarded between the elements
```

## Available Renderers

### DOM Renderers

- DOM renderer (implements InSpatial DOM)

### Spatial Renderers

- InSpatial 3D & XR Engine (via `@in/spatial` modulue)

### Native Renderers

- NativeScript (default Native renderer)

## Extending the System

You can register your own renderers for any target:

```typescript
import { RendererRegistry } from "@inspatial/renderer/core";

// Register a custom Spatial renderer
RendererRegistry.registerSpatialRenderer("custom", async () => {
  const CustomRenderer = await import("./custom-renderer");
  return new CustomRenderer();
});

// Use the custom renderer
universalRenderer.setSpatialRendererType("custom");
```
