

import { expect, test } from "@inspatial/test";
import {
  StorageAdapter,
  joinKey,
  splitKey,
  getStorage,
  setStorage,
  removeStorage,
  scanStorage,
} from "./storage.ts";

/*#########################################(Mock Storage Adapter)#########################################*/

class MockStorageAdapter implements StorageAdapter {
  private store = new Map<string, { value: any; expires?: number }>();

  async get(key: string[]): Promise<Record<string, any> | undefined> {
    const value = this.store.get(joinKey(key));
    if (!value) return undefined;
    if (value.expires && value.expires < Date.now()) {
      this.store.delete(joinKey(key));
      return undefined;
    }
    return value.value;
  }

  async set(key: string[], value: any, ttl?: number): Promise<void> {
    this.store.set(joinKey(key), {
      value,
      expires: ttl ? Date.now() + ttl * 1000 : undefined,
    });
  }

  async delete(key: string[]): Promise<void> {
    this.store.delete(joinKey(key));
  }

  async *scan(prefix: string[]): AsyncIterable<[string[], any]> {
    const prefixStr = joinKey(prefix);
    for (const [key, { value }] of this.store.entries()) {
      if (key.startsWith(prefixStr)) {
        yield [splitKey(key), value];
      }
    }
  }
}

/*#########################################(Storage Key Operations)#########################################*/

test({
  name: "joinKey should correctly join key parts with separator",
  fn: () => {
    const key = ["users", "123", "profile"];
    const joined = joinKey(key);
    expect(joined).toBeType("string");
    expect(joined.includes(String.fromCharCode(0x1f))).toBe(true);
  },
});

test({
  name: "splitKey should correctly split key back into parts",
  fn: () => {
    const key = ["users", "123", "profile"];
    const joined = joinKey(key);
    const split = splitKey(joined);
    expect(split).toEqual(key);
  },
});

/*#########################################(Storage Operations)#########################################*/

test({
  name: "getStorage should retrieve stored value",
  fn: async () => {
    const adapter = new MockStorageAdapter();
    const key = ["users", "123"];
    const value = { name: "Test User" };

    await setStorage(adapter, key, value);
    const retrieved = await getStorage(adapter, key);
    expect(retrieved).toEqual(value);
  },
});

test({
  name: "getStorage should return null for non-existent key",
  fn: async () => {
    const adapter = new MockStorageAdapter();
    const key = ["users", "nonexistent"];
    const retrieved = await getStorage<Record<string, any>>(adapter, key);
    expect(retrieved).toBe(undefined);
  },
});

test({
  name: "setStorage should store value with TTL",
  fn: async () => {
    const adapter = new MockStorageAdapter();
    const key = ["temp", "data"];
    const value = { temporary: true };
    const ttl = 1; // 1 second

    await setStorage(adapter, key, value, ttl);
    let retrieved = await getStorage(adapter, key);
    expect(retrieved).toEqual(value);

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 1100));
    retrieved = await getStorage(adapter, key);
    expect(retrieved).toBe(undefined);
  },
});

test({
  name: "removeStorage should delete stored value",
  fn: async () => {
    const adapter = new MockStorageAdapter();
    const key = ["users", "456"];
    const value = { name: "Test User" };

    await setStorage(adapter, key, value);
    await removeStorage(adapter, key);
    const retrieved = await getStorage(adapter, key);
    expect(retrieved).toBe(undefined);
  },
});

test({
  name: "scanStorage should iterate over matching keys",
  fn: async () => {
    const adapter = new MockStorageAdapter();
    const testData = {
      ["users/123"]: { id: "123" },
      ["users/456"]: { id: "456" },
      ["posts/789"]: { id: "789" },
    };

    // Store test data
    for (const [key, value] of Object.entries(testData)) {
      await setStorage(adapter, key.split("/"), value);
    }

    // Test scanning users
    const userResults: Array<[string[], any]> = [];
    for await (const result of scanStorage(adapter, ["users"])) {
      userResults.push(result);
    }

    expect(userResults.length).toBe(2);
    expect(userResults.map(([_, value]) => value.id).sort()).toEqual([
      "123",
      "456",
    ]);
  },
});

/*#########################################(Edge Cases)#########################################*/

test({
  name: "storage operations should handle empty keys",
  fn: async () => {
    const adapter = new MockStorageAdapter();
    const key: string[] = [];
    const value = { empty: true };

    await setStorage(adapter, key, value);
    const retrieved = await getStorage(adapter, key);
    expect(retrieved).toEqual(value);
  },
});

test({
  name: "storage operations should handle special characters in keys",
  fn: async () => {
    const adapter = new MockStorageAdapter();
    const key = ["users", "special@#$%", "data"];
    const value = { special: true };

    await setStorage(adapter, key, value);
    const retrieved = await getStorage(adapter, key);
    expect(retrieved).toEqual(value);
  },
});
