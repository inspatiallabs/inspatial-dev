// @ts-ignore - Ignoring TS extension import error
import { TEXT_NODE } from "../shared/constants.ts";
// @ts-ignore - Ignoring TS extension import error
import { VALUE } from "../shared/symbols.ts";
// @ts-ignore - Ignoring TS extension import error
import { escapeHtml } from "../../../../util/src/escape-html.ts";

// @ts-ignore - Ignoring TS extension import error
import { CharacterData } from "./character-data.ts";

/**
 * @implements globalThis.Text
 */
export class Text extends CharacterData {
  constructor(ownerDocument: any, data: string = "") {
    super(ownerDocument, "#text", TEXT_NODE, data);
  }

  get wholeText(): string {
    const text: string[] = [];
    // @ts-ignore - Properties exist at runtime
    let { previousSibling, nextSibling } = this;
    while (previousSibling) {
      if (previousSibling.nodeType === TEXT_NODE)
        // @ts-ignore - Symbol property access
        text.unshift(previousSibling[VALUE]);
      else break;
      previousSibling = previousSibling.previousSibling;
    }
    // @ts-ignore - Symbol property access
    text.push(this[VALUE]);
    while (nextSibling) {
      if (nextSibling.nodeType === TEXT_NODE)
        // @ts-ignore - Symbol property access
        text.push(nextSibling[VALUE]);
      else break;
      nextSibling = nextSibling.nextSibling;
    }
    return text.join("");
  }

  // @ts-ignore - Method exists in parent class
  cloneNode(): Text {
    // @ts-ignore - Symbol property access
    const { ownerDocument, [VALUE]: data } = this;
    return new Text(ownerDocument, data);
  }

  // @ts-ignore - Method exists in parent class
  toString(): string {
    // @ts-ignore - Symbol property access
    return escapeHtml(this[VALUE]);
  }
}
