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
