// @ts-ignore - Ignoring TS extension import error
import {
  DOCUMENT_NODE,
  ELEMENT_NODE,
  TEXT_NODE,
  CDATA_SECTION_NODE,
  COMMENT_NODE,
  SHOW_ALL,
  SHOW_ELEMENT,
  SHOW_CDATA_SECTION,
  SHOW_COMMENT,
  SHOW_TEXT,
} from "../shared/constants.ts";

// @ts-ignore - Ignoring TS extension import error
import { PRIVATE, END, NEXT } from "../shared/symbols.ts";

// @ts-ignore - Ignoring TS extension import error
import { Node } from "./node.ts";

interface NodeWithType {
  nodeType: number;
}

const isOK = ({ nodeType }: NodeWithType, mask: number): number => {
  switch (nodeType) {
    case ELEMENT_NODE:
      return mask & SHOW_ELEMENT;
    case TEXT_NODE:
      return mask & SHOW_TEXT;
    case COMMENT_NODE:
      return mask & SHOW_COMMENT;
    case CDATA_SECTION_NODE:
      return mask & SHOW_CDATA_SECTION;
  }
  return 0;
};

interface PrivateTreeWalkerData {
  i: number;
  nodes: Node[];
}

/**
 * @implements globalThis.TreeWalker
 */
export class TreeWalker {
  root: Node;
  currentNode: Node | null;
  whatToShow: number;
  // @ts-ignore - Symbol property
  [PRIVATE]: PrivateTreeWalkerData;

  constructor(root: Node, whatToShow: number = SHOW_ALL) {
    this.root = root;
    this.currentNode = root;
    this.whatToShow = whatToShow;

    // @ts-ignore - Symbol property access
    let { [NEXT]: next, [END]: end } = root;
    if (root.nodeType === DOCUMENT_NODE) {
      const { documentElement } = root as any;
      next = documentElement;
      // @ts-ignore - Symbol property access
      end = documentElement[END];
    }

    const nodes: Node[] = [];
    while (next && next !== end) {
      if (isOK(next, whatToShow)) nodes.push(next);
      // @ts-ignore - Symbol property access
      next = next[NEXT];
    }

    // @ts-ignore - Symbol property assignment
    this[PRIVATE] = { i: 0, nodes };
  }

  nextNode(): Node | null {
    // @ts-ignore - Symbol property access
    const $ = this[PRIVATE];
    this.currentNode = $.i < $.nodes.length ? $.nodes[$.i++] : null;
    return this.currentNode;
  }
}

// Add type definition for symbol properties
export interface TreeWalker {
  [PRIVATE]: PrivateTreeWalkerData;
}
