import { HTMLElement } from "./element.ts";
import { registerHTMLClass } from "../shared/register-html-class.ts";

const tagName = "progress";

/**
 * @implements globalThis.HTMLProgressElement
 */
export class HTMLProgressElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = tagName) {
    super(ownerDocument, localName);
  }
}

registerHTMLClass(tagName, HTMLProgressElement);
