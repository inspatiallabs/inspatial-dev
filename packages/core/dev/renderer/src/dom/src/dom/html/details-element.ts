// @ts-ignore - Ignoring TS extension import error
import { HTMLElement } from "./element.ts";
// @ts-ignore - Ignoring TS extension import error
import { registerHTMLClass } from "../shared/register-html-class.ts";

const tagName = "details";

/**
 * @implements globalThis.HTMLDetailsElement
 */
export class HTMLDetailsElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = "details") {
    super(ownerDocument, localName);
  }
}

registerHTMLClass(tagName, HTMLDetailsElement);
