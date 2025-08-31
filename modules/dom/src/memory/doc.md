# InDOM (Memory) 🟡 Preview

Aside from the DOM Renderer, the `@in/dom` module also provides a lightweight in‑memory DOM implementation which is a stand‑in for the real browser DOM API, useful in Node environments or for testing. The InDOM (Memory) is designed to work everywhere. It is designed to be the lightest possible and minimal implementation of the DOM optimized for performance and universal rendering, bringing the DOM to platforms with the most constrained specs like smart watches.

## Baseline

- DOM implementation for all js runtimes (Deno, NodeJS, Bun) and non-browser environments
- Great for testing or using DOM-style code where a browser environment doesn’t exist
- Zero-dependency (no XML parser, no innerHTML, no deep cloneNode)
- Tiny memory-footprint – target < 8 MB RAM / < 500 MHz CPU to bring the DOM to places like smart watches
- No reliance on browser globals like Node, Document, and types
- Not a virtual DOM!

The Memory DOM does not try to be clever like a virtual DOM (no diffing, no reconciliation). Instead, it just implements the DOM API in memory so that when you call things like:

## Basic Usage
```typescript
import { createDOM } from '@in/dom/memory';

const { createDocument } = createDOM()

const document = createDocument(HTML_NAMESPACE, 'html')

const asset = document.createElementNS(HTML_NAMESPACE, 'asset')
asset.appendChild(document.createTextNode("I'm In Spatial"))
document.body.appendChild(asset);
```

…it behaves like you’re working with the browser’s DOM, except nothing is rendered to a screen. It all just exists in memory, and you can serialize it to strings (outerHTML) or traverse it like the real thing.


**NOTE:**
Because InDOM (Memory) does not ship an XML Parser, innerHTML and cloneNode, it is recommended to always build nodes via createElement(…).

## API Reference

### Core Functions

- `createDOM(options?)`: Creates a DOM environment
- `createEvent(type, options?)`: Creates a DOM event
- `isElement(node)`: Checks if a node is an Element
- `isNode(node)`: Checks if an object is a Node

### DOM Classes

The environment's `scope` object contains all standard DOM classes:

- `Event`: DOM Event class
- `EventTarget`: Base class for all event targets
- `Node`: Base class for all DOM nodes
- `CharacterData`: Base class for text-based nodes
- `Text`: Text node class
- `Comment`: Comment node class
- `Element`: Base element class
- `HTMLElement`: HTML element class
- `SVGElement`: SVG element class
- `Document`: Document class
- `DocumentFragment`: DocumentFragment class
