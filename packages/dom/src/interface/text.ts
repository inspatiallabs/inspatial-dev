// @ts-ignore - Ignoring TS extension import error
import { TEXT_NODE } from "../shared/constants.ts";
// @ts-ignore - Ignoring TS extension import error
import { VALUE } from "../shared/symbols.ts";
// @ts-ignore - Ignoring TS extension import error
import { CharacterData } from "./character-data.ts";

/**
 * @implements globalThis.Text
 */
export class Text extends CharacterData {
  constructor(ownerDocument: any, data: string = "") {
    super(ownerDocument, "#text", TEXT_NODE, data);
  }

  // @ts-ignore - Method exists in parent class
  get wholeText(): string {
    // @ts-ignore - Symbol property access
    return this[VALUE];
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
    return this[VALUE];
  }
}
