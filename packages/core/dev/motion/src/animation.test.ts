// Import test setup to ensure DOM mocks are available
import "../test_setup.ts";

import { it, describe, expect, beforeEach, afterEach } from "@inspatial/test";
import { createMotion, createMotionAnimation } from "./animation.ts";
import { tweenTypes, minValue } from "./consts.ts";
import { createMotionTimer } from "./timer.ts";
import { getChildAtIndex, getChildLength } from "./utils/index.ts";
import { inMotion } from "./index.ts";
import { beforeEachTest } from "../test_setup.ts";

describe("InMotion Animations", () => {
  // Run beforeEach setup before every test to ensure a clean environment
  beforeEach(() => {
    beforeEachTest();
  });

  // Animation types

  it("Should get the Attribute tween type with SVG attribute values", () => {
    const animation = createMotion("#svg-element path", {
      stroke: "#FFFFFF",
      d: "M80 20c-30 0 0 30-30 30",
      duration: 100,
    });

    expect(getChildAtIndex(animation, 0)._tweenType).toEqual(
      tweenTypes.ATTRIBUTE
    );
    expect(getChildAtIndex(animation, 1)._tweenType).toEqual(
      tweenTypes.ATTRIBUTE
    );
  });

  it("Should get the CSS tween type with DOM attribute values", () => {
    const animation = createMotion(".with-width-attribute", {
      width: 100,
      duration: 100,
    });

    expect(getChildAtIndex(animation, 0)._tweenType).toEqual(tweenTypes.CSS);
    expect(getChildAtIndex(animation, 1)._tweenType).toEqual(tweenTypes.CSS);
  });

  it("Should get the CSS_VAR tween type with CSS variables properties", () => {
    const animation = createMotion(":root", {
      "--width": 200,
      duration: 100,
    });

    expect(getChildAtIndex(animation, 0)._tweenType).toEqual(
      tweenTypes.CSS_VAR
    );
  });

  it("Should get the Transform tween type with mixed transforms values", () => {
    const animation = createMotion("#target-id", {
      translateX: 100,
      translateY: 100,
      translateZ: 100,
      rotate: 100,
      rotateX: 100,
      rotateY: 100,
      rotateZ: 100,
      scale: 100,
      scaleX: 100,
      scaleY: 100,
      scaleZ: 100,
      skew: 100,
      skewX: 100,
      skewY: 100,
      perspective: 100,
      matrix: 100,
      matrix3d: 100,
      duration: 100,
    });

    animation.forEachChild((tween) => {
      expect(tween._tweenType).toEqual(tweenTypes.TRANSFORM);
    });
  });

  it("Should get the CSS tween type with mixed values", () => {
    const animation = createMotion(".with-inline-styles", {
      width: 50,
      height: 50,
      fontSize: 50,
      backgroundColor: "#FFF",
      duration: 100,
    });

    animation.forEachChild((tween) => {
      expect(tween._tweenType).toEqual(tweenTypes.CSS);
    });
  });

  it("Should get the Object tween type with input values", () => {
    const animation = createMotion("#input-number", {
      value: 50,
      duration: 100,
    });

    expect(getChildAtIndex(animation, 0)._tweenType).toEqual(tweenTypes.OBJECT);
  });

  it("Should get the Object tween type with plain JS object values", () => {
    const itObject = {
      plainValue: 20,
      valueWithUnit: "20px",
      multiplePLainValues: "32 64 128 256",
      multipleValuesWithUnits: "32px 64em 128% 25ch",
    };
    const animation = createMotion(itObject, {
      duration: 100,
    });

    animation.forEachChild((tween) => {
      expect(tween._tweenType).toEqual(tweenTypes.OBJECT);
    });
  });

  it("Should get the Object tween type with DOM properties that can't be accessed with getAttribute()", () => {
    const animation = createMotion("#target-id", {
      innerHTML: 9999,
      duration: 100,
    });

    expect(getChildAtIndex(animation, 0)._tweenType).toEqual(tweenTypes.OBJECT);
  });

  it("Should inherit the tweens timing", () => {
    const animation = createMotion("#target-id", {
      translateX: [
        {
          to: 50,
          delay: 15,
          duration: 10,
        },
        {
          to: 200,
          delay: 35,
          duration: 30,
        },
        {
          to: 350,
          delay: 15,
          duration: 10,
        },
      ],
    });

    // The first delay is not counted in the calculation of the total duration
    expect(animation.duration).toEqual(10 + 35 + 30 + 15 + 10);
    expect(animation.iterationDuration).toEqual(10 + 35 + 30 + 15 + 10);
  });

  it("Should end to their correct end position when seeked", async () => {
    /** @type {NodeListOf<HTMLElement>} */
    const targetClass = document.querySelectorAll(".target-class");
    const animation = createMotion(targetClass, {
      translateX: 270,
      delay: function (el, i) {
        return i * 10;
      },
      ease: "inOutSine",
      autoplay: false,
    });

    await new Promise<void>((resolve) => {
      const seeker = createMotionTimer({
        duration: 35,
        onUpdate: (self) => {
          animation.seek(self.progress * animation.duration);
        },
        onComplete: () => {
          expect(getComputedStyle(targetClass[0]).transform).toEqual(
            "translateX(270px)"
          );
          expect(getComputedStyle(targetClass[1]).transform).toEqual(
            "translateX(270px)"
          );
          expect(getComputedStyle(targetClass[2]).transform).toEqual(
            "translateX(270px)"
          );
          expect(getComputedStyle(targetClass[3]).transform).toEqual(
            "translateX(270px)"
          );
          animation.pause();
          resolve();
        },
      });
    });

    expect(getComputedStyle(targetClass[0]).transform).toEqual("translateX(0px)");
    expect(getComputedStyle(targetClass[1]).transform).toEqual("translateX(0px)");
    expect(getComputedStyle(targetClass[2]).transform).toEqual("translateX(0px)");
    expect(getComputedStyle(targetClass[3]).transform).toEqual("translateX(0px)");
  });

  it("Should end to their correct start position when seeked in reverse", async () => {
    /** @type {NodeListOf<HTMLElement>} */
    const targetClass = document.querySelectorAll(".target-class");
    const animation = createMotion(targetClass, {
      translateX: 270,
      // direction: 'reverse',
      reversed: true,
      ease: "linear",
      duration: 35,
      onComplete: () => {
        expect(getComputedStyle(targetClass[0]).transform).toEqual(
          "translateX(0px)"
        );
        expect(getComputedStyle(targetClass[1]).transform).toEqual(
          "translateX(0px)"
        );
        expect(getComputedStyle(targetClass[2]).transform).toEqual(
          "translateX(0px)"
        );
        expect(getComputedStyle(targetClass[3]).transform).toEqual(
          "translateX(0px)"
        );
      },
    });

    // Use async/await and Promise instead of direct resolve
    await new Promise<void>((resolve) => {
      // Set up resolve to be called on animation completion
      const originalOnComplete = animation.onComplete;
      animation.onComplete = function(this: any, ...args: any[]) {
        if (originalOnComplete) {
          originalOnComplete.apply(this, args);
        }
        resolve();
      };
      
      animation.seek(0);
    });

    expect(getComputedStyle(targetClass[0]).transform).toEqual(
      "translateX(270px)"
    );
    expect(getComputedStyle(targetClass[1]).transform).toEqual(
      "translateX(270px)"
    );
    expect(getComputedStyle(targetClass[2]).transform).toEqual(
      "translateX(270px)"
    );
    expect(getComputedStyle(targetClass[3]).transform).toEqual(
      "translateX(270px)"
    );
  });

  it("Should update the values when a tween is canceled", async () => {
    /** @type {HTMLElement} */
    const targetEl = document.querySelector("#target-id");
    const animation1 = createMotion(targetEl, {
      translateX: [
        { to: [0, 200], duration: 20 },
        { to: 300, duration: 20 },
      ],
    });

    await new Promise<void>((resolve) => {
      createMotionTimer({
        duration: 20,
        onComplete: () => {
          const animation2 = createMotion(targetEl, {
            translateX: -100,
            duration: 20,
          });
          
          setTimeout(() => {
            expect(getComputedStyle(targetEl).transform).toEqual(
              "translateX(-100px)"
            );
            resolve();
          }, 60);
        },
      });
    });
  });

  it("Should animate the progress of an animation with 0 duration tweens", async () => {
    const anim1 = createMotion(".target-class", {
      opacity: [0, 1],
      duration: 0,
      delay: (_, i) => i * 10,
      autoplay: false,
    });

    await new Promise<void>((resolve) => {
      createMotion(anim1, {
        progress: [0, 1],
        ease: "linear",
        duration: 40,
        onComplete: (self) => {
          expect(self.progress).toEqual(1);
          expect(self.currentTime).toEqual(inMotion.round(self.duration, 6));
          expect(anim1.progress).toEqual(1);
          expect(anim1.currentTime).toEqual(inMotion.round(anim1.duration, 6));
          resolve();
        },
      });
    });
  });

  it("Should have currentTime = 0 if not played", () => {
    const anim1 = createMotion(".target-class", {
      opacity: [0, 1],
      duration: 300,
      autoplay: false,
    });

    expect(anim1.currentTime).toEqual(0);
  });

  it("Should complete instantly if no animatable props provided", async () => {
    const anim1 = createMotion(".target-class", {
      duration: 15,
      loop: true,
    });

    await new Promise<void>((resolve) => {
      createMotionTimer({
        duration: 30,
        onComplete: (self) => {
          expect(anim1.duration).toEqual(minValue);
          expect(anim1.paused).toEqual(true);
          expect(anim1.completed).toEqual(true);
          resolve();
        },
      });
    });
  });

  it("Should have advanced by one frame imediatly after beeing played", async () => {
    const anim1 = createMotion(".target-class", {
      frameRate: 60,
      opacity: [0, 1],
      duration: 300,
      autoplay: false,
    });

    anim1.play();

    await new Promise<void>((resolve) => {
      createMotionTimer({
        duration: 1,
        onComplete: () => {
          expect(anim1.currentTime).toBeGreaterThanOrEqual(16);
          expect(anim1.currentTime).toBeLessThan(33);
          anim1.pause();
          resolve();
        },
      });
    });
  });

  it("Should get and createMotion animatable values", async () => {
    const animatable = createMotionAnimation("#target-id", {
      x: 20,
      y: 30,
      rotate: 40,
    });

    expect(animatable.x()).toEqual(0);
    expect(animatable.y()).toEqual(0);
    expect(animatable.rotate()).toEqual(0);

    const x = animatable.x(100);
    const y = animatable.y(150);
    const rotate = animatable.rotate(45);

    expect(animatable.animations.x.duration).toEqual(20);
    expect(animatable.animations.y.duration).toEqual(30);
    expect(animatable.animations.rotate.duration).toEqual(40);

    await new Promise<void>((resolve) => {
      createMotionTimer({
        duration: 50,
        onComplete: () => {
          expect(animatable.x()).toEqual(100);
          expect(animatable.y()).toEqual(150);
          expect(animatable.rotate()).toEqual(45);
          resolve();
        },
      });
    });
  });

  it("Should get and createMotion animatable complex values", async () => {
    const animatable = createMotionAnimation("#target-id", {
      backgroundColor: 20,
    });

    expect(animatable.backgroundColor()).toEqual([0, 214, 114, 1]);

    const bg = animatable.backgroundColor([100, 200, 0, 1]);

    expect(animatable.animations.backgroundColor.duration).toEqual(20);

    await new Promise<void>((resolve) => {
      createMotionTimer({
        duration: 50,
        onComplete: () => {
          expect(animatable.backgroundColor()).toEqual([100, 200, 0, 1]);
          resolve();
        },
      });
    });
  });

  it("Should get and set animatable values", () => {
    const animatable = createMotionAnimation("#target-id", {
      x: 0,
      y: 0,
      rotate: 0,
    });

    expect(animatable.x()).toEqual(0);
    expect(animatable.y()).toEqual(0);
    expect(animatable.rotate()).toEqual(0);

    animatable.x(100);
    animatable.y(150);
    animatable.rotate(45);

    expect(animatable.x()).toEqual(100);
    expect(animatable.y()).toEqual(150);
    expect(animatable.rotate()).toEqual(45);
  });

  it("Should define custom units for animatable values", async () => {
    const animatable = createMotionAnimation("#target-id", {
      x: { unit: "em" },
      y: { unit: "rem" },
      rotate: { unit: "rad", duration: 50 },
      duration: 40,
    });

    expect(animatable.x()).toEqual(0);
    expect(animatable.y()).toEqual(0);
    expect(animatable.rotate()).toEqual(0);

    animatable.x(10);
    animatable.y(15);
    animatable.rotate(1);

    await new Promise<void>((resolve) => {
      createMotionTimer({
        duration: 50,
        onComplete: () => {
          expect(animatable.x()).toEqual(10);
          expect(animatable.y()).toEqual(15);
          expect(animatable.rotate()).toEqual(1);
          expect(inMotion.get("#target-id", "x")).toEqual("10em");
          expect(inMotion.get("#target-id", "y")).toEqual("15rem");
          expect(inMotion.get("#target-id", "rotate")).toEqual("1rad");
          resolve();
        },
      });
    });
  });

  it("Should revert an animatable", () => {
    const animatable = createMotionAnimation("#target-id", {
      x: { unit: "em" },
      y: { unit: "rem" },
      rotate: { unit: "rad", duration: 50 },
      duration: 40,
    });

    expect(animatable.targets.length).toEqual(1);

    animatable.revert();

    expect(animatable.targets.length).toEqual(0);
    expect(animatable.animations.x).toEqual(undefined);
    expect(animatable.animations.y).toEqual(undefined);
    expect(animatable.animations.rotate).toEqual(undefined);
  });
});
