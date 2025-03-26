// @ts-ignore - Ignoring TS extension import error
import {registerHTMLClass} from '../shared/register-html-class.ts';
// @ts-ignore - Ignoring TS extension import error
import {booleanAttribute, stringAttribute} from '../shared/attributes.ts';

// @ts-ignore - Ignoring TS extension import error
import {HTMLElement} from './element.ts';

const tagName = 'link';

/**
 * @implements globalThis.HTMLLinkElement
 */
export class HTMLLinkElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = tagName) {
    super(ownerDocument, localName);
  }

  /* c8 ignore start */ // copy paste from img.src, already covered
  get disabled(): boolean { return booleanAttribute.get(this, 'disabled'); }
  set disabled(value: boolean) { booleanAttribute.set(this, 'disabled', value); }

  get href(): string { return stringAttribute.get(this, 'href'); }
  set href(value: string) { stringAttribute.set(this, 'href', value); }

  get hreflang(): string { return stringAttribute.get(this, 'hreflang'); }
  set hreflang(value: string) { stringAttribute.set(this, 'hreflang', value); }

  get media(): string { return stringAttribute.get(this, 'media'); }
  set media(value: string) { stringAttribute.set(this, 'media', value); }

  get rel(): string { return stringAttribute.get(this, 'rel'); }
  set rel(value: string) { stringAttribute.set(this, 'rel', value); }

  get type(): string { return stringAttribute.get(this, 'type'); }
  set type(value: string) { stringAttribute.set(this, 'type', value); }
  /* c8 ignore stop */

}

registerHTMLClass(tagName, HTMLLinkElement);

