// @ts-ignore - Ignoring TS extension import error
import { HTMLElement } from "./element.ts";
// @ts-ignore - Ignoring TS extension import error
import { registerHTMLClass } from "../shared/register-html-class.ts";

const tagName = "fencedframe";

/**
 * Implementation of the Fenced Frame element
 *
 * Fenced frames are an HTML element for embedded content that provides
 * stronger privacy boundaries between the embedded content and the embedding document.
 *
 * @implements globalThis.HTMLFencedFrameElement
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/fencedframe
 */
class HTMLFencedFrameElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = tagName) {
    super(ownerDocument, localName);
  }

  /* c8 ignore start */
  /**
   * Gets the URL of the embedded resource
   */
  get src(): string | null {
    return this.getAttribute("src");
  }

  /**
   * Sets the URL of the embedded resource
   */
  set src(value: string) {
    this.setAttribute("src", value);
  }

  /**
   * Gets the mode of the fenced frame
   */
  get mode(): string | null {
    return this.getAttribute("mode");
  }

  /**
   * Sets the mode of the fenced frame
   */
  set mode(value: string) {
    this.setAttribute("mode", value);
  }
  /* c8 ignore stop */
}

registerHTMLClass(tagName, HTMLFencedFrameElement);

export { HTMLFencedFrameElement };
