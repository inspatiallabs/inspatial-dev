// @ts-ignore - Ignoring TS extension import error
import {END, UPGRADE} from '../shared/symbols.ts';
// @ts-ignore - Ignoring TS extension import error
import {booleanAttribute, stringAttribute} from '../shared/attributes.ts';

// @ts-ignore - Ignoring TS extension import error
import {Event} from '../interface/event.ts';
// @ts-ignore - Ignoring TS extension import error
import {Element} from '../interface/element.ts';
// @ts-ignore - Ignoring TS extension import error
import {Classes, customElements} from '../interface/custom-element-registry.ts';

const Level0 = new WeakMap;
const level0 = {
  get(element: any, name: string): any {
    return Level0.has(element) && Level0.get(element)[name] || null;
  },
  set(element: any, name: string, value: any): void {
    if (!Level0.has(element))
      Level0.set(element, {});
    const handlers = Level0.get(element);
    const type = name.slice(2);
    if (handlers[name])
      element.removeEventListener(type, handlers[name], false);
    if ((handlers[name] = value))
      element.addEventListener(type, value, false);
  }
};

/**
 * @implements globalThis.HTMLElement
 */
export class HTMLElement extends Element {

  static get observedAttributes(): string[] { return []; }

  constructor(ownerDocument: any = null, localName: string = '') {
    super(ownerDocument, localName);

    const ownerLess = !ownerDocument;
    let options: any = {};

    if (ownerLess) {
      const {constructor: Class} = this;
      if (!Classes.has(Class))
        throw new Error('unable to initialize this Custom Element');
      ({ownerDocument, localName, options} = Classes.get(Class));
    }

    if (ownerDocument && ownerDocument[UPGRADE]) {
      const {element, values} = ownerDocument[UPGRADE];
      ownerDocument[UPGRADE] = null;
      for (const [key, value] of values)
        element[key] = value;
      return element;
    }

    if (ownerLess) {
      // @ts-ignore - Symbol property access
      this.ownerDocument = this[END].ownerDocument = ownerDocument;
      this.localName = localName;
      customElements.set(this, {connected: false});
      if (options && options.is)
        this.setAttribute('is', options.is);
    }
  }

  /* c8 ignore start */

  /**
   * Gets the height of the element, including padding and border but not margins
   * @returns {number} The offset height in pixels
   */
  get offsetHeight(): number { 
    const heightAttr = this.getAttribute('height');
    // Return 0 if no height or unit specified, otherwise parse number or return default
    return heightAttr ? parseInt(heightAttr, 10) || 0 : 0;
  }
  
  /**
   * Gets the distance from the left border of the element to the left border of its offsetParent
   * @returns {number} The offset left in pixels
   */
  get offsetLeft(): number { 
    // In this implementation, we're defaulting to 0
    // In a real browser this would be calculated based on layout
    return 0;
  }
  
  /**
   * Gets the element's offsetParent (the nearest positioned ancestor)
   * @returns {Element|null} The offset parent element or null if none
   */
  get offsetParent(): Element | null { 
    // Start with the parent element
    let parent = this.parentElement;
    
    // In a real browser implementation, we would find the nearest positioned ancestor
    // Here we just return the immediate parent or null
    return parent;
  }
  
  /**
   * Gets the distance from the top border of the element to the top border of its offsetParent
   * @returns {number} The offset top in pixels
   */
  get offsetTop(): number { 
    // In this implementation, we're defaulting to 0
    // In a real browser this would be calculated based on layout
    return 0;
  }
  
  /**
   * Gets the width of the element, including padding and border but not margins
   * @returns {number} The offset width in pixels
   */
  get offsetWidth(): number { 
    const widthAttr = this.getAttribute('width');
    // Return 0 if no width or unit specified, otherwise parse number or return default
    return widthAttr ? parseInt(widthAttr, 10) || 0 : 0;
  }

  blur(): void { this.dispatchEvent(new Event('blur')); }
  click(): void {
    const clickEvent = new Event('click', {bubbles: true, cancelable: true});
    // @ts-ignore - Property 'button' is set for mouse events
    clickEvent.button = 0;

    this.dispatchEvent(clickEvent);
  }

  // Boolean getters
  get accessKeyLabel(): string {
    const {accessKey} = this;
    return accessKey && `Alt+Shift+${accessKey}`;
  }
  get isContentEditable(): boolean { return this.hasAttribute('contenteditable'); }

  // Boolean Accessors
  get contentEditable(): boolean { return booleanAttribute.get(this, 'contenteditable'); }
  set contentEditable(value: boolean) { booleanAttribute.set(this, 'contenteditable', value); }
  get draggable(): boolean { return booleanAttribute.get(this, 'draggable'); }
  set draggable(value: boolean) { booleanAttribute.set(this, 'draggable', value); }
  get hidden(): boolean { return booleanAttribute.get(this, 'hidden'); }
  set hidden(value: boolean) { booleanAttribute.set(this, 'hidden', value); }
  get spellcheck(): boolean { return booleanAttribute.get(this, 'spellcheck'); }
  set spellcheck(value: boolean) { booleanAttribute.set(this, 'spellcheck', value); }

  // String Accessors
  get accessKey(): string { return stringAttribute.get(this, 'accesskey'); }
  set accessKey(value: string) { stringAttribute.set(this, 'accesskey', value); }
  get dir(): string { return stringAttribute.get(this, 'dir'); }
  set dir(value: string) { stringAttribute.set(this, 'dir', value); }
  get lang(): string { return stringAttribute.get(this, 'lang'); }
  set lang(value: string) { stringAttribute.set(this, 'lang', value); }
  get title(): string { return stringAttribute.get(this, 'title'); }
  set title(value: string) { stringAttribute.set(this, 'title', value); }

  // DOM Level 0
  get onabort(): any { return level0.get(this, 'onabort'); }
  set onabort(value: any) { level0.set(this, 'onabort', value); }

  get onblur(): any { return level0.get(this, 'onblur'); }
  set onblur(value: any) { level0.set(this, 'onblur', value); }

  get oncancel(): any { return level0.get(this, 'oncancel'); }
  set oncancel(value: any) { level0.set(this, 'oncancel', value); }

  get oncanplay(): any { return level0.get(this, 'oncanplay'); }
  set oncanplay(value: any) { level0.set(this, 'oncanplay', value); }

  get oncanplaythrough(): any { return level0.get(this, 'oncanplaythrough'); }
  set oncanplaythrough(value: any) { level0.set(this, 'oncanplaythrough', value); }

  get onchange(): any { return level0.get(this, 'onchange'); }
  set onchange(value: any) { level0.set(this, 'onchange', value); }

  get onclick(): any { return level0.get(this, 'onclick'); }
  set onclick(value: any) { level0.set(this, 'onclick', value); }

  get onclose(): any { return level0.get(this, 'onclose'); }
  set onclose(value: any) { level0.set(this, 'onclose', value); }

  get oncontextmenu(): any { return level0.get(this, 'oncontextmenu'); }
  set oncontextmenu(value: any) { level0.set(this, 'oncontextmenu', value); }

  get oncuechange(): any { return level0.get(this, 'oncuechange'); }
  set oncuechange(value: any) { level0.set(this, 'oncuechange', value); }

  get ondblclick(): any { return level0.get(this, 'ondblclick'); }
  set ondblclick(value: any) { level0.set(this, 'ondblclick', value); }

  get ondrag() { return level0.get(this, 'ondrag'); }
  set ondrag(value) { level0.set(this, 'ondrag', value); }

  get ondragend() { return level0.get(this, 'ondragend'); }
  set ondragend(value) { level0.set(this, 'ondragend', value); }

  get ondragenter() { return level0.get(this, 'ondragenter'); }
  set ondragenter(value) { level0.set(this, 'ondragenter', value); }

  get ondragleave() { return level0.get(this, 'ondragleave'); }
  set ondragleave(value) { level0.set(this, 'ondragleave', value); }

  get ondragover() { return level0.get(this, 'ondragover'); }
  set ondragover(value) { level0.set(this, 'ondragover', value); }

  get ondragstart() { return level0.get(this, 'ondragstart'); }
  set ondragstart(value) { level0.set(this, 'ondragstart', value); }

  get ondrop() { return level0.get(this, 'ondrop'); }
  set ondrop(value) { level0.set(this, 'ondrop', value); }

  get ondurationchange() { return level0.get(this, 'ondurationchange'); }
  set ondurationchange(value) { level0.set(this, 'ondurationchange', value); }

  get onemptied() { return level0.get(this, 'onemptied'); }
  set onemptied(value) { level0.set(this, 'onemptied', value); }

  get onended() { return level0.get(this, 'onended'); }
  set onended(value) { level0.set(this, 'onended', value); }

  get onerror() { return level0.get(this, 'onerror'); }
  set onerror(value) { level0.set(this, 'onerror', value); }

  get onfocus() { return level0.get(this, 'onfocus'); }
  set onfocus(value) { level0.set(this, 'onfocus', value); }

  get oninput() { return level0.get(this, 'oninput'); }
  set oninput(value) { level0.set(this, 'oninput', value); }

  get oninvalid() { return level0.get(this, 'oninvalid'); }
  set oninvalid(value) { level0.set(this, 'oninvalid', value); }

  get onkeydown() { return level0.get(this, 'onkeydown'); }
  set onkeydown(value) { level0.set(this, 'onkeydown', value); }

  get onkeypress() { return level0.get(this, 'onkeypress'); }
  set onkeypress(value) { level0.set(this, 'onkeypress', value); }

  get onkeyup() { return level0.get(this, 'onkeyup'); }
  set onkeyup(value) { level0.set(this, 'onkeyup', value); }

  get onload() { return level0.get(this, 'onload'); }
  set onload(value) { level0.set(this, 'onload', value); }

  get onloadeddata() { return level0.get(this, 'onloadeddata'); }
  set onloadeddata(value) { level0.set(this, 'onloadeddata', value); }

  get onloadedmetadata() { return level0.get(this, 'onloadedmetadata'); }
  set onloadedmetadata(value) { level0.set(this, 'onloadedmetadata', value); }

  get onloadstart() { return level0.get(this, 'onloadstart'); }
  set onloadstart(value) { level0.set(this, 'onloadstart', value); }

  get onmousedown() { return level0.get(this, 'onmousedown'); }
  set onmousedown(value) { level0.set(this, 'onmousedown', value); }

  get onmouseenter() { return level0.get(this, 'onmouseenter'); }
  set onmouseenter(value) { level0.set(this, 'onmouseenter', value); }

  get onmouseleave() { return level0.get(this, 'onmouseleave'); }
  set onmouseleave(value) { level0.set(this, 'onmouseleave', value); }

  get onmousemove() { return level0.get(this, 'onmousemove'); }
  set onmousemove(value) { level0.set(this, 'onmousemove', value); }

  get onmouseout() { return level0.get(this, 'onmouseout'); }
  set onmouseout(value) { level0.set(this, 'onmouseout', value); }

  get onmouseover() { return level0.get(this, 'onmouseover'); }
  set onmouseover(value) { level0.set(this, 'onmouseover', value); }

  get onmouseup() { return level0.get(this, 'onmouseup'); }
  set onmouseup(value) { level0.set(this, 'onmouseup', value); }

  get onmousewheel() { return level0.get(this, 'onmousewheel'); }
  set onmousewheel(value) { level0.set(this, 'onmousewheel', value); }

  get onpause() { return level0.get(this, 'onpause'); }
  set onpause(value) { level0.set(this, 'onpause', value); }

  get onplay() { return level0.get(this, 'onplay'); }
  set onplay(value) { level0.set(this, 'onplay', value); }

  get onplaying() { return level0.get(this, 'onplaying'); }
  set onplaying(value) { level0.set(this, 'onplaying', value); }

  get onprogress() { return level0.get(this, 'onprogress'); }
  set onprogress(value) { level0.set(this, 'onprogress', value); }

  get onratechange() { return level0.get(this, 'onratechange'); }
  set onratechange(value) { level0.set(this, 'onratechange', value); }

  get onreset() { return level0.get(this, 'onreset'); }
  set onreset(value) { level0.set(this, 'onreset', value); }

  get onresize() { return level0.get(this, 'onresize'); }
  set onresize(value) { level0.set(this, 'onresize', value); }

  get onscroll() { return level0.get(this, 'onscroll'); }
  set onscroll(value) { level0.set(this, 'onscroll', value); }

  get onseeked() { return level0.get(this, 'onseeked'); }
  set onseeked(value) { level0.set(this, 'onseeked', value); }

  get onseeking() { return level0.get(this, 'onseeking'); }
  set onseeking(value) { level0.set(this, 'onseeking', value); }

  get onselect() { return level0.get(this, 'onselect'); }
  set onselect(value) { level0.set(this, 'onselect', value); }

  get onshow() { return level0.get(this, 'onshow'); }
  set onshow(value) { level0.set(this, 'onshow', value); }

  get onstalled() { return level0.get(this, 'onstalled'); }
  set onstalled(value) { level0.set(this, 'onstalled', value); }

  get onsubmit() { return level0.get(this, 'onsubmit'); }
  set onsubmit(value) { level0.set(this, 'onsubmit', value); }

  get onsuspend() { return level0.get(this, 'onsuspend'); }
  set onsuspend(value) { level0.set(this, 'onsuspend', value); }

  get ontimeupdate() { return level0.get(this, 'ontimeupdate'); }
  set ontimeupdate(value) { level0.set(this, 'ontimeupdate', value); }

  get ontoggle() { return level0.get(this, 'ontoggle'); }
  set ontoggle(value) { level0.set(this, 'ontoggle', value); }

  get onvolumechange() { return level0.get(this, 'onvolumechange'); }
  set onvolumechange(value) { level0.set(this, 'onvolumechange', value); }

  get onwaiting() { return level0.get(this, 'onwaiting'); }
  set onwaiting(value) { level0.set(this, 'onwaiting', value); }

  get onauxclick() { return level0.get(this, 'onauxclick'); }
  set onauxclick(value) { level0.set(this, 'onauxclick', value); }

  get ongotpointercapture() { return level0.get(this, 'ongotpointercapture'); }
  set ongotpointercapture(value) { level0.set(this, 'ongotpointercapture', value); }

  get onlostpointercapture() { return level0.get(this, 'onlostpointercapture'); }
  set onlostpointercapture(value) { level0.set(this, 'onlostpointercapture', value); }

  get onpointercancel() { return level0.get(this, 'onpointercancel'); }
  set onpointercancel(value) { level0.set(this, 'onpointercancel', value); }

  get onpointerdown() { return level0.get(this, 'onpointerdown'); }
  set onpointerdown(value) { level0.set(this, 'onpointerdown', value); }

  get onpointerenter() { return level0.get(this, 'onpointerenter'); }
  set onpointerenter(value) { level0.set(this, 'onpointerenter', value); }

  get onpointerleave() { return level0.get(this, 'onpointerleave'); }
  set onpointerleave(value) { level0.set(this, 'onpointerleave', value); }

  get onpointermove() { return level0.get(this, 'onpointermove'); }
  set onpointermove(value) { level0.set(this, 'onpointermove', value); }

  get onpointerout() { return level0.get(this, 'onpointerout'); }
  set onpointerout(value) { level0.set(this, 'onpointerout', value); }

  get onpointerover() { return level0.get(this, 'onpointerover'); }
  set onpointerover(value) { level0.set(this, 'onpointerover', value); }

  get onpointerup() { return level0.get(this, 'onpointerup'); }
  set onpointerup(value) { level0.set(this, 'onpointerup', value); }
  /* c8 ignore stop */

}
