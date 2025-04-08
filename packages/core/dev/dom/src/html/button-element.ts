// @ts-ignore - Ignoring TS extension import error
import {registerHTMLClass} from '../shared/register-html-class.ts';
// @ts-ignore - Ignoring TS extension import error
import {booleanAttribute} from '../shared/attributes.ts';
// @ts-ignore - Ignoring TS extension import error
import type {ElementNode} from '../shared/attributes.ts';

// @ts-ignore - Ignoring TS extension import error
import {HTMLElement} from './element.ts';

const tagName = 'button';

/**
 * @implements globalThis.HTMLButtonElement
 */
class HTMLButtonElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = tagName) {
    super(ownerDocument, localName);
  }

  /* c8 ignore start */
  get disabled(): boolean { return booleanAttribute.get(this as unknown as ElementNode, 'disabled'); }
  set disabled(value: boolean) { booleanAttribute.set(this as unknown as ElementNode, 'disabled', value); }

  get name(): string | null { return this.getAttribute('name'); }
  set name(value: string) { this.setAttribute('name', value); }

  get type(): string | null { return this.getAttribute('type'); }
  set type(value: string) { this.setAttribute('type', value); }
  /* c8 ignore stop */
}

registerHTMLClass(tagName, HTMLButtonElement);

export {HTMLButtonElement};
