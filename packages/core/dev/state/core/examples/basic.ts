/**
 * # Basic State Example
 * @summary #### Shows simple usage of createState
 */

import { createState } from "../index.ts";
import { createTrigger } from "../../trigger/src/index.ts";
import { triggerRegistry } from "../../trigger/src/registry.ts";

// Define a player type
interface PlayerType {
  health: number;
  maxHealth: number;
  position: { x: number; y: number; z: number };
  isMoving: boolean;
}

// Create a damage trigger
const damageTrigger = createTrigger({
  name: "custom:onDamage",
  action: (state: PlayerType, amount: number) => {
    return {
      ...state,
      health: Math.max(0, state.health - amount)
    };
  }
});

// Register trigger
triggerRegistry.registerTriggerType(damageTrigger);

// Create state with initial values
const playerState = createState({
  id: "player",
  initialState: {
    health: 100,
    maxHealth: 100,
    position: { x: 0, y: 0, z: 0 },
    isMoving: false
  },
  triggers: ["custom:onDamage"]
});

// Example usage
function playDemo() {
  console.log("Initial player state:", playerState.getState());
  
  // Update state directly
  playerState.setState({ isMoving: true });
  console.log("After setting isMoving:", playerState.getState());
  
  // Use action generated from the trigger
  playerState.action.damage(10);
  console.log("After taking damage:", playerState.getState());
  
  // Reset to initial state
  playerState.reset();
  console.log("After reset:", playerState.getState());
  
  // Batch multiple updates
  playerState.batch([
    state => ({ health: state.health - 20 }),
    state => ({ position: { ...state.position, x: 10, y: 5 } })
  ]);
  console.log("After batch update:", playerState.getState());
}

// Export for potential use in tests or other examples
export { playerState, playDemo }; 