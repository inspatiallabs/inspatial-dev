/**
 * # connectTriggerToState
 * @summary #### Bridge between triggers and state
 *
 * The `connectTriggerToState` function is the core integration point between the
 * trigger system and state management. It connects registered triggers to state
 * instances and generates actions automatically.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial State x Trigger)
 * @module @in/teract
 * @kind function
 * @access public
 */

import type { StateInstanceType } from "./types.ts";
import type { RegisteredTriggerType } from "../trigger/src/types.ts";

/**
 * Extract a simplified action name from a trigger name
 *
 * Example: "custom:onDamage" -> "damage"
 */
function extractActionName(triggerName: string): string {
  // Handle namespaced names (with colons)
  if (triggerName.includes(":")) {
    const parts = triggerName.split(":");
    const eventName = parts[parts.length - 1];

    // Remove 'on' prefix if present
    if (eventName.startsWith("on") && eventName.length > 2) {
      return eventName.substring(2, 3).toLowerCase() + eventName.substring(3);
    }

    return eventName;
  }

  // Handle simple names
  if (triggerName.startsWith("on") && triggerName.length > 2) {
    return triggerName.substring(2, 3).toLowerCase() + triggerName.substring(3);
  }

  return triggerName;
}

/**
 * Connect a trigger to a state instance
 *
 * This is the core integration point between triggers and state. It:
 * 1. Creates an action function on the state linked to the trigger
 * 2. Sets up the state update logic when the trigger activates
 * 3. Returns a disconnect function to remove the connection
 *
 * @param state The state instance to connect to
 * @param trigger The trigger to connect
 * @param options Optional configuration for the connection
 * @returns A function to disconnect the trigger from the state
 */
export function connectTriggerToState<S extends object, P extends any[]>(
  state: StateInstanceType<S>,
  trigger: RegisteredTriggerType<S, P>,
  options?: {
    transform?: (payload: P) => P;
    condition?: (state: S, ...payload: P) => boolean;
  }
): () => void {
  // Get the action name from the trigger
  const actionName = extractActionName(trigger.name);

  // Create the action function
  const actionFunction = (...args: P) => {
    // Get current state
    const currentState = state.getState();

    // Apply transformation if provided
    const processedArgs = options?.transform ? options.transform(args) : args;

    // Check condition if provided
    if (
      options?.condition &&
      !options.condition(currentState, ...processedArgs)
    ) {
      if (__DEV__) {
        console.debug(`Trigger condition failed for ${trigger.name}`);
      }
      return;
    }

    // Call the trigger action with current state and get result
    const result = trigger.action(currentState, ...processedArgs);

    if (result !== undefined && result !== currentState) {
      // Check if we're in a batch operation
      const inBatch = (state as any)._batchDepth > 0;

      if (inBatch && (state as any)._batchingNextState) {
        // In batch mode: apply changes directly to the current batch state object
        // This is more reliable than returning values to be merged later
        Object.assign((state as any)._batchingNextState, result);
      } else {
        // Normal mode: Apply changes via setState
        state.setState(result);
      }
    }

    // Return nothing - the changes are applied directly to the state
    return undefined;
  };

  // Register the action under the full trigger name (matches test expectations)
  (state.action as any)[trigger.name] = actionFunction;

  // Also register a convenient shorthand (e.g., "connect") if it differs
  if (actionName !== trigger.name) {
    (state.action as any)[actionName] = actionFunction;
  }

  // Return function to disconnect
  return () => {
    // Remove the action from the state
    delete (state.action as any)[trigger.name];
    if ((state.action as any)[actionName] === actionFunction) {
      delete (state.action as any)[actionName];
    }
  };
}

/**
 * Connect multiple triggers to a state instance
 *
 * @param state The state instance to connect to
 * @param triggers An array of triggers to connect
 * @returns A function to disconnect all triggers
 */
export function connectTriggersToState<S extends object>(
  state: StateInstanceType<S>,
  triggers: Array<RegisteredTriggerType<S, any>>
): () => void {
  const disconnectFunctions: Array<() => void> = [];

  // Connect each trigger
  for (const trigger of triggers) {
    disconnectFunctions.push(connectTriggerToState(state, trigger));
  }

  // Return function to disconnect all
  return () => {
    disconnectFunctions.forEach((disconnect) => disconnect());
  };
}
