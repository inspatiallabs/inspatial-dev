import { SVG_NAMESPACE } from "../const.ts";
import { SVG_ELEMENTS } from "../const.ts";
import { DOMNode } from "../types.ts";

// DOM Renderer
export class DOMRenderer {
  private static instance: DOMRenderer;
  private eventListenersInitialized = false;

  private constructor() {
    this.setupEventDelegation();
  }

  static getInstance(): DOMRenderer {
    if (!DOMRenderer.instance) {
      DOMRenderer.instance = new DOMRenderer();
    }
    return DOMRenderer.instance;
  }

  private setupEventDelegation(): void {
    if (this.eventListenersInitialized) return;

    delegatedEvents.forEach((handlers, eventName) => {
      document.addEventListener(eventName, (e: Event) => {
        let target = e.target as HTMLElement;
        while (target && target !== document.body) {
          handlers.forEach(({ handler, element }) => {
            if (element === target) {
              handler(e);
            }
          });
          target = target.parentElement!;
        }
      });
    });

    this.eventListenersInitialized = true;
  }

  private delegate(
    eventName: string,
    handler: EventListener,
    element: HTMLElement
  ): void {
    if (!delegatedEvents.has(eventName)) {
      delegatedEvents.set(eventName, new Set());
    }
    delegatedEvents.get(eventName)?.add({ handler, element });
  }

  parseChild(child: any): Node {
    if (child == null || child === false) {
      return document.createTextNode("");
    }

    if (child instanceof Node) {
      return child;
    }

    if (Array.isArray(child)) {
      const fragment = document.createDocumentFragment();
      child.forEach((c) => fragment.appendChild(this.parseChild(c)));
      return fragment;
    }

    // Handle primitive types with strict type checking
    if (
      typeof child === "string" ||
      typeof child === "number" ||
      typeof child === "boolean"
    ) {
      return document.createTextNode(String(child));
    }

    // Default case for unknown types
    console.warn(`Unexpected child type: ${typeof child}`);
    return document.createTextNode(String(child));
  }

  setStyle(el: HTMLElement, styles: Record<string, any>): void {
    Object.entries(styles).forEach(([key, value]) => {
      if (value != null) {
        // Handle vendor prefixes
        if (key.startsWith("webkit")) {
          key = `-webkit-${key.slice(6)}`;
        } else if (key.startsWith("ms")) {
          key = `-ms-${key.slice(2)}`;
        } else {
          key = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        }
        el.style.setProperty(key, String(value));
      }
    });
  }

  handleProps(el: HTMLElement, props: Record<string, any> | null): void {
    if (!props) return;

    Object.entries(props).forEach(([key, value]) => {
      if (key === "style" && typeof value === "object") {
        this.setStyle(el, value);
        return;
      }

      if (key === "className") {
        if (typeof value === "string") {
          value
            .split(/\s+/)
            .filter(Boolean)
            .forEach((cls) => el.classList.add(cls));
        }
        return;
      }

      if (key === "ref" && typeof value === "function") {
        value(el);
        return;
      }

      if (key.startsWith("on") && typeof value === "function") {
        const eventName = key.slice(2).toLowerCase();
        this.delegate(eventName, value as EventListener, el);
        return;
      }

      // Type-safe boolean attribute handling
      if (typeof value === "boolean") {
        if (value) {
          el.setAttribute(key, "");
        } else {
          el.removeAttribute(key);
        }
        return;
      }

      // Safe attribute setting
      if (value != null) {
        el.setAttribute(key, String(value));
      }
    });
  }

  createElement(
    type: string | Function,
    props: Record<string, any> | null,
    ...children: any[]
  ): DOMNode {
    if (typeof type === "function") {
      const result = type({ ...props, children });
      if (!(result instanceof Node)) {
        throw new Error("Function components must return a valid DOM node");
      }
      return {
        type: "component",
        props: props || {},
        target: "dom",
        element: result,
      };
    }

    let element: Element;
    if (SVG_ELEMENTS.has(type)) {
      element = document.createElementNS(SVG_NAMESPACE, type);
    } else {
      element = document.createElement(type);
    }

    this.handleProps(element as HTMLElement, props);

    children.flat().forEach((child) => {
      if (child != null) {
        element.appendChild(this.parseChild(child));
      }
    });

    return {
      type,
      props: props || {},
      target: "dom",
      element,
    };
  }
}
