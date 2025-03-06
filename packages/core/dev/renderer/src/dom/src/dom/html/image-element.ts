// @ts-ignore - Ignoring TS extension import error
import {registerHTMLClass} from '../shared/register-html-class.ts';
// @ts-ignore - Ignoring TS extension import error
import {numericAttribute, stringAttribute} from '../shared/attributes.ts';

// @ts-ignore - Ignoring TS extension import error
import {HTMLElement} from './element.ts';

const tagName = 'img';

/**
 * @implements globalThis.HTMLImageElement
 */
export class HTMLImageElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = tagName) {
    super(ownerDocument, localName);
  }

  /* c8 ignore start */
  get alt(): string { return stringAttribute.get(this, 'alt'); }
  set alt(value: string) { stringAttribute.set(this, 'alt', value); }

  get sizes(): string { return stringAttribute.get(this, 'sizes'); }
  set sizes(value: string) { stringAttribute.set(this, 'sizes', value); }

  get src(): string { return stringAttribute.get(this, 'src'); }
  set src(value: string) { stringAttribute.set(this, 'src', value); }

  get srcset(): string { return stringAttribute.get(this, 'srcset'); }
  set srcset(value: string) { stringAttribute.set(this, 'srcset', value); }

  override get title(): string { return stringAttribute.get(this, 'title'); }
  override set title(value: string) { stringAttribute.set(this, 'title', value); }

  get height(): number { return numericAttribute.get(this, 'height'); }
  set height(value: number) { numericAttribute.set(this, 'height', value); }

  get width(): number { return numericAttribute.get(this, 'width'); }
  set width(value: number) { numericAttribute.set(this, 'width', value); }
  /* c8 ignore stop */
}

registerHTMLClass(tagName, HTMLImageElement); 