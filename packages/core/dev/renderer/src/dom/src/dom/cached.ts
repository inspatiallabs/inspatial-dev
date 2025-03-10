/**
 * Cache module for DOM elements and operations
 * Provides a central place for storing and retrieving DOM-related data
 */

// Define all the interfaces for DOM objects
// @ts-ignore - Ignoring TS extension import error
import {Event, EventInit, EventListener, EventListenerOptions} from './interface/event.ts';
// @ts-ignore - Ignoring TS extension import error
import {NodeList} from './interface/node-list.ts';
// @ts-ignore - Ignoring TS extension import error
import {CustomEvent, CustomEventInit} from './interface/custom-event.ts';
// @ts-ignore - Ignoring TS extension import error
import {HTMLCollection} from './interface/html-collection.ts';
// @ts-ignore - Ignoring TS extension import error
import {DOMImplementation} from './interface/implementation.ts';
// @ts-ignore - Ignoring TS extension import error
import {Document, DocumentType} from './interface/document.ts';
// @ts-ignore - Ignoring TS extension import error
import {DocumentFragment} from './interface/document-fragment.ts';
// @ts-ignore - Ignoring TS extension import error
import {Node, NodeFilter} from './interface/node.ts';
// @ts-ignore - Ignoring TS extension import error
import {Element} from './interface/element.ts';
// @ts-ignore - Ignoring TS extension import error
import {Attr} from './interface/attr.ts';
// @ts-ignore - Ignoring TS extension import error
import {CharacterData} from './interface/character-data.ts';
// @ts-ignore - Ignoring TS extension import error
import {Text} from './interface/text.ts';
// @ts-ignore - Ignoring TS extension import error
import {Comment} from './interface/comment.ts';
// @ts-ignore - Ignoring TS extension import error
import {CDATASection} from './interface/cdata-section.ts';
// @ts-ignore - Ignoring TS extension import error
import {ProcessingInstruction} from './interface/processing-instruction.ts';
// @ts-ignore - Ignoring TS extension import error
import {ShadowRoot} from './interface/shadow-root.ts';
// @ts-ignore - Ignoring TS extension import error
import {Range} from './interface/range.ts';
// @ts-ignore - Ignoring TS extension import error
import {XMLDocument} from './xml/document.ts';
// @ts-ignore - Ignoring TS extension import error
import {HTMLDocument} from './html/document.ts';

// Cache utilities
// @ts-ignore - Ignoring TS extension import error
import {
  childNodesWM,
  childrenWM,
  querySelectorWM,
  querySelectorAllWM,
  get,
  reset
} from './shared/cache.ts';

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
  EventInit,
  EventListener,
  EventListenerOptions,
  CustomEvent,
  CustomEventInit,
  Range
};

// Export cache utilities with type information
export const cache = {
  // Create a new WeakMap for caching (implemented here since it's not in the original cache.ts)
  create: <K extends keyof CacheTypes>(type: K): CacheTypes[K] => new WeakMap() as CacheTypes[K],
  get: get as <K extends keyof CacheTypes, V>(map: CacheTypes[K], obj: any, key: string, callback: () => V) => V,
  reset
};

// @ts-ignore - Ignoring TS extension import error
export * from "./index.ts";
