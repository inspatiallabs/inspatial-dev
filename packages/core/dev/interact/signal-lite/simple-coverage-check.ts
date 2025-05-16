// /**
//  * Simple coverage verification script for SignalLite
//  */
// import {
//   createSignalLite,
//   computedLite,
//   watchLite,
//   mergeLite,
//   deriveLite,
//   extractLite,
//   untrackLite
// } from "./signal-lite.ts";

// // Basic signal creation and updates
// console.log("Testing basic signal creation and updates...");
// const count = createSignalLite(0);
// console.log(`Initial count: ${count.value}`);
// count.value = 5;
// console.log(`Updated count: ${count.value}`);

// // Computed signal
// console.log("\nTesting computed signals...");
// const doubled = computedLite(() => count.value * 2);
// console.log(`Doubled value: ${doubled.value}`);
// count.value = 10;
// console.log(`Count: ${count.value}, Doubled: ${doubled.value}`);

// // Watch effect
// console.log("\nTesting watch effects...");
// let lastSeen = -1;
// const dispose = watchLite(() => {
//   lastSeen = count.value;
//   console.log(`Effect saw count change to: ${lastSeen}`);
// });
// count.value = 15;
// console.log(`Last seen in effect: ${lastSeen}`);
// dispose();
// count.value = 20;
// console.log(`After dispose - count: ${count.value}, last seen: ${lastSeen}`);

// // Merge signals
// console.log("\nTesting signal merging...");
// const firstName = createSignalLite("John");
// const lastName = createSignalLite("Doe");
// const fullName = mergeLite([firstName, lastName], (first, last) => `${first} ${last}`);
// console.log(`Full name: ${fullName.value}`);
// firstName.value = "Jane";
// console.log(`Updated full name: ${fullName.value}`);

// // Derive from object
// console.log("\nTesting property derivation...");
// const user = createSignalLite({ name: "Alice", age: 30 });
// const name = deriveLite(user, "name");
// console.log(`Derived name: ${name.value}`);
// user.value = { ...user.value, name: "Bob" };
// console.log(`Updated derived name: ${name.value}`);

// // Extract properties
// console.log("\nTesting property extraction...");
// const settings = createSignalLite({
//   theme: "dark",
//   fontSize: 16,
//   notifications: true
// });
// const { theme, fontSize } = extractLite(settings, "theme", "fontSize");
// console.log(`Theme: ${theme.value}, Font size: ${fontSize.value}`);
// settings.value = { ...settings.value, theme: "light" };
// console.log(`Updated theme: ${theme.value}`);

// // Untrack
// console.log("\nTesting untrack...");
// const a = createSignalLite(1);
// const b = createSignalLite(2);
// let effectRuns = 0;

// watchLite(() => {
//   effectRuns++;
//   console.log(`Effect ran ${effectRuns} time(s)`);

//   // Using untrack to prevent dependency on b
//   untrackLite(() => {
//     console.log(`Reading b (${b.value}) without tracking`);
//   });

//   // But we do track a
//   console.log(`Reading a (${a.value}) with tracking`);
// });

// console.log("Updating b (should not trigger effect)...");
// b.value = 20;
// console.log(`Effect runs after updating b: ${effectRuns}`);

// console.log("Updating a (should trigger effect)...");
// a.value = 10;
// console.log(`Effect runs after updating a: ${effectRuns}`);

// console.log("\nAll tests completed successfully!");
