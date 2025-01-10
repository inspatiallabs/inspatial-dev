<div align="center">
  <!-- <img src="https://your-image-url.com/inspatial-logo.png" alt="InSpatial InFetch Logo" width="200"/> -->

# 🌐 `InSpatial InFetch`

_A modern, type-safe fetch wrapper for universal and spatial apps_

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Core](https://img.shields.io/badge/core-inspatial.dev-brightgreen.svg)](https://www.inspatial.dev)
[![App](https://img.shields.io/badge/app-inspatial.app-purple.svg)](https://www.inspatial.app)
[![Cloud](https://img.shields.io/badge/cloud-inspatial.cloud-yellow.svg)](https://www.inspatial.cloud)
[![Store](https://img.shields.io/badge/store-inspatial.store-red.svg)](https://www.inspatial.store)

</div>

---

## 🌟 Welcome to InSpatial InFetch

A powerful, type-safe fetch wrapper built for modern web applications with streaming support, automatic retries, and comprehensive error handling.

## 🌟 Features

- 📦 Type-safe HTTP requests with TypeScript
- 🔄 Automatic retry mechanism with customizable options
- 📥 Streaming support for large data transfers
- 🎯 Intelligent response type detection
- 🔌 Extensible hook system for request/response interceptors
- ⏱️ Request timeout handling
- 🛡️ Comprehensive error handling
- 💪 Full TypeScript support

---

## 🛠️ Usage

## 💡 Step-by-Step Usage Guide

#### Install InSpatial InFetch:

```bash
deno install @inspatial/infetch
```

#### 1. **Basic Usage**

Simple GET request:

```typescript
import { inFetch } from "@inspatial/infetch";

const data = await inFetch("https://api.example.com/data");
```

#### 2. **Advanced Configuration**

Configure with options:

```typescript
const response = await inFetch("https://api.example.com/data", {
  method: "POST",
  body: { foo: "bar" },
  retry: 3,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json"
  }
});
```

#### 3. **Streaming Support**

Handle streaming responses:

```typescript
const stream = await inFetch("https://api.example.com/stream", {
  responseType: "stream"
});

for await (const chunk of stream) {
  // Process chunk
}
```

#### 4. **Error Handling**

Robust error handling:

```typescript
try {
  const data = await inFetch("https://api.example.com/data");
} catch (error) {
  if (error.status === 404) {
    console.log("Resource not found");
  }
  console.error(error.message);
}
```

#### 5. **Request Hooks**

Add request/response interceptors:

```typescript
const customFetch = inFetch.create({
  onRequest: [
    async (context) => {
      context.options.headers.set("Authorization", "Bearer token");
    }
  ],
  onResponse: [
    async (context) => {
      console.log("Response received:", context.response.status);
    }
  ]
});
```

#### 6. **Type Safety**

Leverage TypeScript types:

```typescript
interface User {
  id: number;
  name: string;
}

const user = await inFetch<User>("/api/user/1");
// user is typed as User
```

## 📚 API Reference

### FetchOptions

| Option | Type | Description |
|--------|------|-------------|
| `baseURL` | `string` | Base URL for requests |
| `timeout` | `number` | Request timeout in ms |
| `retry` | `number \| false` | Number of retry attempts |
| `responseType` | `'json' \| 'text' \| 'blob' \| 'arrayBuffer' \| 'stream'` | Response type |
| `headers` | `Headers \| Record<string, string>` | Request headers |
| `onRequest` | `FetchHook \| FetchHook[]` | Request interceptors |
| `onResponse` | `FetchHook \| FetchHook[]` | Response interceptors |

### Response Types

```typescript
type ResponseType = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'stream';

interface FetchResponse<T> extends Response {
  _data?: T;
}
```

---

## 🚀 Getting Started

To begin using InSpatial InFetch, visit our comprehensive documentation at [inspatial.cloud/infetch](https://www.inspatial.cloud/infetch).

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

## 🚀 Release Channels

Choose the release channel that best fits your needs:

| Channel | Description | Installation |
|---------|-------------|--------------|
| 🟢 **Stable** | Production-ready | `deno install @inspatial/infetch` |
| 🟡 **Preview** | Beta features | `deno install @inspatial/infetch@preview` |
| 🔴 **Canary** | Experimental | `deno install @inspatial/infetch@canary` |

---

## 📄 License

InSpatial InFetch is released under the Apache 2.0 License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Ready to enhance your HTTP requests?</strong>
  <br>
  <a href="https://www.inspatial.app">Start Building with InSpatial</a>
</div>