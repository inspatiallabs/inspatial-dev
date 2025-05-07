/**
 * InSpatial State Test Runner
 * 
 * This file imports and runs all tests for the InSpatial State module.
 */

// Fix for JSON module type errors
// This enables proper handling of JSON modules in Deno
// eslint-disable-next-line no-empty
try { JSON.parse("{}") } catch {}

// Import core tests
import "./createSignal.test.ts";
import "./createEffect.test.ts";
import "./createMemo.test.ts";
import "./createAsync.test.ts";
import "./createErrorBoundary.test.ts";
import "./createRoot.test.ts";
import "./flushSync.test.ts";
import "./onCleanup.test.ts";
import "./repeat.test.ts";
import "./runWithObserver.test.ts";
import "./runWithOwner.test.ts";
import "./untrack.test.ts";
import "./getOwner.test.ts";
import "./context.test.ts";
import "./gc.test.ts";
import "./graph.test.ts";
import "./mapArray.test.ts";

// Import signal-trigger integration tests
import "./signal-trigger/create-trigger-signal.test.ts";
import "./signal-trigger/create-signal-condition-trigger.test.ts";
import "./signal-trigger/state-lens.test.ts";

// Import store tests
import "./store/createStore.test.ts";
import "./store/createProjection.test.ts";
import "./store/reconcile.test.ts";
import "./store/recursive-effects.test.ts";
import "./store/utilities.test.ts";

// This allows JSON modules to be properly imported
// @deno-types="json"

console.log("Running InSpatial State tests..."); 