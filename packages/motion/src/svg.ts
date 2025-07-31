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


import {
  K,
  isSvgSymbol,
  morphPointsSymbol,
  proxyTargetSymbol,
  emptyString,
  emptyArray,
  isPath as _isPath,
  morphTargetsSymbol as _morphTargetsSymbol,
} from "./consts.ts";

import { round, isSvg, atan2, sqrt, PI, isFnc } from "./helpers.ts";

import { parseTargets } from "./targets.ts";

import type {
  Target,
  TargetsParam,
  FunctionValue,
  DrawableSVGGeometry,
  TweenObjectValue as _TweenObjectValue
} from "./types.ts";

/**
 * # MorphableSVGElement
 * @summary SVG Geometry Element that supports path morphing
 * 
 * Extended SVGGeometryElement interface that includes properties for path morphing.
 * Used to track and manage morphable points between different SVG shapes.
 * 
 * @since 0.1.0
 * @category InSpatial Motion
 */
interface MorphableSVGElement extends SVGGeometryElement {
  [morphPointsSymbol]?: number[][];
  [proxyTargetSymbol]?: SVGGeometryElement;
  draw?: `${number} ${number}`;
}

/**
 * @param  {TargetsParam} path
 * @return {SVGGeometryElement|undefined}
 */
const getPath = (path: TargetsParam): SVGGeometryElement | undefined => {
  const parsedTargets = parseTargets(path);
  const $parsedSvg = /** @type {SVGGeometryElement} */ parsedTargets[0];
  if (!$parsedSvg || !isSvg($parsedSvg)) return;
  return $parsedSvg;
};

/**
 * # morph (formerly morphTo)
 * @summary Morphs an SVG path or polygon to match another SVG shape
 * 
 * Creates a function that morphs an SVG path or polygon to match the shape of another SVG element.
 * This function is exported as `createMotionSVG.morph` in the new API.
 * 
 * @param  {TargetsParam} path2 - Target SVG path to morph to
 * @param  {Number} [precision=0.33] - Precision level for morphing (higher values create more points)
 * @return {FunctionValue} - Function that performs the morphing
 * 
 * @since 0.1.0
 * @category InSpatial Motion SVG
 */
const morph =
  (path2: TargetsParam, precision = 0.33) =>
  ($path1: SVGGeometryElement): [string, string] | undefined => {
    const $path2 = /** @type {SVGGeometryElement} */ getPath(path2);
    if (!$path2) return;
    const isPath = $path1.tagName === "path";
    const separator = isPath ? " " : ",";
    // Use type assertion for morphPointsSymbol access
    const morphable = $path1 as MorphableSVGElement;
    const previousPoints = morphable[morphPointsSymbol];
    if (previousPoints)
      $path1.setAttribute(isPath ? "d" : "points", previousPoints);

    let v1 = "",
      v2 = "";

    if (!precision) {
      v1 = $path1.getAttribute(isPath ? "d" : "points") || "";
      v2 = $path2.getAttribute(isPath ? "d" : "points") || "";
    } else {
      const length1 = /** @type {SVGGeometryElement} */ $path1.getTotalLength();
      const length2 = $path2.getTotalLength();
      const maxPoints = Math.max(
        Math.ceil(length1 * precision),
        Math.ceil(length2 * precision)
      );
      for (let i = 0; i < maxPoints; i++) {
        const t = i / (maxPoints - 1);
        const pointOnPath1 =
          /** @type {SVGGeometryElement} */ $path1.getPointAtLength(
            length1 * t
          );
        const pointOnPath2 = $path2.getPointAtLength(length2 * t);
        const prefix = isPath ? (i === 0 ? "M" : "L") : "";
        v1 +=
          prefix + round(pointOnPath1.x, 3) + separator + pointOnPath1.y + " ";
        v2 +=
          prefix + round(pointOnPath2.x, 3) + separator + pointOnPath2.y + " ";
      }
    }

    morphable[morphPointsSymbol] = v2;

    return [v1, v2];
  };

/**
 * @param {SVGGeometryElement} [$el]
 * @return {Number}
 */
const getScaleFactor = ($el?: SVGGeometryElement): number => {
  let scaleFactor = 1;
  if ($el && $el.getCTM) {
    const ctm = $el.getCTM();
    if (ctm) {
      const scaleX = sqrt(ctm.a * ctm.a + ctm.b * ctm.b);
      const scaleY = sqrt(ctm.c * ctm.c + ctm.d * ctm.d);
      scaleFactor = (scaleX + scaleY) / 2;
    }
  }
  return scaleFactor;
};

/**
 * # draw (formerly createDrawable)
 * @summary Creates drawable proxies for multiple SVG elements
 * 
 * Creates proxies for SVG elements that add drawing functionality controlled by a "draw" attribute.
 * This function is exported as `createMotionSVG.draw` in the new API.
 * 
 * @param {SVGGeometryElement} $el - The SVG element to transform into a drawable
 * @param {number} start - Starting position (0-1)
 * @param {number} end - Ending position (0-1)
 * @return {DrawableSVGGeometry} - Returns a proxy with drawing functionality
 * 
 * @since 0.1.0
 * @category InSpatial Motion SVG
 */
const createDrawableProxy = ($el: SVGGeometryElement, start: number, end: number): DrawableSVGGeometry => {
  const pathLength = K;
  const computedStyles = getComputedStyle($el);
  const strokeLineCap = computedStyles.strokeLinecap;
  // @ts-ignore
  const $scalled =
    computedStyles.vectorEffect === "non-scaling-stroke" ? $el : null;
  let currentCap = strokeLineCap;

  const proxy = new Proxy($el, {
    get(target, property) {
      // Type assertion for value indexing
      const value = (target as any)[property];
      if (property === proxyTargetSymbol) return target;
      if (property === "setAttribute") {
        return (...args: any[]) => {
          if (args[0] === "draw") {
            const value = args[1];
            const values = value.split(" ");
            const v1 = +values[0];
            const v2 = +values[1];
            // TOTO: Benchmark if performing two slices is more performant than one split
            // const spaceIndex = value.indexOf(' ');
            // const v1 = round(+value.slice(0, spaceIndex), precision);
            // const v2 = round(+value.slice(spaceIndex + 1), precision);
            const scaleFactor = getScaleFactor($scalled || undefined);
            const os = v1 * -pathLength * scaleFactor;
            const d1 = v2 * pathLength * scaleFactor + os;
            const d2 =
              pathLength * scaleFactor +
              ((v1 === 0 && v2 === 1) || (v1 === 1 && v2 === 0)
                ? 0
                : 10 * scaleFactor) -
              d1;
            if (strokeLineCap !== "butt") {
              const newCap = v1 === v2 ? "butt" : strokeLineCap;
              if (currentCap !== newCap) {
                target.style.strokeLinecap = `${newCap}`;
                currentCap = newCap;
              }
            }
            target.setAttribute("stroke-dashoffset", `${os}`);
            target.setAttribute("stroke-dasharray", `${d1} ${d2}`);
          }
          return Reflect.apply(value, target, args);
        };
      }

      if (isFnc(value)) {
        return (...args: any[]) => Reflect.apply(value, target, args);
      } else {
        return value;
      }
    },
  });

  if ($el.getAttribute("pathLength") !== `${pathLength}`) {
    $el.setAttribute("pathLength", `${pathLength}`);
    proxy.setAttribute("draw", `${start} ${end}`);
  }

  return proxy as DrawableSVGGeometry;
};

/**
 * Creates drawable proxies for multiple SVG elements.
 * @param {TargetsParam} selector - CSS selector, SVG element, or array of elements and selectors
 * @param {number} [start=0] - Starting position (0-1)
 * @param {number} [end=0] - Ending position (0-1)
 * @return {Array<DrawableSVGGeometry>} - Array of proxied elements with drawing functionality
 */
const draw = (selector: TargetsParam, start = 0, end = 0): Array<DrawableSVGGeometry> => {
  const els = parseTargets(selector);
  return els.map(($el) =>
    createDrawableProxy($el as SVGGeometryElement, start, end)
  );
};

// Motion path animation

/**
 * @param {SVGGeometryElement} $path
 * @param {Number} progress
 * @param {Number}lookup
 * @return {DOMPoint}
 */
const getPathPoint = ($path: SVGGeometryElement, progress: number, lookup = 0): DOMPoint => {
  return $path.getPointAtLength(progress + lookup >= 1 ? progress + lookup : 0);
};

/**
 * @param {SVGGeometryElement} $path
 * @param {String} pathProperty
 * @return {FunctionValue}
 */
const getPathProgess = ($path: SVGGeometryElement, pathProperty: string): FunctionValue => {
  return ($el: any) => {
    const totalLength = +$path.getTotalLength();
    const inSvg = $el[isSvgSymbol];
    const ctm = $path.getCTM();
    /** @type {TweenObjectValue} */
    return {
      from: 0,
      to: totalLength,
      /** @type {TweenModifier} */
      modifier: (progress: number) => {
        if (pathProperty === "a") {
          const p0 = getPathPoint($path, progress, -1);
          const p1 = getPathPoint($path, progress, +1);
          return (atan2(p1.y - p0.y, p1.x - p0.x) * 180) / PI;
        } else {
          const p = getPathPoint($path, progress, 0);
          return pathProperty === "x"
            ? inSvg || !ctm
              ? p.x
              : p.x * ctm.a + p.y * ctm.c + ctm.e
            : inSvg || !ctm
            ? p.y
            : p.x * ctm.b + p.y * ctm.d + ctm.f;
        }
      },
    };
  };
};

/**
 * # path
 * @summary Creates translation and rotation functions for SVG path following
 * 
 * Provides functions to animate elements along SVG paths with translateX, translateY and rotate properties.
 * Think of it like a train following train tracks - the path defines the route and this function
 * provides the movement coordinates for each point along that route.
 * 
 * @param {TargetsParam} path - SVG path to follow
 * @return {Object} Object with translateX, translateY and rotate properties
 * 
 * @since 0.1.0
 * @category InSpatial Motion SVG
 */
const path = (path: TargetsParam): { translateX: FunctionValue; translateY: FunctionValue; rotate: FunctionValue } | undefined => {
  const $path = getPath(path);
  if (!$path) return;
  return {
    translateX: getPathProgess($path, "x"),
    translateY: getPathProgess($path, "y"),
    rotate: getPathProgess($path, "a"),
  };
};

// Check for valid SVG attribute

const cssReservedProperties = ["opacity", "rotate", "overflow", "color"];

/**
 * @param  {Target} el
 * @param  {String} propertyName
 * @return {Boolean}
 */
export const isValidSVGAttribute = (el: Target, propertyName: string): boolean => {
  // Return early and use CSS opacity animation instead (already better default values (opacity: 1 instead of 0)) and rotate should be considered a transform
  if (cssReservedProperties.includes(propertyName)) return false;
  if (el.getAttribute(propertyName) || propertyName in el) {
    if (propertyName === "scale") {
      // Scale
      const elParentNode =
        /** @type {SVGGeometryElement} */ /** @type {DOMTarget} */ (el as any).parentNode;
      // Only consider scale as a valid SVG attribute on filter element
      return elParentNode && elParentNode.tagName === "filter";
    }
    return true;
  }
  return false; // Add explicit return
};

/**
 * Separate points from a pathData object
 */
const separatePoints = (pathData: SVGPathSegList | any): number[][] => {
  const points: number[][] = [];
  for (let i = 0; i < pathData.numberOfItems || 0; i++) {
    const seg = pathData.getItem(i);
    const segType = seg.pathSegType || 0;
    const isRelative = segType % 2 !== 0;
    const args = emptyArray.slice
      .call(seg)
      .filter((arg: any) => !isNaN(arg));
    if (args.length) {
      if (isRelative)
        for (let j = 0, l = args.length; j < l; j++)
          args[j] += j % 2 ? points[points.length - 1][1] : points[points.length - 1][0];
      args.splice(0, 0, segType);
      points.push(args);
    }
  }
  return points;
};

/**
 * Add missing control points
 */
const addMissingControlPoints = (points: number[][]): void => {
  let prevPoint = points[0];

  for (let i = 1, l = points.length; i < l; i++) {
    const point = points[i];
    const pType = prevPoint[0];
    const cType = point[0];
    if (pType === 1 && (cType === 4 || cType === 8)) {
      // C
      prevPoint.push(prevPoint[1], prevPoint[2]);
      prevPoint.push(prevPoint[1], prevPoint[2]);
    } else if ((pType === 12 || pType === 16) && cType === 1) {
      // Q
      prevPoint.push(prevPoint[1], prevPoint[2]);
    }
    prevPoint = point;
  }
};

/**
 * Convert Points To Commands
 */
const pointsToCommands = (points: number[][]): string => {
  let cmds = emptyString;
  for (let i = 0, l = points.length; i < l; i++) {
    const point = points[i];
    const segType = point[0];
    if (segType === 1) {
      cmds += i === 0 ? "M" : "L";
      cmds += point[1] + "," + point[2];
    } else if (segType === 4) {
      cmds +=
        "C" +
        point[3] +
        "," +
        point[4] +
        "," +
        point[5] +
        "," +
        point[6] +
        "," +
        point[1] +
        "," +
        point[2];
    } else if (segType === 8) {
      cmds +=
        "c" +
        point[3] +
        "," +
        point[4] +
        "," +
        point[5] +
        "," +
        point[6] +
        "," +
        point[1] +
        "," +
        point[2];
    } else if (segType === 12) {
      cmds +=
        "Q" + point[3] + "," + point[4] + "," + point[1] + "," + point[2];
    } else if (segType === 16) {
      cmds +=
        "q" + point[3] + "," + point[4] + "," + point[1] + "," + point[2];
    } else if (segType === 3 || segType === 2) {
      // Close path
      cmds += "Z";
    }
  }
  return cmds;
};

/**
 * Convert shape to path
 */
const shapeToPath = (element: MorphableSVGElement, removeAttribute = true): SVGPathElement => {
  let d = "";
  const attrs: { [key: string]: string } = {};
  if (element instanceof SVGRectElement) {
    const width = element.getAttribute("width") || "0";
    const height = element.getAttribute("height") || "0";
    const rx = Number(element.getAttribute("rx") || "0");
    const ry = Number(element.getAttribute("ry") || "0");
    attrs.x = element.getAttribute("x") || "0";
    attrs.y = element.getAttribute("y") || "0";
    attrs.width = width;
    attrs.height = height;
    const x = Number(attrs.x);
    const y = Number(attrs.y);
    const w = Number(width);
    const h = Number(height);
    if (!rx && !ry) {
      d = `M${x},${y} h${w} v${h} h${-w} Z`;
    } else {
      const _rx = !rx ? ry : rx;
      const _ry = !ry ? rx : ry;
      d = `M${x + _rx},${y} h${w - _rx * 2} a${_rx},${_ry} 0 0 1 ${_rx},${_ry} v${
        h - _ry * 2
      } a${_rx},${_ry} 0 0 1 ${-_rx},${_ry} h${-w + _rx * 2} a${_rx},${_ry} 0 0 1 ${-_rx},${-_ry} v${
        -h + _ry * 2
      } a${_rx},${_ry} 0 0 1 ${_rx},${-_ry} Z`;
    }
  } else if (element instanceof SVGCircleElement) {
    attrs.cx = element.getAttribute("cx") || "0";
    attrs.cy = element.getAttribute("cy") || "0";
    attrs.r = element.getAttribute("r") || "0";
    const cx = Number(attrs.cx);
    const cy = Number(attrs.cy);
    const r = Number(attrs.r);
    d = `M${cx},${cy - r} a${r},${r} 0 1 0 0,${
      r * 2
    } a${r},${r} 0 1 0 0,${-r * 2} Z`;
  } else if (element instanceof SVGEllipseElement) {
    attrs.cx = element.getAttribute("cx") || "0";
    attrs.cy = element.getAttribute("cy") || "0";
    attrs.rx = element.getAttribute("rx") || "0";
    attrs.ry = element.getAttribute("ry") || "0";
    const cx = Number(attrs.cx);
    const cy = Number(attrs.cy);
    const rx = Number(attrs.rx);
    const ry = Number(attrs.ry);
    d = `M${cx},${cy - ry} a${rx},${ry} 0 1 0 0,${
      ry * 2
    } a${rx},${ry} 0 1 0 0,${-ry * 2} Z`;
  } else if (element instanceof SVGLineElement) {
    attrs.x1 = element.getAttribute("x1") || "0";
    attrs.y1 = element.getAttribute("y1") || "0";
    attrs.x2 = element.getAttribute("x2") || "0";
    attrs.y2 = element.getAttribute("y2") || "0";
    const x1 = Number(attrs.x1);
    const y1 = Number(attrs.y1);
    const x2 = Number(attrs.x2);
    const y2 = Number(attrs.y2);
    d = `M${x1},${y1} L${x2},${y2}`;
  } else if (element instanceof SVGPolylineElement || element instanceof SVGPolygonElement) {
    const isClosed = element instanceof SVGPolygonElement;
    attrs.points = element.getAttribute("points") || "";
    const pointsArray = attrs.points.trim().split(/\s+|,/);
    let x, y;
    for (let i = 0, l = pointsArray.length; i < l; i += 2) {
      x = pointsArray[i];
      y = pointsArray[i + 1] || 0;
      d += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
    }
    if (isClosed) d += "Z";
  } else if (element instanceof SVGPathElement) {
    if (!element.getAttribute("transform")) {
      return element;
    }
    d = element.getAttribute("d") || "";
  }

  const pathEl = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  pathEl.setAttribute("d", d);
  for (const [attr, value] of Object.entries(attrs)) {
    pathEl.setAttribute(`data-original-${attr}`, value);
  }
  const transform = element.getAttribute("transform");
  if (transform) pathEl.setAttribute("transform", transform);
  const elementWithTarget = element as MorphableSVGElement;
  if (elementWithTarget[proxyTargetSymbol]) {
    (pathEl as MorphableSVGElement)[proxyTargetSymbol] =
      elementWithTarget[proxyTargetSymbol];
  }
  if (removeAttribute) element.parentNode?.replaceChild(pathEl, element);
  return pathEl;
};

/**
 * Calculate point from SVG element
 */
const calculatePoints = (element: SVGGeometryElement): number[][] | null => {
  try {
    const pathData = (element as any).pathSegList;
    if (pathData && pathData.numberOfItems) return separatePoints(pathData);
    const path = shapeToPath(element as MorphableSVGElement, false);
    const morphableElement = path as MorphableSVGElement;
    const points = morphableElement[morphPointsSymbol];
    if (points) return points;
    const pathElement = path as any;
    return pathElement.pathSegList ? separatePoints(pathElement.pathSegList) : null;
  } catch (_err) {
    return null;
  }
};

/**
 * Normalize path data
 */
const normalizePath = (element: SVGGeometryElement): number[][] => {
  const points = calculatePoints(element);
  if (!points) return [];
  element.getBBox(); // Force layout calculation
  let size = 1;
  let maxValue = 0;
  let width = 0;
  let height = 0;
  for (let i = 0, l = points.length; i < l; i++) {
    const point = points[i];
    for (let j = 1, m = point.length; j < m; j++) {
      if (j % 2 === 1) {
        width = Math.max(width, Math.abs(point[j]));
      } else {
        height = Math.max(height, Math.abs(point[j]));
      }
    }
  }
  maxValue = Math.max(width, height);
  if (maxValue > 500) {
    size = 100 / maxValue;
    for (let i = 0, l = points.length; i < l; i++) {
      const point = points[i];
      for (let j = 1, m = point.length; j < m; j++) {
        point[j] = Math.round(point[j] * size * 10000) / 10000;
      }
    }
  }
  addMissingControlPoints(points);
  return points;
};

/**
 * # SVG Utilities
 * @summary Collection of SVG animation utilities
 * 
 * This collection of SVG utilities provides functions for morphing, drawing, and path animation.
 * It is exported as `createMotionSVG` in the new API.
 * 
 * @since 0.1.0
 * @category InSpatial Motion SVG
 */
export const svg = {
  morph,
  path,
  draw,
  shapeToPath,
  calculatePoints,
  normalizePath,
  pointsToCommands,
};

/**
 * Alias for svg (Phase 2 API naming)
 */
export const createMotionSVG = svg;
