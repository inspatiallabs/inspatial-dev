// @ts-ignore - Ignoring TS extension import error
import { CLASS_LIST, NEXT, PREV, VALUE } from "./symbols.ts";

// @ts-ignore - Ignoring TS extension import error
import { knownAdjacent, knownSiblings } from "./util/utils.ts";

// @ts-ignore - Ignoring TS extension import error
import { attributeChangedCallback as ceAttributes } from "../interface/custom-element-registry.ts";
// @ts-ignore - Ignoring TS extension import error
import { attributeChangedCallback as moAttributes } from "../interface/mutation-observer.ts";
// @ts-ignore - Ignoring TS extension import error
import { Node } from "../interface/node.ts";

/**
 * Base properties expected on DOM Attribute nodes
 */
interface AttributeNode extends Node {
  [VALUE]: string;
  [NEXT]: Node | null;
  [PREV]: Node | null;
  name: string;
  ownerElement: Node | null;
}

/**
 * Base properties expected on DOM Element nodes
 */
interface ElementNode extends Node {
  [NEXT]: Node | null;
  [CLASS_LIST]: any | null;
  className: string;
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
  getAttribute(name: string): string | null;
  hasAttribute(name: string): boolean;
}

/**
 * Attribute accessor interface
 */
interface AttributeAccessor {
  get(element: ElementNode, name: string): any;
  set(element: ElementNode, name: string, value: any): void;
}

/**
 * Set of attributes that can be empty (boolean attributes)
 */
export const emptyAttributes = new Set([
  "allowfullscreen",
  "allowpaymentrequest",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "class",
  "contenteditable",
  "controls",
  "default",
  "defer",
  "disabled",
  "draggable",
  "formnovalidate",
  "hidden",
  "id",
  "ismap",
  "itemscope",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected",
  "style",
  "truespeed",
]);

/**
 * Sets an attribute on an element
 * @param element The element to set the attribute on
 * @param attribute The attribute to set
 */
export const setAttribute = (element: Node, attribute: Node): void => {
  // @ts-ignore - These properties exist at runtime in the implementation
  const { [VALUE]: value, name } = attribute;
  // @ts-ignore - These properties exist at runtime in the implementation
  attribute.ownerElement = element;
  // @ts-ignore - Element has the NEXT symbol property at runtime
  const nextNode = element[NEXT] as Node;
  knownSiblings(element, attribute, nextNode);
  if (name === "class")
    // @ts-ignore - className exists at runtime in the implementation
    element.className = value;
  // Use empty string instead of null for the old value
  moAttributes(element, name, "");
  ceAttributes(element, name, "", value);
};

/**
 * Removes an attribute from an element
 * @param element The element to remove the attribute from
 * @param attribute The attribute to remove
 */
export const removeAttribute = (element: Node, attribute: Node): void => {
  // @ts-ignore - These properties exist at runtime in the implementation
  const { [VALUE]: value, name } = attribute;
  // @ts-ignore - Symbol properties PREV and NEXT exist at runtime
  const prevNode = attribute[PREV] as Node | null;
  // @ts-ignore - Symbol property NEXT exists at runtime
  const nextNode = attribute[NEXT] as Node | null;

  // Only call knownAdjacent if both nodes are not null
  if (prevNode) {
    // @ts-ignore - This function can handle null values for the next node
    knownAdjacent(prevNode, nextNode);
  }

  // @ts-ignore - These properties exist at runtime in the implementation
  attribute.ownerElement = attribute[PREV] = attribute[NEXT] = null;
  if (name === "class")
    // @ts-ignore - This property exists at runtime in the implementation
    element[CLASS_LIST] = null;
  moAttributes(element, name, value);
  ceAttributes(element, name, value, null);
};

/**
 * Boolean attribute accessor
 */
export const booleanAttribute: AttributeAccessor = {
  get(element: ElementNode, name: string): boolean {
    return element.hasAttribute(name);
  },
  set(element: ElementNode, name: string, value: boolean): void {
    if (value) element.setAttribute(name, "");
    else element.removeAttribute(name);
  },
};

/**
 * Numeric attribute accessor
 */
export const numericAttribute: AttributeAccessor = {
  get(element: ElementNode, name: string): number {
    return parseFloat(element.getAttribute(name) || "0");
  },
  set(element: ElementNode, name: string, value: number): void {
    element.setAttribute(name, value.toString());
  },
};

/**
 * String attribute accessor
 */
export const stringAttribute: AttributeAccessor = {
  get(element: ElementNode, name: string): string {
    return element.getAttribute(name) || "";
  },
  set(element: ElementNode, name: string, value: string): void {
    element.setAttribute(name, value);
  },
};

/* oddly enough, this apparently is not a thing
export const nullableAttribute = {
  get(element, name) {
    return element.getAttribute(name);
  },
  set(element, name, value) {
    if (value === null)
      element.removeAttribute(name);
    else
      element.setAttribute(name, value);
  }
};
*/
