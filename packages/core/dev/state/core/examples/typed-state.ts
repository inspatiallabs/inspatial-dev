/**
 * # Typed State Example
 * @summary #### Demonstrates using state with InSpatial's type validation
 * 
 * This example shows how to use the type system to validate state updates.
 */

import { createState } from "../index.ts";
import { StateTypes } from "../validation.ts";
import { type, toJsonSchema } from "../../../type/src/index.ts";

// --- Basic counter with type validation ---

// Create a counter state with basic type validation
const counterState = createState({
  id: "counter",
  initialState: { count: 0 },
  // Use predefined counter type
  type: StateTypes.Counter
});

// --- User profile with custom type validation ---

// Define a custom user profile type
const UserProfileType = type({
  username: "string|minLength(3)|maxLength(20)",
  email: "string|regex(/@.+\\..+$/)",
  age: "number|>=18|<=120", 
  preferences: {
    theme: "'light'|'dark'|'system'",
    notifications: "boolean",
    language: "'en'|'es'|'fr'|'de'|'ja'|'zh'"
  },
  socialProfiles: "object[]|?()"
});

// Create a user profile state with the custom type
const userProfileState = createState({
  id: "userProfile",
  initialState: {
    username: "user1",
    email: "user@example.com",
    age: 25,
    preferences: {
      theme: "light",
      notifications: true,
      language: "en"
    },
    socialProfiles: []
  },
  type: UserProfileType
});

// --- Game entity with complex validation ---

// Game entity type with nested validation
const GameEntityType = type({
  id: "string",
  position: {
    x: "number",
    y: "number",
    z: "number"
  },
  rotation: {
    x: "number",
    y: "number",
    z: "number",
    w: "number"
  },
  scale: {
    x: "number|>0",
    y: "number|>0",
    z: "number|>0"
  },
  health: "number|>=0|<=100",
  status: "'idle'|'active'|'damaged'|'dead'",
  tags: "string[]",
  inventory: "object[]"
});

// Create a game entity state with the complex type
const gameEntityState = createState({
  id: "gameEntity",
  initialState: {
    id: "entity-001",
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
    scale: { x: 1, y: 1, z: 1 },
    health: 100,
    status: "idle",
    tags: ["player", "character"],
    inventory: []
  },
  type: GameEntityType
});

// --- Game entity with validation disabled ---

// Create another game entity but with validation disabled
const nonValidatedEntityState = createState({
  id: "nonValidatedEntity",
  initialState: {
    id: "entity-002",
    position: { x: 0, y: 0, z: 0 },
    health: 100
  },
  type: GameEntityType
}, {
  validateType: false // Disable validation
});

// --- Demo functions ---

/**
 * Demonstrate valid and invalid state updates
 */
export function runTypeValidationDemo(): void {
  console.log("=== Type Validation Demo ===");
  
  // --- Counter state validation ---
  console.log("\n--- Counter State Validation ---");
  
  // Valid update - type check passes
  counterState.update({ count: 5 });
  console.log("Valid counter update:", counterState.get());
  
  try {
    // Invalid update - type check should fail
    counterState.update({ count: "invalid" as any });
  } catch (error) {
    console.error("Invalid counter update caught:", error);
  }
  
  // --- User profile validation ---
  console.log("\n--- User Profile Validation ---");
  
  // Valid update
  userProfileState.update({ 
    username: "newuser",
    age: 30 
  });
  console.log("Valid user update:", userProfileState.get());
  
  try {
    // Invalid update - username too short
    userProfileState.update({ username: "a" });
  } catch (error) {
    console.error("Invalid username update caught:", error);
  }
  
  try {
    // Invalid update - invalid email format
    userProfileState.update({ email: "invalid-email" });
  } catch (error) {
    console.error("Invalid email update caught:", error);
  }
  
  try {
    // Invalid update - age out of range
    userProfileState.update({ age: 150 });
  } catch (error) {
    console.error("Invalid age update caught:", error);
  }
  
  // --- Game entity validation ---
  console.log("\n--- Game Entity Validation ---");
  
  // Valid update
  gameEntityState.update({ 
    position: { x: 10, y: 5, z: 2 },
    health: 80,
    status: "active"
  });
  console.log("Valid game entity update:", gameEntityState.get());
  
  try {
    // Invalid update - negative health
    gameEntityState.update({ health: -10 });
  } catch (error) {
    console.error("Invalid health update caught:", error);
  }
  
  try {
    // Invalid update - invalid status
    gameEntityState.update({ status: "sleeping" as any });
  } catch (error) {
    console.error("Invalid status update caught:", error);
  }
  
  // --- Non-validated entity ---
  console.log("\n--- Non-Validated Entity ---");
  
  // This update would normally fail validation, but validation is disabled
  nonValidatedEntityState.update({ 
    health: -50, // Would normally be invalid
    status: "unknown" // Would normally be invalid
  });
  console.log("Invalid update passed with validation disabled:", nonValidatedEntityState.get());
}

/**
 * Show JSON Schema generation for documentation
 */
export function showTypeSchema(): void {
  console.log("=== Type Schema Generation ===");
  
  // Generate JSON Schema for the user profile type
  const userProfileSchema = toJsonSchema(UserProfileType, {
    title: "User Profile Schema",
    description: "Validation schema for user profile data"
  });
  
  console.log(JSON.stringify(userProfileSchema, null, 2));
}

// Export state instances for testing
export { counterState, userProfileState, gameEntityState, nonValidatedEntityState }; 