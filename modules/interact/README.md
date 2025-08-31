<div align="center">
    <a href="https://inspatial.io" target="_blank">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-light.svg">
        <source media="(prefers-color-scheme: dark)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg">
        <img src="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg" alt="InSpatial" width="300"/>
    </picture>
    </a>

<br>
   <br>

<a href="https://inspatial.io" target="_blank">
<p align="center">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/logo-light.svg">
        <source media="(prefers-color-scheme: dark)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/logo-dark.svg">
        <img src="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/logo-dark.svg" height="75" alt="InSpatial">
    </picture>
</p>
</a>

_Reality is your canvas_

<h3 align="center">
    InSpatial is a universal development environment (UDE) <br> for building cross-platform and spatial (AR/MR/VR) applications
  </h3>

[![InSpatial Dev](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/dev-badge.svg)](https://www.inspatial.dev)
[![InSpatial Cloud](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/cloud-badge.svg)](https://www.inspatial.cloud)
[![InSpatial App](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/app-badge.svg)](https://www.inspatial.io)
[![InSpatial Store](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/store-badge.svg)](https://www.inspatial.store)

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Discord](https://img.shields.io/badge/discord-join_us-5a66f6.svg?style=flat-square)](https://discord.gg/inspatiallabs)
[![Twitter](https://img.shields.io/badge/twitter-follow_us-1d9bf0.svg?style=flat-square)](https://twitter.com/inspatiallabs)
[![LinkedIn](https://img.shields.io/badge/linkedin-connect_with_us-0a66c2.svg?style=flat-square)](https://www.linkedin.com/company/inspatiallabs)

</div>

##

<div align="center">

| InSpatial                                                                                                                     | Description                          | Link                                           |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------- |
| [![InSpatial Dev](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/dev-badge.svg)](https://www.inspatial.dev)       | Universal Libraries & Frameworks     | [inspatial.dev](https://www.inspatial.dev)     |
| [![InSpatial Cloud](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/cloud-badge.svg)](https://www.inspatial.cloud) | Backend APIs and SDKs                | [inspatial.cloud](https://www.inspatial.cloud) |
| [![InSpatial App](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/app-badge.svg)](https://www.inspatial.io)        | Build and manage your InSpatial apps | [inspatial.app](https://www.inspatial.io)      |
| [![InSpatial Store](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/store-badge.svg)](https://www.inspatial.store) | Deploy and discover InSpatial apps   | [inspatial.store](https://www.inspatial.store) |

</div>

---

## 🔍 Interact (🟡 Preview)

Universal interactivity and state management system for cross-platform and spatial applications.

Interact is an signal based interactivity and state management system. It is subdivided into two types of reactive systems. **Signal Core** & **Signal Lite** each inspired by SolidJS and Preact respectively.

### 👨‍💻 What Can I Do With InSpatial's Interact?

- **Build Reactive Applications**: Create dynamic interfaces with automatic updates when data changes
- **Manage Complex State**: Handle application state with validation, persistence, and expressive updates
- **Optimize Performance**: Enjoy fine-grained updates that only re-render what actually changed
- **Create Spatial Experiences**: Power AR/VR/MR applications with reactive 3D state management
- **Universal Development**: Write once, run everywhere - web, mobile, native, and XR platforms

## 🌟 Features

### 🚀 Core Reactivity (Signals)

- 🌍 **Fine-Grained Reactivity** - Updates only what actually changed
- 🔍 **Automatic Dependency Tracking** - No manual subscription management needed
- 🎮 **Signal Primitives** - `createSignal`, `createMemo`, `createEffect`
- 📝 **Reactive Stores** - Complex object state with `createStore`
- 🎯 **Async Resources** - `createAsync` & `createResource` for data fetching with loading states
- ⚡ **Batched Updates** - Efficient update scheduling with `batch`
- 🔄 **Context System** - Dependency injection with `createContext`
- 🔍 **Error Boundaries** - Graceful error handling with `createErrorBoundary`

### 🌐 Universal Capabilities

- 📦 **Universal Runtime** - Works in Node.js, Deno, Bun, browsers, and native environments
- 📱 **Cross-Platform** - Web, Mobile, Native & XR compatibility
- 🛡️ **TypeScript First** - Full type safety and inference
- 🔄 **Owner Tree** - Automatic cleanup and memory management
- 🧪 **Effect Scheduling** - Precise control over when effects run
- 📝 **Array Utilities** - Efficient list rendering with `mapArray`
- 🧩 **Reconciliation** - Smart diffing for dynamic content

## 🔮 Coming Soon

- 🌐 **Intent** - Intentional/predictive prefetch for server state
- 📊 **Time Travel Debugging** - Replay state changes and signal updates
- 🤖 **AI-Powered State** - Intelligent state optimization and prediction

## ✨ Architecture Overview ✨

<table>
  <tr>
    <td>
      <h4>🔄 Signal Core</h4>
      <pre><code>
      import { createSignal, createEffect } from "@in/teract/signal-core";
const [count, updateCount] = createSignal(0);
const double = createMemo(() => count() * 2);
createEffect(() => console.log(double()));</code></pre>
    </td>
    <td>
      <h4>🔄 Signal Lite</h4>
      <pre><code>
import { createSignal, nextTick } from "@in/teract/signal-lite";
const count = createSignal(0);
count.value = 5;
console.log(count.value); // 5
</code></pre>
    </td>
  </tr>
</table>

<div align="center">
  <h4>🚀 Keep reading to learn how to use the complete InSpatial Interact system! 🚀</h4>
</div>

## 📦 Install Interact:

Choose your preferred package manager:

```bash
deno install jsr:@in/teract
```

##

```bash
npx jsr add @in/teract
```

##

```bash
yarn dlx jsr add @in/teract
```

##

```bash
pnpm dlx jsr add @in/teract
```

##

```bash
bunx jsr add @in/teract
```

## 🚀 Quick Start Guide

### 1. **(Signal Lite) Basic Reactive Counter**

```typescript
// Option 1: Basic Counter with Computed Signal Lite
import { createSignal, nextTick, computed } from "@in/teract/signal-lite";

const count = signal(0);
const doubled = computed(() => count.value * 2);

console.log(doubled.value); // 0
count.value = 5;

nextTick(() => {
  console.log(doubled.value); // 10
});
```

```typescript
// Option 2: Basic with effect
import { createSignal, nextTick, wacth } from "@in/teract/signal-lite";

const count = signal(0);

// Watch for changes
const dispose = watch(() => {
  console.log("Count changed:", count.value);
});

count.value = 1; // Logs: "Count changed: 1"

nextTick(() => {
  count.value = 2; // Logs: "Count changed: 2"
});

// Clean up the effect
dispose();
```

### 2. **(Signal Core) Basic Reactive Counter**

```typescript
import { createSignal, createEffect } from "@in/teract/signal-core";

// Create reactive primitives
const [count, updateCount] = createSignal(0);

// React to changes
createEffect(() => {
  console.log("Count updated:", count());
});

// Update the value
updateCount(5); // Logs: "Count updated: 5"
```

---

## 📚 Complete Signal API Documentation

<details>
<summary><h3>🔄 Signal Core API</h3></summary>

Signal Core provides the foundational reactive primitives that power the entire InSpatial Interact system.

### Core Reactive Primitives

#### `createSignal<T>(value: T): [get: () => T, update: (value: T) => void]`

Creates a reactive primitive value.

```typescript
import { createSignal } from "@in/teract/signal-core";

const [count, updateCount] = createSignal(0);
const [user, updateUser] = createSignal({ name: "ben", age: 24 });

console.log(count()); // 0
updateCount(5);
console.log(count()); // 5
```

#### `createMemo<T>(computation: () => T): () => T`

Creates a computed value that automatically updates when dependencies change.

```typescript
import { createSignal, createMemo } from "@in/teract/signal-core";

const [firstName, updateFirstName] = createSignal("Ben");
const [lastName, updateLastName] = createSignal("Emma");

const fullName = createMemo(() => `${firstName()} ${lastName()}`);

console.log(fullName()); // "Ben Emma"
updateFirstName("Gwen");
console.log(fullName()); // "Gwen Emma"
```

#### `createEffect(computation: () => void): void`

Creates a side effect that runs when dependencies change.

```typescript
import { createSignal, createEffect } from "@in/teract/signal-core";

const [count, updateCount] = createSignal(0);

createEffect(() => {
  console.log("Count is now:", count());
});

updateCount(5); // Logs: "Count is now: 5"
```

### Store Management

#### `createStore<T>(object: T): [get: Store<T>, update: UpdateStoreFunction<T>]`

Creates a reactive object store with fine-grained reactivity.

```typescript
import { createStore } from "@in/teract/signal-core";

const [store, updateStore] = createStore({
  user: { name: "Ben", age: 24 },
  settings: { theme: "dark", notifications: true },
});

// Fine-grained updates
updateStore("user", "age", 25);
updateStore("settings", "theme", "light");

// Batch updates
updateStore({
  user: { ...store.user, name: "Gwen" },
  settings: { ...store.settings, notifications: false },
});
```

### Async Resources

#### `createResource<T>(fetcher: () => Promise<T>): [data: () => T | undefined, { loading: boolean, error: any }]`

Creates an async data resource with automatic loading states.

```typescript
import { createResource, createEffect } from "@in/teract/signal-core";

const [userData, { loading, error }] = createResource(async () => {
  const response = await fetch("/api/user");
  return response.json();
});

createEffect(() => {
  if (loading()) {
    console.log("Loading user data...");
  } else if (error()) {
    console.log("Error:", error());
  } else {
    console.log("User data:", userData());
  }
});
```

### Batching and Control Flow

#### `batch<T>(computation: () => T): T`

Groups multiple updates to run synchronously.

```typescript
import { createSignal, createMemo, batch } from "@in/teract/signal-core";

const [a, updateA] = createSignal(1);
const [b, updateB] = createSignal(2);
const sum = createMemo(() => a() + b());

// Without batch: sum computes twice (intermediate: 11, final: 30)
updateA(10);
updateB(20);

// With batch: sum computes once (final: 30)
batch(() => {
  updateA(10);
  updateB(20);
});
```

#### `untrack<T>(computation: () => T): T`

Reads values without creating dependencies.

```typescript
import { createSignal, createMemo, untrack } from "@in/teract/signal-core";

const [a, updateA] = createSignal(1);
const [b, updateB] = createSignal(2);

const computed = createMemo(() => {
  return a() + untrack(() => b()); // Only depends on 'a', not 'b'
});
```

### Context and Error Handling

#### `createContext<T>(defaultValue?: T): Context<T>`

Creates a dependency injection context.

```typescript
import {
  createContext,
  useContext,
  createComponent,
} from "@in/teract/signal-core";

const ThemeContext = createContext("light");

const App = createComponent(() => {
  return (
    <ThemeContext.Provider value="dark">
      <UserProfile />
    </ThemeContext.Provider>
  );
});

const UserProfile = createComponent(() => {
  const theme = useContext(ThemeContext);
  return <div class={`profile-${theme()}`}>Profile</div>;
});
```

#### `createErrorBoundary<T>(fn: () => T, errorHandler: (err: Error, reset: () => void) => T): () => T`

Provides error handling boundaries.

```typescript
import { createErrorBoundary } from "@in/teract/signal-core";

const SafeComponent = createErrorBoundary(
  () => riskyComponent(),
  (err, reset) => (
    <div>
      <p>Error: {err.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  )
);
```

### Signal Core API Reference

| Function                   | Description                                    |
| -------------------------- | ---------------------------------------------- |
| `createSignal<T>()`        | Creates a reactive primitive value             |
| `createMemo<T>()`          | Creates a computed value with caching          |
| `createEffect()`           | Creates a side effect that runs on changes     |
| `createStore<T>()`         | Creates a reactive object store                |
| `createResource<T>()`      | Creates an async data resource                 |
| `createContext<T>()`       | Creates a dependency injection context         |
| `batch<T>()`               | Groups updates into a single synchronous batch |
| `untrack<T>()`             | Reads values without creating dependencies     |
| `createErrorBoundary<T>()` | Provides error handling boundaries             |
| `createSuspense()`         | Manages loading states for async operations    |
| `createRenderEffect()`     | Creates effects that run during render phase   |
| `createInteractiveRoot()`  | Creates the reactive context wrapper           |

</details>

<details>
<summary><h3>🔄 Signal Lite API</h3></summary>

# Signal-Lite

#### A lightweight reactive state management library

Signal-Lite is a streamlined reactivity system that helps you manage changing data in your application. Think of it like a notification system where values can announce when they change, and other parts of your code can listen and react accordingly.

## Overview

Signal-Lite provides the essential building blocks for reactive programming:

- **Signals**: Containers for values that notify listeners when they change
- **Computed Values**: Values derived from createSignals that update automatically
- **Effects**: Functions that run when their dependencies change

This is the lightweight alternative to the full InSpatial Interactivity system and state mangers, decoupled from any rendering logic making it an agnostic system that can work with any framework. Signal Lite apis are self-contained and works at the component level without an interactive root hoisted at app context tree.

## Comparison with Signal/State Core

Signal-Lite is a lightweight subset of the full Signal Core system from @inspatial/interact. Here's how they differ:

| Feature              | Signal-Lite                                                  | Signal/State Core                   |
| -------------------- | ------------------------------------------------------------ | ----------------------------------- |
| **Size**             | Minimal (small bundle)                                       | Full-featured (larger)              |
| **API**              | Simpler, focused                                             | Comprehensive                       |
| **Performance**      | Good for basic needs                                         | Optimized for complex scenarios     |
| **Callbacks**        | createEffectLite & onDisposeLite \* onConditionLite triggers | Full integrated trigger system      |
| **State Management** | Local                                                        | Local X Global X Server (Universal) |
| **Developer Tools**  | Minimal                                                      | Advanced debugging tools            |
| **StateQL**          | Not supported                                                | Full support                        |
| **Batched Updates**  | Automatic and Asynced                                        | Automatic and Asynced               |

**When to choose Signal-Lite**: For simple state management needs or projects when you need minimal bundle size, automatic dependency tracking and efficient updates. It is the recommeded starting point for interactivity compared to its siblings.

**When to choose Signal/State Core**: For most InSpatial applications, production apps, or when you need advanced features like triggers, optimized updates, or deep integration.

### Core API

### ⚠️ Important Note

> Signal effects are semi-lazily computed, that means, no matter how many times you changed the value of a createSignal, its effects will only be executed once at the end of this tick. So if you modifred a createSignal's value and want to retrieve its updated derived createSignals value, you'll need to use `nextTick(cb)` or `await tick()` to get the new value.

```typescript
import { createSignal } from "@in/teract/signal-lite";

// Create a createSignal with an initial value
const count = createSignal(0);

// Get the current value
console.log(count.value); // 0

// Update the value
count.value = 5;
console.log(count.value); // 5
```

### Creating Computed Signals

```typescript
import { createSignal, computed, nextTick } from "@in/teract/signal-lite";

const count = createSignal(0);
const doubled = computed(() => count.value * 2);

console.log(doubled.value); // 0
count.value = 5;

nextTick(() => {
  console.log(doubled.value); // 10
});
```

### Effects

```typescript
import { createSignal, watch } from "@in/teract/signal-lite";

const count = createSignal(0);

// Watch for changes
const dispose = watch(() => {
  console.log("Count changed:", count.value);
});

count.value = 1; // Logs: "Count changed: 1"

nextTick(() => {
  count.value = 2; // Logs: "Count changed: 2"
});

// Clean up the effect
dispose();
```

#### `createTriggerAction(value?, compute?)`

Creates an action system with an event handler and trigger function. This is useful for creating event-driven patterns where you want to listen for specific actions and respond to them.

- `value`: Initial value for the internal createSignal
- `compute`: Optional computation function for the internal createSignal
- Returns: `[trigger, action]` tuple

```typescript
const [onDoorOpen, enterHouse] = createTriggerAction("idle");

// Listen for app start trigger
onDoorOpen((state) => {
  console.log("Page load state:", state);
});

// Action that occures after trigger
enterHouse("entering");
enterHouse("entered");

// With computation
const [onCounterChange, triggerCounterChange] = createTriggerAction(
  0,
  (val) => val * 2
);

onCounterChange((doubled) => {
  console.log("Counter doubled:", doubled);
});

triggerCounterChange(5); // Logs: "Counter doubled: 10"
```

## API Reference

### Core Functions

#### `createSignal(value, compute?)`

Creates a new createSignal.

- `value`: Initial value or source createSignal
- `compute`: Optional computation function for derived createSignals
- Returns: Signal instance

```typescript
const count = createSignal(0);
const derived = createSignal(count, (val) => val * 2);
```

#### `computed(fn)`

Creates a computed createSignal that derives its value from other createSignals.

- `fn`: Function that computes the value
- Returns: Computed createSignal

```typescript
const fullName = computed(() => `${firstName.value} ${lastName.value}`);
```

#### `isSignal(value)`

Checks if a value is a createSignal.

- `value`: Value to check
- Returns: Boolean

```typescript
console.log(isSignal(count)); // true
console.log(isSignal(42)); // false
```

#### `createSignal.ensure(value)` / `Signal.ensure(value)`

Ensures a value is a createSignal. If the value is already a createSignal, it returns the createSignal unchanged. If not, it creates a new createSignal with that value.

- `value`: Value to ensure as a createSignal
- Returns: Signal

```typescript
const existingSignal = createSignal(42);
const newSignal = createSignal(100);

const ensured1 = createSignal.ensure(existingSignal); // Returns the same createSignal
const ensured2 = createSignal.ensure(50); // Creates a new createSignal(50)
const ensured3 = createSignal.ensure("hello"); // Creates a new createSignal('hello')

console.log(ensured1 === existingSignal); // true
console.log(isSignal(ensured2)); // true
```

#### `createSignal.ensureAll(...values)` / `Signal.ensureAll(...values)`

Applies `createSignal.ensure()` to multiple values, returning an array of createSignals.

- `...values`: Values to ensure as createSignals
- Returns: Array of createSignals

```typescript
const mixed = [createSignal(1), 2, createSignal(3), 4];
const allSignals = createSignal.ensureAll(...mixed);
// Returns: [createSignal(1), createSignal(2), createSignal(3), createSignal(4)]
```

### Signal Instance Methods

#### `.get()`

Gets the current value and registers the calling effect as a dependency.

```typescript
const value = mySignal.get();
```

#### `.set(value)`

Sets a new value for the createSignal.

```typescript
mySignal.set(42);
```

#### `.peek()`

Gets the current value without registering dependencies.

```typescript
const value = mySignal.peek();
```

#### `.poke(value)`

Sets a value without triggering updates.

```typescript
mySignal.poke(42);
```

#### `.trigger()`

Manually triggers updates for all connected effects.

```typescript
mySignal.trigger();
```

#### `.refresh()`

Re-evaluates a computed createSignal's computation function and updates the createSignal if the result has changed. This method only works on computed createSignals (createSignals created with a computation function). For regular createSignals, this method has no effect.

This is useful when you need to manually force a computed createSignal to re-evaluate its computation, for example when external dependencies that aren't tracked by the createSignal system may have changed.

```typescript
const count = createSignal(0);
const doubled = computed(() => count.value * 2);

// Manually refresh the computed createSignal
doubled.refresh();

// Example with external dependency
let externalValue = 10;
const computed = createSignal(null, () => count.value + externalValue);

// Later, when externalValue changes outside the createSignal system
externalValue = 20;
computed.refresh(); // Force re-evaluation with new externalValue
```

#### `.connect(effect, runImmediate = true)`

Manually connects an effect to the createSignal.

- `effect`: The effect function to connect
- `runImmediate`: Whether to run the effect immediately (default: true)

```typescript
mySignal.connect(() => console.log("Signal changed"));

// Connect without running immediately
mySignal.connect(() => console.log("Signal changed"), false);
```

#### `.touch()`

Subscribes the current effect to this createSignal without reading its value. This is useful when you want to trigger an effect when a createSignal changes, but you don't need its value inside the effect.

```typescript
mySignal.touch();
```

### Signal Properties

#### `.value`

Getter/setter for the createSignal's value.

```typescript
mySignal.value = 42;
console.log(mySignal.value);
```

#### `.connected`

Boolean indicating if the createSignal has any connected effects.

```typescript
console.log(mySignal.connected); // true/false
```

#### `.hasValue()`

Checks if the createSignal has a non-nullish value (not `undefined` or `null`).

```typescript
const name = createSignal("Ben");
const empty = createSignal(null);

console.log(name.hasValue()); // Should return true
console.log(empty.hasValue()); // Should return false
```

#### `.nullishThen(value)`

Returns a new createSignal that provides a fallback value when the current createSignal is nullish (`undefined` or `null`). This is similar to the nullish coalescing operator (`??`) but for createSignals.

```typescript
const username = createSignal(null);
const defaultName = username.nullishThen("Anonymous");

console.log(defaultName.value); // 'Anonymous'

username.value = "Charlotte";
// defaultName will reactively update to 'Charlotte'

username.value = undefined;
// defaultName will reactively update back to 'Anonymous'
```

### Signal Operations

Signals support various comparison and logical operations:

#### `.inverse()`

Returns a createSignal that negates the current createSignal's value.

```typescript
const isEnabled = createSignal(true);
const isDisabled = isEnabled.inverse(); // !isEnabled.value
```

#### `.and(value)`, `.or(value)`

Basic logical operations.

```typescript
const isPositive = count.gt(0);
const isValid = isPositive.and(isEnabled);
const hasValueOrDefault = value.or(defaultValue);
```

#### `.andNot(value)`, `.orNot(value)`

Logical operations with negated second operand.

```typescript
const isPositiveAndNotZero = count.andNot(count.eq(0)); // count > 0 && !(count === 0)
const isValidOrNotDisabled = isValid.orNot(isDisabled); // isValid || !isDisabled
```

#### `.inverseAnd(value)`, `.inverseOr(value)`

Logical operations with negated first operand (the createSignal itself).

```typescript
const isInactiveAndVisible = isActive.inverseAnd(isVisible); // !isActive && isVisible
const isInactiveOrVisible = isActive.inverseOr(isVisible); // !isActive || isVisible
```

#### `.inverseAndNot(value)`, `.inverseOrNot(value)`

Logical operations with both operands negated.

```typescript
const isInactiveAndHidden = isActive.inverseAndNot(isVisible); // !isActive && !isVisible
const isInactiveOrHidden = isActive.inverseOrNot(isVisible); // !isActive || !isVisible
```

#### `.eq(value)`, `.neq(value)`

Equality comparisons.

```typescript
const isZero = count.eq(0);
const isNotZero = count.neq(0);
```

#### `.gt(value)`, `.lt(value)`

Numeric comparisons.

```typescript
const isPositive = count.gt(0);
const isNegative = count.lt(0);
```

### Utility Functions

#### `read(value)`

Reads a value, safe for the value to be a createSignal or not.

```typescript
const result = read(someValue); // Works with createSignals or regular values
```

#### `peek(value)`

Peeks at a value without creating dependencies.

```typescript
const result = peek(someSignal);
```

#### `write(createSignal, newValue)`

Writes to a createSignal or applies a function. Has no effect if the value to be written is not a createSignal.

```typescript
write(count, 42);
write(count, (prev) => prev + 1);
```

#### `readAll(...values)`

Reads all values and return an array of plain values.

```typescript
const [val1, val2] = readAll(createSignal1, createSignal2);
```

#### `poke(createSignal, newValue)`

Pokes a value into a createSignal, same as `createSignal.poke(newValue)`. Has no effect if the value to be written is not a createSignal.

```typescript
poke(count, 42);
```

#### `touch(...values)`

Touches a list of createSignals to register a dependency. Has no effect if the value is not a createSignal.

```typescript
touch(someValue, someOtherValue); // Works with createSignals or regular values
```

### Effect Management

#### `watch(effect)`

Creates an effect that runs when dependencies change.

- `effect`: Function to run
- Returns: Dispose function

```typescript
const dispose = watch(() => {
  console.log("Value:", mySignal.value);
});
```

#### `connect(createSignals, effect, runImmediate = true)`

Connects multiple createSignals to an effect.

- `createSignals`: Array of createSignals to connect to
- `effect`: The effect function to connect
- `runImmediate`: Whether to run the effect immediately (default: true)

```typescript
connect([createSignal1, createSignal2], () => {
  console.log("Signals changed");
});

// Connect without running immediately
connect(
  [createSignal1, createSignal2],
  () => {
    console.log("Signals changed");
  },
  false
);
```

#### `bind(handler, value)`

Binds a handler to a value (createSignal, function, or static value).

```typescript
bind(console.log, mySignal);
```

#### `listen(createSignals, callback)`

Listens to multiple createSignals with a single callback.

```typescript
listen([createSignal1, createSignal2], () => {
  console.log("One of the createSignals changed");
});
```

### Advanced Signal Operations

#### `merge(createSignals, handler)`

Merges multiple createSignals into a computed createSignal.

```typescript
const fullName = merge(
  [firstName, lastName],
  (first, last) => `${first} ${last}`
);
```

#### `tpl(strings, ...expressions)`

Creates a template string createSignal.

```typescript
const message = tpl`Hello ${name}, you have ${count} items`;
```

#### `not(value)`

Creates a createSignal that negates the input value. Works with both createSignals and static values.

```typescript
const isEnabled = createSignal(true);
const isDisabled = not(isEnabled); // Creates a createSignal that returns !isEnabled.value

const alwaysFalse = not(true); // Creates a createSignal that always returns false
const isDifferent = not(value.eq(expectedValue)); // Negates a comparison
```

#### `derive(createSignal, key, compute?)`

Creates a derived createSignal from an object property. The derieved createSignal's content will be updated when the original createSignal changes, or when the original createSignal's corresponding property is a createSignal, when the specific createSignal changes. Writing the derived createSignal will not update the original createSignal's property.

```typescript
const name = derive(user, "name");
```

#### `extract(createSignal, ...keys)`

Extracts properties from a createSignal into separate createSignals. The extracted createSignals' content will be updated only when the original createSignal changes. Writing the exteracted createSignals will not update the original createSignal's properties.

```typescript
const { name, age } = extract(user, "name", "age");
```

#### `derivedExtract(createSignal, ...keys)`

Similar to extract but creates derived createSignals.

```typescript
const { name, age } = derivedExtract(user, "name", "age");
```

#### `makeReactive(object)`

Creates a reactive proxy of an object.

```typescript
const reactive = makeReactive({
  count: createSignal(0),
  name: "Ben",
});
```

### Conditional Logic

#### `onCondition(createSignal, compute?)`

Creates conditional matching based on createSignal values.

```typescript
const stateMatch = onCondition(state);
const isLoading = stateMatch("loading");
const isError = stateMatch("error");
```

### Lifecycle Management

#### `onDispose(callback)`

Registers a cleanup callback.

```typescript
onDispose(() => {
  console.log("Cleaning up");
});
```

#### `createEffect(effect, ...args)`

Registers an effect that runs automatically and handles its own cleanup. The `effect` function is executed immediately and re-executed whenever its createSignal dependencies change.

If the `effect` function returns another function, that returned function will be used as a `cleanup` handler. The cleanup is called right before the effect re-runs, and also when the component/scope is disposed.

Any additional arguments passed to `createEffect` after the `effect` function will be passed along to the `effect` function when it's called.

- `effect`: The function to execute.
- `...args`: Optional arguments to pass to the effect function.
- Returns: A function to cancel the effect manually.

```typescript
// Example 1: Basic side effect with cleanup
const interval = createSignal(1000);
createEffect(() => {
  const timer = setInterval(() => {
    console.log("Timer tick");
  }, interval);

  // Cleanup function
  return () => {
    console.log("Clearing timer");
    clearInterval(timer);
  };
});

// Will stop the previous timer and restart a new timer with the interval 2000
interval.value = 2000;

// Example 2: Effect with dependencies
const count = createSignal(0);
createEffect(() => {
  console.log(`The count is: ${count.value}`);

  // This effect has a dependency on `count`.
  // It will re-run whenever `count.value` changes.
});

// Example 3: Passing arguments to an effect
const name = createSignal("Charlotte");

function logName(user) {
  console.log(`Current user: ${user.value}`);
}

createEffect(logName, name);

// Later...
name.value = "Mike"; // Will trigger the effect and log "Current user: Mike"
```

#### `collectDisposers(disposers, fn, cleanup?)`

Collects disposers within a function scope. Used internally, do not use if you don't know how it works.

```typescript
const dispose = collectDisposers([], () => {
  // Create effects here
});
```

### Control Flow

#### `untrack(fn)`

Runs a function without tracking dependencies.

```typescript
const result = untrack(() => {
  return someSignal.value; // Won't create dependency
});
```

#### `freeze(fn)`

Freezes the current effect context for a function.

```typescript
const frozenFn = freeze(myFunction);
```

### Scheduling

#### `tick()`

Triggers the next tick of the scheduler.

```typescript
tick().then(() => {
  console.log("Updates applied");
});
```

#### `nextTick(callback, ...args)`

Waits for the next tick and executes a callback after all pending createSignal updates and effects have been processed. Returns a Promise that resolves after the callback completes.

- `callback`: Function to execute after the tick completes
- `...args`: Optional arguments to pass to the callback function
- Returns: Promise that resolves after the callback executes

This is essential when you need to access updated computed createSignal values after making changes, since createSignal effects are processed asynchronously.

```typescript
const count = createSignal(0);
const doubled = computed(() => count.value * 2);

count.value = 5;

// Without nextTick - might still see old value
console.log(doubled.value); // Could be 0 (old value)

// With nextTick - guaranteed to see updated value
nextTick(() => {
  console.log(doubled.value); // Will be 10 (updated value)
});

// With additional arguments
const logValue = (prefix, createSignal) => {
  console.log(prefix, createSignal.value);
};

nextTick(logValue, "Doubled:", doubled);

// Can also be used with async/await
await nextTick(() => {
  console.log("All updates processed");
});
```

### Special Signal Behaviors

Signals have some special behaviors when used in certain contexts, thanks to `toJSON`, `Symbol.toPrimitive`, and `Symbol.iterator` implementations.

#### `JSON.stringify(createSignal)`

When a createSignal is stringified using `JSON.stringify`, it automatically returns its value by calling `.get()`.

```typescript
const data = createSignal({ a: 1 });
JSON.stringify({ data }); // '{"data":{"a":1}}'
```

#### Coercion

Signals can be automatically coerced to primitives, which calls `.get()`.

```typescript
const count = createSignal(5);
console.log(count + 5); // 10
console.log(`${count}`); // "5"
if (count) {
  /* ... */
} // true if count.value is truthy
```

#### Iteration

If a createSignal contains an iterable, it can be used in a `for...of` loop or with the spread syntax, which calls `.get()`.

```typescript
const items = createSignal([1, 2, 3]);
for (const item of items) {
  console.log(item);
}
// 1
// 2
// 3

const spreadItems = [...items]; // [1, 2, 3]
```

## Advanced Features

### Custom Effects

```typescript
const myEffect = () => {
  const value = mySignal.value;
  console.log("Signal value:", value);
};

watch(myEffect);
```

### Batched Updates

Updates are automatically batched and applied asynchronously:

```typescript
count.value = 1;
count.value = 2;
count.value = 3;
// Only triggers effects once with final value
```

## Best Practices

1. **Use computed createSignals for derived data**:

   ```typescript
   const fullName = computed(() => `${first.value} ${last.value}`);
   ```

2. **Dispose of effects when no longer needed**:

   ```typescript
   const dispose = watch(() => {
     // effect logic
   });

   // Later...
   dispose();
   ```

3. **Use `peek()` to avoid creating dependencies**:

   ```typescript
   const currentValue = mySignal.peek(); // Doesn't create dependency
   ```

4. **Batch related updates**:

   ```typescript
   // Updates are automatically batched
   firstName.value = "Ben";
   lastName.value = "Emma";
   // fullName updates only once
   ```

5. **Use `untrack()` for non-reactive operations**:
   ```typescript
   const result = untrack(() => {
     // This won't create dependencies
     return someSignal.value + otherSignal.value;
   });
   ```

## Examples

### Counter Example

```typescript
import { createSignal, computed, watch } from "@in/teract/signal-lite";

const count = createSignal(0);
const doubled = computed(() => count.value * 2);

watch(() => {
  console.log(`Count: ${count.value}, Doubled: ${doubled.value}`);
});

count.value = 5; // Logs: "Count: 5, Doubled: 10"
```

### Todo List Example

```typescript
const todos = createSignal([]);
const filter = createSignal("all");

const filteredTodos = computed(() => {
  const todoList = todos.value;
  const currentFilter = filter.value;

  switch (currentFilter) {
    case "active":
      return todoList.filter((todo) => !todo.completed);
    case "completed":
      return todoList.filter((todo) => todo.completed);
    default:
      return todoList;
  }
});

// Add todo
function addTodo(text) {
  todos.value = [...todos.value, { id: Date.now(), text, completed: false }];
}

// Toggle todo
function toggleTodo(id) {
  todos.value = todos.value.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
}
```

## TypeScript Support

Signal-Lite is fully typed and provides generic typing for all its functions:

```typescript
import { createSignal, SignalLite } from "@in/teract/signal-lite";

// Specify the createSignal type explicitly
const count: SignalLite<number> = createSignal(0);

// Type is inferred automatically
const name = createSignal("Ben"); // SignalLite<string>

// Complex types
interface User {
  name: string;
  age: number;
}

const user = createSignal<User>({ name: "Eli", age: 30 });
```

</details>

---

## 🧪 Testing

### Running Tests

```bash
# Test Signal Core
deno task test:signal-core

# Test State
deno task test:signal-lite

# Test everything
deno task test
```

### Example Test Patterns

<details>
<summary><h3>Testing Signal Core</h3></summary>

```typescript
import { test, expect, describe, it } from "@inspatial/test";
import { createSignal, createMemo, createEffect } from "@in/teract/signal-core";

describe("Signal Core", () => {
  it("should create reactive signals", () => {
    const [count, updateCount] = createSignal(0);

    expect(count()).toBe(0);
    updateCount(5);
    expect(count()).toBe(5);
  });

  it("should create computed values", () => {
    const [count, updateCount] = createSignal(10);
    const double = createMemo(() => count() * 2);

    expect(double()).toBe(20);
    updateCount(15);
    expect(double()).toBe(30);
  });

  it("should handle effects", () => {
    const [count, updateCount] = createSignal(0);
    let effectRuns = 0;

    createEffect(() => {
      count(); // Track the signal
      effectRuns++;
    });

    expect(effectRuns).toBe(1);
    updateCount(5);
    expect(effectRuns).toBe(2);
  });
});
```

</details>

---

## 🤔 FAQ

### "When should I use Signal Core vs State?"

**Use Signal Core** for low-level reactive programming, performance-critical code, or when building frameworks. **Use State** for application development, when you need validation/persistence, or prefer higher-level APIs. **Use both** for if you feel like going over the moon.

### "How do they work together?"

State is built on top of Signal Core primitives. When you use State, you're leveraging Signal Core reactivity under the hood. You can mix both APIs seamlessly - State for application logic, Signal Core for performance-critical reactive patterns.

### "Is this compatible with React/Vue/Svelte/Angular/Solid/React-Native/NativeScript/Lynx?"

Yes! Both Signal Core and State work with any JavaScript/Typescript framework. They provide framework-agnostic reactivity that can integrate with new and existing applications.

### "How does performance compare to other solutions?"

InSpatial Interactivity typically outperforms coarse-grained systems because only actually changed data triggers updates. The two-layer architecture lets you optimize at the right level.

### "Can I migrate from other state management libraries?"

Yes! You can gradually adopt `Interact` alongside existing solutions. Start with Signal Core for new reactive patterns or State for new application features.

### "Does this work in XR & Native environments?"

Absolutely! Signal Core was designed with mobile and spatial computing in mind. It effectively handles 3D transformations, physics properties, and real-time sensor data with frame-rate aware scheduling.

### "Can I manage local, global and server state with this?"

Yes! Signal Core provides all the interactive primitives needed for managing and creating all kinds of state.

### "Should I use (Interact - InSpatial Signal Core or InSpatial State)?"

InSpatial State provides a higher-level abstraction built on top of Signal Core, featuring a composable and encapsulated design with natural language-like APIs. While working with InSpatial State, you're still leveraging Signal Core under the hood. The choice between using Signal Core directly or InSpatial State depends on your preferred level of abstraction. InSpatial State offers additional features and improved abstraction since it's built on Signal Core. Developers familiar with SolidJS, React, or Preact may find Signal Core's lower-level APIs particularly useful, as they closely mirror the state primitives of these platforms.

### "How does cleanup work to prevent memory leaks?"

Signal Core includes an automatic ownership tree system. When computations are no longer needed, they're automatically disposed along with their dependencies. You can also use `onCleanup` for manual resource management.

### "What's the performance overhead compared to manual state management?"

The reactive system adds minimal overhead while providing substantial benefits. Fine-grained updates often perform better than manual optimization because only necessary computations run.

### "Can I use InSpatial State without the type validation?"

Yes, absolutely! The type system integration is optional. If you don't provide a type in your state configuration, no validation will be performed. You can use InSpatial State as a lightweight state container without any validation overhead.

### "How does the performance compare to other state management libraries?"

InSpatial State is optimized for performance with features like batched updates, memoization, and optimized subscriptions. The type validation has minimal runtime overhead as it's designed to be performant. You can also disable validation in production environments if needed.

### "What happens when type validation fails?"

By default, type validation errors are logged to the console in development mode but don't throw errors. This behavior can be configured to be stricter by using validation options with custom error handling.

### "Can I create derived state that depends on multiple state objects?"

Yes, you can use `createDerivedState` or `createDerivedStateFromMultiple` to create state that derives its values from one or more source states. These will update automatically when any of the source states change.

## 🎯 Complete API Reference

### Signal Core Functions

| Function              | Description                              |
| --------------------- | ---------------------------------------- |
| `createSignal<T>()`   | Creates reactive primitive value         |
| `createMemo<T>()`     | Creates computed value with caching      |
| `createEffect()`      | Creates side effect that runs on changes |
| `createStore<T>()`    | Creates reactive object store            |
| `createAsync<T>()`    | Creates async data resource              |
| `createResource<T>()` | Creates async data resource              |
| `createInteractiveRoot<T>()` | Creates interactive root context          |
| `batch<T>()`          | Groups updates into single batch         |
| `untrack<T>()`        | Reads values without dependencies        |


---

## 🤝 Contributing

We welcome contributions to InSpatial Interact! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

---

## 📄 License

InSpatial Dev is released under the Intentional 1.0 License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Ready to build the future of interactive applications?</strong>
  <br>
  <a href="https://www.inspatial.io">Start Building with InSpatial Interact</a>
</div>
