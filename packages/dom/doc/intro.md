InDOM A.K.A InSpatial DOM is a high-performance, **DOM-less** environment designed for **universal rendering** across web, native, embedded and XR applications. It's designed 

## What is DOM? 

## What is InDOM 
- what 
- dom vs virtual dom vs browser

## Why InDOM

## Founders Wisdom 
- uncommon knowledge
- experiences & insights

## Features 

## Usage
### Using createVirtualDOM (InDOM Convenience Function)
```js
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
```js
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


## Compatibility 
- Runtime Support 
- Integration

## Testing

- Running InSpatial Test Fusion-TDD
...

- Common Testing Challenges

When testing DOM-related code, you might run into some tricky situations. Here's why: The way we test DOM behavior in a testing environment might not perfectly match how it works in a real browser. This can make testing frustrating when you're not seeing the results you expect. Here are some helpful tips:

1. Isolate DOM Tests: You will need to simulate a clean isolated DOM environement for each individual test case to run independently without interference from previous tests. In other words you have to keep each test seperate from each other.  If tests shared the same DOM instance, a modification in one test (like adding an element or an event (trigger) listener) could accidentally affect the outcome of another which could cause the test to fail. Isolating/running a function that isolates the dom before each tests ensures that every test starts with a brand new, predictable DOM. InDOM provides a `createIsolatedDOM` test-helper api you can use for this task. 

### Isolated DOM Test - Example
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


2. Consider Real-World Testing: While testing in a production environment might sound scary, it can actually be valuable for DOM testing. This is because you'll see exactly how your code behaves in a real browser, which can help catch issues that might not show up in your test environment. Just be careful and make sure you have proper safeguards in place.

## Migration 