import {
  bind,
  nextTick,
  isSignal,
  peek,
  type Signal,
} from "@in/teract/signal-lite";
import { isProduction, splitFirst } from "../constant/index.ts";
import { createRenderer } from "./index.ts";

//NOTE: This is currently coupling the DOM renderer with the trigger system.
//TODO(@benemma): Refactor this to decouple the DOM renderer from the trigger system i.e use InSpatial Trigger System from @in/teract

/*#################################(Types)#################################*/

/** DOM renderer configuration options */
interface DOMRendererConfig {
  /** Unique identifier for this renderer instance */
  rendererID?: string;
  /** Document object to use for DOM operations */
  doc?: Document;
  /** Namespace URI mappings */
  namespaces?: Record<string, string>;
  /** Tag name to namespace mappings */
  tagNamespaceMap?: Record<string, string>;
  /** Tag name aliases for element creation */
  tagAliases?: Record<string, string>;
  /** Property name aliases for attribute setting */
  propAliases?: Record<string, string>;
  /** Custom directive handler function */
  onDirective?: (
    prefix: string,
    key: string,
    prop: string
  ) => PropSetterType | undefined;
}

/** Trigger types (event listners) */
interface TriggerTypes {
  passive?: boolean;
  once?: boolean;
  capture?: boolean;
  [key: string]: boolean | undefined;
}

/** Property setter function type */
type PropSetterType = (node: Element, value: any) => void;

/** Event listener adder function type */
type ListenerAdderType = (node: Element, callback: any) => void;

/** Node creator function type */
type NodeCreatorType = () => Element;

/** Cached function type for string keys */
type CachedFunctionType<T> = (key: string) => T;

/*#################################(Constants)#################################*/

/*
const NODE_TYPES = {
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  TEXT_NODE: 3,
  CDATA_SECTION_NODE: 4,
  ENTITY_REFERENCE_NODE: 5,
  PROCESSING_INSTRUCTION_NODE: 7,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_FRAGMENT_NODE: 11
}
*/

/*
Apply order:
1. Get namespace
2. Get alias
3. Create with namespace
*/

export const defaultRendererID = "DOM";

/*#################################(Utilities)#################################*/

/** No-operation function */
function nop(): void {}

/** Creates a cached function with string keys that doesn't cache falsy values */
function cachedStrKeyNoFalsy<T>(fn: (key: string) => T): CachedFunctionType<T> {
  const cache = new Map<string, T>();
  return function (key: string): T {
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const result = fn(key);
    if (result) {
      cache.set(key, result);
    }
    return result;
  };
}

/*#################################(DOM Renderer)#################################*/

export function DOMRenderer({
  rendererID = defaultRendererID,
  doc = document,
  namespaces = {},
  tagNamespaceMap = {},
  tagAliases = {},
  propAliases = {},
  onDirective = () => undefined,
}: DOMRendererConfig = {}): any {
  let eventPassiveSupported = false;
  let eventOnceSupported = false;

  try {
    const options = {
      passive: {
        get(): boolean {
          eventPassiveSupported = true;
          return eventPassiveSupported;
        },
      },
      once: {
        get(): boolean {
          eventOnceSupported = true;
          return eventOnceSupported;
        },
      },
    };
    const testEvent = "__inspatial_trigger_test__";
    (doc as any).addEventListener(testEvent, nop, options);
    (doc as any).removeEventListener(testEvent, nop, options);
  } catch (e) {
    // do nothing
  }

  function eventCallbackFallback(
    node: Element,
    event: string,
    handler: EventListener,
    options: TriggerTypes
  ): EventListener {
    if (options.once && !eventOnceSupported) {
      const originalHandler = handler;
      handler = function (this: any, ...args: any[]): any {
        originalHandler.call(this, ...(args as [Event]));
        node.removeEventListener(event, handler, options);
      };
    }
    if (options.passive && !eventPassiveSupported) {
      const originalHandler = handler;
      handler = function (this: any, ...args: any[]): any {
        nextTick(() => originalHandler.call(this, ...(args as [Event])));
      };
    }

    return handler;
  }

  function isNode(node: any): node is Node {
    return !!(node && node.cloneNode);
  }

  const getNodeCreatorType: CachedFunctionType<NodeCreatorType> =
    cachedStrKeyNoFalsy(function (tagNameRaw: string): NodeCreatorType {
      let [nsuri, tagName] = tagNameRaw.split(":");
      if (!tagName) {
        tagName = nsuri;
        nsuri = tagNamespaceMap[tagName];
      }
      tagName = tagAliases[tagName] || tagName;
      if (nsuri) {
        nsuri = namespaces[nsuri] || nsuri;
        return function (): Element {
          return doc.createElementNS(nsuri, tagName);
        };
      }
      return function (): Element {
        return doc.createElement(tagName);
      };
    });

  function createNode(tagName: string): Element {
    return getNodeCreatorType(tagName)();
  }

  function createAnchor(anchorName?: string): Comment | Text {
    if (!isProduction && anchorName) {
      return doc.createComment(anchorName);
    }
    return doc.createTextNode("");
  }

  function createTextNode(text: string | Signal<any>): Text {
    if (isSignal(text)) {
      const node = doc.createTextNode("");
      text.connect(function (): void {
        const newData = peek(text);
        if (newData === undefined) node.data = "";
        else node.data = String(newData);
      });
      return node;
    }

    return doc.createTextNode(String(text));
  }

  function createFragment(): DocumentFragment {
    return doc.createDocumentFragment();
  }

  function removeNode(node: Node): void {
    if (!node.parentNode) return;
    node.parentNode.removeChild(node);
  }

  function appendNode(parent: Node, ...nodes: Node[]): void {
    for (let node of nodes) {
      parent.insertBefore(node, null);
    }
  }

  function insertBefore(node: Node, ref: Node): void {
    if (ref.parentNode) {
      ref.parentNode.insertBefore(node, ref);
    }
  }

  const getListenerAdderType: CachedFunctionType<ListenerAdderType> =
    cachedStrKeyNoFalsy(function (event: string): ListenerAdderType {
      const [prefix, eventName] = event.split(":");
      if (prefix === "on") {
        return function (node: Element, cb: any): void {
          if (!cb) return;
          if (isSignal(cb)) {
            let currentHandler: EventListener | null = null;
            cb.connect(function (): void {
              const newHandler = peek(cb);
              if (currentHandler)
                node.removeEventListener(eventName, currentHandler);
              if (newHandler) node.addEventListener(eventName, newHandler);
              currentHandler = newHandler;
            });
          } else node.addEventListener(eventName, cb);
        };
      } else {
        const optionsArr = prefix.split("-");
        optionsArr.shift();
        const options: TriggerTypes = {};
        for (let option of optionsArr) if (option) options[option] = true;
        return function (node: Element, cb: any): void {
          if (!cb) return;
          if (isSignal(cb)) {
            let currentHandler: EventListener | null = null;
            cb.connect(function (): void {
              let newHandler = peek(cb);
              if (currentHandler)
                node.removeEventListener(eventName, currentHandler, options);
              if (newHandler) {
                newHandler = eventCallbackFallback(
                  node,
                  eventName,
                  newHandler,
                  options
                );
                node.addEventListener(eventName, newHandler, options);
              }
              currentHandler = newHandler;
            });
          } else
            node.addEventListener(
              eventName,
              eventCallbackFallback(node, eventName, cb, options),
              options
            );
        };
      }
    });

  function addListener(node: Element, event: string, cb: any): void {
    getListenerAdderType(event)(node, cb);
  }

  function setAttr(node: Element, attr: string, val: any): void {
    if (val === undefined || val === null || val === false) return;

    function handler(newVal: any): void {
      if (newVal === undefined || newVal === null || newVal === false)
        node.removeAttribute(attr);
      else if (newVal === true) node.setAttribute(attr, "");
      else node.setAttribute(attr, String(newVal));
    }

    bind(handler, val);
  }

  function setAttrNS(node: Element, attr: string, val: any, ns: string): void {
    if (val === undefined || val === null || val === false) return;

    function handler(newVal: any): void {
      if (newVal === undefined || newVal === null || newVal === false)
        node.removeAttributeNS(ns, attr);
      else if (newVal === true) node.setAttributeNS(ns, attr, "");
      else node.setAttributeNS(ns, attr, String(newVal));
    }

    bind(handler, val);
  }

  const getPropSetterType: CachedFunctionType<PropSetterType> =
    cachedStrKeyNoFalsy(function (prop: string): PropSetterType {
      prop = propAliases[prop] || prop;
      const [prefix, key] = splitFirst(prop, ":");
      if (key) {
        switch (prefix) {
          default: {
            if (prefix === "on" || prefix.startsWith("on-")) {
              return function (node: Element, val: any): void {
                return addListener(node, prop, val);
              };
            }
            if (onDirective) {
              const setter = onDirective(prefix, key, prop);
              if (setter) {
                return setter;
              }
            }
            const nsuri = namespaces[prefix] || prefix;
            return function (node: Element, val: any): void {
              return setAttrNS(node, key, val, nsuri);
            };
          }
          case "attr": {
            return function (node: Element, val: any): void {
              return setAttr(node, key, val);
            };
          }
          case "prop": {
            prop = key;
          }
        }
      } else if (prop.indexOf("-") > -1) {
        return function (node: Element, val: any): void {
          return setAttr(node, prop, val);
        };
      }

      return function (node: Element, val: any): void {
        if (val === undefined || val === null) return;
        if (isSignal(val)) {
          val.connect(function (): void {
            (node as any)[prop] = peek(val);
          });
        } else {
          (node as any)[prop] = val;
        }
      };
    });

  function setProps(node: Element, props: Record<string, any>): void {
    for (let prop in props) getPropSetterType(prop)(node, props[prop]);
  }

  const nodeOps = {
    isNode,
    createNode,
    createAnchor,
    createTextNode,
    createFragment,
    setProps,
    insertBefore,
    appendNode,
    removeNode,
  };

  return createRenderer(nodeOps, rendererID);
}
