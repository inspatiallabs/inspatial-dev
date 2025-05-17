/**
 * @file registry.ts
 * @description Trigger registry system
 */

// @ts-ignore - Ignoring TS extension import error
import {
  ErrorCodeEnum,
  LogSeverityEnum,
  PlatformType,
  HierarchicalPlatformType,
  TriggerCategoryEnum,
  TriggerDefinitionMetadataType,
  RegisteredTriggerType,
} from "./types.ts";
// @ts-ignore - Ignoring TS extension import error
import { TriggerValidatorClass, errorLogger, TriggerErrorClass } from "./errors.ts";
import "./env.ts"; // Ensure global __DEV__ constant is initialized

/**
 * Trigger registry manager
 */
export class TriggerRegistryClass {
  private static instance: TriggerRegistryClass;
  private triggerRegistry: Record<string, TriggerDefinitionMetadataType> = {};
  private triggersByCategory: Record<TriggerCategoryEnum, string[]> =
    Object.values(TriggerCategoryEnum).reduce(
      (acc, category) => {
        acc[category as TriggerCategoryEnum] = [];
        return acc;
      },
      {} as Record<TriggerCategoryEnum, string[]>
    );

  private constructor() {
    this.initializeBuiltInTriggers();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): TriggerRegistryClass {
    if (!TriggerRegistryClass.instance) {
      TriggerRegistryClass.instance = new TriggerRegistryClass();
    }
    return TriggerRegistryClass.instance;
  }

  /**
   * Register a trigger type definition
   */
  public registerTriggerType(definition: TriggerDefinitionMetadataType): void {
    // Validate definition
    TriggerValidatorClass.nonEmptyString(definition.id, "definition.id");
    TriggerValidatorClass.required(definition.category, "definition.category");
    TriggerValidatorClass.required(
      definition.compatiblePlatforms,
      "definition.compatiblePlatforms"
    );

    // Add to registry
    this.triggerRegistry[definition.id] = definition;

    // Add to category index
    const category = definition.category as TriggerCategoryEnum;
    if (!this.triggersByCategory[category]) {
      this.triggersByCategory[category] = [];
    }
    this.triggersByCategory[category].push(definition.id);

    // Log registration
    errorLogger.info(`Registered trigger type: ${definition.id}`, {
      category: definition.category,
      platforms: definition.compatiblePlatforms,
    });
  }

  /**
   * Get all registered trigger types
   */
  public getTriggerTypes(): Record<string, TriggerDefinitionMetadataType> {
    return { ...this.triggerRegistry };
  }

  /**
   * Get trigger definition by ID
   */
  public getTriggerType(id: string): TriggerDefinitionMetadataType | undefined {
    return this.triggerRegistry[id];
  }

  /**
   * Get trigger types by category
   */
  public getTriggerTypesByCategory(
    category: TriggerCategoryEnum
  ): TriggerDefinitionMetadataType[] {
    const triggerIds = this.triggersByCategory[category] || [];
    return triggerIds.map((id) => this.triggerRegistry[id]).filter(Boolean) as TriggerDefinitionMetadataType[];
  }

  /**
   * Check if a trigger is compatible with a platform
   */
  public isTriggerCompatibleWithPlatform(
    triggerId: string,
    platform: PlatformType | HierarchicalPlatformType
  ): boolean {
    const triggerDef = this.triggerRegistry[triggerId];
    if (!triggerDef) return false;

    // Direct match
    if (triggerDef.compatiblePlatforms.includes(platform)) {
      return true;
    }

    // Extract base platform for hierarchical platforms
    if (typeof platform === "string" && platform.includes(":")) {
      const basePlatform = platform.split(":")[0] as PlatformType;
      return triggerDef.compatiblePlatforms.includes(basePlatform);
    }

    return false;
  }

  /**
   * Initialize all built-in triggers
   */
  private initializeBuiltInTriggers(): void {
    // Touch Triggers
    this.registerTouchTriggers();

    // Sensor Triggers
    this.registerSensorTriggers();

    // Mouse Triggers
    this.registerMouseTriggers();

    // Keyboard Triggers
    this.registerKeyboardTriggers();

    // Scene Triggers
    this.registerSceneTriggers();

    // Logic Triggers
    this.registerLogicTriggers();

    // Area Triggers
    this.registerAreaTriggers();

    // Generic Triggers
    this.registerGenericTriggers();

    // Gesture Triggers
    this.registerGestureTriggers();

    // Time Triggers
    this.registerTimeTriggers();

    errorLogger.info(
      `Initialized ${Object.keys(this.triggerRegistry).length} built-in triggers`
    );
  }

  /**
   * Register touch triggers
   */
  private registerTouchTriggers(): void {
    // Touch Triggers
    this.registerTriggerType({
      id: "onTouch",
      name: "On Touch",
      category: TriggerCategoryEnum.TOUCH,
      description: "Triggered when an object is touched",
      compatiblePlatforms: [
        "dom",
        "native",
        "native:ios",
        "native:android",
        "native:visionos",
        "inreal",
      ],
    });

    this.registerTriggerType({
      id: "onDoubleTap",
      name: "On Double Tap",
      category: TriggerCategoryEnum.TOUCH,
      description: "Triggered on double tap/touch",
      compatiblePlatforms: [
        "dom",
        "native",
        "native:ios",
        "native:android",
        "inreal",
      ],
    });

    this.registerTriggerType({
      id: "onPinch",
      name: "On Pinch",
      category: TriggerCategoryEnum.TOUCH,
      description: "Triggered on pinch gesture",
      compatiblePlatforms: [
        "dom",
        "native:ios",
        "native:android",
        "native:visionos",
        "inreal",
      ],
    });

    this.registerTriggerType({
      id: "onDrag",
      name: "On Drag",
      category: TriggerCategoryEnum.TOUCH,
      description: "Triggered when dragging an object",
      compatiblePlatforms: ["dom", "native", "inreal"],
    });

    this.registerTriggerType({
      id: "onTouchRelease",
      name: "On Touch Release",
      category: TriggerCategoryEnum.TOUCH,
      description: "Triggered when touch/hold is released",
      compatiblePlatforms: ["dom", "native", "inreal"],
    });

    this.registerTriggerType({
      id: "onSwipe",
      name: "On Swipe",
      category: TriggerCategoryEnum.TOUCH,
      description: "Triggered on swipe gesture",
      compatiblePlatforms: ["dom", "native", "inreal"],
      parameters: [
        {
          name: "direction",
          type: "string",
          description: "Swipe direction",
          required: false,
          default: "any",
          options: ["left", "right", "up", "down", "any"],
        },
      ],
    });
  }

  /**
   * Register sensor triggers
   */
  private registerSensorTriggers(): void {
    // Just a few examples
    this.registerTriggerType({
      id: "onVoiceCommand",
      name: "On Voice Command",
      category: TriggerCategoryEnum.SENSOR,
      description: "Triggered by voice recognition",
      compatiblePlatforms: [
        "native:ios",
        "native:android",
        "native:visionos",
        "inreal",
      ],
    });

    this.registerTriggerType({
      id: "onDeviceMotion",
      name: "On Device Motion",
      category: TriggerCategoryEnum.SENSOR,
      description: "Triggered by device movement",
      compatiblePlatforms: ["dom", "native:ios", "native:android"],
    });
  }

  /**
   * Register mouse triggers
   */
  private registerMouseTriggers(): void {
    this.registerTriggerType({
      id: "onMouseClick",
      name: "On Mouse Click",
      category: TriggerCategoryEnum.MOUSE,
      description: "Triggered on mouse click",
      compatiblePlatforms: ["dom", "inreal"],
    });

    this.registerTriggerType({
      id: "onMouseHover",
      name: "On Mouse Hover",
      category: TriggerCategoryEnum.MOUSE,
      description: "Triggered when mouse hovers over object",
      compatiblePlatforms: ["dom", "inreal"],
    });

    // Add other mouse triggers
  }

  /**
   * Register keyboard triggers
   */
  private registerKeyboardTriggers(): void {
    this.registerTriggerType({
      id: "onKeyPress",
      name: "On Key Press",
      category: TriggerCategoryEnum.KEYBOARD,
      description: "Triggered when key is pressed",
      compatiblePlatforms: ["dom", "inreal"],
      parameters: [
        {
          name: "key",
          type: "string",
          description: "Key to detect",
          required: false,
          default: "any",
        },
      ],
    });

    this.registerTriggerType({
      id: "onKeyDown",
      name: "On Key Down",
      category: TriggerCategoryEnum.KEYBOARD,
      description: "Triggered when a key is pressed down",
      compatiblePlatforms: ["dom", "inreal"],
    });

    this.registerTriggerType({
      id: "onKeyUp",
      name: "On Key Up",
      category: TriggerCategoryEnum.KEYBOARD,
      description: "Triggered when a key is released",
      compatiblePlatforms: ["dom", "inreal"],
    });

    // Add other keyboard triggers
  }

  /**
   * Register scene triggers
   */
  private registerSceneTriggers(): void {
    this.registerTriggerType({
      id: "onStart",
      name: "On Start",
      category: TriggerCategoryEnum.SCENE,
      description: "Triggered when experience starts",
      compatiblePlatforms: ["dom", "native", "inreal"],
    });

    this.registerTriggerType({
      id: "onExit",
      name: "On Exit",
      category: TriggerCategoryEnum.SCENE,
      description: "Triggered when experience ends",
      compatiblePlatforms: ["dom", "native", "inreal"],
    });

    // Add other scene triggers
  }

  /**
   * Register logic triggers
   */
  private registerLogicTriggers(): void {
    this.registerTriggerType({
      id: "onVariantChange",
      name: "On Variant Change",
      category: TriggerCategoryEnum.LOGIC,
      description: "Triggered when a variant changes",
      compatiblePlatforms: ["dom", "native", "inreal"],
    });

    // Add other logic triggers
  }

  /**
   * Register area triggers
   */
  private registerAreaTriggers(): void {
    this.registerTriggerType({
      id: "onProximityEnter",
      name: "On Proximity Enter",
      category: TriggerCategoryEnum.AREA,
      description: "Triggered when entering proximity of an object",
      compatiblePlatforms: [
        "native:visionos",
        "native:androidxr",
        "native:horizonos",
        "inreal",
      ],
      parameters: [
        {
          name: "distance",
          type: "number",
          description: "Distance in meters",
          required: false,
          default: 2,
        },
      ],
    });

    // Add other area triggers
  }

  /**
   * Register generic triggers
   */
  private registerGenericTriggers(): void {
    this.registerTriggerType({
      id: "onAssetCollide",
      name: "On Asset Collide",
      category: TriggerCategoryEnum.GENERIC,
      description: "Triggered when objects collide",
      compatiblePlatforms: [
        "inreal",
        "native:visionos",
        "native:androidxr",
        "native:horizonos",
      ],
    });

    // Add other generic triggers
  }

  /**
   * Register gesture triggers
   */
  private registerGestureTriggers(): void {
    this.registerTriggerType({
      id: "onEyeGaze",
      name: "On Eye Gaze",
      category: TriggerCategoryEnum.GESTURE,
      description: "Triggered when user looks at object",
      compatiblePlatforms: ["native:visionos", "native:horizonos", "inreal"],
    });

    this.registerTriggerType({
      id: "onHandGesture",
      name: "On Hand Gesture",
      category: TriggerCategoryEnum.GESTURE,
      description: "Triggered on specific hand gesture",
      compatiblePlatforms: [
        "native:visionos",
        "native:androidxr",
        "native:horizonos",
        "inreal",
      ],
      parameters: [
        {
          name: "gesture",
          type: "string",
          description: "Hand gesture to detect",
          required: true,
          options: ["thumbsUp", "victory", "openPalm", "fist", "pointingIndex"],
        },
      ],
    });

    // Add other gesture triggers
  }

  /**
   * Register time triggers
   */
  private registerTimeTriggers(): void {
    this.registerTriggerType({
      id: "onWait",
      name: "On Wait",
      category: TriggerCategoryEnum.TIME,
      description: "Triggered after waiting for a duration",
      compatiblePlatforms: ["dom", "native", "inreal"],
      parameters: [
        {
          name: "duration",
          type: "number",
          description: "Wait duration in milliseconds",
          required: true,
          default: 1000,
        },
      ],
    });

    // Add other time triggers
  }
}

// Export singleton instance
export const triggerRegistry = TriggerRegistryClass.getInstance();

// Simple in-memory store for registered triggers
const triggerRegistryStore = new Map<string, RegisteredTriggerType<any, any>>();
// Optional: Store for metadata (if needed for validation or discovery)
const triggerMetadataStore = new Map<string, TriggerDefinitionMetadataType>(); 

/**
 * Registers a trigger definition with the central registry.
 *
 * @param trigger The trigger definition containing the name and action.
 * @param metadata Optional metadata about the trigger.
 * @throws {TriggerErrorClass} If a trigger with the same name is already registered.
 */
export function registerTrigger<S = any, P extends any[] = any[]>(
  trigger: RegisteredTriggerType<S, P>,
  metadata?: TriggerDefinitionMetadataType
): void {
  if (triggerRegistryStore.has(trigger.name)) {
    // Use TriggerErrorClass once errors.ts is refactored
    throw new Error(
      `Trigger with name "${trigger.name}" is already registered.`
      // ErrorCodeEnum.TRIGGER_ALREADY_REGISTERED (use enum later)
    );
  }
  
  // Basic validation
  if (!trigger || typeof trigger.name !== 'string' || !trigger.name) {
     throw new Error('Invalid trigger definition: name is required.');
  }
  if (typeof trigger.action !== 'function') {
     throw new Error(`Invalid trigger definition for "${trigger.name}": action must be a function.`);
  }

  triggerRegistryStore.set(trigger.name, trigger);

  // Expose to global (tests expect this)
  // deno-lint-ignore no-explicit-any
  const globalStore = (globalThis as any).__TRIGGER_STATE_ACTIONS__ ?? {};
  // deno-lint-ignore no-explicit-any
  (globalThis as any).__TRIGGER_STATE_ACTIONS__ = globalStore;
  globalStore[trigger.name] = trigger.action;

  if (metadata) {
     if (metadata.name !== trigger.name) {
       console.warn(`Metadata name "${metadata.name}" does not match trigger name "${trigger.name}". Storing metadata under trigger name.`);
       metadata = { ...metadata, name: trigger.name };
     }
     if (triggerMetadataStore.has(trigger.name)) {
        console.warn(`Metadata for trigger "${trigger.name}" already exists and will be overwritten.`);
     }
     triggerMetadataStore.set(trigger.name, metadata);
     // Also push into central TriggerRegistry so helper methods work
     try {
       triggerRegistry.registerTriggerType(metadata);
     } catch { /* ignore duplicates */ }
  }

  if (__DEV__) {
    console.log(`[TriggerRegistry] Registered trigger: ${trigger.name}`);
  }
}

/**
 * Retrieves a registered trigger definition by its name.
 *
 * @param name The unique name of the trigger.
 * @returns The registered trigger definition, or undefined if not found.
 */
export function getRegisteredTrigger(name: string): RegisteredTriggerType<any, any> | undefined {
  return triggerRegistryStore.get(name);
}

/**
 * Retrieves the metadata for a registered trigger by its name.
 *
 * @param name The unique name of the trigger.
 * @returns The trigger metadata, or undefined if not found or not provided during registration.
 */
export function getTriggerMetadata(name: string): TriggerDefinitionMetadataType | undefined {
  return triggerMetadataStore.get(name);
}

/**
 * Checks if a trigger with the given name is registered.
 *
 * @param name The name of the trigger.
 * @returns True if the trigger is registered, false otherwise.
 */
export function hasTrigger(name: string): boolean {
  return triggerRegistryStore.has(name) || !!triggerRegistry.getTriggerType(name);
}

/**
 * Returns a list of all registered trigger names.
 *
 * @returns An array of registered trigger names.
 */
export function listRegisteredTriggers(): string[] {
  return Array.from(triggerRegistryStore.keys());
}

/**
 * Clears all triggers from the registry. (Use with caution, primarily for testing).
 */
export function clearTriggerRegistry(): void {
  triggerRegistryStore.clear();
  triggerMetadataStore.clear();
  if (__DEV__) {
    console.warn("[TriggerRegistry] Registry cleared.");
  }
}

// Example Usage (Conceptual):
/*
registerTrigger({
  name: "player:onDamage",
  action: (state: { health: number }, amount: number) => {
    return { ...state, health: Math.max(0, state.health - amount) };
  }
});

const damageTrigger = getRegisteredTrigger("player:onDamage");
if (damageTrigger) {
  const initialState = { health: 100 };
  const newState = damageTrigger.action(initialState, 10);
  // newState = { health: 90 }
}
*/
