/**
 * Custom DocumentFragment implementation for testing
 */

// @ts-ignore - Ignoring TS extension import error
import { NodeList } from "../interface/node-list.ts";
// @ts-ignore - Ignoring TS extension import error
import { ELEMENT_NODE } from "../shared/constants.ts";

/**
 * A simple DocumentFragment implementation for tests
 * This uses direct array manipulation rather than the complex node linking
 */
export class TestDocumentFragment {
  private _children: any[] = [];
  public ownerDocument: any;
  
  constructor(ownerDocument: any) {
    this.ownerDocument = ownerDocument;
  }
  
  /**
   * Get all child nodes
   */
  get childNodes(): NodeList {
    const nodeList = new NodeList();
    this._children.forEach(child => nodeList.push(child));
    return nodeList;
  }
  
  /**
   * Get only element child nodes
   */
  get children(): NodeList {
    const children = new NodeList();
    this._children.forEach(child => {
      if (child && child.nodeType === ELEMENT_NODE) {
        children.push(child);
      }
    });
    return children;
  }
  
  /**
   * Get number of element children
   */
  get childElementCount(): number {
    return this.children.length;
  }
  
  /**
   * Get first child node
   */
  get firstChild(): any {
    return this._children.length > 0 ? this._children[0] : null;
  }
  
  /**
   * Get last child node
   */
  get lastChild(): any {
    return this._children.length > 0 ? this._children[this._children.length - 1] : null;
  }
  
  /**
   * Add a node to the end of the children list
   */
  appendChild(node: any): any {
    if (node) {
      // If the node is already a child of this node, remove it first
      const existingIndex = this._children.indexOf(node);
      if (existingIndex !== -1) {
        this._children.splice(existingIndex, 1);
      }
      
      // Add the node to our children
      this._children.push(node);
      node.parentNode = this;
    }
    return node;
  }
  
  /**
   * Insert a node before a reference node
   */
  insertBefore(newNode: any, referenceNode: any): any {
    if (newNode) {
      // If the node is already a child of this node, remove it first
      const existingIndex = this._children.indexOf(newNode);
      if (existingIndex !== -1) {
        this._children.splice(existingIndex, 1);
      }
      
      // If reference node is null or not found, append to the end
      const refIndex = referenceNode ? this._children.indexOf(referenceNode) : -1;
      if (refIndex === -1) {
        this._children.push(newNode);
      } else {
        this._children.splice(refIndex, 0, newNode);
      }
      
      newNode.parentNode = this;
    }
    return newNode;
  }
  
  /**
   * Remove a child node
   */
  removeChild(node: any): any {
    const index = this._children.indexOf(node);
    if (index !== -1) {
      this._children.splice(index, 1);
      node.parentNode = null;
    }
    return node;
  }
} 