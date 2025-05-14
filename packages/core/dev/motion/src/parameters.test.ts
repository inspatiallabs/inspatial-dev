import { describe, it, expect } from "@inspatial/test";
import {
  createMotion,
  createMotionTimeline,
  createMotionTimer,
  inMotion,
} from "./index.ts";
import { minValue } from "./consts.ts";
import { getChildAtIndex, getTweenDelay } from "./utils/index.ts";

/*#####################################(VARS)#####################################*/
let testObject = {
  plainValue: 0,
  valueWithUnit: "0px",
  multiplePLainValues: "0 0 0 0",
};

/*#####################################(TESTS)#####################################*/ S;
describe("InMotion Parameters", () => {
  const duration = 10;
  it("modifier", () => {
    const animation1 = createMotion(testObject, {
      plainValue: 3.14159265359,
      duration: duration,
      autoplay: false,
    });
    animation1.seek(duration);
    expect(testObject.plainValue).toEqual(3.14159265359);

    const animation2 = createMotion(testObject, {
      plainValue: 3.14159265359,
      duration: duration,
      modifier: inMotion.round(0),
      autoplay: false,
    });
    animation2.seek(duration);
    expect(testObject.plainValue).toEqual(3);

    const animation3 = createMotion(testObject, {
      valueWithUnit: "3.14159265359px",
      duration: duration,
      modifier: inMotion.round(0),
      autoplay: false,
    });
    animation3.seek(duration);
    expect(testObject.valueWithUnit).toEqual("3px");

    const animation4 = createMotion(testObject, {
      multiplePLainValues: "26.11111111 42.11111111 74.11111111 138.11111111",
      duration: duration,
      modifier: inMotion.round(0),
      autoplay: false,
    });
    animation4.seek(duration);
    expect(testObject.multiplePLainValues).toEqual("26 42 74 138");
  });

  it("frameRate", () => {
    let resolved = false;
    createMotion(testObject, {
      plainValue: [0, 100],
      frameRate: 1,
      duration: 10000,
      ease: "linear",
      onUpdate: (animation) => {
        if (animation.progress >= 0.05 && !resolved) {
          resolved = true;
          expect(testObject.plainValue).toBeCloseTo(0, 2);
        }
      },
    });
  });

  it("playbackRate on Animation", (resolve) => {
    createMotion(testObject, {
      plainValue: [0, 100],
      playbackRate: 0.5,
      duration: 100,
      ease: "linear",
    });

    createMotionTimer({
      duration: 100,
      onComplete: () => {
        expect(testObject.plainValue).toBeCloseTo(50, 10);
        resolve();
      },
    });
  });

  it("playbackRate on Timeline", (resolve) => {
    createMotionTimeline({
      playbackRate: 0.5,
    }).add(testObject, {
      plainValue: [0, 100],
      playbackRate: 0.5,
      duration: 100,
      ease: "linear",
    });

    createMotionTimer({
      duration: 100,
      onComplete: () => {
        expect(testObject.plainValue).toBeCloseTo(25, 10);
        resolve();
      },
    });
  });

  it("playbackEase on Animation", (resolve) => {
    createMotion(testObject, {
      plainValue: [0, 100],
      playbackEase: "outQuad",
      duration: 100,
      ease: "linear",
    });

    createMotionTimer({
      duration: 50,
      onComplete: () => {
        expect(testObject.plainValue).toBeCloseTo(80, 10);
        resolve();
      },
    });
  });

  it("playbackRate on Timeline", (resolve) => {
    createMotionTimeline({
      playbackEase: "outQuad",
    }).add(testObject, {
      plainValue: [0, 100],
      playbackEase: "outQuad",
      duration: 100,
      ease: "linear",
    });

    createMotionTimer({
      duration: 50,
      onComplete: () => {
        expect(testObject.plainValue).toBeCloseTo(95, 10);
        resolve();
      },
    });
  });

  it("delay", (resolve) => {
    const animation1 = createMotion(testObject, {
      plainValue: [0, 100],
      delay: 100,
      duration: 100,
    });

    createMotionTimer({
      duration: 50,
      onComplete: () => {
        expect(animation1.currentTime).toBeCloseTo(-40, 20);
      },
    });

    createMotionTimer({
      duration: 150,
      onComplete: () => {
        expect(animation1.currentTime).toBeCloseTo(50, 20);
      },
    });

    createMotionTimer({
      duration: 200,
      onComplete: () => {
        expect(animation1.currentTime).toEqual(100);
        resolve();
      },
    });
  });

  it("Specific property parameters", () => {
    /** @type {HTMLElement} */
    const targetEl = document.querySelector("#target-id");
    const roundModifier10 = inMotion.round(1);
    const roundModifier100 = inMotion.round(2);
    const animation = createMotion(targetEl, {
      translateX: {
        to: 100,
        ease: "linear",
        modifier: roundModifier10,
        delay: duration * 0.25,
        duration: duration * 0.6,
      },
      rotate: {
        to: 360,
        duration: duration * 0.5,
      },
      translateY: 200,
      ease: "outQuad",
      modifier: roundModifier100,
      delay: duration * 0.35,
      duration: duration * 0.7,
    });

    expect(getChildAtIndex(animation, 0)._ease(0.5)).toEqual(0.5);
    expect(getChildAtIndex(animation, 0)._modifier).toEqual(roundModifier10);
    expect(getTweenDelay(getChildAtIndex(animation, 0))).toEqual(0);
    expect(getChildAtIndex(animation, 0)._changeDuration).toEqual(
      duration * 0.6
    );

    expect(getChildAtIndex(animation, 1)._ease(0.5)).toEqual(0.75);
    expect(getChildAtIndex(animation, 1)._modifier).toEqual(roundModifier100);
    // delay = (duration * (.35 - .25))
    expect(getTweenDelay(getChildAtIndex(animation, 1))).toEqual(
      duration * 0.1
    );
    expect(getChildAtIndex(animation, 1)._changeDuration).toEqual(
      duration * 0.5
    );

    expect(getChildAtIndex(animation, 2)._ease(0.5)).toEqual(0.75);
    expect(getChildAtIndex(animation, 2)._modifier).toEqual(roundModifier100);
    // delay = (duration * (.35 - .25))
    expect(getTweenDelay(getChildAtIndex(animation, 2))).toEqual(
      duration * 0.1
    );
    expect(getChildAtIndex(animation, 2)._changeDuration).toEqual(
      duration * 0.7
    );

    expect(getComputedStyle(targetEl).transform).toEqual(
      "translateX(0px) rotate(0deg) translateY(0px)"
    );
    animation.pause();
    animation.seek(animation.duration * 0.5);
    expect(getComputedStyle(targetEl).transform).toEqual(
      "translateX(66.7px) rotate(302.4deg) translateY(134.69px)"
    );
  });

  it("Specific property parameters on transforms values when last transform value update after everything else", (resolve) => {
    /** @type {HTMLElement} */
    const targetEl = document.querySelector("#target-id");
    const animation = createMotion(targetEl, {
      translateX: {
        to: 250,
        duration: 400,
        ease: "linear",
      },
      rotate: {
        to: 360,
        duration: 900,
        ease: "linear",
      },
      scale: {
        to: 2,
        duration: 800,
        delay: 400,
        ease: "inOutQuart",
      },
      delay: 100, // All properties except 'scale' inherit 250ms delay
    });

    createMotionTimer({
      duration: 200,
      onComplete: () => {
        const transformString = getComputedStyle(targetEl).transform;
        const transformValues = transformString.match(/(?:\d*\.)?\d+/g);
        expect(parseFloat(transformValues[0])).toBeCloseTo(65, 10);
        expect(parseFloat(transformValues[1])).toBeCloseTo(40, 10);
        expect(parseFloat(transformValues[2])).toBeCloseTo(1, 1);
        animation.pause();
        resolve();
      },
    });
  });

  it("0 duration animation", () => {
    /** @type {HTMLElement} */
    const targetEl = document.querySelector("#target-id");
    createMotion(targetEl, {
      x: 100,
      duration: 0,
    });

    expect(getComputedStyle(targetEl).transform).toEqual("translateX(100px)");
  });

  it("0 duration timer with infinite loop", () => {
    const timer = createMotionTimer({
      duration: 0,
      loop: true,
      autoplay: false,
    });

    expect(timer.duration).toEqual(minValue);
  });

  it("0 duration animation with infinite loop", () => {
    /** @type {HTMLElement} */
    const targetEl = document.querySelector("#target-id");
    const animation = createMotion(targetEl, {
      x: [-100, 100],
      y: [-100, 100],
      duration: 0,
      loop: true,
    });

    expect(animation.duration).toEqual(minValue);
    expect(getComputedStyle(targetEl).transform).toEqual(
      "translateX(100px) translateY(100px)"
    );
  });

  it("0 duration timeline with infinite loop", () => {
    /** @type {HTMLElement} */
    const targetEl = document.querySelector("#target-id");
    const tl = createMotionTimeline({
      loop: true,
      autoplay: false,
    }).add(targetEl, {
      x: 100,
      duration: 0,
      loop: true,
    });

    expect(tl.duration).toEqual(minValue);
  });
});
