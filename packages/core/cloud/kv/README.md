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
- 🔄 Atomic operations and transactions
- 📊 Queue processing with middleware support
- 👀 Real-time data watching capabilities

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
  key: ["user", number]
  schema: {
    id: string
    name: string
    email: string
  }
}]
```

#### 2. **Initialize KV Store**

Create a new KV instance with your schema:

```typescript
import { inSpatialKV } from "@inspatial/kv"

const kv = new inSpatialKV<UserSchema>()
```

#### 3. **Basic Operations Functions**

Store and retrieve data with type safety:

```typescript
import { closeKV, deleteKV, getKV, listKV, setKV } from "@inspatial/kv"

// Store data
await setKV(kv, ["user", 123], {
  id: "user123",
  name: "John Doe",
  email: "john@example.com",
})

// Retrieve data
const user = await getKV(kv, ["user", 123], {
  /**...*/
})

// Delete data
await deleteKV(kv, ["user", 123])

// List data
const users = listKV(kv, {
  prefix: ["user"],
  start: ["user", 100],
  end: ["user", 200],
  limit: 50,
})

// Close the KV store
await closeKV(kv)
```

#### 4. **Atomic Operations & Transactions**

Enjoy compile-time type checking:

```typescript
import { atomic, transaction } from "@inspatial/kv"

// Simple atomic operation
const result = await atomic(kv)
  .check({ key: ["user", 1], versionstamp: "v1" })
  .set(["user", 1], { id: "123", name: "John", email: "john@example.com" })
  .delete(["user", 2])
  .commit()

// Optimistic transaction with retries
const txResult = await transaction(kv, async (tx) => {
  const user = await getKV(kv, ["user", 1])
  if (!user.value) throw new Error("User not found")

  return tx
    .check({ key: ["user", 1], versionstamp: user.versionstamp })
    .set(["user", 1], { ...user.value, name: "Updated Name" })
})
```

#### 5. **Using With Complex Schemas**

Handle multiple data types with a single schema:

```typescript
type ComplexSchema = [
  {
    key: ["user", number]
    schema: { id: string; name: string }
  },
  {
    key: ["post", string]
    schema: { title: string; content: string }
  },
]

const kv = new inSpatialKV<ComplexSchema>()
```

#### 6. **Queue Processing with Middleware**

Middleware is a powerful feature that allows you to add custom logic to the processing of messages in a queue. It provides a way to intercept, modify, or extend the behavior of the message processing pipeline.

```typescript
import { createKVQueueProcessor } from "@inspatial/kv"

// Create a queue processor with middleware
const processor = createKVQueueProcessor<UserSchema>(kv)
  .use(async (message, next) => {
    console.log("Processing:", message.value.name)
    await next()
    console.log("Processed:", message.value.name)
  })
  .handle(async (message) => {
    // Process the user data
    await processUser(message.value)
    return true
  })

// Start processing
await processor.start()

// Enqueue data for processing
await enqueueKV(kv, {
  id: "user123",
  name: "John Doe",
  email: "john@example.com",
}, {
  delay: 1000, // 1 second delay
  backoffSchedule: [1000, 5000, 10000], // Retry after 1s, 5s, 10s
})

// Stop processing when done
await processor.stop()
```

#### 7. **Real-Time Data Watching**

```typescript
import { watchKV } from "@inspatial/kv"

// Watch for changes in the "user" prefix
import { createKVWatcher } from "@inspatial/kv"

// Create a watcher for specific keys
const changes = createKVWatcher(kv, [["user", 1], ["user", 2]])

// Handle changes
try {
  for await (const entries of changes) {
    if (entries[0].value) {
      console.log("User 1 updated:", entries[0].value.name)
    }
    if (entries[1].value) {
      console.log("User 2 updated:", entries[1].value.name)
    }
  }
} catch (error) {
  console.error("Watch error:", error)
}
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

| Channel        | Description                           | Installation                         |
| -------------- | ------------------------------------- | ------------------------------------ |
| 🟢 **Stable**  | Production-ready release              | `deno install @inspatial/kv`         |
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
