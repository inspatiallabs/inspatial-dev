// @ts-ignore - Ignoring TS extension import error
import { HTMLElement } from "./element.ts";
// @ts-ignore - Ignoring TS extension import error
import { registerHTMLClass } from "../shared/register-html-class.ts";
// @ts-ignore - Ignoring TS extension import error
import { stringAttribute } from "../shared/attributes.ts";
// @ts-ignore - Ignoring TS extension import error
import type { ElementNode } from "../shared/attributes.ts";

const tagName = "meta";
/**
 * @implements globalThis.HTMLMetaElement
 */
export class HTMLMetaElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = tagName) {
    super(ownerDocument, localName);
  }

  /* c8 ignore start */
  get name() { return stringAttribute.get(this as unknown as ElementNode, 'name'); }
  set name(value) { stringAttribute.set(this as unknown as ElementNode, 'name', value); }

  get httpEquiv() { return stringAttribute.get(this as unknown as ElementNode, 'http-equiv'); }
  set httpEquiv(value) { stringAttribute.set(this as unknown as ElementNode, 'http-equiv', value); }

  get content() { return stringAttribute.get(this as unknown as ElementNode, 'content'); }
  set content(value) { stringAttribute.set(this as unknown as ElementNode, 'content', value); }

  get charset() { return stringAttribute.get(this as unknown as ElementNode, 'charset'); }
  set charset(value) { stringAttribute.set(this as unknown as ElementNode, 'charset', value); }

  get media() { return stringAttribute.get(this as unknown as ElementNode, 'media'); }
  set media(value) { stringAttribute.set(this as unknown as ElementNode, 'media', value); }
  /* c8 ignore stop */

}

registerHTMLClass(tagName, HTMLMetaElement);

