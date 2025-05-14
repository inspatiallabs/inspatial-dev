import { describe, it, expect } from "@inspatial/test";
import { getChildAtIndex } from "./utils/index.ts";
import { createMotion, inMotion } from "./index.ts";

/*#########################################(VAR)#########################################*/
const validUnits = [
  "cm",
  "mm",
  "in",
  "pc",
  "pt",
  "px",
  "em",
  "ex",
  "ch",
  "rem",
  "vw",
  "vh",
  "vmin",
  "vmax",
  "q",
  "lh",
  "rlh",
  "vb",
  "vi",
  "svw",
  "svh",
  "lvw",
  "lvh",
  "dvw",
  "dvh",
];

/*#########################################(TEST)#########################################*/

describe("InMotion Units", () => {
  it("Default transform units", () => {
    const animation = createMotion("#target-id", {
      translateX: 100,
      translateY: 100,
      translateZ: 100,
      rotate: 360,
      rotateX: 360,
      rotateY: 360,
      rotateZ: 360,
      skew: 360,
      skewX: 360,
      skewY: 360,
      perspective: 1000,
      duration: 10,
    });

    // Translate (Position)
    expect(getChildAtIndex(animation, 0)._unit).toEqual("px");
    expect(getChildAtIndex(animation, 1)._unit).toEqual("px");
    expect(getChildAtIndex(animation, 2)._unit).toEqual("px");
    // Rotate
    expect(getChildAtIndex(animation, 3)._unit).toEqual("deg");
    expect(getChildAtIndex(animation, 4)._unit).toEqual("deg");
    expect(getChildAtIndex(animation, 5)._unit).toEqual("deg");
    expect(getChildAtIndex(animation, 6)._unit).toEqual("deg");
    // Skew
    expect(getChildAtIndex(animation, 7)._unit).toEqual("deg");
    expect(getChildAtIndex(animation, 8)._unit).toEqual("deg");
    expect(getChildAtIndex(animation, 9)._unit).toEqual("deg");
    // Perspective
    expect(getChildAtIndex(animation, 10)._unit).toEqual("px");
  });

  it("Should handle specified unit on a simple tween", () => {
    const animation = createMotion("#target-id", {
      translateX: "100%",
      duration: 10,
    });

    expect(getChildAtIndex(animation, 0)._unit).toEqual("%");
  });

  it("Should handle units inheritance on From To Values", () => {
    const animation = createMotion("#target-id", {
      translateX: [-50, "50%"],
      duration: 10,
    });

    expect(getChildAtIndex(animation, 0)._unit).toEqual("%");
  });

  it("Should match any units from original values", () => {
    validUnits.forEach((unit) => {
      inMotion.set("#target-id", { width: 99 + unit });
      const animation = createMotion("#target-id", {
        width: 999,
        duration: 10,
      });
      expect(getChildAtIndex(animation, 0)._unit).toEqual(unit);
    });
  });

  it("Should match any units set in the property value", () => {
    validUnits.forEach((unit) => {
      inMotion.set("#target-id", { width: 99 + "px" });
      const animation = createMotion("#target-id", {
        width: 999 + unit,
        duration: 10,
      });
      expect(getChildAtIndex(animation, 0)._unit).toEqual(unit);
    });
  });

  it("Should handle values set with units properly applied", () => {
    validUnits.forEach((unit) => {
      const targetClass = document.querySelector("#target-id");
      inMotion.set(targetClass, {
        width: ".9" + unit,
        left: "-.099" + unit,
        top: "-1E37" + unit,
        right: "+1e38" + unit,
        bottom: "+0.099" + unit,
      });

      expect(getComputedStyle(targetClass).width).toEqual("0.9" + unit);
      expect(getComputedStyle(targetClass).left).toEqual("-0.099" + unit);
      expect(getComputedStyle(targetClass).top).toEqual("-1e+37" + unit);
      expect(getComputedStyle(targetClass).right).toEqual("1e+38" + unit);
      expect(getComputedStyle(targetClass).bottom).toEqual("0.099" + unit);
    });
  });

  it("Should match any units from complex original values", () => {
    validUnits.forEach((unit) => {
      const targetClass = document.querySelector("#target-id");
      inMotion.set(targetClass, {
        width: ".9" + unit,
        left: "-.099" + unit,
        top: "-1E37" + unit,
        right: "+1e38" + unit,
        bottom: "+0.099" + unit,
      });

      const animation = createMotion(targetClass, {
        width: 0.99,
        left: -0.0999,
        top: -1e3099,
        right: +1e3099,
        bottom: +0.0999,
        duration: 10,
      });

      expect(getChildAtIndex(animation, 0)._unit).toEqual(unit);
      expect(getChildAtIndex(animation, 1)._unit).toEqual(unit);
      expect(getChildAtIndex(animation, 2)._unit).toEqual(unit);
      expect(getChildAtIndex(animation, 3)._unit).toEqual(unit);
      expect(getChildAtIndex(animation, 4)._unit).toEqual(unit);

      expect(getChildAtIndex(animation, 0)._toNumber).toEqual(0.99);
      expect(getChildAtIndex(animation, 1)._toNumber).toEqual(-0.0999);
      expect(getChildAtIndex(animation, 2)._toNumber).toEqual(-1e3099);
      expect(getChildAtIndex(animation, 3)._toNumber).toEqual(+1e3099);
      expect(getChildAtIndex(animation, 4)._toNumber).toEqual(+0.0999);
    });
  });

  it("Should handle basic unit conversion", () => {
    const targetClass = document.querySelector("#target-id");
    inMotion.set(targetClass, { fontSize: "20px" });
    inMotion.set(targetClass, { width: "1em" });
    expect(getComputedStyle(targetClass).width).toBeCloseTo(20, 1); // 1em = 20px
    inMotion.set(targetClass, { width: 2 }); // Should inherit the 'em' unit
    expect(getComputedStyle(targetClass).width).toBeCloseTo(40, 1); // 2em = 40px
    inMotion.set(targetClass, { width: "100%" });
    expect(getComputedStyle(targetClass).width).toBeCloseTo(
      getComputedStyle(targetClass.parentNode).width - 2,
      1 // -2 = (1px border * 2)
    );
    inMotion.set(targetClass, { width: 50 }); // Should inherit the 'em' unit
    expect(getComputedStyle(targetClass).width).toBeCloseTo(
      Math.round(getComputedStyle(targetClass.parentNode).width - 2 / 2),
      1
    ); // 50% of parent 100% -2
    inMotion.set(targetClass, { width: "50px" }); // Should inherit the 'em' unit
    expect(getComputedStyle(targetClass).width).toBeCloseTo(50, 1);
    inMotion.set(targetClass, { width: "calc(100% - 2px)" }); // Calc should properly overiide from values
    expect(getComputedStyle(targetClass).width).toBeCloseTo(
      getComputedStyle(targetClass.parentNode).width - 4,
      1 // -4 = (1px border * 2) - 2
    );
  });

  const oneRad = Math.PI * 2 + "rad";
  const halfRad = Math.PI * 1 + "rad";

  it("Should handle undefined to turn unit conversion", () => {
    let animation = createMotion("#target-id", {
      rotate: [360, ".5turn"],
      autoplay: false,
    });
    expect(getChildAtIndex(animation, 0)._fromNumber).toEqual(1);
    expect(getChildAtIndex(animation, 0)._toNumber).toEqual(0.5);
  });

  it("Should handle deg to turn unit conversion", () => {
    let animation = createMotion("#target-id", {
      rotate: ["360deg", ".5turn"],
      autoplay: false,
    });
    expect(getChildAtIndex(animation, 0)._fromNumber).toEqual(1);
    expect(getChildAtIndex(animation, 0)._toNumber).toEqual(0.5);
  });

  it("Should handle rad to turn unit conversion", () => {
    let animation = createMotion("#target-id", {
      rotate: [oneRad, ".5turn"],
      autoplay: false,
    });
    expect(getChildAtIndex(animation, 0)._fromNumber).toEqual(1);
    expect(getChildAtIndex(animation, 0)._toNumber).toEqual(0.5);
  });

  it("Should handle undefined to rad unit conversion", () => {
    let animation = createMotion("#target-id", {
      rotate: [360, halfRad],
      autoplay: false,
    });
    expect(getChildAtIndex(animation, 0)._fromNumber).toEqual(Math.PI * 2);
    expect(getChildAtIndex(animation, 0)._toNumber).toEqual(Math.PI * 1);
  });

  it("Should handle deg to rad unit conversion", () => {
    let animation = createMotion("#target-id", {
      rotate: ["360deg", halfRad],
      autoplay: false,
    });
    expect(getChildAtIndex(animation, 0)._fromNumber).toEqual(Math.PI * 2);
    expect(getChildAtIndex(animation, 0)._toNumber).toEqual(Math.PI * 1);
  });

  it("Should handle turn to rad unit conversion", () => {
    let animation = createMotion("#target-id", {
      rotate: ["1turn", halfRad],
      autoplay: false,
    });
    expect(getChildAtIndex(animation, 0)._fromNumber).toEqual(Math.PI * 2);
    expect(getChildAtIndex(animation, 0)._toNumber).toEqual(Math.PI * 1);
  });

  it("Should handle undefined to deg unit conversion", () => {
    let animation = createMotion("#target-id", {
      rotate: [360, "180deg"],
      autoplay: false,
    });
    expect(getChildAtIndex(animation, 0)._fromNumber).toEqual(360);
    expect(getChildAtIndex(animation, 0)._toNumber).toEqual(180);
  });

  it("Should handle turn to deg unit conversion", () => {
    let animation = createMotion("#target-id", {
      rotate: ["1turn", "180deg"],
      autoplay: false,
    });
    expect(getChildAtIndex(animation, 0)._fromNumber).toEqual(360);
    expect(getChildAtIndex(animation, 0)._toNumber).toEqual(180);
  });

  it("Should handle rad to turn unit conversion", () => {
    let animation = createMotion("#target-id", {
      rotate: [oneRad, "180deg"],
      autoplay: false,
    });
    expect(getChildAtIndex(animation, 0)._fromNumber).toEqual(360);
    expect(getChildAtIndex(animation, 0)._toNumber).toEqual(180);
  });
});
