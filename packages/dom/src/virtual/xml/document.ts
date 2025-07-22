// @ts-ignore - Ignoring TS extension import error
import { MIME } from "../shared/symbols.ts";
// @ts-ignore - Ignoring TS extension import error
import { Document } from "../interface/document.ts";

/**
 * Interface for document with MIME type
 */
interface DocumentWithMIME extends Document {
  [MIME]: {
    docType: string;
  };
}

/**
 * @implements globalThis.XMLDocument
 */
export class XMLDocument extends Document {
  // Declare the MIME symbol property to make TypeScript happy
  [MIME]!: {
    docType: string;
  };

  /**
   * Create a new XML document
   */
  constructor() {
    super("text/xml");
  }

  /**
   * Convert the document to a string
   * @returns String representation of the XML document
   */
  override toString(): string {
    return this[MIME].docType + super.toString();
  }
}
