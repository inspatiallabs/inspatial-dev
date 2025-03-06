// @ts-ignore - Using npm import via Deno syntax
import * as InSpatialDOM from "npm:linkedom@^0.18.9";

export {
  /**
   * # InSpatial DOM
   *
   * InSpatial DOM is a **lightweight, spec-compliant server-side DOM implementation** designed for **high-performance environments** like XR, WebGPU, and distributed rendering pipelines. Unlike Virtual DOM libraries, InSpatial DOM provides a **direct, mutable DOM-like structure** without diffing or reconciliation, making it ideal for **server-side rendering (SSR), testing, and XR content pre-processing**.
   *
   * ## Key Features
   * - **Fast and Lightweight**: Optimized for server-side execution with minimal overhead.
   * - **Spec-Compliant**: Implements standard DOM APIs such as `document.createElement`, `querySelector`, and `appendChild`.
   * - **Direct DOM Manipulation**: No Virtual DOM diffing—modifications take effect immediately.
   * - **Ideal for XR & WebGPU Pipelines**: Enables structured **scene graph management** outside the browser.
   * - **Supports Node.js and Deno**: Works in non-browser environments seamlessly.
   *
   * ---
   *
   * ## Terminology
   * - **Virtual DOM**: A memory-based UI representation used for optimizing updates (e.g., React, Vue). Not used in InSpatial DOM.
   * - **Spec-Compliant**: Adheres to browser API standards for interoperability.
   * - **Server-Side Rendering (SSR)**: Generating HTML structure on the server before sending it to the client.
   * - **Scene Graph**: A hierarchical representation of 3D objects used in graphics engines and XR applications.
   *
   * ---
   *
   * ## Example Usage
   *
   * ```javascript
   * import { InSpatialDOM } from '@inspatial/dom';
   *
   * // Create a document
   * const { parseHTML } = InSpatialDOM;
   * const { document, Node, Element, DocumentFragment } = parseHTML("");
   *
   * // Create and append an element
   * const div = document.createElement('div');
   * div.textContent = 'Hello, InSpatial DOM!';
   * document.body.appendChild(div);
   *
   * console.log(document.body.innerHTML);
   * ```
   *
   * **NOTE:** InSpatial DOM is designed for environments that require **direct DOM manipulation** without the overhead of diffing algorithms. This makes it well-suited for **pre-rendering 3D/XR environments**, generating DOM structures for WebGPU, and handling **offscreen DOM processing**.
   *
   */
  InSpatialDOM,
};
