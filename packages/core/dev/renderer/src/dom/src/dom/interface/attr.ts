// @ts-ignore - Ignoring TS extension import error
import { ATTRIBUTE_NODE } from "../shared/constants.ts";
// @ts-ignore - Ignoring TS extension import error
import { CHANGED, VALUE } from "../shared/symbols.ts";
// @ts-ignore - Ignoring TS extension import error
import { String, ignoreCase } from "../shared/util/utils.ts";
// @ts-ignore - Ignoring TS extension import error
import { attrAsJSON } from "../shared/jsdon.ts";
// @ts-ignore - Ignoring TS extension import error
import { emptyAttributes } from "../shared/attributes.ts";

// @ts-ignore - Ignoring TS extension import error
import { attributeChangedCallback as moAttributes } from "./mutation-observer.ts";
// @ts-ignore - Ignoring TS extension import error
import { attributeChangedCallback as ceAttributes } from "./custom-element-registry.ts";

// @ts-ignore - Ignoring TS extension import error
import { Node } from "./node.ts";
// @ts-ignore - Ignoring TS extension import error
import { escapeHtml } from "../../../../../../util/src/escape-html.ts";

const QUOTE = /"/g;

// Interface extension for symbol properties
export interface Attr {
  [VALUE]: string;
  [CHANGED]: boolean;
}

/**
 * @implements globalThis.Attr
 */
export class Attr extends Node {
  ownerElement: any;
  name: string;

  constructor(ownerDocument: any, name: string, value: string = "") {
    super(ownerDocument, name, ATTRIBUTE_NODE);
    this.ownerElement = null;
    this.name = String(name);
    // @ts-ignore - Symbol property access
    this[VALUE] = String(value);
    // @ts-ignore - Symbol property access
    this[CHANGED] = false;
  }

  get value(): string {
    // @ts-ignore - Symbol property access
    return this[VALUE];
  }

  set value(newValue: string) {
    // @ts-ignore - Symbol property access
    const { [VALUE]: oldValue, name, ownerElement } = this;
    // @ts-ignore - Symbol property access
    this[VALUE] = String(newValue);
    // @ts-ignore - Symbol property access
    this[CHANGED] = true;
    if (ownerElement) {
      moAttributes(ownerElement, name, oldValue);
      // @ts-ignore - Symbol property access
      ceAttributes(ownerElement, name, oldValue, this[VALUE]);
    }
  }

  // @ts-ignore - Method exists in parent class
  override cloneNode(): Attr {
    // @ts-ignore - Symbol property access
    const { ownerDocument, name, [VALUE]: value } = this;
    return new Attr(ownerDocument, name, value);
  }

  // @ts-ignore - Method exists in parent class
  override toString(): string {
    // @ts-ignore - Symbol property access
    const { name, [VALUE]: value } = this;
    if (emptyAttributes.has(name) && !value) {
      return ignoreCase(this) ? name : `${name}=""`;
    }
    const escapedValue = (ignoreCase(this) ? value : escapeHtml(value)).replace(
      QUOTE,
      "&quot;"
    );
    return `${name}="${escapedValue}"`;
  }

  toJSON(): any[] {
    const json: any[] = [];
    attrAsJSON(this, json);
    return json;
  }
}
