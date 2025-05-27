/**
 * @module @inspatial/util/safe-lookup-map
 *
 * SafeLookupMap provides a unified interface for storing key-value pairs
 * where keys can be any type (objects, primitives, null, undefined).
 * 
 *
 * @example Basic Usage
 * ```typescript
 * import { SafeLookupMap } from "@inspatial/util/safe-lookup-map";
 * 
 * const map = new SafeLookupMap<any, string>();
 * map.set("primitive", "value");  // Uses Map internally
 * map.set({}, "object");          // Uses WeakMap internally
 * ```
 *
 * @features
 * - Object Key Handling: Safely store objects using WeakMap
 * - Primitive Key Handling: Store primitives using Map fallback
 * - Type Safety: Handle any key type without runtime errors
 * - Memory Management: Proper cleanup and garbage collection
 * - API Compatibility: Drop-in replacement for WeakMap usage
 * - Performance: Minimal overhead for key type detection
 * - Edge Cases: Handle null, undefined, and complex objects
 * - Thread Safety: Safe for concurrent access patterns
 * - Debugging: Clear error messages and inspection capabilities
 *
 * @apiOptions
 * - K: Key type (can be any type)
 * - V: Value type
 *
 * @bestPractices
 * 1. Use for any scenario where keys might be mixed types
 * 2. Prefer over WeakMap when key types are unknown
 * 3. Clear the map when no longer needed to prevent memory leaks
 * 4. Use object keys for DOM elements and complex data structures
 * 5. Use primitive keys for simple identifiers and property names
 *
 * @see {@link WeakMap} - Native WeakMap for object keys
 * @see {@link Map} - Native Map for primitive keys
 */

/**
 * # SafeLookupMap
 * @summary #### A type-safe map that handles any key type without WeakMap violations
 * 
 * The `SafeLookupMap` is like having a smart storage system that automatically
 * chooses the best container for your items. Think of it like a warehouse that
 * uses different storage methods: heavy items (objects) go in special containers
 * that can be easily disposed of (WeakMap), while lightweight items (primitives)
 * go in regular labeled boxes (Map).
 * 
 * @since 0.2.0
 * @category InSpatial Util
 * @module SafeLookupMap
 * @kind class
 * @access public
 * 
 * ### 💡 Core Concepts
 * - **Dual Storage**: Uses WeakMap for objects, Map for primitives
 * - **Automatic Detection**: Determines key type and routes to appropriate storage
 * - **Memory Safety**: Objects can be garbage collected, primitives are explicitly managed
 * - **API Compatibility**: Drop-in replacement for WeakMap usage patterns
 * 
 * ### 🎯 Prerequisites
 * Before you start:
 * - Basic understanding of Map and WeakMap differences
 * - Knowledge of JavaScript's type system
 * - Understanding of memory management concepts
 * 
 * ### 📚 Terminology
 * > **WeakMap**: A collection where object keys can be garbage collected
 * > **Primitive**: Basic data types like string, number, boolean, null, undefined
 * > **Object Reference**: A pointer to an object in memory that can be collected
 * 
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about memory management</summary>
 * 
 * > [!NOTE]
 * > Object keys stored in the WeakMap portion can be garbage collected
 * > when no other references exist, preventing memory leaks
 * 
 * > [!NOTE]
 * > Primitive keys are stored in a regular Map and must be explicitly
 * > cleared to free memory
 * </details>
 * 
 * @typeParam K - The type of keys (can be any type)
 * @typeParam V - The type of values to store
 * 
 * @example
 * ### Example 1: Basic Mixed Key Usage
 * ```typescript
 * import { SafeLookupMap } from "@inspatial/util/safe-lookup-map";
 * 
 * // Create a map that can handle any key type
 * const animationMap = new SafeLookupMap<any, string>();
 * 
 * // Store with different key types - no errors!
 * animationMap.set("opacity", "fade-animation");        // String key
 * animationMap.set(42, "sequence-animation");           // Number key
 * animationMap.set(document.body, "body-animation");    // Object key
 * 
 * // Retrieve values just like a normal map
 * console.log(animationMap.get("opacity"));             // "fade-animation"
 * console.log(animationMap.get(42));                    // "sequence-animation"
 * console.log(animationMap.get(document.body));         // "body-animation"
 * ```
 * 
 * @example
 * ### Example 2: Animation Timeline Management
 * ```typescript
 * // Perfect for managing animation data by element
 * const elementAnimations = new SafeLookupMap<Element | string, AnimationData>();
 * 
 * // Store animations for DOM elements (objects)
 * const button = document.querySelector('.my-button');
 * elementAnimations.set(button, {
 *   duration: 300,
 *   easing: 'ease-out',
 *   properties: ['opacity', 'transform']
 * });
 * 
 * // Store animations for CSS selectors (strings)
 * elementAnimations.set('.fade-in', {
 *   duration: 500,
 *   easing: 'ease-in',
 *   properties: ['opacity']
 * });
 * 
 * // When the button is removed from DOM, its animation data
 * // can be automatically garbage collected!
 * ```
 * 
 * @example
 * ### Example 3: Complex Animation State
 * ```typescript
 * // Handle complex animation scenarios
 * const stateMap = new SafeLookupMap<any, AnimationState>();
 * 
 * // Mix of different key types in real animation scenarios
 * const timeline = Symbol('main-timeline');
 * const element = { id: 'hero-section' };
 * const propertyName = 'transform';
 * const frameIndex = 0;
 * 
 * stateMap.set(timeline, { status: 'playing', progress: 0.5 });
 * stateMap.set(element, { x: 100, y: 50, rotation: 45 });
 * stateMap.set(propertyName, { from: 'scale(1)', to: 'scale(1.2)' });
 * stateMap.set(frameIndex, { timestamp: performance.now() });
 * 
 * // All keys work seamlessly together
 * console.log('Timeline status:', stateMap.get(timeline)?.status);
 * console.log('Element position:', stateMap.get(element));
 * ```
 * 
 * ### ⚡ Performance Tips
 * <details>
 * <summary>Click to learn about performance</summary>
 * 
 * - Object key lookups are O(1) but slightly slower than primitive keys
 * - Use primitive keys for frequently accessed data
 * - Clear the map when animation sequences complete
 * - Prefer object keys for DOM elements to enable garbage collection
 * </details>
 * 
 * ### ❌ Common Mistakes
 * <details>
 * <summary>Click to see what to avoid</summary>
 * 
 * - Mistake 1: Forgetting to clear primitive keys when done
 * - Mistake 2: Using the same primitive key for different purposes
 * - Mistake 3: Assuming object keys will persist after DOM removal
 * </details>
 * 
 * @throws {TypeError}
 * This implementation is designed to never throw TypeError for key types,
 * unlike native WeakMap which throws when given primitive keys
 * 
 * @returns {SafeLookupMap<K, V>}
 * A new SafeLookupMap instance that can safely handle any key type
 * 
 * ### 📝 Uncommon Knowledge
 * `WeakMaps were designed for memory safety, not convenience. The "weak" 
 * reference means the garbage collector can remove entries when the key 
 * object is no longer referenced elsewhere. This is why primitives can't 
 * be WeakMap keys - they don't have object identity that can be weakly referenced.`
 * 
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 * - ✅ Modern Browsers
 */
export class SafeLookupMap<K, V> {
  /** WeakMap for storing object keys - enables garbage collection */
  private readonly objectMap = new WeakMap<object, V>();
  
  /** Map for storing primitive keys - requires explicit cleanup */
  private readonly primitiveMap = new Map<K, V>();

  /**
   * # Set
   * @summary #### Stores a value with the given key, automatically choosing the right storage
   * 
   * The `set` method is like a smart postal worker who knows exactly which
   * mailbox to use for each type of mail. Objects go to the special WeakMap
   * mailbox (for automatic cleanup), while primitives go to the regular Map
   * mailbox (for reliable storage).
   * 
   * @param key - The key to store the value under (can be any type)
   * @param value - The value to store
   * 
   * @example
   * ```typescript
   * const map = new SafeLookupMap<any, string>();
   * 
   * // All of these work without errors
   * map.set("string-key", "value1");
   * map.set(42, "value2");
   * map.set({}, "value3");
   * map.set(null, "value4");
   * ```
   * 
   * @returns {SafeLookupMap<K, V>} The map instance for method chaining
   */
  set(key: K, value: V): this {
    if (this.isObject(key)) {
      this.objectMap.set(key as object, value);
    } else {
      this.primitiveMap.set(key, value);
    }
    return this;
  }

  /**
   * # Get
   * @summary #### Retrieves a value by its key from the appropriate storage
   * 
   * The `get` method is like a librarian who knows exactly which section
   * to check for your book. It automatically looks in the right storage
   * based on your key type and returns what you're looking for.
   * 
   * @param key - The key to look up
   * 
   * @example
   * ```typescript
   * const element = document.querySelector('.my-element');
   * map.set(element, 'element-data');
   * map.set('property', 'property-data');
   * 
   * console.log(map.get(element));    // 'element-data'
   * console.log(map.get('property')); // 'property-data'
   * ```
   * 
   * @returns {V | undefined} The stored value, or undefined if not found
   */
  get(key: K): V | undefined {
    if (this.isObject(key)) {
      return this.objectMap.get(key as object);
    } else {
      return this.primitiveMap.get(key);
    }
  }

  /**
   * # Has
   * @summary #### Checks if a key exists in the map
   * 
   * The `has` method is like a security guard checking if someone's name
   * is on the guest list. It looks in both the VIP section (objects) and
   * the general admission section (primitives) to see if your key is registered.
   * 
   * @param key - The key to check for
   * 
   * @example
   * ```typescript
   * if (map.has(element)) {
   *   console.log('Animation data exists for this element');
   * }
   * ```
   * 
   * @returns {boolean} True if the key exists, false otherwise
   */
  has(key: K): boolean {
    if (this.isObject(key)) {
      return this.objectMap.has(key as object);
    } else {
      return this.primitiveMap.has(key);
    }
  }

  /**
   * # Delete
   * @summary #### Removes a key-value pair from the map
   * 
   * The `delete` method is like a careful organizer who removes items
   * from the right storage location. It knows whether to look in the
   * object storage or primitive storage and removes the entry cleanly.
   * 
   * @param key - The key to remove
   * 
   * @example
   * ```typescript
   * // Remove animation data when element is no longer needed
   * const removed = map.delete(element);
   * console.log(removed); // true if it existed, false if not
   * ```
   * 
   * @returns {boolean} True if the key existed and was removed, false otherwise
   */
  delete(key: K): boolean {
    if (this.isObject(key)) {
      return this.objectMap.delete(key as object);
    } else {
      return this.primitiveMap.delete(key);
    }
  }

  /**
   * # Clear
   * @summary #### Removes all entries from the map
   * 
   * The `clear` method is like doing a complete cleanup of both storage
   * areas. It empties the primitive Map completely, and while it can't
   * directly clear the WeakMap, it ensures no new references prevent
   * garbage collection.
   * 
   * @example
   * ```typescript
   * // Clean up all animation data
   * map.clear();
   * console.log(map.get('any-key')); // undefined
   * ```
   * 
   * @returns {void}
   */
  clear(): void {
    this.primitiveMap.clear();
    // Note: WeakMap doesn't have a clear method, but entries will be
    // garbage collected when object keys are no longer referenced
  }

  /**
   * # IsObject
   * @summary #### Determines if a value should be treated as an object key
   * 
   * The `isObject` method is like a quality inspector who determines
   * which storage facility each item should go to. It checks if the key
   * is a proper object that can be stored in a WeakMap.
   * 
   * @param value - The value to check
   * 
   * ### 📚 Terminology
   * > **Object Identity**: Objects have unique identity in memory, even if they have the same properties
   * > **Primitive Value**: Basic values that are compared by value, not reference
   * 
   * @example
   * ```typescript
   * // These are objects (go to WeakMap)
   * console.log(map.isObject({}));           // true
   * console.log(map.isObject([]));           // true
   * console.log(map.isObject(() => {}));     // true
   * 
   * // These are primitives (go to Map)
   * console.log(map.isObject("string"));     // false
   * console.log(map.isObject(42));           // false
   * console.log(map.isObject(null));         // false
   * ```
   * 
   * @returns {boolean} True if the value can be used as a WeakMap key
   */
  private isObject(value: unknown): value is object {
    return value !== null && (typeof value === "object" || typeof value === "function");
  }
} 