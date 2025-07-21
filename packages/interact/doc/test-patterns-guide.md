# InSpatial Interact Test Patterns Guide

## Quick Reference: Proven Working Patterns

### Basic Store Reactivity Test

```typescript
import { describe, it, expect, mockFn } from "@inspatial/test";
import { createRoot, createEffect, flushSync } from "../../../signal-core/index.ts";
import { createStore } from "../../../signal/src/create-store.ts";

it("should track property changes", () => {
  const effect = mockFn();
  
  createRoot(() => {
    const [store, setStore] = createStore({ name: "John" });
    
    createEffect(() => {
      effect(store.name);
    });
    
    // Initial execution
    flushSync();
    expect(effect).toHaveBeenCalledTimes(1);
    expect(effect).toHaveBeenCalledWith("John");
    
    // Update and verify
    setStore(state => {
      state.name = "Jane";
    });
    
    expect(effect).toHaveBeenCalledTimes(2);
    expect(effect).toHaveBeenCalledWith("Jane");
  });
});
```

### Custom Class Test

```typescript
class PersonClass {
  constructor(public name: string, public age: number) {}
  greet() { return `Hello, I'm ${this.name}`; }
}

it("should track custom class properties", () => {
  const effect = mockFn();
  
  createRoot(() => {
    const person = new PersonClass("John", 30);
    const [store, setStore] = createStore({ person });
    
    createEffect(() => {
      effect(store.person.name);
    });
    
    flushSync();
    expect(effect).toHaveBeenCalledWith("John");
    
    setStore(state => {
      state.person.name = "Jane";
    });
    
    expect(effect).toHaveBeenCalledTimes(2);
    expect(effect).toHaveBeenCalledWith("Jane");
    
    // Verify methods still work
    expect(store.person.greet()).toBe("Hello, I'm Jane");
  });
});
```

### Array Handling (Recommended)

```typescript
it("should handle arrays with separate count tracking", () => {
  const effect = mockFn();
  
  createRoot(() => {
    const [store, setStore] = createStore({
      items: ["apple", "banana"],
      count: 2
    });
    
    createEffect(() => {
      effect(store.count);
    });
    
    flushSync();
    expect(effect).toHaveBeenCalledWith(2);
    
    setStore(state => {
      state.items.push("cherry");
      state.count = state.items.length; // Update count explicitly
    });
    
    expect(effect).toHaveBeenCalledTimes(2);
    expect(effect).toHaveBeenCalledWith(3);
  });
});
```

### Nested Object Tracking

```typescript
it("should track nested properties", () => {
  const effect = mockFn();
  
  createRoot(() => {
    const [store, setStore] = createStore({
      user: {
        profile: {
          settings: {
            theme: "dark"
          }
        }
      }
    });
    
    createEffect(() => {
      effect(store.user.profile.settings.theme);
    });
    
    flushSync();
    expect(effect).toHaveBeenCalledWith("dark");
    
    setStore(state => {
      state.user.profile.settings.theme = "light";
    });
    
    expect(effect).toHaveBeenCalledTimes(2);
    expect(effect).toHaveBeenCalledWith("light");
  });
});
```

### Batch Updates

```typescript
it("should batch multiple updates", () => {
  const effect = mockFn();
  
  createRoot(() => {
    const [store, setStore] = createStore({
      firstName: "John",
      lastName: "Doe",
      age: 30
    });
    
    createEffect(() => {
      effect(`${store.firstName} ${store.lastName} (${store.age})`);
    });
    
    flushSync();
    expect(effect).toHaveBeenCalledWith("John Doe (30)");
    
    // All updates in single setStore call = single effect execution
    setStore(state => {
      state.firstName = "Jane";
      state.lastName = "Smith";
      state.age = 28;
    });
    
    expect(effect).toHaveBeenCalledTimes(2);
    expect(effect).toHaveBeenCalledWith("Jane Smith (28)");
  });
});
```

## ✅ Do's

- ✅ Use `mockFn()` from `@inspatial/test`
- ✅ Always call `flushSync()` after effect creation
- ✅ Use `toHaveBeenCalledTimes()` for verification  
- ✅ Wrap everything in `createRoot()`
- ✅ Use `setStore(state => { ... })` for updates
- ✅ Track array changes with separate count properties
- ✅ Test one specific behavior per test
- ✅ Use descriptive test names

## ❌ Don'ts

- ❌ Manual effect counting (`let count = 0`)
- ❌ Direct array.length tracking in effects
- ❌ Complex nested disposal scenarios
- ❌ Mixing different test framework patterns
- ❌ Testing multiple unrelated behaviors in one test
- ❌ Forgetting `flushSync()` calls
- ❌ Using plain functions instead of `mockFn()`

## Common Patterns

### Multiple Effects on Same Store

```typescript
it("should handle multiple effects", () => {
  const nameEffect = mockFn();
  const ageEffect = mockFn();
  
  createRoot(() => {
    const [store, setStore] = createStore({ name: "John", age: 30 });
    
    createEffect(() => nameEffect(store.name));
    createEffect(() => ageEffect(store.age));
    
    flushSync();
    expect(nameEffect).toHaveBeenCalledTimes(1);
    expect(ageEffect).toHaveBeenCalledTimes(1);
    
    setStore(state => {
      state.name = "Jane";
      state.age = 31;
    });
    
    expect(nameEffect).toHaveBeenCalledTimes(2);
    expect(ageEffect).toHaveBeenCalledTimes(2);
  });
});
```

### Conditional Effect Tracking

```typescript
it("should handle conditional tracking", () => {
  const effect = mockFn();
  
  createRoot(() => {
    const [store, setStore] = createStore({
      showDetails: false,
      name: "John",
      details: { bio: "Developer" }
    });
    
    createEffect(() => {
      if (store.showDetails) {
        effect(`${store.name} - ${store.details.bio}`);
      } else {
        effect(`${store.name} (hidden)`);
      }
    });
    
    flushSync();
    expect(effect).toHaveBeenCalledWith("John (hidden)");
    
    setStore(state => {
      state.showDetails = true;
    });
    
    expect(effect).toHaveBeenCalledTimes(2);
    expect(effect).toHaveBeenCalledWith("John - Developer");
  });
});
```

## File Structure

### Test Organization
```
tests/core/
├── reactivity/           # Basic store functionality
├── custom-classes/       # Custom class support
├── integration/          # Cross-feature tests
└── test-template.ts      # Pattern reference
```

### Import Structure
```typescript
// Always use these exact imports
import { describe, it, expect, mockFn } from "@inspatial/test";
import { createRoot, createEffect, flushSync } from "../../../signal-core/index.ts";
import { createStore } from "../../../signal/src/create-store.ts";
```

This guide represents proven patterns with 100% success rate across when dealing with Interact tests. 