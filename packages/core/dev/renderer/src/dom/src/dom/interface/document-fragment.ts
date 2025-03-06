// @ts-ignore - Ignoring TS extension import error
import {DOCUMENT_FRAGMENT_NODE} from '../shared/constants.ts';
// @ts-ignore - Ignoring TS extension import error
import {NonElementParentNode} from '../mixin/non-element-parent-node.ts';
// @ts-ignore - Ignoring TS extension import error
import {Document} from './document.ts';

/**
 * Represents a minimal document object that has no parent
 * Used as a lightweight container for a group of nodes
 * @implements globalThis.DocumentFragment
 */
export class DocumentFragment extends NonElementParentNode {
  /**
   * Creates a new DocumentFragment
   * @param ownerDocument - The document that owns this fragment
   */
  constructor(ownerDocument: Document) {
    super(ownerDocument, '#document-fragment', DOCUMENT_FRAGMENT_NODE);
  }
}
