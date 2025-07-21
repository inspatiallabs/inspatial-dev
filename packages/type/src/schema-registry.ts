/**
 * Schema Registry System for InSpatial Type
 *
 * This module provides a centralized registry for sharing type definitions
 * across your application. The registry enables you to store, retrieve,
 * and manage types with namespaces and versioning support.
 *
 * Key features:
 * - Store and retrieve type definitions
 * - Organize types with namespaces
 * - Track type versions
 * - Serialize the registry for persistence
 * - Create references to registered types
 *
 * @example
 * ```typescript
 * // Initialize the registry
 * const registry = SchemaRegistry.init();
 *
 * // Register some types
 * registry.register("User", UserType, "models");
 * registry.register("Product", ProductType, "models");
 *
 * // Use the types elsewhere
 * const User = typeRef("User", "models");
 * const validUser = User({ name: "Ben", age: 24 });
 * ```
 */

/**
 * SchemaRegistry - Global registry for type schemas
 *
 * A singleton class that provides a central repository for type definitions.
 * It allows organizing types into namespaces and tracking their versions.
 */
export class SchemaRegistry {
  private static instance: SchemaRegistry;
  private schemas: Map<string, any>;
  private namespaces: Map<string, Map<string, any>>;
  private versions: Map<string, Map<string, number>>;

  private constructor() {
    this.schemas = new Map();
    this.namespaces = new Map();
    this.versions = new Map();
  }

  /**
   * Get the SchemaRegistry instance
   *
   * Initializes the singleton instance if it doesn't exist yet.
   * This ensures there is only one registry throughout the application.
   *
   * @returns The SchemaRegistry singleton instance
   *
   * @example
   * ```typescript
   * const registry = SchemaRegistry.init();
   * ```
   */
  public static init(): SchemaRegistry {
    if (!SchemaRegistry.instance) {
      SchemaRegistry.instance = new SchemaRegistry();
    }
    return SchemaRegistry.instance;
  }

  /**
   * Register a schema with optional namespace
   *
   * Adds a type definition to the registry, optionally within a namespace.
   * You can also specify a version number for the schema.
   *
   * @param name Schema name
   * @param schema Schema definition
   * @param namespace Optional namespace
   * @param version Optional version number (default: 1)
   *
   * @example
   * ```typescript
   * // Register in global namespace
   * registry.register("User", UserType);
   *
   * // Register in a specific namespace
   * registry.register("Product", ProductType, "models");
   *
   * // Register with version
   * registry.register("User", UserTypeV2, "models", 2);
   * ```
   */
  public register(
    name: string,
    schema: any,
    namespace?: string,
    version: number = 1
  ): void {
    if (namespace) {
      // Create namespace if it doesn't exist
      if (!this.namespaces.has(namespace)) {
        this.namespaces.set(namespace, new Map());
        this.versions.set(namespace, new Map());
      }

      // Add schema to namespace
      const nsSchemas = this.namespaces.get(namespace)!;
      nsSchemas.set(name, schema);

      // Track version
      const nsVersions = this.versions.get(namespace)!;
      nsVersions.set(name, version);
    } else {
      // Add to global schemas
      this.schemas.set(name, schema);

      // Track version in global namespace
      if (!this.versions.has("global")) {
        this.versions.set("global", new Map());
      }
      const globalVersions = this.versions.get("global")!;
      globalVersions.set(name, version);
    }
  }

  /**
   * Get a schema by name and optional namespace
   *
   * Retrieves a registered type definition by its name and namespace.
   *
   * @param name Schema name
   * @param namespace Optional namespace
   * @returns The registered schema
   * @throws Error if the schema is not found
   *
   * @example
   * ```typescript
   * // Get from global namespace
   * const UserType = registry.get("User");
   *
   * // Get from specific namespace
   * const ProductType = registry.get("Product", "models");
   * ```
   */
  public get(name: string, namespace?: string): any {
    if (namespace) {
      const nsSchemas = this.namespaces.get(namespace);
      if (!nsSchemas || !nsSchemas.has(name)) {
        throw new Error(`Schema ${name} not found in namespace ${namespace}`);
      }
      return nsSchemas.get(name);
    } else {
      if (!this.schemas.has(name)) {
        throw new Error(`Schema ${name} not found`);
      }
      return this.schemas.get(name);
    }
  }

  /**
   * Check if a schema exists
   *
   * Tests whether a schema with the given name exists in the
   * specified namespace or the global namespace.
   *
   * @param name Schema name
   * @param namespace Optional namespace
   * @returns True if the schema exists
   *
   * @example
   * ```typescript
   * if (registry.has("User", "models")) {
   *   const UserType = registry.get("User", "models");
   * }
   * ```
   */
  public has(name: string, namespace?: string): boolean {
    if (namespace) {
      const nsSchemas = this.namespaces.get(namespace);
      return !!nsSchemas && nsSchemas.has(name);
    } else {
      return this.schemas.has(name);
    }
  }

  /**
   * Get schema version
   *
   * Retrieves the version number of a registered schema.
   *
   * @param name Schema name
   * @param namespace Optional namespace (default: "global")
   * @returns The schema version number
   * @throws Error if the schema or version is not found
   *
   * @example
   * ```typescript
   * const userVersion = registry.getVersion("User", "models");
   * console.log(`User schema version: ${userVersion}`);
   * ```
   */
  public getVersion(name: string, namespace: string = "global"): number {
    const nsVersions = this.versions.get(namespace);
    if (!nsVersions || !nsVersions.has(name)) {
      throw new Error(
        `Version for schema ${name} not found in namespace ${namespace}`
      );
    }
    return nsVersions.get(name)!;
  }

  /**
   * List all schemas in a namespace
   *
   * Returns an array of schema names in the specified namespace
   * or in the global namespace if none is specified.
   *
   * @param namespace Optional namespace
   * @returns Array of schema names
   *
   * @example
   * ```typescript
   * // List all schemas in the "models" namespace
   * const modelSchemas = registry.list("models");
   * console.log(`Available models: ${modelSchemas.join(", ")}`);
   * ```
   */
  public list(namespace?: string): string[] {
    if (namespace) {
      const nsSchemas = this.namespaces.get(namespace);
      return nsSchemas ? Array.from(nsSchemas.keys()) : [];
    } else {
      return Array.from(this.schemas.keys());
    }
  }

  /**
   * Get information about a schema
   *
   * Returns metadata about a registered schema, including
   * its name, namespace, and version.
   *
   * @param name Schema name
   * @param namespace Optional namespace
   * @returns Schema metadata object
   * @throws Error if the schema is not found
   *
   * @example
   * ```typescript
   * const userInfo = registry.info("User", "models");
   * console.log(`User schema v${userInfo.version}`);
   * ```
   */
  public info(
    name: string,
    namespace?: string
  ): {
    name: string;
    namespace: string;
    version: number;
  } {
    const ns = namespace || "global";

    if (!this.has(name, namespace)) {
      throw new Error(`Schema ${name} not found in namespace ${ns}`);
    }

    return {
      name,
      namespace: ns,
      version: this.getVersion(name, ns),
    };
  }

  /**
   * Unregister a schema
   *
   * Removes a schema from the registry.
   *
   * @param name Schema name
   * @param namespace Optional namespace
   * @returns True if the schema was found and removed
   *
   * @example
   * ```typescript
   * // Remove a deprecated type
   * registry.unregister("OldUser", "models");
   * ```
   */
  public unregister(name: string, namespace?: string): boolean {
    if (namespace) {
      const nsSchemas = this.namespaces.get(namespace);
      const nsVersions = this.versions.get(namespace);

      if (!nsSchemas || !nsSchemas.has(name)) {
        return false;
      }

      nsSchemas.delete(name);
      if (nsVersions) {
        nsVersions.delete(name);
      }

      return true;
    } else {
      if (!this.schemas.has(name)) {
        return false;
      }

      this.schemas.delete(name);

      const globalVersions = this.versions.get("global");
      if (globalVersions) {
        globalVersions.delete(name);
      }

      return true;
    }
  }

  /**
   * Serialize all schemas to JSON
   *
   * Converts the entire registry (including all namespaces, schemas,
   * and versions) to a JSON string that can be stored or transmitted.
   *
   * @returns JSON string representation of the registry
   *
   * @example
   * ```typescript
   * // Save registry state
   * const json = registry.serialize();
   * localStorage.setItem("schemaRegistry", json);
   * ```
   */
  public serialize(): string {
    const serialized = {
      global: Object.fromEntries(this.schemas),
      namespaces: Object.fromEntries(
        Array.from(this.namespaces.entries()).map(([ns, schemas]) => [
          ns,
          Object.fromEntries(schemas),
        ])
      ),
      versions: Object.fromEntries(
        Array.from(this.versions.entries()).map(([ns, versions]) => [
          ns,
          Object.fromEntries(versions),
        ])
      ),
    };

    return JSON.stringify(serialized);
  }

  /**
   * Load schemas from serialized JSON
   *
   * Restores the registry state from a previously serialized JSON string.
   * This replaces the current registry content with the deserialized data.
   *
   * @param json Serialized schema registry
   * @throws Error if deserialization fails
   *
   * @example
   * ```typescript
   * // Load previously saved registry
   * const savedJson = localStorage.getItem("schemaRegistry");
   * if (savedJson) {
   *   registry.deserialize(savedJson);
   * }
   * ```
   */
  public deserialize(json: string): void {
    try {
      const data = JSON.parse(json);

      // Clear existing data
      this.schemas.clear();
      this.namespaces.clear();
      this.versions.clear();

      // Load global schemas
      if (data.global) {
        Object.entries(data.global).forEach(([name, schema]) => {
          this.schemas.set(name, schema);
        });
      }

      // Load namespaced schemas
      if (data.namespaces) {
        Object.entries(data.namespaces).forEach(([ns, schemas]) => {
          const nsMap = new Map();
          Object.entries(schemas as Record<string, any>).forEach(
            ([name, schema]) => {
              nsMap.set(name, schema);
            }
          );
          this.namespaces.set(ns, nsMap);
        });
      }

      // Load versions
      if (data.versions) {
        Object.entries(data.versions).forEach(([ns, versions]) => {
          const versionMap = new Map();
          Object.entries(versions as Record<string, number>).forEach(
            ([name, version]) => {
              versionMap.set(name, version);
            }
          );
          this.versions.set(ns, versionMap);
        });
      }
    } catch (error) {
      throw new Error(`Failed to deserialize schema registry: ${error}`);
    }
  }
}

/**
 * Create a reference to a registered schema
 *
 * A utility function that retrieves a schema from the registry
 * by name and namespace, making it easy to reference shared types.
 *
 * @param name Schema name
 * @param namespace Optional namespace
 * @returns The referenced type
 * @throws Error if the schema reference is not found
 *
 * @example
 * ```typescript
 * // First register the types
 * SchemaRegistry.init().register("User", UserType, "models");
 *
 * // Later, in another part of your application
 * const User = typeRef("User", "models");
 *
 * // Use just like the original type
 * const validUser = User({ name: "Ben", age: 24 });
 * ```
 */
export function typeRef(name: string, namespace?: string): any {
  const registry = SchemaRegistry.init();

  if (!registry.has(name, namespace)) {
    throw new Error(
      `Schema reference not found: ${namespace ? `${namespace}:` : ""}${name}`
    );
  }

  return registry.get(name, namespace);
}
