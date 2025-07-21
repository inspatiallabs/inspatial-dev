/**
 * # Advanced State Management Example
 * @summary #### Demonstrates Phase 2 state management features
 * 
 * This example shows how to use advanced features like:
 * - Computed values
 * - Persistence
 * - Derived state
 * - State composition
 */

import { 
  createState, 
  createComputed, 
  createDerivedState,
  setupPersistence,
  StorageAdapters
} from "../index.ts";

// --- User profile state with persistence ---

interface UserProfileType {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  avatar: string;
  preferences: {
    theme: "light" | "dark" | "system";
    notifications: boolean;
    language: string;
  }
}

// Create the user profile state
const userProfileState = createState<UserProfileType>({
  id: "userProfile",
  initialState: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    dateOfBirth: "1990-01-01",
    avatar: "default.png",
    preferences: {
      theme: "system",
      notifications: true,
      language: "en"
    }
  },
  // Add persistence configuration
  persist: {
    storage: "localStorage",
    key: "user_profile",
    autoSave: true,
    // Only store these specific fields
    include: ["firstName", "lastName", "email", "preferences"],
    // Add a save delay to prevent excessive saves
    saveInterval: 1000
  }
});

// Setup manual persistence controls
const { save: saveProfile, load: loadProfile } = setupPersistence(
  userProfileState,
  {
    storage: "indexedDB",
    key: "user_profile_backup",
    // Don't persist sensitive information
    exclude: ["dateOfBirth", "email"]
  }
);

// --- Computed values from user profile ---

// Create a computed full name
const fullName = createComputed(
  userProfileState,
  user => `${user.firstName} ${user.lastName}`
);

// Create multiple computed values at once
const userDisplayInfo = createComputed(userProfileState, user => ({
  initials: `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`,
  displayName: user.firstName,
  emailDomain: user.email.split('@')[1] || '',
  age: calculateAge(user.dateOfBirth)
}));

// Helper function to calculate age from date of birth
function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// --- Game state example ---

interface GameStateType {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  gold: number;
  inventory: Array<{ id: string; name: string; quantity: number }>;
}

// Create game state
const gameState = createState<GameStateType>({
  id: "gameState",
  initialState: {
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    gold: 0,
    inventory: []
  }
});

// --- Derived state with UI-specific data ---

// Create a derived state for UI display
const gameUIState = createDerivedState(
  gameState,
  game => ({
    healthPercentage: (game.health / game.maxHealth) * 100,
    manaPercentage: (game.mana / game.maxMana) * 100,
    experiencePercentage: (game.experience / game.experienceToNextLevel) * 100,
    isLowHealth: game.health < game.maxHealth * 0.3,
    itemCount: game.inventory.length,
    totalItems: game.inventory.reduce((sum, item) => sum + item.quantity, 0)
  })
);

// --- State composition example ---

// Settings state
interface SettingsType {
  showHUD: boolean;
  difficulty: "easy" | "normal" | "hard";
  volume: {
    master: number;
    music: number;
    sfx: number;
  };
  graphicsQuality: "low" | "medium" | "high" | "ultra";
}

const settingsState = createState<SettingsType>({
  id: "settings",
  initialState: {
    showHUD: true,
    difficulty: "normal",
    volume: {
      master: 0.8,
      music: 0.7,
      sfx: 1.0
    },
    graphicsQuality: "high"
  },
  persist: {
    storage: "localStorage",
    key: "game_settings",
    autoSave: true
  }
});

// Create a combined state for the game HUD that reacts to both game state and settings
import { createDerivedStateFromMultiple } from "../index";

const hudState = createDerivedStateFromMultiple(
  [gameState, settingsState, userProfileState],
  ([game, settings, user]) => ({
    // Only include what's needed for the HUD
    showHUD: settings.showHUD,
    playerName: `${user.firstName} ${user.lastName}`,
    healthBar: {
      current: game.health,
      max: game.maxHealth,
      percentage: (game.health / game.maxHealth) * 100,
      isLow: game.health < game.maxHealth * 0.3
    },
    manaBar: {
      current: game.mana,
      max: game.maxMana,
      percentage: (game.mana / game.maxMana) * 100,
      isLow: game.mana < game.maxMana * 0.3
    },
    experienceBar: {
      current: game.experience,
      max: game.experienceToNextLevel,
      percentage: (game.experience / game.experienceToNextLevel) * 100
    },
    level: game.level,
    gold: game.gold,
    // Apply difficulty settings to the display
    difficultyMultiplier: settings.difficulty === "easy" ? 1.5 :
                          settings.difficulty === "hard" ? 0.7 : 1.0
  })
);

// --- Demo functions ---

export function runUserProfileDemo() {
  console.log("=== User Profile Demo ===");
  console.log("Full name:", fullName());
  console.log("Display info:", userDisplayInfo());
  
  // Update user profile
  userProfileState.setState({
    firstName: "Jane",
    lastName: "Smith"
  });
  
  console.log("Updated full name:", fullName());
  console.log("Updated display info:", userDisplayInfo());
  
  // Manually save to IndexedDB backup
  saveProfile();
  console.log("Profile saved to backup storage");
}

export function runGameDemo() {
  console.log("=== Game State Demo ===");
  console.log("Game UI State:", gameUIState.getState());
  
  // Update game state
  gameState.setState({
    health: 30,
    experience: 75
  });
  
  console.log("Game UI State after updates:", gameUIState.getState());
  console.log("HUD State:", hudState.getState());
  
  // Change settings
  settingsState.setState({
    difficulty: "hard",
    showHUD: false
  });
  
  console.log("HUD State after settings change:", hudState.getState());
}

// Export for testing
export {
  userProfileState,
  gameState,
  gameUIState,
  settingsState,
  hudState,
  fullName,
  userDisplayInfo
}; 