// @ts-nocheck
// deno-lint-ignore-file
import {
  splice,
  findWhere,
  createAttributeFilter,
  type AttributeType,
} from "../../../util/src/index.ts";
import type { HTMLElement } from "../html/element.ts";
import type { Comment } from "../interface/comment.ts";
import type { DocumentFragment } from "../interface/document-fragment.ts";
import type { Document } from "../interface/document.ts";
import type { Element } from "../interface/element.ts";
import type { Node } from "../interface/node.ts";
import type { Text } from "../interface/text.ts";
import type { ParentNode } from "../mixin/parent-node.ts";
import { createDOMTagger, serializeDOM } from "../shared/util/utils.ts";
import type {
  Attribute,
  EventOptions,
  EventDescriptor,
  Environment,
  EventHandlers,
  EnvironmentOptions,
} from "./types.ts";
import { HTML_NAMESPACE, SVG_NAMESPACE } from "../shared/constants.ts";

/*##################################(CLASSES)###########################*/

class Event {
  /** Event type, e.g., "click" */
  public type!: string;
  /** Whether the event bubbles */
  public bubbles!: boolean;
  /** Whether the default behaviour can be cancelled */
  public cancelable!: boolean;
  /** Whether listeners registered for the capture phase should fire */
  public captures!: boolean;

  /* Internal InDOM flags */
  public defaultPrevented = false;
  public currentTarget?: EventTarget;
  public target?: EventTarget;
  public __indom_event_stop?: boolean;
  public __indom_event_end?: boolean;
  public __indom_event_passive?: boolean;

  constructor(
    type: string,
    { bubbles, captures, cancelable }: EventOptions = {}
  ) {
    this.initEvent(type, bubbles, cancelable, captures);
  }

  initEvent(
    type: string,
    bubbles: boolean = false,
    cancelable: boolean = true,
    captures: boolean = false
  ): void {
    this.type = type;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
    this.captures = captures;
  }

  /** Prevent further bubbling of the event */
  public stopPropagation(): void {
    this.__indom_event_stop = true;
  }

  /** Prevent any additional listeners from being invoked */
  public stopImmediatePropagation(): void {
    this.__indom_event_end = this.__indom_event_stop = true;
  }

  /** Mark the event as having its default action cancelled */
  public preventDefault(): void {
    if (this.__indom_event_passive) {
      console.error(
        "[InDOM] Unable to preventDefault inside passive event (trigger) listener invocation."
      );
      return;
    }
    this.defaultPrevented = true;
  }
}

const createEvent = (eventName: string, options?: EventOptions): Event =>
  new Event(eventName, options);

const getEventDescriptor = (
  target: EventTarget,
  type: string,
  handler: (event: Event) => void,
  options?: boolean | AddEventListenerOptions
): EventDescriptor => {
  if (typeof options === "object") {
    const { capture, once, passive, signal } = options;
    return { target, capture, once, passive, signal, type, handler };
  }

  return { target, capture: !!options, type, handler };
};

const runEventHandlers = (
  store: Map<Function, EventDescriptor>,
  event: Event,
  cancelable: boolean
): void => {
  for (let descriptor of [...store.values()]) {
    const { target, handler, removed } = descriptor;
    if (!removed) {
      event.__indom_event_passive = !cancelable || !!descriptor.passive;
      event.currentTarget = target;
      handler.call(target, event);
      if (event.__indom_event_end) return;
    }
  }
};

const isElement = (node: any): boolean =>
  (node && node.__indom_is_Element) || false;

const isNode = (node: any): boolean => (node && node.__indom_is_Node) || false;

const setData = (self: any, data: any): void => {
  self.__indom_data = data;
};

const defaultInitDocument = (document: Document): void => {
  document.head = document.createElement("head");
  document.body = document.createElement("body");

  document.documentElement.appendChild(document.head);
  document.documentElement.appendChild(document.body);
};

const updateAttributeNS = (
  self: Element,
  ns: string | null,
  name: string,
  value: string
): void => {
  let attr = findWhere(
    self.attributes,
    createAttributeFilter(ns, name),
    false,
    false
  );
  if (!attr) self.attributes.push((attr = { ns, name, value }));
  else attr.value = value;
};

const getOwnerDocumentSetter = (
  onChangeOwnerDocument?: (
    this: Node,
    newOwnerDocument: Document | null,
    previousOwnerDocument: Document | null
  ) => void
) => {
  if (onChangeOwnerDocument)
    return (node: Node, ownerDocument: Document | null): void => {
      if (node.__indom_owner_document === ownerDocument) return;
      if (onChangeOwnerDocument)
        onChangeOwnerDocument.call(node, ownerDocument, node.ownerDocument);
      node.__indom_owner_document = ownerDocument;
    };

  return (node: Node, ownerDocument: Document | null): void => {
    node.__indom_owner_document = ownerDocument;
  };
};

const createDOMLite = ({
  silent = true,
  commonAncestors = {},
  initDocument = defaultInitDocument,
  preserveClassNameOnRegister = false,
  onGetData,
  onSetData,
  onCreateNode,
  onInsertBefore,
  onRemoveChild,
  onSetInnerHTML,
  onSetOuterHTML,
  onSetTextContent,
  onGetTextContent,
  onSetAttributeNS,
  onGetAttributeNS,
  onRemoveAttributeNS,
  onChangeOwnerDocument,
  onAddEventListener,
  onAddedEventListener,
  onRemoveEventListener,
  onRemovedEventListener,
}: EnvironmentOptions = {}): Environment => {
  const scope: Record<string, any> = {};

  const createElement = (
    ownerDocument: Document | null,
    type: string,
    ...args: any[]
  ) => {
    if (scope[type]) return new scope[type](ownerDocument, ...args);
    if (!silent)
      console.warn(`[InDOM] Element type '${type}' is not registered.`);
    return new scope.HTMLElement(ownerDocument, null, type);
  };

  const setOwnerDocument = getOwnerDocumentSetter(onChangeOwnerDocument);

  const makeEventTarget = createDOMTagger(
    "EventTarget",
    (_ = commonAncestors.EventTarget || Object) => {
      class EventTarget extends _ {
        __indom_eventHandlers: EventHandlers;

        constructor(...args: any[]) {
          super(...args);

          this.__indom_eventHandlers = {
            capturePhase: {},
            bubblePhase: {},
          };
        }

        addEventListener(
          type: string,
          handler: (event: Event) => void,
          options?: boolean | AddEventListenerOptions
        ): void {
          // Method could be called before constructor
          if (!this.__indom_eventHandlers) {
            return super.addEventListener(type, handler, options);
          }

          const args = [type, handler, options];

          let skip = false;
          if (onAddEventListener) {
            skip = !!onAddEventListener.call(this, ...args);
          }

          if (!skip) {
            const descriptor = getEventDescriptor(this, type, handler, options);

            const phase = descriptor.capture ? "capturePhase" : "bubblePhase";

            let store = this.__indom_eventHandlers[phase][type];
            if (!store)
              store = this.__indom_eventHandlers[phase][type] = new Map();
            else if (store.has(handler)) return;

            store.set(handler, descriptor);

            const abortHandler = () => {
              if (!descriptor.removed)
                this.removeEventListener(type, handler, options);
            };

            descriptor.abortHandler = abortHandler;

            if (descriptor.once) {
              descriptor.handler = function (
                this: EventTarget,
                ...handlerArgs: any[]
              ) {
                abortHandler();
                handler.call(this, ...handlerArgs);
              };
            }

            if (descriptor.signal) {
              descriptor.signal.addEventListener("abort", abortHandler);
            }

            if (onAddedEventListener) {
              onAddedEventListener.call(this, ...args);
            }
          }
        }

        removeEventListener(
          type: string,
          handler: (event: Event) => void,
          options?: boolean | EventListenerOptions
        ): void {
          // Method could be called before constructor
          if (!this.__indom_eventHandlers) {
            return super.removeEventListener(type, handler, options);
          }

          const args = [type, handler, options];

          let skip = false;
          if (onRemoveEventListener) {
            skip = !!onRemoveEventListener.call(this, ...args);
          }

          if (!skip) {
            let capture = false;
            if (typeof options === "object") capture = !!options.capture;
            else capture = !!options;

            const phase = capture ? "capturePhase" : "bubblePhase";

            const store = this.__indom_eventHandlers[phase][type];
            if (!store) return;

            const descriptor = store.get(handler);
            if (!descriptor) return;

            if (descriptor.signal) {
              descriptor.signal.removeEventListener(
                "abort",
                descriptor.abortHandler!
              );
            }
            store.delete(handler);

            descriptor.removed = true;

            if (!store.size) delete this.__indom_eventHandlers[phase][type];

            if (onRemovedEventListener) {
              onRemovedEventListener.call(this, ...args);
            }
          }
        }

        dispatchEvent(event: Event): boolean {
          const { cancelable, bubbles, captures, type } = event;
          event.target = this;

          const capturePhase: Map<Function, EventDescriptor>[] = [];
          const bubblePhase: Map<Function, EventDescriptor>[] = [];

          if (bubbles || captures) {
            let currentNode: any = this;
            while (currentNode) {
              if (
                captures &&
                currentNode.__indom_eventHandlers.capturePhase[type]
              )
                capturePhase.unshift(
                  currentNode.__indom_eventHandlers.capturePhase[type]
                );
              if (
                bubbles &&
                currentNode.__indom_eventHandlers.bubblePhase[type]
              )
                bubblePhase.push(
                  currentNode.__indom_eventHandlers.bubblePhase[type]
                );
              currentNode = currentNode.parentNode;
            }
          }

          if (!captures && this.__indom_eventHandlers.capturePhase[type])
            capturePhase.push(this.__indom_eventHandlers.capturePhase[type]);
          if (!bubbles && this.__indom_eventHandlers.bubblePhase[type])
            bubblePhase.push(this.__indom_eventHandlers.bubblePhase[type]);

          for (let i of capturePhase) {
            runEventHandlers(i, event, cancelable);
            if (!event.bubbles || event.__indom_event_stop)
              return !event.defaultPrevented;
          }

          for (let i of bubblePhase) {
            runEventHandlers(i, event, cancelable);
            if (!event.bubbles || event.__indom_event_stop)
              return !event.defaultPrevented;
          }

          return !event.defaultPrevented;
        }
      }

      return EventTarget;
    }
  );

  const makeNode = createDOMTagger(
    "Node",
    (_ = commonAncestors.Node || scope.EventTarget) => {
      class Node extends makeEventTarget(_) {
        nodeType: number;
        nodeName?: string;
        parentNode: Node | null;
        nextSibling: Node | null;
        previousSibling: Node | null;
        __indom_owner_document: Document | null;
        __indom_is_Node: boolean = true;
        __indom_is_Element?: boolean;
        __indom_is_ParentNode?: boolean;
        __indom_data?: any;

        constructor(
          ownerDocument: Document | null = null,
          nodeType: number,
          localName?: string,
          ...args: any[]
        ) {
          super(ownerDocument, ...args);

          this.nodeType = nodeType;
          if (localName)
            this.nodeName =
              localName[0] === "#"
                ? localName
                : String(localName).toUpperCase();

          this.parentNode = null;
          this.nextSibling = null;
          this.previousSibling = null;

          this.__indom_owner_document = ownerDocument;

          if (onCreateNode) {
            onCreateNode.call(this, nodeType, localName);
          }
        }

        get ownerDocument(): Document | null {
          return this.__indom_owner_document;
        }

        get previousElementSibling(): Element | null {
          let currentNode = this.previousSibling;
          while (currentNode) {
            if (isElement(currentNode))
              return currentNode as unknown as Element;
            currentNode = currentNode.previousSibling;
          }

          return null;
        }

        get nextElementSibling(): Element | null {
          let currentNode = this.nextSibling;
          while (currentNode) {
            if (isElement(currentNode))
              return currentNode as unknown as Element;
            currentNode = currentNode.nextSibling;
          }

          return null;
        }

        remove(): void {
          if (this.parentNode) this.parentNode.removeChild(this);
        }

        replaceWith(...nodes: Node[]): void {
          if (!this.parentNode) return;

          const ref = this.nextSibling;
          const parent = this.parentNode;
          for (let i of nodes) {
            i.remove();
            parent.insertBefore(i, ref);
          }
        }

        cloneNode(deep?: boolean): Node | null {
          let clonedNode: Node | null = null;

          if (this.__indom_is_ParentNode) {
            if (this.nodeType === 9)
              clonedNode = new scope.Document(
                ...(this as any).__indom_document_init_args
              );
            else if (this.nodeType === 11)
              clonedNode = new scope.DocumentFragment(this.ownerDocument);
            else {
              clonedNode = createElement(
                this.ownerDocument,
                (this as any).localName
              );
              const sourceAttrs = (this as any).attributes;
              for (let { ns, name, value } of sourceAttrs) {
                (clonedNode as any).setAttributeNS(ns, name, value);
              }
            }

            if (deep) {
              let currentNode = (this as any).firstChild;
              while (currentNode) {
                (clonedNode as any).appendChild(currentNode.cloneNode(deep));
                currentNode = currentNode.nextSibling;
              }
            }
          } else if (this.nodeType === 3)
            clonedNode = new scope.Text(
              this.ownerDocument,
              (this as any).nodeValue
            );
          else if (this.nodeType === 8)
            clonedNode = new scope.Comment(
              this.ownerDocument,
              (this as any).nodeValue
            );

          return clonedNode;
        }

        hasChildNodes(): boolean {
          return !!(this as any).firstChild;
        }
      }

      // Fix buble: https://github.com/bublejs/buble/blob/bac51a9c2793011987d1d17efcda03f70e4b540a/src/program/types/ClassBody.js#L134
      Object.defineProperty(Node, Symbol.toStringTag, {
        get() {
          return this.constructor.name;
        },
      });

      return Node;
    }
  );

  const makeCharacterData = createDOMTagger(
    "CharacterData",
    (_ = commonAncestors.CharacterData || scope.Node) =>
      class CharacterData extends makeNode(_) {
        get data(): string {
          if (onGetData) onGetData.call(this, (data) => setData(this, data));

          return `${this.__indom_data}`;
        }

        set data(data: string) {
          setData(this, data);

          if (onSetData) onSetData.call(this, data);
        }

        get length(): number {
          return this.data.length;
        }

        get nodeValue(): string {
          return this.data;
        }

        set nodeValue(data: string) {
          this.data = data;
        }

        get textContent(): string {
          return this.data;
        }

        set textContent(text: string) {
          this.data = text;
        }

        appendData(data: string): void {
          this.data += data;
        }
      }
  );

  const makeComment = createDOMTagger(
    "Comment",
    (_ = commonAncestors.Comment || scope.CharacterData) =>
      class Comment extends makeCharacterData(_) {
        constructor(
          ownerDocument: Document | null,
          data: string,
          ...args: any[]
        ) {
          super(ownerDocument, 8, "#comment", ...args);
          this.data = data;
        }
      }
  );

  const makeText = createDOMTagger(
    "Text",
    (_ = commonAncestors.Text || scope.CharacterData) =>
      class Text extends makeCharacterData(_) {
        constructor(
          ownerDocument: Document | null,
          text: string,
          ...args: any[]
        ) {
          super(ownerDocument, 3, "#text", ...args);
          this.data = text;
        }
      }
  );

  const clearChildren = (self: ParentNode): void => {
    if (!self.hasChildNodes()) return;

    let currentNode = self.firstChild;

    while (currentNode) {
      const nextSibling = currentNode.nextSibling;
      currentNode.remove();
      currentNode = nextSibling;
    }
  };

  const makeParentNode = createDOMTagger(
    "ParentNode",
    (_ = scope.Node) =>
      class ParentNode extends makeNode(_) {
        firstChild?: Node | null;
        lastChild?: Node | null;
        __indom_is_ParentNode: boolean = true;

        get firstElementChild(): Element | null {
          const currentNode = this.firstChild;
          if (!currentNode) return null;
          if (isElement(currentNode)) return currentNode as unknown as Element;
          return currentNode.nextElementSibling;
        }

        get lastElementChild(): Element | null {
          const currentNode = this.lastChild;
          if (!currentNode) return null;
          if (isElement(currentNode)) return currentNode as unknown as Element;
          return currentNode.previousSibling;
        }

        get childNodes(): Node[] {
          const childNodes: Node[] = [];

          let currentNode = this.firstChild;
          while (currentNode) {
            childNodes.push(currentNode);
            currentNode = currentNode.nextSibling;
          }

          return childNodes;
        }

        get children(): Element[] {
          const children: Element[] = [];

          let currentNode = this.firstElementChild;
          while (currentNode) {
            children.push(currentNode);
            currentNode = currentNode.nextElementSibling;
          }

          return children;
        }

        get childElementCount(): number {
          let count = 0;

          let currentNode = this.firstElementChild;
          while (currentNode) {
            count += 1;
            currentNode = currentNode.nextElementSibling;
          }

          return count;
        }

        get textContent(): string {
          if (onGetTextContent) {
            const textContent = onGetTextContent.call(this);
            if (textContent) return textContent;
          }

          const textArr: string[] = [];

          let currentNode = this.firstChild;
          while (currentNode) {
            if (currentNode.nodeType !== 8) {
              const textContent = currentNode.textContent;
              if (textContent) textArr.push(textContent);
            }
            currentNode = currentNode.nextSibling;
          }

          return "".concat(...textArr);
        }

        set textContent(val: string) {
          clearChildren(this);

          if (onSetTextContent) {
            const skipDefault = onSetTextContent.call(this, val);
            if (skipDefault) return;
          }

          if (val !== "")
            this.appendChild(new scope.Text(this.ownerDocument, val));
        }

        insertBefore(child: Node, ref?: Node | null): Node {
          if (!child.__indom_is_Node) {
            if (onInsertBefore) onInsertBefore.call(this, child, ref);
            return child;
          }

          if (ref && ref.parentNode !== this)
            throw new Error(
              `[InDOM] Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.`
            );
          if (child === ref) return child;

          let ownerDocument = this.ownerDocument;
          if (this.nodeType === 9) ownerDocument = this as unknown as Document;

          if (child.nodeType === 11) {
            const documentFragment = child as unknown as DocumentFragment;
            const { firstChild, lastChild } = documentFragment;

            if (firstChild && lastChild) {
              const insertedChildList: Node[] = [];
              let currentNode: Node | null = firstChild;
              while (currentNode) {
                const nextSibling = currentNode.nextSibling;

                currentNode.parentNode = this;
                if (onRemoveChild)
                  onRemoveChild.call(documentFragment, currentNode);
                if (onInsertBefore) insertedChildList.push(currentNode);
                setOwnerDocument(currentNode, ownerDocument);

                currentNode = nextSibling;
              }

              if (ref) {
                firstChild.previousSibling = ref.previousSibling;
                lastChild.nextSibling = ref;
                ref.previousSibling = lastChild;
              } else {
                firstChild.previousSibling = this.lastChild;
                lastChild.nextSibling = null;
              }

              if (firstChild.previousSibling)
                firstChild.previousSibling.nextSibling = firstChild;
              else this.firstChild = firstChild;

              if (lastChild.nextSibling)
                lastChild.nextSibling.previousSibling = lastChild;
              else this.lastChild = lastChild;

              documentFragment.firstChild = null;
              documentFragment.lastChild = null;

              if (insertedChildList.length) {
                for (let currentNode of insertedChildList) {
                  onInsertBefore.call(this, currentNode, ref);
                }
              }
            }
          } else {
            child.remove();
            child.parentNode = this;

            if (ref) {
              child.previousSibling = ref.previousSibling;
              child.nextSibling = ref;
              ref.previousSibling = child;
            } else {
              child.previousSibling = this.lastChild;
              this.lastChild = child;
            }

            if (child.previousSibling)
              child.previousSibling.nextSibling = child;
            else this.firstChild = child;
          }

          setOwnerDocument(child, ownerDocument);

          if (onInsertBefore) onInsertBefore.call(this, child, ref);

          return child;
        }

        appendChild(child: Node): Node {
          return this.insertBefore(child, null);
        }

        append(...children: (Node | string)[]): void {
          for (let i of children) {
            if (typeof i === "string") {
              this.appendChild(new scope.Text(this.ownerDocument, i));
            } else {
              this.appendChild(i);
            }
          }
        }

        replaceChild(child: Node, oldChild: Node): Node {
          if (oldChild.parentNode !== this)
            throw new Error(
              `[InDOM] Failed to execute 'replaceChild' on 'Node': The node to be replaced is not a child of this node.`
            );

          const ref = oldChild.nextSibling;
          oldChild.removeChild();

          this.insertBefore(child, ref);

          return oldChild;
        }

        removeChild(child: Node): Node {
          if (!child.__indom_is_Node || child.parentNode !== this) {
            if (onRemoveChild) onRemoveChild.call(this, child);
            return child;
          }

          if (this.firstChild === child) this.firstChild = child.nextSibling;
          if (this.lastChild === child) this.lastChild = child.previousSibling;

          if (child.previousSibling)
            child.previousSibling.nextSibling = child.nextSibling;
          if (child.nextSibling)
            child.nextSibling.previousSibling = child.previousSibling;

          child.parentNode = null;
          child.previousSibling = null;
          child.nextSibling = null;

          if (onRemoveChild) onRemoveChild.call(this, child);

          return child;
        }
      }
  );

  const makeDocumentFragment = createDOMTagger(
    "DocumentFragment",
    (_ = scope.ParentNode) =>
      class DocumentFragment extends makeParentNode(_) {
        constructor(ownerDocument: Document | null, ...args: any[]) {
          super(ownerDocument, 11, "#document-fragment", ...args);
        }
      }
  );

  const makeElement = createDOMTagger(
    "Element",
    (_ = commonAncestors.Element || scope.ParentNode, name?: string) => {
      const protoHasInnerHTML = "innerHTML" in _.prototype;
      const protoHasOuterHTML = "outerHTML" in _.prototype;

      class Element extends makeParentNode(_) {
        localName: string;
        attributes: Attribute[];
        style: any;
        __indom_namespace: string | null;
        __indom_is_Element: boolean = true;

        constructor(
          ownerDocument: Document | null,
          nodeType: number | null,
          localName: string | null,
          ...args: any[]
        ) {
          super(ownerDocument, nodeType || 1, localName || name, ...args);
          this.localName = localName || name || "";
          this.attributes = [];
          if (!this.style) this.style = {};
          this.__indom_namespace = null;
        }

        get tagName(): string | undefined {
          return this.nodeName;
        }

        get namespaceURI(): string | null {
          return this.__indom_namespace;
        }

        get className(): string {
          return this.getAttribute("class") || "";
        }

        set className(val: string) {
          this.setAttribute("class", val);
        }

        /**
         * ### ⚠️ Important Note – `innerHTML` deliberately unsupported
         * Using `innerHTML` in a JavaScript-only DOM is extremely expensive –
         * it requires parsing an HTML string, creating every intermediary node
         * in pure JS and therefore allocates a large amount of memory.  The
         * lite build of InDOM targets environments with < 8 MB RAM / < 500 MHz
         * CPUs (e.g., micro-controllers, embedded devices) where such
         * allocations are simply not viable.
         *
         * Trying to read or write `innerHTML` will therefore throw a clear
         * runtime error that explains the reasoning and suggests using the
         * explicit `createElement` / `appendChild` APIs instead.
         */
        get innerHTML(): string {
          throw new Error(
            "[InDOM:lite] The 'innerHTML' getter is disabled for performance reasons. " +
              "Please build DOM sub-trees with createElement/appendChild instead."
          );
        }

        set innerHTML(_value: string) {
          throw new Error(
            "[InDOM:lite] The 'innerHTML' setter is disabled for performance reasons. " +
              "Please build DOM sub-trees with createElement/appendChild instead."
          );
        }

        get outerHTML(): string {
          if (protoHasOuterHTML) return super.outerHTML;

          return serializeDOM(this, true);
        }

        set outerHTML(value: string) {
          if (protoHasOuterHTML) {
            super.outerHTML = value;
            return;
          }

          // Setting outerHTML with an empty string just removes the element from its parent
          if (value === "") {
            this.remove();
            return;
          }

          if (onSetOuterHTML) {
            onSetOuterHTML.call(this, value);
            return;
          }

          throw new Error(
            `[InDOM] Failed to set 'outerHTML' on '${this.localName}': Not implemented.`
          );
        }

        get cssText(): string {
          return this.getAttribute("style") || "";
        }

        set cssText(val: string) {
          this.setAttribute("style", val);
        }

        setAttribute(key: string, value: string): void {
          this.setAttributeNS(null, key, value);
        }

        getAttribute(key: string): string | null {
          return this.getAttributeNS(null, key);
        }

        removeAttribute(key: string): void {
          this.removeAttributeNS(null, key);
        }

        setAttributeNS(ns: string | null, name: string, value: string): void {
          updateAttributeNS(this, ns, name, value);

          if (onSetAttributeNS) {
            onSetAttributeNS.call(this, ns, name, value);
          }
        }

        getAttributeNS(ns: string | null, name: string): string | null {
          if (onGetAttributeNS) {
            onGetAttributeNS.call(this, ns, name, (value) =>
              updateAttributeNS(this, ns, name, value)
            );
          }
          let attr = findWhere(
            this.attributes as unknown as AttributeType[],
            createAttributeFilter(ns as string, name),
            false,
            false
          );
          return (attr && attr.value) || null;
        }

        removeAttributeNS(ns: string | null, name: string): void {
          splice(
            this.attributes as unknown as AttributeType[],
            createAttributeFilter(ns as string, name),
            false,
            false
          );

          if (onRemoveAttributeNS) {
            onRemoveAttributeNS.call(this, ns, name);
          }
        }
      }

      return Element;
    }
  );

  const makeHTMLElement = createDOMTagger(
    "HTMLElement",
    (_ = commonAncestors.HTMLElement || scope.Element, name?: string) =>
      class HTMLElement extends makeElement(_, name) {
        constructor(...args: any[]) {
          super(...args);
          this.__indom_namespace = HTML_NAMESPACE;
        }
      }
  );

  const makeSVGElement = createDOMTagger(
    "SVGElement",
    (_ = commonAncestors.SVGElement || scope.Element, name?: string) =>
      class SVGElement extends makeElement(_, name) {
        constructor(...args: any[]) {
          super(...args);
          this.__indom_namespace = SVG_NAMESPACE;
        }
      }
  );

  const createDocument = (
    namespaceURI: string | null,
    qualifiedNameStr: string,
    ...args: any[]
  ): Document => {
    const document = new scope.Document(...args);

    document.__indom_namespace = namespaceURI;

    const documentElement = createElement(document, qualifiedNameStr);
    document.appendChild(documentElement);

    if (initDocument) initDocument(document);

    return document;
  };

  class DOMImplementation {
    createDocument(
      namespaceURI: string | null,
      qualifiedNameStr: string,
      ...args: any[]
    ): Document {
      return createDocument(namespaceURI, qualifiedNameStr, ...args);
    }
  }

  const makeDocument = createDOMTagger(
    "Document",
    (_ = commonAncestors.Document || scope.ParentNode) =>
      class Document extends makeParentNode(_) {
        head?: HTMLElement;
        body?: HTMLElement;
        __indom_implementation: DOMImplementation;
        __indom_document_init_args: any[];
        __indom_namespace?: string | null;

        constructor(...args: any[]) {
          super(null, 9, "#document", ...args);
          this.__indom_implementation = new DOMImplementation();
          this.__indom_document_init_args = args;
        }

        insertBefore(child: Node, ref?: Node | null): Node {
          if (
            this.firstChild ||
            (isNode(child) &&
              child.nodeType === 11 &&
              (child as any).firstChild !== (child as any).lastChild)
          )
            throw new Error("[InDOM] Only one element on document allowed.");
          return super.insertBefore(child, ref);
        }

        createDocumentFragment(): DocumentFragment {
          return new scope.DocumentFragment(this);
        }

        createElement(type: string, ...args: any[]): Element {
          return createElement(this, type, ...args);
        }

        createElementNS(ns: string, type: string, ...args: any[]): Element {
          const element = this.createElement(type, ...args);
          element.__indom_namespace = ns;
          return element;
        }

        createComment(data: string): Comment {
          return new scope.Comment(this, data);
        }

        createTextNode(text: string): Text {
          return new scope.Text(this, text);
        }

        createEvent(type: string, options?: EventOptions): Event {
          return createEvent(type, options);
        }

        get documentElement(): Element | null {
          return this.firstChild as Element | null;
        }

        get defaultView(): any {
          return scope;
        }

        get implementation(): DOMImplementation {
          return this.__indom_implementation;
        }
      }
  );

  scope.Event = Event;
  scope.EventTarget = makeEventTarget.master();
  scope.Node = makeNode.master();
  scope.CharacterData = makeCharacterData.master();
  scope.Text = makeText.master();
  scope.Comment = makeComment.master();
  scope.ParentNode = makeParentNode.master();
  scope.DocumentFragment = makeDocumentFragment.master();
  scope.Element = makeElement.master();
  scope.HTMLElement = makeHTMLElement.master();
  scope.SVGElement = makeSVGElement.master();
  scope.Document = makeDocument.master();

  const registerElement = (
    name: string,
    value: any,
    isSVG?: boolean,
    isHTML?: boolean
  ) => {
    if (scope[name])
      throw new Error(
        `[InDOM] Element type '${name}' has already been registered.`
      );
    const element = isSVG
      ? makeSVGElement(value, name)
      : isHTML
      ? makeHTMLElement(value, name)
      : makeElement(value, name);
    scope[name] = element;
    if (preserveClassNameOnRegister)
      Object.defineProperty(element, "name", { value: name });

    return element;
  };

  return {
    scope,
    createEvent,
    createDocument,
    makeEventTarget,
    makeNode,
    makeParentNode,
    makeText,
    makeComment,
    makeDocumentFragment,
    makeElement,
    makeHTMLElement,
    makeSVGElement,
    makeDocument,
    registerElement,
    DOMImplementation,
  };
};

export { createDOMLite, createEvent, Event, isElement, isNode };
