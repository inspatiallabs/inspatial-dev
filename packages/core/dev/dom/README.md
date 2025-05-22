<div align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-light.svg">
        <source media="(prefers-color-scheme: light)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg">
        <img src="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg" alt="InSpatial" width="300">
    </picture>

<br>
   <br>

<p align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/logo-light.svg">
        <source media="(prefers-color-scheme: light)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/logo-dark.svg">
        <img src="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/logo-dark.svg" height="75" alt="InSpatial">
    </picture>
</p>

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

---

# 🏗️ InDOM (🟡 Preview)

InDOM A.K.A InSpatial DOM is a high-performance, **DOM-less** environment designed for **universal rendering** across web, native, embedded and XR applications. It's designed 

## 🚀 Features

- **Universal Rendering**: Works across browsers, WebGPU, WebXR, Deno/Node.js,
  and native environments.
- **Virtual DOM-like API**: Provides an efficient document structure with query
  selectors, element creation, and tree manipulation.
- **Headless DOM Parsing**: Enables parsing and manipulation of XML, HTML, and
  SVG without a traditional browser DOM.
- **Ultra-Lightweight**: No dependency on the browser's native DOM, reducing
  memory overhead.
- **Optimized for XR & 3D**: Direct GPU integration, supporting WebXR and
  spatial computing workflows.
- **Custom Event System**: Efficient event propagation without traditional event
  bubbling limitations.
- **HTML & XML Parsing**: Provides a structured, flexible API for document
  parsing and modification.
- **Shadow DOM & Custom Elements Support**: Works with web component-like
  structures.
- **XPath and CSS Query Selectors**: Query document structures like a
  traditional DOM environment.
- **Mutation Observers**: Listen for changes in the document structure in a
  performant way.

## 🌍 Why InDOM?

- **Performance**: Eliminates browser reflows and repaints, making it ideal for
  **high-performance rendering engines**.
- **Cross-Platform**: Functions in **web, native, and cloud** environments.
- **Lightweight & Fast**: No dependency on the native DOM, reducing runtime
  overhead.
- **Perfect for Spatial & 3D Rendering**: Designed for XR applications where a
  traditional DOM is unnecessary.

---

## 🆚 InDOM vs Virtual-DOM?

Unlike traditional approaches that rely on a **Virtual DOM (VDOM)**, InSpatial
DOM takes a radically different approach:

| Feature          | Virtual DOM                                                           | InDOM                                                                          |
| ---------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Concept**      | A lightweight representation of the real DOM that updates efficiently | A complete **DOM-less** environment optimized for **universal rendering**              |
| **Performance**  | Still requires **diffing** and **reconciliation**                     | **No diffing or reconciliation** overhead, leading to **faster rendering**             |
| **Rendering**    | **Batch updates** to the real DOM                                     | **Directly constructs & renders structures** without a real DOM                        |
| **Memory Usage** | Can be **memory-intensive** due to retained structures                | **Minimal memory overhead**, as it avoids retaining unused structures                  |
| **Use Cases**    | Traditional web applications using React-like frameworks              | **Universal applications, including XR (AR/MR/VR), gaming, and server-side rendering** |

By eliminating the reliance on both the **real DOM** and the **Virtual DOM**,
InDOM provides an unparalleled foundation for rendering across **web,
native, and XR** environments.

---

## 📦 Install InDOM

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

---

## 🚀 Getting Started

### Using InDOM
```typescript
import { createDOM } from "@in/dom"

// Parse HTML string in one step
const { document, window } = createDOM("<html><body><h1>I'm In Spatial!</h1></body></html>")

console.log(document.querySelector("h1").textContent) // "I'm In Spatial!"

// You also get access to the window object
console.log(window.document === document) // true
```

The `createDOM` function is a convenient wrapper that:
- Creates a DOMParser instance for you
- Sets the MIME type to "text/html"
- Returns both document and window objects
- Optionally accepts custom globals as a second parameter

### Using InDOM (Lite)
```typescript
import { createDOMLite } from '@in/dom/lite';

const { createDocument } = createDOMLite()

const document = createDocument(HTML_NAMESPACE, 'html')

const asset = document.createElementNS(HTML_NAMESPACE, 'asset')
asset.appendChild(document.createTextNode("I'm In Spatial"))
document.body.appendChild(asset);
```
---

## 🤝 Contributing

We welcome contributions from the community! Please read our
[Contributing Guidelines](CONTRIBUTING.md) to get started.

---

## 📄 License

InDOM is released under the Apache 2.0 License. See the
[LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Ready to supercharge your spatial development?</strong>
  <br>
  <a href="https://www.inspatial.dev">Get Started with InDOM</a>
</div>
