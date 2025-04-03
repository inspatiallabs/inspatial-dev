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

| InSpatial                                                                                                                     | Description                          | Link                                           |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------- |
| [![InSpatial Dev](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/dev-badge.svg)](https://www.inspatial.dev)       | Universal Libraries & Frameworks     | [inspatial.dev](https://www.inspatial.dev)     |
| [![InSpatial Cloud](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/cloud-badge.svg)](https://www.inspatial.cloud) | Backend APIs and SDKs                | [inspatial.cloud](https://www.inspatial.cloud) |
| [![InSpatial App](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/app-badge.svg)](https://www.inspatial.app)       | Build and manage your InSpatial apps | [inspatial.app](https://www.inspatial.app)     |
| [![InSpatial Store](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/store-badge.svg)](https://www.inspatial.store) | Deploy and discover InSpatial apps   | [inspatial.store](https://www.inspatial.store) |

</div>

---

## 🧪 InSpatial Test (🟡 Preview)

A universal testing module that works seamlessly across Deno, Node.js, and Bun runtimes. Write tests once, run them anywhere - from mobile to desktop, and 3D/spatial environments!

## 🌟 Features

- 🌍 Cross-platform support (Deno, Node.js, Bun)
- 📝 Multiple test syntax styles (Function and Object)
- 🎯 Support for both `assert` and `expect` style assertions
- 🧩 Behavior Driven Development Support with (descibe & it)
- ⚡ Async/await support out of the box
- 🎨 Beautiful test output with syntax highlighting
- 🔄 Runtime auto-detection
- 🚫 Test Modifiers: Skip and Todo test support
- 🧹 Automatic resource cleanup
- 🔒 Type-safe with full TypeScript support
- 🧪 Test Doubles (Mocks, Stubs, Spies, etc.)
- 📸 Snapshot Testing for detecting unintended changes


## 🔮 Coming Soon

- 🎮 XR (AR/VR/MR) Testing Support
- 🌐 3D Environment Testing
- 🎨 Visual Regression Testing for 3D
- 📊 Spatial Computing Metrics
- 🤖 AI-Powered CI/CD Test Agent
- 📝 Logging and Reporting
- 📈 Benchmarking
- 🏷️ Type Assertions (Assert & Expect)
- ⏰ Time Simulation Testing

## ✨ Advanced Features ✨

<table>
  <tr>
    <td>
      <h4>🔄 Multiple Test Styles</h4>
      <p>Write tests using function or object style syntax based on your preference</p>
      <pre><code>// Function style
test("sum function works", () => {
  expect(sum(2, 2)).toBe(4);
});

// Object style
test({
name: "sum function works",
fn: () => {
expect(sum(2, 2)).toBe(4);
}
});</code></pre>
</td>
<td>
<h4>🧩 Cross-Runtime Support</h4>
<p>Test once, run everywhere with automatic runtime detection</p>
<pre><code>// Works in Deno, Node.js, and Bun
import { test, expect } from "@inspatial/test";

test("universal test", () => {
// This test will run in any environment
expect(1 + 1).toBe(2);
});</code></pre>
</td>

  </tr>
  <tr>
    <td>
      <h4>⚡ Async Testing</h4>
      <p>Test asynchronous code with built-in async/await support</p>
      <pre><code>test("async operations", async () => {
  const result = await fetchData();
  expect(result).toBeDefined();
  expect(result.status).toBe("success");
});</code></pre>
    </td>
    <td>
      <h4>📋 Dual Assertion Styles</h4>
      <p>Choose between expect() and assert style assertions</p>
      <pre><code>// expect style
expect(value).toBe(expected);
expect(array).toContain(item);

// assert style
assertEquals(value, expected);
assertArrayIncludes(array, [item]);</code></pre>
</td>

  </tr>
  <tr>
    <td colspan="2" align="center">
      <h4>📚 Rich Matchers Library</h4>
      <p>Extensive collection of assertion matchers for every testing need</p>
      <pre><code>// Type checking
expect(value).toBeType("string");

// Object properties
expect(object).toHaveProperty("key");

// Complex assertions
expect(user).toMatchObject({
name: "John",
isActive: true
});

// Advanced matchers
expect(email).toBeEmail();
expect(response).toRespondWithStatus(200);</code></pre>
</td>

  </tr>
</table>

<div align="center">
  <h4>🚀 Keep reading to learn how to use all these amazing features! 🚀</h4>
</div>

## 📦 Install InSpatial Test:

Choose your preferred package manager:

```bash
deno install jsr:@inspatial/test
```

##

```bash
npx jsr add @inspatial/test
```

##

```bash
yarn dlx jsr add @inspatial/test
```

##

```bash
pnpm dlx jsr add @inspatial/test
```

##

```bash
bunx jsr add @inspatial/test
```

## 🛠️ Step-by-Step Usage Guide

Here are the essential usage patterns for working with InSpatial Test:

### 1. **File Naming Convention**

Create test files using either of these naming patterns:

- `file.test.ts` (founders-choice)
- `file_test.ts`

```typescript
// user.test.ts or user_test.ts
import { expect, test } from "@inspatial/test";

test("user creation", () => {
  // Test code here
});
```

### 2. **Basic Test Structure**

```typescript
import { expect, test } from "@inspatial/test";

// Function style
test("my first test", () => {
  expect(true).toBe(true);
});

// Object style (recommended for complex tests)
test({
  name: "my first object-style test",
  fn: () => {
    expect(true).toBe(true);
  },
  options: {
    // Optional configuration
    permissions: { read: true },
    sanitizeResources: true,
  },
});
```

### 3. **Assertion Styles**

```typescript
import { assert, assertEquals, expect, test } from "@inspatial/test";

test("using both assertion styles", () => {
  // Using expect style (chainable API)
  expect(42).toBe(42);
  expect("hello").toContain("ll");
  expect(true).toBeTruthy();

  // Using assert style (direct assertions)
  assert(true);
  assertEquals(42, 42);
});
```

### 4. **Advanced Features Overview**

InSpatial Test includes several advanced capabilities:

- **Test modifiers**: Use `.skip`, `.only`, and `.todo` to control test execution
- **Async testing**: Native support for async/await in tests
- **Resource cleanup**: Automatic sanitization of resources and operations
- **Rich matcher library**: Extensive collection of assertion matchers
- **Custom test options**: Configure permissions, environment variables, and more

### 5. **Mocking and Test Doubles**

InSpatial Test provides powerful mocking capabilities to simulate behavior and verify interactions:

#### Function Spies

Use `spy()` to watch function calls without changing behavior:

```typescript
import {
  test,
  spy,
  assertSpyCalls,
  assertSpyCall,
  assertEquals,
} from "@inspatial/test";

test("spy example - verify function calls", () => {
  // Create a calculator object with a multiply function
  const calculator = {
    multiply(a: number, b: number): number {
      return a * b;
    },
  };

  // Create a spy for the multiply function
  using multiplySpyProp = spy(calculator, "multiply");

  // Call the function
  const result = calculator.multiply(3, 4);

  // Verify the result
  assertEquals(result, 12);

  // Verify the function was called exactly once
  assertSpyCalls(multiplySpyProp, 1);

  // Verify it was called with specific arguments and returned the expected value
  assertSpyCall(multiplySpyProp, 0, {
    args: [3, 4], // Check arguments
    returned: 12, // Check return value
  });
});
```

#### Function Stubs

Use `stub()` to replace function implementation with controlled behavior:

```typescript
import {
  test,
  stub,
  assertSpyCalls,
  assertSpyCall,
  assertEquals,
  returnsNext,
} from "@inspatial/test";

test("stub example - replace unpredictable functions", () => {
  // Object with a method that returns random data
  const api = {
    fetchRandomData(): number {
      return Math.random(); // Unpredictable in tests
    },
  };

  // Create a stub that returns predetermined values
  using fetchStubProp = stub(api, "fetchRandomData", returnsNext([10, 20, 30]));

  // First call returns first value
  assertEquals(api.fetchRandomData(), 10);

  // Second call returns second value
  assertEquals(api.fetchRandomData(), 20);

  // Verify call count
  assertSpyCalls(fetchStubProp, 2);
});
```

#### Mocking Time

Use `FakeTime` to control time-dependent code:

```typescript
import { test, FakeTime, spy, assertSpyCalls } from "@inspatial/test";

test("FakeTime example - testing time-based functions", () => {
  // Create a FakeTime instance to control time
  using time = new FakeTime();

  // Create a spy function to track calls
  const callback = spy();

  // Set up a delayed function
  setTimeout(callback, 1000);

  // Initially, the callback hasn't been called
  assertSpyCalls(callback, 0);

  // Advance time by 500ms - still not enough time
  time.tick(500);
  assertSpyCalls(callback, 0);

  // Advance time by another 500ms - now callback should be called
  time.tick(500);
  assertSpyCalls(callback, 1);

  // Testing setInterval
  const intervalId = setInterval(callback, 1000);

  // Advance time by 3 seconds - should trigger callback 3 more times
  time.tick(3000);
  assertSpyCalls(callback, 4);

  // Clean up
  clearInterval(intervalId);
});
```

#### Using Expect Syntax with Mocks

```typescript
import { test, spy, stub, expect, returnsNext } from "@inspatial/test";

test("mock with expect syntax", () => {
  // Creating a spy
  const myFunction = spy();
  myFunction();
  expect(myFunction).toHaveBeenCalledTimes(1);

  // Creating a stub
  const api = { getData: () => Math.random() };
  using dataStub = stub(api, "getData", returnsNext([1, 2, 3]));

  expect(api.getData()).toBe(1);
  expect(dataStub).toHaveBeenCalledTimes(1);
});
```

Note: The `using` keyword ensures proper resource cleanup after the test completes.

## 🏃 Running Tests

### Basic Usage

```bash
# Node.js
node --test

# Node.js with TypeScript
npx tsx --test  # Requires "type": "module" in package.json

# Deno
deno test

# Bun
bun test
```

### Advanced Options

```bash
# Test specific file
deno test my_test.ts
node --test my_test.ts
bun test my_test.ts

# Test specific folder
deno test tests/
node --test tests/
bun test tests/

# Run tests in parallel (faster)
deno test --parallel
node --test --parallel
bun test --preload ./setup.ts

# Include extra settings
deno test --allow-read my_test.ts  # Give permission to read files
node --test --experimental-test-coverage  # Get coverage report
bun test --coverage  # Get coverage report
```

### Watch Mode (Auto-rerun on changes)

```bash
deno test --watch
node --test --watch
bun test --watch
```

---

## 🔄 Test Modifiers - Control Test Execution

Test modifiers help you control which tests run and which are skipped:

```typescript
import { test } from "@inspatial/test";

// Run only this test (and others marked with .only)
test.only("critical functionality", () => {
  // Test code
});

// Skip this test during execution
test.skip("unfinished test", () => {
  // This code won't run
});

// Mark as something to implement later
test.todo("implement user authentication tests");
```

## 🧩 Async Testing - Test Asynchronous Code

InSpatial Test has built-in support for testing asynchronous code:

```typescript
import { expect, test } from "@inspatial/test";

// Test async functions
test("async data fetching", async () => {
  const data = await fetchUserData(123);
  expect(data.id).toBe(123);
  expect(data.name).toBeDefined();
});

// Test promises directly
test("promise resolution", () => {
  return Promise.resolve(42).then((value) => {
    expect(value).toBe(42);
  });
});

// Test for promise rejection
test("promise rejection", async () => {
  await expect(Promise.reject("error")).rejects.toBe("error");
});
```

## 📸 Snapshot Testing - Taking "Photos" of Your Code's Output

Think of snapshot testing like taking a photo of your room. The first time you take the photo, that's your "reference picture" (snapshot). Later, when you want to check if anything has changed in your room, you take a new photo and compare it with the original one. If something is different (like moved furniture), you'll spot it right away!

In code terms:

1. First run: The test takes a "photo" (snapshot) of your code's output
2. Later runs: It takes a new "photo" and compares it with the original
3. If they match → Test passes ✅
4. If they differ → Test fails ❌ (something changed!)

#### Basic Example

Here's a simple snapshot test for a user profile:

```typescript
import { test, assertSnapshot } from "@inspatial/test";

test("user profile snapshot", async (t) => {
  const user = {
    name: "Ben",
    age: 24,
    email: "ben@inspatiallabs.com",
  };

  // Take a "photo" of the user data
  await assertSnapshot(t, user);
});
```

#### Advanced Example

Here's how to create a custom snapshot test for terminal output that ignores color codes:

```typescript
import { test, createAssertSnapshot, stripAnsiCode } from "@inspatial/test";

// Create a custom snapshot function that removes color codes
const assertColorlessSnapshot = createAssertSnapshot<string>({
  serializer: (value) => stripAnsiCode(value), // Remove color codes before comparison
  name: "Terminal Output", // Custom name in snapshot file
});

test("command output snapshot", async (t) => {
  const terminalOutput = "\x1b[32mSuccess!\x1b[0m"; // Green "Success!"

  // Compare without color codes
  await assertColorlessSnapshot(t, terminalOutput);
});
```

#### Running Snapshot Tests

There are two ways to run snapshot tests:

1. **Check Mode** (like comparing with the original photo):

```bash
# Using deno task
deno task test:snapshot

# Direct command
deno test --allow-read --allow-write
```

2. **Update Mode** (like taking a new reference photo):

```bash
# Using deno task
deno task test:snapshot:update

# Direct command
deno test --allow-read --allow-write -- --update  # or -u for short
```

> **Tip**: Use `createAssertSnapshot` when you need to:
> - Filter out changing data (like timestamps)
> - Transform data before comparison
> - Customize snapshot storage location
> - Reuse snapshot logic across multiple tests

--
> **Note**: New snapshots will only be created when running in update mode. Use update mode when:
> - Adding new snapshot assertions to your tests
> - Making intentional changes that cause snapshots to fail
> - Reviewing and accepting changes in snapshot output

For convenience, we provide simple commands:

```bash
# Windows
./run-tests.ps1         # Check against snapshots
./run-tests.ps1 -Update # Update snapshots

# Linux/macOS
./run-tests.sh          # Check against snapshots
./run-tests.sh --update # Update snapshots
```

## ⚡ Resource Cleanup - Automatic Resource Management

InSpatial Test can automatically verify that your tests properly clean up resources:

```typescript
import { test } from "@inspatial/test";

test(
  "file operations",
  () => {
    // Test code that opens and closes files
  },
  {
    // Verify all resources are properly closed
    sanitizeResources: true,
    // Verify all async operations complete
    sanitizeOps: true,
  }
);
```

## ⚙️ CI Configuration

### Bun

```yaml
name: Bun CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: antongolub/action-setup-bun@v1.12.8
        with:
          bun-version: v1.x
      - run: bun x jsr add @inspatial/test
      - run: bun test
```

### Deno

```yaml
name: Deno CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x
      - run: deno add @inspatial/test
      - run: deno test
```

### Node.js

```yaml
name: Node.js CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 21.x]
    steps:
      - uses: actions/checkout@v3
      - run: npx jsr add @inspatial/test
      - run: |
          echo '{"type":"module"}' > package.json
          npx --yes tsx --test *.test.ts
```

---

## 🎯 API Reference

### Core Functions

| Function      | Description                              |
| ------------- | ---------------------------------------- |
| `test()`      | Define a test                            |
| `test.skip()` | Define a test that will be skipped       |
| `test.only()` | Define a test that will run exclusively  |
| `test.todo()` | Define a placeholder for a future test   |
| `expect()`    | Create an assertion with chainable API   |
| `assert`      | Collection of direct assertion functions |

### Mock Functions

| Function           | Description                                     |
| ------------------ | ----------------------------------------------- |
| `spy()`            | Create a spy to watch function calls            |
| `stub()`           | Replace function implementation for testing     |
| `assertSpyCalls()` | Verify a function was called specific times     |
| `assertSpyCall()`  | Verify a function was called with specific args |
| `returnsNext()`    | Create stub that returns values in sequence     |
| `FakeTime`         | Control time for testing time-dependent code    |

### Snapshot Functions

| Function                 | Description                                 |
| ------------------------ | ------------------------------------------- |
| `assertSnapshot()`       | Compare a value against a stored snapshot   |
| `createAssertSnapshot()` | Create a custom snapshot assertion function |
| `serialize()`            | Default serializer for snapshot values      |

### Test Options

| Option              | Description                                      |
| ------------------- | ------------------------------------------------ |
| `permissions`       | Control what system features the test can access |
| `sanitizeResources` | Check if test properly closes resources          |
| `sanitizeOps`       | Check if test completes all async operations     |
| `sanitizeExit`      | Check if test tries to exit unexpectedly         |
| `env`               | Custom environment variables for the test        |

### Expect Matchers

| Matcher                 | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `toBe()`                | Assert strict equality                         |
| `toEqual()`             | Assert deep equality                           |
| `toBeTruthy()`          | Assert value is truthy                         |
| `toBeFalsy()`           | Assert value is falsy                          |
| `toBeGreaterThan()`     | Assert value is greater than expected          |
| `toBeLessThan()`        | Assert value is less than expected             |
| `toBeNull()`            | Assert value is null                           |
| `toBeUndefined()`       | Assert value is undefined                      |
| `toContain()`           | Assert array/string contains an item/substring |
| `toHaveProperty()`      | Assert object has a property                   |
| `toThrow()`             | Assert function throws an error                |
| `toBeType()`            | Assert value is of a specific type             |
| `toMatchObject()`       | Assert object matches a partial shape          |
| `toMatch()`             | Assert string matches a regex pattern          |
| `toBeOneOf()`           | Assert value is one of the expected values     |
| `toBeEmpty()`           | Assert iterable/object/string is empty         |
| `toBeSorted()`          | Assert iterable is sorted                      |
| `toBeFinite()`          | Assert number is finite                        |
| `toBeEmail()`           | Assert string is a valid email                 |
| `toBeUrl()`             | Assert string is a valid URL                   |
| `toBeDate()`            | Assert value is a valid Date                   |
| `toRespondWithStatus()` | Assert Response has a specific status code     |

### Assert Functions

| Function                  | Description                              |
| ------------------------- | ---------------------------------------- |
| `assert()`                | Assert a condition is true               |
| `assertEquals()`          | Assert values are equal                  |
| `assertNotEquals()`       | Assert values are not equal              |
| `assertStrictEquals()`    | Assert values are strictly equal         |
| `assertNotStrictEquals()` | Assert values are not strictly equal     |
| `assertArrayIncludes()`   | Assert array includes all expected items |
| `assertStringIncludes()`  | Assert string includes a substring       |
| `assertMatch()`           | Assert string matches a regex pattern    |
| `assertThrows()`          | Assert function throws an error          |
| `assertObjectMatch()`     | Assert object matches a partial shape    |
| `assertIsError()`         | Assert value is an Error object          |

### TypeScript Interfaces

This package exports the following TypeScript interfaces and types:

| Interface          | Description                                |
| ------------------ | ------------------------------------------ |
| `TestProps`        | Properties for defining object-style tests |
| `OptionProp`       | Test configuration options                 |
| `Runner`           | Test runner interface                      |
| `ExtendedExpected` | Enhanced expect assertion interface        |
| `Promisable`       | Type for values that might be Promises     |
| `AssertionError`   | Error thrown when assertions fail          |

---

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

---

## 📄 License

InSpatial Test is released under the Apache 2.0 License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Ready to write universal tests that work everywhere?</strong>
  <br>
  <a href="https://www.inspatiallabs.com">Start Testing with InSpatial</a>
</div>
