<div align="center">
  <!-- <img src="https://your-image-url.com/inspatial-logo.png" alt="InSpatial RateLimit Logo" width="200"/> -->

# 🚦 `InSpatial RateLimit`

_Type-safe rate limiter for universal and spatial apps_

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Core](https://img.shields.io/badge/core-inspatial.dev-brightgreen.svg)](https://www.inspatial.dev)
[![App](https://img.shields.io/badge/app-inspatial.app-purple.svg)](https://www.inspatial.app)
[![Cloud](https://img.shields.io/badge/cloud-inspatial.cloud-yellow.svg)](https://www.inspatial.cloud)
[![Store](https://img.shields.io/badge/store-inspatial.store-red.svg)](https://www.inspatial.store)

</div>

---

## 🌟 Welcome to InSpatial RateLimit

A powerful, type-safe rate limiting system built on InSpatial KV with comprehensive configuration options, optimized for Spatial and Universal Apps.

## 🌟 Features

- 📦 Type-safe rate limiting with InSpatial KV integration
- 🔒 Distributed rate limiting out of the box
- 🚀 High-performance operations with atomic guarantees
- 🧩 Flexible configuration options
- 🛠️ Cost-based rate limiting support
- 💪 Full TypeScript support

---

## 🛠️ Usage

## 💡 Step-by-Step Usage Guide

Follow these simple steps to get started with **InSpatial RateLimit** in your project:

#### Install InSpatial RateLimit:

```bash
deno install @inspatial/ratelimit
```

#### 1. **Initialize Rate Limiter**

Create a new rate limiter instance with your configuration:

```typescript
import { Ratelimit } from "@inspatial/ratelimit";
import { InSpatialKV } from "@inspatial/kv";

// Initialize KV store
const kv = new InSpatialKV<RatelimitSchema>();

// Create rate limiter
const limiter = new Ratelimit(kv, {
  limit: 100,
  duration: "1m",
  namespace: "api",
});
```

#### 2. **Basic Rate Limiting**

Implement rate limiting in your API:

```typescript
// Check rate limit for a user
const result = await limiter.limit("user-123");

if (!result.success) {
  throw new Error("Rate limit exceeded");
}

// Process request...
```

#### 3. **Cost-Based Rate Limiting**

Handle requests with different costs:

```typescript
// Expensive operation consuming multiple tokens
const result = await limiter.limit("user-123", {
  cost: 5, // This request counts as 5 regular requests
});

if (!result.success) {
  throw new Error("Insufficient rate limit tokens");
}
```

#### 4. **Advanced Configuration**

Customize behavior with timeout and error handling:

```typescript
const limiter = new Ratelimit(kv, {
  limit: 100,
  duration: "1m",
  namespace: "api",
  timeout: {
    milliseconds: 5000,
    fallback: (identifier) => ({
      success: false,
      limit: 100,
      remaining: 0,
      reset: Date.now()
    })
  },
  onError: async (error, identifier) => {
    await logError(error);
    return {
      success: true,
      limit: 100,
      remaining: 100,
      reset: Date.now() + 60000
    };
  }
});
```

#### 5. **Async Mode**

Enable faster responses with async updates:

```typescript
const result = await limiter.limit("user-123", {
  async: true, // Don't wait for storage updates
});
```

#### 6. **Resource Tracking**

Track specific resources being accessed:

```typescript
const result = await limiter.limit("user-123", {
  resources: [{
    type: "document",
    id: "doc-456",
    name: "Important File",
    meta: {
      operation: "read",
      version: "1.0"
    }
  }]
});
```

## 🎉 You're All Set!

You've successfully integrated **InSpatial RateLimit** into your project. Explore more features and advanced usage patterns in our [documentation](https://www.inspatial.cloud/ratelimit).

---

## 📚 API Reference

### RatelimitConfig Options

| Option | Type | Description |
|--------|------|-------------|
| `limit` | `number` | Maximum requests allowed |
| `duration` | `Duration \| number` | Time window for the limit |
| `namespace` | `string` | Namespace for isolating limits |
| `timeout` | `object \| false` | Timeout configuration |
| `onError` | `function` | Error handler |
| `async` | `boolean` | Enable async mode |

### RatelimitResponse Structure

```typescript
{
  success: boolean;    // Whether the request is allowed
  limit: number;       // Maximum allowed requests
  remaining: number;   // Remaining requests in window
  reset: number;       // Timestamp when limit resets
}
```

---

## 🚀 Getting Started

To begin your journey with InSpatial RateLimit, visit our comprehensive documentation at [inspatial.ratelimit](https://www.inspatial.ratelimit).

---

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

## 🚀 Release Channels

Choose the release channel that best fits your needs:

| Channel        | Description                           | Installation                              |
| -------------- | ------------------------------------- | ----------------------------------------- |
| 🟢 **Stable**  | Production-ready              | `deno install @inspatial/ratelimit`        |
| 🟡 **Preview** | Beta features                   | `deno install @inspatial/ratelimit@preview` |
| 🔴 **Canary**  | Experimental | `deno install @inspatial/ratelimit@canary`  |

---

## 📄 License

InSpatial RateLimit is released under the Apache 2.0 License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Ready to implement robust rate limiting?</strong>
  <br>
  <a href="https://www.inspatial.app">Start Building with InSpatial</a>
</div>