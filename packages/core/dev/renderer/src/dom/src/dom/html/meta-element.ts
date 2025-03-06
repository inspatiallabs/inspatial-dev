import { HTMLElement } from "./element.ts";
import { registerHTMLClass } from "../shared/register-html-class.ts";
import { stringAttribute } from "../shared/attributes.ts";

const tagName = "meta";
/**
 * @implements globalThis.HTMLMetaElement
 */
export class HTMLMetaElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = tagName) {
    super(ownerDocument, localName);
  }

  /* c8 ignore start */
  get name() { return stringAttribute.get(this, 'name'); }
  set name(value) { stringAttribute.set(this, 'name', value); }

  get httpEquiv() { return stringAttribute.get(this, 'http-equiv'); }
  set httpEquiv(value) { stringAttribute.set(this, 'http-equiv', value); }

  get content() { return stringAttribute.get(this, 'content'); }
  set content(value) { stringAttribute.set(this, 'content', value); }

  get charset() { return stringAttribute.get(this, 'charset'); }
  set charset(value) { stringAttribute.set(this, 'charset', value); }

  get media() { return stringAttribute.get(this, 'media'); }
  set media(value) { stringAttribute.set(this, 'media', value); }
  /* c8 ignore stop */

}

registerHTMLClass(tagName, HTMLMetaElement);

