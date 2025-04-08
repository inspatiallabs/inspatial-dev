/**
 * Mock ParentNode implementation specifically for tests
 */

// @ts-ignore - Ignoring TS extension import error
import { ELEMENT_NODE } from "../src/shared/constants.ts";
// @ts-ignore - Ignoring TS extension import error
import { NodeList } from "../src/interface/node-list.ts";

/**
 * Minimal ParentNode implementation for testing
 */
export class MockParentNode {
  private _childNodes: any[] = [];
  
  get childNodes() {
    const nodeList = new NodeList();
    this._childNodes.forEach(node => nodeList.push(node));
    return nodeList;
  }
  
  get children() {
    const children = new NodeList();
    this._childNodes.forEach(node => {
      if (node.nodeType === ELEMENT_NODE) {
        children.push(node);
      }
    });
    return children;
  }
  
  get childElementCount() {
    return this.children.length;
  }
  
  get firstElementChild() {
    for (const node of this._childNodes) {
      if (node.nodeType === ELEMENT_NODE) {
        return node;
      }
    }
    return null;
  }
  
  get lastElementChild() {
    for (let i = this._childNodes.length - 1; i >= 0; i--) {
      const node = this._childNodes[i];
      if (node.nodeType === ELEMENT_NODE) {
        return node;
      }
    }
    return null;
  }
  
  appendChild(node: any) {
    this._childNodes.push(node);
    return node;
  }
  
  insertBefore(newNode: any, referenceNode: any) {
    const index = referenceNode ? this._childNodes.indexOf(referenceNode) : -1;
    if (index === -1) {
      this._childNodes.push(newNode);
    } else {
      this._childNodes.splice(index, 0, newNode);
    }
    return newNode;
  }
  
  removeChild(node: any) {
    const index = this._childNodes.indexOf(node);
    if (index !== -1) {
      this._childNodes.splice(index, 1);
    }
    return node;
  }
  
  get firstChild() {
    return this._childNodes.length > 0 ? this._childNodes[0] : null;
  }
  
  get lastChild() {
    return this._childNodes.length > 0 ? this._childNodes[this._childNodes.length - 1] : null;
  }
} 