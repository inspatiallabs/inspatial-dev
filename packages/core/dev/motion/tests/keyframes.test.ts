import { it, describe, expect } from "@inspatial/test";
import { createMotion, inMotion } from "../src/index.ts";
import { getChildAtIndex, getTweenDelay } from "../src/utils/index.ts";
import { valueTypes } from "../src/consts.ts";

describe("InMotion Keyframes", () => {
  it("Should handle an array of one raw value as a simple value", () => {
    const inmotion = createMotion("#target-id", {
      translateX: [50],
      autoplay: false,
    });

    expect(getChildAtIndex(inmotion, 0)._valueType).toEqual(valueTypes.UNIT);
    expect(getChildAtIndex(inmotion, 0)._fromNumber).toEqual(0);
    expect(getChildAtIndex(inmotion, 0)._toNumber).toEqual(50);
    expect(getChildAtIndex(inmotion, 0)._unit).toEqual("px");
  });

  it("Should convert an array of two raw values to 'From To' values", () => {
    const inmotion = createMotion("#target-id", {
      translateX: [-100, 100],
      autoplay: false,
    });

    expect(getChildAtIndex(inmotion, 0)._valueType).toEqual(valueTypes.UNIT);
    expect(getChildAtIndex(inmotion, 0)._fromNumber).toEqual(-100);
    expect(getChildAtIndex(inmotion, 0)._toNumber).toEqual(100);
    expect(getChildAtIndex(inmotion, 0)._unit).toEqual("px");
  });

  it("Should use the first value of an array of more than two raw values as a from value", () => {
    const inmotion = createMotion("#target-id", {
      translateX: [-100, 100, 50],
      autoplay: false,
    });

    expect(getChildAtIndex(inmotion, 0)._valueType).toEqual(valueTypes.UNIT);
    expect(getChildAtIndex(inmotion, 0)._fromNumber).toEqual(-100);
    expect(getChildAtIndex(inmotion, 0)._toNumber).toEqual(100);
    expect(getChildAtIndex(inmotion, 0)._unit).toEqual("px");

    expect(getChildAtIndex(inmotion, 1)._valueType).toEqual(valueTypes.UNIT);
    expect(getChildAtIndex(inmotion, 1)._fromNumber).toEqual(100);
    expect(getChildAtIndex(inmotion, 1)._toNumber).toEqual(50);
    expect(getChildAtIndex(inmotion, 1)._unit).toEqual("px");
  });

  it("Should convert an array of two object values to keyframes", () => {
    const inmotion = createMotion("#target-id", {
      translateX: [{ to: -100 }, { to: 100 }],
      autoplay: false,
    });

    expect(getChildAtIndex(inmotion, 0)._valueType).toEqual(valueTypes.UNIT);
    expect(getChildAtIndex(inmotion, 0)._fromNumber).toEqual(0);
    expect(getChildAtIndex(inmotion, 0)._toNumber).toEqual(-100);
    expect(getChildAtIndex(inmotion, 0)._unit).toEqual("px");

    expect(getChildAtIndex(inmotion, 1)._valueType).toEqual(valueTypes.UNIT);
    expect(getChildAtIndex(inmotion, 1)._fromNumber).toEqual(-100);
    expect(getChildAtIndex(inmotion, 1)._toNumber).toEqual(100);
    expect(getChildAtIndex(inmotion, 1)._unit).toEqual("px");
  });

  it("Should inherit the duration from the instance duration and devide it by the number of keyframes", () => {
    const inmotion = createMotion("#target-id", {
      translateX: [{ to: -100 }, { to: 100 }, { to: 50 }, { to: 0 }],
      duration: 2000,
      autoplay: false,
    });

    expect(getChildAtIndex(inmotion, 0)._changeDuration).toEqual(500); // 2000 / 4
    expect(getChildAtIndex(inmotion, 1)._changeDuration).toEqual(500); // 2000 / 4
    expect(getChildAtIndex(inmotion, 2)._changeDuration).toEqual(500); // 2000 / 4
    expect(getChildAtIndex(inmotion, 3)._changeDuration).toEqual(500); // 2000 / 4
  });

  it("Should inherit the duration from the instance duration and devide it by the number of keyframes", () => {
    const inmotion = createMotion("#target-id", {
      translateX: [
        { to: -100, duration: 800 },
        { to: 100 },
        { to: 50 },
        { to: 0, duration: 1200 },
      ],
      duration: 2000,
      autoplay: false,
    });

    expect(getChildAtIndex(inmotion, 0)._changeDuration).toEqual(800); // Specified duration
    expect(getChildAtIndex(inmotion, 1)._changeDuration).toEqual(500); // 2000 / 4
    expect(getChildAtIndex(inmotion, 2)._changeDuration).toEqual(500); // 2000 / 4
    expect(getChildAtIndex(inmotion, 3)._changeDuration).toEqual(1200); // Specified duration
  });

  it("Should inherit the duration when only one keyframe is set", () => {
    const inmotion = createMotion("#target-id", {
      translateX: [{ to: -100 }],
      duration: 2000,
      autoplay: false,
    });

    expect(getChildAtIndex(inmotion, 0)._changeDuration).toEqual(2000); // 2000 / 4
  });

  it("Should transfer the first keyframe to the _delay inmotion", () => {
    const inmotion = createMotion("#target-id", {
      translateX: [{ to: -100 }, { to: 100 }],
      delay: 200,
      endDelay: 400,
      autoplay: false,
    });

    expect(inmotion._delay).toEqual(200);
    expect(getTweenDelay(getChildAtIndex(inmotion, 0))).toEqual(0);
    expect(getTweenDelay(getChildAtIndex(inmotion, 1))).toEqual(0);
  });

  it("Should inherit the parameters from the instance", () => {
    const roundModifier10 = (v) => inMotion.round(v, 10);
    const roundModifier05 = (v) => inMotion.round(v, 5);
    const inmotion = createMotion("#target-id", {
      translateX: [
        { to: -100 },
        {
          to: 100,
          duration: 100,
          delay: 300,
          ease: "linear",
          modifier: roundModifier10,
        },
        { to: 50 },
      ],
      translateY: [{ to: -200 }, { to: 200 }, { to: 100 }],
      duration: 1500,
      delay: 200,
      modifier: roundModifier05,
      ease: "outQuad",
      autoplay: false,
    });

    expect(getChildAtIndex(inmotion, 0)._changeDuration).toEqual(500); // 1500 / 3
    expect(getTweenDelay(getChildAtIndex(inmotion, 0))).toEqual(0);
    expect(getChildAtIndex(inmotion, 0)._ease(0.5)).toEqual(0.75);
    expect(getChildAtIndex(inmotion, 0)._modifier).toEqual(roundModifier05);

    expect(getChildAtIndex(inmotion, 1)._changeDuration).toEqual(100);
    expect(getTweenDelay(getChildAtIndex(inmotion, 1))).toEqual(300);
    expect(getChildAtIndex(inmotion, 1)._ease(0.5)).toEqual(0.5);
    expect(getChildAtIndex(inmotion, 1)._modifier).toEqual(roundModifier10);

    expect(getChildAtIndex(inmotion, 0)._fromNumber).toEqual(0);
    expect(getChildAtIndex(inmotion, 0)._toNumber).toEqual(-100);
    expect(getChildAtIndex(inmotion, 1)._fromNumber).toEqual(-100);
    expect(getChildAtIndex(inmotion, 1)._toNumber).toEqual(100);
    expect(getChildAtIndex(inmotion, 2)._fromNumber).toEqual(100);
    expect(getChildAtIndex(inmotion, 2)._toNumber).toEqual(50);

    expect(getChildAtIndex(inmotion, 3)._fromNumber).toEqual(0);
    expect(getChildAtIndex(inmotion, 3)._toNumber).toEqual(-200);
    expect(getChildAtIndex(inmotion, 4)._fromNumber).toEqual(-200);
    expect(getChildAtIndex(inmotion, 4)._toNumber).toEqual(200);
    expect(getChildAtIndex(inmotion, 5)._fromNumber).toEqual(200);
    expect(getChildAtIndex(inmotion, 5)._toNumber).toEqual(100);
  });

  it("Should inherit the parameters from the instance", () => {
    const roundModifier10 = (v) => inMotion.round(v, 10);
    const roundModifier05 = (v) => inMotion.round(v, 5);
    const inmotion = createMotion("#target-id", {
      keyframes: [
        { translateY: -40 },
        {
          translateX: 250,
          duration: 100,
          delay: 300,
          ease: "linear",
          modifier: roundModifier10,
        },
        { translateY: 40 },
        { translateX: 0 },
        { translateY: 0 },
      ],
      duration: 1500,
      delay: 200,
      modifier: roundModifier05,
      ease: "outQuad",
      autoplay: false,
    });

    expect(getChildAtIndex(inmotion, 0)._changeDuration).toEqual(300); // 1500 / 5
    expect(getTweenDelay(getChildAtIndex(inmotion, 0))).toEqual(0); // Inherited because its the first keyframe
    expect(getChildAtIndex(inmotion, 0)._ease(0.5)).toEqual(0.75);
    expect(getChildAtIndex(inmotion, 0)._modifier).toEqual(roundModifier05);

    expect(getChildAtIndex(inmotion, 1)._changeDuration).toEqual(100);
    expect(getTweenDelay(getChildAtIndex(inmotion, 1))).toEqual(300);
    expect(getChildAtIndex(inmotion, 1)._ease(0.5)).toEqual(0.5); // Linear ease
    expect(getChildAtIndex(inmotion, 1)._modifier).toEqual(roundModifier10);

    // translateY
    expect(getChildAtIndex(inmotion, 0)._fromNumber).toEqual(0);
    expect(getChildAtIndex(inmotion, 0)._toNumber).toEqual(-40);
    expect(getChildAtIndex(inmotion, 1)._fromNumber).toEqual(-40);
    expect(getChildAtIndex(inmotion, 1)._toNumber).toEqual(-40);
    expect(getChildAtIndex(inmotion, 2)._fromNumber).toEqual(-40);
    expect(getChildAtIndex(inmotion, 2)._toNumber).toEqual(40);
    expect(getChildAtIndex(inmotion, 3)._fromNumber).toEqual(40);
    expect(getChildAtIndex(inmotion, 3)._toNumber).toEqual(40);
    expect(getChildAtIndex(inmotion, 4)._fromNumber).toEqual(40);
    expect(getChildAtIndex(inmotion, 4)._toNumber).toEqual(0);

    // translateX
    expect(getChildAtIndex(inmotion, 5)._fromNumber).toEqual(0);
    expect(getChildAtIndex(inmotion, 5)._toNumber).toEqual(0);
    expect(getChildAtIndex(inmotion, 6)._fromNumber).toEqual(0);
    expect(getChildAtIndex(inmotion, 6)._toNumber).toEqual(250);
    expect(getChildAtIndex(inmotion, 7)._fromNumber).toEqual(250);
    expect(getChildAtIndex(inmotion, 7)._toNumber).toEqual(250);
    expect(getChildAtIndex(inmotion, 8)._fromNumber).toEqual(250);
    expect(getChildAtIndex(inmotion, 8)._toNumber).toEqual(0);
    expect(getChildAtIndex(inmotion, 9)._fromNumber).toEqual(0);
    expect(getChildAtIndex(inmotion, 9)._toNumber).toEqual(0);
  });

  it("Should inherit the units from the instance", () => {
    /** @type {HTMLElement} */
    const $target = document.querySelector("#target-id");
    const inmotion = createMotion($target, {
      translateX: [
        { to: [-20, -40] },
        { to: "5rem" },
        { to: "100%" },
        { to: 0 },
        { to: "10%" },
        { to: [50, 200] },
        { to: [25, "100px"] },
      ],
      autoplay: false,
    });

    expect(getChildAtIndex(inmotion, 0)._unit).toEqual("px");
    expect(getChildAtIndex(inmotion, 1)._unit).toEqual("rem"); // switch to rem
    expect(getChildAtIndex(inmotion, 2)._unit).toEqual("%"); // switch to %
    expect(getChildAtIndex(inmotion, 3)._unit).toEqual("%"); // inherit %
    expect(getChildAtIndex(inmotion, 4)._unit).toEqual("%"); // switch back to %
    expect(getChildAtIndex(inmotion, 5)._unit).toEqual("%");
    expect(getChildAtIndex(inmotion, 6)._unit).toEqual("px"); // switch to px

    expect(getComputedStyle($target).transform).toEqual("translateX(-20px)");
  });

  it("Should use the playbackEase from the instance", () => {
    /** @type {HTMLElement} */
    const $target = document.querySelector("#target-id");
    const inmotion = createMotion($target, {
      keyframes: [
        { y: -40 },
        { x: 250 },
        { y: 40 },
        { x: 0, ease: "outQuad" },
        { y: 0 },
      ],
      duration: 1000,
      playbackEase: "inOutQuad",
      autoplay: false,
    });

    expect(getChildAtIndex(inmotion, 0)._ease(0.5)).toEqual(0.5); // All tweens should default to linear ease
    expect(getChildAtIndex(inmotion, 1)._ease(0.5)).toEqual(0.5);
    expect(getChildAtIndex(inmotion, 2)._ease(0.5)).toEqual(0.5);
    expect(getChildAtIndex(inmotion, 3)._ease(0.5)).toEqual(0.75); // Except when they have an ease parameter defined

    // Easing should be continuous throughout the sequence
    inmotion.seek(250);
    expect(getComputedStyle($target).transform).toEqual(
      "translateY(-25px) translateX(0px)"
    );
    inmotion.seek(500);
    expect(getComputedStyle($target).transform).toEqual(
      "translateY(0px) translateX(250px)"
    );
    inmotion.seek(750);
    expect(getComputedStyle($target).transform).toEqual("translateY(25px) translateX(0px)");
  });

  it("Should handle percentage based keyframes values", () => {
    /** @type {HTMLElement} */
    const $target = document.querySelector("#target-id");
    const inmotion = createMotion($target, {
      keyframes: {
        "0%": { x: 100, y: 100 },
        "20%": { x: -100 },
        "50%": { x: 100 },
        "80%": { x: -100 },
        "100%": { x: 100, y: -100 },
      },
      duration: 1000,
      ease: "linear",
      autoplay: false,
    });

    // Easing should be continuous throughout the sequence
    inmotion.seek(0);
    expect(getComputedStyle($target).transform).toEqual(
      "translateX(100px) translateY(100px)"
    );
    inmotion.seek(200);
    expect(getComputedStyle($target).transform).toEqual(
      "translateX(-100px) translateY(60px)"
    );
    inmotion.seek(500);
    expect(getComputedStyle($target).transform).toEqual(
      "translateX(100px) translateY(0px)"
    );
    inmotion.seek(800);
    expect(getComputedStyle($target).transform).toEqual(
      "translateX(-100px) translateY(-60px)"
    );
    inmotion.seek(1000);
    expect(getComputedStyle($target).transform).toEqual(
      "translateX(100px) translateY(-100px)"
    );
  });

  it("Should handle percentage based keyframes with float percentage values", () => {
    /** @type {HTMLElement} */
    const $target = document.querySelector("#target-id");
    const inmotion = createMotion($target, {
      keyframes: {
        "0%": { x: 0 },
        "21.5%": { x: 50 },
        "100%": { x: 100 },
      },
      duration: 1000,
      ease: "linear",
      autoplay: false,
    });

    // Easing should be continuous throughout the sequence
    inmotion.seek(215);
    expect(getComputedStyle($target).transform).toEqual("translateX(50px)");
  });

  it("Should handle array based keyframes with floating point durations", () => {
    /** @type {HTMLElement} */
    const $target = document.querySelector("#target-id");
    const inmotion = createMotion($target, {
      x: [100, 200, 300, 400],
      ease: "linear",
      duration: 4000, // each keyframes duration: inMotion.round(4000/3, 12)
      autoplay: false,
    });

    const keyDuration = inMotion.round(4000 / 3, 12);

    expect(inmotion.duration).toEqual(keyDuration * 3);

    // Easing should be continuous throughout the sequence
    inmotion.seek(0);
    expect(getComputedStyle($target).transform).toEqual("translateX(100px)");
    inmotion.seek(keyDuration * 1);
    expect(getComputedStyle($target).transform).toEqual("translateX(200px)");
    inmotion.seek(keyDuration * 2);
    expect(getComputedStyle($target).transform).toEqual("translateX(300px)");
    inmotion.seek(keyDuration * 3);
    expect(getComputedStyle($target).transform).toEqual("translateX(400px)");
  });
});
