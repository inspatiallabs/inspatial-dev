// https://dom.spec.whatwg.org/#interface-htmlcollection

// @ts-ignore - Ignoring TS extension import error
import type {Element} from './element.ts';

/**
 * HTMLCollection implementation that provides both array-like numeric indexing and named access
 * @implements globalThis.HTMLCollection
 */
export class HTMLCollection extends Array<Element> {
  /**
   * Creates a new HTMLCollection
   */
  constructor() {
    super();
    return new Proxy(this, {
      get(target, name) {
        if (typeof name === 'string') {
          const index = parseInt(name, 10);
          if (!isNaN(index)) {
            return target[index]; // Support numeric indexing
          }
          
          // Support named indexing for valid property names
          if (name !== 'length' && name !== 'item' && name !== 'namedItem' &&
              typeof name === 'string' && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
            const namedItem = target.namedItem(name);
            if (namedItem) {
              return namedItem;
            }
          }
        }
        return target[name as keyof typeof target];
      }
    });
  }

  /**
   * Returns the first element with the specified value for the id or name attribute
   * @param name - The id or name to look for
   * @returns The found element or null
   */
  namedItem(name: string): Element | null {
    // Look for elements with matching id
    let element = this.find(el => el.id === name);
    if (element) {
      return element;
    }
    
    // If not found by id, look for elements with matching name
    element = this.find(el => el.getAttribute('name') === name);
    return element || null;
  }

  /**
   * Returns the element at the specified index
   * @param index - The index of the element to return
   * @returns The element at the specified index or null
   */
  item(index: number): Element | null {
    return this[index] || null;
  }
}