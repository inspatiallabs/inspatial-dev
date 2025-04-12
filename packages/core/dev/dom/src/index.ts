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
import { Element } from "./interface/element.ts";
import { applyHoudiniToElement } from "./interface/element-css-houdini.ts";
import { EventTarget as DOMEventTarget } from "./interface/event-target.ts";
import { illegalConstructor } from "./shared/facades.ts";
import { NodeFilter } from "./interface/node-filter.ts";
import { NamedNodeMap } from "./interface/named-node-map.ts";
import { NodeList } from "./interface/node-list.ts";
import { Event } from "./interface/event.ts";
import { CustomEvent } from "./interface/custom-event.ts";
import { EventTarget } from "./interface/event-target.ts";
import { InputEvent } from "./interface/input-event.ts";
import { MutationObserverClass as MutationObserver } from "./interface/mutation-observer.ts";
import { HTMLElement } from "./html/element.ts";
import { Text } from "./interface/text.ts";
import { Comment } from "./interface/comment.ts";
import { Attr } from "./interface/attr.ts";
import { CDATASection } from "./interface/cdata-section.ts";
import { CharacterData } from "./interface/character-data.ts";
import { ProcessingInstruction } from "./interface/processing-instruction.ts";
import { DocumentType } from "./interface/document-type.ts";
import { ShadowRoot } from "./interface/shadow-root.ts";
import { Range } from "./interface/range.ts";
import { XMLDocument } from "./xml/document.ts";
import { HTMLDocument } from "./html/document.ts";
import { HTMLCollection } from "./interface/html-collection.ts";
import { DOMImplementation } from "./interface/implementation.ts";
import { CSSStyleDeclaration } from "./interface/css-style-declaration.ts";
import { DocumentFragment } from "./interface/document-fragment.ts";

/*################################################(EXPORTS)################################################*/
/**
 * Parses HTML string and returns the document along with all DOM interfaces
 * @param html HTML string to parse
 * @param globals Global variables to include in the document
 * @returns Parsed document with window, document, and all DOM interfaces
 */
export const parseHTML = (
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

  // Catches all other interfaces and interfaces not explicitly listed above
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

// Export diffStream functionality
export { diffStream } from "./diff-stream.ts";

// Export InSpatialDOM namespace for convenience
export const InSpatialDOM = {
  DOMParser,
  parseHTML,
  // Core DOM interfaces with original names
  DOMDocument,
  DOMElement,
  DOMNode,
  DOMNodeList,
  DOMDocumentFragment,
  DOMEvent,
  DOMCustomEvent,
  DOMEventTarget,

  // Add all DOM interfaces to the namespace for easy access
  Element,
  HTMLElement,
  Text,
  Comment,
  CDATASection,
  ProcessingInstruction,
  DocumentType,
  DocumentFragment,
  CharacterData,
  ShadowRoot,
  NodeFilter,
  NodeList,
  NamedNodeMap,
  HTMLCollection,
  Document: DOMDocument,
  XMLDocument,
  HTMLDocument,
  DOMImplementation,
  Attr,
  Event,
  CustomEvent,
  EventTarget,
  InputEvent,
  Range,
  CSSStyleDeclaration,
  MutationObserver,
};

// Individual exports of DOM original naming
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

// Export the standard DOM interfaces directly
export {
  Element,
  HTMLElement,
  Text,
  Comment,
  CDATASection,
  ProcessingInstruction,
  DocumentType,
  CharacterData,
  ShadowRoot,
  HTMLCollection,
  XMLDocument,
  HTMLDocument,
  DOMImplementation,
  Attr,
  Range,
  CSSStyleDeclaration,
  MutationObserver,
};

// Export only what's available from facades
export { illegalConstructor } from "./shared/facades.ts";

// Export HTML classes
export * from "./shared/html-classes.ts";

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

// Export JSON utility functions
export { parseJSON, toJSON } from "./shared/parse-json.ts";

/**
 * InSpatial DOM Main Module
 */

// Export CSS Houdini implementation
export * from "./houdini/css-typed-om.ts";
export * from "./interface/element-css-houdini.ts";

/**
 * Initialize the DOM with enhanced features
 */
export function initializeDOM() {
  // Apply CSS Houdini enhancements to Element
  applyHoudiniToElement(Element);
}

// Optionally auto-initialize if in a browser environment
if (typeof window !== "undefined") {
  initializeDOM();
}
