import { mockFn } from "../../test/src/mock.ts";

// Simple debug helper to print object properties
function inspectObject(obj, label) {
  console.log(`---${label}---`);
  const props = [];
  for (const key in obj) {
    try {
      const val = typeof obj[key] === 'function' ? '[Function]' : obj[key];
      props.push(`${key}: ${val}`);
    } catch (e) {
      props.push(`${key}: [Error: ${e.message}]`);
    }
  }
  console.log(props.join('\n'));
  
  console.log('---Symbols---');
  const symbols = Object.getOwnPropertySymbols(obj);
  for (const sym of symbols) {
    try {
      const symName = sym.toString();
      const val = typeof obj[sym] === 'function' ? '[Function]' : obj[sym];
      console.log(`${symName}: ${val}`);
    } catch (e) {
      console.log(`${sym.toString()}: [Error: ${e.message}]`);
    }
  }
}

// Directly create a mockFn to see its structure
const myMockFn = mockFn(() => 42);
inspectObject(myMockFn, "Mock Function");

// Add the mock property used in the tests
myMockFn.mock = { calls: [] };
inspectObject(myMockFn.mock, "Mock.calls structure");

// Test with toHaveBeenCalledTimes expectation
try {
  // Using getMockCalls to check what expect().toHaveBeenCalledTimes() would check
  console.log("\nGetting mock calls array:");
  const mockCalls = getMockCalls(myMockFn);
  console.log(`Mock calls found: ${JSON.stringify(mockCalls)}`);
} catch (e) {
  console.error("Error getting mock calls:", e.message);
}

// Helper function similar to what expect matchers would use
function getMockCalls(f) {
  const mockSymbol = Symbol.for("@MOCK");
  if (!f || !f[mockSymbol]) {
    throw new Error("Received function must be a mock or spy function");
  }
  return f[mockSymbol].calls;
}

// This test is just for debugging purposes, so we'll exit
Deno.exit(0); 