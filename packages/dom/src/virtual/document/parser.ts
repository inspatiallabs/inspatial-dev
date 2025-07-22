import { DOM_PARSER, GLOBALS } from "../shared/symbols.ts";
import { parseFromString } from "../shared/parse-from-string.ts";
import { HTMLDocument } from "../html/document.ts";
import { SVGDocument } from "../svg/document.ts";
import { XMLDocument } from "../xml/document.ts";

/**
 * @implements globalThis.DOMParser
 */
export class DOMParser {
  /** @typedef {{ "text/html": HTMLDocument, "image/svg+xml": SVGDocument, "text/xml": XMLDocument }} MimeToDoc */
  /**
   * @template {keyof MimeToDoc} MIME
   * @param {string} markupLanguage
   * @param {MIME} mimeType
   * @returns {MimeToDoc[MIME]}
   */
  parseFromString(
    markupLanguage: string,
    mimeType: string,
    globals = null
  ): HTMLDocument | SVGDocument | XMLDocument {
    let isHTML = false,
      document;
    if (mimeType === "text/html") {
      isHTML = true;
      document = new HTMLDocument();
    } else if (mimeType === "image/svg+xml") document = new SVGDocument();
    else document = new XMLDocument();
    document[DOM_PARSER] = DOMParser;
    if (globals) document[GLOBALS] = globals;
    if (isHTML && markupLanguage === "...")
      markupLanguage = "<!doctype html><html><head></head><body></body></html>";
    return markupLanguage
      ? parseFromString(document, isHTML, markupLanguage)
      : document;
  }
}
