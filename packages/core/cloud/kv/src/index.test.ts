// import { assertEquals, assertRejects, assertExists } from "@std/assert";
// import {
//   InSpatialKV,
//   setKV,
//   getKV,
//   deleteKV,
//   listKV,
//   atomic,
//   enqueueKV,
//   watchKV,
//   createKVQueueProcessor,
//   closeKV,
//   createInSpatialKV,
// } from "./index.ts";

// // Test Schema Definition
// type TestSchema = [
//   {
//     key: ["user", number];
//     schema: { id: string; name: string; age: number };
//   },
//   {
//     key: ["counter", string];
//     schema: number;
//   },
//   {
//     key: ["config", string];
//     schema: { enabled: boolean; value: string };
//   },
// ];

// Deno.test("InSpatialKV Test Suite", async (t) => {
//   let kv: InSpatialKV<TestSchema>;

//   await t.step("setup", async () => {
//     kv = await createInSpatialKV<TestSchema>();
//     assertExists(kv);
//   });

//   // Basic CRUD Operations
//   await t.step("CRUD Operations", async (t) => {
//     await t.step("should set and get a value", async () => {
//       const user = { id: "1", name: "John Doe", age: 30 };
//       await setKV(kv, ["user", 1], user);
//       const result = await getKV(kv, ["user", 1]);
//       assertEquals(result.value, user);
//     });

//     await t.step("should handle non-existent keys", async () => {
//       const result = await getKV(kv, ["user", 999]);
//       assertEquals(result.value, null);
//     });

//     await t.step("should delete a value", async () => {
//       await setKV(kv, ["user", 2], { id: "2", name: "Jane Doe", age: 25 });
//       await deleteKV(kv, ["user", 2]);
//       const result = await getKV(kv, ["user", 2]);
//       assertEquals(result.value, null);
//     });

//     await t.step("should list values with prefix", async () => {
//       // Setup test data
//       await setKV(kv, ["user", 1], { id: "1", name: "John", age: 30 });
//       await setKV(kv, ["user", 2], { id: "2", name: "Jane", age: 25 });

//       const users: { id: string; name: string; age: number }[] = [];
//       for await (const entry of listKV(kv, { prefix: ["user"] })) {
//         if (entry.value) users.push(entry.value);
//       }

//       assertEquals(users.length, 2);
//       assertEquals(users[0].name, "John");
//       assertEquals(users[1].name, "Jane");
//     });
//   });

//   // Atomic Operations
//   await t.step("Atomic Operations", async (t) => {
//     await t.step("should perform atomic operations", async () => {
//       const result = await atomic(kv)
//         .set(["user", 3], { id: "3", name: "Bob", age: 35 })
//         .commit();

//       assertEquals(result.ok, true);
//       const user = await getKV(kv, ["user", 3]);
//       assertEquals(user.value?.name, "Bob");
//     });

//     await t.step("should handle atomic operation failure", async () => {
//       // Set initial value
//       await setKV(kv, ["counter", "visits"], 0);
//       const initial = await getKV(kv, ["counter", "visits"]);

//       // Attempt conflicting operations
//       const op1 = atomic(kv)
//         .check({
//           key: ["counter", "visits"],
//           versionstamp: initial.versionstamp,
//         })
//         .sum(["counter", "visits"], BigInt(1));

//       const op2 = atomic(kv)
//         .check({
//           key: ["counter", "visits"],
//           versionstamp: initial.versionstamp,
//         })
//         .sum(["counter", "visits"], BigInt(1));

//       await op1.commit();
//       const result = await op2.commit();
//       assertEquals(result.ok, false);
//     });
//   });

//   // Queue Operations
//   await t.step("Queue Operations", async (t) => {
//     await t.step("should enqueue and process messages", async () => {
//       const messages: { id: string; name: string; age: number }[] = [];

//       const processor = createKVQueueProcessor<TestSchema>(kv).handle(
//         async (message) => {
//           messages.push(message.value);
//           return true;
//         }
//       );

//       await processor.start();

//       await enqueueKV(kv, { id: "4", name: "Queue Test", age: 40 });

//       // Wait for message processing
//       await new Promise((resolve) => setTimeout(resolve, 100));

//       assertEquals(messages.length, 1);
//       assertEquals(messages[0].name, "Queue Test");

//       await processor.stop();
//     });
//   });

//   // Watch Operations
//   await t.step("Watch Operations", async (t) => {
//     await t.step("should watch for changes", async () => {
//       const changes: unknown[] = [];
//       const stream = watchKV(kv, [["user", 1]]);
//       const reader = stream.getReader();

//       // Start watching in background
//       const watchPromise = (async () => {
//         try {
//           while (true) {
//             const { done, value } = await reader.read();
//             if (done) break;
//             changes.push(value);
//           }
//         } finally {
//           reader.releaseLock();
//         }
//       })();

//       // Make some changes
//       await setKV(kv, ["user", 1], { id: "1", name: "Updated John", age: 31 });

//       // Wait for changes to be detected
//       await new Promise((resolve) => setTimeout(resolve, 100));

//       // Cleanup
//       reader.cancel();
//       await watchPromise;

//       assertEquals(changes.length, 1);
//       assertEquals((changes[0] as any)[0].value?.name, "Updated John");
//     });
//   });

//   // Error Cases
//   await t.step("Error Handling", async (t) => {
//     await t.step("should handle invalid types", async () => {
//       // @ts-expect-error - Testing runtime type check
//       await assertRejects(() => setKV(kv, ["user", 1], { invalid: "data" }));
//     });

//     await t.step("should handle invalid keys", async () => {
//       // @ts-expect-error - Testing invalid key type
//       await assertRejects(() => getKV(kv, ["invalid", "key"]));
//     });
//   });

//   // Cleanup
//   await t.step("cleanup", async () => {
//     kv.close();
//   });
// });
