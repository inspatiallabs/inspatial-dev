
# Signal-Lite
#### A lightweight reactive state management library

Signal-Lite is a streamlined reactivity system that helps you manage changing data in your application. Think of it like a notification system where values can announce when they change, and other parts of your code can listen and react accordingly.

## Overview

Signal-Lite provides the essential building blocks for reactive programming:

- **Signals**: Containers for values that notify listeners when they change
- **Computed Values**: Values derived from signals that update automatically
- **Effects**: Functions that run when their dependencies change

This is a simplified alternative to the full @inspatial/interact system (State X Triggers), designed for situations where you need just the core reactivity primitives with minimal overhead.

## Comparison with Signal/State Core

Signal-Lite is a lightweight subset of the full Signal Core system from @inspatial/interact. Here's how they differ:

| Feature | Signal-Lite | Signal/State Core |
|---------|-------------|-------------|
| **Size** | Minimal (small bundle) | Full-featured (larger) |
| **API** | Simpler, focused | Comprehensive |
| **Performance** | Good for basic needs | Optimized for complex scenarios |
| **Callbacks** | useEffectLite & onDisposeLite * onConditionLite triggers | Full integrated trigger system |
| **State Management** | Local | Local X Global X Server (Universal) |
| **Developer Tools** | Minimal | Advanced debugging tools |
| **StateQL** | Not supported | Full support |
| **Batched Updates** | Basic | Advanced optimization |

**When to choose Signal-Lite**: For simple state management needs, learning projects, or when you need minimal bundle size.

**When to choose Signal/State Core**: For most InSpatial applications, production apps, or when you need advanced features like triggers, optimized updates, or deep integration.

## Core API

### createSignalLite(initialValue)
Creates a new signal with the provided initial value.

```typescript
import { createSignalLite } from "@inspatial/interact/signal-lite";

// Simple primitive value
const count = createSignalLite(0);

// Object value
const user = createSignalLite({ name: "Alice", age: 30 });

// Access the current value
console.log(count.value); // 0

// Update the value
count.value = 1;
```

### computedLite(fn)
Creates a computed signal whose value is derived from other signals.

```typescript
import { createSignalLite, computedLite } from "@inspatial/interact/signal-lite";

const width = createSignalLite(5);
const height = createSignalLite(10);

// This automatically updates when width or height changes
const area = computedLite(() => width.value * height.value);

console.log(area.value); // 50

width.value = 10;
console.log(area.value); // 100
```

### watchLite(fn)
Creates an effect that runs when its dependencies change.

```typescript
import { createSignalLite, watchLite } from "@inspatial/interact/signal-lite";

const count = createSignalLite(0);

// This function runs initially and whenever count changes
const dispose = watchLite(() => {
  console.log(`Count changed to: ${count.value}`);
});

count.value = 1; // Logs: "Count changed to: 1"
count.value = 2; // Logs: "Count changed to: 2"

// Stop watching
dispose();

count.value = 3; // Nothing happens, the effect is disposed
```

### peekLite(signal)
Gets the current value of a signal without creating a dependency relationship.

```typescript
import { createSignalLite, peekLite, watchLite } from "@inspatial/interact/signal-lite";

const count = createSignalLite(0);

watchLite(() => {
  // Using peek means this effect won't re-run when count changes
  const value = peekLite(count);
  console.log(`Peeked value: ${value}`);
});

count.value = 5; // The effect won't run again
```

### writeLite(signal, valueOrUpdater)
Updates a signal's value, supporting both direct values and updater functions.

```typescript
import { createSignalLite, writeLite } from "@inspatial/interact/signal-lite";

const count = createSignalLite(0);

// Set to a specific value
writeLite(count, 5);
console.log(count.value); // 5

// Use an updater function
writeLite(count, prev => prev + 1);
console.log(count.value); // 6
```

### mergeLite(sources, fn)
Combines multiple signal sources into a single derived signal.

```typescript
import { createSignalLite, mergeLite } from "@inspatial/interact/signal-lite";

const firstName = createSignalLite("John");
const lastName = createSignalLite("Doe");

const fullName = mergeLite([firstName, lastName], 
  (first, last) => `${first} ${last}`);

console.log(fullName.value); // "John Doe"

firstName.value = "Jane";
console.log(fullName.value); // "Jane Doe"
```

### deriveLite(objectSignal, property, [transform])
Creates a signal that tracks a specific property of an object signal.

```typescript
import { createSignalLite, deriveLite } from "@inspatial/interact/signal-lite";

const user = createSignalLite({ name: "Alice", age: 30 });

// Create a signal for just the name
const name = deriveLite(user, "name");
console.log(name.value); // "Alice"

// With optional transform function
const nameUpper = deriveLite(user, "name", n => n.toUpperCase());
console.log(nameUpper.value); // "ALICE"

// Update the object
user.value = { ...user.value, name: "Bob" };
console.log(name.value); // "Bob"
console.log(nameUpper.value); // "BOB"
```

### extractLite(objectSignal, ...properties)
Extracts multiple properties from an object signal as individual signals.

```typescript
import { createSignalLite, extractLite } from "@inspatial/interact/signal-lite";

const user = createSignalLite({
  name: "Alice",
  age: 30,
  email: "alice@example.com"
});

// Extract specific properties
const { name, age } = extractLite(user, "name", "age");

console.log(name.value); // "Alice"
console.log(age.value); // 30

// If no properties are specified, all are extracted
const allProps = extractLite(user);
console.log(allProps.email.value); // "alice@example.com"
```

### untrackLite(fn)
Executes a function without tracking dependencies in the current context.

```typescript
import { createSignalLite, watchLite, untrackLite } from "@inspatial/interact/signal-lite";

const count = createSignalLite(0);
const unrelated = createSignalLite(100);

watchLite(() => {
  // This creates a dependency on count
  console.log(`Count: ${count.value}`);
  
  // This reads unrelated without creating a dependency
  untrackLite(() => {
    console.log(`Unrelated (not tracked): ${unrelated.value}`);
  });
});

// Only triggers the effect because count has a dependency
count.value = 1;

// Doesn't trigger the effect
unrelated.value = 200;
```

### onDisposeLite(cleanupFn)
Registers a cleanup function to run when the current effect is disposed or re-run.

```typescript
import { createSignalLite, watchLite, onDisposeLite } from "@inspatial/interact/signal-lite";

const count = createSignalLite(0);

const dispose = watchLite(() => {
  console.log(`Effect running with count: ${count.value}`);
  
  // This interval will be cleared when the effect is disposed
  // or when count changes and the effect runs again
  const intervalId = setInterval(() => {
    console.log("Interval tick");
  }, 1000);
  
  onDisposeLite(() => {
    console.log("Cleaning up interval");
    clearInterval(intervalId);
  });
});

// Later: clean up the effect
dispose();
```

## Additional Utility Functions

Signal-Lite provides several other utility functions for advanced usage:

- **isSignalLite(value)**: Checks if a value is a signal
- **connectLite(signals, effect)**: Connects an effect to multiple signals
- **bindLite(handler, signal)**: Binds a handler function to a signal
- **makeReactiveLite(object)**: Makes an object's properties reactive
- **listenLite(signals, callback)**: Listens to changes on multiple signals
- **scheduleLite(effect)**: Schedules an effect to run in the next tick
- **tickLite()**: Triggers the next tick of the reactive system
- **nextTickLite(callback)**: Runs a callback in the next tick
- **readLite(signal)**: Reads a signal value (with tracking)
- **readAllLite(signals, handler)**: Reads multiple signals and processes their values
- **tplLite(strings, ...exprs)**: Creates a template string signal

## Signal Methods

Signal objects created with `createSignalLite` include these methods:

```typescript
const count = createSignalLite(5);

// Comparison operators (return computed signals)
const isPositive = count.gt(0);
const isNegative = count.lt(0);
const equalsZero = count.eq(0);
const notZero = count.neq(0);

// Logical operators
const a = createSignalLite(true);
const b = createSignalLite(false);
const bothTrue = a.and(b);
const eitherTrue = a.or(b);

// Method chaining
const result = count.gt(0).and(count.lt(10));
```

## Example: Simple Counter

```typescript
import { createSignalLite, computedLite, watchLite } from "@inspatial/interact/signal-lite";

// Create the base state
const count = createSignalLite(0);
const doubled = computedLite(() => count.value * 2);
const isPositive = computedLite(() => count.value > 0);

// Create effects
watchLite(() => {
  console.log(`
    Count: ${count.value}
    Doubled: ${doubled.value}
    Is Positive: ${isPositive.value ? "Yes" : "No"}
  `);
});

// Update the state
count.value = 5;
// The effect automatically runs with the new values
```

## Example: Shopping Cart

```typescript
import { createSignalLite, computedLite } from "@inspatial/interact/signal-lite";

function createCart() {
  const items = createSignalLite([]);
  
  const total = computedLite(() => {
    return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
  });
  
  const itemCount = computedLite(() => {
    return items.value.reduce((count, item) => count + item.quantity, 0);
  });
  
  function addItem(product, quantity = 1) {
    const currentItems = [...items.value];
    const existingItem = currentItems.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      currentItems.push({ ...product, quantity });
    }
    
    items.value = currentItems;
  }
  
  function removeItem(productId) {
    items.value = items.value.filter(item => item.id !== productId);
  }
  
  return {
    items,
    total,
    itemCount,
    addItem,
    removeItem,
  };
}

// Usage
const cart = createCart();
cart.addItem({ id: 1, name: "Product 1", price: 10 });
console.log(`Total: $${cart.total.value}, Items: ${cart.itemCount.value}`);
```

## Advanced Patterns

### Handling Circular Dependencies

Signal-Lite includes helpers for handling potentially circular dependency patterns:

```typescript
import { createSignalLite, watchLite, untrackLite } from "@inspatial/interact/signal-lite";

const a = createSignalLite(0);
const b = createSignalLite(0);

// Update b when a changes (without creating a circular dependency)
watchLite(() => {
  const aValue = a.value;
  untrackLite(() => {
    b.value = aValue * 2;
  });
});

// Update a when b changes (without creating a circular dependency)
watchLite(() => {
  const bValue = b.value;
  untrackLite(() => {
    a.value = Math.floor(bValue / 2);
  });
});

a.value = 5; // b becomes 10
```

### Conditional Reactions with onConditionLite

```typescript
import { createSignalLite, onConditionLite } from "@inspatial/interact/signal-lite";

const status = createSignalLite("pending");

// Create a matcher function
const statusIs = onConditionLite(status);

// Create conditional signals
const isPending = statusIs("pending");
const isComplete = statusIs("complete");
const isError = statusIs("error");

console.log(isPending.value); // true
console.log(isComplete.value); // false

status.value = "complete";
console.log(isPending.value); // false 
console.log(isComplete.value); // true
```

## Limitations

Signal-Lite is designed to be simple and lightweight, which comes with some limitations compared to the full Interaction system:

- No built-in trigger system for cross-component communication 
- Limited optimization for deep object hierarchies
- No specialized debugging tooling
- Manual integration with other systems (not automatic)
- No batching of updates for performance optimization
- No StateQL support for complex state queries

These limitations are intentional to keep Signal-Lite focused and lightweight.

## TypeScript Support

Signal-Lite is fully typed and provides generic typing for all its functions:

```typescript
import { createSignalLite, SignalLite } from "@inspatial/interact/signal-lite";

// Specify the signal type explicitly
const count: SignalLite<number> = createSignalLite(0);

// Type is inferred automatically
const name = createSignalLite("Alice"); // SignalLite<string>

// Complex types
interface User {
  name: string;
  age: number;
}

const user = createSignalLite<User>({ name: "Bob", age: 30 });
```
