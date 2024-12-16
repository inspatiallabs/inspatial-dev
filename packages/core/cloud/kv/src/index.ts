/*################################################################################
DESCRIPTION: Type-safe key-value store with schema validation at compile time.
Optimized for Spatial and Universal Apps
################################################################################*/
/*==============================================================================*/
/*################################################################################
TYPE DEFINITIONS
################################################################################*/

// Base schema type that supports both array and record types
type SchemaType = unknown[] | Record<string, unknown>;

export type KvSchema = {
  key: Deno.KvKey;
  schema: SchemaType;
}[];

type CompareKeys<K1 extends Deno.KvKey, K2 extends Deno.KvKey> = [K1] extends [
  K2,
]
  ? [K2] extends [K1]
    ? true
    : false
  : false;

type IsAny<T> = 0 extends 1 & T ? true : false;

type IsUnknown<T> = unknown extends T
  ? T extends unknown
    ? IsAny<T> extends false
      ? true
      : false
    : false
  : false;

type IsNever<T> = [T] extends [never] ? true : never;

type ExtractKeys<S extends KvSchema> = S[number]["key"];

type ExtractNotNever<T> = T extends readonly [infer Head, ...infer Tail]
  ? Head extends never
    ? ExtractNotNever<Tail>
    : Head extends SchemaType
      ? Head
      : never
  : never;

type SchemaLookup<S extends KvSchema, K extends Deno.KvKey> = {
  [Index in keyof S]: CompareKeys<S[Index]["key"], K> extends true
    ? S[Index]["schema"]
    : never;
};

type ExtractSchema<S extends KvSchema, K extends Deno.KvKey> = ExtractNotNever<
  SchemaLookup<S, K>[keyof S]
>;

type AbstractKeys<Keys extends Deno.KvKey> = {
  [Index in keyof Keys]: Keys[Index] extends number ? number : Keys[Index];
};

/*################################################################################
KEY-VALUE CLASS
################################################################################*/

/**
 * @description A type-safe key-value store with schema validation at compile time.
 * @example usage:
 * ```ts
 * // Define your schema
 * type UserSchema = [{
 *   key: ["user", number],
 *   schema: { id: string, name: string }
 * }];
 *
 * // Create KV instance
 * const kv = new inSpatialKV<UserSchema>();
 *
 * // Use utility functions
 * await setKV(kv, ["user", 123], { id: "B3N", name: "Ben Emma" });
 * const user = await getKV(kv, ["user", 123]);
 * await deleteKV(kv, ["user", 123]);
 * const users = listKV(kv, { prefix: ["user"] });
 *
 * // Type safety is preserved
 * // This would cause a type error:
 * // await setKV(kv, ["user", 123], { id: 123 }); // Error: id should be string
 * ```
 */

export class inSpatialKV<S extends KvSchema> {
  private kv: Deno.Kv;

  private constructor(kv: Deno.Kv) {
    this.kv = kv;
  }

  static async create<S extends KvSchema>(
    path?: string
  ): Promise<inSpatialKV<S>> {
    const kv = await Deno.openKv(path);
    return new inSpatialKV<S>(kv);
  }

  /***************get****************/
  public get<K extends ExtractKeys<S>, T = unknown>(
    key: K,
    options?: { consistency?: Deno.KvConsistencyLevel }
  ): Promise<
    Deno.KvEntryMaybe<T extends unknown ? ExtractSchema<S, AbstractKeys<K>> : T>
  > {
    return this.kv.get(key, options);
  }

  /***************getMany****************/
  public getMany<K extends ExtractKeys<S>[]>(
    keys: readonly [...K],
    options?: { consistency?: Deno.KvConsistencyLevel }
  ): Promise<{ [I in keyof K]: Deno.KvEntryMaybe<ExtractSchema<S, K[I]>> }> {
    const result = this.kv.getMany(keys, options);
    return result as Promise<{
      [I in keyof K]: Deno.KvEntryMaybe<ExtractSchema<S, K[I]>>;
    }>;
  }

  /***************set****************/
  public set<K extends ExtractKeys<S>>(
    key: K,
    value: ExtractSchema<S, AbstractKeys<K>>,
    options?: { expireIn?: number }
  ): Promise<Deno.KvCommitResult> {
    return this.kv.set(key, value, options);
  }

  /***************delete****************/
  public delete(key: ExtractKeys<S>): Promise<void> {
    return this.kv.delete(key);
  }

  /***************list****************/
  public list<K extends ExtractKeys<S>>(
    selector: Deno.KvListSelector & {
      prefix?: K;
      start?: K;
      end?: K;
    },
    options?: Deno.KvListOptions
  ): Deno.KvListIterator<ExtractSchema<S, AbstractKeys<K>>> {
    return this.kv.list(selector, options);
  }

  /***************atomic****************/
  public atomic(): InSpatialAtomicOperation<S> {
    return new InSpatialAtomicOperation<S>(this.kv.atomic());
  }

  /***************enqueue****************/
  public enqueue<K extends ExtractKeys<S>>(
    value: ExtractSchema<S, AbstractKeys<K>>,
    options?: {
      delay?: number;
      keysIfUndelivered?: K[];
      backoffSchedule?: number[];
    }
  ): Promise<Deno.KvCommitResult> {
    return this.kv.enqueue(value, options);
  }

  /***************listenQueue****************/
  public listenQueue(
    handler: (message: {
      value: ExtractSchema<S, any>;
      versionstamp: string;
    }) => Promise<void>
  ): Promise<void> {
    return this.kv.listenQueue(async (message) => {
      await handler(message);
    });
  }

  /***************watch****************/
  public watch<K extends ExtractKeys<S>[]>(
    keys: readonly [...K],
    options?: { raw?: boolean }
  ): ReadableStream<{
    [I in keyof K]: Deno.KvEntryMaybe<ExtractSchema<S, K[I]>>;
  }> {
    const stream = this.kv.watch(keys, options);
    return stream as ReadableStream<{
      [I in keyof K]: Deno.KvEntryMaybe<ExtractSchema<S, K[I]>>;
    }>;
  }

  /***************close****************/
  public close(): void {
    this.kv.close();
  }
}

/*################################################################################
FACTORY FUNCTIONS
################################################################################*/

/**
 * Factory function to create inSpatialKV instance.
 * Useful for creating a KV instance without having to instantiate the class
 * @example
 * ```ts
 * const kv = await createinSpatialKV<UserSchema>("path/to/kv");
 * ```
 */

export function createinSpatialKV<S extends KvSchema>(
  path?: string
): Promise<inSpatialKV<S>> {
  return inSpatialKV.create<S>(path);
}

/*#============================================================================== 
KEY-VALUE FUNCTIONS
==============================================================================*/

/*#################################(setKV)######################################*/
/**
 * Create or update a value in the Key-Value (KV) store
 * @example
 * ```ts
 * await setKV(kv, ["user", 123], { id: "B3N", name: "Ben Emma" });
 * ```
 */
export function setKV<S extends KvSchema, K extends ExtractKeys<S>>(
  kv: inSpatialKV<S>,
  key: K,
  value: ExtractSchema<S, AbstractKeys<K>>,
  options?: { expireIn?: number }
): Promise<Deno.KvCommitResult> {
  return kv.set(key, value, options);
}

/*#################################(getKV)######################################*/
/**
 * Get a value from the KV store
 */
export function getKV<S extends KvSchema, K extends ExtractKeys<S>>(
  kv: inSpatialKV<S>,
  key: K,
  options?: { consistency?: Deno.KvConsistencyLevel }
): Promise<Deno.KvEntryMaybe<ExtractSchema<S, AbstractKeys<K>>>> {
  return kv.get<K>(key, options) as Promise<
    Deno.KvEntryMaybe<ExtractSchema<S, AbstractKeys<K>>>
  >;
}

/*#################################(getManyKV)######################################*/
/**
 * Get multiple values from the KV store
 * @example
 * ```ts
 * const [user1, user2] = await getManyKV(kv, [["user", 1], ["user", 2]]);
 * ```
 */
export function getManyKV<S extends KvSchema, K extends ExtractKeys<S>[]>(
  kv: inSpatialKV<S>,
  keys: readonly [...K],
  options?: { consistency?: Deno.KvConsistencyLevel }
): Promise<{
  [I in keyof K]: Deno.KvEntryMaybe<ExtractSchema<S, AbstractKeys<K[I]>>>;
}> {
  return kv.getMany(keys, options);
}

/*#################################(deleteKV)######################################*/
/**
 * Delete a value from the KV store
 */
export function deleteKV<S extends KvSchema>(
  kv: inSpatialKV<S>,
  key: ExtractKeys<S>
): Promise<void> {
  return kv.delete(key);
}

/*#################################(listKV)######################################*/

/**
 * List values from the KV store
 */
export function listKV<S extends KvSchema, K extends ExtractKeys<S>>(
  kv: inSpatialKV<S>,
  selector: Deno.KvListSelector & {
    prefix?: K;
    start?: K;
    end?: K;
  },
  options?: Deno.KvListOptions
): Deno.KvListIterator<ExtractSchema<S, AbstractKeys<K>>> {
  return kv.list(selector, options);
}

/*#################################(enqueueKV)######################################*/

/**
 * Enqueue a value into the KV store queue
 * @example
 * ```ts
 * // Simple enqueue
 * await enqueueKV(kv, { id: "123", name: "John" });
 *
 * // With delay and fallback keys
 * await enqueueKV(
 *   kv,
 *   { id: "123", name: "John" },
 *   {
 *     delay: 60000, // 1 minute delay
 *     keysIfUndelivered: [["user", 123]],
 *     backoffSchedule: [1000, 5000, 10000], // Retry after 1s, 5s, 10s
 *   }
 * );
 * ```
 */
export function enqueueKV<S extends KvSchema, K extends ExtractKeys<S>>(
  kv: inSpatialKV<S>,
  value: ExtractSchema<S, AbstractKeys<K>>,
  options?: {
    delay?: number;
    keysIfUndelivered?: K[];
    backoffSchedule?: number[];
  }
): Promise<Deno.KvCommitResult> {
  return kv.enqueue(value, options);
}

/*#################################(createKVQueueListener)######################################*/

/**
 * Create a queue listener for the KV store
 * @example
 * ```ts
 * // Create a listener
 * const listener = createKVQueueListener<UserSchema>(kv, async (message) => {
 *   console.log(message.value.name); // Type-safe access to user properties
 *   return true; // Return true to acknowledge successful processing
 * });
 *
 * // Start listening
 * await listener.listen();
 *
 * // Stop listening when needed
 * await listener.close();
 * ```
 */
export function createKVQueueListener<S extends KvSchema>(
  kv: inSpatialKV<S>,
  handler: Handler<S>
): {
  listen: () => Promise<void>;
  close: () => Promise<void>;
  isListening: boolean;
} {
  let isListening = false;
  let abortController: AbortController | null = null;

  async function listen(): Promise<void> {
    if (isListening) return;
    isListening = true;
    abortController = new AbortController();

    try {
      await kv.listenQueue(async (message) => {
        try {
          await handler(message);
          return;
        } catch (error) {
          console.error("Queue message handling error:", error);
        }
      });
    } catch (error) {
      if (abortController?.signal.aborted) {
        console.log("Queue listener stopped");
      } else {
        console.error("Queue listener error:", error);
      }
    } finally {
      isListening = false;
      abortController = null;
    }
  }

  function close(): Promise<void> {
    if (!isListening || !abortController) return Promise.resolve();
    abortController.abort();
    isListening = false;
    return Promise.resolve();
  }

  return {
    listen,
    close,
    get isListening() {
      return isListening;
    },
  };
}

/*#################################(listenKVQueue)######################################*/

type Message<S extends KvSchema> = {
  value: ExtractSchema<S, any>;
  versionstamp: string;
};

type Middleware<S extends KvSchema> = (
  message: Message<S>,
  next: () => Promise<void>
) => Promise<void>;

type Handler<S extends KvSchema> = (message: Message<S>) => Promise<boolean>;

interface QueueProcessorAPI<S extends KvSchema> {
  use: (middleware: Middleware<S>) => QueueProcessorAPI<S>;
  handle: (handler: Handler<S>) => QueueProcessorAPI<S>;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  readonly isRunning: boolean;
}

/**
 * Simple utility to listen to the queue directly
 * @example
 * ```ts
 * // Start listening
 * listenKVQueue<UserSchema>(kv, async (message) => {
 *   console.log(message.value.name);
 *   return true;
 * });
 * ```
 */
export function listenKVQueue<S extends KvSchema>(
  kv: inSpatialKV<S>,
  handler: (message: {
    value: ExtractSchema<S, any>;
    versionstamp: string;
  }) => Promise<boolean>
): Promise<void> {
  return kv.listenQueue(async (message) => {
    await handler(message);
  });
}

/**
 * Create a typed queue processor with middleware support
 * @example
 * ```ts
 * const processor = createKVQueueProcessor<UserSchema>(kv)
 *   .use(async (message, next) => {
 *     console.log('Processing:', message.value.name);
 *     await next();
 *     console.log('Processed:', message.value.name);
 *   })
 *   .handle(async (message) => {
 *     await processUser(message.value);
 *     return true;
 *   });
 *
 * // Start processing
 * await processor.start();
 *
 * // Stop processing
 * await processor.stop();
 * ```
 */
export function createKVQueueProcessor<S extends KvSchema>(
  kv: inSpatialKV<S>
): QueueProcessorAPI<S> {
  type Message = { value: ExtractSchema<S, any>; versionstamp: string };
  type Middleware = (
    message: Message,
    next: () => Promise<void>
  ) => Promise<void>;
  type Handler = (message: Message) => Promise<boolean>;

  const middlewares: Middleware[] = [];
  let handler: Handler | null = null;
  let listener: ReturnType<typeof createKVQueueListener<S>> | null = null;

  function use(middleware: Middleware) {
    middlewares.push(middleware);
    return api;
  }

  function handle(finalHandler: Handler) {
    handler = finalHandler;
    return api;
  }

  async function executeMiddlewareChain(message: Message): Promise<boolean> {
    if (!handler) throw new Error("No handler registered");

    let index = 0;

    const next = async (): Promise<void> => {
      if (index < middlewares.length) {
        await middlewares[index++](message, next);
      } else {
        await handler!(message);
      }
    };

    try {
      await next();
      return true;
    } catch (error) {
      console.error("Queue processing error:", error);
      return false;
    }
  }

  async function start() {
    if (!handler) throw new Error("No handler registered");
    if (listener) return;

    listener = createKVQueueListener(kv, executeMiddlewareChain);
    await listener.listen();
  }

  async function stop() {
    if (!listener) return;
    await listener.close();
    listener = null;
  }

  const api = {
    use,
    handle,
    start,
    stop,
    get isRunning() {
      return listener?.isListening ?? false;
    },
  };

  return api;
}

/*#################################(watchKV)######################################*/
/**
 * Watch for changes to the given keys in the KV store
 * @example
 * ```ts
 * const stream = watchKV(kv, [["user", 1], ["user", 2]]);
 * for await (const entries of stream) {
 *   console.log(entries[0].value); // { id: string, name: string } | null
 *   console.log(entries[1].value); // { id: string, name: string } | null
 * }
 * ```
 */
export function watchKV<S extends KvSchema, K extends ExtractKeys<S>[]>(
  kv: inSpatialKV<S>,
  keys: readonly [...K],
  options?: { raw?: boolean }
): ReadableStream<{
  [I in keyof K]: Deno.KvEntryMaybe<ExtractSchema<S, AbstractKeys<K[I]>>>;
}> {
  return kv.watch(keys, options);
}

// Helper function to make watching easier with async iteration
/**
 * Creates an async iterator for watching KV store changes
 * @example
 * ```ts
 * const changes = createKVWatcher(kv, [["user", 1], ["user", 2]]);
 *
 * try {
 *   for await (const entries of changes) {
 *     // Handle changes
 *     console.log(entries[0].value?.name);
 *     console.log(entries[1].value?.id);
 *   }
 * } catch (error) {
 *   console.error('Watch error:', error);
 * }
 * ```
 */
export async function* createKVWatcher<
  S extends KvSchema,
  K extends ExtractKeys<S>[],
>(
  kv: inSpatialKV<S>,
  keys: readonly [...K],
  options?: { raw?: boolean }
): AsyncIterableIterator<{
  [I in keyof K]: Deno.KvEntryMaybe<ExtractSchema<S, AbstractKeys<K[I]>>>;
}> {
  const stream = watchKV(kv, keys, options);
  const reader = stream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

/*#################################(closeKV)######################################*/
/**
 * Safely close the KV store connection and cleanup any active listeners
 * @example
 * ```ts
 * const kv = new inSpatialKV<UserSchema>();
 *
 * // ... use the KV store ...
 *
 * // When done, safely close everything
 * await closeKV(kv);
 * ```
 */
export function closeKV<S extends KvSchema>(kv: inSpatialKV<S>): Promise<void> {
  try {
    kv.close();
    return Promise.resolve();
  } catch (error) {
    console.error("Error closing KV connection:", error);
    return Promise.reject(error);
  }
}

/*-----------------------------------------------------------------------------------------
/*-----------------------------------------------------------------------------------------
START OF ATOMIC OPERATIONS KEY-VALUE FUNCTIONS
-----------------------------------------------------------------------------------------*/
/*-----------------------------------------------------------------------------------------*/

/*################################################################################
ATOMIC OPERATION TYPES
################################################################################*/

interface AtomicCheck {
  key: Deno.KvKey;
  versionstamp: string | null;
}

/*################################################################################
ATOMIC OPERATION CLASS
################################################################################*/

export class InSpatialAtomicOperation<S extends KvSchema> {
  private operation: Deno.AtomicOperation;

  constructor(operation: Deno.AtomicOperation) {
    this.operation = operation;
  }

  /**
   * Add checks to ensure version matches
   */
  check(...checks: AtomicCheck[]): this {
    this.operation.check(...checks);
    return this;
  }

  /**
   * Set a value atomically
   */
  set<K extends ExtractKeys<S>>(
    key: K,
    value: ExtractSchema<S, AbstractKeys<K>>,
    options?: { expireIn?: number }
  ): this {
    this.operation.set(key, value, options);
    return this;
  }

  /**
   * Delete a key atomically
   */
  delete(key: ExtractKeys<S>): this {
    this.operation.delete(key);
    return this;
  }

  /**
   * Enqueue a value atomically
   */
  enqueue<K extends ExtractKeys<S>>(
    value: ExtractSchema<S, AbstractKeys<K>>,
    options?: {
      delay?: number;
      keysIfUndelivered?: K[];
      backoffSchedule?: number[];
    }
  ): this {
    this.operation.enqueue(value, options);
    return this;
  }

  /**
   * Add mutations atomically
   */
  mutate(...mutations: Deno.KvMutation[]): this {
    this.operation.mutate(...mutations);
    return this;
  }

  /**
   * Add to a number value atomically
   */
  sum(key: ExtractKeys<S>, n: bigint): this {
    this.operation.sum(key, n);
    return this;
  }

  /**
   * Set minimum value atomically
   */
  min(key: ExtractKeys<S>, n: bigint): this {
    this.operation.min(key, n);
    return this;
  }

  /**
   * Set maximum value atomically
   */
  max(key: ExtractKeys<S>, n: bigint): this {
    this.operation.max(key, n);
    return this;
  }

  /**
   * Commit the atomic operation
   */
  commit(): Promise<Deno.KvCommitResult | Deno.KvCommitError> {
    return this.operation.commit();
  }
}

/*################################################################################
UTILITY FUNCTIONS
################################################################################*/

/**
 * An atomic operation is a set of operations that are executed atomically
 * This is useful for ensuring that multiple operations are executed together
 * and that the operations are executed in the order they are added
 * @example
 * ```ts
 * const result = await atomic(kv)
 *   .check({ key: ["user", 1], versionstamp: "v1" })
 *   .set(["user", 1], { id: "123", name: "John" })
 *   .delete(["user", 2])
 *   .commit();
 *
 * if (!result.ok) {
 *   console.log("Operation failed due to version mismatch");
 * }
 * ```
 */
export function atomic<S extends KvSchema>(
  kv: inSpatialKV<S>
): InSpatialAtomicOperation<S> {
  return new InSpatialAtomicOperation<S>(kv.atomic());
}

/**
 * Execute an optimistic transaction with retries
 * @example
 * ```ts
 * const result = await transaction(kv, async (tx) => {
 *   const user = await getKV(kv, ["user", 1]);
 *   if (!user.value) throw new Error("User not found");
 *
 *   return tx
 *     .check({ key: ["user", 1], versionstamp: user.versionstamp })
 *     .set(["user", 1], { ...user.value, name: "Updated Name" });
 * });
 * ```
 */
export async function transaction<S extends KvSchema, T>(
  kv: inSpatialKV<S>,
  executor: (
    tx: InSpatialAtomicOperation<S>
  ) => Promise<InSpatialAtomicOperation<S>>,
  maxRetries = 5
): Promise<Deno.KvCommitResult> {
  let attempts = 0;
  while (attempts < maxRetries) {
    attempts++;
    const tx = atomic(kv);
    const operation = await executor(tx);
    const result = await operation.commit();

    if (result.ok) return result;

    if (attempts === maxRetries) {
      throw new Error(`Transaction failed after ${maxRetries} attempts`);
    }

    // Exponential backoff
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * Math.pow(2, attempts) * 100)
    );
  }

  throw new Error("Unreachable");
}
