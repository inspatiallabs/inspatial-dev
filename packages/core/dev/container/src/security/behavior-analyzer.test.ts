/**
 * Test suite for the Behavior Analysis Security System
 */

import { expect, test } from "@inspatial/test";
import { 
  BehaviorAnalyzer, 
  SecurityEventType, 
  SecurityLevel, 
  defaultRules,
  BehaviorRule,
  SecurityEvent,
  RuleContext
} from "./behavior-analyzer.ts";

// Define an EventEmitter interface matching what BehaviorAnalyzer expects
interface EventEmitterInterface {
  on(event: string | symbol, listener: (...args: any[]) => void): any;
  emit(event: string | symbol, ...args: any[]): boolean;
}

// Create a mock EventEmitter for testing
class MockEventEmitter implements EventEmitterInterface {
  events: Record<string, Array<(...args: any[]) => void>> = {};
  
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    const eventName = event.toString();
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(listener);
    return this;
  }
  
  emit(event: string | symbol, ...args: any[]): boolean {
    const eventName = event.toString();
    const listeners = this.events[eventName] || [];
    listeners.forEach(listener => listener(...args));
    return listeners.length > 0;
  }
}

// Extend BehaviorAnalyzer with mock event functionality for testing
function createMockAnalyzer(config: any): BehaviorAnalyzer & EventEmitterInterface {
  const analyzer = new BehaviorAnalyzer(config);
  const emitter = new MockEventEmitter();
  
  // Patch the event methods
  const analyzerAny = analyzer as any;
  analyzerAny.on = function(event: string | symbol, listener: (...args: any[]) => void) {
    return emitter.on.call(emitter, event, listener);
  };
  
  analyzerAny.emit = function(event: string | symbol, ...args: any[]) {
    return emitter.emit.call(emitter, event, ...args);
  };
  
  return analyzer as BehaviorAnalyzer & EventEmitterInterface;
}

// Mock event for testing
function createMockEvent(type: SecurityEventType, path: string = "/test/path", action: string = "read"): Omit<SecurityEvent, 'level' | 'message'> {
  return {
    type,
    timestamp: new Date(),
    containerName: "test-container",
    userId: 1000,
    action,
    path,
    details: {}
  };
}

test("BehaviorAnalyzer - initialization", () => {
  // Set up the analyzer with EventEmitter functionality
  const analyzer = createMockAnalyzer({
    historySize: 100,
    rules: defaultRules
  });
  
  expect(analyzer).toBeDefined();
  
  // EventEmitter methods should be available
  expect(typeof analyzer.on).toBe("function");
  expect(typeof analyzer.emit).toBe("function");
});

test("BehaviorAnalyzer - process non-suspicious event", () => {
  // Set up the analyzer with EventEmitter functionality
  const analyzer = createMockAnalyzer({
    historySize: 100,
    rules: []  // No rules, so nothing will be suspicious
  });
  
  let securityEventEmitted = false;
  analyzer.on('security-event', () => {
    securityEventEmitted = true;
  });
  
  const event = createMockEvent(SecurityEventType.FILE_ACCESS);
  const result = analyzer.processEvent(event);
  
  // Should not be suspicious with no rules
  expect(result).toBe(false);
  expect(securityEventEmitted).toBe(false);
});

test("BehaviorAnalyzer - process suspicious event", () => {
  const analyzer = createMockAnalyzer({
    historySize: 100,
    rules: [
      {
        id: "test-rule",
        name: "Test Rule",
        description: "Test rule for testing",
        eventTypes: [SecurityEventType.FILE_ACCESS],
        level: SecurityLevel.MEDIUM,
        enabled: true,
        evaluate: () => true, // Always triggers
        message: () => "Test rule triggered"
      }
    ]
  });
  
  let emittedEvent: SecurityEvent | undefined;
  
  analyzer.on('security-event', (event: SecurityEvent) => {
    emittedEvent = event;
  });
  
  // Process a test event
  const testEvent: Omit<SecurityEvent, 'level' | 'message'> = {
    type: SecurityEventType.FILE_ACCESS,
    timestamp: new Date(),
    containerName: "test-container",
    userId: 1000,
    action: "read",
    path: "/test.txt",
    details: {}
  };
  
  const result = analyzer.processEvent(testEvent);
  
  // Verify the event was detected as suspicious
  expect(result).toBe(true);
  
  // Verify the event was emitted
  expect(emittedEvent).toBeDefined();
  expect(emittedEvent?.level).toBe(SecurityLevel.MEDIUM);
  expect(emittedEvent?.message).toBe("Test rule triggered");
});

test("BehaviorAnalyzer - auto-blocking threshold", () => {
  // Create a rule that will trigger auto-blocking
  const criticalRule: BehaviorRule = {
    id: "critical-rule",
    name: "Critical Rule",
    description: "Rule that triggers auto-blocking",
    eventTypes: [SecurityEventType.FILE_ACCESS],
    level: SecurityLevel.CRITICAL,  // Critical level
    enabled: true,
    evaluate: () => true,  // Always triggers
    message: () => "Critical security violation"
  };
  
  // Set up the analyzer with EventEmitter functionality
  const analyzer = createMockAnalyzer({
    historySize: 100,
    rules: [criticalRule],
    autoBlockThreshold: SecurityLevel.CRITICAL  // Auto-block on CRITICAL
  });
  
  let autoBlockTriggered = false;
  
  analyzer.on('auto-block', () => {
    autoBlockTriggered = true;
  });
  
  // Process an event
  const event = createMockEvent(SecurityEventType.FILE_ACCESS);
  analyzer.processEvent(event);
  
  // Auto-block should have been triggered
  expect(autoBlockTriggered).toBe(true);
});

test("BehaviorAnalyzer - history management", () => {
  // Set up the analyzer with EventEmitter functionality
  const analyzer = createMockAnalyzer({
    historySize: 3,  // Small size to test trimming
    rules: []
  });
  
  // Add multiple events
  const event1 = createMockEvent(SecurityEventType.FILE_ACCESS, "/path1");
  const event2 = createMockEvent(SecurityEventType.FILE_ACCESS, "/path2");
  const event3 = createMockEvent(SecurityEventType.FILE_ACCESS, "/path3");
  const event4 = createMockEvent(SecurityEventType.FILE_ACCESS, "/path4");
  
  analyzer.processEvent(event1);
  analyzer.processEvent(event2);
  analyzer.processEvent(event3);
  analyzer.processEvent(event4);
  
  // Create a rule that will check the history
  const historyCheckRule: BehaviorRule = {
    id: "history-check",
    name: "History Check",
    description: "Check event history",
    eventTypes: [SecurityEventType.FILE_ACCESS],
    level: SecurityLevel.LOW,
    enabled: true,
    evaluate: (context: RuleContext) => {
      // Should only have the last 3 events (2, 3, and 4)
      return context.history.length === 3 && 
             !context.history.some((e: SecurityEvent) => e.path === "/path1") &&
             context.history.some((e: SecurityEvent) => e.path === "/path4");
    },
    message: () => "History check passed"
  };
  
  // Replace rules
  (analyzer as any).config.rules = [historyCheckRule];
  
  // Process another event to check history
  let historyCorrect = false;
  analyzer.on('security-event', () => {
    historyCorrect = true;
  });
  
  const checkEvent = createMockEvent(SecurityEventType.FILE_ACCESS, "/check");
  analyzer.processEvent(checkEvent);
  
  expect(historyCorrect).toBe(true);
});

test("BehaviorAnalyzer - rule with context state", () => {
  // Create a rule that uses state
  const statefulRule: BehaviorRule = {
    id: "state-test",
    name: "State Test Rule",
    description: "Rule that maintains state between evaluations",
    eventTypes: [SecurityEventType.FILE_ACCESS],
    level: SecurityLevel.MEDIUM,
    enabled: true,
    evaluate: (context) => {
      // Increment a counter in the rule state
      if (!context.state.counter) {
        context.state.counter = 0;
      }
      
      context.state.counter += 1;
      
      // Trigger when counter reaches 3
      return context.state.counter >= 3;
    },
    message: (context) => `State count: ${context.state.counter}`
  };
  
  // Set up the analyzer with EventEmitter functionality
  const analyzer = createMockAnalyzer({
    historySize: 100,
    rules: [statefulRule]
  });
  
  let emittedEvent: SecurityEvent | undefined;
  
  analyzer.on('security-event', (event: SecurityEvent) => {
    emittedEvent = event;
  });
  
  // Create a test event
  const testEvent: Omit<SecurityEvent, 'level' | 'message'> = {
    type: SecurityEventType.FILE_ACCESS,
    timestamp: new Date(),
    containerName: "test-container",
    userId: 1000,
    action: "read", 
    path: "/test.txt",
    details: {}
  };
  
  // First call - should not trigger
  let result = analyzer.processEvent(testEvent);
  expect(result).toBe(false);
  expect(emittedEvent).toBeUndefined();
  
  // Second call - should not trigger
  result = analyzer.processEvent(testEvent);
  expect(result).toBe(false);
  expect(emittedEvent).toBeUndefined();
  
  // Third call - should trigger
  result = analyzer.processEvent(testEvent);
  expect(result).toBe(true);
  expect(emittedEvent).toBeDefined();
  expect(emittedEvent?.level).toBe(SecurityLevel.MEDIUM);
  expect(emittedEvent?.message).toBe("State count: 3");
});

test("BehaviorAnalyzer - default rules", () => {
  // Ensure each default rule has required properties
  for (const rule of defaultRules) {
    expect(rule.id).toBeDefined();
    expect(rule.name).toBeDefined();
    expect(rule.description).toBeDefined();
    expect(Array.isArray(rule.eventTypes)).toBe(true);
    expect(rule.level).toBeDefined();
    expect(typeof rule.evaluate).toBe("function");
    expect(typeof rule.message).toBe("function");
  }
  
  // Test the path traversal rule
  const pathTraversalRule = defaultRules.find((r: BehaviorRule) => r.id === "path-traversal-attempt");
  expect(pathTraversalRule).toBeDefined();
  
  // Should detect path traversal
  expect(pathTraversalRule!.evaluate({
    event: createMockEvent(SecurityEventType.FILE_ACCESS, "../etc/passwd"),
    history: [],
    state: {}
  })).toBe(true);
  
  // Should detect sensitive file access
  expect(pathTraversalRule!.evaluate({
    event: createMockEvent(SecurityEventType.FILE_ACCESS, "/etc/passwd"),
    history: [],
    state: {}
  })).toBe(true);
  
  // Should allow normal paths
  expect(pathTraversalRule!.evaluate({
    event: createMockEvent(SecurityEventType.FILE_ACCESS, "/home/user/file.txt"),
    history: [],
    state: {}
  })).toBe(false);
});

test("BehaviorAnalyzer - rule disable/enable", () => {
  // Create a rule that will always trigger
  const testRule: BehaviorRule = {
    id: "test-rule",
    name: "Test Rule",
    description: "Rule for testing enable/disable",
    eventTypes: [SecurityEventType.FILE_ACCESS],
    level: SecurityLevel.MEDIUM,
    enabled: false,  // Initially disabled
    evaluate: () => true,
    message: () => "Test rule triggered"
  };
  
  // Set up the analyzer with EventEmitter functionality
  const analyzer = createMockAnalyzer({
    historySize: 100,
    rules: [testRule]
  });
  
  let securityEventCount = 0;
  analyzer.on('security-event', () => {
    securityEventCount++;
  });
  
  // Try with disabled rule
  const event = createMockEvent(SecurityEventType.FILE_ACCESS);
  let result = analyzer.processEvent(event);
  expect(result).toBe(false);
  expect(securityEventCount).toBe(0);
  
  // Enable the rule
  (analyzer as any).config.rules[0].enabled = true;
  
  // Try again with enabled rule
  result = analyzer.processEvent(event);
  expect(result).toBe(true);
  expect(securityEventCount).toBe(1);
}); 