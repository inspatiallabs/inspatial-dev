// @ts-ignore - Ignoring TS extension import error
import { HTMLElement } from "./element.ts";

/**
 * @implements globalThis.HTMLDListElement
 */
export class HTMLDListElement extends HTMLElement {
  constructor(ownerDocument: Document, localName = "dl") {
    super(ownerDocument, localName);
  }
} 