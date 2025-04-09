import { performance } from "../../commonjs/perf_hooks.cjs";

// @ts-ignore - Ignoring TS extension import error
import {
  DOCUMENT_NODE,
  DOCUMENT_FRAGMENT_NODE,
  DOCUMENT_TYPE_NODE,
  ELEMENT_NODE,
  TEXT_NODE,
  SVG_NAMESPACE,
} from "../shared/constants.ts";

// @ts-ignore - Ignoring TS extension import error
import {
  CUSTOM_ELEMENTS,
  DOM_PARSER,
  GLOBALS,
  IMAGE,
  MUTATION_OBSERVER,
  DOCTYPE,
  END,
  NEXT,
  MIME,
  EVENT_TARGET,
  UPGRADE,
} from "../shared/symbols.ts";

// @ts-ignore - Ignoring TS extension import error
import { Facades, illegalConstructor } from "../shared/facades.ts";
// @ts-ignore - Ignoring TS extension import error
import { DOMClasses } from "../shared/html-classes.ts";
// @ts-ignore - Ignoring TS extension import error
import { Mime } from "../shared/mime.ts";
// @ts-ignore - Ignoring TS extension import error
import { knownSiblings } from "../shared/util/utils.ts";
// @ts-ignore - Ignoring TS extension import error
import {
  assign,
  create,
  defineProperties,
  setPrototypeOf,
} from "../shared/object.ts";

// @ts-ignore - Ignoring TS extension import error
import { NonElementParentNode } from "../mixin/non-element-parent-node.ts";

// @ts-ignore - Ignoring TS extension import error
import { SVGElement } from "../svg/element.ts";

// @ts-ignore - Ignoring TS extension import error
import { Attr } from "./attr.ts";
// @ts-ignore - Ignoring TS extension import error
import { CDATASection } from "./cdata-section.ts";
// @ts-ignore - Ignoring TS extension import error
import { Comment } from "./comment.ts";
// @ts-ignore - Ignoring TS extension import error
import { CustomElementRegistry } from "./custom-element-registry.ts";
// @ts-ignore - Ignoring TS extension import error
import { CustomEvent } from "./custom-event.ts";
// @ts-ignore - Ignoring TS extension import error
import { DocumentFragment } from "./document-fragment.ts";
// @ts-ignore - Ignoring TS extension import error
import { DocumentType } from "./document-type.ts";
// @ts-ignore - Ignoring TS extension import error
import { Element } from "./element.ts";
// @ts-ignore - Ignoring TS extension import error
import { Event } from "./event.ts";
// @ts-ignore - Ignoring TS extension import error
import { EventTarget } from "./event-target.ts";
// @ts-ignore - Ignoring TS extension import error
import { InputEvent } from "./input-event.ts";
// @ts-ignore - Ignoring TS extension import error
import { ImageClass } from "./image.ts";
// @ts-ignore - Ignoring TS extension import error
import { MutationObserverClass } from "./mutation-observer.ts";
// @ts-ignore - Ignoring TS extension import error
import { NamedNodeMap } from "./named-node-map.ts";
// @ts-ignore - Ignoring TS extension import error
import { NodeList } from "./node-list.ts";
// @ts-ignore - Ignoring TS extension import error
import { Range } from "./range.ts";
// @ts-ignore - Ignoring TS extension import error
import { Text } from "./text.ts";
// @ts-ignore - Ignoring TS extension import error
import { TreeWalker } from "./tree-walker.ts";

const query = (method: Function, ownerDocument: any, selectors: string) => {
  let { [NEXT]: next, [END]: end } = ownerDocument;
  return method.call({ ownerDocument, [NEXT]: next, [END]: end }, selectors);
};

const globalExports = assign({}, Facades, DOMClasses, {
  CustomEvent,
  Event,
  EventTarget,
  InputEvent,
  NamedNodeMap,
  NodeList,
});

const window = new WeakMap();

/**
 * @implements globalThis.Document
 */
export class Document extends NonElementParentNode {
  constructor(type: string) {
    super(null, "#document", DOCUMENT_NODE);
    (this as any)[CUSTOM_ELEMENTS] = { active: false, registry: null };
    (this as any)[MUTATION_OBSERVER] = {
      active: false,
      class: null,
      observers: new Set(),
    };
    // Set default MIME type to text/html when type is empty
    if (type === "") {
      type = "text/html";
    }
    (this as any)[MIME] = Mime[type as keyof typeof Mime] || Mime["text/html"];
    /** @type {DocumentType} */
    (this as any)[DOCTYPE] = null;
    (this as any)[DOM_PARSER] = null;
    (this as any)[GLOBALS] = null;
    (this as any)[IMAGE] = null;
    (this as any)[UPGRADE] = null;
  }

  /**
   * @type {globalThis.Document['defaultView']}
   */
  get defaultView() {
    if (!window.has(this))
      window.set(
        this,
        new Proxy(globalThis, {
          set: (target, name, value) => {
            switch (name) {
              case "addEventListener":
              case "removeEventListener":
              case "dispatchEvent":
                (this as any)[EVENT_TARGET][name] = value;
                break;
              default:
                // @ts-ignore - Dynamic property access on globalThis
                target[name] = value;
                break;
            }
            return true;
          },
          get: (globalThis, name) => {
            switch (name) {
              case "addEventListener":
              case "removeEventListener":
              case "dispatchEvent":
                if (!(this as any)[EVENT_TARGET]) {
                  const et = ((this as any)[EVENT_TARGET] = new EventTarget());
                  et.dispatchEvent = et.dispatchEvent.bind(et);
                  et.addEventListener = et.addEventListener.bind(et);
                  et.removeEventListener = et.removeEventListener.bind(et);
                }
                return (this as any)[EVENT_TARGET][name];
              case "document":
                return this;
              /* c8 ignore start */
              case "navigator":
                return {
                  userAgent:
                    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36",
                };
              /* c8 ignore stop */
              case "window":
                return window.get(this);
              case "customElements":
                if (!(this as any)[CUSTOM_ELEMENTS].registry)
                  (this as any)[CUSTOM_ELEMENTS] = new CustomElementRegistry(
                    this
                  );
                return (this as any)[CUSTOM_ELEMENTS];
              case "performance":
                return performance;
              case "DOMParser":
                return (this as any)[DOM_PARSER];
              case "Image":
                if (!(this as any)[IMAGE])
                  (this as any)[IMAGE] = ImageClass(this);
                return (this as any)[IMAGE];
              case "MutationObserver":
                if (!(this as any)[MUTATION_OBSERVER].class)
                  (this as any)[MUTATION_OBSERVER] = new MutationObserverClass(
                    this
                  );
                return (this as any)[MUTATION_OBSERVER].class;
            }
            // @ts-ignore - Dynamic property access on globalThis and globalExports
            return (
              ((this as any)[GLOBALS] && (this as any)[GLOBALS][name]) ||
              (globalExports as any)[name] ||
              (globalThis as any)[name]
            );
          },
        })
      );
    return window.get(this);
  }

  get doctype() {
    const docType = (this as any)[DOCTYPE];
    if (docType) return docType;
    const { firstChild } = this;
    if (firstChild && firstChild.nodeType === DOCUMENT_TYPE_NODE)
      return ((this as any)[DOCTYPE] = firstChild);
    return null;
  }

  set doctype(value) {
    if (
      /^([a-z:]+)(\s+system|\s+public(\s+"([^"]+)")?)?(\s+"([^"]+)")?/i.test(
        value
      )
    ) {
      const { $1: name, $4: publicId, $6: systemId } = RegExp;
      (this as any)[DOCTYPE] = new DocumentType(this, name, publicId, systemId);
      knownSiblings(this, (this as any)[DOCTYPE], (this as any)[NEXT]);
    }
  }

  get documentElement() {
    // Check if there's an existing HTML element
    const html = this.firstElementChild;

    // If no HTML element exists, create one
    if (!html) {
      const htmlElement = this.createElement("html");
      this.appendChild(htmlElement);
      return htmlElement;
    }

    return html;
  }

  /**
   * Gets the head element of the document
   * @returns The head element or null if not found
   */
  get head() {
    const documentElement = this.documentElement;
    if (!documentElement) return null;

    // Look for existing head element
    let head = null;
    for (let i = 0; i < documentElement.childNodes.length; i++) {
      const child = documentElement.childNodes[i];
      if (child.nodeType === ELEMENT_NODE && child.nodeName === "HEAD") {
        head = child;
        break;
      }
    }

    // If head doesn't exist, create it
    if (!head) {
      head = this.createElement("head");
      documentElement.appendChild(head);
    }

    return head;
  }

  /**
   * Gets the body element of the document
   * @returns The body element or null if not found
   */
  get body() {
    const documentElement = this.documentElement;
    if (!documentElement) return null;

    // Look for existing body element
    let body = null;
    for (let i = 0; i < documentElement.childNodes.length; i++) {
      const child = documentElement.childNodes[i];
      if (child.nodeType === ELEMENT_NODE && child.nodeName === "BODY") {
        body = child;
        break;
      }
    }

    // If body doesn't exist, create it
    if (!body) {
      body = this.createElement("body");
      documentElement.appendChild(body);
    }

    return body;
  }

  override get isConnected() {
    return true;
  }

  /**
   * @protected
   */
  override _getParent() {
    return (this as any)[EVENT_TARGET];
  }

  createAttribute(name: string) {
    return new Attr(this, name);
  }
  createCDATASection(data: string) {
    return new CDATASection(this, data);
  }
  createComment(textContent: string) {
    return new Comment(this, textContent);
  }
  createDocumentFragment() {
    return new DocumentFragment(this);
  }
  createDocumentType(name: string, publicId: string, systemId: string) {
    return new DocumentType(this, name, publicId, systemId);
  }
  createElement(localName: string) {
    return new Element(this, localName);
  }
  createRange() {
    const range = new Range();
    range.commonAncestorContainer = this;
    return range;
  }
  createTextNode(textContent: string) {
    return new Text(this, textContent);
  }
  createTreeWalker(root: any, whatToShow: number = -1) {
    return new TreeWalker(root, whatToShow);
  }
  createNodeIterator(root: any, whatToShow: number = -1) {
    return this.createTreeWalker(root, whatToShow);
  }

  createEvent(name: string) {
    const event = create(
      name === "Event" ? new Event("") : new CustomEvent("")
    );
    event.initEvent = event.initCustomEvent = (
      type: string,
      canBubble = false,
      cancelable = false,
      detail: any
    ) => {
      event.bubbles = !!canBubble;

      defineProperties(event, {
        type: { value: type },
        canBubble: { value: canBubble },
        cancelable: { value: cancelable },
        detail: { value: detail },
      });
    };
    return event;
  }

  override cloneNode(deep = false) {
    const {
      constructor,
      [CUSTOM_ELEMENTS]: customElements,
      [DOCTYPE]: doctype,
    } = this as any;
    const document = new constructor();
    (document as any)[CUSTOM_ELEMENTS] = customElements;
    if (deep) {
      const end = (document as any)[END];
      const { childNodes } = this;
      for (let { length } = childNodes, i = 0; i < length; i++)
        document.insertBefore(childNodes[i].cloneNode(true), end);
      if (doctype) (document as any)[DOCTYPE] = childNodes[0];
    }
    return document;
  }

  importNode(externalNode: Node | Element, deep = false) {
    // Modified to properly handle deep parameter
    const node = externalNode.cloneNode(deep);
    const { [CUSTOM_ELEMENTS]: customElements } = this as any;
    const { active } = customElements;
    const upgrade = (element: any) => {
      const { ownerDocument, nodeType } = element;
      element.ownerDocument = this;
      if (active && ownerDocument !== this && nodeType === ELEMENT_NODE)
        customElements.upgrade(element);
    };
    upgrade(node);
    if (deep) {
      switch (node.nodeType) {
        case ELEMENT_NODE:
        case DOCUMENT_FRAGMENT_NODE: {
          // @ts-ignore - Symbol properties used as index types
          let { [NEXT]: next, [END]: end } = node;
          while (next !== end) {
            if (next.nodeType === ELEMENT_NODE) upgrade(next);
            next = next[NEXT];
          }
          break;
        }
      }
    }
    return node;
  }

  /**
   * Adopts a node from another document, removing it from that document and placing it in this one
   * @param node - The node to adopt
   * @returns The adopted node
   */
  adoptNode(node: Node | Element): Node | Element {
    const oldDoc = node.ownerDocument;
    // Only proceed if the node has an ownerDocument and it's different from current document
    if (oldDoc && oldDoc !== null) {
      const isSameDocument = Object.is(oldDoc, this);
      if (!isSameDocument) {
        // Remove the node from its old document if it has a parent
        if (node.parentNode) {
          (node as any).parentNode.removeChild(node);
        }

        // Set the ownerDocument property
        (node as any).ownerDocument = this;

        // If the node is an element, also update its children
        if (node.nodeType === ELEMENT_NODE) {
          // Recursively update ownerDocument for all child nodes
          const walkChildren = (parent: any) => {
            let { [NEXT]: next, [END]: end } = parent;
            while (next !== end) {
              if (
                next.nodeType === ELEMENT_NODE ||
                next.nodeType === TEXT_NODE
              ) {
                (next as any).ownerDocument = this;

                // Process children of elements recursively
                if (next.nodeType === ELEMENT_NODE) {
                  walkChildren(next);
                }
              }
              next = next[NEXT];
            }
          };

          walkChildren(node);

          // Upgrade custom elements if necessary
          const { [CUSTOM_ELEMENTS]: customElements } = this as any;
          if (customElements.active) {
            customElements.upgrade(node);
          }
        }
      }
    }

    return node;
  }

  override toString() {
    return this.childNodes.join("");
  }

  override querySelector(selectors: string) {
    return query(super.querySelector, this, selectors);
  }

  override querySelectorAll(selectors: string) {
    return query(super.querySelectorAll, this, selectors);
  }

  /* c8 ignore start */
  getElementsByTagNameNS(_: string, name: string) {
    return this.getElementsByTagName(name);
  }
  createAttributeNS(_: string, name: string) {
    return this.createAttribute(name);
  }
  createElementNS(nsp: string | null, localName: string, options?: any) {
    // For SVG namespace, use SVGElement and preserve case
    if (nsp === SVG_NAMESPACE) {
      // SVGElement constructor needs (ownerDocument, localName, namespace)
      return new (SVGElement as any)(this, localName, nsp);
    }
    // For other namespaces, use regular createElement
    return this.createElement(localName);
  }
  /* c8 ignore stop */
}

setPrototypeOf(
  // @ts-ignore - Dynamic property assignment
  (globalExports.Document = function Document() {
    illegalConstructor();
  }),
  Document
).prototype = Document.prototype;
