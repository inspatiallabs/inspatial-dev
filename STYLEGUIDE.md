<div align="center">
    <a href="https://inspatiallabs.com" target="_blank">
    <p align="center">
    <picture>
      <source media="(prefers-color-scheme: light)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg">
      <source media="(prefers-color-scheme: dark)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-light.svg">
      <img src="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg" alt="InSpatial" width="300">
    </picture>
    </p>
    </a>

   <br>

  <h1 align="center">InSpatial Style Guide</h1>

  <h3 align="center">
    A comprehensive guide for maintaining clean, consistent, and maintainable code across the InSpatial ecosystem
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

---

## 📋 Table of Contents

- [💫 Core Principles](#-core-principles)
- [📚 Code Standards](#-code-standards)

  - [📦 ESM Modules Only](#esm-modules-only)
  - [🔒 Prefer Deno APIs](#prefer-deno-apis)
  - [📝 Simple File Names](#simple-file-names)
  - [⚡ No "Slow Types"](#no-slow-types)
  - [🚫 No Native Binaries](#no-native-binaries)
  - [🎨 Shader Standards](#shader-standards)
  - [🔄 Functional and Declarative Patterns](#functional-and-declarative-patterns)
  
  - [✍️ Descriptive Variable Names](#descriptive-variable-names)
  - [📁 File Structure](#file-structure)
  - [🛠️ Use InSpatial Tooling](#use-inspatial-tooling)
  - [🎬 Animations](#animations)

- [🏷️ Naming Conventions](#️-naming-conventions)

- [✏️ TypeScript](#-typescript)
  - [📝 Type Definitions](#type-definitions)

  - [⚙️ Compiler Configuration](#compiler-configuration)
  - [✨ Best Practices](#best-practices)

- [🧪 Test Structure and Organization](#-test-structure-and-organization)

- [💭 Comments](#-comments)

---

## 💫 Core Principles

| Principle | Description |
|-----------|-------------|
| **Readability First** | Code should be written with the next developer in mind |
| **Consistency Matters** | Follow established patterns throughout the project |
| **Self-Explanatory Code** | Write intuitive code that requires minimal comments |
| **Comprehensive Documentation** | Document following [InSpatial Doc Rules](.inspatialdocrules) |

---

## 📚 Code Standards

1. ### ESM Modules Only  
   Avoid using CommonJS modules. Use ECMAScript Modules (ESM) for all imports and exports.

2. ### Prefer Deno APIs  
   Where applicable, use Deno APIs over Node.js APIs to align with modern, secure practices we provide abstractions to make it easier to use Deno APIs.

3. ### Simple File Names  
   File names must be compatible with both Windows and Unix. Avoid characters like `*`, `:`, or `?`. Files with the same name but different casing are not allowed.

4. ### No `"Slow Types"`  
   Avoid "slow types" as defined in [Slow Types](https://jsr.io/docs/about-slow-types).

5. ### No Native Binaries  
   - Avoid dependencies that require native binaries or compilation
   - Use Typescript!
   - Use WebAssembly (WASM) modules when native functionality is absolutely required

6. ### Shader Standards  
   - Use **WebGPU Shading Language (WGSL)** or supersets like **Three Shading Language (TSL)** with backwards compatibility for WebGL 2.0 (GLSL).  
   - Helpers in the [@inspatial/util](https://inspatial.dev/) package can assist with this.

7. ### Functional and Declarative Patterns  
   Adhere to functional and declarative programming patterns. Refer to [Patterns.dev](https://www.patterns.dev/) for guidance.

8. ### Descriptive Variable Names  
   Use meaningful names with auxiliary verbs (e.g., `isLoading`, `hasError`).

9. ### File Structure  
    - Exported components first
    - Subcomponents next
    - Helpers, static content, and types last

10. ### Use InSpatial Tooling 
    - For constructing components, use [InSpatial Kit](https://inspatial.dev/kit).  
    - For styling, use [InSpatial ISS](https://inspatial.dev/iss).
    - Use [InSpatial Util](https://inspatial.dev/util) for all utilities.
    - Use [InSpatial Infetch](https://inspatial.dev/infetch) for all HTTP requests.

11. ### Animations  
    Use [Motion](https://motion.dev/) for all animations and transitions(javascript only).



## 🏷️ Naming Conventions

| Type | Convention | Example | Additional Rules |
|------|------------|---------|-----------------|
| Variables | camelCase | `userData` | Use descriptive names that convey intent |
| Components | PascalCase | `UserProfile` | - |
| Files/Directories | kebab-case | `user-profile.ts` | - |
| Types/Interfaces | PascalCase + Prop | `UserProp` | Must start with uppercase letter |
| Private Variables | underscore prefix | `_privateData` | - |
| Functions | camelCase | `fetchUserData` | - |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` | - |
| Boolean Variables | camelCase with prefix | `isLoading`, `hasError` | Use prefixes: is, has, should, can, etc. |
| Event Handlers | camelCase with 'handle' prefix | `handleClick` | - |


### General Rules
- Avoid abbreviations unless widely understood (e.g., `id` is fine, but `usr` is not)
- Names should be self-documenting and clearly indicate purpose
- Keep naming consistent across related entities

---

## ✏️ TypeScript

### Type Definitions
| Practice | Do | Don't | Reason |
|----------|----|----|--------|
| Type Annotations | `function foo(): BazType` | `function foo()` | Helps compiler work faster with explicit types |
| Type Composition | `interface Foo extends Bar, Baz` | `type Foo = Bar & Baz` | Interfaces create cached, flat object types |
| Base Types | `interface Animal { ... }` | `type Animal = Dog \| Cat` | Reduces type comparison complexity |
| Complex Types | `type ComplexType = { ... }` | Inline complex types | Named types are more compact and cacheable |

### Compiler Configuration
| Flag | Purpose | Impact |
|------|---------|--------|
| `--incremental` | Save compilation state | Recompiles only changed files |
| `--skipLibCheck` | Skip `.d.ts` checking | Faster compilation by skipping verified types |
| `--strictFunctionTypes` | Optimize type checks | Reduces assignability checks between types |

### Best Practices
- Use explicit return types on exported functions
- Prefer interfaces over type intersections for better caching
- Name complex types instead of using anonymous types
- Use base types instead of large union types
- Keep type hierarchies shallow when possible
- Use **ES6+ syntax**: arrow functions, destructuring, template literals, etc.
- Avoid `any` unless absolutely necessary. Use strict and explicit typing.
- Follow [Typescript's Performance Rules](https://github.com/microsoft/TypeScript/wiki/Performance)

### Example
```typescript
// ✅ Do: Use interfaces and explicit types
interface UserData {
  id: string;
  name: string;
}

// ✅ Do: Use ES6+ syntax with strict typing
function fetchUser(id: string): Promise<UserData> {
  return inFetch(`/users/${id}`);
}
```

```typescript
// ❌ Don't: Use type intersections and implicit types
type UserData = BaseUser & {
  extraData: unknown;
}

// ❌ Don't: Use type intersections and implicit types
function fetchUser(id) {
  return inFetch(`/users/${id}`);
}
```


## 🧪 Test Structure and Organization

- Use **InSpatial Test** for all types of tests
- Place tests next to the relevant file
- Use one of these naming patterns:
  - `file.test.ts` (preferred)
  - `file_test.ts`
- Write meaningful test descriptions and cover edge cases
- Check test coverage using `deno test --coverage`
- Follow **[InSpatial Test Rules](.inspatialtestrules)**.

### Running Tests
```bash
# Run all tests
deno test

# Run specific test suite
deno test packages/core

# Run with coverage
deno test --coverage
```

### Test Examples
```typescript
import { test } from "@inspatial/test";

// Prefer object style for tests 

// ✅ Do: Descriptive test names and comprehensive test cases
test({
  name: "Button renders with correct label",
  fn: () => {
    const user = await fetchUser('123');
    expect(user).toHaveProperty('id', '123');
  }
});

describe('fetchUser', () => {
  it('returns a user object when the request is successful', async () => {
    const user = await fetchUser('123');
    expect(user).toHaveProperty('id', '123');
  });

  it('throws an error when the user ID is invalid', async () => {
    await expect(fetchUser('')).rejects.toThrow('Invalid user ID');
  });
});
```

```typescript
// ❌ Don't: Vague test names or incomplete coverage
test({
  name: "button test",
  fn: () => {
    // ...
  }
});
```

## 📝 Comments
- **When to Comment**:
  - Use comments to explain **why**, not **what**.  
    The code should already explain what it does.
  - Document complex logic or unusual decisions.

**Example:**
```typescript
/**
 * Fetches a user by ID from the server.
 *
 * @param id - The ID of the user to fetch.
 * @returns A promise resolving to the user object.
 */
function fetchUser(id: string): Promise<User> {
  return inFetch(`/users/${id}`);
}
```

