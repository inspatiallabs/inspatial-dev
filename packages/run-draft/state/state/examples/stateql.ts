/**
 * # StateQL Example
 * @summary #### Demonstrates the expressive template literal syntax for state updates
 * 
 * This example shows how to use StateQL for more natural state updates.
 */

import { createState, stateQL, createStateQL } from "../index";

// --- Game state example ---

interface PlayerType {
  health: number;
  mana: number;
  position: { x: number; y: number; z: number };
  inventory: Array<{ id: string; name: string; quantity: number }>;
  effects: string[];
  stats: {
    strength: number;
    agility: number;
    intelligence: number;
  };
  status: string;
  lastUpdated: number;
}

// Create a state and enhance it with StateQL
const playerState = stateQL(createState<PlayerType>({
  id: "player",
  initialState: {
    health: 100,
    mana: 80,
    position: { x: 0, y: 0, z: 0 },
    inventory: [],
    effects: [],
    stats: {
      strength: 10,
      agility: 8,
      intelligence: 12
    },
    status: "idle",
    lastUpdated: Date.now()
  }
}));

// Alternative direct creation with StateQL
const enemyState = createStateQL<PlayerType>({
  id: "enemy",
  initialState: {
    health: 80,
    mana: 60,
    position: { x: 10, y: 0, z: 0 },
    inventory: [],
    effects: [],
    stats: {
      strength: 12,
      agility: 7,
      intelligence: 5
    },
    status: "idle",
    lastUpdated: Date.now()
  }
});

// --- Demo functions ---

/**
 * Demonstrate traditional vs. StateQL updates
 */
export function runStateQLComparisonDemo(): void {
  console.log("=== StateQL vs Traditional Updates ===");
  console.log("Initial player state:", playerState.get());
  
  // --- Traditional updates ---
  
  console.log("\n--- Traditional Updates ---");
  
  // Single property update
  playerState.update({ health: 90 });
  console.log("After health update:", playerState.get().health);
  
  // Multiple property update
  playerState.update({
    mana: 70,
    status: "damaged"
  });
  console.log("After multiple updates:", {
    mana: playerState.get().mana,
    status: playerState.get().status
  });
  
  // Functional update
  playerState.update(state => ({
    health: state.health - 10,
    lastUpdated: Date.now()
  }));
  console.log("After functional update:", playerState.get().health);
  
  // --- StateQL updates ---
  
  console.log("\n--- StateQL Updates ---");
  
  // Simple property update
  playerState.update`health = 80`;
  console.log("After template update:", playerState.get().health);
  
  // Arithmetic update
  playerState.update`health -= 10`;
  console.log("After arithmetic update:", playerState.get().health);
  
  // Multiple property update with comma separation
  playerState.update`
    health = 100,
    mana = 100,
    status = "healed"
  `;
  console.log("After multi-property update:", {
    health: playerState.get().health,
    mana: playerState.get().mana,
    status: playerState.get().status
  });
  
  // Interpolated values
  const damageAmount = 25;
  playerState.update`health -= ${damageAmount}`;
  console.log("After interpolated update:", playerState.get().health);
  
  // Array operations
  const newEffect = "burning";
  playerState.update`effects.push(${newEffect})`;
  console.log("After array push:", playerState.get().effects);
  
  // Deep path updates
  playerState.update`stats.strength += 5`;
  console.log("After deep path update:", playerState.get().stats.strength);
  
  // Complex conditional update
  playerState.update`
    if (health < 90) {
      status = "critical",
      effects.push(${"wounded"})
    } else {
      status = "normal"
    }
  `;
  console.log("After conditional update:", {
    health: playerState.get().health,
    status: playerState.get().status,
    effects: playerState.get().effects
  });
  
  // Multiple operations at once
  const moveX = 5;
  const moveY = 3;
  playerState.update`
    position.x += ${moveX},
    position.y += ${moveY},
    lastUpdated = ${Date.now()}
  `;
  console.log("After complex update:", {
    position: playerState.get().position,
    lastUpdated: playerState.get().lastUpdated
  });
}

/**
 * Demonstrate game combat with StateQL
 */
export function runCombatDemo(): void {
  console.log("\n=== Combat Demo with StateQL ===");
  
  // Reset states for the demo
  playerState.update`
    health = 100,
    mana = 80,
    effects = [],
    status = "ready"
  `;
  
  enemyState.update`
    health = 80,
    mana = 60,
    effects = [],
    status = "aggressive"
  `;
  
  console.log("Initial states:");
  console.log("Player:", {
    health: playerState.get().health,
    status: playerState.get().status
  });
  console.log("Enemy:", {
    health: enemyState.get().health,
    status: enemyState.get().status
  });
  
  // Start combat
  console.log("\n--- Combat begins ---");
  
  // Player casts a spell
  const spellDamage = 20;
  const manaCost = 15;
  
  playerState.update`
    mana -= ${manaCost},
    status = "casting"
  `;
  
  enemyState.update`
    health -= ${spellDamage},
    effects.push(${"burning"}),
    status = if (health < 70) { "wounded" } else { "angry" }
  `;
  
  console.log("After player spell:");
  console.log("Player:", {
    mana: playerState.get().mana,
    status: playerState.get().status
  });
  console.log("Enemy:", {
    health: enemyState.get().health,
    effects: enemyState.get().effects,
    status: enemyState.get().status
  });
  
  // Enemy attacks
  const enemyDamage = 15;
  
  enemyState.update`status = "attacking"`;
  
  playerState.update`
    health -= ${enemyDamage},
    if (health < 90) {
      status = "injured",
      effects.push(${"bleeding"})
    }
  `;
  
  console.log("\nAfter enemy attack:");
  console.log("Player:", {
    health: playerState.get().health,
    status: playerState.get().status,
    effects: playerState.get().effects
  });
  
  // Player uses healing potion
  const healingAmount = 30;
  const healthCap = 100;
  
  playerState.update`
    inventory.push(${{ id: "potion", name: "Healing Potion", quantity: 1 }}),
    health = ${Math.min(playerState.get().health + healingAmount, healthCap)},
    effects = effects.filter(e => e !== "bleeding"),
    status = "healed"
  `;
  
  console.log("\nAfter using healing potion:");
  console.log("Player:", {
    health: playerState.get().health,
    status: playerState.get().status,
    effects: playerState.get().effects,
    inventory: playerState.get().inventory
  });
}

// Export state for testing
export { playerState, enemyState }; 