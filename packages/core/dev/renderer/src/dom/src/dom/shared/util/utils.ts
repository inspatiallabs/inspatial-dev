// @ts-nocheck - This file uses custom DOM implementation with symbol properties and complex object manipulation that TypeScript cannot model correctly

import { Document } from "../../interface/document.ts";
import { Node } from "../../interface/node.ts";
import { ELEMENT_NODE, ATTRIBUTE_NODE } from "../constants.ts";
import { END, MIME, NEXT, PREV, START } from "../symbols.ts";
import {
  nextSibling,
  previousSibling,
} from "../../mixin/non-element-parent-node.ts";

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
}): boolean => ownerDocument[MIME].ignoreCase;

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
  return ownerDocument[MIME].ignoreCase ? localName.toLowerCase() : localName;
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
  U extends Record<string, any>,
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

export function createElement(nodeName, classNames) {
  const el = document.createElement(nodeName);
  if (classNames) {
    classNames = ensureArray(classNames);
    classNames.forEach((className) => el.classList.add(className));
  }
  return el;
}

export function emptyElement(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

export function emptyElements(els) {
  els = ensureArray(els);
  els.forEach((el) => emptyElement(el));
}

export function replaceContent(el, newContent) {
  emptyElement(el);
  el.insertAdjacentHTML("afterbegin", newContent);
}

export function removeElements(els) {
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
