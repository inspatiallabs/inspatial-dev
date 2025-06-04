// @ts-ignore - Ignoring TS extension import error
import { END, UPGRADE } from "../shared/symbols.ts";
// @ts-ignore - Ignoring TS extension import error
import { booleanAttribute, stringAttribute } from "../shared/attributes.ts";
// @ts-ignore - Ignoring TS extension import error
import type { ElementNode } from "../shared/attributes.ts";

// @ts-ignore - Ignoring TS extension import error
import { Event } from "../interface/event.ts";
// @ts-ignore - Ignoring TS extension import error
import { Element } from "../interface/element.ts";
// @ts-ignore - Ignoring TS extension import error
import {
  Classes,
  customElements,
} from "../interface/custom-element-registry.ts";

const Level0 = new WeakMap();
const level0 = {
  get(element: any, name: string): any {
    return (Level0.has(element) && Level0.get(element)[name]) || null;
  },
  set(element: any, name: string, value: any): void {
    if (!Level0.has(element)) Level0.set(element, {});
    const handlers = Level0.get(element);
    const type = name.slice(2);
    if (handlers[name])
      element.removeEventListener(type, handlers[name], false);
    if ((handlers[name] = value)) element.addEventListener(type, value, false);
  },
};

/**
 * @implements globalThis.HTMLElement
 */
export class HTMLElement extends Element {
  static get observedAttributes(): string[] {
    return [];
  }

  constructor(ownerDocument: any = null, localName: string = "") {
    super(ownerDocument, localName);

    const ownerLess = !ownerDocument;
    let options: any = {};

    if (ownerLess) {
      const { constructor: Class } = this;
      if (!Classes.has(Class))
        throw new Error("unable to initialize this Custom Element");
      ({ ownerDocument, localName, options } = Classes.get(Class));
    }

    if (ownerDocument && ownerDocument[UPGRADE]) {
      const { element, values } = ownerDocument[UPGRADE];
      ownerDocument[UPGRADE] = null;
      for (const [key, value] of values) element[key] = value;
      return element;
    }

    if (ownerLess) {
      // @ts-ignore - Symbol property access
      this.ownerDocument = this[END].ownerDocument = ownerDocument;
      this.localName = localName;
      customElements.set(this, { connected: false });
      if (options && options.is) this.setAttribute("is", options.is);
    }
  }

  /* c8 ignore start */

  /**
   * Gets the height of the element, including padding and border but not margins
   * @returns {number} The offset height in pixels
   */
  override get offsetHeight(): number {
    const heightAttr = this.getAttribute("height");
    // Return 0 if no height or unit specified, otherwise parse number or return default
    return heightAttr ? parseInt(heightAttr, 10) || 0 : 0;
  }

  /**
   * Gets the distance from the left border of the element to the left border of its offsetParent
   * @returns {number} The offset left in pixels
   */
  override get offsetLeft(): number {
    // In this implementation, we're defaulting to 0
    // In a real browser this would be calculated based on layout
    return 0;
  }

  /**
   * Gets the element's offsetParent (the nearest positioned ancestor)
   * @returns {Element|null} The offset parent element or null if none
   */
  override get offsetParent(): Element | null {
    // Start with the parent element
    const parent = this.parentElement;

    // In a real browser implementation, we would find the nearest positioned ancestor
    // Here we just return the immediate parent or null
    return parent as unknown as Element | null;
  }

  /**
   * Gets the distance from the top border of the element to the top border of its offsetParent
   * @returns {number} The offset top in pixels
   */
  override get offsetTop(): number {
    // In this implementation, we're defaulting to 0
    // In a real browser this would be calculated based on layout
    return 0;
  }

  /**
   * Gets the width of the element, including padding and border but not margins
   * @returns {number} The offset width in pixels
   */
  override get offsetWidth(): number {
    const widthAttr = this.getAttribute("width");
    // Return 0 if no width or unit specified, otherwise parse number or return default
    return widthAttr ? parseInt(widthAttr, 10) || 0 : 0;
  }

  blur(): void {
    // @ts-ignore - Event type compatibility in this implementation
    this.dispatchEvent(new Event("blur"));
  }

  click(): void {
    // @ts-ignore - Event type compatibility in this implementation
    const clickEvent = new Event("click", { bubbles: true, cancelable: true });
    // @ts-ignore - Property 'button' is set for mouse events
    clickEvent.button = 0;

    // @ts-ignore - Event type compatibility in this implementation
    this.dispatchEvent(clickEvent);
  }

  // Boolean getters
  get accessKeyLabel(): string {
    const { accessKey } = this;
    return accessKey && `Alt+Shift+${accessKey}`;
  }
  get isContentEditable(): boolean {
    return this.hasAttribute("contenteditable");
  }

  // Boolean Accessors
  get contentEditable(): boolean {
    return booleanAttribute.get(
      this as unknown as ElementNode,
      "contenteditable"
    );
  }
  set contentEditable(value: boolean) {
    booleanAttribute.set(
      this as unknown as ElementNode,
      "contenteditable",
      value
    );
  }
  get draggable(): boolean {
    return booleanAttribute.get(this as unknown as ElementNode, "draggable");
  }
  set draggable(value: boolean) {
    booleanAttribute.set(this as unknown as ElementNode, "draggable", value);
  }
  get hidden(): boolean {
    return booleanAttribute.get(this as unknown as ElementNode, "hidden");
  }
  set hidden(value: boolean) {
    booleanAttribute.set(this as unknown as ElementNode, "hidden", value);
  }
  get spellcheck(): boolean {
    return booleanAttribute.get(this as unknown as ElementNode, "spellcheck");
  }
  set spellcheck(value: boolean) {
    booleanAttribute.set(this as unknown as ElementNode, "spellcheck", value);
  }

  // String Accessors
  get accessKey(): string {
    return stringAttribute.get(this as unknown as ElementNode, "accesskey");
  }
  set accessKey(value: string) {
    stringAttribute.set(this as unknown as ElementNode, "accesskey", value);
  }
  get dir(): string {
    return stringAttribute.get(this as unknown as ElementNode, "dir");
  }
  set dir(value: string) {
    stringAttribute.set(this as unknown as ElementNode, "dir", value);
  }
  get lang(): string {
    return stringAttribute.get(this as unknown as ElementNode, "lang");
  }
  set lang(value: string) {
    stringAttribute.set(this as unknown as ElementNode, "lang", value);
  }
  get title(): string {
    return stringAttribute.get(this as unknown as ElementNode, "title");
  }
  set title(value: string) {
    stringAttribute.set(this as unknown as ElementNode, "title", value);
  }

  // DOM Level 0
  get onabort(): any {
    return level0.get(this, "onabort");
  }
  set onabort(value: any) {
    level0.set(this, "onabort", value);
  }

  get onblur(): any {
    return level0.get(this, "onblur");
  }
  set onblur(value: any) {
    level0.set(this, "onblur", value);
  }

  get oncancel(): any {
    return level0.get(this, "oncancel");
  }
  set oncancel(value: any) {
    level0.set(this, "oncancel", value);
  }

  get oncanplay(): any {
    return level0.get(this, "oncanplay");
  }
  set oncanplay(value: any) {
    level0.set(this, "oncanplay", value);
  }

  get oncanplaythrough(): any {
    return level0.get(this, "oncanplaythrough");
  }
  set oncanplaythrough(value: any) {
    level0.set(this, "oncanplaythrough", value);
  }

  get onchange(): any {
    return level0.get(this, "onchange");
  }
  set onchange(value: any) {
    level0.set(this, "onchange", value);
  }

  get onclick(): any {
    return level0.get(this, "onclick");
  }
  set onclick(value: any) {
    level0.set(this, "onclick", value);
  }

  get onclose(): any {
    return level0.get(this, "onclose");
  }
  set onclose(value: any) {
    level0.set(this, "onclose", value);
  }

  get oncontextmenu(): any {
    return level0.get(this, "oncontextmenu");
  }
  set oncontextmenu(value: any) {
    level0.set(this, "oncontextmenu", value);
  }

  get oncuechange(): any {
    return level0.get(this, "oncuechange");
  }
  set oncuechange(value: any) {
    level0.set(this, "oncuechange", value);
  }

  get ondblclick(): any {
    return level0.get(this, "ondblclick");
  }
  set ondblclick(value: any) {
    level0.set(this, "ondblclick", value);
  }

  get ondrag(): any {
    return level0.get(this, "ondrag");
  }
  set ondrag(value: any) {
    level0.set(this, "ondrag", value);
  }

  get ondragend(): any {
    return level0.get(this, "ondragend");
  }
  set ondragend(value: any) {
    level0.set(this, "ondragend", value);
  }

  get ondragenter(): any {
    return level0.get(this, "ondragenter");
  }
  set ondragenter(value: any) {
    level0.set(this, "ondragenter", value);
  }

  get ondragleave(): any {
    return level0.get(this, "ondragleave");
  }
  set ondragleave(value: any) {
    level0.set(this, "ondragleave", value);
  }

  get ondragover(): any {
    return level0.get(this, "ondragover");
  }
  set ondragover(value: any) {
    level0.set(this, "ondragover", value);
  }

  get ondragstart(): any {
    return level0.get(this, "ondragstart");
  }
  set ondragstart(value: any) {
    level0.set(this, "ondragstart", value);
  }

  get ondrop(): any {
    return level0.get(this, "ondrop");
  }
  set ondrop(value: any) {
    level0.set(this, "ondrop", value);
  }

  get ondurationchange(): any {
    return level0.get(this, "ondurationchange");
  }
  set ondurationchange(value: any) {
    level0.set(this, "ondurationchange", value);
  }

  get onemptied(): any {
    return level0.get(this, "onemptied");
  }
  set onemptied(value: any) {
    level0.set(this, "onemptied", value);
  }

  get onended(): any {
    return level0.get(this, "onended");
  }
  set onended(value: any) {
    level0.set(this, "onended", value);
  }

  get onerror(): any {
    return level0.get(this, "onerror");
  }
  set onerror(value: any) {
    level0.set(this, "onerror", value);
  }

  get onfocus(): any {
    return level0.get(this, "onfocus");
  }
  set onfocus(value: any) {
    level0.set(this, "onfocus", value);
  }

  get oninput(): any {
    return level0.get(this, "oninput");
  }
  set oninput(value: any) {
    level0.set(this, "oninput", value);
  }

  get oninvalid(): any {
    return level0.get(this, "oninvalid");
  }
  set oninvalid(value: any) {
    level0.set(this, "oninvalid", value);
  }

  get onkeydown(): any {
    return level0.get(this, "onkeydown");
  }
  set onkeydown(value: any) {
    level0.set(this, "onkeydown", value);
  }

  get onkeypress(): any {
    return level0.get(this, "onkeypress");
  }
  set onkeypress(value: any) {
    level0.set(this, "onkeypress", value);
  }

  get onkeyup(): any {
    return level0.get(this, "onkeyup");
  }
  set onkeyup(value: any) {
    level0.set(this, "onkeyup", value);
  }

  get onload(): any {
    return level0.get(this, "onload");
  }
  set onload(value: any) {
    level0.set(this, "onload", value);
  }

  get onloadeddata(): any {
    return level0.get(this, "onloadeddata");
  }
  set onloadeddata(value: any) {
    level0.set(this, "onloadeddata", value);
  }

  get onloadedmetadata(): any {
    return level0.get(this, "onloadedmetadata");
  }
  set onloadedmetadata(value: any) {
    level0.set(this, "onloadedmetadata", value);
  }

  get onloadstart(): any {
    return level0.get(this, "onloadstart");
  }
  set onloadstart(value: any) {
    level0.set(this, "onloadstart", value);
  }

  get onmousedown(): any {
    return level0.get(this, "onmousedown");
  }
  set onmousedown(value: any) {
    level0.set(this, "onmousedown", value);
  }

  get onmouseenter(): any {
    return level0.get(this, "onmouseenter");
  }
  set onmouseenter(value: any) {
    level0.set(this, "onmouseenter", value);
  }

  get onmouseleave(): any {
    return level0.get(this, "onmouseleave");
  }
  set onmouseleave(value: any) {
    level0.set(this, "onmouseleave", value);
  }

  get onmousemove(): any {
    return level0.get(this, "onmousemove");
  }
  set onmousemove(value: any) {
    level0.set(this, "onmousemove", value);
  }

  get onmouseout(): any {
    return level0.get(this, "onmouseout");
  }
  set onmouseout(value: any) {
    level0.set(this, "onmouseout", value);
  }

  get onmouseover(): any {
    return level0.get(this, "onmouseover");
  }
  set onmouseover(value: any) {
    level0.set(this, "onmouseover", value);
  }

  get onmouseup(): any {
    return level0.get(this, "onmouseup");
  }
  set onmouseup(value: any) {
    level0.set(this, "onmouseup", value);
  }

  get onmousewheel(): any {
    return level0.get(this, "onmousewheel");
  }
  set onmousewheel(value: any) {
    level0.set(this, "onmousewheel", value);
  }

  get onpause(): any {
    return level0.get(this, "onpause");
  }
  set onpause(value: any) {
    level0.set(this, "onpause", value);
  }

  get onplay(): any {
    return level0.get(this, "onplay");
  }
  set onplay(value: any) {
    level0.set(this, "onplay", value);
  }

  get onplaying(): any {
    return level0.get(this, "onplaying");
  }
  set onplaying(value: any) {
    level0.set(this, "onplaying", value);
  }

  get onprogress(): any {
    return level0.get(this, "onprogress");
  }
  set onprogress(value: any) {
    level0.set(this, "onprogress", value);
  }

  get onratechange(): any {
    return level0.get(this, "onratechange");
  }
  set onratechange(value: any) {
    level0.set(this, "onratechange", value);
  }

  get onreset(): any {
    return level0.get(this, "onreset");
  }
  set onreset(value: any) {
    level0.set(this, "onreset", value);
  }

  get onresize(): any {
    return level0.get(this, "onresize");
  }
  set onresize(value: any) {
    level0.set(this, "onresize", value);
  }

  get onscroll(): any {
    return level0.get(this, "onscroll");
  }
  set onscroll(value: any) {
    level0.set(this, "onscroll", value);
  }

  get onseeked(): any {
    return level0.get(this, "onseeked");
  }
  set onseeked(value: any) {
    level0.set(this, "onseeked", value);
  }

  get onseeking(): any {
    return level0.get(this, "onseeking");
  }
  set onseeking(value: any) {
    level0.set(this, "onseeking", value);
  }

  get onselect(): any {
    return level0.get(this, "onselect");
  }
  set onselect(value: any) {
    level0.set(this, "onselect", value);
  }

  get onshow(): any {
    return level0.get(this, "onshow");
  }
  set onshow(value: any) {
    level0.set(this, "onshow", value);
  }

  get onstalled(): any {
    return level0.get(this, "onstalled");
  }
  set onstalled(value: any) {
    level0.set(this, "onstalled", value);
  }

  get onsubmit(): any {
    return level0.get(this, "onsubmit");
  }
  set onsubmit(value: any) {
    level0.set(this, "onsubmit", value);
  }

  get onsuspend(): any {
    return level0.get(this, "onsuspend");
  }
  set onsuspend(value: any) {
    level0.set(this, "onsuspend", value);
  }

  get ontimeupdate(): any {
    return level0.get(this, "ontimeupdate");
  }
  set ontimeupdate(value: any) {
    level0.set(this, "ontimeupdate", value);
  }

  get ontoggle(): any {
    return level0.get(this, "ontoggle");
  }
  set ontoggle(value: any) {
    level0.set(this, "ontoggle", value);
  }

  get onvolumechange(): any {
    return level0.get(this, "onvolumechange");
  }
  set onvolumechange(value: any) {
    level0.set(this, "onvolumechange", value);
  }

  get onwaiting(): any {
    return level0.get(this, "onwaiting");
  }
  set onwaiting(value: any) {
    level0.set(this, "onwaiting", value);
  }

  get onauxclick(): any {
    return level0.get(this, "onauxclick");
  }
  set onauxclick(value: any) {
    level0.set(this, "onauxclick", value);
  }

  get ongotpointercapture(): any {
    return level0.get(this, "ongotpointercapture");
  }
  set ongotpointercapture(value: any) {
    level0.set(this, "ongotpointercapture", value);
  }

  get onlostpointercapture(): any {
    return level0.get(this, "onlostpointercapture");
  }
  set onlostpointercapture(value: any) {
    level0.set(this, "onlostpointercapture", value);
  }

  get onpointercancel(): any {
    return level0.get(this, "onpointercancel");
  }
  set onpointercancel(value: any) {
    level0.set(this, "onpointercancel", value);
  }

  get onpointerdown(): any {
    return level0.get(this, "onpointerdown");
  }
  set onpointerdown(value: any) {
    level0.set(this, "onpointerdown", value);
  }

  get onpointerenter(): any {
    return level0.get(this, "onpointerenter");
  }
  set onpointerenter(value: any) {
    level0.set(this, "onpointerenter", value);
  }

  get onpointerleave(): any {
    return level0.get(this, "onpointerleave");
  }
  set onpointerleave(value: any) {
    level0.set(this, "onpointerleave", value);
  }

  get onpointermove(): any {
    return level0.get(this, "onpointermove");
  }
  set onpointermove(value: any) {
    level0.set(this, "onpointermove", value);
  }

  get onpointerout(): any {
    return level0.get(this, "onpointerout");
  }
  set onpointerout(value: any) {
    level0.set(this, "onpointerout", value);
  }

  get onpointerover(): any {
    return level0.get(this, "onpointerover");
  }
  set onpointerover(value: any) {
    level0.set(this, "onpointerover", value);
  }

  get onpointerup(): any {
    return level0.get(this, "onpointerup");
  }
  set onpointerup(value: any) {
    level0.set(this, "onpointerup", value);
  }
  /* c8 ignore stop */
}
