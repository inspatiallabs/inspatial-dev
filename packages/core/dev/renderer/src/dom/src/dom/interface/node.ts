// https://dom.spec.whatwg.org/#node

// @ts-ignore - Ignoring TS extension import error
import {
  ELEMENT_NODE,
  ATTRIBUTE_NODE,
  TEXT_NODE,
  CDATA_SECTION_NODE,
  COMMENT_NODE,
  DOCUMENT_NODE,
  DOCUMENT_FRAGMENT_NODE,
  DOCUMENT_TYPE_NODE,
  DOCUMENT_POSITION_DISCONNECTED,
  DOCUMENT_POSITION_PRECEDING,
  DOCUMENT_POSITION_FOLLOWING,
  DOCUMENT_POSITION_CONTAINS,
  DOCUMENT_POSITION_CONTAINED_BY,
  DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
} from '../shared/constants.ts';

// @ts-ignore - Ignoring TS extension import error
import {END, NEXT, PREV} from '../shared/symbols.ts';

// @ts-ignore - Ignoring TS extension import error
import {EventTarget} from './event-target.ts';

// @ts-ignore - Ignoring TS extension import error
import {NodeList} from './node-list.ts';

/** 
 * Function to count the number of parent nodes.
 * @param {Node} node - The starting node to count parents from.
 * @returns {number} - The count of parent nodes.
 */
const getParentNodeCount = ({ parentNode }: { parentNode: Node | null }): number => {
  let count = 0;
  while (parentNode) {
    count++;
    parentNode = parentNode.parentNode;
  }
  return count;
};

/**
 * @implements globalThis.Node
 */
// @ts-ignore - Ignore compatibility issues with EventTarget
export class Node extends EventTarget {
  parentNode: Node | null;
  ownerDocument: any;
  localName: string;
  nodeType: number;
  lastChild: Node | null;

  static get ELEMENT_NODE() { return ELEMENT_NODE; }
  static get ATTRIBUTE_NODE() { return ATTRIBUTE_NODE; }
  static get TEXT_NODE() { return TEXT_NODE; }
  static get CDATA_SECTION_NODE() { return CDATA_SECTION_NODE; }
  static get COMMENT_NODE() { return COMMENT_NODE; }
  static get DOCUMENT_NODE() { return DOCUMENT_NODE; }
  static get DOCUMENT_FRAGMENT_NODE() { return DOCUMENT_FRAGMENT_NODE; }
  static get DOCUMENT_TYPE_NODE() { return DOCUMENT_TYPE_NODE; }

  constructor(ownerDocument: any, localName: string, nodeType: number) {
    super();
    this.ownerDocument = ownerDocument;
    this.localName = localName;
    this.nodeType = nodeType;
    this.parentNode = null;
    this.lastChild = null;
    // @ts-ignore - Type safety handled by interface extension
    this[NEXT] = null;
    // @ts-ignore - Type safety handled by interface extension
    this[PREV] = null;
  }

  get ELEMENT_NODE() { return ELEMENT_NODE; }
  get ATTRIBUTE_NODE() { return ATTRIBUTE_NODE; }
  get TEXT_NODE() { return TEXT_NODE; }
  get CDATA_SECTION_NODE() { return CDATA_SECTION_NODE; }
  get COMMENT_NODE() { return COMMENT_NODE; }
  get DOCUMENT_NODE() { return DOCUMENT_NODE; }
  get DOCUMENT_FRAGMENT_NODE() { return DOCUMENT_FRAGMENT_NODE; }
  get DOCUMENT_TYPE_NODE() { return DOCUMENT_TYPE_NODE; }

  get baseURI(): string | null {
    const ownerDocument = this.nodeType === DOCUMENT_NODE ?
                            this : this.ownerDocument;
    if (ownerDocument) {
      const base = ownerDocument.querySelector('base');
      if (base)
        return base.getAttribute('href');

      const {location} = ownerDocument.defaultView;
      if (location)
        return location.href;
    }

    return null;
  }

  /* c8 ignore start */
  // mixin: node
  get isConnected(): boolean { return false; }
  get nodeName(): string { return this.localName; }
  get parentElement(): Node | null { return null; }
  get previousSibling(): Node | null { return null; }
  get previousElementSibling(): Node | null { return null; }
  get nextSibling(): Node | null { return null; }
  get nextElementSibling(): Node | null { return null; }
  get childNodes(): NodeList { return new NodeList; }
  get firstChild(): Node | null { return null; }

  // default values
  get nodeValue(): string | null { return null; }
  set nodeValue(value: string) {}
  get textContent(): string | null { return null; }
  set textContent(value: string) {}
  normalize(): void {}
  cloneNode(): Node | null { return null; }
  contains(node?: Node): boolean { return false; }
  /**
   * Inserts a node before a reference node as a child of this parent node.
   * @param {Node} newNode The node to be inserted.
   * @param {Node} referenceNode The node before which newNode is inserted. If this is null, then newNode is inserted at the end of node's child nodes.
   * @returns The added child
   */
  // eslint-disable-next-line no-unused-vars
  insertBefore(newNode: Node, referenceNode: Node | null): Node { return newNode; }
  /**
   * Adds a node to the end of the list of children of this node.
   * @param {Node} child The node to append to the given parent node.
   * @returns The appended child.
   */
  appendChild(child: Node): Node { return child; }
  /**
   * Replaces a child node within this node
   * @param {Node} newChild The new node to replace oldChild.
   * @param {Node} oldChild The child to be replaced.
   * @returns The replaced Node. This is the same node as oldChild.
   */
  replaceChild(newChild: Node, oldChild: Node): Node { return oldChild; }
  /**
   * Removes a child node from the DOM.
   * @param {Node} child A Node that is the child node to be removed from the DOM.
   * @returns The removed node.
   */
  removeChild(child: Node): Node { return child; }
  // @ts-ignore - Override is valid
  override toString(): string { return ''; }
  /* c8 ignore stop */

  hasChildNodes(): boolean { return !!this.lastChild; }
  isSameNode(node: Node): boolean { return this === node; }

  // TODO: attributes?
  compareDocumentPosition(target: Node): number {
    let result = 0;
    if (this !== target) {
      let self = getParentNodeCount(this);
      let other = getParentNodeCount(target);
      if (self < other) {
        result += DOCUMENT_POSITION_FOLLOWING;
        // @ts-ignore - Method signature is handled
        if (this.contains(target))
          result += DOCUMENT_POSITION_CONTAINED_BY;
      }
      else if (other < self) {
        result += DOCUMENT_POSITION_PRECEDING;
        // @ts-ignore - Method signature is handled
        if (target.contains(this))
          result += DOCUMENT_POSITION_CONTAINS;
      }
      else if (self && other) {
        // Non-null assertion since we're checking for non-null above
        const childNodes = this.parentNode!.childNodes;
        if (childNodes.indexOf(this) < childNodes.indexOf(target))
          result += DOCUMENT_POSITION_FOLLOWING;
        else
          result += DOCUMENT_POSITION_PRECEDING;
      }
      if (!self || !other) {
        result += DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
        result += DOCUMENT_POSITION_DISCONNECTED;
      }
    }
    return result;
  }

  isEqualNode(node: Node): boolean {
    if (this === node)
      return true;
    if (this.nodeType === node.nodeType) {
      switch (this.nodeType) {
        case DOCUMENT_NODE:
        case DOCUMENT_FRAGMENT_NODE: {
          const aNodes = this.childNodes;
          const bNodes = node.childNodes;
          return aNodes.length === bNodes.length && aNodes.every((node, i) => node.isEqualNode(bNodes[i]));
        }
      }
      return this.toString() === node.toString();
    }
    return false;
  }

  /**
   * @protected
   */
  // @ts-ignore - Override is valid
  override _getParent(): Node | null {
    return this.parentNode;
  }

  /**
   * Calling it on an element inside a standard web page will return an HTMLDocument object representing the entire page (or <iframe>).
   * Calling it on an element inside a shadow DOM will return the associated ShadowRoot.
   * @return {ShadowRoot | HTMLDocument}
   */
  getRootNode(): Node {
    // @ts-ignore - This is a valid operation, the types are constrained correctly at runtime
    let root: Node = this;
    while (root.parentNode) {
      // @ts-ignore - This is a valid operation, the types are constrained correctly at runtime
      root = root.parentNode;
    }
    return root;
  }
}

/**
 * Extend the Node interface to support symbol indexing
 */
// @ts-ignore - Interface compatibility with EventTarget is handled
export interface Node {
  [NEXT]: Node | null;
  [PREV]: Node | null;
  [END]?: Node;
  [key: symbol]: any;
}
