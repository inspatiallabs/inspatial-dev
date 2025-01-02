import { expect, test } from "@inspatial/test";
import { MemoryStorage } from "./memory.ts";

/*#########################################(Memory Storage Tests)#########################################*/

test({
  name: "MemoryStorage initialization",
  fn: () => {
    const storage = MemoryStorage();
    expect(storage).toBeDefined();
    expect(storage.get).toBeType("function");
    expect(storage.set).toBeType("function");
    expect(storage.delete).toBeType("function");
    expect(storage.scan).toBeType("function");
  },
});

/*#########################################(Basic CRUD Operations)#########################################*/

test({
  name: "set and get operations",
  fn: async () => {
    const storage = MemoryStorage();
    const key = ["test", "key"];
    const value = { data: "test value" };

    await storage.set(key, value);
    const result = await storage.get(key);
    expect(result).toEqual(value);
  },
});

test({
  name: "remove operation",
  fn: async () => {
    const storage = MemoryStorage();
    const key = ["test", "key"];
    const value = { data: "test value" };

    await storage.set(key, value);
    await storage.delete(key);
    const result = await storage.get(key);
    expect(result).toBeUndefined();
  },
});

/*#########################################(TTL Functionality)#########################################*/

test({
  name: "TTL expiration",
  fn: async () => {
    const storage = MemoryStorage();
    const key = ["test", "ttl"];
    const value = { data: "expires soon" };

    await storage.set(key, value, 1); // 1 second TTL

    // Verify value exists initially
    let result = await storage.get(key);
    expect(result).toEqual(value);

    // Wait for expiration
    await new Promise((resolve) => setTimeout(resolve, 1100));

    // Verify value has expired
    result = await storage.get(key);
    expect(result).toBeUndefined();
  },
});

/*#########################################(Scan Operations)#########################################*/

test({
  name: "scan operation with prefix",
  fn: async () => {
    const storage = MemoryStorage();
    const prefix = ["test"];
    const items = [
      { key: ["test", "1"], value: { id: 1 } },
      { key: ["test", "2"], value: { id: 2 } },
      { key: ["other", "1"], value: { id: 3 } },
    ];

    // Set up test data
    for (const item of items) {
      await storage.set(item.key, item.value);
    }

    // Collect scan results
    const results = [];
    for await (const [key, value] of storage.scan(prefix)) {
      results.push({ key, value });
    }

    expect(results.length).toBe(2);
    expect(results.some((r) => r.value.id === 1)).toBe(true);
    expect(results.some((r) => r.value.id === 2)).toBe(true);
    expect(results.some((r) => r.value.id === 3)).toBe(false);
  },
});

/*#########################################(Persistence)#########################################*/

test({
  name: "persistence to file",
  fn: async () => {
    const testFile = "test-storage.json";
    const storage = MemoryStorage({ persist: testFile });
    const key = ["test", "persist"];
    const value = { data: "persistent" };

    await storage.set(key, value);

    // Create new storage instance to read from file
    const newStorage = MemoryStorage({ persist: testFile });
    const result = await newStorage.get(key);
    expect(result).toEqual(value);

    // Cleanup
    await Deno.remove(testFile);
  },
  options: {
    permissions: {
      read: true,
      write: true,
    },
  },
});

/*#########################################(Error Handling)#########################################*/

test({
  name: "handles invalid file path",
  fn: () => {
    const storage = MemoryStorage({
      persist: "/this/path/does/not/exist/storage.json",
    });

    // Verify storage was created despite invalid path
    expect(storage).toBeDefined();
    expect(storage.get).toBeType("function");
    expect(storage.set).toBeType("function");
  },
  options: {
    sanitizeResources: false,
    sanitizeOps: false,
  },
});

/*#########################################(Edge Cases)#########################################*/

test({
  name: "handles empty keys and values",
  fn: async () => {
    const storage = MemoryStorage();
    const key = [""];
    const value = {};

    await storage.set(key, value);
    const result = await storage.get(key);
    expect(result).toEqual(value);
  },
});

test({
  name: "handles concurrent operations",
  fn: async () => {
    const storage = MemoryStorage();
    const operations = Array(100)
      .fill(null)
      .map((_, i) => ({
        key: ["test", i.toString()],
        value: { id: i },
      }));

    // Concurrent sets
    await Promise.all(operations.map((op) => storage.set(op.key, op.value)));

    // Verify all values
    for (const op of operations) {
      const result = await storage.get(op.key);
      expect(result).toEqual(op.value);
    }
  },
});

/*#########################################(Binary Search Implementation)#########################################*/

test({
  name: "binary search maintains sorted order",
  fn: async () => {
    const storage = MemoryStorage();
    const keys = ["c", "a", "b", "e", "d"].map((k) => [k]);
    const value = { test: true };

    // Insert in random order
    for (const key of keys) {
      await storage.set(key, value);
    }

    // Verify order through scan
    const scanned = [];
    for await (const [key] of storage.scan([])) {
      scanned.push(key[0]);
    }

    expect(scanned).toEqual(["a", "b", "c", "d", "e"]);
  },
});
