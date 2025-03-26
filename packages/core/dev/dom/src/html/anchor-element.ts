// @ts-ignore - Ignoring TS extension import error
import { registerHTMLClass } from "../shared/register-html-class.ts";
// @ts-ignore - Ignoring TS extension import error
import { stringAttribute } from "../shared/attributes.ts";
// @ts-ignore - Ignoring TS extension import error
import { HTMLElement } from "./element.ts";

const tagName = "a";

/**
 * @implements globalThis.HTMLAnchorElement
 */
class HTMLAnchorElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = tagName) {
    super(ownerDocument, localName);
  }

  /* c8 ignore start */ // copy paste from img.src, already covered
  get href(): string { return encodeURI(decodeURI(stringAttribute.get(this, 'href'))); }
  set href(value: string) { stringAttribute.set(this, 'href', decodeURI(value)); }

  get download(): string { return encodeURI(decodeURI(stringAttribute.get(this, 'download'))); }
  set download(value: string) { stringAttribute.set(this, 'download', decodeURI(value)); }

  get target(): string { return stringAttribute.get(this, 'target'); }
  set target(value: string) { stringAttribute.set(this, 'target', value); }

  get type(): string { return stringAttribute.get(this, 'type'); }
  set type(value: string) { stringAttribute.set(this, 'type', value); }

  get rel(): string { return stringAttribute.get(this, 'rel'); }
  set rel(value: string) { stringAttribute.set(this, 'rel', value); }
  /* c8 ignore stop */

}

registerHTMLClass(tagName, HTMLAnchorElement);

export {HTMLAnchorElement};
