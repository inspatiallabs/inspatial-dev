import { SVG_NAMESPACE } from "../../const.ts";
import { SVG_ELEMENTS } from "../../const.ts";
import { DOMNode } from "../../types.ts";
import { InSpatialDOM } from "./dom.ts";

const { Node, Document, Element } = InSpatialDOM;
// Don't destructure DOMParser to avoid type conflicts

const delegatedEvents = new Map<
  string,
  Set<{
    handler: EventListener;
    element: Element;
  }>
>();

export class DOMRenderer {
  private static instance: DOMRenderer;
  private document: Document;
  private parser: any; // Use any type to bypass type checking
  private eventListenersInitialized = false;

  private constructor(html = "") {
    /** Initialize parser with any type to bypass type checking */
    this.parser = new InSpatialDOM.DOMParser();

    /** Parse HTML and cast result to Document */
    const docHtml = html || "<!DOCTYPE html><html><body></body></html>";
    this.document = this.parser.parseFromString(
      docHtml,
      "text/html"
    ) as Document;
  }

  static getInstance(html = ""): DOMRenderer {
    if (!DOMRenderer.instance) {
      DOMRenderer.instance = new DOMRenderer(html);
    }
    return DOMRenderer.instance;
  }

  private setupEventDelegation(): void {
    if (this.eventListenersInitialized) return;

    // Add a method to the document to simulate triggering events in a test environment
    (this.document as any).triggerEvent = (
      element: Element,
      eventName: string
    ) => {
      const handlers = delegatedEvents.get(eventName);
      if (!handlers) return;

      for (const { handler, element: targetElement } of handlers) {
        if (element === targetElement) {
          // Create a simple mock event
          const mockEvent = {
            type: eventName,
            target: element,
            currentTarget: element,
            preventDefault: () => {},
            stopPropagation: () => {},
          };

          handler.call(element, mockEvent as unknown as Event);
        }
      }
    };

    this.eventListenersInitialized = true;
  }

  private delegate(
    eventName: string,
    handler: EventListener,
    element: Element
  ): void {
    if (!delegatedEvents.has(eventName)) {
      delegatedEvents.set(eventName, new Set());
    }
    delegatedEvents.get(eventName)?.add({ handler, element });

    // In Deno, we're storing event handlers but not actually attaching them
    // since it's primarily for SSR. For client-hydration, we'd need to
    // serialize these for later attachment.
    element.setAttribute(`data-event-${eventName}`, "true");
  }

  parseChild(child: unknown): Node {
    if (child == null || typeof child === "boolean") {
      return this.document.createTextNode("");
    }

    // Replace instanceof Node check with property check
    if (child && typeof child === "object" && "nodeType" in (child as any)) {
      return child as Node;
    }

    if (Array.isArray(child)) {
      const fragment = this.document.createDocumentFragment();
      child.forEach((c) => {
        const parsed = this.parseChild(c);
        if (parsed) fragment.appendChild(parsed);
      });
      return fragment;
    }

    return this.document.createTextNode(String(child));
  }

  setStyle(el: Element, styles: Record<string, unknown>): void {
    let styleString = "";

    Object.entries(styles).forEach(([key, value]) => {
      if (value != null) {
        const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        styleString += `${cssKey}: ${String(value)}; `;
      }
    });

    el.setAttribute("style", styleString.trim());
  }

  handleProps(el: Element, props: Record<string, any> | null): void {
    if (!props) return;

    Object.entries(props).forEach(([key, value]) => {
      if (key === "style" && typeof value === "object") {
        this.setStyle(el, value);
        return;
      }

      if (key === "className") {
        el.setAttribute("class", String(value));
        return;
      }

      if (key === "ref" && typeof value === "function") {
        value(el);
        return;
      }

      if (key.startsWith("on") && typeof value === "function") {
        const eventName = key.slice(2).toLowerCase();
        this.delegate(eventName, value, el);
        return;
      }

      if (typeof value === "boolean") {
        value ? el.setAttribute(key, "") : el.removeAttribute(key);
        return;
      }

      if (value != null) {
        el.setAttribute(key, String(value));
      }
    });
  }

  // Fix for the createElement method to properly handle function components
  // The issue is that we need to always mark function component results as "component" type

  createElement(
    type: string | Function,
    props: Record<string, any> | null = null,
    ...children: any[]
  ): DOMNode {
    if (typeof type === "function") {
      const result = type({ ...props, children });

      // Check if the result is already a complete DOMNode
      if (result && typeof result === "object" && "element" in result) {
        // Always wrap in a component type, even if the result is already a DOMNode
        return {
          type: "component", // This ensures type is "component", not the original type
          props: props || {},
          element: (result as DOMNode).element,
          target: "dom",
        };
      }

      // If the result is just an Element, wrap it in a DOMNode
      if (
        result &&
        typeof result === "object" &&
        "nodeType" in (result as any)
      ) {
        return {
          type: "component",
          props: props || {},
          element: result as Element,
          target: "dom",
        };
      }

      // If we reached here, the component didn't return a valid value
      throw new Error("Function components must return a valid DOM node");
    }

    // Handle regular elements
    let element: Element;

    if (SVG_ELEMENTS.has(type)) {
      // For SVG elements in Deno, we need a different approach
      // Create a container for the SVG content
      const svgContainer = this.document.createElement("div");
      svgContainer.innerHTML = `<svg xmlns="${SVG_NAMESPACE}"><${type}></${type}></svg>`;
      const svgRoot = svgContainer.firstChild as Element;
      element = svgRoot.firstChild as Element;

      // Extract the element from its container
      svgRoot.removeChild(element);
    } else {
      element = this.document.createElement(type);
    }

    this.handleProps(element, props);

    children.flat().forEach((child) => {
      if (child != null) {
        const parsedChild = this.parseChild(child);
        if (parsedChild) {
          element.appendChild(parsedChild);
        }
      }
    });

    return {
      type,
      props: props || {},
      element,
      target: "dom",
    };
  }

  // Add render method for mounting
  render(node: DOMNode, container: Element | string): void {
    let target: Element;

    if (typeof container === "string") {
      const found = this.document.querySelector(container);
      if (!found) throw new Error(`Container ${container} not found`);
      target = found;
    } else {
      target = container;
    }

    target.appendChild(node.element);

    this.setupEventDelegation();
  }

  // SSR capabilities
  serialize(): string {
    return `<!DOCTYPE html>${this.document.documentElement.outerHTML}`;
  }
}

// Singleton instance export
export const renderer = DOMRenderer.getInstance();
