// @ts-ignore - Ignoring TS extension import error
import {registerHTMLClass} from '../shared/register-html-class.ts';
// @ts-ignore - Ignoring TS extension import error
import {booleanAttribute, stringAttribute} from '../shared/attributes.ts';

// @ts-ignore - Ignoring TS extension import error
import {HTMLElement} from './element.ts';

const tagName = 'iframe';

/**
 * @implements globalThis.HTMLIFrameElement
 */
export class HTMLIFrameElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = tagName) {
    super(ownerDocument, localName);
  }

  /* c8 ignore start */
  get src(): string { return stringAttribute.get(this, 'src'); }
  set src(value: string) { stringAttribute.set(this, 'src', value); }

  get srcdoc(): string { return stringAttribute.get(this, "srcdoc"); }
  set srcdoc(value: string) { stringAttribute.set(this, "srcdoc", value); }

  get name(): string { return stringAttribute.get(this, "name"); }
  set name(value: string) { stringAttribute.set(this, "name", value); }

  get allow(): string { return stringAttribute.get(this, "allow"); }
  set allow(value: string) { stringAttribute.set(this, "allow", value); }

  get allowFullscreen(): boolean { return booleanAttribute.get(this, "allowfullscreen"); }
  set allowFullscreen(value: boolean) { booleanAttribute.set(this, "allowfullscreen", value); }
  
  get referrerPolicy(): string { return stringAttribute.get(this, "referrerpolicy"); }
  set referrerPolicy(value: string) { stringAttribute.set(this, "referrerpolicy", value); }
  
  get loading(): string { return stringAttribute.get(this, "loading"); }
  set loading(value: string) { stringAttribute.set(this, "loading", value); }
  /* c8 ignore stop */
}

registerHTMLClass(tagName, HTMLIFrameElement);
