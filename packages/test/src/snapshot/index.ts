/**
 * @module @inspatial/test/snapshot
 *
 * InSpatial Snapshot Testing is a powerful feature that verifies code output by comparing it
 * against saved "snapshots". Like taking photographs of your application's behavior, snapshots
 * help detect when something changes unexpectedly.
 *
 * @example Basic Usage
 * ```typescript
 * import { test } from "@inspatial/test";
 * import { assertSnapshot } from "@inspatial/test/snapshot";
 *
 * test("my component renders correctly", async (t) => {
 *   const result = {
 *     name: "User Dashboard",
 *     components: ["Header", "Sidebar", "Content"]
 *   };
 *   await assertSnapshot(t, result);
 * });
 * ```
 *
 * @features
 * - Zero-Config Snapshots: First run captures baseline automatically
 * - Intuitive Diffs: Clear visual highlighting of changes
 * - Update Mode: Easy snapshot updates with --update flag
 * - Custom Serializers: Convert complex objects into readable snapshots
 * - Organized Storage: Snapshots stored alongside tests
 * - Hierarchical Testing: Support for nested test steps
 * - Multi-line Support: Handles complex formats (HTML, JSON)
 * - Customizable Location: Flexible snapshot storage options
 * - Type Safety: Full TypeScript support
 *
 * @example Custom Serializer
 * ```typescript
 * test("user profile with timestamp", async (t) => {
 *   const userData = {
 *     id: "b3n",
 *     name: "Ben Emma",
 *     createdAt: new Date()
 *   };
 *
 *   await assertSnapshot(t, userData, {
 *     serializer: (data) => ({
 *       ...data,
 *       createdAt: data.createdAt.toISOString()
 *     })
 *   });
 * });
 * ```
 *
 * @example Creating Specialized Testers
 * ```typescript
 * const assertHtmlSnapshot = createAssertSnapshot({
 *   serializer: formatHtml,
 *   dir: "_html_snapshots_/"
 * });
 *
 * test("component HTML", async (t) => {
 *   await assertHtmlSnapshot(t, component.render());
 * });
 * ```
 *
 * @example Hierarchical Testing
 * ```typescript
 * test("nested components", async (t) => {
 *   await t.step("header", async (t) => {
 *     await assertSnapshot(t, component.header);
 *   });
 *   await t.step("body", async (t) => {
 *     await assertSnapshot(t, component.body);
 *   });
 * });
 * ```
 *
 * @example Updating Snapshots
 * ```typescript
 * // Method 1: Use --update flag when running tests
 * // deno test --update
 *
 * // Method 2: Specify update mode for specific snapshot
 * await assertSnapshot(t, result, {
 *   mode: "update",
 *   name: "updated-component"
 * });
 * ```
 *
 * @apiOptions
 * - dir: Custom snapshot directory relative to test file
 * - mode: "assert" | "update" - Verify or update snapshots
 * - msg: Custom error message when snapshots don't match
 * - name: Custom name for the snapshot
 * - path: Exact path for the snapshot file
 * - serializer: (value: T) => string - Custom value converter
 *
 * @bestPractices
 * 1. Store snapshots close to test files
 * 2. Use descriptive snapshot names
 * 3. Create specialized snapshot testers for common patterns
 * 4. Normalize variable data (timestamps, IDs) in serializers
 * 5. Review snapshot diffs carefully before updating
 *
 * @see {@link assertSnapshot} - Main snapshot testing function
 * @see {@link createAssertSnapshot} - Create custom snapshot testers
 * @see {@link serialize} - Default serialization function
 */

import { fromFileUrl } from "@std/path/from-file-url";
import { parse } from "@std/path/parse";
import { resolve } from "@std/path/resolve";
import { toFileUrl } from "@std/path/to-file-url";
import { ensureFile, ensureFileSync } from "@std/fs/ensure-file";
import { assert, assertEqual as equal, AssertionError } from "../assert.ts";
import {
  differenceString as diffStr,
  diff,
  buildMessage,
} from "@inspatial/util";

const SNAPSHOT_DIR = "inspatial_snapshots";
const SNAPSHOT_EXT = "snap";

/** The mode of snapshot testing. */
export type SnapshotMode = "assert" | "update";

/** The options for {@linkcode assertSnapshot}. */
export type SnapshotOptions<T = unknown> = {
  /**
   * Snapshot output directory. Snapshot files will be written to this directory.
   * This can be relative to the test directory or an absolute path.
   *
   * If both `dir` and `path` are specified, the `dir` option will be ignored and
   * the `path` option will be handled as normal.
   */
  dir?: string;
  /**
   * Snapshot mode. Defaults to `assert`, unless the `-u` or `--update` flag is
   * passed, in which case this will be set to `update`. This option takes higher
   * priority than the update flag. If the `--update` flag is passed, it will be
   * ignored if the `mode` option is set.
   */
  mode?: SnapshotMode;
  /**
   * Failure message to log when the assertion fails. Specifying this option will
   * cause the diff not to be logged.
   */
  msg?: string;
  /**
   * Name of the snapshot to use in the snapshot file.
   */
  name?: string;
  /**
   * Snapshot output path. The snapshot will be written to this file. This can be
   * a path relative to the test directory or an absolute path.
   *
   * If both `dir` and `path` are specified, the `dir` option will be ignored and
   * the `path` option will be handled as normal.
   */
  path?: string;
  /**
   * Function to use when serializing the snapshot. The default is {@linkcode serialize}.
   */
  serializer?: (actual: T) => string;
};

function getErrorMessage(message: string, options: SnapshotOptions) {
  return typeof options.msg === "string" ? options.msg : message;
}

export function serialize(actual: unknown): string {
  return Deno.inspect(actual, {
    depth: Infinity,
    sorted: true,
    trailingComma: true,
    compact: false,
    iterableLimit: Infinity,
    strAbbreviateSize: Infinity,
    breakLength: Infinity,
    escapeSequences: false,
  }).replaceAll("\r", "\\r");
}

/**
 * Converts a string to a valid JavaScript string which can be wrapped in backticks.
 *
 * @example
 *
 * "special characters (\ ` $) will be escaped" -> "special characters (\\ \` \$) will be escaped"
 */
function escapeStringForJs(str: string) {
  return str.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
}

let _mode: SnapshotMode;
/**
 * Get the snapshot mode.
 */
function getMode(options: SnapshotOptions) {
  if (options.mode) {
    return options.mode;
  } else if (_mode) {
    return _mode;
  } else {
    _mode = Deno.args.some((arg) => arg === "--update" || arg === "-u")
      ? "update"
      : "assert";
    return _mode;
  }
}

/**
 * Return `true` when snapshot mode is `update`.
 */
function getIsUpdate(options: SnapshotOptions) {
  return getMode(options) === "update";
}

class AssertSnapshotContext {
  static contexts = new Map<string, AssertSnapshotContext>();

  /**
   * Returns an instance of `AssertSnapshotContext`. This will be retrieved from
   * a cache if an instance was already created for a given snapshot file path.
   */
  static fromOptions(
    testContext: Deno.TestContext,
    options: SnapshotOptions
  ): AssertSnapshotContext {
    let path: string;
    const testFilePath = fromFileUrl(testContext.origin);
    const { dir, base } = parse(testFilePath);
    if (options.path) {
      path = resolve(dir, options.path);
    } else if (options.dir) {
      path = resolve(dir, options.dir, `${base}.${SNAPSHOT_EXT}`);
    } else {
      path = resolve(dir, SNAPSHOT_DIR, `${base}.${SNAPSHOT_EXT}`);
    }

    let context = this.contexts.get(path);
    if (context) {
      return context;
    }

    context = new this(toFileUrl(path));
    this.contexts.set(path, context);
    return context;
  }

  #teardownRegistered = false;
  #currentSnapshots: Map<string, string | undefined> | undefined;
  #updatedSnapshots = new Map<string, string>();
  #snapshotCounts = new Map<string, number>();
  #snapshotsUpdated = new Array<string>();
  #snapshotFileUrl: URL;
  snapshotUpdateQueue = new Array<string>();

  constructor(snapshotFileUrl: URL) {
    this.#snapshotFileUrl = snapshotFileUrl;
  }

  /**
   * Asserts that `this.#currentSnapshots` has been initialized and then returns it.
   *
   * Should only be called when `this.#currentSnapshots` has already been initialized.
   */
  #getCurrentSnapshotsInitialized() {
    assert(
      this.#currentSnapshots,
      "Snapshot was not initialized. This is a bug in `assertSnapshot`."
    );
    return this.#currentSnapshots;
  }

  /**
   * Write updates to the snapshot file and log statistics.
   */
  #teardown = () => {
    const buf = ["export const snapshot = {};"];
    const currentSnapshots = this.#getCurrentSnapshotsInitialized();
    const currentSnapshotNames = Array.from(currentSnapshots.keys());
    const removedSnapshotNames = currentSnapshotNames.filter(
      (name) => !this.snapshotUpdateQueue.includes(name)
    );
    this.snapshotUpdateQueue.forEach((name) => {
      const updatedSnapshot = this.#updatedSnapshots.get(name);
      const currentSnapshot = currentSnapshots.get(name);
      let formattedSnapshot: string;
      if (typeof updatedSnapshot === "string") {
        formattedSnapshot = updatedSnapshot;
      } else if (typeof currentSnapshot === "string") {
        formattedSnapshot = currentSnapshot;
      } else {
        // This occurs when `assertSnapshot` is called in "assert" mode but
        // the snapshot doesn't exist and `assertSnapshot` is also called in
        // "update" mode. In this case, we have nothing to write to the
        // snapshot file so we can just exit early
        return;
      }
      formattedSnapshot = escapeStringForJs(formattedSnapshot);
      formattedSnapshot = formattedSnapshot.includes("\n")
        ? `\n${formattedSnapshot}\n`
        : formattedSnapshot;
      const formattedName = escapeStringForJs(name);
      buf.push(`\nsnapshot[\`${formattedName}\`] = \`${formattedSnapshot}\`;`);
    });
    const snapshotFilePath = fromFileUrl(this.#snapshotFileUrl);
    ensureFileSync(snapshotFilePath);
    Deno.writeTextFileSync(snapshotFilePath, buf.join("\n") + "\n");

    const updated = this.getUpdatedCount();
    if (updated > 0) {
      // deno-lint-ignore no-console
      console.log(
        `%c\n > ${updated} ${
          updated === 1 ? "snapshot" : "snapshots"
        } updated.`,
        "color: green; font-weight: bold;"
      );
    }
    const removed = removedSnapshotNames.length;
    if (removed > 0) {
      // deno-lint-ignore no-console
      console.log(
        `%c\n > ${removed} ${
          removed === 1 ? "snapshot" : "snapshots"
        } removed.`,
        "color: red; font-weight: bold;"
      );
      for (const snapshotName of removedSnapshotNames) {
        // deno-lint-ignore no-console
        console.log(`%c   • ${snapshotName}`, "color: red;");
      }
    }
  };

  /**
   * Returns `this.#currentSnapshots` and if necessary, tries to initialize it by reading existing
   * snapshots from the snapshot file. If the snapshot mode is `update` and the snapshot file does
   * not exist then it will be created.
   */
  async #readSnapshotFile(options: SnapshotOptions) {
    if (this.#currentSnapshots) {
      return this.#currentSnapshots;
    }

    if (getIsUpdate(options)) {
      await ensureFile(fromFileUrl(this.#snapshotFileUrl));
    }

    try {
      const snapshotFileUrl = this.#snapshotFileUrl.toString();
      // Use URL constructor to ensure proper path resolution in published package
      const resolvedUrl = new URL(snapshotFileUrl).toString();
      const { snapshot } = await import(resolvedUrl);
      this.#currentSnapshots =
        typeof snapshot === "undefined"
          ? new Map()
          : new Map(
              Object.entries(snapshot).map(([name, snapshot]) => {
                if (typeof snapshot !== "string") {
                  throw new AssertionError(
                    getErrorMessage(
                      `Corrupt snapshot:\n\t(${name})\n\t${snapshotFileUrl}`,
                      options
                    )
                  );
                }
                return [
                  name,
                  snapshot.includes("\n") ? snapshot.slice(1, -1) : snapshot,
                ];
              })
            );
      return this.#currentSnapshots;
    } catch (error) {
      if (
        error instanceof TypeError &&
        error.message.startsWith("Module not found")
      ) {
        throw new AssertionError(
          getErrorMessage("Missing snapshot file.", options)
        );
      }
      throw error;
    }
  }

  /**
   * Register a teardown function which writes the snapshot file to disk and logs the number
   * of snapshots updated after all tests have run.
   *
   * This method can safely be called more than once and will only register the teardown
   * function once in a context.
   */
  async registerTeardown() {
    if (!this.#teardownRegistered) {
      const permission = await Deno.permissions.query({
        name: "write",
        path: this.#snapshotFileUrl,
      });
      if (permission.state !== "granted") {
        throw new Deno.errors.PermissionDenied(
          `Missing write access to snapshot file (${
            this.#snapshotFileUrl
          }). This is required because assertSnapshot was called in update mode. Please pass the --allow-write flag.`
        );
      }
      globalThis.addEventListener("unload", this.#teardown);
      this.#teardownRegistered = true;
    }
  }

  /**
   * Gets the number of snapshots which have been created with the same name and increments
   * the count by 1.
   */
  getCount(snapshotName: string) {
    let count = this.#snapshotCounts.get(snapshotName) ?? 0;
    this.#snapshotCounts.set(snapshotName, ++count);
    return count;
  }

  /**
   * Get an existing snapshot by name or returns `undefined` if the snapshot does not exist.
   */
  async getSnapshot(snapshotName: string, options: SnapshotOptions) {
    const snapshots = await this.#readSnapshotFile(options);
    return snapshots.get(snapshotName);
  }

  /**
   * Update a snapshot by name. Updates will be written to the snapshot file when all tests
   * have run. If the snapshot does not exist, it will be created.
   *
   * Should only be called when mode is `update`.
   */
  updateSnapshot(snapshotName: string, snapshot: string) {
    if (!this.#snapshotsUpdated.includes(snapshotName)) {
      this.#snapshotsUpdated.push(snapshotName);
    }
    const currentSnapshots = this.#getCurrentSnapshotsInitialized();
    if (!currentSnapshots.has(snapshotName)) {
      currentSnapshots.set(snapshotName, undefined);
    }
    this.#updatedSnapshots.set(snapshotName, snapshot);
  }

  /**
   * Get the number of updated snapshots.
   */
  getUpdatedCount() {
    return this.#snapshotsUpdated.length;
  }

  /**
   * Add a snapshot to the update queue.
   *
   * Tracks the order in which snapshots were created so that they can be written to
   * the snapshot file in the correct order.
   *
   * Should be called with each snapshot, regardless of the mode, as a future call to
   * `assertSnapshot` could cause updates to be written to the snapshot file if the
   * `update` mode is passed in the options.
   */
  pushSnapshotToUpdateQueue(snapshotName: string) {
    this.snapshotUpdateQueue.push(snapshotName);
  }

  /**
   * Check if exist snapshot
   */
  hasSnapshot(snapshotName: string): boolean {
    return this.#currentSnapshots
      ? this.#currentSnapshots.has(snapshotName)
      : false;
  }
}

/**
 * # AssertSnapshot
 * #### A powerful snapshot testing function that captures and verifies your code's output
 *
 * This function works like a camera for your code. Just like taking a photo captures a moment
 * in time, `assertSnapshot` captures your code's output and saves it. Later, it compares new
 * "photos" with the saved ones to make sure nothing has changed unexpectedly.
 *
 * @since 0.1.0
 * @category InSpatial Test
 * @module @inspatial/test/snapshot
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Takes a "snapshot" of your code's output on first run
 * - Saves this snapshot in a file for future comparison
 * - Compares new runs against the saved snapshot
 * - Shows exactly what changed if differences are found
 *
 * ### 🎯 Prerequisites
 * Before you start:
 * - Import the function from @inspatial/test/snapshot
 * - Have a test context from your test function
 * - Have some data you want to verify
 *
 * ### 📚 Terminology
 * > **Snapshot**: A saved copy of your code's output, like a photograph of what your code produced
 * > **Serializer**: A function that converts complex data into a string format that can be saved
 * > **Test Context**: Information about the current test, provided by the testing framework
 *
 * @example
 * ### Example 1: Basic Snapshot Testing
 * ```typescript
 * import { test } from "@inspatial/test/runtime.ts";
 * import { assertSnapshot } from "@inspatial/test/snapshot.ts";
 *
 * test("user profile display", async (t) => {
 *   // Let's say this is what your code produces
 *   const userProfile = {
 *     name: "Alice",
 *     role: "Admin",
 *     lastLogin: new Date("2024-01-01")
 *   };
 *
 *   // Take a snapshot and verify it
 *   await assertSnapshot(t, userProfile);
 * });
 * ```
 *
 * @example
 * ### Example 2: Custom Snapshot Formatting
 * ```typescript
 * test("formatted dates", async (t) => {
 *   const eventData = {
 *     title: "Team Meeting",
 *     date: new Date("2024-03-15T10:00:00Z")
 *   };
 *
 *   await assertSnapshot(t, eventData, {
 *     // Make dates consistent in snapshots
 *     serializer: (data) => ({
 *       ...data,
 *       date: data.date.toISOString()
 *     }),
 *     name: "team-meeting-snapshot"
 *   });
 * });
 * ```
 *
 * @param {Deno.TestContext} context - Manages your test's information and helps organize snapshots
 * @param {T} actual - The data you want to verify (can be any type)
 * @param {SnapshotOptions<T> | string} options - Configure how the snapshot works or provide an error message
 *
 * @throws {AssertionError}
 * Shows an error if the new snapshot doesn't match the saved one, with a clear diff showing what changed
 *
 * @returns {Promise<void>}
 * Succeeds silently if snapshots match, or updates the snapshot if in update mode
 */
export async function assertSnapshot<T>(
  context: Deno.TestContext,
  actual: T,
  options: SnapshotOptions<T>
): Promise<void>;
export async function assertSnapshot<T>(
  context: Deno.TestContext,
  actual: T,
  message?: string
): Promise<void>;
export async function assertSnapshot(
  context: Deno.TestContext,
  actual: unknown,
  msgOrOpts?: string | SnapshotOptions<unknown>
) {
  const options = getOptions();
  const assertSnapshotContext = AssertSnapshotContext.fromOptions(
    context,
    options
  );
  const testName = getTestName(context, options);
  const count = assertSnapshotContext.getCount(testName);
  const name = `${testName} ${count}`;
  const snapshot = await assertSnapshotContext.getSnapshot(name, options);

  assertSnapshotContext.pushSnapshotToUpdateQueue(name);
  const _serialize = options.serializer || serialize;
  const _actual = _serialize(actual);
  if (getIsUpdate(options)) {
    await assertSnapshotContext.registerTeardown();
    if (!equal(_actual, snapshot)) {
      assertSnapshotContext.updateSnapshot(name, _actual);
    }
  } else {
    if (
      !assertSnapshotContext.hasSnapshot(name) ||
      typeof snapshot === "undefined"
    ) {
      throw new AssertionError(
        getErrorMessage(`Missing snapshot: ${name}`, options)
      );
    }
    if (equal(_actual, snapshot)) {
      return;
    }
    const stringDiff = !_actual.includes("\n");
    const diffResult = stringDiff
      ? diffStr(_actual, snapshot)
      : diff(_actual.split("\n"), snapshot.split("\n"));
    const diffMsg = buildMessage(diffResult, { stringDiff }).join("\n");
    const message = `Snapshot does not match:\n${diffMsg}`;
    throw new AssertionError(getErrorMessage(message, options));
  }

  function getOptions(): SnapshotOptions {
    if (typeof msgOrOpts === "object" && msgOrOpts !== null) {
      return msgOrOpts;
    }

    return {
      msg: msgOrOpts!,
    };
  }
  function getTestName(
    context: Deno.TestContext,
    options?: SnapshotOptions
  ): string {
    if (options && options.name) {
      return options.name;
    } else if (context.parent) {
      return `${getTestName(context.parent)} > ${context.name}`;
    }
    return context.name;
  }
}

/**
 * # CreateAssertSnapshot
 * #### Creates a specialized snapshot testing function with preset options
 *
 * Think of this like creating your own custom camera with specific settings. Instead of
 * configuring the same options every time, you can create a specialized snapshot function
 * that remembers your preferences.
 *
 * @since 0.1.0
 * @category InSpatial Test
 * @module @inspatial/test/snapshot
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Creates a new snapshot function with preset options
 * - Useful for consistent testing of specific data types
 * - Can override preset options when needed
 * - Maintains type safety with generics
 *
 * ### 📚 Terminology
 * > **Base Assert Function**: The original snapshot function that will be customized
 * > **Preset Options**: Default settings that will be applied to every snapshot
 *
 * @example
 * ### Example 1: Creating an HTML Snapshot Tester
 * ```typescript
 * import { createAssertSnapshot } from "@inspatial/test/snapshot.ts";
 * import { formatHtml } from "./utils.ts";
 *
 * // Create a specialized snapshot function for HTML
 * const assertHtmlSnapshot = createAssertSnapshot({
 *   serializer: formatHtml,
 *   dir: "__html_snapshots__/"
 * });
 *
 * test("component rendering", async (t) => {
 *   const html = `<div class="user-card">
 *     <h2>Welcome back!</h2>
 *   </div>`;
 *
 *   // Use your specialized snapshot function
 *   await assertHtmlSnapshot(t, html);
 * });
 * ```
 *
 * @example
 * ### Example 2: Overriding Preset Options
 * ```typescript
 * // Create a snapshot function that strips ANSI colors
 * const assertConsoleSnapshot = createAssertSnapshot({
 *   serializer: stripAnsiCode,
 *   dir: "__console_snapshots__/"
 * });
 *
 * test("console output", async (t) => {
 *   const coloredOutput = "\x1b[32mSuccess!\x1b[0m";
 *
 *   // Override the directory for this specific test
 *   await assertConsoleSnapshot(t, coloredOutput, {
 *     dir: "__special_snapshots__/",
 *     name: "success-message"
 *   });
 * });
 * ```
 *
 * @param {SnapshotOptions<T>} options - Default options for the new snapshot function
 * @param {typeof assertSnapshot} baseAssertSnapshot - The original snapshot function to customize
 *
 * @returns {typeof assertSnapshot}
 * A new snapshot function that includes your preset options
 */
export function createAssertSnapshot<T>(
  options: SnapshotOptions<T>,
  baseAssertSnapshot: typeof assertSnapshot = assertSnapshot
): typeof assertSnapshot {
  return async function _assertSnapshot(
    context: Deno.TestContext,
    actual: T,
    messageOrOptions?: string | SnapshotOptions<T>
  ) {
    const mergedOptions: SnapshotOptions<T> = {
      ...options,
      ...(typeof messageOrOptions === "string"
        ? {
            msg: messageOrOptions,
          }
        : messageOrOptions),
    };

    await baseAssertSnapshot(context, actual, mergedOptions);
  };
}
