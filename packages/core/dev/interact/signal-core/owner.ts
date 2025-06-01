/**
 * @module @in/teract/signal-core/owner
 *
 * This module provides ownership tracking for reactive scopes, enabling nested tracking
 * scopes with automatic cleanup. Think of it like a company's organizational chart where
 * each manager (owner) is responsible for their team members (child computations) and
 * can delegate responsibilities while maintaining clear hierarchical accountability.
 *
 * Owner tracking is used to enable nested tracking scopes with automatic cleanup.
 * We also use owners to keep track of which error handling context we are in.
 *
 * @example Basic Owner Tree Structure
 * ```typescript
 * import { createRoot } from "@in/teract/signal-core/create-root.ts";
 *
 * // Creates a tree structure like:
 * //    a
 * //   /|\
 * //  b-c-e
 * //    |
 * //    d
 *
 * const a = createRoot(() => {
 *   const b = createRoot(() => {});
 *   const c = createRoot(() => {
 *     const d = createRoot(() => {});
 *   });
 *   const e = createRoot(() => {});
 * });
 * ```
 *
 * @features
 * - **Hierarchical Scope Management**: Organize reactive computations in a tree structure
 * - **Automatic Cleanup**: When a parent scope is disposed, all children are automatically cleaned up
 * - **Context Propagation**: Context values flow from parent to child scopes
 * - **Error Handling**: Error handlers are inherited and can be overridden at different levels
 * - **Resource Management**: Track disposable resources and ensure proper cleanup
 * - **Scope Isolation**: Each owner maintains its own context and disposal mechanisms
 * - **Queue Management**: Each scope can have its own execution queue for effects
 * - **Tree Traversal**: Efficient sibling and parent navigation through linked list structure
 * - **Lifecycle Management**: Track the state of each scope (clean, disposed, etc.)
 *
 * @example Advanced Owner Management
 * ```typescript
 * import { createRoot, getOwner, setOwner } from "@in/teract/signal-core";
 *
 * // Create a root scope with error handling
 * createRoot(() => {
 *   const owner = getOwner();
 *   console.log("Current owner:", owner);
 *
 *   // Child scope inherits context
 *   createRoot(() => {
 *     const childOwner = getOwner();
 *     console.log("Child owner parent:", childOwner._parent === owner);
 *   });
 * });
 * ```
 *
 * @example Owner Context and Error Handling
 * ```typescript
 * // Error handling propagation through owner tree
 * createRoot(() => {
 *   const owner = getOwner();
 *
 *   // Set up error handler for this scope and all children
 *   owner._handlers = [(error, owner) => {
 *     console.log("Caught error in scope:", error);
 *   }];
 *
 *   createRoot(() => {
 *     // This child inherits the error handler
 *     throw new Error("Child error"); // Will be caught by parent handler
 *   });
 * });
 * ```
 *
 * @example Cleanup and Resource Management
 * ```typescript
 * import { onCleanup } from "@in/teract/signal-core/on-cleanup.ts";
 *
 * createRoot((dispose) => {
 *   // Register cleanup functions
 *   onCleanup(() => console.log("Cleaning up resource 1"));
 *   onCleanup(() => console.log("Cleaning up resource 2"));
 *
 *   createRoot(() => {
 *     onCleanup(() => console.log("Child cleanup"));
 *   });
 *
 *   // When dispose() is called, all cleanups run in reverse order
 *   setTimeout(dispose, 1000);
 * });
 * ```
 *
 * @example Custom Owner Management
 * ```typescript
 * // Advanced scope management with custom contexts
 * createRoot(() => {
 *   const owner = getOwner();
 *
 *   // Set custom context for this scope
 *   owner._context = {
 *     ...owner._context,
 *     theme: "dark",
 *     user: { id: 123, name: "Ben" }
 *   };
 *
 *   createRoot(() => {
 *     // Child automatically inherits parent context
 *     const childOwner = getOwner();
 *     console.log(childOwner._context.theme); // "dark"
 *     console.log(childOwner._context.user.name); // "Ben"
 *   });
 * });
 * ```
 *
 * @apiOptions
 * - signal: boolean - Whether to create a signal-only owner (doesn't auto-append to current)
 * - context: ContextRecordType - Custom context object for the owner
 * - handlers: ErrorHandlerType[] - Error handlers for this scope
 * - queue: IQueueType - Custom execution queue for effects
 * - disposal: DisposableType[] - Cleanup functions to run on disposal
 *
 * @bestPractices
 * 1. Always create reactive computations within a root scope for proper cleanup
 * 2. Use nested scopes to isolate resources and provide logical grouping
 * 3. Set up error handlers at appropriate levels in the owner hierarchy
 * 4. Register cleanup functions for any resources that need explicit disposal
 * 5. Avoid manual owner manipulation unless building advanced reactive primitives
 *
 * @see {@link createRoot} - Creates a new reactive scope with an owner
 * @see {@link onCleanup} - Registers cleanup functions with the current owner
 * @see {@link createContext} - Uses owner tree for context value lookup
 * @see {@link createEffect} - Effects are owned and cleaned up automatically
 */

import { STATE_CLEAN, STATE_DISPOSED } from "./constants.ts";
import type { ComputationClass } from "./core.ts";

import { globalQueue, type IQueueType } from "./scheduler.ts";
import {
  ContextRecordType,
  DisposableType,
  ErrorHandlerType,
} from "./types.ts";

/**
 * # CurrentOwner
 * @summary #### The currently active reactive owner scope that manages computations and cleanup
 *
 * Think of `currentOwner` like a "manager in charge" badge that gets passed around in an organization.
 * Whoever holds this badge is currently responsible for any new employees (reactive computations)
 * that get hired (created). When you create a new computation, it automatically reports to
 * whoever is currently wearing the badge.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Owner
 * @kind variable
 * @access public
 *
 * ### 💡 Core Concepts
 * - Tracks which owner scope is currently executing
 * - New computations automatically attach to the current owner
 * - Can be null when executing outside any reactive scope
 * - Used internally by the reactive system for ownership tracking
 *
 * ### 📚 Terminology
 * > **Current Owner**: The reactive scope that's currently executing and will own new computations
 * > **Ownership**: The relationship between a scope and the computations it manages
 * > **Scope**: A bounded context where reactive computations can be created and managed
 *
 * @type {OwnerClass | null} The currently active owner, or null if outside any reactive scope
 */
export let currentOwner: OwnerClass | null = null;

/**
 * # DefaultContext
 * @summary #### The base context object inherited by all new owners when no parent context exists
 *
 * Think of `defaultContext` like the company's standard employee handbook that everyone gets
 * when they join. Even if a new employee (owner) doesn't have a specific manager (parent),
 * they still get this basic set of policies and information to work with.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Owner
 * @kind constant
 * @access public
 *
 * ### 💡 Core Concepts
 * - Provides a baseline context for owners without parents
 * - Ensures all owners have a context object to work with
 * - Prevents null/undefined context errors in the system
 * - Can be extended by individual owners for their specific needs
 *
 * @type {ContextRecordType} An empty object that serves as the base context
 */
export const defaultContext = {};

/**
 * # GetOwner
 * @summary #### Returns the currently executing reactive owner scope
 *
 * Think of `getOwner` like asking "Who's my current manager?" in a company. It tells you
 * which scope (manager) is currently in charge and would be responsible for any new work
 * (reactive computations) you create. This is useful when you need to know your current
 * context or want to create computations under a specific owner.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Owner
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Provides access to the current reactive scope
 * - Returns null when called outside any reactive context
 * - Used by reactive primitives to determine ownership
 * - Essential for understanding the current execution context
 *
 * ### 🎯 Prerequisites
 * Before you start:
 * - Understanding of reactive scopes and ownership
 * - Knowledge of when reactive contexts are active
 * - Familiarity with the reactive system's lifecycle
 *
 * ### 📚 Terminology
 * > **Owner**: A reactive scope that manages child computations and resources
 * > **Reactive Context**: The environment where reactive operations can safely execute
 * > **Scope**: A bounded execution context with its own lifetime and resources
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about owner access</summary>
 *
 * > [!NOTE]
 * > Returns null when called outside reactive scopes (not an error)
 *
 * > [!NOTE]
 * > The returned owner may change as execution moves between scopes
 *
 * > [!NOTE]
 * > Useful for advanced patterns like manual computation creation
 * </details>
 *
 * ### 🎮 Usage
 * #### Installation
 * ```bash
 * # Deno
 * deno add jsr:@in/teract
 * ```
 *
 * #### Examples
 *
 * @example
 * ### Example 1: Basic Owner Access
 * ```typescript
 * import { createRoot, getOwner } from "@in/teract/signal-core";
 *
 * // Outside any scope
 * console.log(getOwner()); // null
 *
 * createRoot(() => {
 *   // Inside a reactive scope
 *   const owner = getOwner();
 *   console.log(owner !== null); // true
 *   console.log(owner instanceof OwnerClass); // true
 *
 *   // Check owner properties
 *   console.log("Owner state:", owner._state);
 *   console.log("Has parent:", owner._parent !== null);
 * });
 * ```
 *
 * @example
 * ### Example 2: Advanced Owner Inspection
 * ```typescript
 * import { createRoot, getOwner, createEffect } from "@in/teract/signal-core";
 *
 * createRoot(() => {
 *   const rootOwner = getOwner();
 *   console.log("Root owner context:", rootOwner._context);
 *
 *   createRoot(() => {
 *     const childOwner = getOwner();
 *     console.log("Child owner parent:", childOwner._parent === rootOwner); // true
 *     console.log("Context inherited:", childOwner._context !== rootOwner._context); // true but values copied
 *
 *     createEffect(() => {
 *       const effectOwner = getOwner();
 *       console.log("Effect runs in child scope:", effectOwner === childOwner); // true
 *
 *       // Owner provides context for error handling, cleanup, etc.
 *       if (effectOwner._handlers) {
 *         console.log("Error handlers available:", effectOwner._handlers.length);
 *       }
 *     });
 *   });
 * });
 * ```
 *
 * @returns {OwnerClass | null} The currently executing owner scope, or null if called
 * outside any reactive context. Think of this as your "employee badge" that shows
 * which department (scope) you're currently working in.
 *
 * ### 📝 Uncommon Knowledge
 * getOwner() returns the same owner instance throughout a single reactive execution,
 * but the owner can change between different reactive computations. This means you
 * can safely cache the owner within a single computation, but shouldn't cache it
 * across different reactive boundaries.
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 *
 * ### 🔗 Related Resources
 * - {@link setOwner} - Changes the current owner context
 * - {@link createRoot} - Creates a new owner scope
 * - {@link OwnerClass} - The owner class that manages reactive scopes
 */
export function getOwner(): OwnerClass | null {
  return currentOwner;
}

/**
 * # SetOwner
 * @summary #### Changes the currently active reactive owner scope and returns the previous one
 *
 * Think of `setOwner` like handing the "manager in charge" badge to someone else in an organization.
 * You take the badge from the current manager, give it to a new manager, and get back information
 * about who was previously in charge. This allows you to temporarily change who's responsible
 * for new work, then restore the original manager later.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Owner
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Changes which owner scope is currently active
 * - Returns the previous owner for later restoration
 * - Used internally by reactive primitives for scope management
 * - Enables advanced patterns like manual computation ownership
 *
 * ### 🎯 Prerequisites
 * Before you start:
 * - Deep understanding of reactive scope management
 * - Knowledge of when and why to change ownership
 * - Experience with advanced reactive patterns
 *
 * ### 📚 Terminology
 * > **Owner Switch**: Changing which scope is currently active
 * > **Scope Restoration**: Returning to a previous owner after temporary changes
 * > **Manual Ownership**: Explicitly controlling which owner manages computations
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about owner switching</summary>
 *
 * > [!NOTE]
 * > This is an advanced API - most users should use createRoot instead
 *
 * > [!NOTE]
 * > Always restore the previous owner to avoid scope leaks
 *
 * > [!NOTE]
 * > Used internally by reactive primitives for proper scope management
 * </details>
 *
 * @param {OwnerClass | null} owner - The new owner to set as current. Pass null to clear
 *   the current owner. Think of this as the new manager you're giving the badge to.
 *
 * ### 🎮 Usage
 * #### Installation
 * ```bash
 * # Deno
 * deno add jsr:@in/teract
 * ```
 *
 * #### Examples
 *
 * @example
 * ### Example 1: Basic Owner Switching
 * ```typescript
 * import { createRoot, getOwner, setOwner } from "@in/teract/signal-core";
 *
 * createRoot(() => {
 *   const originalOwner = getOwner();
 *   console.log("Original owner:", originalOwner);
 *
 *   // Temporarily clear the owner
 *   const previousOwner = setOwner(null);
 *   console.log("Current owner after clear:", getOwner()); // null
 *   console.log("Previous owner returned:", previousOwner === originalOwner); // true
 *
 *   // Restore the original owner
 *   setOwner(originalOwner);
 *   console.log("Owner restored:", getOwner() === originalOwner); // true
 * });
 * ```
 *
 * @example
 * ### Example 2: Advanced Manual Computation Management
 * ```typescript
 * import { createRoot, setOwner, getOwner, ComputationClass } from "@in/teract/signal-core";
 *
 * createRoot(() => {
 *   const parentOwner = getOwner();
 *
 *   createRoot(() => {
 *     const childOwner = getOwner();
 *
 *     // Create a computation under the parent instead of child
 *     const prevOwner = setOwner(parentOwner);
 *
 *     // Any computations created here belong to parentOwner
 *     const computation = new ComputationClass(42, null);
 *     console.log("Computation parent:", computation._parent === parentOwner); // true
 *
 *     // Restore the child owner
 *     setOwner(prevOwner);
 *     console.log("Owner restored to child:", getOwner() === childOwner); // true
 *   });
 * });
 * ```
 *
 * @returns {OwnerClass | null} The previously active owner, which you can use to restore
 * the original context later. Think of this as the "receipt" showing who was previously
 * in charge before you made the change.
 *
 * ### 📝 Uncommon Knowledge
 * setOwner is primarily used internally by reactive primitives to ensure computations
 * are created under the correct owner. For example, when a createEffect runs, it
 * temporarily sets itself as the owner so any nested computations are properly
 * managed by the effect's lifecycle.
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 *
 * ### 🔗 Related Resources
 * - {@link getOwner} - Gets the current owner context
 * - {@link createRoot} - High-level API for creating owner scopes
 * - {@link OwnerClass} - The owner class that manages reactive scopes
 */
export function setOwner(owner: OwnerClass | null): OwnerClass | null {
  const out = currentOwner;
  if (false && __DEV__ && currentOwner !== owner) {
    console.log(
      `[SET OWNER] Changing currentOwner from ${
        currentOwner ? "exists" : "null"
      } to ${owner ? "exists" : "null"}`
    );
  }
  currentOwner = owner;
  return out;
}

/**
 * # OwnerClass
 * @summary #### Manages reactive scopes, cleanup, context, and error handling in a hierarchical structure
 *
 * Think of `OwnerClass` like a department manager in a large corporation. Each manager (owner)
 * is responsible for their team members (reactive computations), maintains their own budget and
 * resources (context), handles team problems (error handling), and ensures proper cleanup when
 * the department is reorganized or closed down.
 *
 * The owner system creates a tree structure where each owner can have children (sub-departments)
 * and siblings (peer departments), enabling organized resource management and automatic cleanup
 * when portions of the reactive system are no longer needed.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Owner
 * @kind class
 * @access public
 *
 * ### 💡 Core Concepts
 * - **Hierarchical Management**: Organizes reactive computations in a tree structure
 * - **Automatic Cleanup**: When disposed, all child owners and computations are cleaned up
 * - **Context Inheritance**: Child owners inherit parent context but can override values
 * - **Error Propagation**: Error handlers flow from parent to child with override capabilities
 * - **Resource Tracking**: Maintains disposal functions for proper resource management
 * - **Queue Management**: Each owner can have its own execution queue for effects
 *
 * ### 🎯 Prerequisites
 * Before working with owners:
 * - Understanding of reactive programming concepts
 * - Knowledge of hierarchical data structures
 * - Familiarity with resource management patterns
 * - Basic understanding of error handling strategies
 *
 * ### 📚 Terminology
 * > **Owner Tree**: The hierarchical structure of reactive scopes
 * > **Disposal**: The process of cleaning up an owner and its resources
 * > **Context Inheritance**: How child scopes receive parent values
 * > **Error Boundary**: An owner that handles errors from its children
 * > **Sibling Linkage**: How peer owners are connected in the tree structure
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about owner management</summary>
 *
 * > [!NOTE]
 * > Owners form a flattened linked list for efficient traversal
 *
 * > [!NOTE]
 * > Children are added in reverse order to optimize append operations
 * - Context objects are shallow-copied to balance inheritance and isolation
 * - Disposal processes children iteratively to avoid stack overflow
 * </details>
 *
 * ### 🎮 Usage
 * #### Installation
 * ```bash
 * # Deno
 * deno add jsr:@in/teract
 * ```
 *
 * #### Examples
 *
 * @example
 * ### Example 1: Basic Owner Lifecycle
 * ```typescript
 * import { OwnerClass, setOwner } from "@in/teract/signal-core";
 * import { onCleanup } from "@in/teract/signal-core/on-cleanup.ts";
 *
 * // Create a root owner manually
 * const rootOwner = new OwnerClass(true); // true = signal owner, doesn't auto-append
 * const prevOwner = setOwner(rootOwner);
 *
 * try {
 *   // Register cleanup function
 *   onCleanup(() => {
 *     console.log("Root owner cleanup");
 *   });
 *
 *   // Create child owner
 *   const childOwner = new OwnerClass(); // Auto-appends to current owner
 *   console.log("Child parent:", childOwner._parent === rootOwner); // true
 *
 *   setOwner(childOwner);
 *   onCleanup(() => {
 *     console.log("Child owner cleanup");
 *   });
 *
 * } finally {
 *   // Cleanup and restore
 *   rootOwner.dispose();
 *   setOwner(prevOwner);
 * }
 * ```
 *
 * @example
 * ### Example 2: Advanced Context and Error Handling
 * ```typescript
 * import { OwnerClass, setOwner } from "@in/teract/signal-core";
 *
 * // Create owner with custom context
 * const appOwner = new OwnerClass(true);
 * appOwner._context = {
 *   theme: "dark",
 *   user: { id: 123, name: "Ben" },
 *   permissions: ["read", "write"]
 * };
 *
 * // Set up error handling
 * appOwner._handlers = [(error, owner) => {
 *   console.log(`Error in ${owner === appOwner ? 'app' : 'child'} scope:`, error.message);
 *   // Handle error gracefully
 * }];
 *
 * const prevOwner = setOwner(appOwner);
 *
 * try {
 *   // Create child that inherits context and error handling
 *   const featureOwner = new OwnerClass();
 *   console.log("Inherited theme:", featureOwner._context.theme); // "dark"
 *   console.log("Has error handlers:", featureOwner._handlers.length > 0); // true
 *
 *   // Override context in child
 *   featureOwner._context = {
 *     ...featureOwner._context,
 *     theme: "light", // Override parent theme
 *     feature: "dashboard" // Add new context
 *   };
 *
 *   setOwner(featureOwner);
 *
 *   // Simulate error that gets caught by parent handler
 *   try {
 *     throw new Error("Feature error");
 *   } catch (error) {
 *     featureOwner.handleError(error); // Propagates to app owner handler
 *   }
 *
 * } finally {
 *   appOwner.dispose();
 *   setOwner(prevOwner);
 * }
 * ```
 *
 * ### ⚡ Performance Tips
 * <details>
 * <summary>Click to learn about performance</summary>
 *
 * - Owners use a flattened linked list structure for efficient traversal
 * - Children are stored in reverse order to optimize append operations
 * - Context objects are shallow-copied to balance inheritance and isolation
 * - Disposal processes children iteratively to avoid stack overflow
 * </details>
 *
 * ### ❌ Common Mistakes
 * <details>
 * <summary>Click to see what to avoid</summary>
 *
 * - **Manual owner creation**: Use createRoot instead for most cases
 * - **Forgetting disposal**: Always dispose owners to prevent memory leaks
 * - **Context mutation**: Don't modify inherited context directly, create new objects
 * - **Missing error handlers**: Set up error boundaries at appropriate levels
 * </details>
 *
 * @throws {Error} Any unhandled errors from child computations or disposal functions
 *
 * ### 📝 Uncommon Knowledge
 * The owner tree is "largely orthogonal to the reactivity tree" - this means
 * the owner hierarchy (who manages whom) is separate from the dependency graph
 * (who depends on whom). An effect might be owned by one scope but depend on
 * signals from completely different scopes.
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 *
 * ### 🔗 Related Resources
 * - {@link createRoot} - High-level API for creating owner scopes
 * - {@link getOwner} - Gets the current owner context
 * - {@link setOwner} - Changes the current owner context
 */
export class OwnerClass {
  // We flatten the owner tree into a linked list so that we don't need a pointer to .firstChild
  // However, the children are actually added in reverse creation order
  // See comment at the top of the file for an example of the _nextSibling traversal
  _parent: OwnerClass | null = null;
  _nextSibling: OwnerClass | null = null;
  _prevSibling: OwnerClass | null = null;

  _state: number = STATE_CLEAN;

  _disposal: DisposableType | DisposableType[] | null = null;
  _context: ContextRecordType = defaultContext;
  _handlers: ErrorHandlerType[] | null = null;
  _queue: IQueueType = globalQueue;

  /**
   * # Constructor
   * @summary #### Creates a new owner scope with optional auto-append behavior
   *
   * @param {boolean} [signal=false] - Whether this is a signal-only owner that doesn't
   *   automatically append to the current owner. Think of this as creating an
   *   independent contractor (true) vs a regular employee (false) who reports
   *   to the current manager.
   */
  constructor(signal = false) {
    if (false && __DEV__) {
      console.log(
        `[OWNER CONSTRUCTOR] Creating owner, currentOwner: ${
          currentOwner ? "exists" : "null"
        }, signal: ${signal}, will append: ${!!(currentOwner && !signal)}`
      );
    }
    if (currentOwner && !signal) currentOwner.append(this);
  }

  /**
   * # append
   * @summary #### Adds a child owner to this owner's tree structure
   *
   * Think of this like a manager adding a new team member to their department.
   * The new member gets access to departmental resources (context), follows
   * company policies (error handlers), and uses the department's workflow
   * system (queue).
   *
   * @param {OwnerClass} child - The child owner to append to this owner
   */
  append(child: OwnerClass): void {
    child._parent = this;
    child._prevSibling = this;

    if (this._nextSibling) this._nextSibling._prevSibling = child;
    child._nextSibling = this._nextSibling;
    this._nextSibling = child;

    if (child._context !== this._context) {
      child._context = { ...this._context, ...child._context };
    }

    if (this._handlers) {
      child._handlers = !child._handlers
        ? this._handlers
        : [...child._handlers, ...this._handlers];
    }

    if (this._queue) child._queue = this._queue;
  }

  /**
   * # dispose
   * @summary #### Cleans up this owner and optionally all its children
   *
   * Think of this like closing down a department in a company. If you're doing
   * a full shutdown (self=true), you close your own department and all sub-departments.
   * If you're just reorganizing (self=false), you close all the sub-departments
   * but keep your own department running.
   *
   * @param {boolean} [self=true] - Whether to dispose this owner itself or just its children
   */
  dispose(this: OwnerClass, self = true): void {
    if (this._state === STATE_DISPOSED) return;

    if (false && __DEV__) {
      console.log(
        `[DISPOSE] 🗑️ Disposing owner ${
          (this as any)._name || "unnamed"
        }, self=${self}, children: ${
          this._nextSibling ? "has children" : "no children"
        }`
      );
    }

    let head = self ? this._prevSibling || this._parent : this,
      current = this._nextSibling,
      next: ComputationClass | null = null;

    // Debug log the children found
    if (false && __DEV__) {
      let childCount = 0;
      let childCurrent = this._nextSibling;
      while (childCurrent && childCurrent!._parent === this) {
        console.log(
          `[DISPOSE] 👶 Found child #${childCount}: ${
            (childCurrent as any)._name || "unnamed"
          }, state: ${childCurrent!._state}`
        );
        childCount++;
        const nextSibling = childCurrent!
          ._nextSibling as ComputationClass | null;
        childCurrent = nextSibling;
      }
      console.log(`[DISPOSE] 📊 Total children to dispose: ${childCount}`);
    }

    while (current && current._parent === this) {
      if (false && __DEV__) {
        console.log(
          `[DISPOSE] 🗑️ Disposing child: ${(current as any)._name || "unnamed"}`
        );
      }
      current.dispose(true);
      current._disposeNode();
      next = current._nextSibling as ComputationClass | null;
      current._nextSibling = null;
      current = next;
    }

    if (self) this._disposeNode();
    if (current) current._prevSibling = !self ? this : this._prevSibling;
    if (head) head._nextSibling = current;
  }

  /**
   * # _disposeNode
   * @summary #### Internal method to dispose this specific owner node
   *
   * Think of this like completing the paperwork when an employee leaves -
   * updating records, clearing access badges, and running any final
   * cleanup procedures.
   *
   * @access private
   */
  _disposeNode(): void {
    if (false && __DEV__) {
      console.log(
        `[DISPOSE NODE] 💀 Setting state to DISPOSED for ${
          (this as any)._name || "unnamed"
        }`
      );
    }
    if (this._prevSibling) this._prevSibling._nextSibling = null;
    this._parent = null;
    this._prevSibling = null;
    this._context = defaultContext;
    this._handlers = null;
    this._state = STATE_DISPOSED;
    this.emptyDisposal();
  }

  /**
   * # emptyDisposal
   * @summary #### Runs all registered disposal functions for cleanup
   *
   * Think of this like executing a department's shutdown checklist -
   * returning equipment, canceling subscriptions, and completing
   * any final tasks before closing.
   */
  emptyDisposal(): void {
    if (!this._disposal) return;

    if (Array.isArray(this._disposal)) {
      for (let i = 0; i < this._disposal.length; i++) {
        const callable = this._disposal[i];
        callable.call(callable);
      }
    } else {
      this._disposal.call(this._disposal);
    }

    this._disposal = null;
  }

  /**
   * # handleError
   * @summary #### Processes errors through the owner's error handling chain
   *
   * Think of this like escalating a problem through management levels.
   * Each manager (error handler) gets a chance to resolve the issue.
   * If they can't handle it, it gets passed to the next level up
   * until someone resolves it or it reaches the top.
   *
   * @param {unknown} error - The error to handle
   * @throws {unknown} The error if no handler can resolve it
   */
  handleError(error: unknown): void {
    if (!this._handlers) throw error;

    let i = 0,
      len = this._handlers.length;

    for (i = 0; i < len; i++) {
      try {
        this._handlers[i](error, this);
        break; // error was handled.
      } catch (e) {
        error = e;
      }
    }

    // Error was not handled as we exhausted all handlers.
    if (i === len) throw error;
  }
}

/**
 * # NoOwnerErrorClass
 * @summary #### Indicates an operation requiring a reactive owner was called outside any reactive scope
 *
 * Think of `NoOwnerErrorClass` like a security system that alerts you when someone tries to use
 * company equipment without being logged into the system. Certain operations in the reactive
 * system need to know "who's in charge" (which owner scope is active) to work properly.
 * When these operations are called outside any reactive scope, this error is thrown.
 *
 * This commonly happens when you try to create reactive computations or access context
 * outside of a `createRoot` scope, similar to trying to use a hotel key card when you
 * haven't checked into any room.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Owner
 * @kind class
 * @access public
 * @extends Error
 *
 * ### 💡 Core Concepts
 * - Signals operations that require a reactive scope but were called without one
 * - Helps developers identify when reactive APIs are used incorrectly
 * - Provides clear error messages to guide proper usage
 * - Prevents undefined behavior in the reactive system
 *
 * ### 🎯 Prerequisites
 * Before working with this error:
 * - Understanding of reactive scopes and when they're active
 * - Knowledge of which operations require reactive contexts
 * - Familiarity with createRoot and other scope-creating functions
 *
 * ### 📚 Terminology
 * > **Reactive Scope**: An active context where reactive operations can safely execute
 * > **Owner Requirement**: When an operation needs a scope to manage its lifecycle
 * > **Context Access**: Operations that need to look up values in the owner tree
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about this error</summary>
 *
 * > [!NOTE]
 * > Most commonly occurs with onCleanup, getContext, and similar functions
 *
 * > [!NOTE]
 * > Can be resolved by wrapping code in createRoot or similar scope creators
 *
 * > [!NOTE]
 * > The error message includes helpful details in development mode
 * </details>
 *
 * ### 🎮 Usage
 *
 * @example
 * ### Example 1: Common Error Scenario
 * ```typescript
 * import { onCleanup } from "@in/teract/signal-core/on-cleanup.ts";
 * import { createRoot } from "@in/teract/signal-core/create-root.ts";
 *
 * // ❌ This will throw NoOwnerErrorClass
 * try {
 *   onCleanup(() => console.log("cleanup"));
 * } catch (error) {
 *   console.log(error instanceof NoOwnerErrorClass); // true
 *   console.log(error.message); // "Context can only be accessed under a reactive root."
 * }
 *
 * // ✅ This works correctly
 * createRoot(() => {
 *   onCleanup(() => console.log("cleanup")); // No error
 * });
 * ```
 *
 * @example
 * ### Example 2: Context Access Error
 * ```typescript
 * import { createContext, getContext, setContext } from "@in/teract/signal-core/create-context.ts";
 *
 * const ThemeContext = createContext("light");
 *
 * // ❌ This will throw NoOwnerErrorClass
 * try {
 *   const theme = getContext(ThemeContext);
 * } catch (error) {
 *   console.log("Cannot access context outside reactive scope");
 *   console.log(error instanceof NoOwnerErrorClass); // true
 * }
 *
 * // ✅ This works correctly
 * createRoot(() => {
 *   setContext(ThemeContext, "dark");
 *   const theme = getContext(ThemeContext); // No error
 *   console.log(theme); // "dark"
 * });
 * ```
 *
 * ### ❌ Common Mistakes
 * <details>
 * <summary>Click to see what causes this error</summary>
 *
 * - **Top-level reactive calls**: Calling onCleanup, getContext outside any scope
 * - **Async boundary crossing**: Calling reactive APIs from setTimeout/Promise callbacks
 * - **Event handler issues**: Using reactive APIs in event handlers without proper scope
 * - **Module initialization**: Trying to create reactive state during module loading
 * </details>
 *
 * @throws {NoOwnerErrorClass} When the error is created and thrown
 *
 * ### 📝 Uncommon Knowledge
 * This error is actually a feature, not a bug. It prevents silent failures and
 * undefined behavior that would occur if reactive operations were allowed to
 * execute without proper lifecycle management. The error forces you to think
 * about scope and ownership, leading to more robust applications.
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 *
 * ### 🔗 Related Resources
 * - {@link createRoot} - Creates a reactive scope to avoid this error
 * - {@link getOwner} - Checks if there's a current reactive scope
 * - {@link onCleanup} - Common function that requires a reactive scope
 */
export class NoOwnerErrorClass extends Error {
  /**
   * # Constructor
   * @summary #### Creates a new NoOwnerErrorClass with an informative error message
   *
   * @param {string} [details] - Optional additional details about where the error occurred.
   *   In development mode, this provides extra context to help debug the issue.
   *   Think of this as adding a note about which specific operation failed.
   */
  constructor(details?: string) {
    let baseMsg = __DEV__
      ? "Context can only be accessed under a reactive root."
      : "";
    if (__DEV__ && details) baseMsg += ` Details: ${details}`;
    super(baseMsg);
  }
}
