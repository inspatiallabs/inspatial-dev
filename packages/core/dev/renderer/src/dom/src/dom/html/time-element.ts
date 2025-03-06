// @ts-ignore - Ignoring TS extension import error
import {stringAttribute} from '../shared/attributes.ts';
// @ts-ignore - Ignoring TS extension import error
import {registerHTMLClass} from '../shared/register-html-class.ts';

// @ts-ignore - Ignoring TS extension import error
import {HTMLElement} from './element.ts';

/**
 * @implements globalThis.HTMLTimeElement
 */
export class HTMLTimeElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = 'time') {
    super(ownerDocument, localName);
  }

  /**
   * @type {string}
   */
  get dateTime(): string { return stringAttribute.get(this, 'datetime'); }
  set dateTime(value: string) { stringAttribute.set(this, 'datetime', value); }
}

registerHTMLClass('time', HTMLTimeElement);

