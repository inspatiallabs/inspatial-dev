// @ts-ignore - Ignoring TS extension import error
import { HTMLElement } from "./element.ts";
// @ts-ignore - Ignoring TS extension import error
import { registerHTMLClass } from "../shared/register-html-class.ts";

const tagName = "base";

/**
 * @implements globalThis.HTMLBaseElement
 */
export class HTMLBaseElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = "base") {
    super(ownerDocument, localName);
  }
}

registerHTMLClass(tagName, HTMLBaseElement);
