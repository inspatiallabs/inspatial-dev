// Simple test file to debug array detection

import { createStore, unwrap } from "../../signal-core/index.ts";

console.log("------ ARRAY DETECTION DEBUG ------");

const regularArray = [1, 2, 3];
console.log("\nRegular array is array:", Array.isArray(regularArray));

const [storeArray, setStoreArray] = createStore([1, 2, 3]);
console.log("\nStore array properties:");
console.log("- isArray:", Array.isArray(storeArray));
console.log("- toString:", Object.prototype.toString.call(storeArray));
console.log("- constructor:", storeArray.constructor?.name);
console.log(
  "- prototype chain:",
  Object.getPrototypeOf(storeArray) === Array.prototype
);
console.log("- has array methods:", typeof storeArray.push === "function");
console.log("- length property:", storeArray.length);
console.log("- can iterate:", [...storeArray].length > 0);

const unwrappedArray = unwrap(storeArray);
console.log("\nUnwrapped array is array:", Array.isArray(unwrappedArray));

const [state] = createStore({ data: [1, 2, 3] });
console.log("\nNested array properties:");
console.log("- isArray:", Array.isArray(state.data));
console.log("- toString:", Object.prototype.toString.call(state.data));
console.log("- has array methods:", typeof state.data.push === "function");
console.log("- length property:", state.data.length);

// Test the exact line from the failing test
console.log("\nTesting exact lines from failing tests:");
const [todos, setTodos] = createStore([
  { id: 1, done: true },
  { id: 2, done: false },
]);
setTodos((t) => (t[1].done = true));
setTodos((t) => t.push({ id: 3, done: false }));
setTodos((t) => t.shift());
console.log("- Array.isArray from first failing test:", Array.isArray(todos));

// Nested test
const [nested, setNested] = createStore({ todos: [{ id: 1 }, { id: 2 }] });
console.log(
  "- Array.isArray from second failing test:",
  Array.isArray(nested.todos)
);

console.log("\nDebugging complete");
