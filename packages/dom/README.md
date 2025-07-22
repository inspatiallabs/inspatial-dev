<div align="center">
    <a href="https://inspatial.io" target="_blank">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-light.svg">
        <source media="(prefers-color-scheme: dark)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg">
        <img src="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg" alt="InSpatial" width="300"/>
    </picture>
    </a>

<br>
   <br>

<a href="https://inspatial.io" target="_blank">
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
[![InSpatial App](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/app-badge.svg)](https://www.inspatial.io)
[![InSpatial Store](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/store-badge.svg)](https://www.inspatial.store)

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://opensource.org/licenses/Intentional-License-1.0)
[![Discord](https://img.shields.io/badge/discord-join_us-5a66f6.svg?style=flat-square)](https://discord.gg/inspatiallabs)
[![Twitter](https://img.shields.io/badge/twitter-follow_us-1d9bf0.svg?style=flat-square)](https://twitter.com/inspatiallabs)
[![LinkedIn](https://img.shields.io/badge/linkedin-connect_with_us-0a66c2.svg?style=flat-square)](https://www.linkedin.com/company/inspatiallabs)

</div>

##

<div align="center">

| InSpatial                                        | Description                          | Link             |
| --- | --- | ---- |
| [![InSpatial Dev](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/dev-badge.svg)](https://www.inspatial.dev)     | Universal Libraries & Frameworks     | [inspatial.dev](https://www.inspatial.dev)   |
| [![InSpatial Cloud](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/cloud-badge.svg)](https://www.inspatial.cloud) | Backend APIs and SDKs                | [inspatial.cloud](https://www.inspatial.cloud) |
| [![InSpatial App](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/app-badge.svg)](https://www.inspatial.io)     | Build and manage your InSpatial apps | [inspatial.app](https://www.inspatial.io)   |
| [![InSpatial Store](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/store-badge.svg)](https://www.inspatial.store) | Deploy and discover InSpatial apps   | [inspatial.store](https://www.inspatial.store) |

</div>

---

## 🔍 InDOM (🟡 Preview)


InDOM A.K.A InSpatial DOM is a high-performance, **DOM-less** environment designed for **universal rendering** across web, native, embedded and XR applications.

## 🤔 What is DOM?

The Document Object Model (DOM) is a programming interface for web documents. It represents the page so that programs can change the document structure, style, and content. The DOM represents the document as nodes and objects; that way, programming languages can interact with the page.

## 🚀 What is InDOM?

InDOM is a **universal DOM implementation** that works everywhere - from browsers to servers to XR headsets. Unlike traditional browser DOM or Virtual DOM approaches, InDOM provides:

- **DOM-less Architecture**: No dependency on browser DOM APIs
- **Universal Compatibility**: Works across web, native, embedded, and XR platforms  
- **High Performance**: Eliminates browser reflows, repaints, and Virtual DOM diffing overhead
- **Spatial Computing Ready**: Optimized for AR/MR/VR applications

## 🌍 Why InDOM?

### Performance Advantages
- **No Diffing Overhead**: Unlike Virtual DOM, InDOM doesn't require expensive reconciliation
- **No Browser Constraints**: Eliminates reflows, repaints, and layout thrashing
- **Direct Rendering**: Constructs structures directly without intermediate representations
- **Memory Efficient**: Minimal overhead compared to retained Virtual DOM structures

### Universal Platform Support
- **Cross-Platform**: Functions identically in web, native, and cloud environments
- **XR Optimized**: Perfect for spatial computing where traditional DOM is unnecessary
- **Embedded Ready**: Lightweight enough for resource-constrained environments
- **Server-Side**: Full DOM manipulation capabilities on the server

## 🌟 Features

- **Universal Rendering**: Works across browsers, WebGPU, WebXR, Deno/Node.js, and native environments
- **Virtual DOM-like API**: Provides an efficient document structure with query selectors, element creation, and tree manipulation
- **Headless DOM Parsing**: Enables parsing and manipulation of XML, HTML, and SVG without a traditional browser DOM
- **Ultra-Lightweight**: No dependency on the browser's native DOM, reducing memory overhead
- **Optimized for XR & 3D**: Direct GPU integration, supporting WebXR and spatial computing workflows
- **Custom Event System**: Efficient event propagation without traditional event bubbling limitations
- **HTML & XML Parsing**: Provides a structured, flexible API for document parsing and modification
- **Shadow DOM & Custom Elements Support**: Works with web component-like structures
- **XPath and CSS Query Selectors**: Query document structures like a traditional DOM environment
- **Mutation Observers**: Listen for changes in the document structure in a performant way

## 🆚 InDOM vs Virtual DOM

Unlike traditional approaches that rely on a **Virtual DOM (VDOM)**, InSpatial DOM takes a radically different approach:

| Feature          | Virtual DOM                                                           | InDOM                                                                          |
| ---------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Concept**      | A lightweight representation of the real DOM that updates efficiently | A complete **DOM-less** environment optimized for **universal rendering**              |
| **Performance**  | Still requires **diffing** and **reconciliation**                     | **No diffing or reconciliation** overhead, leading to **faster rendering**             |
| **Rendering**    | **Batch updates** to the real DOM                                     | **Directly constructs & renders structures** without a real DOM                        |
| **Memory Usage** | Can be **memory-intensive** due to retained structures                | **Minimal memory overhead**, as it avoids retaining unused structures                  |
| **Use Cases**    | Traditional web applications using React-like frameworks              | **Universal applications, including XR (AR/MR/VR), gaming, and server-side rendering** |

By eliminating the reliance on both the **real DOM** and the **Virtual DOM**, InDOM provides an unparalleled foundation for rendering across **web, native, and XR** environments.

## 🔄 InDOM vs InDOM (Lite)

### InDOM (Virtual) 🔴 Unstable
- Full-featured DOM implementation with XML parser, innerHTML, and deep cloneNode
- Comprehensive browser-compatible APIs
- Complete event system and mutation observers
- Ideal for complex applications requiring full DOM compatibility

### InDOM (Lite) 🟡 Preview
InDOM Lite is designed to work everywhere unlike InDOM Virtual - it is designed to be the lightest possible and minimal implementation of the DOM optimized for performance and universal rendering, bringing the DOM to platforms with the most constrained specs like smart watches.

Unlike InDOM Virtual, InDOM Lite is designed with:

1. **Zero-dependency** (no XML parser, no innerHTML, no deep cloneNode)
2. **Tag names are lower-cased**; events/attributes are never hard-coded
3. **Tiny memory-footprint** – target < 8 MB RAM / < 500 MHz CPU to bring the DOM to places like smart watches
4. **No reliance on browser globals** like Node, Document, and types

Because InDOM (Lite) does not ship an XML Parser, innerHTML and cloneNode, it is recommended to always build nodes via `createElement(…)`.

## 📦 Install InDOM

Choose your preferred package manager:

```bash
deno install jsr:@in/dom
```

```bash
npx jsr add @in/dom
```

```bash
yarn dlx jsr add @in/dom
```

```bash
pnpm dlx jsr add @in/dom
```

```bash
bunx jsr add @in/dom
```

## 🚀 Getting Started

### Using createVirtualDOM (Convenience Function)
```typescript
import { createVirtualDOM } from "@in/dom"

// Parse HTML string in one step
const { document, window } = createVirtualDOM("<html><body><h1>I'm In Spatial!</h1></body></html>")

console.log(document.querySelector("h1").textContent) // "I'm In Spatial!"

// You also get access to the window object
console.log(window.document === document) // true
```

The `createVirtualDOM` function is a convenient wrapper that:
- Creates a DOMParser instance for you
- Sets the MIME type to "text/html"
- Returns both document and window objects
- Optionally accepts custom globals as a second parameter

### Using DOMParser (Standard/Traditional Approach)
```typescript
import { DOMParser } from "@in/dom"

// Create a parser instance
const parser = new DOMParser()

// Parse HTML string into a document
const document = parser.parseFromString(
  "<html><body><h1>I'm In Spatial!</h1></body></html>",
  "text/html",
)

console.log(document.querySelector("h1").textContent) // "I'm In Spatial!"
```

### Using InDOM (Lite)
```typescript
import { createDOM } from '@in/dom/lite';

const { createDocument } = createDOM()

const document = createDocument(HTML_NAMESPACE, 'html')

const asset = document.createElementNS(HTML_NAMESPACE, 'asset')
asset.appendChild(document.createTextNode("I'm In Spatial"))
document.body.appendChild(asset);
```

## 🔧 Compatibility

### Runtime Support
- ✅ **Deno**: Full native support
- ✅ **Node.js**: Complete compatibility 
- ✅ **Bun**: Optimized performance
- ✅ **Browsers**: Works in all modern browsers
- ✅ **Web Workers**: Full support for background processing
- ✅ **Service Workers**: Perfect for offline applications


## 🧪 Testing

### Running InSpatial Test Fusion-TDD

InDOM uses Fusion Test-Driven Development for comprehensive testing:

```bash
# Run all tests
deno task test

# Test specific components
deno task test:lite        # Test InDOM Lite
deno task test:virtual     # Test Vitual functionality  
deno task test:html        # Test HTML elements
deno task test:interface   # Test DOM interfaces
```

### Common Testing Challenges

When testing DOM-related code, you might run into some tricky situations. Here's why: The way we test DOM behavior in a testing environment might not perfectly match how it works in a real browser. This can make testing frustrating when you're not seeing the results you expect. Here are some helpful tips:

#### 1. Isolate DOM Tests

You will need to simulate a clean isolated DOM environment for each individual test case to run independently without interference from previous tests. In other words, you have to keep each test separate from each other. If tests shared the same DOM instance, a modification in one test (like adding an element or an event `trigger` listener) could accidentally affect the outcome of another which could cause the test to fail. 

Isolating/running a function that isolates the DOM before each test ensures that every test starts with a brand new, predictable DOM. InDOM provides a `createIsolatedDOM` test-helper API you can use for this task.

```typescript
import { describe, it, beforeEach } from "@in/test";
import { createIsolatedDOM } from "@in/dom/test-helpers.ts";

describe("DOM Test Suite", () => {
  let dom: any;
  
  beforeEach(() => {
    dom = createIsolatedDOM();
  });
  
  it("should work in isolation", () => {
    const element = dom.document.createElement("div");
    // ... test implementation
  });
});
```

#### 2. Consider Real-World Testing

While testing in a production environment might sound scary, it can actually be valuable for DOM testing. This is because you'll see exactly how your code behaves in a real browser, which can help catch issues that might not show up in your test environment. Just be careful and make sure you have proper safeguards in place.

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

## 📄 License

InDOM is released under the Apache 2.0 License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Ready to supercharge your spatial development?</strong>
  <br>
  <a href="https://www.inspatial.dev">Get Started with InDOM</a>
</div>
