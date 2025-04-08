// https://dom.spec.whatwg.org/#interface-parentnode
// Document, DocumentFragment, Element

// @ts-ignore - Ignoring TS extension import error
import {
  ATTRIBUTE_NODE,
  DOCUMENT_FRAGMENT_NODE,
  ELEMENT_NODE,
  TEXT_NODE,
  NODE_END,
  CDATA_SECTION_NODE,
  COMMENT_NODE,
} from "../shared/constants.ts";

// @ts-ignore - Ignoring TS extension import error
import { PRIVATE, END, NEXT, PREV, START, VALUE } from "../shared/symbols.ts";

// @ts-ignore - Ignoring TS extension import error
import { prepareMatch } from "../shared/matches.ts";
// @ts-ignore - Ignoring TS extension import error
import { previousSibling, nextSibling } from "../shared/node.ts";
// @ts-ignore - Ignoring TS extension import error
import {
  getEnd,
  knownAdjacent,
  knownBoundaries,
  knownSegment,
  knownSiblings,
  localCase,
} from "../shared/util/utils.ts";

// @ts-ignore - Ignoring TS extension import error
import { Node } from "../interface/node.ts";
// @ts-ignore - Ignoring TS extension import error
import { Text } from "../interface/text.ts";
// @ts-ignore - Ignoring TS extension import error
import { NodeList } from "../interface/node-list.ts";

// @ts-ignore - Ignoring TS extension import error
import { moCallback } from "../interface/mutation-observer.ts";
// @ts-ignore - Ignoring TS extension import error
import { connectedCallback } from "../interface/custom-element-registry.ts";

// @ts-ignore - Ignoring TS extension import error
import { nextElementSibling } from "./non-document-type-child-node.ts";

const isNode = (node: any): boolean => node instanceof Node;

const insert = (parentNode: any, child: any, nodes: any[]): void => {
  const { ownerDocument } = parentNode;
  for (const node of nodes)
    parentNode.insertBefore(
      isNode(node) ? node : new Text(ownerDocument, node),
      child
    );
};

/** @typedef { import('../interface/element.ts').Element & {
    [typeof NEXT]: NodeStruct,
    [typeof PREV]: NodeStruct,
    [typeof START]: NodeStruct,
    nodeType: typeof ATTRIBUTE_NODE | typeof DOCUMENT_FRAGMENT_NODE | typeof ELEMENT_NODE | typeof TEXT_NODE | typeof NODE_END | typeof COMMENT_NODE | typeof CDATA_SECTION_NODE,
    ownerDocument: Document,
    parentNode: ParentNode,
}} NodeStruct */

export class ParentNode extends Node {
  constructor(ownerDocument: any, localName: string, nodeType: number) {
    super(ownerDocument, localName, nodeType);
    (this as any)[PRIVATE] = null;
    /** @type {NodeStruct} */
    (this as any)[NEXT] = (this as any)[END] = {
      [NEXT]: null,
      [PREV]: this,
      [START]: this,
      nodeType: NODE_END,
      ownerDocument: this.ownerDocument,
      parentNode: null,
    };
  }

  override get childNodes(): NodeList {
    const childNodes = new NodeList();
    let { firstChild } = this;
    while (firstChild) {
      childNodes.push(firstChild);
      firstChild = nextSibling(firstChild as any);
    }
    return childNodes;
  }

  get children(): NodeList {
    const children = new NodeList();
    let { firstElementChild } = this;
    while (firstElementChild) {
      children.push(firstElementChild);
      firstElementChild = nextElementSibling(firstElementChild);
    }
    return children;
  }

  /**
   * @returns {NodeStruct | null}
   */
  override get firstChild(): any {
    let next = (this as any)[NEXT];
    const end = (this as any)[END];
    while (next.nodeType === ATTRIBUTE_NODE) next = next[NEXT];
    return next === end ? null : next;
  }

  /**
   * @returns {NodeStruct | null}
   */
  get firstElementChild(): any {
    let { firstChild } = this;
    while (firstChild) {
      if (firstChild.nodeType === ELEMENT_NODE) return firstChild;
      firstChild = nextSibling(firstChild as any);
    }
    return null;
  }

  // @ts-ignore - Accessor overriding property in base class
  override get lastChild(): any {
    const prev = (this as any)[END][PREV];
    switch (prev.nodeType) {
      case NODE_END:
        return prev[START];
      case ATTRIBUTE_NODE:
        return null;
    }
    return prev === this ? null : prev;
  }

  get lastElementChild(): any {
    let { lastChild } = this;
    while (lastChild) {
      if (lastChild.nodeType === ELEMENT_NODE) return lastChild;
      lastChild = previousSibling({ prev: lastChild } as any);
    }
    return null;
  }

  get childElementCount(): number {
    return this.children.length;
  }

  prepend(...nodes: any[]): void {
    insert(this, this.firstChild, nodes);
  }

  append(...nodes: any[]): void {
    insert(this, (this as any)[END], nodes);
  }

  replaceChildren(...nodes: any[]): void {
    let next = (this as any)[NEXT];
    const end = (this as any)[END];
    while (next !== end && next.nodeType === ATTRIBUTE_NODE) next = next[NEXT];
    while (next !== end) {
      const after = getEnd(next)[NEXT];
      next.remove();
      next = after;
    }
    if (nodes.length) insert(this, end, nodes);
  }

  getElementsByClassName(className: string): NodeList {
    const elements = new NodeList();
    let next = (this as any)[NEXT];
    const end = (this as any)[END];
    while (next !== end) {
      if (
        next.nodeType === ELEMENT_NODE &&
        next.hasAttribute("class") &&
        next.classList.has(className)
      )
        elements.push(next);
      next = next[NEXT];
    }
    return elements;
  }

  getElementsByTagName(tagName: string): NodeList {
    const elements = new NodeList();
    let next = (this as any)[NEXT];
    const end = (this as any)[END];
    while (next !== end) {
      if (
        next.nodeType === ELEMENT_NODE &&
        (next.localName === tagName || localCase(next) === tagName)
      )
        elements.push(next);
      next = next[NEXT];
    }
    return elements;
  }

  querySelector(selectors: string): any {
    const matches = prepareMatch(this, selectors);
    let next = (this as any)[NEXT];
    const end = (this as any)[END];
    while (next !== end) {
      if (next.nodeType === ELEMENT_NODE && matches(next)) return next;
      next =
        next.nodeType === ELEMENT_NODE && next.localName === "template"
          ? next[END]
          : next[NEXT];
    }
    return null;
  }

  querySelectorAll(selectors: string): NodeList {
    const matches = prepareMatch(this, selectors);
    const elements = new NodeList();
    let next = (this as any)[NEXT];
    const end = (this as any)[END];
    while (next !== end) {
      if (next.nodeType === ELEMENT_NODE && matches(next)) elements.push(next);
      next =
        next.nodeType === ELEMENT_NODE && next.localName === "template"
          ? next[END]
          : next[NEXT];
    }
    return elements;
  }

  // @ts-ignore - Resolving accessor vs property conflict
  override appendChild(node: any): any {
    return this.insertBefore(node, (this as any)[END]);
  }

  override contains(node: any): boolean {
    let parentNode = node;
    while (parentNode && parentNode !== this)
      parentNode = parentNode.parentNode;
    return parentNode === this;
  }

  // @ts-ignore - Resolving accessor vs property conflict
  override insertBefore(node: any, before: any = null): any {
    if (node === before) return node;
    if (node === this) throw new Error("unable to append a node to itself");
    const next = before || (this as any)[END];
    switch (node.nodeType) {
      case ELEMENT_NODE:
        node.remove();
        node.parentNode = this;
        knownBoundaries(next[PREV], node, next);
        moCallback(node, null);
        connectedCallback(node);
        break;
      case DOCUMENT_FRAGMENT_NODE: {
        let parentNode = node[PRIVATE];
        let firstChild = node.firstChild;
        let lastChild = node.lastChild;
        if (firstChild) {
          knownSegment(next[PREV], firstChild, lastChild, next);
          knownAdjacent(node, node[END]);
          if (parentNode) parentNode.replaceChildren();
          do {
            firstChild.parentNode = this;
            moCallback(firstChild, null);
            if (firstChild.nodeType === ELEMENT_NODE)
              connectedCallback(firstChild);
          } while (
            firstChild !== lastChild &&
            (firstChild = nextSibling(firstChild as any))
          );
        }
        break;
      }
      case TEXT_NODE:
      case COMMENT_NODE:
      case CDATA_SECTION_NODE:
        node.remove();
      /* eslint no-fallthrough:0 */
      // this covers DOCUMENT_TYPE_NODE too
      default:
        node.parentNode = this;
        knownSiblings(next[PREV], node, next);
        moCallback(node, null);
        break;
    }
    return node;
  }

  override normalize(): void {
    let next = (this as any)[NEXT];
    const end = (this as any)[END];
    while (next !== end) {
      const $next = next[NEXT];
      const $prev = next[PREV];
      const { nodeType } = next;
      if (nodeType === TEXT_NODE) {
        if (!next[VALUE]) next.remove();
        else if ($prev && $prev.nodeType === TEXT_NODE) {
          $prev.textContent += next.textContent;
          next.remove();
        }
      }
      next = $next;
    }
  }

  override removeChild(node: any): any {
    if (node.parentNode !== this) throw new Error("node is not a child");
    node.remove();
    return node;
  }

  override replaceChild(node: any, replaced: any): any {
    const next = getEnd(replaced)[NEXT];
    replaced.remove();
    this.insertBefore(node, next);
    return replaced;
  }
}
