// @ts-ignore - Ignoring TS extension import error
import {registerHTMLClass} from '../shared/register-html-class.ts';
// @ts-ignore - Ignoring TS extension import error
import {HTMLElement} from './element.ts';

const tagName = 'section';

/**
 * The HTMLSectionElement interface represents a <section> HTML element.
 * The <section> element represents a generic section of a document or application.
 * @implements globalThis.HTMLSectionElement
 */
export class HTMLSectionElement extends HTMLElement {
  /**
   * Constructor for the HTMLSectionElement
   * @param {any} ownerDocument - The document that owns this element
   * @param {string} localName - The local name of the element
   */
  constructor(ownerDocument: any = null, localName: string = tagName) {
    super(ownerDocument, localName);
  }
}

// Register the HTMLSectionElement with the 'section' tag name
registerHTMLClass(tagName, HTMLSectionElement);
