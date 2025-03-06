// @ts-ignore - Ignoring TS extension import error
import {HTMLElement} from './element.ts';
// @ts-ignore - Ignoring TS extension import error
import { registerHTMLClass } from "../shared/register-html-class.ts";

const tagName = "caption";


/**
 * @implements globalThis.HTMLTableCaptionElement
 */
export class HTMLTableCaptionElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = tagName) {
    super(ownerDocument, localName);
  }
}

registerHTMLClass(tagName, HTMLTableCaptionElement);
