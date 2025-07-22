// @ts-ignore - Ignoring TS extension import error
import {DOCUMENT_FRAGMENT_NODE} from '../shared/constants.ts';
// @ts-ignore - Ignoring TS extension import error
import {NonElementParentNode} from '../mixin/non-element-parent-node.ts';
// @ts-ignore - Ignoring TS extension import error
import type {Document} from './document.ts';
// @ts-ignore - Ignoring TS extension import error
import {NodeList} from './node-list.ts';
// @ts-ignore - Ignoring TS extension import error
import {ELEMENT_NODE} from '../shared/constants.ts';

/**
 * Represents a minimal document object that has no parent
 * Used as a lightweight container for a group of nodes
 * @implements globalThis.DocumentFragment
 */
export class DocumentFragment extends NonElementParentNode {
  // Track children in an array for consistent behavior across environments
  private _children: any[] = [];
  
  /**
   * Creates a new DocumentFragment
   * @param ownerDocument - The document that owns this fragment
   */
  constructor(ownerDocument: Document) {
    super(ownerDocument, '#document-fragment', DOCUMENT_FRAGMENT_NODE);
  }
  
  /**
   * Override appendChild to ensure children are tracked consistently
   */
  override appendChild(node: any): any {
    // Add to internal children tracking
    if (node) {
      const existingIndex = this._children ? this._children.indexOf(node) : -1;
      if (existingIndex !== -1) {
        this._children.splice(existingIndex, 1);
      }
      this._children.push(node);
    }
    
    // Call original implementation
    return super.appendChild(node);
  }
  
  /**
   * Override insertBefore to ensure children are tracked consistently
   */
  override insertBefore(node: any, reference: any): any {
    // Add to internal children tracking
    if (node) {
      const existingIndex = this._children ? this._children.indexOf(node) : -1;
      if (existingIndex !== -1) {
        this._children.splice(existingIndex, 1);
      }
      
      const refIndex = reference ? this._children.indexOf(reference) : -1;
      if (refIndex === -1) {
        this._children.push(node);
      } else {
        this._children.splice(refIndex, 0, node);
      }
    }
    
    // Call original implementation
    return super.insertBefore(node, reference);
  }
  
  /**
   * Override removeChild to ensure children are tracked consistently
   */
  override removeChild(node: any): any {
    // Remove from internal children tracking
    if (node) {
      const existingIndex = this._children ? this._children.indexOf(node) : -1;
      if (existingIndex !== -1) {
        this._children.splice(existingIndex, 1);
      }
    }
    
    // Call original implementation
    return super.removeChild(node);
  }
  
  /**
   * Override children getter to use internal tracking
   */
  override get children(): NodeList {
    const children = new NodeList();
    if (this._children) {
      this._children.forEach(node => {
        if (node && node.nodeType === ELEMENT_NODE) {
          children.push(node);
        }
      });
    }
    return children;
  }
  
  /**
   * Override childNodes getter to use internal tracking
   */
  override get childNodes(): NodeList {
    const childNodes = new NodeList();
    if (this._children) {
      this._children.forEach(node => {
        childNodes.push(node);
      });
    }
    return childNodes;
  }
  
  /**
   * Override childElementCount getter to match children length
   */
  override get childElementCount(): number {
    return this.children.length;
  }
}
