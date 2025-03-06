// https://dom.spec.whatwg.org/#concept-live-range

// @ts-ignore - Ignoring TS extension import error
import {END, NEXT, PREV, START} from '../shared/symbols.ts';

// @ts-ignore - Ignoring TS extension import error
import {SVGElement} from '../svg/element.ts';

// @ts-ignore - Ignoring TS extension import error
import {getEnd, setAdjacent} from '../shared/util/utils.ts';

// @ts-ignore - Ignoring TS extension import error
import {Node} from './node.ts';

// @ts-ignore - Ignoring TS extension import error
import {DocumentFragment} from './document-fragment.ts';

// @ts-ignore - Ignoring TS extension import error
import {remove} from '../mixin/child-node.ts';

/**
 * Helper function to delete contents of a range
 */
const deleteContents = (
  range: { [START]: Node | null; [END]: Node | null }, 
  fragment: DocumentFragment | null = null
): void => {
  const start = range[START];
  const end = range[END];
  
  if (!start || !end) return; // Ensure both start and end nodes are present
  
  // @ts-ignore - Safe access to symbol properties in this implementation
  const startPrev = start[PREV]; // Store previous node of start
  // @ts-ignore - Safe access to symbol properties in this implementation
  const endNext = end[NEXT]; // Store next node of end
  
  // @ts-ignore - setAdjacent can handle null values in this implementation
  setAdjacent(startPrev, endNext); // Set adjacency between nodes
  
  // We've already checked that start is not null above
  // @ts-ignore - Type safety handled through runtime checks
  let currentNode: Node = start;
  
  do {
    // @ts-ignore - getEnd is used safely in this implementation
    const after = getEnd(currentNode);
    // @ts-ignore - Symbol access is valid in this implementation
    const next = after === end ? after : after[NEXT];
    
    if (fragment) {
      // @ts-ignore - This is a valid call in this implementation
      fragment.insertBefore(currentNode, fragment[END]);
    } else {
      // @ts-ignore - remove function handles the node removal in this implementation
      remove(currentNode[PREV], currentNode, currentNode[NEXT]);
    }
    
    // Move to next node with explicit null check
    if (next === null) break;
    
    // Use a type assertion to satisfy TypeScript
    // @ts-ignore - Type safety handled through previous null check
    currentNode = next;
    
    // Continue checking for null (redundant but makes TypeScript happy)
    if (!currentNode) break;
    
  } while (currentNode !== end);
};

/**
 * @implements globalThis.Range
 */
export class Range {
  /**
   * Start node of the range
   */
  [START]: Node | null;
  
  /**
   * End node of the range
   */
  [END]: Node | null;
  
  /**
   * Common ancestor container of the range
   */
  commonAncestorContainer: Node | null;
  
  /**
   * Creates a new Range
   */
  constructor() {
    this[START] = null;
    this[END] = null;
    this.commonAncestorContainer = null;
  }

  /* TODO: this is more complicated than it looks
  setStart(node: Node, offset: number): void {
    this[START] = node.childNodes[offset];
  }

  setEnd(node: Node, offset: number): void {
    this[END] = getEnd(node.childNodes[offset]);
  }
  //*/

  /**
   * Inserts a node at the start of the Range
   */
  insertNode(newNode: Node): void {
    if (!this[END] || !this[START]) return;
    const parent = this[END].parentNode;
    if (parent) {
      parent.insertBefore(newNode, this[START]);
    }
  }

  /**
   * Selects a node and its contents
   */
  selectNode(node: Node): void {
    this[START] = node;
    this[END] = getEnd(node);
    this.commonAncestorContainer = node.parentNode;
  }

  /**
   * Selects the contents of a node
   */
  selectNodeContents(node: Node): void {
    this[START] = node.firstChild || node;
    this[END] = node.lastChild || node;
    this.commonAncestorContainer = node;
  }

  /**
   * Surrounds the contents of the Range with the specified node
   */
  surroundContents(parentNode: Node): void {
    // @ts-ignore - This is a valid call in this implementation
    parentNode.appendChild(this.extractContents());
    this.insertNode(parentNode);
  }

  /**
   * Sets the start position of the Range to be before a node
   */
  setStartBefore(node: Node): void {
    this[START] = node;
    this.commonAncestorContainer = node.parentNode;
  }

  /**
   * Sets the start position of the Range to be after a node
   */
  setStartAfter(node: Node): void {
    this[START] = node.nextSibling || getEnd(node);
    this.commonAncestorContainer = node.parentNode;
  }

  /**
   * Sets the end position of the Range to be before a node
   */
  setEndBefore(node: Node): void {
    this[END] = node[PREV] || node;
    this.commonAncestorContainer = node.parentNode;
  }

  /**
   * Sets the end position of the Range to be after a node
   */
  setEndAfter(node: Node): void {
    this[END] = getEnd(node);
    this.commonAncestorContainer = node.parentNode;
  }

  /**
   * Returns a DocumentFragment containing a copy of the Range's contents
   */
  cloneContents(): DocumentFragment {
    if (!this[START] || !this[END]) {
      // @ts-ignore - This is a valid way to create a DocumentFragment in this implementation
      return new DocumentFragment();
    }
    
    // @ts-ignore - This is a valid way to create a DocumentFragment in this implementation
    const fragment = new DocumentFragment();
    let {[START]: start, [END]: end} = this;
    do {
      if (start) {
        // @ts-ignore - cloneNode accepts a boolean parameter in this implementation
        fragment.appendChild(start.cloneNode(true));
        start = getEnd(start)[NEXT];
      }
    } while (start !== end);
    return fragment;
  }

  /**
   * Removes the contents of the Range from the Document
   */
  deleteContents(): void {
    deleteContents(this);
  }

  /**
   * Moves contents of the Range from the document tree into a DocumentFragment
   */
  extractContents(): DocumentFragment {
    // @ts-ignore - This is a valid way to create a DocumentFragment in this implementation
    const fragment = new DocumentFragment();
    deleteContents(this, fragment);
    return fragment;
  }

  /**
   * Creates a new DocumentFragment containing the provided HTML string
   */
  createContextualFragment(html: string): DocumentFragment {
    if (!this[START]) {
      throw new Error('Range not initialized');
    }
    
    let template: Node;
    const {ownerDocument} = this[START];
    
    // Handle SVG elements specially
    if (this[START] instanceof SVGElement) {
      template = ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'svg');
      // @ts-ignore - innerHTML exists on template in this implementation
      template.innerHTML = html;
    } else {
      // @ts-ignore - This is a valid way to create a template element in this implementation
      template = ownerDocument.createElement('template');
      // @ts-ignore - innerHTML exists on template in this implementation
      template.innerHTML = html;
      // @ts-ignore - content property exists on template elements
      template = template.content;
    }
    
    // @ts-ignore - This is a valid way to create a DocumentFragment in this implementation
    const fragment = new DocumentFragment();
    while (template.firstChild) {
      fragment.appendChild(template.firstChild);
    }
    
    return fragment;
  }

  /**
   * Returns a Range object with boundary points identical to the cloned Range
   */
  cloneRange(): Range {
    const range = new Range();
    range[START] = this[START];
    range[END] = this[END];
    range.commonAncestorContainer = this.commonAncestorContainer;
    return range;
  }
  
  /**
   * Returns true if the range is collapsed (empty)
   */
  get collapsed(): boolean {
    return this[START] === this[END];
  }
}
