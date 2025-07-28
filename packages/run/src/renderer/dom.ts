import { isSignal, nextTick, peek, bind } from "../signal.ts";
import { createRenderer } from "./create-renderer.ts";
import { nop, cachedStrKeyNoFalsy, splitFirst } from "../utils.ts";
import { env } from "../env/index.ts";
import { wrap } from "../runtime/jsx-runtime.ts";

const defaultRendererID = "DOM";

export interface DOMRendererOptions {
  rendererID?: string;
  doc?: Document;
  namespaces?: Record<string, string>;
  tagNamespaceMap?: Record<string, string>;
  tagAliases?: Record<string, string>;
  propAliases?: Record<string, string>;
  onDirective?: (prefix: string, key: string, prop: string) => any;
}

export function DOMRenderer(options: DOMRendererOptions = {}) {
  const {
    rendererID = defaultRendererID,
    doc = document,
    namespaces = {},
    tagNamespaceMap = {},
    tagAliases = {},
    propAliases = {},
    onDirective,
  } = options;

  let eventPassiveSupported = false;
  let eventOnceSupported = false;

  try {
    const options = {
      passive: {
        get() {
          eventPassiveSupported = true;
          return eventPassiveSupported;
        },
      },
      once: {
        get() {
          eventOnceSupported = true;
          return eventOnceSupported;
        },
      },
    };
    const testEvent = "__refui_event_option_test__";
    doc.addEventListener(testEvent, nop, options);
    doc.removeEventListener(testEvent, nop, options);
  } catch (e) {
    // do nothing
  }

  // eslint-disable-next-line max-params
  function eventCallbackFallback(
    node: any,
    event: string,
    handler: Function,
    options: any
  ): Function {
    if (options.once && !eventOnceSupported) {
      const _handler = handler;
      handler = function (...args: any[]) {
        _handler(...args);
        node.removeEventListener(event, handler, options);
      };
    }
    if (options.passive && !eventPassiveSupported) {
      const _handler = handler;
      handler = function (...args: any[]) {
        nextTick(_handler.bind(null, ...args));
      };
    }

    return handler;
  }

  function isNode(node: any): boolean {
    return !!(node && node.cloneNode);
  }

  const getNodeCreator = cachedStrKeyNoFalsy(function (tagNameRaw: string) {
    let [nsuri, tagName] = tagNameRaw.split(":");
    if (!tagName) {
      tagName = nsuri;
      nsuri = tagNamespaceMap[tagName];
    }
    tagName = tagAliases[tagName] || tagName;
    if (nsuri) {
      nsuri = namespaces[nsuri] || nsuri;
      return function () {
        return doc.createElementNS(nsuri, tagName);
      };
    }
    return function () {
      return doc.createElement(tagName);
    };
  });

  function createNode(tagName: string): any {
    return getNodeCreator(tagName)();
  }
  function createAnchor(anchorName?: string): any {
    if (!env.isProduction() && anchorName) {
      return doc.createComment(anchorName);
    }
    return doc.createTextNode("");
  }
  function createTextNode(text: any): any {
    if (isSignal(text)) {
      const node = doc.createTextNode("");
      text.connect(function () {
        const newData = peek(text);
        if (newData === undefined) node.data = "";
        else node.data = newData;
      });
      return node;
    }

    return doc.createTextNode(text);
  }
  function createFragment(): any {
    return doc.createDocumentFragment();
  }

  function removeNode(node: any): void {
    if (!node.parentNode) return;
    node.parentNode.removeChild(node);
  }
  function appendNode(parent: any, ...nodes: any[]): void {
    for (let node of nodes) {
      parent.insertBefore(node, null);
    }
  }
  function insertBefore(node: any, ref: any): void {
    ref.parentNode.insertBefore(node, ref);
  }

  const getListenerAdder = cachedStrKeyNoFalsy(function (event: string) {
    const [prefix, eventName] = event.split(":");
    if (prefix === "on") {
      return function (node: any, cb: any) {
        if (!cb) return;
        if (isSignal(cb)) {
          let currentHandler: any = null;
          cb.connect(function () {
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
      const options: any = {};
      for (let option of optionsArr) if (option) options[option] = true;
      return function (node: any, cb: any) {
        if (!cb) return;
        if (isSignal(cb)) {
          let currentHandler: any = null;
          cb.connect(function () {
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
  function addListener(node: any, event: string, cb: any): void {
    getListenerAdder(event)(node, cb);
  }

  function setAttr(node: any, attr: string, val: any): void {
    if (val === undefined || val === null || val === false) return;

    function handler(newVal: any) {
      if (newVal === undefined || newVal === null || newVal === false)
        node.removeAttribute(attr);
      else if (newVal === true) node.setAttribute(attr, "");
      else node.setAttribute(attr, newVal);
    }

    bind(handler, val);
  }
  // eslint-disable-next-line max-params
  function setAttrNS(node: any, attr: string, val: any, ns: string): void {
    if (val === undefined || val === null || val === false) return;

    function handler(newVal: any) {
      if (newVal === undefined || newVal === null || newVal === false)
        node.removeAttributeNS(ns, attr);
      else if (newVal === true) node.setAttributeNS(ns, attr, "");
      else node.setAttributeNS(ns, attr, newVal);
    }

    bind(handler, val);
  }

  const getPropSetter = cachedStrKeyNoFalsy(function (prop: string) {
    prop = propAliases[prop] || prop;
    const [prefix, key] = splitFirst(prop, ":");
    if (key) {
      switch (prefix) {
        default: {
          if (prefix === "on" || prefix.startsWith("on-")) {
            return function (node: any, val: any) {
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
          return function (node: any, val: any) {
            return setAttrNS(node, key, val, nsuri);
          };
        }
        case "attr": {
          return function (node: any, val: any) {
            return setAttr(node, key, val);
          };
        }
        case "prop": {
          prop = key;
        }
      }
    } else if (prop.indexOf("-") > -1) {
      return function (node: any, val: any) {
        return setAttr(node, prop, val);
      };
    }

    return function (node: any, val: any) {
      if (val === undefined || val === null) return;
      if (isSignal(val)) {
        val.connect(function () {
          node[prop] = peek(val);
        });
      } else {
        node[prop] = val;
      }
    };
  });

  function setProps(node: any, props: Record<string, any>): void {
    for (let prop in props) getPropSetter(prop)(node, props[prop]);
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

  const renderer = createRenderer(nodeOps, rendererID);

  // Automatically wrap JSX runtime with this renderer
  wrap(renderer);

  return renderer;
}

export { defaultRendererID };
