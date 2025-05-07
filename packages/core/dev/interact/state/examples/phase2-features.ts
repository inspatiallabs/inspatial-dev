/**
 * # Phase 2 Features Example
 * @summary #### Demonstrates advanced state management capabilities
 * 
 * This example shows how to use the Phase 2 features of the InSpatial state system:
 * - Computed values with automatic dependency tracking
 * - Derived state that updates when source state changes
 * - Persistence of state across sessions
 * - Snapshot creation and restoration
 */

import { 
  createState, 
  createComputed,
  createComputedFromState,
  createComputedRecord,
  createDerivedState,
  createDerivedStateFromMultiple,
  createMergedState,
  createFilteredState,
  setupPersistence,
  clearPersistedState,
  createStateSnapshot,
  restoreStateSnapshot,
  diffStateSnapshots,
  setupInSpatialDBPersistence
} from "../index.ts";

// --- Computed Values ---

// Create a shopping cart state
const cartState = createState({
  id: "shoppingCart",
  initialState: {
    items: [
      { id: "item1", name: "T-Shirt", price: 19.99, quantity: 2 },
      { id: "item2", name: "Jeans", price: 39.99, quantity: 1 }
    ],
    taxRate: 0.08,
    discountCode: null
  }
});

// Create a computed value that calculates the subtotal
const subtotal = createComputedFromState(cartState, state => {
  return state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

// Create a computed value that depends on another computed value
const totalWithTax = createComputed(() => {
  const baseSubtotal = subtotal();
  return baseSubtotal + (baseSubtotal * cartState.get().taxRate);
});

// Create multiple computed values at once with a record
const cartMetrics = createComputedRecord(cartState, {
  itemCount: state => state.items.reduce((count, item) => count + item.quantity, 0),
  averagePrice: state => {
    const total = state.items.reduce((sum, item) => sum + item.price, 0);
    return total / state.items.length;
  },
  hasDiscount: state => state.discountCode !== null
});

// Log initial computed values
console.log("Subtotal:", subtotal());
console.log("Total with tax:", totalWithTax());
console.log("Cart metrics:", {
  itemCount: cartMetrics().itemCount,
  averagePrice: cartMetrics().averagePrice,
  hasDiscount: cartMetrics().hasDiscount
});

// Update the cart state
cartState.update(state => ({
  items: [
    ...state.items,
    { id: "item3", name: "Hat", price: 14.99, quantity: 1 }
  ]
}));

// Computed values automatically update
console.log("Updated subtotal:", subtotal());
console.log("Updated total with tax:", totalWithTax());

// --- Derived State ---

// Create a user state
const userState = createState({
  id: "user",
  initialState: {
    id: "user123",
    name: "John Doe",
    email: "john@example.com",
    preferences: {
      theme: "dark",
      notifications: true,
      language: "en"
    },
    roles: ["user"]
  }
});

// Create a derived state that only includes public profile information
const publicProfileState = createFilteredState(
  userState,
  ["id", "name"]
);

// Create a derived state with transformed data
const userSettingsState = createDerivedState(
  userState,
  userState => ({
    theme: userState.preferences.theme,
    notifications: userState.preferences.notifications,
    language: userState.preferences.language,
    isAdmin: userState.roles.includes("admin")
  })
);

// Create app settings state
const appSettingsState = createState({
  id: "appSettings",
  initialState: {
    version: "1.0.0",
    lastUpdated: "2023-06-15",
    features: {
      darkMode: true,
      offlineMode: false
    }
  }
});

// Create a derived state that combines multiple source states
const appConfigState = createDerivedStateFromMultiple(
  [userSettingsState, appSettingsState],
  ([userSettings, appSettings]) => ({
    theme: userSettings.theme,
    language: userSettings.language,
    version: appSettings.version,
    darkModeAvailable: appSettings.features.darkMode,
    isAdmin: userSettings.isAdmin
  })
);

// Log derived states
console.log("Public profile:", publicProfileState.get());
console.log("User settings:", userSettingsState.get());
console.log("App config:", appConfigState.get());

// Update the user state
userState.update({
  roles: ["user", "admin"],
  preferences: {
    ...userState.get().preferences,
    theme: "light"
  }
});

// Derived states automatically update
console.log("Updated public profile:", publicProfileState.get());
console.log("Updated user settings:", userSettingsState.get());
console.log("Updated app config:", appConfigState.get());

// --- State Persistence ---

// Create a persistent state that will be saved to localStorage
const preferencesState = createState({
  id: "preferences",
  initialState: {
    theme: "system",
    fontSize: "medium",
    reducedMotion: false,
    lastVisited: new Date().toISOString()
  }
});

// Set up persistence
const cleanupPersistence = setupPersistence(preferencesState, {
  storage: "localStorage",
  key: "app_preferences",
  autoSave: true,
  include: ["theme", "fontSize", "reducedMotion"] // Excludes lastVisited from persistence
});

// Update preferences
preferencesState.update({
  theme: "dark",
  reducedMotion: true
});

// In a real app, the state would be loaded when the app starts
console.log("Preferences (saved to localStorage):", preferencesState.get());

// Clean up when component unmounts
// cleanupPersistence();

// --- State Snapshots ---

// Create a game state for snapshot demonstration
const gameState = createState({
  id: "gameState",
  initialState: {
    player: {
      health: 100,
      position: { x: 0, y: 0, z: 0 },
      inventory: ["sword", "health_potion"]
    },
    level: 1,
    enemies: [
      { id: "enemy1", health: 50, position: { x: 10, y: 0, z: 5 } },
      { id: "enemy2", health: 30, position: { x: -8, y: 0, z: 3 } }
    ],
    checkpoints: []
  }
});

// Create a snapshot of the initial state
const initialGameSnapshot = createStateSnapshot(gameState);

// Update the game state to simulate gameplay
gameState.update(state => ({
  player: {
    ...state.player,
    health: 75,
    position: { x: 5, y: 0, z: 2 },
    inventory: [...state.player.inventory, "gold_key"]
  },
  enemies: [
    { ...state.enemies[0], health: 20 },
    { ...state.enemies[1], health: 0 } // Second enemy defeated
  ],
  checkpoints: ["checkpoint1"]
}));

console.log("Game state after playing:", gameState.get());

// Find what changed between snapshots
const currentGameSnapshot = createStateSnapshot(gameState);
const differences = diffStateSnapshots(initialGameSnapshot, currentGameSnapshot);

console.log("Changes since game start:", differences);

// Restore to initial state (like restarting a level)
restoreStateSnapshot(gameState, initialGameSnapshot);
console.log("Game state after restore:", gameState.get());

// --- InSpatialDB Integration Example ---

// Create a state that will be persisted with InSpatialDB
const userProfileState = createState({
  id: "userProfile",
  initialState: {
    userId: "12345",
    displayName: "JaneDoe",
    email: "jane@example.com",
    preferences: {
      notifications: true,
      privateProfile: false
    },
    lastLogin: new Date().toISOString()
  }
});

// Set up persistence with InSpatialDB adapter (currently a placeholder)
const cleanupInSpatialDBPersistence = setupInSpatialDBPersistence(userProfileState, {
  key: "user:12345:profile",
  // Using the InSpatialDB-specific options directly
  replication: { 
    enabled: true, 
    syncInterval: 60000, // sync every minute
    priority: "high"
  },
  conflictResolution: "clientWins",
  encryption: { 
    enabled: true, 
    level: "high"
  },
  collections: ["users", "profiles"],
  indexes: ["userId", "email"]
});

// Update the user profile
userProfileState.update({
  displayName: "JaneDoeCoder",
  preferences: {
    ...userProfileState.get().preferences,
    privateProfile: true
  }
});

console.log("User profile (saved to InSpatialDB):", userProfileState.get());

// Export for testing
export {
  cartState, subtotal, totalWithTax, cartMetrics,
  userState, publicProfileState, userSettingsState,
  appSettingsState, appConfigState,
  preferencesState,
  gameState, initialGameSnapshot,
  userProfileState
}; 