// @ts-ignore - Ignoring TS extension import error
import { registerHTMLClass } from '../shared/register-html-class.ts';
import {HTMLElement} from './element.ts';

const tagName = "div";

/**
 * @implements globalThis.HTMLDivElement
 */
export class HTMLDivElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = tagName) {
    super(ownerDocument, localName);
  }
}

// Register the HTMLDivElement with the 'div' tag name
registerHTMLClass(tagName, HTMLDivElement);


