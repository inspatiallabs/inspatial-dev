// @ts-ignore - Ignoring TS extension import error
import { ELEMENT_NODE } from "../shared/constants.ts";
// @ts-ignore - Ignoring TS extension import error
import { END, NEXT, UPGRADE } from "../shared/symbols.ts";
// @ts-ignore - Ignoring TS extension import error
import { entries, setPrototypeOf } from "../shared/object.ts";
// @ts-ignore - Ignoring TS extension import error
import { shadowRoots } from "../shared/shadow-roots.ts";

let reactive = false;

export const Classes = new WeakMap();

export const customElements = new WeakMap();

export const attributeChangedCallback = (
  element: any,
  attributeName: string,
  oldValue: any,
  newValue?: any
): void => {
  if (
    reactive &&
    customElements.has(element) &&
    element.attributeChangedCallback &&
    element.constructor.observedAttributes.includes(attributeName)
  ) {
    element.attributeChangedCallback(attributeName, oldValue, newValue);
  }
};

const createTrigger =
  (method: string, isConnected: boolean) =>
  (element: any): void => {
    if (customElements.has(element)) {
      const info = customElements.get(element);
      if (
        info.connected !== isConnected &&
        element.isConnected === isConnected
      ) {
        info.connected = isConnected;
        if (method in element) element[method]();
      }
    }
  };

const triggerConnected = createTrigger("connectedCallback", true);
export const connectedCallback = (element: any): void => {
  if (reactive) {
    triggerConnected(element);
    if (shadowRoots.has(element)) {
      const entry = shadowRoots.get(element);
      if (entry && entry.shadowRoot) {
        element = entry.shadowRoot;
      }
    }
    // @ts-ignore - Symbol property access
    let { [NEXT]: next, [END]: end } = element;
    while (next !== end) {
      if (next.nodeType === ELEMENT_NODE) triggerConnected(next);
      // @ts-ignore - Symbol property access
      next = next[NEXT];
    }
  }
};

const triggerDisconnected = createTrigger("disconnectedCallback", false);
export const disconnectedCallback = (element: any): void => {
  if (reactive) {
    triggerDisconnected(element);
    if (shadowRoots.has(element)) {
      const entry = shadowRoots.get(element);
      if (entry && entry.shadowRoot) {
        element = entry.shadowRoot;
      }
    }
    // @ts-ignore - Symbol property access
    let { [NEXT]: next, [END]: end } = element;
    while (next !== end) {
      if (next.nodeType === ELEMENT_NODE) triggerDisconnected(next);
      // @ts-ignore - Symbol property access
      next = next[NEXT];
    }
  }
};

interface ElementInfo {
  Class: any;
  check: (element: any) => boolean;
}

interface ClassInfo {
  ownerDocument: any;
  options: {
    is: string;
  };
  localName: string;
}

/**
 * @implements globalThis.CustomElementRegistry
 */
export class CustomElementRegistry {
  /**
   * @private
   */
  private ownerDocument: any;

  /**
   * @private
   */
  private registry: Map<string, ElementInfo>;

  /**
   * @private
   */
  private waiting: Map<string, Array<(value: any) => void>>;

  /**
   * @private
   */
  private active: boolean;

  /**
   * @param {Document} ownerDocument
   */
  constructor(ownerDocument: any) {
    this.ownerDocument = ownerDocument;
    this.registry = new Map();
    this.waiting = new Map();
    this.active = false;
  }

  /**
   * @param {string} localName the custom element definition name
   * @param {Function} Class the custom element **Class** definition
   * @param {object?} options the optional object with an `extends` property
   */
  define(
    localName: string,
    Class: any,
    options: { extends?: string } = {}
  ): void {
    const { ownerDocument, registry, waiting } = this;

    if (registry.has(localName))
      throw new Error("unable to redefine " + localName);

    if (Classes.has(Class))
      throw new Error("unable to redefine the same class: " + Class);

    this.active = reactive = true;

    const { extends: extend } = options;

    Classes.set(Class, {
      ownerDocument,
      options: { is: extend ? localName : "" },
      localName: extend || localName,
    });

    const check = extend
      ? (element: any): boolean => {
          return (
            element.localName === extend &&
            element.getAttribute("is") === localName
          );
        }
      : (element: any): boolean => element.localName === localName;
    registry.set(localName, { Class, check });
    if (waiting.has(localName)) {
      const resolvers = waiting.get(localName);
      if (resolvers) {
        for (const resolve of resolvers) resolve(Class);
        waiting.delete(localName);
      }
    }
    ownerDocument
      .querySelectorAll(extend ? `${extend}[is="${localName}"]` : localName)
      .forEach(this.upgrade, this);
  }

  /**
   * @param {Element} element
   */
  upgrade(element: any): void {
    if (customElements.has(element)) return;
    const { ownerDocument, registry } = this;
    const ce = element.getAttribute("is") || element.localName;
    if (registry.has(ce)) {
      const info = registry.get(ce);
      if (info && info.check(element)) {
        const { Class } = info;
        const { attributes, isConnected } = element;
        for (const attr of attributes) element.removeAttributeNode(attr);

        const values = entries(element);
        for (const [key] of values) delete element[key];

        setPrototypeOf(element, Class.prototype);
        // @ts-ignore - Symbol property access
        ownerDocument[UPGRADE] = { element, values };
        new Class(ownerDocument, ce);

        customElements.set(element, { connected: isConnected });

        for (const attr of attributes) element.setAttributeNode(attr);

        if (isConnected && element.connectedCallback)
          element.connectedCallback();
      }
    }
  }

  /**
   * @param {string} localName the custom element definition name
   */
  whenDefined(localName: string): Promise<any> {
    const { registry, waiting } = this;
    return new Promise((resolve) => {
      if (registry.has(localName)) {
        const info = registry.get(localName);
        if (info) {
          resolve(info.Class);
        }
      } else {
        if (!waiting.has(localName)) waiting.set(localName, []);
        const waitList = waiting.get(localName);
        if (waitList) {
          waitList.push(resolve);
        }
      }
    });
  }

  /**
   * @param {string} localName the custom element definition name
   * @returns {Function?} the custom element **Class**, if any
   */
  get(localName: string): any | undefined {
    const info = this.registry.get(localName);
    return info && info.Class;
  }

  /**
   * @param {Function} Class **Class** of custom element
   * @returns {string?} found tag name or null
   */
  getName(Class: any): string | null {
    if (Classes.has(Class)) {
      const info = Classes.get(Class) as ClassInfo;
      return info.localName;
    }
    return null;
  }
}
