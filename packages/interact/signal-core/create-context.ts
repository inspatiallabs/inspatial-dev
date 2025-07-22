import type { ContextType } from "./types.ts";
import { NoOwnerErrorClass, OwnerClass, currentOwner } from "./owner.ts";
import { isUndefined } from "./utils.ts";
import { __DEV__ } from "./constants.ts";

/**
 * # CreateContext
 * @summary #### Creates a new reactive context for sharing data across component boundaries without prop drilling
 *
 * Think of `createContext` like setting up a hotel's room service system. You create a central service
 * (the context) that can deliver specific items (your data) to any room (component) in the hotel,
 * without having to physically carry the items through every hallway and elevator (passing props
 * through every component). Guests can simply call room service from anywhere in the building and
 * request what they need.
 *
 * The context acts as a dependency injection mechanism, allowing you to provide data at a high level
 * in your component tree and access it from any nested component without having to manually thread
 * it through intermediate components that don't need the data themselves.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module CreateContext
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Provides a way to share data across component boundaries without prop drilling
 * - Creates a unique context identifier that can be used to store and retrieve values
 * - Supports optional default values that are used when no explicit value is provided
 * - Works with the reactive owner system to determine scope and availability
 *
 * ### 🎯 Prerequisites
 * Before you start:
 * - Understanding of component trees and prop drilling problems
 * - Basic knowledge of dependency injection patterns
 * - Familiarity with reactive scopes and owners in InSpatial
 *
 * ### 📚 Terminology
 * > **Context**: A mechanism for sharing data across component boundaries without explicit prop passing
 * > **Prop Drilling**: The process of passing data through multiple component layers that don't use the data
 * > **Default Value**: A fallback value used when no explicit value has been provided in the component tree
 * > **Context Provider**: A component that provides a value for a specific context to its descendants
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about context usage</summary>
 *
 * > [!NOTE]
 * > Contexts should be used sparingly - overuse can make component relationships unclear
 *
 * > [!NOTE]
 * > Default values are only used when no provider exists in the component tree
 *
 * > [!NOTE]
 * > Context values must be accessed within a reactive scope (inside createInteractiveRoot, createEffect, etc.)
 * </details>
 *
 * @template T - The type of data this context will hold
 * @param {T} [defaultValue] - Optional default value used when no provider exists in the component tree.
 *   Think of this as the "standard room service menu" that's available even when no special catering
 *   has been arranged for a particular event.
 * @param {string} [description] - Optional description for debugging purposes. This helps identify
 *   the context in development tools and error messages, like putting a name tag on your hotel
 *   room service system.
 *
 * ### 🎮 Usage
 * #### Installation
 * ```bash
 * # Deno
 * deno add jsr:@in/teract
 * ```
 *
 * #### Examples
 * Here's how you might use contexts in real applications:
 *
 * @example
 * ### Example 1: Basic User Authentication Context
 * ```typescript
 * import { createContext, getContext, setContext } from "@in/teract/signal-core/create-context.ts";
 * import { createInteractiveRoot } from "@in/teract/signal-core/create-root.ts";
 *
 * // Create a context for user authentication data
 * interface User {
 *   id: number;
 *   name: string;
 *   role: 'admin' | 'user';
 * }
 *
 * // Create context with a default "guest" user
 * const UserContext = createContext<User>({
 *   id: 0,
 *   name: "Guest",
 *   role: "user"
 * }, "UserAuthentication");
 *
 * // In your app root, provide the actual user data
 * createInteractiveRoot(() => {
 *   const currentUser: User = {
 *     id: 123,
 *     name: "Ben Smith",
 *     role: "admin"
 *   };
 *
 *   // Set the context value for all child components
 *   setContext(UserContext, currentUser);
 *
 *   // Now any nested component can access the user data
 *   const user = getContext(UserContext);
 *   console.log(`Welcome, ${user.name}!`); // "Welcome, Ben Smith!"
 *   console.log(`Role: ${user.role}`); // "Role: admin"
 * });
 * ```
 *
 * @example
 * ### Example 2: Advanced Multi-Feature Application Context
 * ```typescript
 * // Complex application configuration context
 * interface AppConfig {
 *   theme: {
 *     primaryColor: string;
 *     darkMode: boolean;
 *   };
 *   api: {
 *     baseUrl: string;
 *     timeout: number;
 *   };
 *   features: {
 *     newDashboard: boolean;
 *     betaFeatures: boolean;
 *   };
 *   i18n: {
 *     language: string;
 *     translations: Record<string, string>;
 *   };
 * }
 *
 * // Create context with comprehensive defaults
 * const AppConfigContext = createContext<AppConfig>({
 *   theme: { primaryColor: "#3b82f6", darkMode: false },
 *   api: { baseUrl: "/api", timeout: 5000 },
 *   features: { newDashboard: false, betaFeatures: false },
 *   i18n: { language: "en", translations: { welcome: "Welcome" } }
 * }, "ApplicationConfiguration");
 *
 * // Root application setup
 * createInteractiveRoot(() => {
 *   // Advanced configuration based on user preferences and environment
 *   const userRole = "admin";
 *   const environment = "development";
 *
 *   const appConfig: AppConfig = {
 *     theme: {
 *       primaryColor: userRole === "admin" ? "#ef4444" : "#3b82f6",
 *       darkMode: true
 *     },
 *     api: {
 *       baseUrl: environment === "development" ? "http://localhost:3000/api" : "/api",
 *       timeout: environment === "development" ? 10000 : 5000
 *     },
 *     features: {
 *       newDashboard: userRole === "admin",
 *       betaFeatures: environment === "development"
 *     },
 *     i18n: {
 *       language: "es",
 *       translations: { welcome: "Bienvenido" }
 *     }
 *   };
 *
 *   setContext(AppConfigContext, appConfig);
 *
 *   // Components can access any part of the configuration
 *   const config = getContext(AppConfigContext);
 *   console.log(`Theme: ${config.theme.darkMode ? 'Dark' : 'Light'} mode`);
 *   console.log(`API: ${config.api.baseUrl}`);
 *   console.log(`Features: Dashboard=${config.features.newDashboard}`);
 *   console.log(`Language: ${config.i18n.language}`);
 * });
 * ```
 *
 * ### ⚡ Performance Tips
 * <details>
 * <summary>Click to learn about performance</summary>
 *
 * - Create contexts at module level, not inside components to avoid recreation
 * - Use specific contexts for different types of data rather than one large context
 * - Consider the scope of data - create contexts as close to where they're needed as possible
 * - Avoid putting frequently changing values in context if only a few components need them
 * </details>
 *
 * ### ❌ Common Mistakes
 * <details>
 * <summary>Click to see what to avoid</summary>
 *
 * - **Overusing context**: Not every piece of shared state needs context - sometimes prop drilling is clearer
 * - **Creating contexts inside components**: This recreates the context on every render
 * - **Forgetting default values**: Can lead to runtime errors if no provider exists
 * - **Using context for frequently changing data**: This can cause performance issues with many consumers
 * </details>
 *
 * @throws {ContextNotFoundErrorClass} When attempting to access a context that has no default value and no provider
 * @throws {NoOwnerErrorClass} When trying to access context outside of a reactive scope
 *
 * @returns {ContextType<T>} A context object with a unique identifier and the provided default value.
 * This object is used with `setContext` and `getContext` to provide and consume the context value.
 * Think of it as a "service request form" that components can use to ask for specific data.
 *
 * ### 📝 Uncommon Knowledge
 * Context isn't magic - it's essentially a lookup table attached to the reactive owner tree.
 * When you call `getContext`, it walks up the owner hierarchy looking for the first ancestor
 * that has a value for that context. This means you can have multiple "providers" for the
 * same context at different levels, with inner providers shadowing outer ones.
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 *
 * ### 🔗 Related Resources
 *
 * #### Internal References
 * - {@link getContext} - Retrieves a value from a context within the component tree
 * - {@link setContext} - Provides a value for a context to descendant components
 * - {@link createInteractiveRoot} - Creates a reactive scope where contexts can be provided and consumed
 *
 * @external GitHub
 * {@link https://github.com/inspatiallabs/inspatial-core GitHub Repository}
 * Source code and issue tracking
 */
export function createContext<T>(
  defaultValue?: T,
  description?: string
): ContextType<T> {
  return { id: Symbol(description), defaultValue };
}

/**
 * # ContextNotFoundErrorClass
 * @summary #### Signals an attempt to access a context without a provided or default value.
 *
 * When using `useContext` to access a context value, the context must either have a default
 * value defined at its creation (with `createContext`) or a value must have been provided
 * higher up in the reactive component tree. If neither is true, this error is thrown.
 *
 * Think of it like asking for a specific tool from a shared toolbox. If the tool wasn't
 * included by default and no one put it in for your current project, you wouldn't find it.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module Error
 * @class
 * @access public
 * @extends Error
 */
export class ContextNotFoundErrorClass extends Error {
  /**
   * # Constructor
   * @summary #### Creates an instance of ContextNotFoundErrorClass.
   * @param details - Optional additional details (primarily for development mode).
   */
  constructor(details?: string) {
    let baseMsg = __DEV__
      ? "Context must either be created with a default value or a value must be provided before accessing it."
      : "";
    if (__DEV__ && details) baseMsg += ` Details: ${details}`;
    super(baseMsg);
  }
}

/**
 * # GetContext
 * @summary #### Retrieves a value from a context within the current reactive scope
 *
 * Think of `getContext` like calling room service at a hotel. You use the service menu (context)
 * to request specific items (data), and the hotel staff looks through their inventory system
 * (the owner tree) to find what you've requested. They start from your floor (current scope)
 * and work their way up to higher floors (parent scopes) until they find the item or reach
 * the top floor (root scope).
 *
 * `getContext` walks up the reactive owner hierarchy to find the closest ancestor that has
 * provided a value for the specified context. If no value is found and the context has a
 * default value, that default is returned. If neither exists, an error is thrown.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module CreateContext
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Searches up the reactive owner tree for context values
 * - Returns the first matching value found in the hierarchy
 * - Falls back to default values when no provider exists
 * - Must be called within a reactive scope (inside createInteractiveRoot, createEffect, etc.)
 *
 * ### 🎯 Prerequisites
 * Before you start:
 * - Understanding of reactive scopes and the owner tree
 * - Knowledge of how context values are provided with setContext
 * - Familiarity with the concept of hierarchical data lookup
 *
 * ### 📚 Terminology
 * > **Reactive Owner**: A scope that can contain child computations and context values
 * > **Context Hierarchy**: The tree structure where contexts are searched from child to parent
 * > **Context Provider**: An ancestor scope that has set a value for a specific context
 * > **Default Value**: A fallback value defined when the context was created
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about context retrieval</summary>
 *
 * > [!NOTE]
 * > Must be called within a reactive scope - cannot be used in global scope
 *
 * > [!NOTE]
 * > Returns the value from the closest ancestor provider, not necessarily the root
 *
 * > [!NOTE]
 * > Throws an error if no value is found and no default was provided
 * </details>
 *
 * @template T - The type of data stored in the context
 * @param {ContextType<T>} context - The context object created by `createContext` that identifies
 *   which piece of data you want to retrieve. Think of this as the "item number" on a room service menu.
 * @param {OwnerClass | null} [owner=currentOwner] - Optional specific owner to search from.
 *   Usually omitted to use the current reactive scope. Think of this as specifying a particular
 *   room to search from instead of starting from your current location.
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
 * ### Example 1: Basic Context Retrieval
 * ```typescript
 * import { createContext, getContext, setContext } from "@in/teract/signal-core/create-context.ts";
 * import { createInteractiveRoot } from "@in/teract/signal-core/create-root.ts";
 *
 * // Create a theme context
 * const ThemeContext = createContext<string>("light", "AppTheme");
 *
 * createInteractiveRoot(() => {
 *   // Parent sets dark theme
 *   setContext(ThemeContext, "dark");
 *
 *   createInteractiveRoot(() => {
 *     // Child can access the theme
 *     const theme = getContext(ThemeContext);
 *     console.log(`Current theme: ${theme}`); // "Current theme: dark"
 *
 *     // Use the theme for styling decisions
 *     const backgroundColor = theme === "dark" ? "#1a1a1a" : "#ffffff";
 *     console.log(`Background: ${backgroundColor}`); // "Background: #1a1a1a"
 *   });
 * });
 * ```
 *
 * @example
 * ### Example 2: Advanced Hierarchical Context Access
 * ```typescript
 * interface UserPermissions {
 *   canRead: boolean;
 *   canWrite: boolean;
 *   canDelete: boolean;
 * }
 *
 * const PermissionsContext = createContext<UserPermissions>({
 *   canRead: true,
 *   canWrite: false,
 *   canDelete: false
 * }, "UserPermissions");
 *
 * createInteractiveRoot(() => {
 *   // Root level: basic user permissions
 *   setContext(PermissionsContext, {
 *     canRead: true,
 *     canWrite: true,
 *     canDelete: false
 *   });
 *
 *   console.log("=== Root Level ===");
 *   const rootPerms = getContext(PermissionsContext);
 *   console.log(`Root permissions:`, rootPerms);
 *
 *   createInteractiveRoot(() => {
 *     // Admin section: elevated permissions
 *     setContext(PermissionsContext, {
 *       canRead: true,
 *       canWrite: true,
 *       canDelete: true // Admin can delete
 *     });
 *
 *     console.log("=== Admin Section ===");
 *     const adminPerms = getContext(PermissionsContext);
 *     console.log(`Admin permissions:`, adminPerms);
 *
 *     createInteractiveRoot(() => {
 *       // Nested component: inherits admin permissions
 *       console.log("=== Nested Component ===");
 *       const nestedPerms = getContext(PermissionsContext);
 *       console.log(`Nested permissions:`, nestedPerms);
 *
 *       if (nestedPerms.canDelete) {
 *         console.log("Delete button enabled");
 *       }
 *     });
 *   });
 *
 *   // Back to root level: original permissions restored
 *   console.log("=== Back to Root ===");
 *   const backToRoot = getContext(PermissionsContext);
 *   console.log(`Root permissions again:`, backToRoot);
 * });
 * ```
 *
 * @throws {NoOwnerErrorClass} When called outside of a reactive scope (no current owner)
 * @throws {ContextNotFoundErrorClass} When no value is found and no default value was provided
 *
 * @returns {T} The context value from the closest provider in the owner hierarchy, or the default value
 * if no provider exists. Think of this as the "delivered item" from room service - you get exactly
 * what was requested, whether it came from your floor's pantry or the main kitchen.
 *
 * ### 📝 Uncommon Knowledge
 * Context lookup is a depth-first search up the owner tree, not the call stack.
 * This means the "closest" provider is determined by reactive scope nesting,
 * not function call nesting. A context set in a createEffect can be accessed
 * by a createMemo created in the same scope, even if they're called from
 * different functions.
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 *
 * ### 🔗 Related Resources
 * - {@link setContext} - Provides a value for descendants to access
 * - {@link hasContext} - Checks if a context value is available
 * - {@link createContext} - Creates the context identifier
 */
export function getContext<T>(
  context: ContextType<T>,
  owner: OwnerClass | null = currentOwner
): T {
  if (!owner) {
    const contextDetails =
      __DEV__ && context.id.description
        ? `context "${context.id.description}"`
        : "context";
    throw new NoOwnerErrorClass(
      `No owner found when trying to get ${contextDetails}. Ensure getContext is called within a reactive scope (e.g., createInteractiveRoot, createSignal, createMemo, createEffect).`
    );
  }

  const value = hasContext(context, owner)
    ? (owner._context[context.id] as T)
    : context.defaultValue;

  if (isUndefined(value)) {
    const contextDetails =
      __DEV__ && context.id.description
        ? `Context "${context.id.description}"`
        : "Context";
    throw new ContextNotFoundErrorClass(
      `${contextDetails} not found. Ensure a value was set via setContext in an ancestor scope.`
    );
  }

  return value;
}

/**
 * # SetContext
 * @summary #### Provides a value for a context that can be accessed by descendant reactive scopes
 *
 * Think of `setContext` like stocking a hotel floor's pantry with specific items. When you set
 * a context value, you're placing that item in the pantry for your current floor (reactive scope)
 * and all the rooms below it (child scopes). Any guest (component) on your floor or lower floors
 * can then call room service (getContext) and receive that item without having to go all the
 * way up to the main kitchen (root scope).
 *
 * `setContext` makes a value available to the current reactive scope and all of its descendants.
 * It creates a new context object to avoid conflicts, ensuring that child contexts don't
 * accidentally expose their values to parent scopes.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module CreateContext
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Provides context values to the current scope and all descendants
 * - Creates isolated context objects to prevent scope pollution
 * - Allows context shadowing where child scopes can override parent values
 * - Must be called within a reactive scope to have an owner to attach to
 *
 * ### 🎯 Prerequisites
 * Before you start:
 * - Understanding of reactive scopes and ownership
 * - Knowledge of how contexts are consumed with getContext
 * - Familiarity with the concept of hierarchical data provision
 *
 * ### 📚 Terminology
 * > **Context Provider**: The scope that calls setContext to provide a value
 * > **Context Shadowing**: When a child scope provides a different value for the same context
 * > **Scope Isolation**: Ensuring child context values don't leak to parent scopes
 * > **Context Inheritance**: How child scopes automatically see parent context values
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about context provision</summary>
 *
 * > [!NOTE]
 * > Must be called within a reactive scope - cannot be used in global scope
 *
 * > [!NOTE]
 * > Child scopes inherit parent contexts but can override them with their own values
 *
 * > [!NOTE]
 * > Setting undefined explicitly is different from not setting a value at all
 * </details>
 *
 * @template T - The type of data being provided to the context
 * @param {ContextType<T>} context - The context object created by `createContext` that identifies
 *   which type of data you're providing. Think of this as the "item category" you're stocking
 *   in the pantry.
 * @param {T} [value] - The value to provide for this context. If undefined, the context's default
 *   value will be used. Think of this as the actual "item" you're placing in the pantry for
 *   others to access.
 * @param {OwnerClass | null} [owner=currentOwner] - Optional specific owner to provide the context to.
 *   Usually omitted to use the current reactive scope. Think of this as specifying a particular
 *   floor's pantry instead of your current floor.
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
 * ### Example 1: Basic Context Provision
 * ```typescript
 * import { createContext, getContext, setContext } from "@in/teract/signal-core/create-context.ts";
 * import { createInteractiveRoot } from "@in/teract/signal-core/create-root.ts";
 *
 * // Create an API configuration context
 * interface ApiConfig {
 *   baseUrl: string;
 *   timeout: number;
 * }
 *
 * const ApiContext = createContext<ApiConfig>({
 *   baseUrl: "/api",
 *   timeout: 5000
 * }, "ApiConfiguration");
 *
 * createInteractiveRoot(() => {
 *   // Provide production API configuration
 *   const prodConfig: ApiConfig = {
 *     baseUrl: "https://api.production.com",
 *     timeout: 10000
 *   };
 *
 *   setContext(ApiContext, prodConfig);
 *
 *   // All child scopes can now access this configuration
 *   const config = getContext(ApiContext);
 *   console.log(`API URL: ${config.baseUrl}`); // "API URL: https://api.production.com"
 *   console.log(`Timeout: ${config.timeout}ms`); // "Timeout: 10000ms"
 * });
 * ```
 *
 * @example
 * ### Example 2: Advanced Context Shadowing and Inheritance
 * ```typescript
 * interface Environment {
 *   name: string;
 *   debug: boolean;
 *   apiUrl: string;
 * }
 *
 * const EnvironmentContext = createContext<Environment>({
 *   name: "development",
 *   debug: true,
 *   apiUrl: "http://localhost:3000"
 * }, "Environment");
 *
 * createInteractiveRoot(() => {
 *   // Global environment configuration
 *   setContext(EnvironmentContext, {
 *     name: "production",
 *     debug: false,
 *     apiUrl: "https://api.company.com"
 *   });
 *
 *   console.log("=== Production Environment ===");
 *   const prodEnv = getContext(EnvironmentContext);
 *   console.log(`Environment: ${prodEnv.name}, Debug: ${prodEnv.debug}`);
 *
 *   createInteractiveRoot(() => {
 *     // Testing environment: override with test-specific settings
 *     setContext(EnvironmentContext, {
 *       name: "testing",
 *       debug: true, // Enable debug for testing
 *       apiUrl: "https://api.test.company.com"
 *     });
 *
 *     console.log("=== Testing Environment (Shadowed) ===");
 *     const testEnv = getContext(EnvironmentContext);
 *     console.log(`Environment: ${testEnv.name}, Debug: ${testEnv.debug}`);
 *
 *     createInteractiveRoot(() => {
 *       // Nested scope: inherits testing environment
 *       console.log("=== Nested Scope (Inherited) ===");
 *       const nestedEnv = getContext(EnvironmentContext);
 *       console.log(`Environment: ${nestedEnv.name}, Debug: ${nestedEnv.debug}`);
 *
 *       // Make API calls using the inherited test environment
 *       console.log(`Making API call to: ${nestedEnv.apiUrl}`);
 *     });
 *
 *     // Demonstrate explicit undefined handling
 *     createInteractiveRoot(() => {
 *       // Explicitly set undefined to use default value
 *       setContext(EnvironmentContext, undefined);
 *
 *       console.log("=== Explicit Undefined (Uses Default) ===");
 *       const defaultEnv = getContext(EnvironmentContext);
 *       console.log(`Environment: ${defaultEnv.name}, Debug: ${defaultEnv.debug}`);
 *     });
 *   });
 *
 *   // Back to production scope: testing context no longer applies
 *   console.log("=== Back to Production Scope ===");
 *   const backToProd = getContext(EnvironmentContext);
 *   console.log(`Environment: ${backToProd.name}, Debug: ${backToProd.debug}`);
 * });
 * ```
 *
 * @throws {NoOwnerErrorClass} When called outside of a reactive scope (no current owner)
 *
 * @returns {void} This function doesn't return a value - it modifies the context state
 * for the current scope and its descendants. Think of it as placing an item in the pantry
 * rather than retrieving something.
 *
 * ### 📝 Uncommon Knowledge
 * setContext creates a new context object for each scope by copying the parent's
 * context and adding/overriding the specified value. This means contexts are
 * "copy-on-write" - child modifications don't affect parents, but parents can
 * still modify shared references if the context value is an object.
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 *
 * ### 🔗 Related Resources
 * - {@link getContext} - Retrieves values provided by setContext
 * - {@link hasContext} - Checks if a context value is available
 * - {@link createContext} - Creates the context identifier
 */
export function setContext<T>(
  context: ContextType<T>,
  value?: T,
  owner: OwnerClass | null = currentOwner
) {
  if (!owner) {
    const contextDetails =
      __DEV__ && context.id.description
        ? `context "${context.id.description}"`
        : "context";
    throw new NoOwnerErrorClass(
      `No owner found when trying to set ${contextDetails}. Ensure setContext is called within a reactive scope.`
    );
  }

  // We're creating a new object to avoid child context values being exposed to parent owners. If
  // we don't do this, everything will be a singleton and all hell will break lose.
  owner._context = {
    ...owner._context,
    [context.id]: isUndefined(value) ? context.defaultValue : value,
  };
}

/**
 * # HasContext
 * @summary #### Checks whether a context value is currently available in the reactive scope hierarchy
 *
 * Think of `hasContext` like checking the hotel's room service directory to see if a particular
 * item is available before actually ordering it. Instead of calling room service and potentially
 * getting an error (like `getContext` would throw), you first check the directory to see if
 * the item is stocked anywhere from your current floor up to the main kitchen.
 *
 * `hasContext` performs the same hierarchy search as `getContext` but returns a boolean
 * instead of the actual value. This allows you to conditionally access contexts or provide
 * fallback behavior without catching exceptions.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module CreateContext
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Safely checks for context availability without throwing errors
 * - Searches the same hierarchy as getContext but returns boolean
 * - Useful for conditional logic and fallback scenarios
 * - Can be called outside reactive scopes (returns false if no owner)
 *
 * ### 🎯 Prerequisites
 * Before you start:
 * - Understanding of reactive scopes and context hierarchy
 * - Knowledge of how contexts are provided and consumed
 * - Familiarity with defensive programming patterns
 *
 * ### 📚 Terminology
 * > **Context Availability**: Whether a context has been provided somewhere in the hierarchy
 * > **Defensive Programming**: Checking for conditions before attempting operations
 * > **Conditional Access**: Using availability checks to determine execution paths
 * > **Fallback Behavior**: Alternative actions when expected resources aren't available
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about context checking</summary>
 *
 * > [!NOTE]
 * > Returns false if called outside a reactive scope (graceful degradation)
 *
 * > [!NOTE]
 * > Only checks for existence, not whether the value is truthy or defined
 *
 * > [!NOTE]
 * > A context "exists" if it was explicitly set, even if set to undefined
 * </details>
 *
 * @template T - The type of data stored in the context (not used in return value)
 * @param {ContextType<T>} context - The context object created by `createContext` to check for.
 *   Think of this as the "item code" you're looking up in the room service directory.
 * @param {OwnerClass | null} [owner=currentOwner] - Optional specific owner to search from.
 *   Usually omitted to use the current reactive scope. Think of this as specifying which
 *   floor's directory to start searching from.
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
 * ### Example 1: Basic Context Availability Checking
 * ```typescript
 * import { createContext, getContext, setContext, hasContext } from "@in/teract/signal-core/create-context.ts";
 * import { createInteractiveRoot } from "@in/teract/signal-core/create-root.ts";
 *
 * interface UserPreferences {
 *   theme: string;
 *   language: string;
 * }
 *
 * // Context without default value
 * const PreferencesContext = createContext<UserPreferences>(undefined, "UserPreferences");
 *
 * createInteractiveRoot(() => {
 *   // Check if preferences are available before using them
 *   if (hasContext(PreferencesContext)) {
 *     const prefs = getContext(PreferencesContext);
 *     console.log(`Using custom theme: ${prefs.theme}`);
 *   } else {
 *     console.log("No preferences set, using defaults");
 *     // Use application defaults instead
 *     const defaultPrefs = { theme: "light", language: "en" };
 *     console.log(`Using default theme: ${defaultPrefs.theme}`);
 *   }
 *
 *   createInteractiveRoot(() => {
 *     // Provide preferences in child scope
 *     setContext(PreferencesContext, {
 *       theme: "dark",
 *       language: "es"
 *     });
 *
 *     // Now the context is available
 *     if (hasContext(PreferencesContext)) {
 *       const prefs = getContext(PreferencesContext);
 *       console.log(`Child scope using custom theme: ${prefs.theme}`);
 *     }
 *   });
 * });
 * ```
 *
 * @example
 * ### Example 2: Advanced Context-Aware Component Pattern
 * ```typescript
 * interface FeatureFlags {
 *   experimentalUI: boolean;
 *   newDashboard: boolean;
 *   betaFeatures: boolean;
 * }
 *
 * const FeatureFlagsContext = createContext<FeatureFlags>(undefined, "FeatureFlags");
 *
 * // Utility function to safely get feature flags
 * function getFeatureFlags(): FeatureFlags {
 *   if (hasContext(FeatureFlagsContext)) {
 *     return getContext(FeatureFlagsContext);
 *   }
 *   // Return safe defaults when no feature flags are configured
 *   return {
 *     experimentalUI: false,
 *     newDashboard: false,
 *     betaFeatures: false
 *   };
 * }
 *
 * // Component that adapts based on feature flag availability
 * function renderDashboard() {
 *   const flags = getFeatureFlags();
 *
 *   console.log("=== Dashboard Rendering ===");
 *   console.log(`Feature flags available: ${hasContext(FeatureFlagsContext)}`);
 *
 *   if (flags.newDashboard) {
 *     console.log("Rendering new dashboard UI");
 *     return "<!-- New Dashboard -->";
 *   } else {
 *     console.log("Rendering legacy dashboard UI");
 *     return "<!-- Legacy Dashboard -->";
 *   }
 * }
 *
 * createInteractiveRoot(() => {
 *   console.log("=== Without Feature Flags ===");
 *   renderDashboard(); // Uses defaults
 *
 *   createInteractiveRoot(() => {
 *     // Enable feature flags in a subsection
 *     setContext(FeatureFlagsContext, {
 *       experimentalUI: true,
 *       newDashboard: true,
 *       betaFeatures: false
 *     });
 *
 *     console.log("=== With Feature Flags ===");
 *     renderDashboard(); // Uses provided flags
 *
 *     // Demonstrate checking specific availability
 *     const hasFlags = hasContext(FeatureFlagsContext);
 *     console.log(`Can access feature flags: ${hasFlags}`);
 *
 *     if (hasFlags) {
 *       const flags = getContext(FeatureFlagsContext);
 *       console.log(`Experimental UI enabled: ${flags.experimentalUI}`);
 *     }
 *   });
 * });
 * ```
 *
 * @returns {boolean} `true` if the context has been provided somewhere in the owner hierarchy
 * (including if it was set to undefined), `false` if no provider exists or if called outside
 * a reactive scope. Think of this as whether the "item is listed in the directory" rather
 * than whether it's currently in stock.
 *
 * ### 📝 Uncommon Knowledge
 * hasContext returns true even if a context was explicitly set to undefined, because
 * "undefined" is considered a valid context value. This distinguishes between "no provider
 * exists" and "provider exists but set to undefined". Use this distinction for different
 * fallback strategies in your applications.
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 *
 * ### 🔗 Related Resources
 * - {@link getContext} - Retrieves the actual context value after checking with hasContext
 * - {@link setContext} - Provides values that hasContext will then detect
 * - {@link createContext} - Creates the context identifier to check for
 */
export function hasContext(
  context: ContextType<any>,
  owner: OwnerClass | null = currentOwner
): boolean {
  return !isUndefined(owner?._context[context.id]);
}
