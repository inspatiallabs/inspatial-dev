// @ts-ignore - Ignoring TS extension import error
import {registerHTMLClass} from '../shared/register-html-class.ts';
// @ts-ignore - Ignoring TS extension import error
import {booleanAttribute, stringAttribute} from '../shared/attributes.ts';

// @ts-ignore - Ignoring TS extension import error
import {HTMLElement} from './element.ts';

const tagName = 'input';

/**
 * @implements globalThis.HTMLInputElement
 */
export class HTMLInputElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = tagName) {
    super(ownerDocument, localName);
  }

  /* c8 ignore start */
  get autofocus(): boolean | number { return booleanAttribute.get(this, 'autofocus') || -1; }
  set autofocus(value: boolean) { booleanAttribute.set(this, 'autofocus', value); }

  get disabled(): boolean { return booleanAttribute.get(this, 'disabled'); }
  set disabled(value: boolean) { booleanAttribute.set(this, 'disabled', value); }

  get name(): string | null { return this.getAttribute('name'); }
  set name(value: string) { this.setAttribute('name', value); }

  get placeholder(): string | null { return this.getAttribute('placeholder'); }
  set placeholder(value: string) { this.setAttribute('placeholder', value); }

  get type(): string | null { return this.getAttribute('type'); }
  set type(value: string) { this.setAttribute('type', value); }

  get value(): string | null { return this.getAttribute('value'); }
  set value(value: string) { this.setAttribute('value', value); }
  /* c8 ignore stop */
}

registerHTMLClass(tagName, HTMLInputElement); 