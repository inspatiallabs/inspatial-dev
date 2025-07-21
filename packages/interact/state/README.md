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

## 🔍 InSpatial State (🔴 Unstable)

Universal state management with powerful type validation for all InSpatial applications.

### 👨‍💻 What Can I Do With InSpatial State?

- **Unified State Management**: Create, update, and sync state across your entire application with a clean API
- **Runtime Type Validation**: Ensure your state always matches its expected shape with the InSpatial Type system
- **Trigger Integration**: Connect state to triggers for reactive programming patterns
- **Expressive Updates**: Use either standard object updates or StateQL template literals for natural syntax
- **Schema Generation**: Generate JSON Schema documentation from your state types

## 🌟 Features

- 🌍 **Universal Compatibility**: Works on all platforms - web, mobile, XR and more
- 🔍 **Single Source of Truth**: Maintain consistent state across your application
- 🎮 **Integrated State Triggers**: Connect actions directly to state updates
- 📝 **Type-Safe State**: Runtime validation using InSpatial Type system
- 🎯 **Intuitive API**: Simple get/update methods with minimal boilerplate
- ⚡ **Optimized Performance**: Fine-tuned for minimal re-renders and updates
- 🔄 **Computed Values**: Create derived values that update automatically
- 🔍 **Persistence Layer**: Optional storage of state in various backends
- 🎨 **Expressive Updates**: Template literals for more intuitive state changes
- 🛡️ **Schema Validation**: Runtime checking of state against schemas
- 🔄 **Batched Updates**: Performance optimization for multiple updates
- 🧪 **Time-Travel Debugging**: Dev tools for tracking state changes
- 📝 **Documentation Generation**: Auto-generate API docs from state schema
- 🧩 **Composable Design**: Build complex state from simpler pieces
- 📸 **State Snapshots**: Create and restore snapshots for testing
- 📈 **Built On Signal Core**: Seamless bridge between signals and triggers
- 📦 **Storage Adapters**: Multiple storage backends with unified API

## 🔮 Coming Soon

- 🎮 **XR State Synchronization**: Real-time state sync for spatial applications
- 🌐 **Distributed State**: Multi-device state sharing and synchronization
- 📊 **State Analytics**: Performance monitoring and usage analytics
- 🤖 **AI-Powered State**: Intelligent state optimization and prediction

## ✨ Advanced Features ✨

<table>
  <tr>
    <td>
      <h4>🔄 Type-Safe State</h4>
      <p>Runtime validation with InSpatial Type system ensures your state always matches its expected shape.</p>
      <pre><code>const userState = createState({
  id: "user",
  initialState: { name: "ben", age: 24 },
  type: type({
    name: "string",
    age: "number|>0|<120"
  })
});

// Valid update - passes validation
userState.update({ age: 31 });

// Invalid update - caught at runtime
userState.update({ age: "not a number" });
</code></pre>
    </td>
    <td>
      <h4>🧩 Trigger Integration</h4>
      <p>Connect state to triggers for clean, reactive programming patterns with automatic action generation.</p>
      <pre><code>const incrementTrigger = registerTrigger("counter:increment", 
  (state, amount = 1) => ({
    count: state.count + amount
  })
);

const counterState = createState({
  initialState: { count: 0 },
  triggers: ["counter:increment"]
});

// Use generated action
counterState.action.increment(5);
</code></pre>
    </td>
  </tr>
  <tr>
    <td>
      <h4>⚡ StateQL</h4>
      <p>Express state updates naturally using JavaScript template literals with arithmetic and conditional logic.</p>
      <pre><code>const gameState = stateQL(createState({
  initialState: {
    health: 100,
    position: { x: 0, y: 0 },
    inventory: []
  }
}));

gameState.update`
  health -= 10,
  position.x += 5,
  inventory.push(${newItem})
`;
</code></pre>
    </td>
    <td>
      <h4>📋 Computed State</h4>
      <p>Create derived values that update automatically when dependencies change, optimized with memoization.</p>
      <pre><code>const totalItems = createComputed(() => {
  return cartState.get().items.reduce((sum, item) => 
    sum + item.quantity, 0);
});

// Auto-updates when cart changes
cartState.update({ 
  items: [...cartState.get().items, newItem]
});

console.log(totalItems()); // Updated value
</code></pre>
    </td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <h4>📚 Persistence & Storage</h4>
      <p>Store state with flexible backends from localStorage to remote databases with automatic synchronization.</p>
      <pre><code>const userPrefsState = createState({
  id: "userPrefs",
  initialState: { theme: "light", fontSize: "medium" },
  persist: {
    storage: "localStorage",
    key: "user-preferences",
    autoSave: true
  }
});

// Automatically saved and restored
userPrefsState.update({ theme: "dark" });
</code></pre>
    </td>
  </tr>
</table>

<div align="center">
  <h4>🚀 Keep reading to learn how to use all these amazing features! 🚀</h4>
</div>

## 📦 Install InSpatial State:

Choose your preferred package manager:

```bash
deno install jsr:@in/teract/state
```

##

```bash
npx jsr add @in/teract/state
```

##

```bash
yarn dlx jsr add @in/teract/state
```

##

```bash
pnpm dlx jsr add @in/teract/state
```

##

```bash
bunx jsr add @in/teract/state
```

## 🛠️ Step-by-Step Usage Guide

Here are the essential usage patterns for working with InSpatial State:

### 1. **Basic State Creation**

```typescript
import { createState } from "@in/teract/state"

// Create a simple counter state
const counterState = createState({
  id: "counter", // Optional ID for global reference
  initialState: { count: 0 }
});

// Read the state
console.log(counterState.get().count); // 0

// Update the state
counterState.update({ count: 1 });
// or
counterState.update(state => ({ count: state.count + 1 }));

// Subscribe to changes
const unsubscribe = counterState.subscribe(state => {
  console.log("Counter changed:", state.count);
});

// Clean up when done
unsubscribe();
// or
counterState.destroy();
```

### 2. **Type-Safe State with Validation**

```typescript
import { createState } from "@in/teract/state"
import { type } from "@inspatial/type"

// Define a user profile type
const UserProfileType = type({
  username: "string|minLength(3)|maxLength(20)",
  email: "string|regex(/@.+\\..+$/)",
  age: "number|>=18|<=120"
});

// Create a state with type validation (enabled by default)
const userState = createState({
  id: "user",
  initialState: {
    username: "benemma",
    email: "ben@inspatiallabs.com",
    age: 24
  },
  type: UserProfileType
});

// Valid update - passes validation
userState.update({ age: 31 });

// Invalid update - triggers validation error
try {
  userState.update({ age: 15 }); // Age below minimum
} catch (error) {
  console.error("Validation failed:", error);
}

// You can also disable validation if needed
const nonValidatedState = createState({
  id: "settings",
  initialState: { theme: "light" },
  type: UserProfileType
}, {
  validateType: false // Disable validation
});
```

### 3. **Connecting Triggers to State**

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
  state => ({ count: 0 })
);

// Create state with triggers
const counterState = createState({
  initialState: { count: 0 },
  triggers: ["counter:increment", "counter:reset"]
});

// Use the auto-generated actions
counterState.action.increment(5); // count = 5
counterState.action.reset();      // count = 0

// Add a trigger dynamically
const multiplyTrigger = registerTrigger("counter:multiply", 
  (state, factor = 2) => ({
    count: state.count * factor
  })
);

counterState.connectTrigger(multiplyTrigger);
counterState.action.multiply(10); // count = 0 * 10 = 0
```

### 4. **Using StateQL for Expressive Updates**

```typescript
import { createState, stateQL } from "@in/teract/state"

// Create a state with StateQL
const gameState = stateQL(createState({
  initialState: {
    player: {
      health: 100,
      mana: 50,
      position: { x: 0, y: 0, z: 0 },
      inventory: []
    },
    enemies: [],
    gameTime: 0
  }
}));

// Use template literals for updates
gameState.update`
  player.health -= 10,
  player.mana -= 5,
  player.position.x += 5,
  player.position.y += 2
`;

// Interpolate dynamic values
const newItem = { id: "potion", name: "Health Potion", quantity: 1 };
gameState.update`player.inventory.push(${newItem})`;

// Conditional updates
gameState.update`
  if (player.health < 30) {
    player.status = "critical",
    player.effects.push("injured")
  } else if (player.health < 70) {
    player.status = "wounded" 
  } else {
    player.status = "healthy"
  }
`;
```

---

### 🔄 Type-Safe State - Runtime Validation with InSpatial Type

InSpatial State integrates with the InSpatial Type system to provide runtime validation of your application state, ensuring it always matches its expected structure.

```typescript
import { createState, StateTypes } from "@in/teract/state"
import { type } from "@inspatial/type"

// Use a predefined state type
const toggleState = createState({
  id: "feature-flags",
  initialState: { enabled: false },
  type: StateTypes.Toggle
});

// Or create a custom type with complex validation
const ProductType = type({
  id: "string",
  name: "string|minLength(2)|maxLength(100)",
  price: "number|>0",
  stock: "number|>=0|integer", 
  category: "'electronics'|'clothing'|'food'|'books'",
  tags: "string[]"
});

const productState = createState({
  id: "product",
  initialState: {
    id: "prod-001",
    name: "Smartphone",
    price: 599.99,
    stock: 50,
    category: "electronics",
    tags: ["tech", "mobile", "gadget"]
  },
  type: ProductType
});

// Invalid updates will be caught
try {
  productState.update({ price: -100 }); // Invalid: price must be > 0
} catch (error) {
  console.error("Price validation failed:", error);
}

try {
  productState.update({ category: "vehicles" }); // Invalid: not in allowed categories
} catch (error) {
  console.error("Category validation failed:", error);
}

// You can disable validation for specific states
const nonValidatedProduct = createState({
  id: "draft-product",
  initialState: {
    id: "draft-001",
    name: "New Product",
    price: 0 // Would be invalid with validation
  },
  type: ProductType // Type still used for documentation
}, {
  validateType: false // Disable validation
});
```

#### Type-Safe State Functions

| Function            | Description                                        |
| ---- | ----- |
| `createState()`  | Creates state with optional type validation (enabled by default) |
| `validateState()`  | Validates a state object against a type schema |
| `isTypeError()`  | Type guard to check for validation errors |
| `registerStateSchema()`  | Registers a state schema for reuse |
| `getStateJsonSchema()`  | Converts a state type to JSON Schema for documentation |

#### Predefined State Types

| Type                        | Description                                                 |
| ----- | ----- |
| `StateTypes.Counter`  | Type for numeric counter states |
| `StateTypes.Toggle`  | Type for boolean toggle states |
| `StateTypes.List`  | Type for list/collection states |
| `StateTypes.Form`  | Type for form state with validation |
| `StateTypes.User`  | Type for user profile states |
| `StateTypes.Pagination`  | Type for pagination states |
| `StateTypes.Notification`  | Type for notification handling |
| `StateTypes.Theme`  | Type for theme/appearance states |

### 🧩 Trigger Integration - Actions and Events

Connect your state to the InSpatial Trigger system for responsive, event-driven applications.

```typescript
import { createState } from "@in/teract/state"
import { registerTrigger } from "@in/teract/trigger"

// Define triggers for a shopping cart
const addItemTrigger = registerTrigger("cart:addItem", 
  (state, item, quantity = 1) => {
    const existingItem = state.items.find(i => i.id === item.id);
    
    if (existingItem) {
      // Update existing item quantity
      return {
        items: state.items.map(i => 
          i.id === item.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      };
    } else {
      // Add new item
      return {
        items: [...state.items, { ...item, quantity }]
      };
    }
  }
);

const removeItemTrigger = registerTrigger("cart:removeItem", 
  (state, itemId) => ({
    items: state.items.filter(item => item.id !== itemId)
  })
);

const clearCartTrigger = registerTrigger("cart:clear", 
  () => ({ items: [] })
);

// Create state connected to triggers
const cartState = createState({
  id: "shopping-cart",
  initialState: { items: [] },
  triggers: ["cart:addItem", "cart:removeItem", "cart:clear"]
});

// Use the generated actions
cartState.action.addItem({ id: "prod1", name: "Laptop", price: 999.99 });
cartState.action.addItem({ id: "prod2", name: "Mouse", price: 49.99 }, 2);
cartState.action.removeItem("prod2");
cartState.action.clear();
```

### ⚡ StateQL - Template Literal Updates

StateQL provides a more expressive way to update state using JavaScript template literals with natural syntax.

```typescript
import { createState, stateQL } from "@in/teract/state"

// Create a player state with StateQL
const playerState = stateQL(createState({
  initialState: {
    health: 100,
    mana: 80,
    position: { x: 0, y: 0, z: 0 },
    inventory: [],
    effects: [],
    stats: {
      strength: 10,
      agility: 8,
      intelligence: 12
    }
  }
}));

// Simple property updates
playerState.update`health = 80`;

// Arithmetic operations
playerState.update`health -= 10`;

// Multiple property updates
playerState.update`
  health = 100,
  mana = 100,
  status = "healed"
`;

// Interpolated values
const damageAmount = 25;
playerState.update`health -= ${damageAmount}`;

// Array operations
const newEffect = "burning";
playerState.update`effects.push(${newEffect})`;

// Deep path updates
playerState.update`stats.strength += 5`;

// Conditional logic
playerState.update`
  if (health < 30) {
    status = "critical",
    effects.push(${"wounded"})
  } else {
    status = "normal"
  }
`;
```

### 📋 Computed Values and Derived State

Create computed values that automatically update when their dependencies change.

```typescript
import { 
  createState, 
  createComputed,
  createDerivedState,
  createDerivedStateFromMultiple 
} from "@in/teract/state"

// Base shopping cart state
const cartState = createState({
  initialState: {
    items: [
      { id: "item1", name: "T-Shirt", price: 19.99, quantity: 2 },
      { id: "item2", name: "Jeans", price: 39.99, quantity: 1 }
    ],
    taxRate: 0.08,
    discountCode: null
  }
});

// Create computed values
const subtotal = createComputed(() => {
  return cartState.get().items.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0);
});

const totalWithTax = createComputed(() => {
  const baseSubtotal = subtotal();
  return baseSubtotal + (baseSubtotal * cartState.get().taxRate);
});

// Create derived state for UI
const cartUIState = createDerivedState(
  cartState,
  cart => ({
    itemCount: cart.items.reduce((count, item) => count + item.quantity, 0),
    isEmpty: cart.items.length === 0,
    hasDiscount: cart.discountCode !== null
  })
);

// Computed values automatically update
cartState.update(state => ({
  items: [...state.items, { id: "item3", name: "Hat", price: 14.99, quantity: 1 }]
}));

console.log(subtotal()); // Updated automatically
console.log(cartUIState.get()); // { itemCount: 4, isEmpty: false, hasDiscount: false }
```

### 🔒 Persistence and Storage

Store state with flexible persistence options across multiple storage backends.

```typescript
import { createState, setupPersistence, StorageAdapters } from "@in/teract/state"

// Create state with built-in persistence
const userPrefsState = createState({
  id: "userPrefs",
  initialState: {
    theme: "light",
    fontSize: "medium",
    notifications: true
  },
  persist: {
    storage: "localStorage",
    key: "user-preferences",
    autoSave: true,
    // Only save specific fields
    include: ["theme", "fontSize"]
  }
});

// Or setup persistence manually for more control
const gameState = createState({
  id: "gameState",
  initialState: {
    level: 1,
    score: 0,
    playerName: "Player1"
  }
});

const { save, load, clear } = setupPersistence(gameState, {
  storage: "indexedDB",
  key: "game_save_data",
  autoSave: true,
  saveInterval: 5000, // Auto-save every 5 seconds
  exclude: ["playerName"] // Don't persist player name
});

// Manual save/load operations
await save();
await load();
await clear();

// Custom storage adapter
StorageAdapters.register("customStorage", {
  async getItem(key: string) {
    // Custom get logic
    return await customAPI.getData(key);
  },
  async setItem(key: string, value: string) {
    // Custom set logic
    await customAPI.saveData(key, value);
  },
  async removeItem(key: string) {
    await customAPI.deleteData(key);
  }
});
```

### ⚡ Performance Tips

<details>
<summary>Click to learn about performance optimization</summary>

- **Use batched updates** for multiple state changes to minimize re-renders
- **Enable memoization** for computed values that perform expensive calculations  
- **Implement selective persistence** to only save necessary state properties
- **Use derived state** instead of duplicating data across multiple states
- **Leverage signal integration** for optimized reactivity patterns

</details>

### ❌ Common Mistakes

<details>
<summary>Click to see what to avoid</summary>

- **Mistake 1**: Mutating state directly instead of using update methods
- **Mistake 2**: Not cleaning up subscriptions and computed values
- **Mistake 3**: Over-validating in performance-critical paths
- **Mistake 4**: Creating too many small states instead of logical groupings

</details>

## 🤔 FAQ

### "Can I use InSpatial State without the type validation?"

Yes, absolutely! The type system integration is optional. If you don't provide a type in your state configuration, no validation will be performed. You can use InSpatial State as a lightweight state container without any validation overhead.

### "How does the performance compare to other state management libraries?"

InSpatial State is optimized for performance with features like batched updates, memoization, and optimized subscriptions. The type validation has minimal runtime overhead as it's designed to be performant. You can also disable validation in production environments if needed.

### "Can I use this with existing React/Vue/Svelte/Angular/Solid/React-Native/NativeScript/Lynx applications?"

Yes! InSpatial State is designed to work seamlessly across any JavaScript or TypeScript runtime environment, making it fully compatible with any framework or platform including React, Vue, Svelte, Angular, Solid, React Native, and NativeScript.

### "What happens when type validation fails?"

By default, type validation errors are logged to the console in development mode but don't throw errors. This behavior can be configured to be stricter by using validation options with custom error handling.

### "Can I create derived state that depends on multiple state objects?"

Yes, you can use `createDerivedState` or `createDerivedStateFromMultiple` to create state that derives its values from one or more source states. These will update automatically when any of the source states change.

## 🎯 API Reference

### Core Functions

| Function         | Description              |
| ---- | --- |
| `createState()` | Create a new state instance with optional configuration |
| `stateQL()` | Enhance a state with template literal syntax support |
| `createComputed()` | Create a computed value that updates automatically |
| `createDerivedState()`   | Create state derived from another state instance |
| `createDerivedStateFromMultiple()`   | Create state derived from multiple source states |
| `connectTriggerToState()`   | Connect a trigger to a state instance manually |
| `setupPersistence()`   | Configure persistence for a state instance |

### State Management

| Class/Type  | Description           |
| ----- | --- |
| `StateManager` | Singleton manager for tracking state instances |
| `StateTypes` | Predefined common state type schemas |

### StateQL Features

| Feature       | Description             |
| ---- | ----- |
| `Template Literals` | Update state with expressive JavaScript syntax |
| `Conditional Logic` | Use if/else statements in state updates |
| `Array Operations` | Built-in push, pop, splice operations |
| `Arithmetic Operations` | Native +=, -=, *=, /= support |
| `Deep Path Updates` | Update nested object properties naturally |

### Storage & Persistence

| Feature       | Description             |
| ---- | ----- |
| `StorageAdapters` | Built-in adapters for localStorage, sessionStorage, IndexedDB |
| `Custom Adapters` | Create custom storage backends |
| `Selective Persistence` | Include/exclude specific fields from storage |
| `Auto-save` | Automatic persistence on state changes |

### TypeScript Interfaces

This package exports the following TypeScript interfaces and types:

| Interface        | Description                |
| ---- | ----- |
| `StateConfig`  | Configuration for creating state instances  |
| `StateInstance`  | Core state instance interface with all methods  |
| `StateQLInstance`  | State with template literal update support  |
| `PersistOptions`  | Options for state persistence configuration  |
| `StateOptions`  | Additional state creation options  |
| `ComputedOptionsType`  | Options for computed value creation  |
| `DerivedStateOptionsType`  | Options for derived state configuration  |
| `StorageAdapterType`  | Interface for implementing storage adapters  |
| `TriggerCompatibleState`  | State interface for trigger integration  |
| `CategoryState`  | Union type for category-specific state interfaces  |
| `StateManagerClass`  | Interface for the global state manager  |

## 🧪 Testing

### Unit Tests

The State system includes comprehensive unit tests:

```bash
deno task test:state
```

Tests cover all core functionality including state creation, updates, persistence, computed values, and trigger integration.

### Integration Tests

For testing state persistence and storage adapters:

```bash
deno task test:state
```

> Note: Integration tests require specific permissions for file system and storage access.

---

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

---

## 📄 License

InSpatial Dev is released under the Intentional 1.0 License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Ready to shape the future of spatial computing?</strong>
  <br>
  <a href="https://www.inspatiallabs.com">Start Building with InSpatial</a>
</div> 