// @ts-ignore - Ignoring TS extension import error
import { registerHTMLClass } from "../shared/register-html-class.ts";
// @ts-ignore - Ignoring TS extension import error
import { numericAttribute, stringAttribute } from "../shared/attributes.ts";

// @ts-ignore - Ignoring TS extension import error
import { HTMLElement } from "./element.ts";

const tagName = "img";

/**
 * @implements globalThis.HTMLImageElement
 */
export class HTMLImageElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = tagName) {
    super(ownerDocument, localName);
  }

  /* c8 ignore start */
  get alt(): string {
    return stringAttribute.get(this as any, "alt");
  }
  set alt(value: string) {
    stringAttribute.set(this as any, "alt", value);
  }

  get sizes(): string {
    return stringAttribute.get(this as any, "sizes");
  }
  set sizes(value: string) {
    stringAttribute.set(this as any, "sizes", value);
  }

  get src(): string {
    return stringAttribute.get(this as any, "src");
  }
  set src(value: string) {
    stringAttribute.set(this as any, "src", value);
  }

  get srcset(): string {
    return stringAttribute.get(this as any, "srcset");
  }
  set srcset(value: string) {
    stringAttribute.set(this as any, "srcset", value);
  }

  override get title(): string {
    return stringAttribute.get(this as any, "title");
  }
  override set title(value: string) {
    stringAttribute.set(this as any, "title", value);
  }

  get height(): number {
    return numericAttribute.get(this as any, "height");
  }
  set height(value: number) {
    numericAttribute.set(this as any, "height", value);
  }

  get width(): number {
    return numericAttribute.get(this as any, "width");
  }
  set width(value: number) {
    numericAttribute.set(this as any, "width", value);
  }
  /* c8 ignore stop */
}

registerHTMLClass(tagName, HTMLImageElement);
