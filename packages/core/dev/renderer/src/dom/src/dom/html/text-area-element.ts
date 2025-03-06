// @ts-ignore - Ignoring TS extension import error
import {registerHTMLClass} from '../shared/register-html-class.ts';
// @ts-ignore - Ignoring TS extension import error
import {booleanAttribute} from '../shared/attributes.ts';

// @ts-ignore - Ignoring TS extension import error
import {TextElement} from './text-element.ts';

const tagName = 'textarea';

/**
 * @implements globalThis.HTMLTextAreaElement
 */
export class HTMLTextAreaElement extends TextElement {
  constructor(ownerDocument: any, localName: string = tagName) {
    super(ownerDocument, localName);
  }

  /* c8 ignore start */
  get disabled(): boolean { return booleanAttribute.get(this, 'disabled'); }
  set disabled(value: boolean) { booleanAttribute.set(this, 'disabled', value); }

  get name(): string | null { return this.getAttribute('name'); }
  set name(value: string) { this.setAttribute('name', value); }

  get placeholder(): string | null { return this.getAttribute('placeholder'); }
  set placeholder(value: string) { this.setAttribute('placeholder', value); }

  get type(): string | null { return this.getAttribute('type'); }
  set type(value: string) { this.setAttribute('type', value); }

  get value(): string | null { return this.textContent; }
  set value(content: string) { this.textContent = content; }
  /* c8 ignore stop */
}

registerHTMLClass(tagName, HTMLTextAreaElement);

