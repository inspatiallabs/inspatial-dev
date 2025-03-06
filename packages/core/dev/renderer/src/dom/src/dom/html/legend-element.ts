// @ts-ignore - Ignoring TS extension import error
import { HTMLElement } from "./element.ts";
// @ts-ignore - Ignoring TS extension import error
import { registerHTMLClass } from "../shared/register-html-class.ts";

const tagName = "legend";

/**
 * @implements globalThis.HTMLLegendElement
 */
export class HTMLLegendElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = "legend") {
    super(ownerDocument, localName);
  }
}

registerHTMLClass(tagName, HTMLLegendElement);
