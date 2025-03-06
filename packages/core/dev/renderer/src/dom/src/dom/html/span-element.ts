// @ts-ignore - Ignoring TS extension import error
import {HTMLElement} from './element.ts';
// @ts-ignore - Ignoring TS extension import error
import { registerHTMLClass } from "../shared/register-html-class.ts";

const tagName = "span";

/**
 * @implements globalThis.HTMLSpanElement
 */
export class HTMLSpanElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = tagName) {
    super(ownerDocument, localName);
  }
}

registerHTMLClass(tagName, HTMLSpanElement);
