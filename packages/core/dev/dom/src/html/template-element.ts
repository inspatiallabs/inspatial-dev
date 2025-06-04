// @ts-ignore - Ignoring TS extension import error
import {CONTENT, PRIVATE} from '../shared/symbols.ts';

// @ts-ignore - Ignoring TS extension import error
import {registerHTMLClass} from '../shared/register-html-class.ts';

// @ts-ignore - Ignoring TS extension import error
import {HTMLElement} from './element.ts';
// @ts-ignore - Ignoring TS extension import error
import type {DocumentFragment} from '../interface/document-fragment.ts';

const tagName = 'template';

/**
 * @implements globalThis.HTMLTemplateElement
 */
export class HTMLTemplateElement extends HTMLElement {
  [CONTENT]: DocumentFragment;

  constructor(ownerDocument: any) {
    super(ownerDocument, tagName);
    const content = this.ownerDocument.createDocumentFragment();
    (this[CONTENT] = content)[PRIVATE] = this;
  }

  get content(): DocumentFragment {
    if (this.hasChildNodes() && !this[CONTENT].hasChildNodes()) {
      for (const node of this.childNodes)
        this[CONTENT].appendChild(node.cloneNode(true));
    }
    return this[CONTENT];
  }
}

registerHTMLClass(tagName, HTMLTemplateElement);

