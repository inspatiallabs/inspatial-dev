import { globals } from "./globals.ts";

import {
  isRegisteredTargetSymbol,
  isDomSymbol,
  isSvgSymbol,
  transformsSymbol,
  isBrowser,
} from "./consts.ts";

// Define helper functions directly rather than importing from helpers.ts
const isNil = (value: any): value is null | undefined => value === null || typeof value === "undefined";
const isArr = Array.isArray;
const isStr = (value: any): value is string => typeof value === "string";
const isSvg = (node: any): boolean => {
  return node instanceof SVGElement || node?.ownerSVGElement || 
         (typeof node?.toString === 'function' && /svg/i.test(node.toString()));
};

/**
 * Gets a NodeList or HTMLCollection from a selector or returns the input if it's already a NodeList/HTMLCollection
 * 
 * @param {any} v - Selector string or DOM collection
 * @return {NodeList|HTMLCollection|undefined} - The DOM collection or undefined
 */
export function getNodeList(v: any): NodeList | HTMLCollection | undefined {
  if (!globals.root) return undefined;
  const n = isStr(v) ? globals.root.querySelectorAll(v) : v;
  if (n instanceof NodeList || n instanceof HTMLCollection) return n;
  return undefined;
}

/**
 * Interface for array of DOM targets
 */
interface DOMTargetsArray extends Array<Element> {}

/**
 * Interface for array of JS targets
 */
interface JSTargetsArray extends Array<any> {}

/**
 * Interface for array of any targets
 */
interface TargetsArray extends Array<any> {}

/**
 * Parses target elements from various input formats
 * 
 * @param {any} targets - Target elements in any supported format
 * @return {TargetsArray} - Array of parsed targets
 */
export function parseTargets(targets: any): TargetsArray {
  if (isNil(targets)) return [];
  if (isArr(targets)) {
    const flattened = targets.flat(Infinity);
    const parsed: TargetsArray = [];
    for (let i = 0, l = flattened.length; i < l; i++) {
      const item = flattened[i];
      if (!isNil(item)) {
        const nodeList = getNodeList(item);
        if (nodeList) {
          for (let j = 0, jl = nodeList.length; j < jl; j++) {
            const subItem = nodeList[j];
            if (!isNil(subItem)) {
              let isDuplicate = false;
              for (let k = 0, kl = parsed.length; k < kl; k++) {
                if (parsed[k] === subItem) {
                  isDuplicate = true;
                  break;
                }
              }
              if (!isDuplicate) {
                parsed.push(subItem);
              }
            }
          }
        } else {
          let isDuplicate = false;
          for (let j = 0, jl = parsed.length; j < jl; j++) {
            if (parsed[j] === item) {
              isDuplicate = true;
              break;
            }
          }
          if (!isDuplicate) {
            parsed.push(item);
          }
        }
      }
    }
    return parsed;
  }
  if (!isBrowser) return [targets];
  const nodeList = getNodeList(targets);
  if (nodeList) return Array.from(nodeList);
  return [targets];
}

/**
 * Registers targets for animation by setting necessary symbol properties
 * 
 * @param {any} targets - Target elements to register
 * @return {TargetsArray} - Array of registered targets
 */
export function registerTargets(targets: any): TargetsArray {
  const parsedTargetsArray = parseTargets(targets);
  const parsedTargetsLength = parsedTargetsArray.length;
  if (parsedTargetsLength) {
    for (let i = 0; i < parsedTargetsLength; i++) {
      const target = parsedTargetsArray[i];
      if (!(isRegisteredTargetSymbol in target) || !target[isRegisteredTargetSymbol]) {
        target[isRegisteredTargetSymbol] = true;
        const isSvgType = isSvg(target);
        const isDom = target.nodeType || isSvgType;
        if (isDom) {
          target[isDomSymbol] = true;
          target[isSvgSymbol] = isSvgType;
          target[transformsSymbol] = {};
        }
      }
    }
  }
  return parsedTargetsArray;
}
