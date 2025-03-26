// @ts-ignore - Ignoring TS extension import error
import {DOCUMENT_FRAGMENT_NODE} from '../shared/constants.ts';
// @ts-ignore - Ignoring TS extension import error
import {getInnerHtml, setInnerHtml} from '../mixin/inner-html.ts';
// @ts-ignore - Ignoring TS extension import error
import {NonElementParentNode} from '../mixin/non-element-parent-node.ts';
// @ts-ignore - Ignoring TS extension import error
import {Element} from './element.ts';

/**
 * @implements globalThis.ShadowRoot
 */
export class ShadowRoot extends NonElementParentNode {
  /**
   * The element that hosts this shadow root
   */
  host: Element;

  /**
   * Creates a new ShadowRoot
   * @param host - The element that will host this shadow root
   */
  constructor(host: Element) {
    super(host.ownerDocument, '#shadow-root', DOCUMENT_FRAGMENT_NODE);
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
