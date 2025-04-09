// @ts-ignore - Ignoring TS extension import error
import { DOMParser } from "./document/parser.ts";
// @ts-ignore - Ignoring TS extension import error
import { Document as DOMDocument } from "./interface/document.ts";
// @ts-ignore - Ignoring TS extension import error
import { Element as DOMElement } from "./interface/element.ts";
// @ts-ignore - Ignoring TS extension import error
import { Node as DOMNode } from "./interface/node.ts";
// @ts-ignore - Ignoring TS extension import error
import { NodeList as DOMNodeList } from "./interface/node-list.ts";
// @ts-ignore - Ignoring TS extension import error
import { DocumentFragment as DOMDocumentFragment } from "./interface/document-fragment.ts";
// @ts-ignore - Ignoring TS extension import error
import {
  Event as DOMEvent,
  CustomEvent as DOMCustomEvent,
} from "./cached.ts";
// @ts-ignore - Ignoring TS extension import error
import { EventTarget as DOMEventTarget } from "./interface/event-target.ts";
// @ts-ignore - Ignoring TS extension import error
import { illegalConstructor } from "./shared/facades.ts";
// @ts-ignore - Ignoring TS extension import error
import { setPrototypeOf } from "./shared/object.ts";

/**
 * Parses HTML string and returns the document
 * @param html HTML string to parse
 * @param globals Global variables to include in the document
 * @returns Parsed document with window and document objects
 */
export const parseHTML = (html: string, globals = null): { 
  document: DOMDocument;
  window: Window;
  [key: string]: any;
} => new DOMParser().parseFromString(html, "text/html", globals).defaultView;

// Export diffStream functionality
// @ts-ignore - Ignoring TS extension import error
export { diffStream } from "./diff-stream.ts";

// Export InSpatialDOM namespace for convenience
export const InSpatialDOM = {
  DOMParser,
  parseHTML,
  DOMDocument,
  DOMElement,
  DOMNode,
  DOMNodeList,
  DOMDocumentFragment,
  DOMEvent,
  DOMCustomEvent,
  DOMEventTarget,
};

// Individual exports
export {
  DOMParser,
  DOMDocument,
  DOMElement,
  DOMNode,
  DOMNodeList,
  DOMDocumentFragment,
  DOMEvent,
  DOMCustomEvent,
  DOMEventTarget,
};

// Export shared facades and HTML classes
// @ts-ignore - Ignoring TS extension import error
export * from "./shared/facades.ts";
// @ts-ignore - Ignoring TS extension import error
export * from "./shared/html-classes.ts";

// Re-export interfaces from dom module
// @ts-ignore - Ignoring TS extension import error
export { CustomEvent } from "./interface/custom-event.ts";
// @ts-ignore - Ignoring TS extension import error
export { Event } from "./interface/event.ts";
// @ts-ignore - Ignoring TS extension import error
export { EventTarget } from "./interface/event-target.ts";
// @ts-ignore - Ignoring TS extension import error
export { InputEvent } from "./interface/input-event.ts";
// @ts-ignore - Ignoring TS extension import error
export { NodeList } from "./interface/node-list.ts";
// @ts-ignore - Ignoring TS extension import error
export { NodeFilter } from "./interface/node-filter.ts";

/**
 * Document constructor placeholder
 * @throws Illegal constructor error
 */
export function Document() {
  illegalConstructor();
}

// Set up Document constructor correctly
// Instead of modifying prototypes directly, copy properties
Object.defineProperties(Document, Object.getOwnPropertyDescriptors(DOMDocument));
// Ensure the function name is preserved
Object.defineProperty(Document, 'name', { value: 'Document' });

// Export JSON utility functions
// @ts-ignore - Ignoring TS extension import error
export { parseJSON, toJSON } from "./shared/parse-json.ts";
