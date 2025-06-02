<div align="center">
    <a href="https://inspatiallabs.com" target="_blank">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-light.svg">
        <source media="(prefers-color-scheme: dark)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg">
        <img src="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg" alt="InSpatial" width="300"/>
    </picture>
    </a>

<br>
   <br>

<a href="https://inspatiallabs.com" target="_blank">
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
[![InSpatial App](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/app-badge.svg)](https://www.inspatial.app)
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
| [![InSpatial App](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/app-badge.svg)](https://www.inspatial.app)     | Build and manage your InSpatial apps | [inspatial.app](https://www.inspatial.app)   |
| [![InSpatial Store](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/store-badge.svg)](https://www.inspatial.store) | Deploy and discover InSpatial apps   | [inspatial.store](https://www.inspatial.store) |

</div>

---

## 🔍 InSpatial Signal Core (🟡 Preview)

InSpatial Signal Core is (Interact's) foundational system for universal interactivity.

### 👨‍💻 What Can I Do With InSpatial Signal Core?

- **Build Reactive UIs**: Create dynamic interfaces that automatically update when data changes
- **Manage Application State**: Handle complex state with signals, stores, and computed values
- **Handle Async Operations**: Fetch data with automatic loading states and error boundaries
- **Optimize Performance**: Enjoy fine-grained updates that only re-render what actually changed
- **Create Spatial Apps**: Power AR/VR/MR experiences with reactive 3D state management

## 🌟 Features

- 📦 **Universal Runtime** - Works in Node.js, Deno, Bun, and browsers and at runtime
- 📱 **Cross-Platform** -  Works for Web, Native & XR
- 🌍 **Fine-Grained Reactivity** - Updates only what actually changed
- 🔍 **Automatic Dependency Tracking** - No manual subscription management needed
- 🎮 **Signal Primitives** - `createSignal`, `createMemo`, `createEffect`
- 📝 **Reactive Stores** - Complex object state with `createStore`
- 🎯 **Async Resources** - `createResource` for data fetching with loading states
- ⚡ **Batched Updates** - Efficient update scheduling with `batch`
- 🔄 **Context System** - Dependency injection with `createContext`
- 🔍 **Error Boundaries** - Graceful error handling with `createErrorBoundary`
- 🎨 **Suspense Support** - Loading UI coordination with `createSuspense`
- 🛡️ **TypeScript First** - Full type safety and inference
- 🔄 **Owner Tree** - Automatic cleanup and memory management
- 🧪 **Effect Scheduling** - Precise control over when effects run
- 📝 **Array Utilities** - Efficient list rendering with `mapArray`
- 🧩 **Reconciliation** - Smart diffing for dynamic content
- 📸 **Untracking** - Read values without creating dependencies
- 📈 **Dev Tools Ready** - Built-in debugging and inspection utilities


## 🔮 Coming Soon

- 📊 **Time Travel Debugging** - Replay state changes
- 🤖 **AI-Powered State** - Intelligent state predictions

## ✨ Advanced Features ✨

<table>
  <tr>
    <td>
      <h4>🔄 Reactive Computations</h4>
      <p>Automatically tracks dependencies and updates efficiently</p>
      <pre><code>const [count, updateCount] = createSignal(0);
const double = createMemo(() => count() * 2);
createEffect(() => console.log(double()));</code></pre>
    </td>
    <td>
      <h4>🧩 Store Management</h4>
      <p>Complex object state with fine-grained reactivity</p>
      <pre><code>const [store, updateStore] = createStore({
  user: { name: "Ben", age: 24 },
  posts: []
});</code></pre>
    </td>
  </tr>
  <tr>
    <td>
      <h4>⚡ Async Operations</h4>
      <p>Built-in loading states and error handling</p>
      <pre><code>const [data] = createResource(async () => {
  return fetch('/api/data').then(r => r.json());
});</code></pre>
    </td>
    <td>
      <h4>📋 Effect Scheduling</h4>
      <p>Control when and how side effects execute</p>
      <pre><code>createEffect(() => {
  // Runs when dependencies change
});

createRenderEffect(() => {
  // Runs synchronously before render
});</code></pre>
    </td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <h4>📚 Context & Error Boundaries</h4>
      <p>Dependency injection and graceful error handling</p>
      <pre><code>const ThemeContext = createContext();
const ErrorBoundary = createErrorBoundary(
  () => riskyComponent(),
  (err, reset) => `<div>Error: ${err.message} <button onclick=${reset}>Retry</button></div>`
);</code></pre>
    </td>
  </tr>
</table>

<div align="center">
  <h4>🚀 Keep reading to learn how to use all these amazing features! 🚀</h4>
</div>


## 📦 Install InSpatial Signal Core:

Choose your preferred package manager:

```bash
deno install jsr:@in/teract/signal-core
```

##

```bash
npx jsr add @in/teract/signal-core
```

##

```bash
yarn dlx jsr add @in/teract/signal-core
```

##

```bash
pnpm dlx jsr add @in/teract/signal-core
```

##

```bash
bunx jsr add @in/teract/signal-core
```

## 🛠️ Step-by-Step Usage Guide

Here are the essential usage patterns for working with InSpatial Signal Core:

### 1. **Basic Signals**

```typescript
import { createSignal, createEffect } from "@in/teract/signal-core"

// Create a reactive value
const [count, updateCount] = createSignal(0);

// React to changes
createEffect(() => {
  console.log("Count is:", count());
});

updateCount(5); // Logs: "Count is: 5"
```

### 2. **Computed Values**

```typescript
import { createSignal, createMemo } from "@in/teract/signal-core"

const [firstName, updateFirstName] = createSignal("Ben");
const [lastName, updateLastName] = createSignal("Emma");

// Automatically recomputes when dependencies change
const fullName = createMemo(() => `${firstName()} ${lastName()}`);

console.log(fullName()); // "Ben Emma"
updateFirstName("Gwen");
console.log(fullName()); // "Gwen Emma"
```

### 3. **Reactive Stores**

```typescript
import { createStore } from "@in/teract/signal-core"

const [user, updateUser] = createStore({
  profile: { name: "Ben", age: 24 },
  settings: { theme: "dark", notifications: true }
});

// Fine-grained updates
updateUser("profile", "name", "Gwen");
updateUser("settings", "theme", "light");
```

### 4. **Async Resources**

```typescript
import { createResource, createEffect } from "@in/teract/signal-core"

const [userData] = createResource(async () => {
  const response = await fetch('/api/user');
  return response.json();
});

createEffect(() => {
  console.log("User data:", userData());
  // Automatically handles loading states
});
```

---

### 🔄 Reactive System - The heart of fine-grained updates

The reactive system automatically tracks dependencies between signals, memos, and effects. When a signal changes, only the computations that actually depend on it are re-evaluated.

```typescript
import { createSignal, createMemo, createEffect, batch } from "@in/teract/signal-core"

const [a, updateA] = createSignal(1);
const [b, updateB] = createSignal(2);

const sum = createMemo(() => a() + b());
const product = createMemo(() => a() * b());

createEffect(() => console.log("Sum:", sum()));
createEffect(() => console.log("Product:", product()));

// Batch updates to avoid intermediate calculations
batch(() => {
  updateA(10);
  updateB(20);
});
// Only logs final values: "Sum: 30", "Product: 200"
```

#### Reactive System Functions

| Function         | Description              |
| ---- | --- |
| `createSignal()` | Creates a reactive primitive value |
| `createMemo()` | Creates a computed value with caching |
| `createEffect()` | Creates a side effect that runs on changes |
| `batch()` | Groups updates to run synchronously |
| `untrack()` | Reads values without creating dependencies |


### 🧩 Store Management - Complex reactive state made simple

Store management provides fine-grained reactivity for complex objects. Each property path can be tracked independently for maximum performance.

```typescript
import { createStore, createEffect } from "@in/teract/signal-core"

const [store, updateStore] = createStore({
  todos: [
    { id: 1, text: "Learn Signal Core", done: false },
    { id: 2, text: "Build amazing apps", done: false }
  ],
  filter: "all",
  stats: { total: 2, completed: 0 }
});

// Only runs when the filter changes
createEffect(() => console.log("Filter:", store.filter));

// Only runs when a todo's done status changes
createEffect(() => {
  const completed = store.todos.filter(todo => todo.done).length;
  updateStore("stats", "completed", completed);
});

// Update individual todo
updateStore("todos", 0, "done", true);
```

---

## 🔍 Reactivity Tradeoffs

InSpatial Signal Core leverages fine-grained reactivity capabilities, which provides strong performance benefits but comes with architectural considerations:

### Performance Benefits

- **Minimal Re-renders**: Only components that use changed data update
- **Automatic Optimization**: Dead code elimination through precise tracking  
- **Batched Updates**: Multiple changes processed efficiently in single cycles
- **Memory Efficiency**: Automatic cleanup prevents memory leaks
- **Predictable Performance**: Computational complexity scales with actual changes

### Architectural Considerations

- **Reactive Suitability**:

  - ✅ **Ideal for**: Real-time UIs, spatial computing, data dashboards, interactive applications
  - ⚠️ **Consider alternatives for**: Simple static sites, one-time data displays

- **Complexity Sources**:
  - **Learning Curve**: Understanding reactive patterns and avoiding common pitfalls
  - **Debugging**: Tracing reactive dependencies requires different mental models

### When to Use Signal Core

Consider using InSpatial Signal Core's enhanced reactive features for:

- Building spatial computing applications (AR/VR/MR)
- Creating real-time collaborative interfaces
- Managing complex application state
- Optimizing performance-critical user interfaces
- Developing universal applications (web, mobile, embedded, desktop)

For maximum performance with less stringent reactivity requirements, you can configure Signal Core to use simpler patterns for specific components.

## 🛡️ How Fine-Grained Reactivity Powers InSpatial Signal Core

InSpatial Signal Core leverages [fine-grained reactivity](https://en.wikipedia.org/wiki/Reactive_programming) to provide industry-leading update performance. Here's what makes fine-grained reactivity special and why we chose it:

### What is Fine-Grained Reactivity?

Fine-grained reactivity is a programming paradigm where changes automatically propagate through a dependency graph with surgical precision. Unlike coarse-grained systems that re-render entire component trees, fine-grained reactivity updates only the specific values that actually changed.

### How Fine-Grained Reactivity Works (Simplified)

Think of it like a smart electrical grid that only powers the specific appliances that need electricity, rather than cycling the entire neighborhood's power.

1. **Dependency Tracking**: Signals automatically track which computations read their values
2. **Change Propagation**: When a signal updates, only dependent computations are notified  
3. **Efficient Updates**: The system batches and optimizes updates for maximum performance

```
Signal A ──┐
           ├─→ Memo C ──→ Effect E
Signal B ──┘
           └─→ Effect D

When Signal A changes:
- Memo C updates (depends on A)
- Effect E updates (depends on C)
- Effect D stays unchanged (only depends on B)
```

### Why Fine-Grained Reactivity is Essential for InSpatial Signal Core

1. **Spatial Performance**: AR/VR applications need 60-90 FPS with minimal frame drops
2. **Complex State Trees**: 3D scenes have thousands of objects with independent properties
3. **Real-time Updates**: Spatial apps often have streaming sensor data requiring immediate response
4. **Memory Efficiency**: Mobile XR devices have limited resources requiring optimal memory usage
5. **Universal Performance**: Same code performs well across web, mobile, and native platforms
6. **Developer Experience**: Automatic optimization means less manual performance tuning

### Fine-Grained Reactivity in the InSpatial Signal Core Architecture

InSpatial Signal Core uses fine-grained reactivity differently than traditional web frameworks:

- **Spatial Primitives**: 3D transforms, physics properties, and spatial relationships are tracked independently
- **Frame-Rate Aware**: Updates are scheduled to maintain consistent frame rates in XR environments
- **Cross-Platform Optimization**: Reactivity adapts to different runtime capabilities (Node.js vs browser vs native)
- **Memory Pools**: Reactive computations use object pooling for garbage collection efficiency

This architecture gives you desktop-class performance with mobile-friendly resource usage.

## 🧪 Testing

The Signal Core system includes comprehensive unit tests:

```bash
deno task test:signal-core
```

Tests cover all reactive primitives, edge cases, memory management, and performance characteristics.


> Note: Integration tests verify reactive behavior across different runtime environments and complex dependency graphs.

---

## 🤔 FAQ

### "Can I use this with existing React/Vue/Svelte/Angular/Solid/React-Native/NativeScript/Lynx applications?"

Yes! Signal Core is designed to work seamlessly across any JavaScript or TypeScript runtime environment, making it fully compatible with any framework or platform.

### "Does this work in XR & Native environments?"

Absolutely! Signal Core was designed with mobile and spatial computing in mind. It effectively handles 3D transformations, physics properties, and real-time sensor data with frame-rate aware scheduling.

### "Can I manage local, global and server state with this?"

Yes! Signal Core provides all the interactive primitives needed for managing and creating all kinds of state. 

### "How is it different from (Interact - InSpatial State)?"

Signal Core is the foundation and the lowest level api in which InSpatial State is built upon. In simpler terms it is InSpatial State Management Engine. 

### "Should I use (Interact - InSpatial Signal Core or InSpatial State)?"

InSpatial State provides a higher-level abstraction built on top of Signal Core, featuring a composable and encapsulated design with natural language-like APIs. While working with InSpatial State, you're still leveraging Signal Core under the hood. The choice between using Signal Core directly or InSpatial State depends on your preferred level of abstraction. InSpatial State offers additional features and improved abstraction since it's built on Signal Core. Developers familiar with SolidJS, React, or Preact may find Signal Core's lower-level APIs particularly useful, as they closely mirror the state primitives of these platforms.


### "How does cleanup work to prevent memory leaks?"

Signal Core includes an automatic ownership tree system. When computations are no longer needed, they're automatically disposed along with their dependencies. You can also use `onCleanup` for manual resource management.

### "What's the performance overhead compared to manual state management?"

The reactive system adds minimal overhead while providing substantial benefits. Fine-grained updates often perform better than manual optimization because only necessary computations run.

## 🎯 API Reference

### Core Functions

| Function         | Description              |
| ---- | --- |
| `createSignal()` | Creates a reactive primitive value |
| `createMemo()` | Creates a computed value with automatic caching |
| `createEffect()` | Creates a side effect that runs when dependencies change |
| `createStore()` | Creates a reactive object store |
| `createResource()` | Creates an async data resource with loading states |
| `createContext()` | Creates a dependency injection context |
| `batch()` | Groups multiple updates into a single synchronous batch |

### Reactive Primitives

| Class/Type  | Description           |
| ----- | --- |
| `ComputationClass` | Core reactive computation node |
| `EffectClass` | Specialized computation for side effects |

### Advanced Features

| Feature       | Description             |
| ---- | ----- |
| `createSuspense()` | Manages loading states for async operations |
| `createErrorBoundary()` | Provides error handling boundaries |
| `createRenderEffect()` | Creates effects that run during render phase |

### TypeScript Interfaces

This package exports the following TypeScript interfaces and types:

| Interface        | Description                |
| ---- | ----- |
| `SignalType<T>`  | Type definition for signal getters and setters  |
| `AccessorType<T>`  | Type for value accessor functions  |
| `StoreType<T>`  | Type for reactive store objects  |
| `ResourceType<T>`  | Type for async resource management  |
| `ContextType<T>`  | Type for dependency injection contexts  |
| `EffectOptionsType`  | Configuration options for effects  |
| `MemoOptionsType<T>`  | Configuration options for memos  |
| `SignalOptionsType<T>`  | Configuration options for signals  |
| `ComputeFunctionType<T, U>`  | Type for computation functions  |
| `EffectFunctionType<T, U>`  | Type for effect side effect functions  |
| `ResourceOptionsType<T, S>`  | Configuration options for resources |

---

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](mdc:CONTRIBUTING.md) to get started.

---

## 📄 License

InSpatial Core is released under the Apache 2.0 License. See the [LICENSE](mdc:LICENSE) file for details.

---

<div align="center">
  <strong>Ready to shape the future of spatial computing?</strong>
  <br>
  <a href="https://www.inspatiallabs.com">Start Building with InSpatial</a>
</div> 