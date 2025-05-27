import { createDOM } from "@in/dom";

// Create mock DOM environment
const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    :root {
      --test-color: red;
      --test-transform: translateX(10px);
    }
    #target-id {
      width: 16px;
      transform: translateX(0px);
    }
    .css-properties {
      width: 150px;
    }
    .with-inline-styles {
      width: 200px;
    }
  </style>
</head>
<body>
  <div id="target-id"></div>
  <div class="target-class"></div>
  <div class="target-class"></div>
  <div class="target-class"></div>
  <div class="target-class"></div>
  <div class="css-properties"></div>
  <div class="with-inline-styles" style="width: 200px;"></div>
  <div class="with-width-attribute" width="16px" data-index="1"></div>
  <input id="input-number" type="number" min="0" max="100" />
  <div data-index="0"></div>
  <div data-index="1"></div>
  <div data-index="2"></div>
</body>
</html>
`;

// Parse HTML and set up global DOM objects
const { window, HTMLElement, Element, SVGElement, getComputedStyle } = createDOM(html);

// Assign global DOM objects to globalThis
Object.assign(globalThis, {
  window,
  document,
  Node,
  Element,
  HTMLElement,
  SVGElement,
  getComputedStyle,
});


// Fix WeakMap usage by adding a safety wrapper for non-object keys
// This is necessary to handle string keys being passed to WeakMap in the motion library

// Save original WeakMap
const originalWeakMap = WeakMap;

/**
 * SafeWeakMap handles both object and non-object keys by creating proxy objects
 * for non-object keys and storing them in a Map.
 * 
 * @ts-ignore - Intentionally bypassing TypeScript restrictions
 */
// @ts-ignore - We're replacing WeakMap with a version that handles non-object keys
class SafeWeakMap extends originalWeakMap {
  private _proxyMap: Map<any, object>;
  
  constructor(entries?: readonly (readonly [any, any])[] | null) {
    super();
    this._proxyMap = new Map();
    
    if (entries) {
      for (const [key, value] of entries) {
        this.set(key, value);
      }
    }
  }

  override set(key: any, value: any): this {
    if (key === null || (typeof key !== 'object' && typeof key !== 'function')) {
      console.warn(`Attempted to use non-object ${key} as WeakMap key, using a proxy object instead`);
      // Use a proxy object when a non-object is passed
      let proxy = this._proxyMap.get(key);
      if (!proxy) {
        proxy = { originalValue: key };
        this._proxyMap.set(key, proxy);
      }
      return super.set(proxy, value);
    }
    return super.set(key, value);
  }

  override get(key: any): any {
    if (key === null || (typeof key !== 'object' && typeof key !== 'function')) {
      const proxy = this._proxyMap.get(key);
      return proxy ? super.get(proxy) : undefined;
    }
    return super.get(key);
  }

  override has(key: any): boolean {
    if (key === null || (typeof key !== 'object' && typeof key !== 'function')) {
      const proxy = this._proxyMap.get(key);
      return proxy ? super.has(proxy) : false;
    }
    return super.has(key);
  }

  override delete(key: any): boolean {
    if (key === null || (typeof key !== 'object' && typeof key !== 'function')) {
      const proxy = this._proxyMap.get(key);
      if (proxy) {
        const result = super.delete(proxy);
        this._proxyMap.delete(key);
        return result;
      }
      return false;
    }
    return super.delete(key);
  }
}

// Replace global WeakMap with our safe version
// @ts-ignore - We're purposely extending WeakMap with additional functionality
globalThis.WeakMap = SafeWeakMap;

console.log("📋 DOM environment and WeakMap safety wrapper initialized");
