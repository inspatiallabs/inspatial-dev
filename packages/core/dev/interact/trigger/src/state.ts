/**
 * @file state.ts
 * @description State integration for the trigger-based state management system
 */

/**
 * This file contains functions and utilities for integrating the trigger system
 * with the state management system. It provides functions for connecting
 * triggers to state and managing trigger states.
 */

// Export the activateTrigger function from action.ts for convenience
// @ts-ignore - Ignoring TS extension import error
export { activateTrigger } from "./action.ts";

// Export interfaces and types specific to state integration
// @ts-ignore - Ignoring TS extension import error
export type {
  RegisteredTriggerType,
  TriggerInstanceType
} from "./types.ts"; 