<div align="center">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-light.svg">
        <source media="(prefers-color-scheme: dark)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg">
        <img src="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg" alt="InSpatial" width="300"/>
    </picture>

<br>
   <br>

<p align="center">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/logo-light.svg">
        <source media="(prefers-color-scheme: dark)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/logo-dark.svg">
        <img src="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/logo-dark.svg" height="75" alt="InSpatial">
    </picture>
</p>

_Reality is your canvas_

<h3 align="center">
  InSpatial is a spatial computing platform <br> for building universal and XR (AR/MR/VR) applications
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

| InSpatial                                                                                                                     | Description                          | Link                                           |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------- |
| [![InSpatial Dev](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/dev-badge.svg)](https://www.inspatial.dev)       | API, Infrastructure and SDK          | [inspatial.dev](https://www.inspatial.dev)     |
| [![InSpatial Cloud](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/cloud-badge.svg)](https://www.inspatial.cloud) | Backend APIs and SDKs                | [inspatial.cloud](https://www.inspatial.cloud) |
| [![InSpatial App](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/app-badge.svg)](https://www.inspatial.app)       | Build and manage your InSpatial apps | [inspatial.app](https://www.inspatial.app)     |
| [![InSpatial Store](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/store-badge.svg)](https://www.inspatial.store) | Deploy and discover InSpatial apps   | [inspatial.store](https://www.inspatial.store) |

</div>

---

## 🧪 InSpatial Test

A universal testing framework that works seamlessly across Deno, Node.js, and Bun runtimes. Write tests once, run them anywhere - from mobile to desktop, and 3D/spatial environments!

## 🌟 Features

- 🎯 Cross-platform support (Deno, Node.js, Bun)
- 📝 Multiple test syntax styles (Function and Object)
- ⚡ Async/await support out of the box
- 🎨 Beautiful test output with syntax highlighting
- 🔄 Runtime auto-detection
- 🚫 Skip and Todo test support
- 🧹 Automatic resource cleanup
- 🔒 Type-safe with full TypeScript support

## 🔮 Coming Soon

- 🎮 XR (AR/VR/MR) Testing Support
- 🌐 3D Environment Testing
- 🎨 Visual Regression Testing for 3D
- 📊 Spatial Computing Metrics
- 🤖 AI-Powered Test Generation

## 🛠️ Usage

### Step-by-Step Usage Guide

Follow these simple steps to get started with **InSpatial Test**:

#### 1. **Basic Test**

```typescript
import { expect, test } from "@inspatial/test"
// Function style
test("my first test", () => {
  expect(true).toBe(true)
})
// Object style
test({
  name: "my first object-style test",
  fn: () => {
    expect(true).toBe(true)
  },
})
```

#### 2. **Async Tests**

```typescript
import { expect, test } from "@inspatial/test"
test("async operations", async () => {
  const result = await someAsyncOperation()
  expect(result).toBe("expected value")
})
```

#### 3. **Skip and Todo Tests**

```typescript
import { test } from "@inspatial/test"

// Skip a test
test.skip("this test will be skipped", () => {
  // This code won't run
})

// Mark a test as todo
test.todo("implement this test later")
```

#### 4. **Test Options**

```typescript
import { test } from "@inspatial/test"

test("test with options", () => {
  // Test code
}, {
  permissions: { read: true },
  sanitizeResources: true,
  env: { TEST_ENV: "true" },
})
```

#### 5. **Assertions**

```typescript
import { expect, test } from "@inspatial/test"

test("various assertions", () => {
  // Basic assertions
  expect(42).toBe(42)
  expect([1, 2, 3]).toContain(2)

  // Type checking
  expect("string").toBeType("string")

  // Async assertions
  await expect(Promise.resolve(42)).resolves.toBe(42)

  // Error handling
  expect(() => {
    throw new Error("boom!")
  }).toThrow()
})
```

## 📚 API Reference

### Test Functions

- `test(name, fn, options?)`: Basic test function
- `test.only(name, fn, options?)`: Run only this test
- `test.skip(name, fn, options?)`: Skip this test
- `test.todo(name, fn?, options?)`: Mark test as todo

### Assertion Methods

- `expect(value)`: Create an assertion
- `toBe(expected)`: Strict equality
- `toEqual(expected)`: Deep equality
- `toBeType(type)`: Type checking
- `toThrow(error?)`: Error assertions
- And many more...

### Test Options

- `permissions`: Runtime permissions
- `sanitizeResources`: Clean up resources
- `sanitizeOps`: Clean up operations
- `env`: Environment variables

## 🎯 Best Practices

1. Write descriptive test names
2. Use async/await for asynchronous tests
3. Clean up resources after tests
4. Group related tests together
5. Use appropriate assertions

## 📄 License

InSpatial Test is released under the Apache 2.0 License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Ready to write universal tests that work everywhere?</strong>
  <br>
  <a href="https://www.inspatial.app">Start Testing with InSpatial</a>
</div>
