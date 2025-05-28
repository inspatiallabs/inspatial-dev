
import { describe, test, expect, mockFn } from "@inspatial/test";
import {
  InMotionScope,
  createMotionScope,
  type ScopeParams,
  type ScopeConstructor,
  type ScopeMethod,
  type Revertible,
} from "../src/scope.ts";
import { globals } from "../src/globals.ts";

/**
 * # Scope Clean API Tests
 * @summary #### Comprehensive testing of InMotion Scope functionality without DOM dependencies
 *
 * These tests validate the scope management system, constructor/revertible patterns,
 * method registration, and data storage capabilities in a clean environment.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 * @module ScopeCleanTests
 * @kind test
 * @access public
 */

// ======================================================
// MOCK SETUP FOR DOM-FREE TESTING
// ======================================================

/**
 * Helper function to temporarily set global state for testing
 */
function withGlobalState<T>(callback: () => T): T {
  const originalScope = globals.scope;
  const originalRoot = globals.root;
  const originalDefaults = globals.defaults;

  try {
    return callback();
  } finally {
    globals.scope = originalScope;
    globals.root = originalRoot;
    globals.defaults = originalDefaults;
  }
}

/**
 * Create simple mock document for testing
 */
function createMockDocument() {
  return {
    body: { tagName: "body" },
    documentElement: { tagName: "html" },
    querySelectorAll: mockFn(() => []),
    querySelector: mockFn(() => null),
  };
}

/**
 * Create simple mock window for testing
 */
function createMockWindow() {
  return {
    matchMedia: mockFn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: mockFn(),
      removeEventListener: mockFn(),
      dispatchEvent: mockFn(() => true),
    })),
  };
}

/**
 * Create simple mock element for testing
 */
function createMockElement(tagName = "div") {
  return {
    tagName,
    style: {},
    parentElement: null,
    nodeType: 1,
    className: "",
    cloneNode: mockFn(() => createMockElement(tagName)),
    querySelector: mockFn(() => null),
    querySelectorAll: mockFn(() => []),
    addEventListener: mockFn(),
    removeEventListener: mockFn(),
    dispatchEvent: mockFn(() => true),
    getAttribute: mockFn(() => null),
    setAttribute: mockFn(),
    removeAttribute: mockFn(),
    hasAttribute: mockFn(() => false),
  };
}

// ======================================================
// MOCK GLOBAL SETUP
// ======================================================

// Store original globals
const originalDocument = globalThis.document;
const originalWindow = globalThis.window;

// Set up simple mocks before tests
globalThis.document = createMockDocument() as any;
globalThis.window = createMockWindow() as any;

// ======================================================
// TEST SUITES
// ======================================================

describe("Scope Clean API Tests", () => {
  /**
   * Scope Creation Tests
   */
  describe("Scope Creation", () => {
    test("Should create scope with default parameters", () => {
      const scope = new InMotionScope();

      expect(scope).toBeDefined();
      expect(scope.constructors).toEqual([]);
      expect(scope.revertConstructors).toEqual([]);
      expect(scope.revertibles).toEqual([]);
      expect(scope.methods).toEqual({});
      expect(scope.matches).toEqual({});
      expect(scope.mediaQueryLists).toEqual({});
      expect(scope.data).toEqual({});
    });

    test("Should create scope with custom defaults", () => {
      const customDefaults = { duration: 1000, easing: "easeInOut" };
      const scope = new InMotionScope({ defaults: customDefaults });

      expect(scope.defaults).toEqual(expect.objectContaining(customDefaults));
    });

    test("Should create scope using factory function", () => {
      const scope = createMotionScope();

      expect(scope).toBeInstanceOf(InMotionScope);
      expect(scope.constructors).toEqual([]);
    });

    test("Should create scope with parameters using factory", () => {
      const params: ScopeParams = {
        defaults: { duration: 500 },
        root: createMockElement() as any,
      };
      const scope = createMotionScope(params);

      expect(scope.defaults.duration).toEqual(500);
    });
  });

  /**
   * Constructor Management Tests
   */
  describe("Constructor Management", () => {
    test("Should add and execute constructors", () => {
      const scope = new InMotionScope();
      const constructorMock = mockFn() as ScopeConstructor;

      scope.add(constructorMock);

      expect(scope.constructors).toContain(constructorMock);
      expect(constructorMock).toHaveBeenCalledTimes(1);
    });

    test("Should store revert constructors", () => {
      const scope = new InMotionScope();
      const revertMock = mockFn() as () => void;

      const testConstructor: ScopeConstructor = () => revertMock;

      scope.add(testConstructor);
      scope.revert();

      expect(revertMock).toHaveBeenCalledTimes(1);
    });

    test("Should handle constructors without cleanup", () => {
      const scope = new InMotionScope();
      const constructorMock = mockFn() as ScopeConstructor;

      expect(() => {
        scope.add(constructorMock);
      }).not.toThrow();

      expect(constructorMock).toHaveBeenCalledTimes(1);
    });

    test("Should execute multiple constructors", () => {
      const scope = new InMotionScope();
      const constructor1Mock = mockFn() as ScopeConstructor;
      const constructor2Mock = mockFn() as ScopeConstructor;

      scope.add(constructor1Mock);
      scope.add(constructor2Mock);

      expect(constructor1Mock).toHaveBeenCalledTimes(1);
      expect(constructor2Mock).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * Method Registration Tests
   */
  describe("Method Registration", () => {
    test("Should register methods", () => {
      const scope = new InMotionScope();
      const testMethodMock = mockFn() as ScopeMethod;

      scope.add("testMethod", testMethodMock);

      expect(scope.methods.testMethod).toBeDefined();
      expect(typeof scope.methods.testMethod).toEqual("function");
    });

    test("Should execute registered methods", () => {
      const scope = new InMotionScope();
      const testMethodMock = mockFn() as ScopeMethod;

      scope.add("testMethod", testMethodMock);
      scope.methods.testMethod(5);

      expect(testMethodMock).toHaveBeenCalledWith(5);
      expect(testMethodMock).toHaveBeenCalledTimes(1);
    });

    test("Should execute methods within scope context", () => {
      const scope = new InMotionScope();
      const testMethodMock = mockFn() as ScopeMethod;

      scope.add("testMethod", testMethodMock);

      withGlobalState(() => {
        scope.methods.testMethod();
      });

      expect(testMethodMock).toHaveBeenCalledTimes(1);
    });

    test("Should handle multiple method registrations", () => {
      const scope = new InMotionScope();
      const method1Mock = mockFn() as ScopeMethod;
      const method2Mock = mockFn() as ScopeMethod;

      scope.add("method1", method1Mock);
      scope.add("method2", method2Mock);

      expect(scope.methods.method1).toBeDefined();
      expect(scope.methods.method2).toBeDefined();

      scope.methods.method1(5);
      scope.methods.method2(10);

      expect(method1Mock).toHaveBeenCalledWith(5);
      expect(method2Mock).toHaveBeenCalledWith(10);
    });
  });

  /**
   * Revertible Management Tests
   */
  describe("Revertible Management", () => {
    test("Should add revertibles to scope", () => {
      const scope = new InMotionScope();
      const revertMock = mockFn() as () => void;
      const revertible: Revertible = { revert: revertMock };

      scope.revertibles.push(revertible);

      expect(scope.revertibles).toContain(revertible);
    });

    test("Should revert all revertibles on scope revert", () => {
      const scope = new InMotionScope();
      const revert1Mock = mockFn() as () => void;
      const revert2Mock = mockFn() as () => void;

      const revertible1: Revertible = { revert: revert1Mock };
      const revertible2: Revertible = { revert: revert2Mock };

      scope.revertibles.push(revertible1, revertible2);
      scope.revert();

      expect(revert1Mock).toHaveBeenCalledTimes(1);
      expect(revert2Mock).toHaveBeenCalledTimes(1);
    });

    test("Should execute revert constructors on scope revert", () => {
      const scope = new InMotionScope();
      const revertConstructorMock = mockFn() as () => void;

      const testConstructor: ScopeConstructor = () => revertConstructorMock;

      scope.add(testConstructor);
      scope.revert();

      expect(revertConstructorMock).toHaveBeenCalledTimes(1);
    });

    test("Should clear arrays after revert", () => {
      const scope = new InMotionScope();
      const revertMock = mockFn() as () => void;

      // Add some items
      scope.revertibles.push({ revert: revertMock });
      scope.add(() => mockFn() as () => void);

      expect(scope.revertibles.length).toBeGreaterThan(0);
      expect(scope.revertConstructors.length).toBeGreaterThan(0);

      scope.revert();

      expect(scope.revertibles.length).toEqual(0);
      expect(scope.revertConstructors.length).toEqual(0);
      expect(scope.constructors.length).toEqual(0);
    });
  });

  /**
   * Scope Execution Tests
   */
  describe("Scope Execution", () => {
    test("Should execute callback with scope context", () => {
      const scope = new InMotionScope();
      const callbackMock = mockFn(() => "test result") as (
        scope: InMotionScope
      ) => string;

      const result = scope.execute(callbackMock);

      expect(callbackMock).toHaveBeenCalledWith(scope);
      expect(callbackMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual("test result");
    });

    test("Should restore global state after execution", () => {
      const scope = new InMotionScope();
      const originalScope = globals.scope;

      scope.execute(() => {
        expect(globals.scope).toBe(scope as any);
      });

      expect(globals.scope).toBe(originalScope);
    });

    test("Should return callback result", () => {
      const scope = new InMotionScope();
      const testObject = { value: 42 };

      const result = scope.execute(() => testObject);

      expect(result).toBe(testObject);
    });

    test("Should handle nested scope execution", () => {
      const scope1 = new InMotionScope();
      const scope2 = new InMotionScope();
      const executionOrder: string[] = [];

      scope1.execute(() => {
        executionOrder.push("scope1-start");
        expect(globals.scope).toBe(scope1 as any);

        scope2.execute(() => {
          executionOrder.push("scope2");
          expect(globals.scope).toBe(scope2 as any);
        });

        executionOrder.push("scope1-end");
        expect(globals.scope).toBe(scope1 as any);
      });

      expect(executionOrder).toEqual(["scope1-start", "scope2", "scope1-end"]);
    });
  });

  /**
   * Scope Refresh Tests
   */
  describe("Scope Refresh", () => {
    test("Should revert and re-execute constructors on refresh", () => {
      const scope = new InMotionScope();
      const constructorMock = mockFn() as () => void;
      const revertMock = mockFn() as () => void;

      const testConstructor: ScopeConstructor = () => {
        constructorMock();
        return revertMock;
      };

      scope.add(testConstructor);
      expect(constructorMock).toHaveBeenCalledTimes(1);

      scope.refresh();
      expect(revertMock).toHaveBeenCalledTimes(1);
      expect(constructorMock).toHaveBeenCalledTimes(2);
    });

    test("Should revert revertibles on refresh", () => {
      const scope = new InMotionScope();
      const revertMock = mockFn() as () => void;

      const revertible: Revertible = { revert: revertMock };

      scope.revertibles.push(revertible);
      scope.refresh();

      expect(revertMock).toHaveBeenCalledTimes(1);
    });

    test("Should return scope instance for chaining", () => {
      const scope = new InMotionScope();
      const result = scope.refresh();

      expect(result).toBe(scope);
    });
  });

  /**
   * Data Storage Tests
   */
  describe("Data Storage", () => {
    test("Should store and retrieve data", () => {
      const scope = new InMotionScope();
      const testData = { key: "value", number: 42 };

      scope.data.testKey = testData;

      expect(scope.data.testKey).toBe(testData);
    });

    test("Should handle multiple data entries", () => {
      const scope = new InMotionScope();

      scope.data.entry1 = "value1";
      scope.data.entry2 = { nested: "object" };
      scope.data.entry3 = [1, 2, 3];

      expect(scope.data.entry1).toEqual("value1");
      expect(scope.data.entry2).toEqual({ nested: "object" });
      expect(scope.data.entry3).toEqual([1, 2, 3]);
    });

    test("Should clear data on revert", () => {
      const scope = new InMotionScope();

      scope.data.testKey = "test value";
      expect(scope.data.testKey).toEqual("test value");

      scope.revert();
      expect(scope.data).toEqual({});
    });
  });

  /**
   * Edge Cases and Error Handling Tests
   */
  describe("Edge Cases", () => {
    test("Should add scope to global revertibles when global scope exists", () => {
      const globalScope = new InMotionScope();

      withGlobalState(() => {
        globals.scope = globalScope as any;
        const childScope = new InMotionScope();

        expect(globalScope.revertibles).toContain(childScope as any);
      });
    });

    test("Should merge defaults with global defaults", () => {
      const globalDefaults = { duration: 1000, easing: "ease" };
      const scopeDefaults = { duration: 500, delay: 100 };

      withGlobalState(() => {
        globals.defaults = globalDefaults;
        const scope = new InMotionScope({ defaults: scopeDefaults });

        expect(scope.defaults.duration).toEqual(500); // Scope overrides global
        expect(scope.defaults.easing).toEqual("ease"); // Global preserved
        expect(scope.defaults.delay).toEqual(100); // Scope addition
      });
    });

    test("Should handle scope without custom defaults", () => {
      const globalDefaults = { duration: 1000 };

      withGlobalState(() => {
        globals.defaults = globalDefaults;
        const scope = new InMotionScope();

        expect(scope.defaults).toBe(globalDefaults);
      });
    });

    test("Should handle empty constructor array", () => {
      const scope = new InMotionScope();

      expect(() => {
        scope.refresh();
      }).not.toThrow();

      expect(scope.constructors).toEqual([]);
    });

    test("Should handle revertibles without revert method", () => {
      const scope = new InMotionScope();
      const invalidRevertible = {} as Revertible;

      scope.revertibles.push(invalidRevertible);

      expect(() => {
        scope.revert();
      }).not.toThrow();
    });

    test("Should handle constructor throwing error", () => {
      const scope = new InMotionScope();
      const errorConstructor: ScopeConstructor = () => {
        throw new Error("Constructor error");
      };

      expect(() => {
        scope.add(errorConstructor);
      }).toThrow("Constructor error");
    });

    test("Should handle method execution with no parameters", () => {
      const scope = new InMotionScope();
      const methodMock = mockFn() as ScopeMethod;

      scope.add("noParamMethod", methodMock);

      scope.methods.noParamMethod();
      expect(methodMock).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * Performance Tests
   */
  describe("Performance Tests", () => {
    test("Should handle many constructors efficiently", () => {
      const scope = new InMotionScope();
      const constructorCount = 100; // Reduced for cleaner testing
      const constructorMocks: ScopeConstructor[] = [];

      const startTime = performance.now();

      for (let i = 0; i < constructorCount; i++) {
        const mock = mockFn() as ScopeConstructor;
        constructorMocks.push(mock);
        scope.add(mock);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Verify all constructors were called
      constructorMocks.forEach((mock) => {
        expect(mock).toHaveBeenCalledTimes(1);
      });

      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    test("Should handle many revertibles efficiently", () => {
      const scope = new InMotionScope();
      const revertibleCount = 100; // Reduced for cleaner testing
      const revertMocks: (() => void)[] = [];

      // Add many revertibles
      for (let i = 0; i < revertibleCount; i++) {
        const revertMock = mockFn() as () => void;
        revertMocks.push(revertMock);
        scope.revertibles.push({ revert: revertMock });
      }

      const startTime = performance.now();
      scope.revert();
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Verify all revertibles were called
      revertMocks.forEach((mock) => {
        expect(mock).toHaveBeenCalledTimes(1);
      });

      expect(duration).toBeLessThan(50); // Should complete in under 50ms
    });
  });

  /**
   * API Tests
   */
  describe("API Tests", () => {
    test("Should have correct method signatures", () => {
      const scope = new InMotionScope();

      expect(typeof scope.execute).toEqual("function");
      expect(typeof scope.refresh).toEqual("function");
      expect(typeof scope.add).toEqual("function");
      expect(typeof scope.revert).toEqual("function");
      expect(typeof scope.handleEvent).toEqual("function");
    });

    test("Should support method chaining", () => {
      const scope = new InMotionScope();
      const constructorMock = mockFn() as ScopeConstructor;

      const result = scope.add(constructorMock).refresh();

      expect(result).toBe(scope);
    });

    test("Should export factory function", () => {
      expect(typeof createMotionScope).toEqual("function");

      const scope = createMotionScope();
      expect(scope).toBeInstanceOf(InMotionScope);
    });

    test("Should export correct types", () => {
      // Type validation through usage
      const params: ScopeParams = {
        defaults: { duration: 1000 },
        root: createMockElement() as any,
      };

      const constructor: ScopeConstructor = mockFn() as ScopeConstructor;
      const method: ScopeMethod = mockFn() as ScopeMethod;
      const revertible: Revertible = { revert: mockFn() as () => void };

      expect(params).toBeDefined();
      expect(constructor).toBeDefined();
      expect(method).toBeDefined();
      expect(revertible).toBeDefined();
    });
  });
});

// ======================================================
// CLEANUP
// ======================================================

// Restore original globals after tests
globalThis.document = originalDocument;
globalThis.window = originalWindow;
