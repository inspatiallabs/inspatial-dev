// https://dom.spec.whatwg.org/#childnode
// CharacterData, DocumentType, Element

// @ts-ignore - Ignoring TS extension import error
import {ELEMENT_NODE} from '../shared/constants.ts';
// @ts-ignore - Ignoring TS extension import error
import {NEXT, PREV} from '../shared/symbols.ts';

// @ts-ignore - Ignoring TS extension import error
import {getEnd, setAdjacent} from '../shared/util/utils.ts';

// @ts-ignore - Ignoring TS extension import error
import {moCallback} from '../interface/mutation-observer.ts';
// @ts-ignore - Ignoring TS extension import error
import {disconnectedCallback} from '../interface/custom-element-registry.ts';

/**
 * Creates a document fragment from an array of nodes
 * @param {any} ownerDocument - The document that owns the fragment
 * @param {Node[]} nodes - Array of nodes to add to the fragment
 * @returns {DocumentFragment} A document fragment containing the nodes
 */
const asFragment = (ownerDocument: any, nodes: any[]): any => {
  const fragment = ownerDocument.createDocumentFragment();
  fragment.append(...nodes);
  return fragment;
};

/**
 * Inserts nodes before the reference node
 * @param {Node} node - The reference node
 * @param {Node[]} nodes - Nodes to insert before the reference node
 */
export const before = (node: any, nodes: any[]): void => {
  const {ownerDocument, parentNode} = node;
  if (parentNode)
    parentNode.insertBefore(
      asFragment(ownerDocument, nodes),
      node
    );
};

/**
 * Inserts nodes after the reference node
 * @param {Node} node - The reference node
 * @param {Node[]} nodes - Nodes to insert after the reference node
 */
export const after = (node: any, nodes: any[]): void => {
  const {ownerDocument, parentNode} = node;
  if (parentNode)
    parentNode.insertBefore(
      asFragment(ownerDocument, nodes),
      getEnd(node)[NEXT]
    );
};

/**
 * Replaces the reference node with the provided nodes
 * @param {Node} node - The reference node to replace
 * @param {Node[]} nodes - Nodes to insert in place of the reference node
 */
export const replaceWith = (node: any, nodes: any[]): void => {
  const {ownerDocument, parentNode} = node;
  if (parentNode) {
    if (nodes.includes(node))
      replaceWith(node, [node = node.cloneNode()]);
    parentNode.insertBefore(
      asFragment(ownerDocument, nodes),
      node
    );
    node.remove();
  }
};

/**
 * Removes a node from its parent and updates adjacent nodes
 * @param {Node|null} prev - The previous node
 * @param {Node} current - The node to remove
 * @param {Node|null} next - The next node
 */
export const remove = (prev: any, current: any, next: any): void => {
  const {parentNode, nodeType} = current;
  if (prev || next) {
    setAdjacent(prev, next);
    current[PREV] = null;
    getEnd(current)[NEXT] = null;
  }
  if (parentNode) {
    current.parentNode = null;
    moCallback(current, parentNode);
    if (nodeType === ELEMENT_NODE)
      disconnectedCallback(current);
  }
};
