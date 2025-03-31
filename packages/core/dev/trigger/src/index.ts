/**
 * @module @inspatial/trigger
 *
 * The InSpatial Trigger Bridge is a universal trigger (event listener) system that works seamlessly across
 * different platforms (Web, Native, and 3D environments). It allows events to propagate
 * between platforms with automatic mapping and transformation.
 */

import { TriggerBridgeClass, initTriggerBridge } from "./bridge.ts";
import { triggerRegistry } from "./registry.ts";
import {
  createTrigger,
  createTriggerSequence,
  createTriggerGroup,
  createConditionalTrigger,
  initTriggerManager,
} from "./action.ts";
import { triggerConfigManager } from "./config.ts";
import { TriggerCategoryEnum } from "./types.ts";

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
};
