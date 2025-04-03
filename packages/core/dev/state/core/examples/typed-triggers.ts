/**
 * # Typed Trigger Example
 * @summary #### Demonstrates using the typed trigger integration
 * 
 * This example shows how to use the typed trigger system to create
 * category-specific states with strongly-typed trigger integration.
 */

import { 
  TriggerCategoryEnum,
  RegisteredTriggerType
} from "../../trigger/src/types";

import {
  createTouchState,
  registerTypedTrigger,
  TouchTriggerState,
  createTypedActions,
  getCategoryTypeSchema,
  setupTriggerAwareInSpatialDBPersistence
} from "../typed-triggers";

// --- Creating a touch-specific state ---

// Create a touch state with specialized methods
const playerTouchState = createTouchState({
  id: "playerTouch",
  initialState: {
    touch: {
      position: { x: 0, y: 0 },
      active: false
    },
    player: {
      position: { x: 0, y: 0 },
      health: 100,
      score: 0
    }
  },
  // Optionally provide category-specific options
  categoryOptions: {
    autoTrack: true,
    enforceInterface: true
  }
});

// Use the specialized touch methods
const tapUnsubscribe = playerTouchState.onTap((x, y) => {
  console.log(`Tap detected at (${x}, ${y})`);
  
  // Move player to tap position
  playerTouchState.update(state => ({
    player: {
      ...state.player,
      position: { x, y }
    }
  }));
});

const swipeUnsubscribe = playerTouchState.onSwipe((direction) => {
  console.log(`Swipe detected: ${direction}`);
  
  // Example: Add points based on swipe direction
  playerTouchState.update(state => ({
    player: {
      ...state.player,
      score: state.player.score + (direction === 'up' ? 10 : 5)
    }
  }));
});

// --- Using typed trigger registration ---

// Define a type schema for tap payload validation
const tapPayloadSchema = {
  0: "number", // x coordinate
  1: "number"  // y coordinate
};

// Register a typed trigger with payload validation
const dashTrigger = registerTypedTrigger(
  "touch:dash",
  TriggerCategoryEnum.TOUCH,
  (state: TouchTriggerState, direction: 'left' | 'right', distance: number) => {
    if (!state.touch) return;
    
    // Extract current touch position
    const { x, y } = state.touch.position;
    
    // Calculate new position based on direction and distance
    const newX = direction === 'right' ? x + distance : x - distance;
    
    // Return updated state
    return {
      touch: {
        ...state.touch,
        position: { x: newX, y },
        active: true
      }
    };
  }
);

// Connect typed trigger to state
playerTouchState.connectTrigger(dashTrigger);

// --- Using typed actions ---

// Define typed action functions
const playerActions = createTypedActions(playerTouchState, {
  addScore: (state, points: number) => ({
    player: {
      ...state.player,
      score: state.player.score + points
    }
  }),
  
  takeDamage: (state, amount: number) => ({
    player: {
      ...state.player,
      health: Math.max(0, state.player.health - amount)
    }
  }),
  
  teleport: (state, x: number, y: number) => ({
    player: {
      ...state.player,
      position: { x, y }
    },
    touch: {
      ...state.touch,
      position: { x, y }
    }
  })
});

// Use the typed actions (fully type-safe)
playerActions.addScore(100);
playerActions.takeDamage(20);
playerActions.teleport(50, 75);

// --- Setting up InSpatialDB with trigger history ---

// Setup InSpatialDB persistence with trigger history tracking
const cleanupPersistence = setupTriggerAwareInSpatialDBPersistence(playerTouchState, {
  storage: "inspatialDB",
  key: "playerTouch",
  recordHistory: true,
  maxHistoryEntries: 100,
  includedCategories: [TriggerCategoryEnum.TOUCH],
  inspatialDB: {
    replication: { enabled: true },
    collections: ["playerStates"]
  }
});

// --- Trigger simulation ---

// Simulate some user interactions
console.log("Initial state:", playerTouchState.get());

// Simulate tap
playerTouchState.action.tap(10, 20);
console.log("After tap:", playerTouchState.get());

// Simulate swipe
playerTouchState.action.swipe("right");
console.log("After swipe:", playerTouchState.get());

// Simulate dash using our custom trigger
playerTouchState.action.dash("right", 30);
console.log("After dash:", playerTouchState.get());

// Simulate some actions
playerActions.addScore(200);
playerActions.takeDamage(15);
console.log("After actions:", playerTouchState.get());

// Export for testing
export {
  playerTouchState,
  playerActions,
  dashTrigger
}; 