// @ts-ignore - Ignoring TS extension import error
import { registerHTMLClass } from "../shared/register-html-class.ts";
// @ts-ignore - Ignoring TS extension import error
import { stringAttribute } from "../shared/attributes.ts";

// @ts-ignore - Ignoring TS extension import error
import { HTMLElement } from "./element.ts";

const tagName = "source";

/**
 * @implements globalThis.HTMLSourceElement
 */
export class HTMLSourceElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = tagName) {
    super(ownerDocument, localName);
  }

  get src(): string {
    return stringAttribute.get(this, "src");
  }
  set src(value: string) {
    stringAttribute.set(this, "src", value);
  }

  get srcset(): string {
    return stringAttribute.get(this, "srcset");
  }
  set srcset(value: string) {
    stringAttribute.set(this, "srcset", value);
  }

  get sizes(): string {
    return stringAttribute.get(this, "sizes");
  }
  set sizes(value: string) {
    stringAttribute.set(this, "sizes", value);
  }

  get type(): string {
    return stringAttribute.get(this, "type");
  }
  set type(value: string) {
    stringAttribute.set(this, "type", value);
  }
}

registerHTMLClass(tagName, HTMLSourceElement);
