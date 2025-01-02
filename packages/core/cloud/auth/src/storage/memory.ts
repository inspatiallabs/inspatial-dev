import { joinKey, splitKey, StorageAdapter } from "./storage.ts";

export interface MemoryStorageOptions {
  persist?: string;
}

export function MemoryStorage(input?: MemoryStorageOptions): StorageAdapter {
  const store = [] as [
    string,
    { value: Record<string, any>; expiry?: number },
  ][];

  if (input?.persist) {
    try {
      const file = Deno.readFileSync(input.persist);
      const decoder = new TextDecoder("utf-8");
      store.push(...JSON.parse(decoder.decode(file)));
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
  }

  async function save() {
    if (!input?.persist) return;
    const file = JSON.stringify(store);
    const encoder = new TextEncoder();
    await Deno.writeFile(input.persist, encoder.encode(file));
  }

  function search(key: string) {
    let left = 0;
    let right = store.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const comparison = key.localeCompare(store[mid][0]);
      if (comparison === 0) {
        return { found: true, index: mid };
      } else if (comparison < 0) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
    return { found: false, index: left };
  }

  return {
    get(key: string[]) {
      const match = search(joinKey(key));
      if (match.found && match) {
        const entry = store[match.index][1];
        if (entry.expiry && entry.expiry < Date.now()) {
          store.splice(match.index, 1);
          return Promise.resolve(undefined);
        }
        return Promise.resolve(entry.value);
      }
      return Promise.resolve(undefined);
    },

    async set(key: string[], value: any, ttl?: number) {
      const joined = joinKey(key);
      const match = search(joined);
      const entry = [
        joined,
        {
          value,
          expiry: ttl ? Date.now() + ttl * 1000 : undefined,
        },
      ] as (typeof store)[number];
      if (!match.found) {
        store.splice(match.index, 0, entry);
      }
      if (match.found) {
        store[match.index] = entry;
      }
      await save();
    },

    async delete(key: string[]) {
      const joined = joinKey(key);
      const match = search(joined);
      if (match.found) {
        store.splice(match.index, 1);
      }
      await save();
    },

    async *scan(prefix: string[]) {
      for (const [key, entry] of store) {
        if (key.startsWith(joinKey(prefix))) {
          if (entry.expiry && entry.expiry < Date.now()) {
            continue;
          }
          yield [splitKey(key), entry.value];
        }
      }
    },
  };
}
