// @ts-ignore - Ignoring TS extension import error
import { ELEMENT_NODE } from "../shared/constants.ts";
// @ts-ignore - Ignoring TS extension import error
import { CUSTOM_ELEMENTS, END, NEXT } from "../shared/symbols.ts";
// @ts-ignore - Ignoring TS extension import error
import { htmlClasses } from "../shared/register-html-class.ts";

// @ts-ignore - Ignoring TS extension import error
import { Document } from "../interface/document.ts";
// @ts-ignore - Ignoring TS extension import error
import { NodeList } from "../interface/node-list.ts";
// @ts-ignore - Ignoring TS extension import error
import { customElements } from "../interface/custom-element-registry.ts";
// @ts-ignore - Ignoring TS extension import error
import { parseFromString } from "../shared/parse-from-string.ts";

// @ts-ignore - Ignoring TS extension import error
import { HTMLElement } from "./element.ts";

const createHTMLElement = (
  ownerDocument: any,
  builtin: boolean,
  localName: string,
  options: any
): HTMLElement => {
  if (!builtin && htmlClasses.has(localName)) {
    const Class = htmlClasses.get(localName)!;
    return new Class(ownerDocument, localName);
  }
  const {
    [CUSTOM_ELEMENTS]: { active, registry },
  } = ownerDocument;
  if (active) {
    const ce = builtin ? options.is : localName;
    if (registry.has(ce)) {
      const { Class } = registry.get(ce);
      const element = new Class(ownerDocument, localName);
      customElements.set(element, { connected: false });
      return element;
    }
  }
  return new HTMLElement(ownerDocument, localName);
};

/**
 * @implements globalThis.HTMLDocument
 */
export class HTMLDocument extends Document {
  /**
   * Store for accumulated HTML content during document writing
   * @private
   */
  private _writtenContent: string = '';
  
  /**
   * Flag indicating if document is currently open for writing
   * @private
   */
  private _isOpen: boolean = false;

  constructor() {
    super("text/html");
  }

  /**
   * Opens the document for writing
   */
  override open(): void {
    // Clear existing content
    this._writtenContent = '';
    this._isOpen = true;
    
    // Clear existing children
    let child = this.firstChild;
    while (child) {
      this.removeChild(child);
      child = this.firstChild;
    }
  }

  /**
   * Writes HTML content to the document
   * @param content - The HTML content to write
   */
  override write(content: string): void {
    if (!this._isOpen) {
      this.open();
    }
    
    this._writtenContent += content;
    // Re-parse the accumulated content
    parseFromString(this, true, this._writtenContent);
  }

  /**
   * Closes the document after writing
   */
  override close(): void {
    this._isOpen = false;
  }

  get all(): NodeList {
    const nodeList = new NodeList();
    // @ts-ignore - Symbol indexing
    let { [NEXT]: next, [END]: end } = this;
    // @ts-ignore - Force treat next as non-null
    next = next || null; // Ensure next is not undefined
    while (next !== end) {
      switch (next?.nodeType) {
        case ELEMENT_NODE:
          nodeList.push(next);
          break;
      }
      // @ts-ignore - Symbol indexing
      next = next?.[NEXT] || null;
    }
    return nodeList;
  }

  /**
   * @type HTMLHeadElement
   */
  override get head(): HTMLElement {
    // @ts-ignore - Type assertion for documentElement
    const documentElement = this.documentElement as HTMLElement;
    // @ts-ignore - Type assertion for firstElementChild
    let firstElementChild =
      documentElement.firstElementChild as HTMLElement | null;
    if (!firstElementChild || firstElementChild.tagName !== "HEAD") {
      firstElementChild = this.createElement("head");
      // @ts-ignore - We know documentElement is an HTMLElement
      documentElement.prepend(firstElementChild);
    }
    return firstElementChild;
  }

  /**
   * @type HTMLBodyElement
   */
  override get body(): HTMLElement {
    const head = this.head;
    // @ts-ignore - Type assertion for nextElementSibling
    let nextElementSibling = head.nextElementSibling as HTMLElement | null;
    if (!nextElementSibling || nextElementSibling.tagName !== "BODY") {
      nextElementSibling = this.createElement("body");
      // @ts-ignore - Type assertion for after method
      head.after(nextElementSibling);
    }
    return nextElementSibling;
  }

  /**
   * @type HTMLTitleElement
   */
  get title(): string {
    const { head } = this;
    // @ts-ignore - Type assertion for getElementsByTagName
    return head.getElementsByTagName("title").at(0)?.textContent || "";
  }

  set title(textContent: string) {
    const { head } = this;
    // @ts-ignore - Type assertion for getElementsByTagName
    let title = head.getElementsByTagName("title").at(0);
    if (title) title.textContent = textContent;
    else {
      // @ts-ignore - Type assertion for insertBefore
      head.insertBefore(
        this.createElement("title"),
        // @ts-ignore - Force null for firstChild if it's undefined
        head.firstChild || null
      ).textContent = textContent;
    }
  }

  override createElement(
    localName: string,
    options?: { is?: string }
  ): HTMLElement {
    const builtin = !!(options && options.is);
    const element = createHTMLElement(this, builtin, localName, options);
    if (builtin && options?.is) element.setAttribute("is", options.is);
    return element;
  }
}
