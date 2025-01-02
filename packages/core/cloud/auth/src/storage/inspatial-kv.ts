/*#######################################
 * Experimental InSpatial KV Storage Adapter
 *
 * @author @benemma
 * @date 2025-01-01
 *
 * @description This is an experimental storage adapter for InSpatial KV.
 * It is not yet fully tested and may not be fully compatible with the InSpatial KV SDK.
 *
 * @warning This is an experimental implementation will change as InSpatial KV is developed.
 *#######################################*/

import {
  inSpatialKV,
  getKV,
  setKV,
  deleteKV,
  listKV,
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
  kv: inSpatialKV<AuthKVSchema>;
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

    list<T>(prefix: string[]): Promise<
      AsyncIterable<{
        key: string[];
        value: T;
        versionstamp: string;
      }>
    > {
      const iterator = listKV(kv, { prefix: prefix as any });
      return iterator;
    },

    atomic(): Promise<{
      commit(): Promise<void>;
      abort(): void;
    }> {
      return Promise.resolve({
        commit: () => Promise.resolve(),
        abort: () => {},
      });
    },

    watch<T>(
      _key: string[],
      _callback: (value: T | undefined) => void
    ): Promise<() => void> {
      return Promise.resolve(() => {});
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
export function createAuthKVStorage(): Promise<StorageAdapter> {
  const kv = new inSpatialKV<AuthKVSchema>();
  return createInSpatialKVStorage({ kv });
}

/**
 * Type guard to check if a value matches the AuthKVSchema
 */
function _isAuthKVValue<T extends keyof AuthKVSchema>(
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
