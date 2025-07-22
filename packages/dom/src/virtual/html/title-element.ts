// @ts-ignore - Ignoring TS extension import error
import {registerHTMLClass} from '../shared/register-html-class.ts';

// @ts-ignore - Ignoring TS extension import error
import {TextElement} from './text-element.ts';

const tagName = 'title';

/**
 * @implements globalThis.HTMLTitleElement
 */
export class HTMLTitleElement extends TextElement {
  constructor(ownerDocument: any, localName: string = tagName) {
    super(ownerDocument, localName);
  }
}

registerHTMLClass(tagName, HTMLTitleElement);

