/**
 * # Trigger Monitoring Tests
 * @file trigger-monitoring.test.ts
 * @description Tests for trigger monitoring system
 * 
 * These tests verify the correct behavior of the trigger monitoring system,
 * which tracks performance and usage metrics for triggers.
 */

import { describe, it, expect, beforeEach, afterEach } from "@inspatial/test";

import {
  createTrigger,
  activateTrigger
} from "../../trigger/src/action.ts";

import { triggerPerformanceMonitor } from "../../trigger/src/monitoring.ts";

describe("Trigger Monitoring", () => {
  // Track registered triggers for cleanup
  const testTriggerNames: string[] = [];

  beforeEach(() => {
    // Reset the monitoring stats
    // @ts-ignore: Accessing internal method for testing
    if (typeof triggerPerformanceMonitor.resetStats === 'function') {
      // @ts-ignore: Accessing internal method for testing
      triggerPerformanceMonitor.resetStats();
    }
  });

  afterEach(() => {
    // Clean up test triggers
    // @ts-ignore: Accessing internal registry for cleanup
    for (const name of testTriggerNames) {
      // @ts-ignore: Accessing private registry
      delete globalThis.__TRIGGER_STATE_ACTIONS__?.[name];
    }
    testTriggerNames.length = 0;
  });

  describe("Performance Tracking", () => {
    it("should track trigger activations", () => {
      // Arrange
      const triggerName = "test:onMonitor";
      const initialState = { value: 0 };
      
      // Create a trigger
      const trigger = createTrigger({
        name: triggerName,
        action: (state: any, amount: number) => ({
          ...state,
          value: state.value + amount
        })
      });
      testTriggerNames.push(triggerName);
      
      // Act - Activate multiple times
      for (let i = 0; i < 5; i++) {
        activateTrigger(triggerName, initialState, i);
      }
      
      // Assert
      // @ts-ignore: Accessing internal method for testing
      const stats = triggerPerformanceMonitor.getStatsForTrigger(triggerName);
      expect(stats).toBeDefined();
      expect(stats.activationCount).toBe(5);
    });
    
    it("should track trigger execution time", () => {
      // Arrange
      const triggerName = "test:onMonitorTime";
      const initialState = { value: 0 };
      
      // Create a trigger with a delay
      const trigger = createTrigger({
        name: triggerName,
        action: (state: any) => {
          // Simulate a computation
          const start = Date.now();
          while (Date.now() - start < 5) {
            // Busy wait for at least 5ms
          }
          return { ...state, processed: true };
        }
      });
      testTriggerNames.push(triggerName);
      
      // Act
      activateTrigger(triggerName, initialState);
      
      // Assert
      // @ts-ignore: Accessing internal method for testing
      const stats = triggerPerformanceMonitor.getStatsForTrigger(triggerName);
      expect(stats).toBeDefined();
      expect(stats.averageExecutionTime).toBeGreaterThan(0);
    });
    
    it("should track errors during trigger execution", () => {
      // Arrange
      const triggerName = "test:onMonitorError";
      const initialState = { value: 0 };
      
      // Create a trigger that throws
      const trigger = createTrigger({
        name: triggerName,
        action: () => {
          throw new Error("Test monitoring error");
        }
      });
      testTriggerNames.push(triggerName);
      
      // Act
      try {
        activateTrigger(triggerName, initialState);
      } catch (e) {
        // Expected to throw
      }
      
      // Assert
      // @ts-ignore: Accessing internal method for testing
      const stats = triggerPerformanceMonitor.getStatsForTrigger(triggerName);
      expect(stats).toBeDefined();
      expect(stats.errorCount).toBe(1);
    });
  });
  
  describe("Global Stats", () => {
    it("should track global trigger statistics", () => {
      // Arrange
      const triggers = [
        "test:globalStats1",
        "test:globalStats2",
        "test:globalStats3"
      ];
      
      // Create triggers
      for (const name of triggers) {
        createTrigger({
          name,
          action: (state: any) => ({ ...state, processed: true })
        });
        testTriggerNames.push(name);
      }
      
      // Act - Activate each trigger
      const state = { processed: false };
      for (const name of triggers) {
        activateTrigger(name, state);
      }
      
      // Assert
      // @ts-ignore: Accessing internal method for testing
      const globalStats = triggerPerformanceMonitor.getGlobalStats();
      expect(globalStats).toBeDefined();
      expect(globalStats.totalActivations).toBeGreaterThanOrEqual(3);
      expect(globalStats.uniqueTriggersActivated).toBeGreaterThanOrEqual(3);
    });
  });
}); 