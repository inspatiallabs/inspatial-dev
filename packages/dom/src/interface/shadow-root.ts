// @ts-ignore - Ignoring TS extension import error
import { getInnerHtml, setInnerHtml } from "../mixin/inner-html.ts";
// @ts-ignore - Ignoring TS extension import error
import { DocumentFragment } from "./document-fragment.ts";
// @ts-ignore - Ignoring TS extension import error
import type { Element } from "./element.ts";

/**
 * Implements a specialized Shadow DOM root that extends DocumentFragment
 * This implements the TODO from @benemma to have ShadowRoot as a specialized class
 * extending DocumentFragment to better model the DOM specification
 *
 * @implements globalThis.ShadowRoot
 */
export class ShadowRoot extends DocumentFragment {
  /**
   * The element that hosts this shadow root
   */
  host: Element;

  /**
   * The mode of the shadow root (open or closed)
   */
  mode: string = "open";

  /**
   * Creates a new ShadowRoot
   * @param host - The element that will host this shadow root
   */
  constructor(host: Element) {
    super(host.ownerDocument);
    this.host = host;
  }

  /**
   * Gets the HTML content of this shadow root
   */
  get innerHTML(): string {
    return getInnerHtml(this);
  }

  /**
   * Sets the HTML content of this shadow root
   * @param html - The HTML string to set
   */
  set innerHTML(html: string) {
    setInnerHtml(this, html);
  }
}
