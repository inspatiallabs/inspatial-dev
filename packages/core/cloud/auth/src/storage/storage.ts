/**
 * Interface for InSpatial (Auth) storage adapter implementations
 * @interface StorageAdapter
 */
export interface StorageAdapter {
  /**
   * Retrieves a value from storage by key
   * @param {string[]} key - Array of strings representing the storage key path
   * @returns {Promise<Record<string, any> | undefined>} The stored value or undefined if not found
   */
  get(key: string[]): Promise<Record<string, any> | undefined>;

  /**
   * Deletes a value from storage
   * @param {string[]} key - Array of strings representing the storage key path
   * @returns {Promise<void>}
   */
  delete(key: string[]): Promise<void>;

  /**
   * Sets a value in storage with optional TTL
   * @param {string[]} key - Array of strings representing the storage key path
   * @param {any} value - Value to store
   * @param {number} [ttl] - Optional time-to-live in seconds
   * @returns {Promise<void>}
   */
  set(key: string[], value: any, ttl?: number): Promise<void>;

  /**
   * Scans storage with a prefix
   * @param {string[]} prefix - Array of strings representing the prefix to scan
   * @returns {AsyncIterable<[string[], any]>} AsyncIterable of key-value pairs
   */
  scan(prefix: string[]): AsyncIterable<[string[], any]>;
}

/** Separator character used for joining key parts */
const SEPARATOR = String.fromCharCode(0x1f);

/**
 * Joins an array of key parts into a single string
 * @param {string[]} key - Array of key parts to join
 * @returns {string} Joined key string
 */
export function joinKey(key: string[]): string {
  return key.join(SEPARATOR);
}

/**
 * Splits a key string into an array of key parts
 * @param {string} key - Key string to split
 * @returns {string[]} Array of key parts
 */
export function splitKey(key: string): string[] {
  return key.split(SEPARATOR);
}

/**
 * Encodes key parts to handle separator characters
 * @param {string[]} key - Array of key parts to encode
 * @returns {string[]} Encoded key parts
 */
function encode(key: string[]): string[] {
  return key.map((k) => k.replace(SEPARATOR, ""));
}

/**
 * Gets a value from storage
 * @template T - Type of the stored value
 * @param {StorageAdapter} adapter - Storage adapter instance
 * @param {string[]} key - Array of strings representing the storage key path
 * @returns {Promise<T | null>} The stored value or null if not found
 */
export async function getStorage<T>(
  adapter: StorageAdapter,
  key: string[]
): Promise<T | undefined> {
  const result = await adapter.get(encode(key));
  return result as T | undefined;
}

/**
 * Sets a value in storage
 * @param {StorageAdapter} adapter - Storage adapter instance
 * @param {string[]} key - Array of strings representing the storage key path
 * @param {any} value - Value to store
 * @param {number} [ttl] - Optional time-to-live in seconds
 * @returns {Promise<void>}
 */
export function setStorage(
  adapter: StorageAdapter,
  key: string[],
  value: any,
  ttl?: number
): Promise<void> {
  return adapter.set(encode(key), value, ttl);
}

/**
 * Removes a value from storage
 * @param {StorageAdapter} adapter - Storage adapter instance
 * @param {string[]} key - Array of strings representing the storage key path
 * @returns {Promise<void>}
 */
export function removeStorage(
  adapter: StorageAdapter,
  key: string[]
): Promise<void> {
  return adapter.delete(encode(key));
}

/**
 * Scans storage with a prefix
 * @template T - Type of the stored values
 * @param {StorageAdapter} adapter - Storage adapter instance
 * @param {string[]} key - Array of strings representing the prefix to scan
 * @returns {AsyncIterable<[string[], T]>} AsyncIterable of key-value pairs
 */
export async function* scanStorage<T>(
  adapter: StorageAdapter,
  key: string[]
): AsyncIterable<[string[], T]> {
  for await (const [k, v] of adapter.scan(encode(key))) {
    yield [k, v as T];
  }
}
