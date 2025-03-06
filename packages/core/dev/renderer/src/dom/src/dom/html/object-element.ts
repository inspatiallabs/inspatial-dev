// @ts-ignore - Ignoring TS extension import error
import {HTMLElement} from './element.ts';

/**
 * @implements globalThis.HTMLObjectElement
 */
export class HTMLObjectElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = 'object') {
    super(ownerDocument, localName);
  }
}
