// @ts-ignore - Ignoring TS extension import error
import { HTMLElement } from "./element.ts";

/**
 * @implements globalThis.HTMLDataElement
 */
export class HTMLDataElement extends HTMLElement {
  constructor(ownerDocument: Document, localName = "data") {
    super(ownerDocument, localName);
  }
}
