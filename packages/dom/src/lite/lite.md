# InDOM (Lite)

The lightweight InDOM implementation.

## Baseline

- DOM implementation for all js runtimes (Deno, NodeJS, Bun) and non-browser environments
- Full event (trigger) system with bubbling, capturing, and all standard DOM event (trigger) methods
- Element creation and manipulation with proper inheritance chain
- Attribute handling with namespace support
- Serialization to HTML/XML

## Basic Usage

```typescript
import { createDOMLite } from '@in/dom/lite';

// Create a DOM environment
const { scope, createDocument } = createDOMLite();

// Create a document
const document = createDocument(null, 'html');

// Create and manipulate elements
const div = document.createElement('div');
div.className = 'container';

const text = document.createTextNode("I'm In DOM!");
div.appendChild(text);

document.body.appendChild(div);

// Event handling
div.addEventListener('click', (event) => {
  console.log('Clicked!');
  event.stopPropagation();
});

// Dispatch events
div.dispatchEvent(new scope.Event('click', { bubbles: true }));

// Get HTML output
console.log(div.outerHTML); // <div class="container">In DOM!</div>
```

## Advanced Usage

### Custom Element Registration

```typescript
import { createDOMLite } from '@in/dom/lite';

const { scope, registerElement } = createDOMLite();

// Register a custom element
registerElement('CustomElement', scope.HTMLElement, false, true);

// Create an instance
const custom = new scope.CustomElement();
custom.setAttribute('data-custom', 'value');
```

### Custom Environment Hooks

```typescript
import { createDOMLite, EnvironmentOptions } from '@in/dom/lite';

const options: EnvironmentOptions = {
  // Log when attributes are set
  onSetAttributeNS: function(ns, name, value) {
    console.log(`Setting attribute ${name}=${value} on ${this.nodeName}`);
  },
  
  // Custom document initialization
  initDocument: (document) => {
    document.head = document.createElement('head');
    document.body = document.createElement('body');
    document.documentElement.appendChild(document.head);
    document.documentElement.appendChild(document.body);
    
    // Add meta tag
    const meta = document.createElement('meta');
    meta.setAttribute('charset', 'utf-8');
    document.head.appendChild(meta);
  }
};

const { createDocument } = createDOMLite(options);
const document = createDocument(null, 'html');
```

## API Reference

### Core Functions

- `createDOMLite(options?)`: Creates a DOM environment
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
