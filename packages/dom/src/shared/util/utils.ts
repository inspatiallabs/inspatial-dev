// @ts-nocheck - This file uses custom DOM implementation with symbol properties and complex object manipulation that TypeScript cannot model correctly

import type { Document } from "../../interface/document.ts";
import type { Node } from "../../interface/node.ts";
// @ts-ignore - Ignoring TS extension import error
import {
  ELEMENT_NODE,
  type TEXT_NODE as _TEXT_NODE,
} from "../constants.ts";
// @ts-ignore - Ignoring TS extension import error
import { END, MIME, NEXT, PREV } from "../symbols.ts";
// @ts-ignore - Ignoring TS extension import error
import type {
  previousElementSibling as _previousElementSibling,
} from "../node.ts";
import type { Attribute } from "../../lite/types.ts";

export const String: StringConstructor = globalThis.String;

/**
 * Gets the end node of a DOM node
 * @param node The node to get the end of
 * @returns The end node
 */
export const getEnd = (node: Node): Node =>
  node.nodeType === ELEMENT_NODE ? node[END] || node : node;

/**
 * Determines if the document uses case-insensitive matching
 * @param owner The document owner element
 * @returns Whether case is ignored
 */
export const ignoreCase = ({
  ownerDocument,
}: {
  ownerDocument: Document;
}): boolean => {
  // Safety check for MIME property
  const mime = ownerDocument[MIME];
  return mime ? mime.ignoreCase : true; // Default to true for HTML documents
};

/**
 * Sets two nodes to be adjacent
 * @param prev The previous node
 * @param next The next node
 */
export const knownAdjacent = (prev: Node | null, next: Node | null): void => {
  if (prev) prev[NEXT] = next;
  if (next) next[PREV] = prev;
};

/**
 * Sets boundaries for a current node
 * @param prev The previous node
 * @param current The current node
 * @param next The next node
 */
export const knownBoundaries = (
  prev: Node | null,
  current: Node | null,
  next: Node | null
): void => {
  knownAdjacent(prev, current);
  knownAdjacent(current, next);
};

/**
 * Sets a segment of nodes to be connected
 * @param prev The previous node
 * @param start The start node
 * @param end The end node
 * @param next The next node
 */
export const knownSegment = (
  prev: Node | null,
  start: Node | null,
  end: Node | null,
  next: Node | null
): void => {
  knownAdjacent(prev, start);
  knownAdjacent(end, next);
};

/**
 * Makes two nodes siblings
 * @param prev The previous node
 * @param current The current node
 * @param next The next node
 */
export const knownSiblings = (
  prev: Node | null,
  current: Node | null,
  next: Node | null
): void => {
  knownAdjacent(prev, current);
  knownAdjacent(current, next);
};

/**
 * Gets the local name with appropriate case sensitivity
 * @param node The node with a local name
 * @returns The local name with appropriate case
 */
export const localCase = ({
  localName,
  ownerDocument,
}: {
  localName: string;
  ownerDocument: Document;
}): string => {
  // Safety check for MIME property
  const mime = ownerDocument[MIME];
  const shouldIgnoreCase = mime ? mime.ignoreCase : true; // Default to true for HTML documents
  return shouldIgnoreCase ? localName.toLowerCase() : localName;
};

/**
 * Sets two nodes to be adjacent
 * @param prev The previous node
 * @param next The next node
 */
export const setAdjacent = (prev: Node | null, next: Node | null): void => {
  if (prev) prev[NEXT] = next;
  if (next) next[PREV] = prev;
};

/**
 * Checks if a value is a proper object
 * @param val The value to check
 * @returns Whether the value is an object
 */
export default function isObject(val: unknown): boolean {
  return val != null && typeof val === "object" && Array.isArray(val) === false;
}

/**
 * Ensures a value is an array
 * @param obj The object to ensure is an array
 * @returns The object as an array
 */
export function ensureArray<T>(obj: T | T[]): T[] {
  if (Array.isArray(obj)) {
    return obj;
  }
  return [obj];
}

/**
 * Performs a deep assignment between objects
 * @param target The target object
 * @param source The source object
 * @returns The merged object
 */
export function assignDeep<
  T extends Record<string, any>,
  U extends Record<string, any>
>(target: T, source: U): Record<string, any> {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = assignDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output as T & U;
}

export function isElement(o) {
  return typeof HTMLElement === "object"
    ? o instanceof HTMLElement
    : o &&
        typeof o === "object" &&
        o !== null &&
        o.nodeType === 1 &&
        typeof o.nodeName === "string";
}

export function createElement(nodeName: string, classNames: string[]) {
  const el = document.createElement(nodeName);
  if (classNames) {
    classNames = ensureArray(classNames);
    classNames.forEach((className) => el.classList.add(className));
  }
  return el;
}

export function emptyElement(el: Node) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

export function emptyElements(els: Node[]) {
  els = ensureArray(els);
  els.forEach((el) => emptyElement(el));
}

export function replaceContent(el: Node, newContent: string) {
  emptyElement(el);
  el.insertAdjacentHTML("afterbegin", newContent);
}

export function removeElements(els: Node[]) {
  els = ensureArray(els);
  els.forEach((el) => el.parentNode.removeChild(el));
}

export function wrapElements(elsToWrap, wrapperEl) {
  elsToWrap = ensureArray(elsToWrap);
  const firstElToWrap = elsToWrap[0];
  firstElToWrap.parentNode.insertBefore(wrapperEl, firstElToWrap);
  elsToWrap.forEach((elToWrap) => wrapperEl.appendChild(elToWrap));
}

export function unwrapElements(wrapperEls) {
  wrapperEls = ensureArray(wrapperEls);
  wrapperEls.forEach((wrapperEl) => {
    const fragment = document.createDocumentFragment();
    while (wrapperEl.firstChild) {
      fragment.appendChild(wrapperEl.firstChild);
    }
    wrapperEl.parentNode.replaceChild(fragment, wrapperEl);
  });
}

export const createDOMTagger = (key: string, extender: any) => {
  key = `__indom_is_${key}`;

  const maker = (_, ...args: any[]) => {
    if (_ && _.prototype[key]) return _;
    const extendedClass = extender(_, ...args);
    Object.defineProperty(extendedClass.prototype, key, {
      enumerable: false,
      value: true,
    });
    return extendedClass;
  };

  maker.master = (...args: any[]) => {
    const extendedClass = maker(...args);

    Object.defineProperty(extendedClass, Symbol.hasInstance, {
      value(instance: any) {
        return instance && instance[key];
      },
    });

    return extendedClass;
  };

  return maker;
};



const selfClosingTags: Record<string, boolean> = {
  area: true,
  base: true,
  br: true,
  col: true,
  command: true,
  embed: true,
  hr: true,
  img: true,
  input: true,
  keygen: true,
  link: true,
  menuitem: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true
};

// const serializerRegexp = /[&'"<>\u00a0-\u00b6\u00b8-\u00ff\u0152\u0153\u0160\u0161\u0178\u0192\u02c6\u02dc\u0391-\u03a1\u03a3-\u03a9\u03b1-\u03c9\u03d1\u03d2\u03d6\u2002\u2003\u2009\u200c-\u200f\u2013\u2014\u2018-\u201a\u201c-\u201e\u2020-\u2022\u2026\u2030\u2032\u2033\u2039\u203a\u203e\u20ac\u2122\u2190-\u2194\u21b5\u2200\u2202\u2203\u2205\u2207-\u2209\u220b\u220f\u2211\u2212\u2217\u221a\u221d\u221e\u2220\u2227-\u222b\u2234\u223c\u2245\u2248\u2260\u2261\u2264\u2265\u2282-\u2284\u2286\u2287\u2295\u2297\u22a5\u22c5\u2308-\u230b\u25ca\u2660\u2663\u2665\u2666]/g
const serializerRegexp = /[&'"<>]/g;

/**
 * Encodes special characters in a string to their HTML entity codes
 */
const enc = (s: string): string => `${s}`.replace(serializerRegexp, a => `&#${a.codePointAt(0)};`);

/**
 * Formats a DOM attribute as a string for HTML output
 */
const attr = (a: Attribute): string => {
  if (a.value !== '') {
    if (a.ns) {
      return ` ${a.ns}:${a.name}="${enc(a.value)}"`;
    }
    return ` ${a.name}="${enc(a.value)}"`;
  }
  return ` ${a.name}`;
};

/*####################################
 * SERIALIZER
 *####################################*/

/**
 * Interface for objects that can be serialized to HTML/XML
 */
export interface Serializable {
  nodeType: number;
  data?: string;
  parentNode?: {
    nodeName?: string;
  } | null;
  nodeName?: string;
  localName?: string;
  attributes?: Attribute[];
  firstChild?: Serializable | null;
  nextSibling?: Serializable | null;
}

/**
 * Converts a DOM node to its HTML/XML string representation
 * @param el The node to serialize
 * @param useRawName Whether to use raw (case-preserved) element names
 * @returns The HTML/XML string representation
 */
export const serializeDOM = (el: Serializable, useRawName?: boolean): string => {
  switch (el.nodeType) {
    case 3: { // Text node
      if (el.data) {
        if (el.parentNode && ['SCRIPT', 'STYLE', 'TEMPLATE'].indexOf(el.parentNode.nodeName || '') > -1) return el.data;
        return enc(el.data);
      }
      return '';
    }
    case 8: { // Comment node
      if (el.data) return `<!--${el.data}-->`;
      return '<!---->';
    }
    default: { // Element node
      if (!el.nodeName) return '';
      const { nodeName, localName, attributes, firstChild } = el;
      const xmlStringFrags: string[] = [];
      let tag = nodeName;
      if (useRawName) tag = localName;
      else if (nodeName) tag = nodeName.toLowerCase();
      
      if (tag && tag[0] === '#') tag = tag.substring(1);
      if (tag) xmlStringFrags.push(`<${tag}`);
      if (attributes) xmlStringFrags.push(...attributes.map(attr));
      
      if (firstChild) {
        if (tag) xmlStringFrags.push('>');
        let currentNode: Serializable | null | undefined = firstChild;
        while (currentNode) {
          xmlStringFrags.push(serialize(currentNode, useRawName));
          currentNode = currentNode.nextSibling;
        }
        if (tag) xmlStringFrags.push(`</${tag}>`);
      } else if (tag) {
        if (selfClosingTags[tag]) xmlStringFrags.push('/>');
        else xmlStringFrags.push(`></${tag}>`);
      }
      
      return ''.concat(...xmlStringFrags);
    }
  }
};
