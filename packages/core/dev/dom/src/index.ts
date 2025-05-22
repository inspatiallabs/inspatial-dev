/*################################################(IMPORTS)################################################*/
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
import { Event as DOMEvent, CustomEvent as DOMCustomEvent } from "./cached.ts";
// @ts-ignore - Ignoring TS extension import error
import { Element } from "./interface/element.ts";
// @ts-ignore - Ignoring TS extension import error
import { applyHoudiniToElement } from "./interface/element-css-houdini.ts";
// @ts-ignore - Ignoring TS extension import error
import { EventTarget as DOMEventTarget } from "./interface/event-target.ts";
// @ts-ignore - Ignoring TS extension import error
import { illegalConstructor } from "./shared/facades.ts";
// @ts-ignore - Ignoring TS extension import error
import { NodeFilter } from "./interface/node-filter.ts";
// @ts-ignore - Ignoring TS extension import error
import { NamedNodeMap } from "./interface/named-node-map.ts";
// @ts-ignore - Ignoring TS extension import error
import { NodeList } from "./interface/node-list.ts";
// @ts-ignore - Ignoring TS extension import error
import { Event } from "./interface/event.ts";
// @ts-ignore - Ignoring TS extension import error
import { CustomEvent } from "./interface/custom-event.ts";
// @ts-ignore - Ignoring TS extension import error
import { EventTarget } from "./interface/event-target.ts";
// @ts-ignore - Ignoring TS extension import error
import { InputEvent } from "./interface/input-event.ts";
// @ts-ignore - Ignoring TS extension import error
import { MutationObserverClass as MutationObserver } from "./interface/mutation-observer.ts";
// @ts-ignore - Ignoring TS extension import error
import { HTMLElement } from "./html/element.ts";
// @ts-ignore - Ignoring TS extension import error
import { Text } from "./interface/text.ts";
// @ts-ignore - Ignoring TS extension import error
import { Comment } from "./interface/comment.ts";
// @ts-ignore - Ignoring TS extension import error
import { Attr } from "./interface/attr.ts";
// @ts-ignore - Ignoring TS extension import error
import { CDATASection } from "./interface/cdata-section.ts";
// @ts-ignore - Ignoring TS extension import error
import { CharacterData } from "./interface/character-data.ts";
// @ts-ignore - Ignoring TS extension import error
import { ProcessingInstruction } from "./interface/processing-instruction.ts";
// @ts-ignore - Ignoring TS extension import error
import { DocumentType } from "./interface/document-type.ts";
// @ts-ignore - Ignoring TS extension import error
import { ShadowRoot } from "./interface/shadow-root.ts";
// @ts-ignore - Ignoring TS extension import error
import { Range } from "./interface/range.ts";
// @ts-ignore - Ignoring TS extension import error
import { XMLDocument } from "./xml/document.ts";
// @ts-ignore - Ignoring TS extension import error
import { HTMLDocument } from "./html/document.ts";
// @ts-ignore - Ignoring TS extension import error
import { HTMLCollection } from "./interface/html-collection.ts";
// @ts-ignore - Ignoring TS extension import error
import { DOMImplementation } from "./interface/implementation.ts";
// @ts-ignore - Ignoring TS extension import error
import { CSSStyleDeclaration } from "./interface/css-style-declaration.ts";
// @ts-ignore - Ignoring TS extension import error
import { DocumentFragment } from "./interface/document-fragment.ts";

/*################################################(EXPORTS)################################################*/
/**
 * Parses HTML string and returns a document along with all DOM interfaces
 *
 * This is the main entry point for using InSpatial DOM. It provides access to:
 * - The parsed document and window objects
 * - All standard DOM interfaces (Element, Node, etc.)
 * - Helper methods for DOM manipulation
 *
 * @param html HTML string to parse
 * @param globals Optional global variables to include in the document
 * @returns Parsed document with window, document, and all DOM interfaces
 *
 * @example
 * // Parse HTML and access DOM elements
 * const { document, Element } = createDOM('<div>Hello World</div>');
 * const div = document.querySelector('div');
 * console.log(div.textContent); // "Hello World"
 */
export const createDOM = (
  html: string,
  globals = null
): {
  // Core DOM interfaces
  document: DOMDocument;
  window: Window;

  // Node Interfaces
  Node: typeof DOMNode;
  Element: typeof Element;
  HTMLElement: typeof HTMLElement;
  Text: typeof Text;
  Comment: typeof Comment;
  CDATASection: typeof CDATASection;
  ProcessingInstruction: typeof ProcessingInstruction;
  DocumentType: typeof DocumentType;
  DocumentFragment: typeof DocumentFragment;
  CharacterData: typeof CharacterData;
  ShadowRoot: typeof ShadowRoot;

  // Collection Interfaces
  NodeFilter: typeof NodeFilter;
  NodeList: typeof NodeList;
  NamedNodeMap: typeof NamedNodeMap;
  HTMLCollection: typeof HTMLCollection;

  // Document Interfaces
  Document: typeof DOMDocument;
  XMLDocument: typeof XMLDocument;
  HTMLDocument: typeof HTMLDocument;
  DOMImplementation: typeof DOMImplementation;

  // Attribute Interface
  Attr: typeof Attr;

  // Event-related interfaces
  Event: typeof Event;
  CustomEvent: typeof CustomEvent;
  EventTarget: typeof EventTarget;
  InputEvent: typeof InputEvent;

  // Range Interface
  Range: typeof Range;

  // Style Interface
  CSSStyleDeclaration: typeof CSSStyleDeclaration;

  // Observer Interfaces
  MutationObserver: typeof MutationObserver;

  // Parser Interface
  DOMParser: typeof DOMParser;

  // Catches all other interfaces and properties not explicitly listed above
  [key: string]: any;
} => {
  const view = new DOMParser().parseFromString(
    html,
    "text/html",
    globals
  ).defaultView;

  // Ensure all DOM interfaces are attached to the result
  const result = {
    ...view,
    // Node Interfaces
    Node: DOMNode,
    Element: Element,
    HTMLElement: HTMLElement,
    Text: Text,
    Comment: Comment,
    CDATASection: CDATASection,
    ProcessingInstruction: ProcessingInstruction,
    DocumentType: DocumentType,
    DocumentFragment: DocumentFragment,
    CharacterData: CharacterData,
    ShadowRoot: ShadowRoot,

    // Collection Interfaces
    NodeFilter: NodeFilter,
    NodeList: NodeList,
    NamedNodeMap: NamedNodeMap,
    HTMLCollection: HTMLCollection,

    // Document Interfaces
    Document: DOMDocument,
    XMLDocument: XMLDocument,
    HTMLDocument: HTMLDocument,
    DOMImplementation: DOMImplementation,

    // Attribute Interface
    Attr: Attr,

    // Event-related interfaces
    Event: Event,
    CustomEvent: CustomEvent,
    EventTarget: EventTarget,
    InputEvent: InputEvent,

    // Range Interface
    Range: Range,

    // Style Interface
    CSSStyleDeclaration: CSSStyleDeclaration,

    // Observer Interfaces
    MutationObserver: MutationObserver,

    // Parser Interface
    DOMParser: DOMParser,
  };

  return result;
};

/**
 * Document constructor placeholder
 * @throws Illegal constructor error
 */
export function Document() {
  illegalConstructor();
}

// Set up Document constructor correctly
// Instead of modifying prototypes directly, copy properties
Object.defineProperties(
  Document,
  Object.getOwnPropertyDescriptors(DOMDocument)
);
// Ensure the function name is preserved
Object.defineProperty(Document, "name", { value: "Document" });

/**
 * Exports the diffStream functionality for DOM diffing
 *
 * This is useful for comparing DOM states and generating minimal updates.
 */
// @ts-ignore - Ignoring TS extension import error
export { diffStream } from "./diff-stream.ts";

/**
 * Exports JSON utility functions for DOM serialization
 */
// @ts-ignore - Ignoring TS extension import error
export { parseJSON, toJSON } from "./shared/parse-json.ts";

/**
 * CSS Houdini API exports
 *
 * These provide access to the low-level CSS APIs for advanced styling capabilities.
 */

export * from "./interface/element-css-houdini.ts";

/**
 * HTML class name utilities
 */
// @ts-ignore - Ignoring TS extension import error
export * from "./shared/html-classes.ts";

/**
 * Initialize the DOM with enhanced features
 *
 * This applies all CSS Houdini enhancements to the Element interface.
 */
export function initializeDOM() {
  // Apply CSS Houdini enhancements to Element
  applyHoudiniToElement(Element);
}

// Optionally auto-initialize if in a browser environment
if (typeof window !== "undefined") {
  initializeDOM();
}
