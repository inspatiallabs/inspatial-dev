import { describe, it, expect } from "@inspatial/test";
import {
  createMotion,
  createMotionTimeline,
  inSequence,
  inMotion,
  createMotionSVG,
} from "../src/index.ts";

describe("InMotion SVG", () => {
  it("Should createMotionSVG.draw", (resolve) => {
    const line1El = document.querySelector("#line1");
    const line2El = document.querySelector("#line2");
    const circleEl = document.querySelector("#circle");
    const polygonEl = document.querySelector("#polygon");
    const polylineEl = document.querySelector("#polyline");
    const rectEl = document.querySelector("#rect");

    createMotion(
      createMotionSVG.draw([
        "#tests line",
        "#tests circle",
        "#tests polygon",
        "#tests polyline",
        "#tests rect",
        "#tests path",
      ]),
      {
        draw: "0 1",
        ease: "inOutSine",
        translateX: [-100, 0],
        opacity: 0.5,
        duration: 10,
        onComplete: () => {
          expect(line1El.getAttribute("stroke-dasharray")).toEqual("1000 0");
          expect(line2El.getAttribute("stroke-dasharray")).toEqual("1000 0");
          expect(circleEl.getAttribute("stroke-dasharray")).toEqual("1000 0");
          expect(polygonEl.getAttribute("stroke-dasharray")).toEqual("1000 0");
          expect(polylineEl.getAttribute("stroke-dasharray")).toEqual("1000 0");
          expect(rectEl.getAttribute("stroke-dasharray")).toEqual("1000 0");
          resolve();
        },
      }
    );
  });

  // It was possible to set unknown properties, like inMotion.set(svg, {d: '...'})
  // I removed this in order to better differenciate svg attributes from css properties
  // It's now mendatory for an SVG attribute to be defined on the SVG element in order to be either set using inMotion.set() or createMotiond
  // it('Animating non existant attributes', resolve => {
  //   const squareEl = document.querySelector('#square');
  //   const pathTestsEl = document.querySelector('#path-tests');
  //   /** @type {HTMLElement} */
  //   const line1El = document.querySelector('#line1');
  //   const path1El = document.querySelector('#path-without-d-attribute-1');
  //   const path2El = document.querySelector('#path-without-d-attribute-2');

  //   createMotion(createMotionSVG.draw(['line', 'circle', 'polygon', 'polyline', 'rect', 'path']), {
  //     draw: '0 1',
  //     ease: 'inOutSine',
  //     opacity: .5,
  //     duration: 10,
  //     autoplay: false,
  //   });

  //   // Opacity animation should default to 1
  //   expect(line1El.style.opacity).toEqual('1');
  //   // Setting a non existing attribute
  //   expect(path1El.getAttribute('d')).toEqual(null);
  //   inMotion.set(path1El, { d: 'M250 300c0-27.614 22.386-50 50-50s50 22.386 50 50v50h-50c-27.614 0-50-22.386-50-50z' });
  //   // Setting a value on a non existing attribute
  //   expect(path1El.getAttribute('d')).toEqual('M250 300c0-27.614 22.386-50 50-50s50 22.386 50 50v50h-50c-27.614 0-50-22.386-50-50z');
  //   // Animating a non existing attribute
  //   expect(path2El.getAttribute('d')).toEqual(null);

  //   const createMotionNonExistantAttribute = createMotion(path2El, {
  //     d: 'M250 300c0-27.614 22.386-50 50-50s50 22.386 50 50v50h-50c-27.614 0-50-22.386-50-50z',
  //     duration: 10,
  //     ease: 'inOutQuad',
  //     autoplay: false
  //   });

  //   createMotionNonExistantAttribute.seek(createMotionNonExistantAttribute.duration);

  //   // Animating a value on a non existing attribute
  //   expect(path2El.getAttribute('d')).toEqual('M250 300c0-27.614 22.386-50 50-50s50 22.386 50 50v50h-50c-27.614 0-50-22.386-50-50z');
  //   const pathObj = createMotionSVG.createMotionPath(path2El);
  //   const dashOffsetAnimation2 = createMotion(createMotionSVG.draw(path2El), {
  //     draw: '0 1',
  //     ease: 'inOutSine',
  //     duration: 10
  //   });

  //   dashOffsetAnimation2.seek(dashOffsetAnimation2.duration);

  //   expect(+path2El.getAttribute('stroke-dasharray').split(' ')[1]).toEqual(0);

  //   let pathsTestsRect = pathTestsEl.getBoundingClientRect();
  //   let squareRect = squareEl.getBoundingClientRect();
  //   // Path animation not started
  //   expect(squareRect.left - pathsTestsRect.left).toEqual(-7);
  //   createMotion(squareEl, {
  //     translateX: pathObj.x,
  //     translateY: pathObj.y,
  //     rotate: pathObj.angle,
  //     ease: 'inOutSine',
  //     duration: 10,
  //     onComplete: () => {
  //       pathsTestsRect = pathTestsEl.getBoundingClientRect();
  //       squareRect = squareEl.getBoundingClientRect();
  //       expect(squareRect.left - pathsTestsRect.left).to.be.above(100);
  //       resolve();
  //     }
  //   });
  // });

  it('Should stroke-linecap "round" path should be set to "butt" when hidden', () => {
    const [$path] = inMotion.$("#tests path");
    const [$drawablePath] = createMotionSVG.draw("#tests path");
    expect(getComputedStyle($path).strokeLinecap).toEqual("butt");
    $drawablePath.setAttribute("draw", "0 .5");
    expect(getComputedStyle($path).strokeLinecap).toEqual("round");
    $drawablePath.setAttribute("draw", "0 1");
    expect(getComputedStyle($path).strokeLinecap).toEqual("round");
    $drawablePath.setAttribute("draw", ".5 1");
    expect(getComputedStyle($path).strokeLinecap).toEqual("round");
    $drawablePath.setAttribute("draw", "1 1");
    expect(getComputedStyle($path).strokeLinecap).toEqual("butt");
    $drawablePath.setAttribute("draw", ".25 .25");
    expect(getComputedStyle($path).strokeLinecap).toEqual("butt");
  });

  it("Should SVG Filters", () => {
    // Filters tests
    /** @type {HTMLElement} */
    const filterPolygonEl = document.querySelector("#polygon");
    const feTurbulenceEl = document.querySelector(
      "#displacementFilter feTurbulence"
    );
    const feDisplacementMapEl = document.querySelector(
      "#displacementFilter feDisplacementMap"
    );

    createMotion([feTurbulenceEl, feDisplacementMapEl], {
      baseFrequency: [0.05, 1],
      scale: [15, 1],
      direction: "alternate",
      ease: "inOutExpo",
      duration: 100,
    });

    // Scale property should be set as an attribute on SVG filter elements
    expect(feDisplacementMapEl.getAttribute("scale")).toEqual("15");

    createMotion(filterPolygonEl, {
      points: [
        "64 68.64 8.574 100 63.446 67.68 64 4 64.554 67.68 119.426 100",
        "64 128 8.574 96 8.574 32 64 0 119.426 32 119.426 96",
      ],
      translateX: [430, 430],
      translateY: [35, 35],
      scale: [0.75, 1],
      ease: "inOutExpo",
      duration: 100,
    });

    // Scale property should be set as a CSS transform on non SVG filter elements
    expect(getComputedStyle(filterPolygonEl).transform).toEqual(
      "translateX(430px) translateY(35px) scale(0.75)"
    );

    // Non stylistic SVG attribute should be declared in came case
    expect(feTurbulenceEl.hasAttribute("baseFrequency")).toEqual(true);

    // Non stylistic SVG attribute should be declared in came case
    expect(feTurbulenceEl.hasAttribute("base-frequency")).toEqual(false);
  });
});
