// https://dom.spec.whatwg.org/#interface-nonelementparentnode
// Document, DocumentFragment

// @ts-ignore - Ignoring TS extension import error
import { ELEMENT_NODE } from "../shared/constants.ts";
// @ts-ignore - Ignoring TS extension import error
import { END, NEXT } from "../shared/symbols.ts";
// @ts-ignore - Ignoring TS extension import error
import { nonElementAsJSON } from "../shared/jsdon.ts";

// @ts-ignore - Ignoring TS extension import error
import { ParentNode } from "./parent-node.ts";

export class NonElementParentNode extends ParentNode {
  getElementById(id: string): any {
    let next = (this as any)[NEXT];
    
    // Safely traverse the DOM, handling null nodes
    while (next && next !== this) {
      // Check for null before accessing nodeType
      if (next && next.nodeType === ELEMENT_NODE && next.id === id) {
        return next;
      }
      next = next[NEXT];
    }
    
    return null;
  }

  // @ts-ignore - Return type differs from base class but matches implementation
  override cloneNode(deep?: boolean): any {
    const { ownerDocument, constructor } = this as any;
    const nonEPN = new constructor(ownerDocument);
    if (deep) {
      const { [END]: end } = nonEPN;
      for (const node of (this as any).childNodes)
        nonEPN.insertBefore(node.cloneNode(deep), end);
    }
    return nonEPN;
  }

  override toString(): string {
    const { childNodes, localName } = this as any;
    return `<${localName}>${childNodes.join("")}</${localName}>`;
  }

  toJSON(): any[] {
    const json: any[] = [];
    nonElementAsJSON(this, json);
    return json;
  }
}
