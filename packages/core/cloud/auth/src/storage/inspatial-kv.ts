/*#######################################
 * Experimental InSpatial KV Storage Adapter
 *
 * @author @benemma
 * @date 2024-12-14
 *
 * @description This is an experimental storage adapter for InSpatial KV.
 * It is not yet fully tested and may not be fully compatible with the InSpatial KV SDK.
 *
 * @warning This is an experimental implementation will change as InSpatial KV is developed.
 *#######################################*/

import {
  InSpatialKV,
  getKV,
  setKV,
  deleteKV,
  listKV,
  atomic,
  watchKV,
  closeKV,
} from "@inspatial/kv";
import { StorageAdapter } from "./storage.ts";

/*#######################################
 * Types
 ######################################*/

interface AuthKVSchema {
  // OAuth Keys
  "oauth:key": {
    id: string;
    publicKey: string;
    privateKey: string;
    created: number;
  };
  // OAuth Refresh Tokens
  "oauth:refresh": {
    type: string;
    properties: any;
    clientID: string;
  };
  // OAuth Authorization Codes
  "oauth:code": {
    type: string;
    properties: any;
    clientID: string;
    redirectURI: string;
    pkce?: {
      challenge: string;
      method: "S256";
    };
  };
}

/*#######################################
 * Constants
 ######################################*/

const KEY_PREFIX = {
  OAUTH_KEY: "oauth:key",
  OAUTH_REFRESH: "oauth:refresh",
  OAUTH_CODE: "oauth:code",
} as const;

/*#######################################
 * InSpatial KV Storage Adapter
 ######################################*/

export function createInSpatialKVStorage(options: {
  kv: InSpatialKV<AuthKVSchema>;
}): StorageAdapter {
  const { kv } = options;

  return {
    async get<T>(key: string[]): Promise<T | undefined> {
      const result = await getKV(kv, key as any);
      return result.value as T | undefined;
    },

    async set<T>(
      key: string[],
      value: T,
      options?: { expireIn?: number }
    ): Promise<void> {
      await setKV(kv, key as any, value, options);
    },

    async delete(key: string[]): Promise<void> {
      await deleteKV(kv, key as any);
    },

    async list<T>(prefix: string[]): AsyncIterable<{
      key: string[];
      value: T;
      versionstamp: string;
    }> {
      const iterator = listKV(kv, { prefix: prefix as any });

      return {
        async *[Symbol.asyncIterator]() {
          for await (const entry of iterator) {
            if (entry.value) {
              yield {
                key: entry.key as string[],
                value: entry.value as T,
                versionstamp: entry.versionstamp,
              };
            }
          }
        },
      };
    },

    async atomic(): Promise<{
      check: (key: string[], versionstamp: string | null) => void;
      set: <T>(key: string[], value: T) => void;
      delete: (key: string[]) => void;
      commit: () => Promise<{ ok: boolean }>;
    }> {
      const operation = atomic(kv);

      return {
        check: (key, versionstamp) => {
          operation.check({ key: key as any, versionstamp });
        },
        set: <T>(key: string[], value: T) => {
          operation.set(key as any, value);
        },
        delete: (key) => {
          operation.delete(key as any);
        },
        commit: () => operation.commit(),
      };
    },

    async watch<T>(
      keys: string[][]
    ): Promise<
      ReadableStream<Array<{ value: T | null; versionstamp: string | null }>>
    > {
      return watchKV(kv, keys as any) as any;
    },

    async close(): Promise<void> {
      await closeKV(kv);
    },
  };
}

/*#######################################
 * Helper Functions
 ######################################*/

/**
 * Creates a new InSpatialKV storage instance for auth
 */
export async function createAuthKVStorage(): Promise<StorageAdapter> {
  const kv = new InSpatialKV<AuthKVSchema>();
  return createInSpatialKVStorage({ kv });
}

/**
 * Type guard to check if a value matches the AuthKVSchema
 */
function isAuthKVValue<T extends keyof AuthKVSchema>(
  key: string[],
  value: unknown
): value is AuthKVSchema[T] {
  const prefix = key[0];

  switch (prefix) {
    case KEY_PREFIX.OAUTH_KEY:
      return (
        typeof value === "object" &&
        value !== null &&
        "id" in value &&
        "publicKey" in value &&
        "privateKey" in value &&
        "created" in value
      );
    case KEY_PREFIX.OAUTH_REFRESH:
      return (
        typeof value === "object" &&
        value !== null &&
        "type" in value &&
        "properties" in value &&
        "clientID" in value
      );
    case KEY_PREFIX.OAUTH_CODE:
      return (
        typeof value === "object" &&
        value !== null &&
        "type" in value &&
        "properties" in value &&
        "clientID" in value &&
        "redirectURI" in value
      );
    default:
      return false;
  }
}
