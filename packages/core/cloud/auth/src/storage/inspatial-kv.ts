// /*#######################################
//  * Experimental InSpatial KV Storage Adapter
//  *
//  * @author @benemma
//  * @date 2025-01-01
//  *
//  * @description This is an experimental storage adapter for InSpatial KV.
//  * It is not yet fully tested and may not be fully compatible with the InSpatial KV SDK.
//  *
//  * @warning This is an experimental implementation will change as InSpatial KV is developed.
//  *#######################################*/

// import { inSpatialKV, getKV, setKV, deleteKV, listKV } from "@inspatial/kv";
// import { StorageAdapter } from "./storage.ts";
// import { SchemaType } from "jsr:@std/yaml@^1.0.5/parse";

// /*#######################################
//  * Types
//  ######################################*/

// type AuthKVSchema = {
//   key: Deno.KvKey;
//   schema: SchemaType;
// }[];

// /*#######################################
//  * Constants
//  ######################################*/

// const KEY_PREFIX = {
//   OAUTH_KEY: "oauth:key",
//   OAUTH_REFRESH: "oauth:refresh",
//   OAUTH_CODE: "oauth:code",
// } as const;

// /*#######################################
//  * InSpatial KV Storage Adapter
//  ######################################*/

// export function createInSpatialKVStorage(_options: {
//   kv: Deno.Kv;
// }): StorageAdapter {
//   const kv = inSpatialKV.create<AuthKVSchema>();

//   return {
//     async get(key) {
//       const result = await getKV(kv, key);
//       return result?.value;
//     },
//     async set(key, value, ttl) {
//       await setKV(kv, key, value, { expireIn: ttl });
//     },
//     async delete(key) {
//       await deleteKV(kv, key);
//     },
//     scan(prefix) {
//       const iterator = listKV(kv, { prefix });
//       return {
//         async *[Symbol.asyncIterator]() {
//           for await (const entry of iterator) {
//             yield {
//               key: entry.key as string[],
//               value: entry.value,
//               versionstamp: entry.versionstamp,
//             };
//           }
//         },
//       };
//     },
//   };
// }

// /*#######################################
//  * Helper Functions
//  ######################################*/

// /**
//  * Creates a new InSpatialKV storage instance for auth
//  */
// export function createAuthKVStorage(): Promise<StorageAdapter> {
//   const kv = new inSpatialKV<AuthKVSchema>();
//   return createInSpatialKVStorage({ kv });
// }

// /**
//  * Type guard to check if a value matches the AuthKVSchema
//  */
// function _isAuthKVValue<T extends keyof AuthKVSchema>(
//   key: string[],
//   value: unknown
// ): value is AuthKVSchema[T] {
//   const prefix = key[0];

//   switch (prefix) {
//     case KEY_PREFIX.OAUTH_KEY:
//       return (
//         typeof value === "object" &&
//         value !== null &&
//         "id" in value &&
//         "publicKey" in value &&
//         "privateKey" in value &&
//         "created" in value
//       );
//     case KEY_PREFIX.OAUTH_REFRESH:
//       return (
//         typeof value === "object" &&
//         value !== null &&
//         "type" in value &&
//         "properties" in value &&
//         "clientID" in value
//       );
//     case KEY_PREFIX.OAUTH_CODE:
//       return (
//         typeof value === "object" &&
//         value !== null &&
//         "type" in value &&
//         "properties" in value &&
//         "clientID" in value &&
//         "redirectURI" in value
//       );
//     default:
//       return false;
//   }
// }
