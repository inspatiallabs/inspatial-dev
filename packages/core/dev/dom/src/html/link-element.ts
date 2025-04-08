// @ts-ignore - Ignoring TS extension import error
import {registerHTMLClass} from '../shared/register-html-class.ts';
// @ts-ignore - Ignoring TS extension import error
import {booleanAttribute, stringAttribute} from '../shared/attributes.ts';
// @ts-ignore - Ignoring TS extension import error
import type {ElementNode} from '../shared/attributes.ts';

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
  get disabled(): boolean { return booleanAttribute.get(this as unknown as ElementNode, 'disabled'); }
  set disabled(value: boolean) { booleanAttribute.set(this as unknown as ElementNode, 'disabled', value); }

  get href(): string { return stringAttribute.get(this as unknown as ElementNode, 'href'); }
  set href(value: string) { stringAttribute.set(this as unknown as ElementNode, 'href', value); }

  get hreflang(): string { return stringAttribute.get(this as unknown as ElementNode, 'hreflang'); }
  set hreflang(value: string) { stringAttribute.set(this as unknown as ElementNode, 'hreflang', value); }

  get media(): string { return stringAttribute.get(this as unknown as ElementNode, 'media'); }
  set media(value: string) { stringAttribute.set(this as unknown as ElementNode, 'media', value); }

  get rel(): string { return stringAttribute.get(this as unknown as ElementNode, 'rel'); }
  set rel(value: string) { stringAttribute.set(this as unknown as ElementNode, 'rel', value); }

  get type(): string { return stringAttribute.get(this as unknown as ElementNode, 'type'); }
  set type(value: string) { stringAttribute.set(this as unknown as ElementNode, 'type', value); }
  /* c8 ignore stop */

}

registerHTMLClass(tagName, HTMLLinkElement);

