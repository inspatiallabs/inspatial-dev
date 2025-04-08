// @ts-ignore - Ignoring TS extension import error
import { registerHTMLClass } from "../shared/register-html-class.ts";
// @ts-ignore - Ignoring TS extension import error
import { stringAttribute } from "../shared/attributes.ts";
// @ts-ignore - Ignoring TS extension import error
import type { ElementNode } from "../shared/attributes.ts";

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
    return stringAttribute.get(this as unknown as ElementNode, "src");
  }
  set src(value: string) {
    stringAttribute.set(this as unknown as ElementNode, "src", value);
  }

  get srcset(): string {
    return stringAttribute.get(this as unknown as ElementNode, "srcset");
  }
  set srcset(value: string) {
    stringAttribute.set(this as unknown as ElementNode, "srcset", value);
  }

  get sizes(): string {
    return stringAttribute.get(this as unknown as ElementNode, "sizes");
  }
  set sizes(value: string) {
    stringAttribute.set(this as unknown as ElementNode, "sizes", value);
  }

  get type(): string {
    return stringAttribute.get(this as unknown as ElementNode, "type");
  }
  set type(value: string) {
    stringAttribute.set(this as unknown as ElementNode, "type", value);
  }
}

registerHTMLClass(tagName, HTMLSourceElement);
