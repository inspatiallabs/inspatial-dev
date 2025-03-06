// @ts-ignore - Ignoring TS extension import error
import { registerHTMLClass } from '../shared/register-html-class.ts';
// @ts-ignore - Ignoring TS extension import error
import {HTMLElement} from './element.ts';

const tagName = "main";

/**
 * @implements globalThis.HTMLMainElement
 */
export class HTMLMainElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = tagName) {
    super(ownerDocument, localName);
  }
}

registerHTMLClass(tagName, HTMLMainElement);
