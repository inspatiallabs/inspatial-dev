// @ts-ignore - Ignoring TS extension import error
import { HTMLElement } from "./element.ts";
// @ts-ignore - Ignoring TS extension import error
import { registerHTMLClass } from "../shared/register-html-class.ts";

const tagName = "audio";

/**
 * @implements globalThis.HTMLAudioElement
 */
export class HTMLAudioElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = "audio") {
    super(ownerDocument, localName);
  }
}

registerHTMLClass(tagName, HTMLAudioElement);
