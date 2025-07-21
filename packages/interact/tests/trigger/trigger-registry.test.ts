/**
 * # Trigger Registry Tests
 * @file trigger-registry.test.ts
 * @description Tests for the trigger registry system
 * 
 * These tests verify the correct behavior of the trigger registry and registry-related functions.
 */

import { 
  describe, 
  it, 
  expect, 
  beforeEach, 
  afterEach 
} from "@inspatial/test";

import {
  triggerRegistry,
  registerTrigger,
  getRegisteredTrigger,
  hasTrigger,
  listRegisteredTriggers,
  clearTriggerRegistry
} from "../../trigger/src/registry.ts";

import {
  TriggerCategoryEnum,
  RegisteredTriggerType,
  HierarchicalPlatformType,
  PlatformType
} from "../../trigger/src/types.ts";

// Setup/cleanup utilities
let customTriggerNames: string[] = [];

describe("Trigger Registry", () => {
  /** Clean up any test triggers after each test */
  afterEach(() => {
    // Clean up any custom triggers we registered
    for (const triggerName of customTriggerNames) {
      // We can't directly remove individual triggers from the registry
      // but we can clear the registered state actions (in a real app you wouldn't do this)
      // @ts-ignore: Accessing private registry for test cleanup
      delete globalThis.__TRIGGER_STATE_ACTIONS__?.[triggerName];
    }
    customTriggerNames = [];
  });

  describe("registerTrigger", () => {
    it("should register a new trigger", () => {
      // Arrange
      const testTriggerName = "test:onTestEvent";
      const testTrigger: RegisteredTriggerType = {
        name: testTriggerName,
        action: (state: any) => state
      };
      customTriggerNames.push(testTriggerName);

      // Act
      registerTrigger(testTrigger);

      // Assert
      expect(hasTrigger(testTriggerName)).toBe(true);
    });

    it("should register a trigger with metadata", () => {
      // Arrange
      const testTriggerName = "test:onTestWithMetadata";
      const testTrigger: RegisteredTriggerType = {
        name: testTriggerName,
        action: (state: any) => state
      };
      const metadata = {
        id: testTriggerName,
        name: "Test Trigger With Metadata",
        category: TriggerCategoryEnum.CUSTOM,
        description: "A test trigger with metadata",
        compatiblePlatforms: ["dom", "native"] as Array<PlatformType | HierarchicalPlatformType>
      };
      customTriggerNames.push(testTriggerName);

      // Act
      registerTrigger(testTrigger, metadata);

      // Assert
      expect(hasTrigger(testTriggerName)).toBe(true);
      
      // Check if metadata was registered
      // @ts-ignore: Using internal API for testing
      const registeredMetadata = triggerRegistry.getTriggerType(testTriggerName);
      expect(registeredMetadata).toBeDefined();
      expect(registeredMetadata?.description).toBe("A test trigger with metadata");
    });

    it("should throw an error when registering a trigger with invalid name", () => {
      // Arrange
      const invalidTrigger: RegisteredTriggerType = {
        name: "",  // Empty name
        action: (state: any) => state
      };

      // Act & Assert
      expect(() => registerTrigger(invalidTrigger)).toThrow();
    });
  });

  describe("getRegisteredTrigger", () => {
    it("should return a registered trigger by name", () => {
      // Arrange
      const testTriggerName = "test:onGetRegistered";
      const testTrigger: RegisteredTriggerType = {
        name: testTriggerName,
        action: (state: any) => ({ ...state, testModification: true })
      };
      customTriggerNames.push(testTriggerName);
      registerTrigger(testTrigger);

      // Act
      const retrievedTrigger = getRegisteredTrigger(testTriggerName);

      // Assert
      expect(retrievedTrigger).toBeDefined();
      expect(retrievedTrigger?.name).toBe(testTriggerName);
      
      // Test that the action functions correctly
      const testState = { original: true };
      const modifiedState = retrievedTrigger?.action(testState);
      expect(modifiedState).toEqual({ original: true, testModification: true });
    });

    it("should return undefined for non-existent triggers", () => {
      // Act
      const nonExistentTrigger = getRegisteredTrigger("non:existent");

      // Assert
      expect(nonExistentTrigger).toBeUndefined();
    });
  });

  describe("hasTrigger", () => {
    it("should return true for existing triggers", () => {
      // Arrange
      const testTriggerName = "test:onHasTriggerTest";
      const testTrigger: RegisteredTriggerType = {
        name: testTriggerName,
        action: (state: any) => state
      };
      customTriggerNames.push(testTriggerName);
      registerTrigger(testTrigger);

      // Act & Assert
      expect(hasTrigger(testTriggerName)).toBe(true);
    });

    it("should return false for non-existent triggers", () => {
      // Act & Assert
      expect(hasTrigger("non:existent")).toBe(false);
    });
  });

  describe("listRegisteredTriggers", () => {
    it("should list all registered triggers", () => {
      // Arrange
      const testTriggers = [
        "test:onListTest1",
        "test:onListTest2",
        "test:onListTest3"
      ];

      for (const name of testTriggers) {
        registerTrigger({
          name,
          action: (state: any) => state
        });
        customTriggerNames.push(name);
      }

      // Act
      const triggerList = listRegisteredTriggers();

      // Assert
      for (const triggerName of testTriggers) {
        expect(triggerList).toContain(triggerName);
      }
    });
  });

  describe("Built-in triggers", () => {
    it("should have default touch triggers registered", () => {
      // Act & Assert
      expect(hasTrigger("onTouch")).toBe(true);
      expect(hasTrigger("onDoubleTap")).toBe(true);
      expect(hasTrigger("onPinch")).toBe(true);
    });

    it("should have default keyboard triggers registered", () => {
      // Act & Assert
      expect(hasTrigger("onKeyPress")).toBe(true);
      expect(hasTrigger("onKeyDown")).toBe(true);
      expect(hasTrigger("onKeyUp")).toBe(true);
    });
  });

  describe("Registry categorization", () => {
    it("should correctly categorize triggers", () => {
      // Arrange
      const testTriggerName = "test:onCategoryTest";
      const testTrigger: RegisteredTriggerType = {
        name: testTriggerName,
        action: (state: any) => state
      };
      const metadata = {
        id: testTriggerName,
        name: "Category Test Trigger",
        category: TriggerCategoryEnum.CUSTOM,
        description: "A test trigger for category testing",
        compatiblePlatforms: ["dom"] as Array<PlatformType | HierarchicalPlatformType>
      };
      customTriggerNames.push(testTriggerName);
      registerTrigger(testTrigger, metadata);

      // Act
      // @ts-ignore: Accessing private method for testing
      const categoryTriggers = triggerRegistry.getTriggerTypesByCategory(TriggerCategoryEnum.CUSTOM);

      // Assert
      const foundTrigger = categoryTriggers.find(t => t.id === testTriggerName);
      expect(foundTrigger).toBeDefined();
      expect(foundTrigger?.category).toBe(TriggerCategoryEnum.CUSTOM);
    });
  });

  describe("Platform compatibility", () => {
    it("should correctly identify platform compatibility", () => {
      // Arrange
      const testTriggerName = "test:onPlatformTest";
      const testTrigger: RegisteredTriggerType = {
        name: testTriggerName,
        action: (state: any) => state
      };
      const metadata = {
        id: testTriggerName,
        name: "Platform Test Trigger",
        category: TriggerCategoryEnum.CUSTOM,
        description: "A test trigger for platform compatibility",
        compatiblePlatforms: ["dom", "native:ios"] as Array<PlatformType | HierarchicalPlatformType>
      };
      customTriggerNames.push(testTriggerName);
      registerTrigger(testTrigger, metadata);

      // Act & Assert
      // @ts-ignore: Accessing private method for testing
      expect(triggerRegistry.isTriggerCompatibleWithPlatform(testTriggerName, "dom")).toBe(true);
      // @ts-ignore: Accessing private method for testing
      expect(triggerRegistry.isTriggerCompatibleWithPlatform(testTriggerName, "native:ios")).toBe(true);
      // @ts-ignore: Accessing private method for testing
      expect(triggerRegistry.isTriggerCompatibleWithPlatform(testTriggerName, "inreal")).toBe(false);
    });
  });
}); 