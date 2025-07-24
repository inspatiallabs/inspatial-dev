/**
 * # Trigger Composition Example
 * @summary #### Shows how to compose complex workflows with triggers and state
 */

import { createState } from "../index.ts";
import { 
  createTrigger, 
  createTriggerSequence,
  triggerRegistry 
} from "../../trigger/src/index.ts";

// Game entity type
interface EnemyType {
  id: string;
  health: number;
  position: { x: number; y: number; z: number };
  isStunned: boolean;
  lastAttacked: number;
  attackCooldown: number;
  defense: number;
}

// Player state type
interface PlayerType {
  health: number;
  mana: number;
  position: { x: number; y: number; z: number };
  attackPower: number;
  inventory: Array<{ id: string; name: string; type: string }>;
}

// Utility functions
function inRange(player: PlayerType, enemy: EnemyType, range = 2): boolean {
  const dx = player.position.x - enemy.position.x;
  const dy = player.position.y - enemy.position.y;
  const dz = player.position.z - enemy.position.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return distance <= range;
}

function calculateDamage(attackPower: number, defense: number): number {
  return Math.max(1, attackPower - defense);
}

// Create individual triggers
const checkRangeTrigger = createTrigger({
  name: "combat:onRangeCheck",
  action: (state: PlayerType, enemy: EnemyType) => {
    // Check if in range for attack
    if (!inRange(state, enemy)) {
      console.log("Target not in range!");
      return { result: false, state };
    }
    return { result: true, state };
  }
});

const checkManaTrigger = createTrigger({
  name: "combat:onManaCheck",
  action: (state: PlayerType, enemy: EnemyType, manaCost = 10) => {
    // Check if we have enough mana
    if (state.mana < manaCost) {
      console.log("Not enough mana!");
      return { result: false, state };
    }
    return { result: true, state, manaCost };
  }
});

const attackTrigger = createTrigger({
  name: "combat:onAttack",
  action: (state: PlayerType, enemy: EnemyType, context: any) => {
    // Apply mana cost if this was part of a sequence
    const manaCost = context?.manaCost || 0;
    const newState = {
      ...state,
      mana: state.mana - manaCost
    };
    
    // Calculate and log damage
    const damage = calculateDamage(state.attackPower, enemy.defense);
    console.log(`Attacking for ${damage} damage!`);
    
    return newState;
  }
});

// Register individual triggers
triggerRegistry.registerTriggerType(checkRangeTrigger);
triggerRegistry.registerTriggerType(checkManaTrigger);
triggerRegistry.registerTriggerType(attackTrigger);

// Create a combat sequence by composing triggers
const combatSequence = createTriggerSequence([
  // First check if in range
  createTrigger({
    name: "sequence:rangeCheck",
    action: (state: PlayerType, enemy: EnemyType) => {
      if (!inRange(state, enemy)) {
        return { result: false, state, error: "Target not in range" };
      }
      return { result: true, state };
    }
  }),
  
  // Then check if enough mana
  createTrigger({
    name: "sequence:manaCheck",
    action: (state: PlayerType, enemy: EnemyType, manaCost = 15) => {
      if (state.mana < manaCost) {
        return { result: false, state, error: "Not enough mana" };
      }
      return { result: true, state, context: { manaCost } };
    }
  }),
  
  // Finally execute the attack
  createTrigger({
    name: "sequence:executeAttack",
    action: (state: PlayerType, enemy: EnemyType, context: any) => {
      // Apply mana cost
      const manaCost = context?.manaCost || 15;
      const damage = calculateDamage(state.attackPower, enemy.defense);
      
      console.log(`Combat sequence: Attacking ${enemy.id} for ${damage} damage! Used ${manaCost} mana.`);
      
      return {
        ...state,
        mana: state.mana - manaCost
      };
    }
  })
]);

// Register the sequence
triggerRegistry.registerTriggerType(combatSequence);

// Create player state
const playerState = createState({
  id: "player",
  initialState: {
    health: 100,
    mana: 50,
    position: { x: 0, y: 0, z: 0 },
    attackPower: 25,
    inventory: []
  },
  // Connect to individual triggers and the sequence
  triggers: ["combat:onRangeCheck", "combat:onManaCheck", "combat:onAttack", "sequence:combatSequence"]
});

// Example enemy for demo
const enemy: EnemyType = {
  id: "goblin1",
  health: 30,
  position: { x: 1, y: 0, z: 0 },
  isStunned: false,
  lastAttacked: 0,
  attackCooldown: 2000,
  defense: 5
};

// Demo function
function runCombatDemo() {
  console.log("=== COMBAT DEMO ===");
  console.log("Initial state:", playerState.getState());
  
  // Test individual attack
  console.log("\n--- Individual attack ---");
  const rangeResult = playerState.action.rangeCheck(enemy);
  if (rangeResult && rangeResult.result) {
    const manaResult = playerState.action.manaCheck(enemy, 10);
    if (manaResult && manaResult.result) {
      playerState.action.attack(enemy, { manaCost: 10 });
    }
  }
  
  console.log("State after individual attack:", playerState.getState());
  
  // Test the combat sequence
  console.log("\n--- Combat sequence ---");
  
  // This should work if player has enough mana and is in range
  playerState.action.combatSequence(enemy);
  
  console.log("State after combat sequence:", playerState.getState());
  
  // Move the enemy out of range
  const distantEnemy = { 
    ...enemy, 
    position: { x: 10, y: 10, z: 10 } 
  };
  
  console.log("\n--- Combat sequence with distant enemy ---");
  playerState.action.combatSequence(distantEnemy);
  
  console.log("Final state:", playerState.getState());
}

export { playerState, enemy, runCombatDemo }; 