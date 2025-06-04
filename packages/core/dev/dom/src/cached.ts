/**
 * Cache module for DOM elements and operations
 * Provides a central place for storing and retrieving DOM-related data
 */

// Define all the interfaces for DOM objects
// @ts-ignore - Ignoring TS extension import error
import { Event } from "./interface/event.ts";
// @ts-ignore - Ignoring TS extension import error
import { NodeList } from "./interface/node-list.ts";
// @ts-ignore - Ignoring TS extension import error
import { CustomEvent, type CustomEventInit } from "./interface/custom-event.ts";
// @ts-ignore - Ignoring TS extension import error
import { HTMLCollection } from "./interface/html-collection.ts";
// @ts-ignore - Ignoring TS extension import error
import { DOMImplementation } from "./interface/implementation.ts";
// @ts-ignore - Ignoring TS extension import error
import { Document } from "./interface/document.ts";
// @ts-ignore - Ignoring TS extension import error
import { DocumentType } from "./interface/document-type.ts";
// @ts-ignore - Ignoring TS extension import error
import { DocumentFragment } from "./interface/document-fragment.ts";
// @ts-ignore - Ignoring TS extension import error
import { Node } from "./interface/node.ts";
// @ts-ignore - Ignoring TS extension import error
import { NodeFilter } from "./interface/node-filter.ts";
// @ts-ignore - Ignoring TS extension import error
import { Element } from "./interface/element.ts";
// @ts-ignore - Ignoring TS extension import error
import { Attr } from "./interface/attr.ts";
// @ts-ignore - Ignoring TS extension import error
import { CharacterData } from "./interface/character-data.ts";
// @ts-ignore - Ignoring TS extension import error
import { Text } from "./interface/text.ts";
// @ts-ignore - Ignoring TS extension import error
import { Comment } from "./interface/comment.ts";
// @ts-ignore - Ignoring TS extension import error
import { CDATASection } from "./interface/cdata-section.ts";
// @ts-ignore - Ignoring TS extension import error
import { ProcessingInstruction } from "./interface/processing-instruction.ts";
// @ts-ignore - Ignoring TS extension import error
import { ShadowRoot } from "./interface/shadow-root.ts";
// @ts-ignore - Ignoring TS extension import error
import { Range } from "./interface/range.ts";
// @ts-ignore - Ignoring TS extension import error
import { XMLDocument } from "./xml/document.ts";
// @ts-ignore - Ignoring TS extension import error
import { HTMLDocument } from "./html/document.ts";

// Cache utilities
// @ts-ignore - Ignoring TS extension import error
import { get, reset } from "./shared/cache.ts";

// Define types for various DOM interfaces
interface AttrElement {
  value: string;
}

type ElementWithContent = Element & {
  textContent: string;
  contentWindow?: Window;
  value?: string;
};

// Define cache types
interface CacheTypes {
  event: WeakMap<Event, any>;
  attrElement: WeakMap<AttrElement, any>;
  element: WeakMap<ElementWithContent, any>;
}

// Export useful DOM APIs
export {
  HTMLDocument,
  XMLDocument,
  DOMImplementation,
  Document,
  DocumentFragment,
  DocumentType,
  Element,
  Attr,
  CharacterData,
  Text,
  CDATASection,
  ProcessingInstruction,
  Comment,
  ShadowRoot,
  Node,
  NodeFilter,
  NodeList,
  HTMLCollection,
  Event,
  CustomEvent,
  Range,
};
// Using 'export type' for interfaces when 'isolatedModules' is enabled
export type { CustomEventInit };

// Export cache utilities with type information
export const cache = {
  // Create a new WeakMap for caching (implemented here since it's not in the original cache.ts)
  create: <K extends keyof CacheTypes>(_type: K): CacheTypes[K] =>
    new WeakMap() as CacheTypes[K],

  // Create a wrapper function that adapts the original get function to match the expected signature
  get: <K extends keyof CacheTypes, V>(
    map: CacheTypes[K],
    obj: any,
    _key: string,
    callback: () => V
  ): V => {
    return get(map as WeakMap<object, V>, obj, callback as any) as V;
  },
  reset,
};

// @ts-ignore - Ignoring TS extension import error
export * from "./index.ts";
