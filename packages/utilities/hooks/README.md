<div align="center">
  <!-- <img src="https://your-image-url.com/inspatial-logo.png" alt="InSpatial Core Logo" width="200"/> -->

# 🚀 `InSpatial Hooks`

_Reality is your canvas_

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Core](https://img.shields.io/badge/core-inspatial.dev-brightgreen.svg)](https://www.inspatial.dev)
[![App](https://img.shields.io/badge/app-inspatial.app-purple.svg)](https://www.inspatial.app)
[![Cloud](https://img.shields.io/badge/cloud-inspatial.cloud-yellow.svg)](https://www.inspatial.cloud)
[![Store](https://img.shields.io/badge/store-inspatial.store-red.svg)](https://www.inspatial.store)

</div>

---

## 🌟 Welcome to InSpatial Hooks 

A collection of custom hooks designed to assist with state management, side effects, and other common reactive/declarative functions.

## 🌟 Features

- 📦 Custom hooks for state management, side effects, and other common reactive/declarative functions
- 🔗 Seamless integration with Inspatial's ecosystem
- 🚀 Built on top of React's latest features for maximum compatibility and performance
- 🧩 Reusable and customizable for various use cases
- 🛠️ Extendable and maintainable


---

## 🛠️ Usage


<!-- <div align="center">
  <img src="https://your-image-url.com/inspatial-kit.png" alt="InSpatial Kit" width="150"/>
</div> -->


## 💡 Step-by-Step Usage Guide

Follow these simple steps to get started with **InSpatial Hooks** in your React project:

#### Install InSpatial Hooks:


First, install the package via npm, yarn, pnpm, or bun:

```bash
npm install @inspatial/hooks
```
or 

```bash
pnpm install @inspatial/hooks
```

or 

```bash
yarn add @inspatial/hooks
bun add @inspatial/hooks
```


#### 1. **Import the Hook**

Import the desired hook into your component:

```typescript
import { useCustomHook } from '@inspatial/hooks';
```

#### 2. **Initialize the Hook**

Initialize the hook within your functional component:

```typescript
function MyComponent() {
  const { data, isLoading, error } = useCustomHook();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error occurred</div>;

  return (
    <div>
      <h1>Data Loaded</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

#### 3. **Handle Side Effects**

Use the hook to manage side effects effectively:

```typescript
import { useEffect } from 'react';
import { useAnotherHook } from '@inspatial/hooks';

function MyComponent() {
  const { triggerEffect } = useAnotherHook();

  useEffect(() => {
    triggerEffect();
  }, [triggerEffect]);

  return <div>Effect Triggered</div>;
}
```

#### 4. **Leverage State Management**

Integrate with Zustand or XState for state management:

```typescript
import create from 'zustand';
import { useStateHook } from '@inspatial/hooks';

const useStore = create(set => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
}));

function Counter() {
  const { count, increment } = useStore();
  useStateHook(count);

  return (
    <div>
      <span>{count}</span>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

#### 5. **Customize with Configuration**

Customize hooks based on your requirements:

```typescript
import { useConfigurableHook } from '@inspatial/hooks';

function ConfiguredComponent() {
  const config = { optionA: true, optionB: 'value' };
  const { result } = useConfigurableHook(config);

  return <div>{result}</div>;
}
```

#### 6. **Combine Multiple Hooks**

Combine multiple hooks for complex logic:

```typescript
import { useFirstHook, useSecondHook } from '@inspatial/hooks';

function CombinedComponent() {
  const first = useFirstHook();
  const second = useSecondHook();

  return (
    <div>
      <p>First: {first.value}</p>
      <p>Second: {second.value}</p>
    </div>
  );
}
```

## 🎉 You're All Set!

You've successfully integrated **InSpatial Hooks** into your project. Explore more hooks and advanced usage patterns in our [documentation](https://www.inspatial.dev/hooks).




#### Install InSpatial Hooks:

```bash
npm install @inspatial/hooks
```

---

## 🚀 Getting Started

To begin your journey with InSpatial Core, visit our comprehensive documentation at [inspatial.dev](https://www.inspatial.dev).

---

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

## 🚀 Release Channels

Choose the release channel that best fits your needs:

| Channel        | Description                           | Installation                          |
| -------------- | ------------------------------------- | ------------------------------------- |
| 🟢 **Stable**  | Production-ready release              | `npm install @inspatial/core`         |
| 🟡 **Preview** | Usable early access                   | `npm install @inspatial/core@preview` |
| 🔴 **Canary**  | Latest features, potentially unstable | `npm install @inspatial/core@canary`  |


---

## 📄 License

InSpatial Core is released under the Apache 2.0 License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Ready to shape the future of spatial computing?</strong>
  <br>
  <a href="https://www.inspatial.app">Start Building with InSpatial</a>
</div>
