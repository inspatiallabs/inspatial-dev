/**
 * anime.js - ESM
 * @version v4.1.2
 * @author Julian Garnier
 * @license MIT
 * @copyright (c) 2025 Julian Garnier
 * @see https://animejs.com
 */

/****************************************************
 * InMotion (InSpatial Motion)
 * @version v1.0.0
 * @author InSpatial Labs
 * @license Apache-2.0
 * @copyright (c) 2026 InSpatial Labs
 * @see https://inspatial.dev/motion
 ****************************************************/


import { transformsExecRgx, transformsSymbol } from "./consts.ts";

// Define the helper functions directly if they're not available from the import
const isUnd = (value: any): boolean => typeof value === "undefined";
const stringStartsWith = (str: string, sub: string): boolean => str.indexOf(sub) === 0;

/**
 * @param  {DOMTarget} target
 * @param  {String} propName
 * @param  {Object} animationInlineStyles
 * @return {String}
 */
export const parseInlineTransforms = (
  target: Element,
  propName: string,
  animationInlineStyles?: Record<string, any>
): string => {
  const inlineTransforms = (target as HTMLElement).style.transform;
  let inlinedStylesPropertyValue: string | undefined;
  if (inlineTransforms) {
    const cachedTransforms = (target as any)[transformsSymbol] || {};
    let t: RegExpExecArray | null;
    while ((t = transformsExecRgx.exec(inlineTransforms))) {
      const inlinePropertyName = t[1];
      // const inlinePropertyValue = t[2];
      const inlinePropertyValue = t[2].slice(1, -1);
      cachedTransforms[inlinePropertyName] = inlinePropertyValue;
      if (inlinePropertyName === propName) {
        inlinedStylesPropertyValue = inlinePropertyValue;
        // Store the new parsed inline styles if animationInlineStyles is provided
        if (animationInlineStyles) {
          animationInlineStyles[propName] = inlinePropertyValue;
        }
      }
    }
  }
  return inlineTransforms && !isUnd(inlinedStylesPropertyValue)
    ? inlinedStylesPropertyValue as string
    : stringStartsWith(propName, "scale")
    ? "1"
    : stringStartsWith(propName, "rotate") || stringStartsWith(propName, "skew")
    ? "0deg"
    : "0px";
};
