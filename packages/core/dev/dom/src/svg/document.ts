// @ts-ignore - Ignoring TS extension import error
import { MIME } from "../shared/symbols.ts";
// @ts-ignore - Ignoring TS extension import error
import { Document } from "../interface/document.ts";

/**
 * @implements globalThis.Document
 */
export class SVGDocument extends Document {
  constructor() {
    super("image/svg+xml");
  }
  override toString() {
    return this[MIME].docType + super.toString();
  }
}
