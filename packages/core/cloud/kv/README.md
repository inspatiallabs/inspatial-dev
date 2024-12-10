<div align="center">
  <!-- <img src="https://your-image-url.com/inspatial-logo.png" alt="InSpatial KV Logo" width="200"/> -->

# 🔑 `InSpatial KV`

_Type-safe key-value store for universal and spatial apps_

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Core](https://img.shields.io/badge/core-inspatial.dev-brightgreen.svg)](https://www.inspatial.dev)
[![App](https://img.shields.io/badge/app-inspatial.app-purple.svg)](https://www.inspatial.app)
[![Cloud](https://img.shields.io/badge/cloud-inspatial.cloud-yellow.svg)](https://www.inspatial.cloud)
[![Store](https://img.shields.io/badge/store-inspatial.store-red.svg)](https://www.inspatial.store)

</div>

---

## 🌟 Welcome to InSpatial KV

A powerful, type-safe key-value store built with schema validation at compile time and utility functions for seamless data management optimized for Spatial and Universal Apps


## 🌟 Features

- 📦 Type-safe key-value operations with schema validation
- 🔒 Built-in schema validation at compile time
- 🚀 High-performance operations built on Deno KV
- 🧩 Utility functions for common operations
- 🛠️ Flexible and extensible architecture
- 💪 Full TypeScript support

---

## 🛠️ Usage

## 💡 Step-by-Step Usage Guide

Follow these simple steps to get started with **InSpatial KV** in your Deno project:

#### Install InSpatial KV:

```bash
deno install @inspatial/kv
```

#### 1. **Define Your Schema**

Define your data schema with type safety:

```typescript
type UserSchema = [{
  key: ["user", number],
  schema: {
    id: string,
    name: string,
    email: string
  }
}];
```

#### 2. **Initialize KV Store**

Create a new KV instance with your schema:

```typescript
import { InSpatialKV } from "@inspatial/kv";

const kv = new InSpatialKV<UserSchema>();
```

#### 3. **Using Utility Functions**

Store and retrieve data with type safety:

```typescript
import { setKV, getKV, deleteKV, listKV } from "@inspatial/kv";

// Store data
await setKV(kv, ["user", 123], {
  id: "user123",
  name: "John Doe",
  email: "john@example.com"
});

// Retrieve data
const user = await getKV(kv, ["user", 123]);

// Delete data
await deleteKV(kv, ["user", 123]);

// List data
const users = listKV(kv, { prefix: ["user"] });
```

#### 4. **Type-Safe Operations**

Enjoy compile-time type checking:

```typescript
// This will cause a type error
await setKV(kv, ["user", 123], {
  id: 123, // Error: Type 'number' is not assignable to type 'string'
  name: "John"
  // Error: Missing required property 'email'
});
```

#### 5. **Using With Complex Schemas**

Handle multiple data types with a single schema:

```typescript
type ComplexSchema = [
  {
    key: ["user", number],
    schema: { id: string, name: string }
  },
  {
    key: ["post", string],
    schema: { title: string, content: string }
  }
];

const kv = new InSpatialKV<ComplexSchema>();
```

#### 6. **Advanced Usage**

Utilize additional options for fine-tuned control:

```typescript
// Set with expiration
await setKV(kv, ["user", 123], data, { expireIn: 3600000 });

// Get with consistency level
const user = await getKV(kv, ["user", 123], {
  consistency: "strong"
});

// List with pagination
const users = listKV(kv, {
  prefix: ["user"],
  start: ["user", 100],
  end: ["user", 200],
  limit: 50
});
```

## 🎉 You're All Set!

You've successfully integrated **InSpatial KV** into your project. Explore more features and advanced usage patterns in our [documentation](https://www.inspatial.kv).

---

## 🚀 Getting Started

To begin your journey with InSpatial KV, visit our comprehensive documentation at [inspatial.kv](https://www.inspatial.kv).

---

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

## 🚀 Release Channels

Choose the release channel that best fits your needs:

| Channel        | Description                           | Installation                        |
| -------------- | ------------------------------------- | ----------------------------------- |
| 🟢 **Stable**  | Production-ready release              | `deno install @inspatial/kv`        |
| 🟡 **Preview** | Usable early access                   | `deno install @inspatial/kv@preview` |
| 🔴 **Canary**  | Latest features, potentially unstable | `deno install @inspatial/kv@canary`  |

---

## 📄 License

InSpatial KV is released under the Apache 2.0 License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Ready to build type-safe data storage?</strong>
  <br>
  <a href="https://www.inspatial.app">Start Building with InSpatial</a>
</div>