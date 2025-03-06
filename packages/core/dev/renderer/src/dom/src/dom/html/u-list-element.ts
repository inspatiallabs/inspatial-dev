// @ts-ignore - Ignoring TS extension import error
import {HTMLElement} from './element.ts';
// @ts-ignore - Ignoring TS extension import error
import { registerHTMLClass } from "../shared/register-html-class.ts";

const tagName = "ul";
  

/**
 * @implements globalThis.HTMLUListElement
 */
export class HTMLUListElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = 'ul') {
    super(ownerDocument, localName);
  }
}

registerHTMLClass(tagName, HTMLUListElement);
