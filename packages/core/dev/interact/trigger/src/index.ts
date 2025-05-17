/**
 * @file index.ts
 * @description Main exports for the trigger-based state management system
 */

// Core state management
// @ts-ignore - Ignoring TS extension import error
export * from "./state.ts";

// Trigger registration and activation
// @ts-ignore - Ignoring TS extension import error
export {
  createTriggerInstance,
  activateTrigger
} from "./action.ts";

// @ts-ignore - Ignoring TS extension import error
export {
  registerTrigger,
  getRegisteredTrigger,
  hasTrigger
} from "./registry.ts";

// Core types
// @ts-ignore - Ignoring TS extension import error
export type {
  RegisteredTriggerType,
  TriggerDefinitionMetadataType
} from "./types.ts";

/**
 * @module @inspatial/trigger
 *
 * The InSpatial Trigger Bridge is a universal trigger (event listener) system that works seamlessly across
 * different platforms (Web, Native, and 3D environments). It allows events to propagate
 * between platforms with automatic mapping and transformation.
 */

// @ts-ignore - Ignoring TS extension import error
import { TriggerBridgeClass, initTriggerBridge } from "./bridge.ts";
// @ts-ignore - Ignoring TS extension import error
import { triggerRegistry } from "./registry.ts";
// @ts-ignore - Ignoring TS extension import error
import {
  createTrigger,
  createTriggerSequence,
  createTriggerGroup,
  createConditionalTrigger,
  initTriggerManager,
} from "./action.ts";
// @ts-ignore - Ignoring TS extension import error
import { triggerConfigManager } from "./config.ts";
// @ts-ignore - Ignoring TS extension import error
import { TriggerCategoryEnum } from "./types.ts";

import "./env.ts"; // Ensure __DEV__ global is set early

// Initialize system
// TODO @benemma: Move initTriggerSystem() to a UDE initialization function not exposed to users potentially InSpatial State
export function initTriggerSystem(options: {
  domAdapter?: boolean;
  nativeAdapter?: boolean;
  inrealEngine?: any;
  config?: any;
}) {
  // Initialize bridge
  const bridge = initTriggerBridge(
    options.domAdapter,
    options.nativeAdapter,
    options.inrealEngine
  );

  // Update config if provided
  if (options.config) {
    triggerConfigManager.updateConfig(options.config);
  }

  // Initialize trigger manager
  initTriggerManager(bridge);

  return {
    bridge,
    triggerRegistry,
    createTrigger,
    createTriggerSequence,
    createTriggerGroup,
    createConditionalTrigger,
    triggerCategories: TriggerCategoryEnum,
  };
}

export {
  TriggerBridgeClass as TriggerBridge,
  TriggerCategoryEnum as TriggerCategory,
  createTrigger,
  createTriggerSequence,
  createTriggerGroup,
  createConditionalTrigger,
  triggerRegistry,
  initTriggerBridge,
};
