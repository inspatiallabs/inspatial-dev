// @ts-ignore - Ignoring TS extension import error
import {registerHTMLClass} from '../shared/register-html-class.ts';

// @ts-ignore - Ignoring TS extension import error
import {HTMLElement} from './element.ts';

const tagName = 'h1';

/**
 * @implements globalThis.HTMLHeadingElement
 */
export class HTMLHeadingElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = tagName) {
    super(ownerDocument, localName);
  }
}

registerHTMLClass([tagName, 'h2', 'h3', 'h4', 'h5', 'h6'], HTMLHeadingElement);

