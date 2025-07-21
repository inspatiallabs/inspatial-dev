import { describe, it, expect } from "@inspatial/test";
import { inMotion, createMotion } from "../src/index.ts";
import { getChildAtIndex } from "../src/utils/index.ts";
import { unitsExecRgx, valueTypes } from "../src/consts.ts";
import { forEachChildren } from "../src/helpers.ts";

describe("InMotion Values", () => {
  const numberTypeTestTarget = {
    number: 1,
    decimals: 1.2,
    exponent: 1.23456e-5,
    func: 1337,
    numberString: "1",
    decimalsString: "1.2",
    exponentString: "1.23456e-5",
    funcString: "1337",
  };

  it("Should parse number type values from numbers", () => {
    const inmotion = createMotion(numberTypeTestTarget, {
      number: 42,
      decimals: 42,
      exponent: 42,
      func: () => 42,
      numberString: 42,
      decimalsString: 42,
      exponentString: 42,
      funcString: () => 42,
    });

    forEachChildren(inmotion, (tween) => {
      expect(tween._valueType).toEqual(valueTypes.NUMBER);
    });
    inmotion.pause();
  });

  it("Should parse number type values from strings", () => {
    const inmotion = createMotion(numberTypeTestTarget, {
      number: "42",
      decimals: "42",
      exponent: "42",
      func: () => "42",
      numberString: "42",
      decimalsString: "42",
      exponentString: "42",
      funcString: () => "42",
    });

    forEachChildren(inmotion, (tween) => {
      expect(tween._valueType).toEqual(valueTypes.NUMBER);
    });
    inmotion.pause();
  });

  it("Should parse number type values from relative values operators", (resolve) => {
    const results = { ...numberTypeTestTarget };
    for (let prop in results) {
      results[prop] = +results[prop] + 42;
    }
    const inmotion = createMotion(numberTypeTestTarget, {
      number: "+=42",
      decimals: "+=42",
      exponent: "+=42",
      func: () => "+=42",
      numberString: "+=42",
      decimalsString: "+=42",
      exponentString: "+=42",
      funcString: () => "+=42",
      duration: 10,
      onComplete: () => {
        for (let prop in results) {
          expect(results[prop]).toEqual(numberTypeTestTarget[prop]);
        }
        resolve();
      },
    });

    forEachChildren(inmotion, (tween) => {
      expect(tween._valueType).toEqual(valueTypes.NUMBER);
    });
  });

  const shouldNotMatch = [
    "range",
    "range1",
    "range13.134",
    "10 10",
    "10px 10px",
    "10.1px 10.2px",
    "1.12E0px 1.12E0px",
    "1",
    "1234",
    ".1234",
    "0.1234",
    "1234.1234",
    "+1234.1234",
    "+.1234",
    "-1234.1234",
    "-.1234",
    "1e+100",
    "1e-100",
    "1234e+100",
    "1234e-100",
    ".1234e+100",
    ".1234e-100",
    "1234.1234e+100",
    "1234.1234e-100",
    "-1234.1234e+100",
    "+1234.1234e-100",
    "0.1234e+100",
    "0.1234e-100",
    "-.1234e+100",
    "+.1234e-100",
  ];

  const shouldMatch = [
    "1px",
    "1em",
    "1e",
    "1E",
    "1e+100px",
    "1e-100em",
    "1e+100e",
    "1e-100E",
    "1E+100e",
    "1E-100E",
    "1234px",
    "1234em",
    "1234e",
    "1234E",
    "1234e+100px",
    "1234e-100em",
    "1234e+100e",
    "1234e-100E",
    "1234E+100e",
    "1234E-100E",
    ".1234px",
    ".1234em",
    ".1234e",
    ".1234E",
    ".1234e+100px",
    ".1234e-100em",
    ".1234e+100e",
    ".1234e-100E",
    ".1234E+100e",
    ".1234E-100E",
    "0.1234px",
    "0.1234em",
    "0.1234e",
    "0.1234E",
    "0.1234e+100px",
    "0.1234e-100em",
    "0.1234e+100e",
    "0.1234e-100E",
    "0.1234E+100e",
    "0.1234E-100E",
    "1234.1234px",
    "1234.1234em",
    "1234.1234e",
    "1234.1234E",
    "1234.1234e+100px",
    "1234.1234e-100em",
    "1234.1234e+100e",
    "1234.1234e-100E",
    "1234.1234E+100e",
    "1234.1234E-100E",
    "-1234.1234px",
    "+1234.1234em",
    "-1234.1234e",
    "+1234.1234E",
    "-1234.1234e+100px",
    "+1234.1234e-100em",
    "-1234.1234e+100e",
    "+1234.1234e-100E",
    "-1234.1234E+100e",
    "+1234.1234E-100E",
    "-.1234px",
    "+.1234em",
    "-.1234e",
    "+.1234E",
    "-.1234e+100px",
    "+.1234e-100em",
    "-.1234e+100e",
    "+.1234e-100E",
    "-.1234E+100e",
    "+.1234E-100E",
  ];

  shouldNotMatch.forEach((value) => {
    it(`Should not parse unit from "${value}"`, () => {
      const match = unitsExecRgx.test(value);
      expect(match).toBeFalsy();
    });
  });

  shouldMatch.forEach((value) => {
    it(`Should parse unit from "${value}"`, () => {
      const match = unitsExecRgx.test(value);
      expect(match).toBeTruthy();
    });
  });

  it("Should parse unit type values", () => {
    const unitTypeTestTarget = {
      number: 1,
      decimals: 1.2,
      exponent: 1.23456e-5,
      func: 1337,
      numberUnit: "1px",
      decimalsUnit: "1.2px",
      exponentUnit: "1.23456e-5px",
      funcUnit: "1337px",
    };

    const inmotion = createMotion(unitTypeTestTarget, {
      number: "42px",
      decimals: "42px",
      exponent: "42px",
      func: () => "42px",
      numberUnit: 42,
      decimalsUnit: 42,
      exponentUnit: 42,
      funcUnit: () => 42,
    });

    forEachChildren(inmotion, (tween) => {
      expect(tween._valueType).toEqual(valueTypes.UNIT);
      expect(tween._toNumber).toEqual(42);
      expect(tween._unit).toEqual("px");
    });

    inmotion.pause();
  });

  it("Should parse tween end value types", (resolve) => {
    const from = {
      number: 1,
      decimals: 1.2,
      exponent: 1.1e10,
      exponent2: 1.5e-10,
      numberUnit: "1px",
      decimalsUnit: "1.2px",
      exponentUnit: "1e-100px",
      exponentUnit2: "1.5E-10em",
      prefix1: "+1.5e-10em",
      prefix2: "-1.5E+100em",
    };

    const to = {
      number: 2,
      decimals: 2.2,
      exponent: 2.1e10,
      exponent2: 2.5e-10,
      numberUnit: "2px",
      decimalsUnit: "2.2px",
      exponentUnit: "2e-100px",
      exponentUnit2: "2.5e-10em",
      prefix1: "2.5e-10em",
      prefix2: "-2.5e+100em",
    };

    createMotion(from, {
      number: to.number,
      decimals: to.decimals,
      exponent: to.exponent,
      exponent2: to.exponent2,
      numberUnit: to.numberUnit,
      decimalsUnit: to.decimalsUnit,
      exponentUnit: to.exponentUnit,
      exponentUnit2: to.exponentUnit2,
      prefix1: to.prefix1,
      prefix2: to.prefix2,
      duration: 10,
      onComplete: () => {
        for (let p in from) {
          expect(from[p]).toEqual(to[p]);
        }
        resolve();
      },
    });
  });

  const colorTypeTestTarget = {
    HEX3: "#f99",
    HEX6: "#ff9999",
    RGB: "rgb(255, 153, 153)",
    HSL: "hsl(0, 100%, 80%)",
    HEX3A: "#f999",
    HEX6A: "#ff999999",
    RGBA: "rgba(255, 153, 153, .6)",
    HSLA: "hsla(0, 100%, 80%, .6)",
    func: "hsla(180, 100%, 50%, .8)",
  };

  it("Should parse color type values", () => {
    const inmotion = createMotion(colorTypeTestTarget, {
      HEX3: "hsla(180, 100%, 50%, .8)",
      HEX6: "hsla(180, 100%, 50%, .8)",
      RGB: "hsla(180, 100%, 50%, .8)",
      HSL: "hsla(180, 100%, 50%, .8)",
      HEX3A: "hsla(180, 100%, 50%, .8)",
      HEX6A: "hsla(180, 100%, 50%, .8)",
      RGBA: "hsla(180, 100%, 50%, .8)",
      HSLA: "hsla(180, 100%, 50%, .8)",
      func: () => "hsla(180, 100%, 50%, .8)",
    });

    forEachChildren(inmotion, (tween) => {
      expect(tween._valueType).toEqual(valueTypes.COLOR);
      expect(tween._toNumbers).toEqual([0, 255, 255, 0.8]);
    });

    inmotion.pause();
  });

  it("Should parse complex type values", () => {
    const complexTypeTestTarget = {
      whiteSpace: "0 1 2 1.234",
      mixedTypes: "auto 20px auto 2rem",
      cssFilter: "blur(100px) contrast(200)",
      func: "blur(100px) contrast(200)",
      whiteSpaceFromNumber: 10,
      mixedTypesFromNumber: 10,
      cssFilterFromNumber: 10,
      funcFromNumber: 10,
    };

    const inmotion = createMotion(complexTypeTestTarget, {
      whiteSpace: "42 42 42 42",
      mixedTypes: "auto 42px auto 42rem",
      cssFilter: "blur(42px) contrast(42)",
      func: () => "blur(42px) contrast(42)",
      whiteSpaceFromNumber: "42 42 42 42",
      mixedTypesFromNumber: "auto 42px auto 42rem",
      cssFilterFromNumber: "blur(42px) contrast(42)",
      funcFromNumber: () => "blur(42px) contrast(42)",
    });

    forEachChildren(inmotion, (tween) => {
      expect(tween._valueType).toEqual(valueTypes.COMPLEX);
      if (tween._toNumbers.length === 4) {
        expect(tween._toNumbers).toEqual([42, 42, 42, 42]);
      } else {
        expect(tween._toNumbers).toEqual([42, 42]);
      }
    });

    inmotion.pause();
  });

  it("Should get CSS computed values", () => {
    /** @type {NodeListOf<HTMLElement>} */
    const $targets = document.querySelectorAll(".css-properties");
    const inmotion = createMotion($targets, {
      width: 100,
      fontSize: 10,
    });

    inmotion.pause().seek(inmotion.duration);

    expect(getChildAtIndex(inmotion, 0)._valueType).toEqual(valueTypes.UNIT);
    expect(getChildAtIndex(inmotion, 1)._valueType).toEqual(valueTypes.UNIT);
    expect(getChildAtIndex(inmotion, 0)._fromNumber).toEqual(150);
    expect(getChildAtIndex(inmotion, 1)._fromNumber).toEqual(32);
    expect(getChildAtIndex(inmotion, 0)._toNumber).toEqual(100);
    expect(getChildAtIndex(inmotion, 1)._toNumber).toEqual(10);
    expect(getChildAtIndex(inmotion, 0)._unit).toEqual("px");
    expect(getChildAtIndex(inmotion, 1)._unit).toEqual("px");

    expect(getComputedStyle($targets[0]).width).toEqual("100px");
    expect(getComputedStyle($targets[0]).fontSize).toEqual("10px");
  });

  it("Should get CSS inline values", () => {
    /** @type {NodeListOf<HTMLElement>} */
    const $targets = document.querySelectorAll(".with-inline-styles");
    const inmotion = createMotion($targets, {
      width: 100,
    });

    inmotion.pause().seek(inmotion.duration);

    expect(getChildAtIndex(inmotion, 0)._fromNumber).toEqual(200);
    expect(getChildAtIndex(inmotion, 0)._unit).toEqual("px");
    expect(getChildAtIndex(inmotion, 0)._valueType).toEqual(valueTypes.UNIT);
    expect(getChildAtIndex(inmotion, 0)._toNumber).toEqual(100);

    expect(getComputedStyle($targets[0]).width).toEqual("100px");
  });

  it("Should get default transforms values", () => {
    const inmotion = createMotion("#target-id", {
      translateX: 100,
      translateY: 100,
      translateZ: 100,
      rotate: 360,
      rotateX: 360,
      rotateY: 360,
      rotateZ: 360,
      skew: 45,
      skewX: 45,
      skewY: 45,
      scale: 10,
      scaleX: 10,
      scaleY: 10,
      scaleZ: 10,
      perspective: 1000,
    });

    inmotion.pause().seek(inmotion.duration);

    // Translate
    expect(getChildAtIndex(inmotion, 0)._unit).toEqual("px");
    expect(getChildAtIndex(inmotion, 1)._unit).toEqual("px");
    expect(getChildAtIndex(inmotion, 2)._unit).toEqual("px");
    expect(getChildAtIndex(inmotion, 0)._fromNumber).toEqual(0);
    expect(getChildAtIndex(inmotion, 1)._fromNumber).toEqual(0);
    expect(getChildAtIndex(inmotion, 2)._fromNumber).toEqual(0);
    // Rotate
    expect(getChildAtIndex(inmotion, 3)._unit).toEqual("deg");
    expect(getChildAtIndex(inmotion, 4)._unit).toEqual("deg");
    expect(getChildAtIndex(inmotion, 5)._unit).toEqual("deg");
    expect(getChildAtIndex(inmotion, 6)._unit).toEqual("deg");
    expect(getChildAtIndex(inmotion, 3)._fromNumber).toEqual(0);
    expect(getChildAtIndex(inmotion, 4)._fromNumber).toEqual(0);
    expect(getChildAtIndex(inmotion, 5)._fromNumber).toEqual(0);
    expect(getChildAtIndex(inmotion, 6)._fromNumber).toEqual(0);
    // Skew
    expect(getChildAtIndex(inmotion, 7)._unit).toEqual("deg");
    expect(getChildAtIndex(inmotion, 8)._unit).toEqual("deg");
    expect(getChildAtIndex(inmotion, 9)._unit).toEqual("deg");
    expect(getChildAtIndex(inmotion, 7)._fromNumber).toEqual(0);
    expect(getChildAtIndex(inmotion, 8)._fromNumber).toEqual(0);
    expect(getChildAtIndex(inmotion, 9)._fromNumber).toEqual(0);
    // Scale
    expect(getChildAtIndex(inmotion, 10)._unit).toEqual(null);
    expect(getChildAtIndex(inmotion, 11)._unit).toEqual(null);
    expect(getChildAtIndex(inmotion, 12)._unit).toEqual(null);
    expect(getChildAtIndex(inmotion, 13)._unit).toEqual(null);
    expect(getChildAtIndex(inmotion, 10)._fromNumber).toEqual(1);
    expect(getChildAtIndex(inmotion, 11)._fromNumber).toEqual(1);
    expect(getChildAtIndex(inmotion, 12)._fromNumber).toEqual(1);
    expect(getChildAtIndex(inmotion, 13)._fromNumber).toEqual(1);
    // Perspective
    expect(getChildAtIndex(inmotion, 14)._unit).toEqual("px");
    expect(getChildAtIndex(inmotion, 14)._fromNumber).toEqual(0);

    /** @type {HTMLElement} */
    const $target = document.querySelector("#target-id");
    expect(getComputedStyle($target).transform).toEqual(
      "translateX(100px) translateY(100px) translateZ(100px) rotate(360deg) rotateX(360deg) rotateY(360deg) rotateZ(360deg) skew(45deg) skewX(45deg) skewY(45deg) scale(10) scaleX(10) scaleY(10) scaleZ(10) perspective(1000px)"
    );
  });

  it("Should get inline transforms values", () => {
    const $target = document.querySelector("#target-id");

    const get = getComputedStyle($target);

    get.transform =
      "translateX(10px) translateY(calc(100px - 10vh)) scale(0.75)";

    createMotion($target, {
      translateX: 100,
      translateY: 100,
      scale: 10,
      duration: 10,
    });

    expect(inMotion.get($target, "translateX")).toEqual("10px");
    expect(inMotion.get($target, "translateY")).toEqual("calc(100px - 10vh)");
    expect(inMotion.get($target, "scale")).toEqual("0.75");
  });

  it("Should get transforms shorthand properties values", () => {
    /** @type {HTMLElement} */
    const $target = document.querySelector("#target-id");
    const get = getComputedStyle($target);

    get.transform =
      "translateX(10px) translateY(calc(-100px + 10vh)) translateZ(50px) scale(0.75)";

    const inmotion = createMotion("#target-id", {
      x: 100,
      y: 100,
      z: 100,
      scale: 10,
      duration: 10,
    });

    expect(inMotion.get("#target-id", "x")).toEqual("10px");
    expect(inMotion.get("#target-id", "y")).toEqual("calc(-100px + 10vh)");
    expect(inMotion.get("#target-id", "z")).toEqual("50px");
    expect(inMotion.get("#target-id", "scale")).toEqual("0.75");

    inmotion.pause().seek(inmotion.duration);

    expect(inMotion.get("#target-id", "x")).toEqual("100px");
    expect(inMotion.get("#target-id", "y")).toEqual("calc(100px + 100vh)");
    expect(inMotion.get("#target-id", "z")).toEqual("100px");
    expect(inMotion.get("#target-id", "scale")).toEqual("10");
  });

  it("Should parse values with white space", () => {
    const $target = document.querySelector("#target-id");
    const inmotion = createMotion($target, {
      backgroundSize: ["auto 100%", "auto 200%"],
      duration: 10,
    });

    expect(getChildAtIndex(inmotion, 0)._valueType).toEqual(valueTypes.COMPLEX);
    expect(getChildAtIndex(inmotion, 0)._fromNumbers[0]).toEqual(100);
    expect(getChildAtIndex(inmotion, 0)._strings[0]).toEqual("auto ");
    expect(getChildAtIndex(inmotion, 0)._strings[1]).toEqual("%");

    expect(getChildAtIndex(inmotion, 0)._valueType).toEqual(valueTypes.COMPLEX);
    expect(getChildAtIndex(inmotion, 0)._toNumbers[0]).toEqual(200);

    expect(getComputedStyle($target).backgroundSize).toEqual("auto 100%");

    inmotion.pause().seek(inmotion.duration);

    expect(getComputedStyle($target).backgroundSize).toEqual("auto 200%");
  });

  it("Should parse complex CSS values", () => {
    const $target = document.querySelector("#target-id");
    const get = getComputedStyle($target);
    get.zIndex = "auto";

    const inmotion = createMotion($target, {
      filter: "blur(10px) contrast(200)",
      translateX: "calc(calc(15px * 2) - 42rem)",
      zIndex: { to: 10, modifier: inMotion.round(1) } as any,
      duration: 10,
    });

    expect(getComputedStyle($target).zIndex).toEqual("0");
    expect(getComputedStyle($target).filter).toEqual("blur(0px) contrast(0)");
    expect(getComputedStyle($target).transform).toEqual(
      "translateX(calc(0px + 0rem))"
    );
    inmotion.pause().seek(inmotion.duration);
    expect(getComputedStyle($target).zIndex).toEqual("10");
    expect(getChildAtIndex(inmotion, 0)._toNumbers).toEqual([10, 200]);
    expect(getComputedStyle($target).filter).toEqual(
      "blur(10px) contrast(200)"
    );
    expect(getChildAtIndex(inmotion, 1)._toNumbers).toEqual([15, 2, 42]);
    expect(getComputedStyle($target).transform).toEqual(
      "translateX(calc(30px - 42rem))"
    );
  });

  it("Should parse CSS Variables", () => {
    const $target = document.querySelector(":root");
    expect(getComputedStyle($target).getPropertyValue("--width")).toEqual(
      "100px"
    );
    const inmotion = createMotion($target, {
      "--width": 200,
      duration: 10,
    });

    expect(getComputedStyle($target).getPropertyValue("--width")).toEqual(
      "100px"
    );
    inmotion.pause().seek(inmotion.duration);
    expect(getComputedStyle($target).getPropertyValue("--width")).toEqual(
      "200px"
    );
    expect(getChildAtIndex(inmotion, 0)._fromNumber).toEqual(100);
    expect(getChildAtIndex(inmotion, 0)._toNumber).toEqual(200);
  });

  it("Should parse CSS Variables in Transforms", () => {
    const $target = document.querySelector("#target-id");
    inMotion.set($target, {
      "--x": "12rem",
      "--rx": "45deg",
      "--s": 2,
      translateX: "var(--x)",
      rotateX: "var(--rx)",
      scale: "var(--s)",
    });
    expect(getComputedStyle($target).getPropertyValue("--x")).toEqual("12rem");
    expect(getComputedStyle($target).getPropertyValue("--rx")).toEqual("45deg");
    expect(getComputedStyle($target).getPropertyValue("--s")).toEqual("2");
    let transforms = getComputedStyle($target).transform;
    expect(transforms).toEqual(
      "translateX(var(--x)) rotateX(var(--rx)) scale(var(--s))"
    );
    const inmotion = createMotion($target, {
      "--x": "19rem",
      "--rx": "64deg",
      "--s": 1.25,
      duration: 10,
    });

    inmotion.pause().seek(inmotion.duration);
    expect(getComputedStyle($target).getPropertyValue("--x")).toEqual("19rem");
    expect(getComputedStyle($target).getPropertyValue("--rx")).toEqual("64deg");
    expect(getComputedStyle($target).getPropertyValue("--s")).toEqual("1.25");
    transforms = getComputedStyle($target).transform;
    expect(transforms).toEqual(
      "translateX(var(--x)) rotateX(var(--rx)) scale(var(--s))"
    );
  });

  it("Should parse from values", () => {
    const $target = document.querySelector("#target-id");
    const get = getComputedStyle($target);
    get.transform = "translateX(100px)";
    const inmotion = createMotion($target, {
      translateX: { from: 50 },
      duration: 10,
    });

    expect(getComputedStyle($target).transform).toEqual("translateX(50px)");
    inmotion.pause().seek(inmotion.duration);
    expect(getComputedStyle($target).transform).toEqual("translateX(100px)");
  });

  it("Should parse from to values", () => {
    const $target = document.querySelector("#target-id");
    const get = getComputedStyle($target);
    get.transform = "translateX(100px)";
    const inmotion = createMotion($target, {
      translateX: { from: 50, to: 150 },
      duration: 10,
    });

    expect(getComputedStyle($target).transform).toEqual("translateX(50px)");
    inmotion.pause().seek(inmotion.duration);
    expect(getComputedStyle($target).transform).toEqual("translateX(150px)");
  });

  it("Should parse from to values with 0 values", () => {
    const $target = document.querySelector("#target-id");
    const get = getComputedStyle($target);
    get.transform = "translateX(100px)";
    const inmotion = createMotion($target, {
      translateX: { from: 50, to: 0 },
      duration: 10,
    });

    expect(getComputedStyle($target).transform).toEqual("translateX(50px)");
    inmotion.pause().seek(inmotion.duration);
    expect(getComputedStyle($target).transform).toEqual("translateX(0px)");
  });

  it("Should parse from to values shorthand", () => {
    const $target = document.querySelector("#target-id");
    const get = getComputedStyle($target);
    get.transform = "translateX(100px)";
    const inmotion = createMotion($target, {
      translateX: [50, 150],
      duration: 10,
    });

    expect(getComputedStyle($target).transform).toEqual("translateX(50px)");
    inmotion.pause().seek(inmotion.duration);
    expect(getComputedStyle($target).transform).toEqual("translateX(150px)");
  });

  it("Should parse relative values with operators +=, -=, *=", () => {
    const target = document.querySelector("#target-id");
    const get = getComputedStyle(target);
    get.transform = "translateX(100px)";
    get.width = "28px";
    const inmotion = createMotion(target, {
      translateX: "*=2.5", // 100px * 2.5 = '250px',
      width: "-=20px", // 28 - 20 = '8px',
      rotate: "+=2turn", // 0 + 2 = '2turn',
      duration: 10,
    });

    expect(getComputedStyle(target).transform).toEqual(
      "translateX(100px) rotate(0turn)"
    );
    expect(getComputedStyle(target).width).toEqual("28px");

    inmotion.pause().seek(inmotion.duration);

    expect(getComputedStyle(target).transform).toEqual(
      "translateX(250px) rotate(2turn)"
    );
    expect(getComputedStyle(target).width).toEqual("8px");
  });

  it("Should parse relative from values", () => {
    const $target = document.querySelector("#target-id");
    const get = getComputedStyle($target);
    get.transform = "translateX(100px) rotate(2turn)";
    get.width = "28px";
    const inmotion = createMotion($target, {
      translateX: { from: "*=2.5" },
      width: { from: "-=20px" },
      rotate: { from: "+=2turn" },
      duration: 10,
    });

    expect(getComputedStyle($target).transform).toEqual(
      "translateX(250px) rotate(4turn)"
    );
    expect(getComputedStyle($target).width).toEqual("8px");

    inmotion.pause().seek(inmotion.duration);

    expect(getComputedStyle($target).transform).toEqual(
      "translateX(100px) rotate(2turn)"
    );
    expect(getComputedStyle($target).width).toEqual("28px");
  });

  it("Should parse relative from to values", () => {
    const $target = document.querySelector("#target-id");
    const get = getComputedStyle($target);
    get.transform = "translateX(100px) rotate(2turn)";
    get.width = "28px";
    const inmotion = createMotion($target, {
      translateX: ["*=2.5", 10], // Relative from value
      width: [100, "-=20px"], // Relative to value
      rotate: ["+=2turn", "-=1turn"], // Relative from and to values
      duration: 10,
    });

    expect(getComputedStyle($target).transform).toEqual(
      "translateX(250px) rotate(4turn)"
    );
    expect(getComputedStyle($target).width).toEqual("100px");

    inmotion.pause().seek(inmotion.duration);

    expect(getComputedStyle($target).transform).toEqual(
      "translateX(10px) rotate(3turn)"
    );
    expect(getComputedStyle($target).width).toEqual("80px");
  });

  it("Should parse relative values inside keyframes", () => {
    const $target = document.querySelector("#target-id");
    const get = getComputedStyle($target);
    get.transform = "translateX(100px) rotate(2turn)";
    const inmotion = createMotion($target, {
      translateX: [{ to: "+=10" }, { to: "-=10" }],
      rotate: [
        { from: "+=2turn", to: "-=1turn" },
        { from: "+=5turn", to: "-=2turn" },
      ],
      duration: 10,
      ease: "linear",
    });

    expect(getComputedStyle($target).transform).toEqual(
      "translateX(100px) rotate(4turn)"
    );
    inmotion.seek(inmotion.duration * 0.25);
    expect(getComputedStyle($target).transform).toEqual(
      "translateX(105px) rotate(3.5turn)"
    );
    inmotion.seek(inmotion.duration * 0.5);
    expect(getComputedStyle($target).transform).toEqual(
      "translateX(110px) rotate(8turn)"
    );
    inmotion.pause().seek(inmotion.duration);
    expect(getComputedStyle($target).transform).toEqual(
      "translateX(100px) rotate(6turn)"
    );
  });
});
