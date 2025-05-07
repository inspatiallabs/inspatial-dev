/**
 * Test Array Detection
 * 
 * This test verifies that our array detection fix works correctly
 */

import { test, expect } from "@inspatial/test";
import { createStore } from "../signal/src/index.ts";
import "./test-setup.ts";

test("Array detection in store arrays", () => {
  // Create a store with an array
  const [state, setState] = createStore({
    items: [1, 2, 3]
  });
  
  // Regular array
  const regularArray = [1, 2, 3];
  console.log("Regular array isArray:", Array.isArray(regularArray));
  expect(Array.isArray(regularArray)).toBe(true);
  
  // Store array
  const storeArray = state.items;
  console.log("Store array isArray:", Array.isArray(storeArray));
  expect(Array.isArray(storeArray)).toBe(true);
  
  // Test array methods
  console.log("Store array has length:", storeArray.length);
  console.log("Store array has push method:", typeof storeArray.push === 'function');
  console.log("Store array has map method:", typeof storeArray.map === 'function');
  
  // Test array behavior
  setState(s => s.items.push(4));
  console.log("After push, length:", state.items.length);
  expect(state.items.length).toBe(4);
  
  // Test array methods
  const mapped = state.items.map(x => x * 2);
  console.log("Mapped result:", mapped);
  expect(mapped).toEqual([2, 4, 6, 8]);
}); 