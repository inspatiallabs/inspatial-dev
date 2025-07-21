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

| InSpatial                                        | Description                          | Link             |
| --- | --- | ---- |
| [![InSpatial Dev](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/dev-badge.svg)](https://www.inspatial.dev)     | Universal Libraries & Frameworks     | [inspatial.dev](https://www.inspatial.dev)   |
| [![InSpatial Cloud](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/cloud-badge.svg)](https://www.inspatial.cloud) | Backend APIs and SDKs                | [inspatial.cloud](https://www.inspatial.cloud) |
| [![InSpatial App](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/app-badge.svg)](https://www.inspatial.io)     | Build and manage your InSpatial apps | [inspatial.app](https://www.inspatial.io)   |
| [![InSpatial Store](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/store-badge.svg)](https://www.inspatial.store) | Deploy and discover InSpatial apps   | [inspatial.store](https://www.inspatial.store) |

</div>

---

## 🔍 InSpatial Interact (🟡 Preview)

Universal interactivity and state management system for cross-platform and spatial applications.

InSpatial Interact combines **Signal Core** (fine-grained reactive primitives) with **State** (high-level state management) to create a complete interactivity. Think of Signal Core as the reactive engine and State as the application-level state manager built on top of it.

### 👨‍💻 What Can I Do With InSpatial Interact?

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
- 🎯 **Async Resources** - `createResource` for data fetching with loading states
- ⚡ **Batched Updates** - Efficient update scheduling with `batch`
- 🔄 **Context System** - Dependency injection with `createContext`
- 🔍 **Error Boundaries** - Graceful error handling with `createErrorBoundary`

### 🏗️ State Management (State)
- 🛡️ **Type-Safe State** - Runtime validation using InSpatial Type system
- 🔗 **Trigger Integration** - Connect state to triggers for reactive programming
- 🎨 **StateQL** - Template literals for expressive state updates
- 💾 **Persistence Layer** - Optional storage in various backends
- 📊 **Computed Values** - Create derived values that update automatically
- 📸 **State Snapshots** - Create and restore snapshots for testing
- 🔄 **Schema Generation** - Generate JSON Schema documentation from state types
- 🎯 **Unified API** - Simple get/update methods with minimal boilerplate

### 🌐 Universal Capabilities
- 📦 **Universal Runtime** - Works in Node.js, Deno, Bun, browsers, and native environments
- 📱 **Cross-Platform** - Web, Mobile, Native & XR compatibility
- 🛡️ **TypeScript First** - Full type safety and inference
- 🔄 **Owner Tree** - Automatic cleanup and memory management
- 🧪 **Effect Scheduling** - Precise control over when effects run
- 📝 **Array Utilities** - Efficient list rendering with `mapArray`
- 🧩 **Reconciliation** - Smart diffing for dynamic content

## 🔮 Coming Soon

- 🌐 **Intent** -  Intentional/predictive prefetch for server state
- 📊 **Time Travel Debugging** - Replay state changes and signal updates
- 🤖 **AI-Powered State** - Intelligent state optimization and prediction

## ✨ Architecture Overview ✨

<table>
  <tr>
    <td>
      <h4>🔄 Signal Core Foundation</h4>
      <p>Fine-grained reactivity primitives for building reactive systems</p>
      <pre><code>// Signal Core - Low-level reactivity
const [count, updateCount] = createSignal(0);
const double = createMemo(() => count() * 2);
createEffect(() => console.log(double()));</code></pre>
    </td>
    <td>
      <h4>🏗️ State Layer</h4>
      <p>High-level state management with validation and persistence</p>
      <pre><code>// State - Application-level management
const userState = createState({
  initialState: { name: "ben", age: 24 },
  type: UserType,
  persist: { storage: "localStorage" }
});</code></pre>
    </td>
  </tr>
  <tr>
    <td>
      <h4>⚡ Reactive Integration</h4>
      <p>Signal Core powers State's reactivity under the hood</p>
      <pre><code>// State uses signals internally
const [data] = createResource(fetchUser);
const computed = createComputed(() => 
  userState.get().name.toUpperCase()
);</code></pre>
    </td>
    <td>
      <h4>🎯 Unified Experience</h4>
      <p>Use both APIs together for maximum flexibility</p>
      <pre><code>// Mix and match as needed
const gameState = createState({ ... });
const [fps] = createSignal(60);
createEffect(() => optimizeFor(fps()));</code></pre>
    </td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <h4>📚 Complete Ecosystem</h4>
      <p>From reactive primitives to application state - everything works together seamlessly</p>
      <pre><code>// Triggers connect the layers
const updateTrigger = registerTrigger("game:update", state => ({ score: state.score + 1 }));
gameState.connectTrigger(updateTrigger);</code></pre>
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

### 1. **Choose Your Level of Abstraction**

```typescript
// Option 1: Use State for application-level management
import { createState } from "@in/teract/state"

const appState = createState({
  initialState: { user: null, theme: "dark" },
  persist: { storage: "localStorage" }
});

// Option 2: Use Signal Core for fine-grained control
import { createSignal, createEffect } from "@in/teract/signal-core"

const [user, updateUser] = createSignal(null);
const [theme, updateTheme] = createSignal("dark");
```

### 2. **Basic Reactive Counter**

```typescript
import { createSignal, createEffect } from "@in/teract/signal-core"

// Create reactive primitives
const [count, updateCount] = createSignal(0);

// React to changes
createEffect(() => {
  console.log("Count updated:", count());
});

// Update the value
updateCount(5); // Logs: "Count updated: 5"
```

### 3. **Application State with Validation**

```typescript
import { createState } from "@in/teract/state"
import { type } from "@inspatial/type"

// Define state shape with validation
const UserType = type({
  name: "string|minLength(2)",
  email: "string|regex(/@.+\\..+$/)",
  age: "number|>=0|<=120"
});

// Create validated state
const userState = createState({
  id: "user",
  initialState: {
    name: "ben",
    email: "ben@inspatiallabs.com", 
    age: 24
  },
  type: UserType,
  persist: { storage: "localStorage" }
});

// Updates are automatically validated
userState.update({ age: 25 }); // ✅ Valid
userState.update({ age: -5 });  // ❌ Validation error
```

### 4. **Combining Both Systems**

```typescript
import { createState } from "@in/teract/state"
import { createSignal, createMemo, createEffect } from "@in/teract/signal-core"

// Application state
const gameState = createState({
  initialState: { score: 0, level: 1 }
});

// Real-time signals  
const [fps, updateFPS] = createSignal(60);
const [isPlaying, updateIsPlaying] = createSignal(false);

// Computed values
const gameStatus = createMemo(() => 
  isPlaying() 
    ? `Level ${gameState.get().level} - Score: ${gameState.get().score}`
    : "Paused"
);

// Effects that bridge both systems
createEffect(() => {
  if (fps() < 30 && isPlaying()) {
    console.warn("Low FPS detected, consider reducing quality");
  }
});

createEffect(() => {
  console.log("Game Status:", gameStatus());
});
```

---

## 📚 Complete API Documentation

<details>
<summary><h3>🔄 Signal Core API - Fine-Grained Reactivity Primitives</h3></summary>

Signal Core provides the foundational reactive primitives that power the entire InSpatial Interact system.

### Core Reactive Primitives

#### `createSignal<T>(value: T): [get: () => T, update: (value: T) => void]`
Creates a reactive primitive value.

```typescript
import { createSignal } from "@in/teract/signal-core"

const [count, updateCount] = createSignal(0);
const [user, updateUser] = createSignal({ name: "ben", age: 24 });

console.log(count()); // 0
updateCount(5);
console.log(count()); // 5
```

#### `createMemo<T>(computation: () => T): () => T`
Creates a computed value that automatically updates when dependencies change.

```typescript
import { createSignal, createMemo } from "@in/teract/signal-core"

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
import { createSignal, createEffect } from "@in/teract/signal-core"

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
import { createStore } from "@in/teract/signal-core"

const [store, updateStore] = createStore({
  user: { name: "Ben", age: 24 },
  settings: { theme: "dark", notifications: true }
});

// Fine-grained updates
updateStore("user", "age", 25);
updateStore("settings", "theme", "light");

// Batch updates
updateStore({
  user: { ...store.user, name: "Gwen" },
  settings: { ...store.settings, notifications: false }
});
```

### Async Resources

#### `createResource<T>(fetcher: () => Promise<T>): [data: () => T | undefined, { loading: boolean, error: any }]`
Creates an async data resource with automatic loading states.

```typescript
import { createResource, createEffect } from "@in/teract/signal-core"

const [userData, { loading, error }] = createResource(async () => {
  const response = await fetch('/api/user');
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
import { createSignal, createMemo, batch } from "@in/teract/signal-core"

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
import { createSignal, createMemo, untrack } from "@in/teract/signal-core"

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
import { createContext, useContext, createComponent } from "@in/teract/signal-core"

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
import { createErrorBoundary } from "@in/teract/signal-core"

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

| Function | Description |
|----------|-------------|
| `createSignal<T>()` | Creates a reactive primitive value |
| `createMemo<T>()` | Creates a computed value with caching |
| `createEffect()` | Creates a side effect that runs on changes |
| `createStore<T>()` | Creates a reactive object store |
| `createResource<T>()` | Creates an async data resource |
| `createContext<T>()` | Creates a dependency injection context |
| `batch<T>()` | Groups updates into a single synchronous batch |
| `untrack<T>()` | Reads values without creating dependencies |
| `createErrorBoundary<T>()` | Provides error handling boundaries |
| `createSuspense()` | Manages loading states for async operations |
| `createRenderEffect()` | Creates effects that run during render phase |

</details>

<details>
<summary><h3>🏗️ State API - Application-Level State Management</h3></summary>

State provides high-level state management with validation, persistence, and expressive update patterns built on Signal Core.

### Core State Management

#### `createState<T>(config: StateConfig<T>): StateInstance<T>`
Creates a managed state instance with optional validation and persistence.

```typescript
import { createState } from "@in/teract/state"
import { type } from "@inspatial/type"

const UserType = type({
  name: "string|minLength(2)",
  email: "string|regex(/@.+\\..+$/)",
  age: "number|>=0|<=120"
});

const userState = createState({
  id: "user",
  initialState: {
    name: "ben",
    email: "ben@inspatiallabs.com",
    age: 24
  },
  type: UserType,
  persist: { storage: "localStorage" }
});

// Read state
console.log(userState.get().name); // "ben"

// Update state (validated automatically)
userState.update({ age: 25 });

// Subscribe to changes
const unsubscribe = userState.subscribe(state => {
  console.log("User updated:", state);
});
```

### StateQL - Template Literal Updates

#### `stateQL<T>(state: StateInstance<T>): StateQLInstance<T>`
Enhances a state with template literal update syntax.

```typescript
import { createState, stateQL } from "@in/teract/state"

const gameState = stateQL(createState({
  initialState: {
    player: {
      health: 100,
      mana: 50,
      position: { x: 0, y: 0, z: 0 }
    },
    inventory: [],
    score: 0
  }
}));

// Expressive updates with template literals
gameState.update`
  player.health -= 10,
  player.mana -= 5,
  score += 100
`;

// Interpolate dynamic values
const newItem = { id: "potion", name: "Health Potion" };
gameState.update`inventory.push(${newItem})`;

// Conditional logic
gameState.update`
  if (player.health < 30) {
    player.status = "critical"
  } else {
    player.status = "healthy"
  }
`;
```

### Computed State and Derivation

#### `createComputed<T>(computation: () => T): () => T`
Creates a computed value that updates when dependencies change.

```typescript
import { createState, createComputed } from "@in/teract/state"

const cartState = createState({
  initialState: {
    items: [
      { id: "1", price: 19.99, quantity: 2 },
      { id: "2", price: 39.99, quantity: 1 }
    ],
    taxRate: 0.08
  }
});

const subtotal = createComputed(() => 
  cartState.get().items.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  )
);

const total = createComputed(() => {
  const sub = subtotal();
  return sub + (sub * cartState.get().taxRate);
});

console.log(total()); // Automatically updates when cart changes
```

#### `createDerivedState<T, U>(source: StateInstance<T>, computation: (state: T) => U): StateInstance<U>`
Creates state derived from another state instance.

```typescript
import { createState, createDerivedState } from "@in/teract/state"

const userState = createState({
  initialState: { name: "ben", age: 24, isActive: true }
});

const userUIState = createDerivedState(
  userState,
  user => ({
    displayName: user.name.toUpperCase(),
    canVote: user.age >= 18,
    statusText: user.isActive ? "Online" : "Offline"
  })
);

console.log(userUIState.get().displayName); // "BEN"
```

### Trigger Integration

#### `registerTrigger<T>(name: string, handler: (state: T, ...args: any[]) => Partial<T>): Trigger<T>`
Registers a trigger that can be connected to state instances.

```typescript
import { createState } from "@in/teract/state"
import { registerTrigger } from "@in/teract/trigger"

// Define triggers
const incrementTrigger = registerTrigger("counter:increment", 
  (state, amount = 1) => ({
    count: state.count + amount
  })
);

const resetTrigger = registerTrigger("counter:reset", 
  () => ({ count: 0 })
);

// Create state with triggers
const counterState = createState({
  initialState: { count: 0 },
  triggers: ["counter:increment", "counter:reset"]
});

// Use auto-generated actions
counterState.action.increment(5); // count = 5
counterState.action.reset();      // count = 0
```

### Persistence and Storage

#### `setupPersistence<T>(state: StateInstance<T>, options: PersistOptions): PersistenceController`
Configures persistence for a state instance.

```typescript
import { createState, setupPersistence, StorageAdapters } from "@in/teract/state"

const gameState = createState({
  initialState: { level: 1, score: 0, playerName: "Player1" }
});

const { save, load, clear } = setupPersistence(gameState, {
  storage: "indexedDB",
  key: "game_save_data",
  autoSave: true,
  saveInterval: 5000,
  include: ["level", "score"], // Only persist these fields
  exclude: ["playerName"]      // Don't persist player name
});

// Manual operations
await save();
await load();
await clear();
```

### Type-Safe State with Validation

#### Predefined State Types

```typescript
import { createState, StateTypes } from "@in/teract/state"

// Use predefined types
const toggleState = createState({
  initialState: { enabled: false },
  type: StateTypes.Toggle
});

const counterState = createState({
  initialState: { count: 0, step: 1 },
  type: StateTypes.Counter
});

const listState = createState({
  initialState: { items: [], filter: "all" },
  type: StateTypes.List
});
```

### State API Reference

| Function | Description |
|----------|-------------|
| `createState<T>()` | Creates a managed state instance with validation |
| `stateQL<T>()` | Enhances state with template literal syntax |
| `createComputed<T>()` | Creates a computed value from state |
| `createDerivedState<T, U>()` | Creates state derived from another state |
| `createDerivedStateFromMultiple()` | Creates state from multiple sources |
| `setupPersistence<T>()` | Configures state persistence |
| `connectTriggerToState<T>()` | Connects triggers to state manually |
| `validateState<T>()` | Validates state against a type schema |
| `registerStateSchema<T>()` | Registers reusable state schemas |
| `getStateJsonSchema<T>()` | Generates JSON Schema from state type |

### Storage Adapters

| Adapter | Description |
|---------|-------------|
| `localStorage` | Browser localStorage (default) |
| `sessionStorage` | Browser sessionStorage |
| `indexedDB` | Browser IndexedDB for large data |
| `memory` | In-memory storage (testing) |
| `custom` | Custom storage implementation |

</details>

<details>
<summary><h3>🎮 Trigger API - Event-Driven Actions</h3></summary>

Triggers provide a clean way to connect actions and events to state changes.

### Core Trigger Functions

#### `registerTrigger<T>(name: string, handler: TriggerHandler<T>): Trigger<T>`
Registers a trigger with a specific name and handler.

```typescript
import { registerTrigger } from "@in/teract/trigger"

const addItemTrigger = registerTrigger("cart:addItem", 
  (state, item, quantity = 1) => {
    const existingItem = state.items.find(i => i.id === item.id);
    
    if (existingItem) {
      return {
        items: state.items.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      };
    }
    
    return {
      items: [...state.items, { ...item, quantity }]
    };
  }
);
```

#### `triggerAction<T>(name: string, ...args: any[]): void`
Manually triggers an action.

```typescript
import { triggerAction } from "@in/teract/trigger"

// Trigger actions manually
triggerAction("cart:addItem", { id: "prod1", name: "Laptop", price: 999 });
triggerAction("cart:removeItem", "prod1");
```

### Trigger Integration with State

```typescript
import { createState } from "@in/teract/state"
import { registerTrigger } from "@in/teract/trigger"

// Define multiple triggers
const triggers = {
  increment: registerTrigger("counter:increment", 
    (state, amount = 1) => ({ count: state.count + amount })
  ),
  decrement: registerTrigger("counter:decrement", 
    (state, amount = 1) => ({ count: state.count - amount })
  ),
  reset: registerTrigger("counter:reset", 
    () => ({ count: 0 })
  ),
  set: registerTrigger("counter:set", 
    (state, value) => ({ count: value })
  )
};

// Create state connected to triggers
const counterState = createState({
  initialState: { count: 0 },
  triggers: Object.keys(triggers)
});

// Use generated actions
counterState.action.increment(5);    // count = 5
counterState.action.decrement(2);    // count = 3
counterState.action.set(10);         // count = 10
counterState.action.reset();         // count = 0
```

### Advanced Trigger Patterns

#### Async Triggers
```typescript
const fetchUserTrigger = registerTrigger("user:fetch", 
  async (state, userId) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      const user = await response.json();
      return { user, loading: false, error: null };
    } catch (error) {
      return { user: null, loading: false, error: error.message };
    }
  }
);
```

#### Conditional Triggers
```typescript
const conditionalUpdateTrigger = registerTrigger("game:update", 
  (state, action) => {
    if (state.gameOver) {
      return state; // No changes if game is over
    }
    
    switch (action.type) {
      case "MOVE":
        return { player: { ...state.player, ...action.position } };
      case "SCORE":
        return { score: state.score + action.points };
      default:
        return state;
    }
  }
);
```

### Trigger API Reference

| Function | Description |
|----------|-------------|
| `registerTrigger<T>()` | Registers a named trigger with handler |
| `triggerAction()` | Manually triggers an action |
| `connectTriggerToState<T>()` | Connects trigger to state instance |
| `disconnectTrigger()` | Removes trigger from state |
| `listTriggers()` | Gets all registered triggers |
| `getTrigger()` | Gets specific trigger by name |

</details>

---

## 🔍 Performance and Architecture

<details>
<summary><h3>⚡ Fine-Grained Reactivity Benefits</h3></summary>

InSpatial Interact leverages fine-grained reactivity to provide industry-leading performance:

### Performance Benefits

- **Minimal Re-renders**: Only components using changed data update
- **Automatic Optimization**: Dead code elimination through precise tracking
- **Batched Updates**: Multiple changes processed efficiently in single cycles
- **Memory Efficiency**: Automatic cleanup prevents memory leaks
- **Predictable Performance**: Complexity scales with actual changes, not data size

### When to Use Each Layer

**Use Signal Core when:**
- Building framework integrations
- Need maximum performance control
- Creating reactive libraries
- Working with fine-grained reactive patterns

**Use State when:**
- Building applications
- Need validation and persistence
- Want higher-level abstractions
- Prefer declarative state management

**Use Both when:**
- Need maximum flexibility
- Building complex applications
- Mixing application state with real-time data
- Creating hybrid reactive systems

</details>

<details>
<summary><h3>🏗️ Architecture Patterns</h3></summary>

### Layered Architecture

```
┌─────────────────────────────────────┐
│            Application              │
├─────────────────────────────────────┤
│              State                  │  ← High-level state management
├─────────────────────────────────────┤
│           Signal Core               │  ← Fine-grained reactivity
├─────────────────────────────────────┤
│            Runtime                  │  ← Universal JavaScript runtime
└─────────────────────────────────────┘
```

### Reactive Data Flow

```
Signal/State ──→ Computed ──→ Effect ──→ Side Effects
     ↑                                      ↓
     └──────────── Actions/Triggers ←───────┘
```

### Integration Patterns

#### Pattern 1: Pure Signal Core
```typescript
// Fine-grained control for performance-critical code
const [position, updatePosition] = createSignal({ x: 0, y: 0 });
const [rotation, updateRotation] = createSignal(0);

const transform = createMemo(() => 
  `translate(${position().x}, ${position().y}) rotate(${rotation()}deg)`
);
```

#### Pattern 2: Pure State
```typescript
// Application-level state with validation
const appState = createState({
  initialState: { user: null, theme: "dark", data: [] },
  type: AppStateType,
  persist: { storage: "localStorage" }
});
```

#### Pattern 3: Hybrid Approach
```typescript
// Mix both for optimal flexibility
const gameState = createState({ 
  initialState: { level: 1, score: 0 } 
});

const [fps, updateFPS] = createSignal(60);
const [isPlaying, updateIsPlaying] = createSignal(false);

const performance = createMemo(() => ({
  fps: fps(),
  level: gameState.get().level,
  optimized: fps() > 45
}));
```

</details>

---

## 🧪 Testing

### Running Tests

```bash
# Test Signal Core
deno task test:signal-core

# Test State
deno task test:state

# Test Triggers
deno task test:trigger

# Test everything
deno task test
```

### Example Test Patterns

<details>
<summary><h3>Testing Signal Core</h3></summary>

```typescript
import { test, expect, describe, it } from "@inspatial/test"
import { createSignal, createMemo, createEffect } from "@in/teract/signal-core"

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

<details>
<summary><h3>Testing State</h3></summary>

```typescript
import { test, expect, describe, it } from "@inspatial/test"
import { createState } from "@in/teract/state"
import { type } from "@inspatial/type"

describe("State Management", () => {
  it("should create and update state", () => {
    const state = createState({
      initialState: { count: 0 }
    });
    
    expect(state.get().count).toBe(0);
    state.update({ count: 5 });
    expect(state.get().count).toBe(5);
  });

  it("should validate state updates", () => {
    const UserType = type({
      name: "string|minLength(2)",
      age: "number|>=0"
    });

    const userState = createState({
      initialState: { name: "ben", age: 24 },
      type: UserType
    });

    expect(() => userState.update({ age: -1 })).toThrow();
    expect(() => userState.update({ name: "B" })).toThrow();
    expect(() => userState.update({ age: 25 })).not.toThrow();
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
| Function | Description |
|----------|-------------|
| `createSignal<T>()` | Creates reactive primitive value |
| `createMemo<T>()` | Creates computed value with caching |
| `createEffect()` | Creates side effect that runs on changes |
| `createStore<T>()` | Creates reactive object store |
| `createResource<T>()` | Creates async data resource |
| `batch<T>()` | Groups updates into single batch |
| `untrack<T>()` | Reads values without dependencies |

### State Functions
| Function | Description |
|----------|-------------|
| `createState<T>()` | Creates managed state with validation |
| `stateQL<T>()` | Enhances state with template literals |
| `createComputed<T>()` | Creates computed value from state |
| `createDerivedState<T,U>()` | Creates derived state |
| `setupPersistence<T>()` | Configures state persistence |

### Trigger Functions
| Function | Description |
|----------|-------------|
| `registerTrigger<T>()` | Registers named trigger |
| `triggerAction()` | Manually triggers action |
| `connectTriggerToState<T>()` | Connects trigger to state |

### TypeScript Interfaces
| Interface | Description |
|-----------|-------------|
| `SignalType<T>` | Signal getter/setter types |
| `StateInstance<T>` | State instance interface |
| `StateConfig<T>` | State configuration options |
| `TriggerHandler<T>` | Trigger function signature |
| `PersistOptions` | Persistence configuration |

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
  <a href="https://www.inspatiallabs.com">Start Building with InSpatial Interact</a>
</div>
