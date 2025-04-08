// @ts-ignore - Ignoring TS extension import error
import { HTMLElement } from "./element.ts";
// @ts-ignore - Ignoring TS extension import error
import { booleanAttribute, stringAttribute } from "../shared/attributes.ts";
// @ts-ignore - Ignoring TS extension import error
import { registerHTMLClass } from "../shared/register-html-class.ts";

const tagName = "option";

/**
 * @implements globalThis.HTMLOptionElement
 */
export class HTMLOptionElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = tagName) {
    super(ownerDocument, localName);
  }

  /* c8 ignore start */
  get value() {
    return stringAttribute.get(this as any, "value");
  }
  set value(value) {
    stringAttribute.set(this as any, "value", value);
  }
  /* c8 ignore stop */

  get selected() {
    return booleanAttribute.get(this as any, "selected");
  }
  set selected(value) {
    const option = this.parentElement as any;
    if (option?.querySelector) {
      const selectedOption = option.querySelector("option[selected]");
      if (selectedOption && selectedOption !== this)
        (selectedOption as any).selected = false;
    }
    booleanAttribute.set(this as any, "selected", value);
  }
}

registerHTMLClass(tagName, HTMLOptionElement);
