// @ts-ignore - Ignoring TS extension import error
import { registerHTMLClass } from "../shared/register-html-class.ts";
// @ts-ignore - Ignoring TS extension import error
import { booleanAttribute, stringAttribute } from "../shared/attributes.ts";
// @ts-ignore - Ignoring TS extension import error
import { CLASS_LIST } from "../shared/symbols.ts";

// @ts-ignore - Ignoring TS extension import error
import { HTMLElement } from "./element.ts";

// Import ElementNode interface to use for type casting
// @ts-ignore - Ignoring TS extension import error
import type { ElementNode } from "../shared/attributes.ts";

const tagName = "iframe";

/**
 * @implements globalThis.HTMLIFrameElement
 */
export class HTMLIFrameElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = tagName) {
    super(ownerDocument, localName);
  }

  /* c8 ignore start */
  get src(): string {
    return stringAttribute.get(this as unknown as ElementNode, "src");
  }
  set src(value: string) {
    stringAttribute.set(this as unknown as ElementNode, "src", value);
  }

  get srcdoc(): string {
    return stringAttribute.get(this as unknown as ElementNode, "srcdoc");
  }
  set srcdoc(value: string) {
    stringAttribute.set(this as unknown as ElementNode, "srcdoc", value);
  }

  get name(): string {
    return stringAttribute.get(this as unknown as ElementNode, "name");
  }
  set name(value: string) {
    stringAttribute.set(this as unknown as ElementNode, "name", value);
  }

  get allow(): string {
    return stringAttribute.get(this as unknown as ElementNode, "allow");
  }
  set allow(value: string) {
    stringAttribute.set(this as unknown as ElementNode, "allow", value);
  }

  get allowFullscreen(): boolean {
    return booleanAttribute.get(
      this as unknown as ElementNode,
      "allowfullscreen"
    );
  }
  set allowFullscreen(value: boolean) {
    booleanAttribute.set(
      this as unknown as ElementNode,
      "allowfullscreen",
      value
    );
  }

  get referrerPolicy(): string {
    return stringAttribute.get(
      this as unknown as ElementNode,
      "referrerpolicy"
    );
  }
  set referrerPolicy(value: string) {
    stringAttribute.set(
      this as unknown as ElementNode,
      "referrerpolicy",
      value
    );
  }

  get loading(): string {
    return stringAttribute.get(this as unknown as ElementNode, "loading");
  }
  set loading(value: string) {
    stringAttribute.set(this as unknown as ElementNode, "loading", value);
  }
  /* c8 ignore stop */
}

registerHTMLClass(tagName, HTMLIFrameElement);
