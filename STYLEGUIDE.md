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
   <br>

  <h1 align="center">InSpatial Style Guide</h1>

  <h3 align="center">
    A comprehensive guide for maintaining clean, consistent, and maintainable code <br> across the InSpatial ecosystem
  </h3>

[![Code Style](https://img.shields.io/badge/code_style-inspatial-5a66f6.svg?style=flat-square)](https://www.inspatial.dev)
[![TypeScript](https://img.shields.io/badge/typescript-strict-blue.svg?style=flat-square)](https://www.typescriptlang.org)
[![ESM](https://img.shields.io/badge/modules-ESM-yellow.svg?style=flat-square)](https://nodejs.org/api/esm.html)
[![Deno](https://img.shields.io/badge/runtime-deno-green.svg?style=flat-square)](https://deno.land)

</div>

---

## 🎯 Core Principles

| Principle | Description |
|-----------|-------------|
| **Readability First** | Code should be written with the next developer in mind |
| **Consistency Matters** | Follow established patterns throughout the project |
| **Self-Explanatory Code** | Write intuitive code that requires minimal comments |
| **Comprehensive Documentation** | Document following [InSpatial Doc Rules](.inspatialdocrules) |

2. **ESM Modules Only**  
   Avoid using CommonJS modules. Use ECMAScript Modules (ESM) for all imports and exports.

3. **Prefer Deno APIs**  
   Where applicable, use Deno APIs over Node.js APIs to align with modern, secure practices we provide abstractions to make it easier to use Deno APIs.

4. **Simple File Names**  
   File names must be compatible with both Windows and Unix. Avoid characters like `*`, `:`, or `?`. Files with the same name but different casing are not allowed.

5. **No "Slow Types"**  
   Avoid "slow types" as defined in [Slow Types](https://jsr.io/docs/about-slow-types).

6. **No Native Binaries**  
   - Avoid dependencies that require native binaries or compilation
   - Use pure JavaScript/TypeScript alternatives where possible
   - Use WebAssembly (WASM) modules when native functionality is absolutely required

7. **Shader Standards**  
   - Use **WebGPU Shading Language (WGSL)** or supersets like **Three Shading Language (TSL)** with backwards compatibility for WebGL 2.0 (GLSL).  
   - Helpers in the [@inspatial/util](https://inspatial.dev/) package can assist with this.

8. **Functional and Declarative Patterns**  
   Adhere to functional and declarative programming patterns. Refer to [Patterns.dev](https://www.patterns.dev/) for guidance.

9. **Descriptive Variable Names**  
   Use meaningful names with auxiliary verbs (e.g., `isLoading`, `hasError`).

10. **File Structure**  
    - Exported components first
    - Subcomponents next
    - Helpers, static content, and types last

11. **Use InSpatial Tools**  
    - For constructing components, use [InSpatial Kit](https://inspatial.dev/kit).  
    - For styling, use [InSpatial ISS](https://inspatial.dev/iss).
    - Use [InSpatial Util](https://inspatial.dev/util) for all utilities.

12. **Animations and Transitions**  
    Use [Motion](https://motion.dev/) for all animations and transitions(javascript only).

---

<div align="center">
  <h3>JavaScript/TypeScript Standards</h3>
</div>

### **1. Language Features**
- Use **ES6+ syntax**: arrow functions, destructuring, template literals, etc.
- Avoid `any` unless absolutely necessary. Use strict and explicit typing.
- Use [InSpatial Infetch](https://inspatial.dev/infetch) for all HTTP requests.

**Example:**
```typescript
// ✅ Do: Use ES6+ syntax with strict typing
const fetchData = (id: string): Promise<Data> => {
  return inFetch(`/api/data/${id}`).then((response) => response.json());
};

// ❌ Don't: Use loose typing or older syntax
function fetchData(id) {
  return inFetch(`/api/data/${id}`).then((response) => response.json());
}
```

---

<div align="center">
  <h3>Naming Conventions</h3>
</div>

| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `userData` |
| Components | PascalCase | `UserProfile` |
| Files/Directories | kebab-case | `user-profile.ts` |
| Types/Interfaces | PascalCase + Prop | `UserProp` |
| Private Variables | underscore prefix | `_privateData` |

### **3. Naming Conventions**
- Use **descriptive names** that convey intent.
- Avoid abbreviations unless widely understood (e.g., `id` is fine, but `usr` is not).
- Prefix private variables with an underscore (`_`).
- Start types and interfaces with uppercase letter (e.g., `User`)
- Suffix types and interfaces with "Prop" keyword (e.g., `UserProp`)
- Use camelCase for functions and variable names.
- Use PascalCase for component names.
- Use kebab-case for file and directory names.

**@Typing:**
```typescript
// Good
const userList: User[] = [];

// Bad
const ul: any = [];
```

**@Components:**
```typescript
// ✅ Do: Functional components
export function Button({ label, onClick }: ButtonProps) {
  return <button onClick={...}>{label}</button>
}

// ❌ Don't: Class components
class Button extends Component { ... }
```

---

## 🧪 Testing Guidelines

```bash
# Run all tests
deno test

# Run specific test suite
deno test packages/core

# Run with coverage
deno test --coverage
```

### Test Structure
```typescript
import { test } from "@inspatial/test";

// ✅ Do: Descriptive test names
test({
  name: "Button renders with correct label",
  fn:  () => {
    // ...
  }
});

// ❌ Don't: Vague test names
test({
  name: "button test",
  fn: () => {
    // ...
  }
});
```

---

### **4. Comments**
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
  return api.get(`/users/${id}`);
}
```

---

## **Git Commit Messages**
- Use the following structure:
  ```
  [Type]: [Short Summary]

  [Optional Detailed Description]
  ```
- **Types**:  
  - `feat`: A new feature
  - `fix`: A bug fix
  - `refactor`: Code changes that neither fix a bug nor add a feature
  - `docs`: Documentation updates
  - `test`: Adding or updating tests
  - `chore`: Maintenance tasks

**Example:**
```
feat: Add user profile page

This commit adds a new user profile page with full functionality.
```

---

## **Testing Standards**
- Use **InSpatial Test** for all types of tests.
- Place tests in next to the relevant file.
- Create test files using either of these naming patterns:
    - `file.test.ts` (preferred)
    - `file_test.ts`
- Write meaningful test descriptions and cover edge cases.
- Check test coverage using `deno test --coverage`
- Read [InSpatial Test](https://inspatial.dev/test) for more information.

**Example:**
```typescript
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

