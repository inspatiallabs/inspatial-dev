// @ts-ignore - Ignoring TS extension import error
import { registerHTMLClass } from "../shared/register-html-class.ts";
// @ts-ignore - Ignoring TS extension import error
import { SHEET } from "../shared/symbols.ts";

// @ts-ignore - Ignoring TS extension import error
import {TextElement} from './text-element.ts';

// @ts-ignore - Ignoring TS extension import error
import { parseStyleElement } from './style-element.parse.ts';

const tagName = 'style';

/**
 * @implements globalThis.HTMLStyleElement
 */
export class HTMLStyleElement extends TextElement {
  constructor(ownerDocument: any) {
    super(ownerDocument, tagName);
    // @ts-ignore - Ignoring for symbol property access
    this[SHEET] = null;
  }

  get sheet(): any {
    // @ts-ignore - Ignoring for symbol property access
    const sheet = this[SHEET];
    if (sheet !== null) {
      return sheet;
    }
    // @ts-ignore - Ignoring for symbol property access
    return this[SHEET] = parseStyleElement(this.textContent || '');
  }

  override get innerHTML(): string {
    // @ts-ignore - Access to base class property
    return super.innerHTML || '';
  }
  override set innerHTML(value: string) {
    // @ts-ignore - Access to base class property
    super.textContent = value;
    // @ts-ignore - Ignoring for symbol property access
    this[SHEET] = null;
  }
  override get innerText(): string {
    // @ts-ignore - Access to base class property
    return super.innerText || '';
  }
  override set innerText(value: string) {
    // @ts-ignore - Access to base class property
    super.textContent = value;
    // @ts-ignore - Ignoring for symbol property access
    this[SHEET] = null;
  }
  override get textContent(): string {
    // @ts-ignore - Access to base class property
    return super.textContent || '';
  }
  override set textContent(value: string) {
    // @ts-ignore - Access to base class property
    super.textContent = value;
    // @ts-ignore - Ignoring for symbol property access
    this[SHEET] = null;
  }
}

registerHTMLClass(tagName, HTMLStyleElement);
