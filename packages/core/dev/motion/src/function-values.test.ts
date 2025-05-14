import { it, describe, expect } from "@inspatial/test";
import { createMotion, inSequence, inMotion } from "./index.ts";
import { valueTypes, minValue } from "./consts.ts";
import { getChildAtIndex, getTweenDelay } from "./utils/index.ts";

describe("InMotion Function based values", () => {
  it("Should call basic function based values", () => {
    /** @type {NodeListOf<HTMLElement>} */
    const $targets = document.querySelectorAll(".target-class");
    const animation = createMotion($targets, {
      autoplay: false,
      translateX: (el, i, total) => {
        return el.getAttribute("data-index");
      },
      duration: (el, i, total) => {
        const index = parseFloat(el.dataset.index);
        return total + (i + index) * 100;
      },
      delay: (el, i, total) => {
        const index = parseFloat(el.dataset.index);
        return total + (i + index) * 100;
      },
    });

    // Property value

    expect(getChildAtIndex(animation, 0)._fromNumber).toEqual(0);
    expect(getChildAtIndex(animation, 1)._fromNumber).toEqual(0);
    expect(getChildAtIndex(animation, 2)._fromNumber).toEqual(0);
    expect(getChildAtIndex(animation, 3)._fromNumber).toEqual(0);

    expect(getChildAtIndex(animation, 0)._valueType).toEqual(valueTypes.UNIT);
    expect(getChildAtIndex(animation, 1)._valueType).toEqual(valueTypes.UNIT);
    expect(getChildAtIndex(animation, 2)._valueType).toEqual(valueTypes.UNIT);
    expect(getChildAtIndex(animation, 3)._valueType).toEqual(valueTypes.UNIT);

    expect(getChildAtIndex(animation, 0)._toNumber).toEqual(0);
    expect(getChildAtIndex(animation, 1)._toNumber).toEqual(1);
    expect(getChildAtIndex(animation, 2)._toNumber).toEqual(2);
    expect(getChildAtIndex(animation, 3)._toNumber).toEqual(3);

    expect(getChildAtIndex(animation, 0)._unit).toEqual("px");
    expect(getChildAtIndex(animation, 1)._unit).toEqual("px");
    expect(getChildAtIndex(animation, 2)._unit).toEqual("px");
    expect(getChildAtIndex(animation, 3)._unit).toEqual("px");

    expect($targets[0].style.transform).toEqual("translateX(0px)");
    expect($targets[1].style.transform).toEqual("translateX(0px)");
    expect($targets[2].style.transform).toEqual("translateX(0px)");
    expect($targets[3].style.transform).toEqual("translateX(0px)");

    animation.seek(animation.duration);

    expect($targets[0].style.transform).toEqual("translateX(0px)");
    expect($targets[1].style.transform).toEqual("translateX(1px)");
    expect($targets[2].style.transform).toEqual("translateX(2px)");
    expect($targets[3].style.transform).toEqual("translateX(3px)");

    // Duration
    expect(getChildAtIndex(animation, 0)._changeDuration).toEqual(4);
    expect(getChildAtIndex(animation, 1)._changeDuration).toEqual(204);
    expect(getChildAtIndex(animation, 2)._changeDuration).toEqual(404);
    expect(getChildAtIndex(animation, 3)._changeDuration).toEqual(604);

    // Delay
    expect(getTweenDelay(getChildAtIndex(animation, 0))).toEqual(0);
    expect(getTweenDelay(getChildAtIndex(animation, 1))).toEqual(200);
    expect(getTweenDelay(getChildAtIndex(animation, 2))).toEqual(400);
    expect(getTweenDelay(getChildAtIndex(animation, 3))).toEqual(600);
  });

  it("Should call function based keyframes values", () => {
    const $targets = document.querySelectorAll(".target-class");
    const animation = createMotion($targets, {
      autoplay: false,
      translateX: [
        {
          to: (el) => el.getAttribute("data-index") * 100,
          duration: inSequence(100),
          delay: inSequence(100),
        },
        {
          to: (el) => el.getAttribute("data-index") * 50,
          duration: inSequence(100),
          delay: inSequence(100),
        },
      ],
    });

    // Values
    expect(getChildAtIndex(animation, 0 * 2)._toNumber).toEqual(0);
    expect(getChildAtIndex(animation, 1 * 2)._toNumber).toEqual(100);
    expect(getChildAtIndex(animation, 2 * 2)._toNumber).toEqual(200);
    expect(getChildAtIndex(animation, 3 * 2)._toNumber).toEqual(300);

    expect(getChildAtIndex(animation, 0 * 2 + 1)._toNumber).toEqual(0);
    expect(getChildAtIndex(animation, 1 * 2 + 1)._toNumber).toEqual(50);
    expect(getChildAtIndex(animation, 2 * 2 + 1)._toNumber).toEqual(100);
    expect(getChildAtIndex(animation, 3 * 2 + 1)._toNumber).toEqual(150);

    // Duration
    expect(getChildAtIndex(animation, 0 * 2)._changeDuration).toEqual(minValue);
    expect(getChildAtIndex(animation, 1 * 2)._changeDuration).toEqual(100);
    expect(getChildAtIndex(animation, 2 * 2)._changeDuration).toEqual(200);
    expect(getChildAtIndex(animation, 3 * 2)._changeDuration).toEqual(300);

    expect(getChildAtIndex(animation, 0 * 2 + 1)._changeDuration).toEqual(
      minValue
    );
    expect(getChildAtIndex(animation, 1 * 2 + 1)._changeDuration).toEqual(100);
    expect(getChildAtIndex(animation, 2 * 2 + 1)._changeDuration).toEqual(200);
    expect(getChildAtIndex(animation, 3 * 2 + 1)._changeDuration).toEqual(300);

    // Delay
    expect(getTweenDelay(getChildAtIndex(animation, 0 * 2))).toEqual(0);
    expect(getTweenDelay(getChildAtIndex(animation, 1 * 2))).toEqual(100);
    expect(getTweenDelay(getChildAtIndex(animation, 2 * 2))).toEqual(200);
    expect(getTweenDelay(getChildAtIndex(animation, 3 * 2))).toEqual(300);

    expect(getTweenDelay(getChildAtIndex(animation, 0 * 2 + 1))).toEqual(0);
    expect(getTweenDelay(getChildAtIndex(animation, 1 * 2 + 1))).toEqual(100);
    expect(getTweenDelay(getChildAtIndex(animation, 2 * 2 + 1))).toEqual(200);
    expect(getTweenDelay(getChildAtIndex(animation, 3 * 2 + 1))).toEqual(300);
  });

  it("Should call function based string values -> number conversion", () => {
    const $targets = document.querySelectorAll(".target-class");
    const animation = createMotion($targets, {
      autoplay: false,
      translateX: 10,
      delay: ($el) => $el.dataset.index,
    });

    // Delay
    expect(getTweenDelay(getChildAtIndex(animation, 0))).toEqual(0);
    expect(getTweenDelay(getChildAtIndex(animation, 1))).toEqual(1);
    expect(getTweenDelay(getChildAtIndex(animation, 2))).toEqual(2);
    expect(getTweenDelay(getChildAtIndex(animation, 3))).toEqual(3);
  });

  it("Should call function based values returns from to Array values", () => {
    const $targets = document.querySelectorAll(".target-class");
    const animation = createMotion($targets, {
      autoplay: false,
      translateX: ($el, i, t) => [$el.dataset.index, t - 1 - i],
    });

    // From
    expect(getChildAtIndex(animation, 0)._fromNumber).toEqual(0);
    expect(getChildAtIndex(animation, 1)._fromNumber).toEqual(1);
    expect(getChildAtIndex(animation, 2)._fromNumber).toEqual(2);
    expect(getChildAtIndex(animation, 3)._fromNumber).toEqual(3);

    // To
    expect(getChildAtIndex(animation, 0)._toNumber).toEqual(3);
    expect(getChildAtIndex(animation, 1)._toNumber).toEqual(2);
    expect(getChildAtIndex(animation, 2)._toNumber).toEqual(1);
    expect(getChildAtIndex(animation, 3)._toNumber).toEqual(0);
  });

  it("Should call function based values in from to Array values", () => {
    const $targets = document.querySelectorAll(".target-class");
    const animation = createMotion($targets, {
      autoplay: false,
      translateX: [($el, i, t) => $el.dataset.index, ($el, i, t) => t - 1 - i],
    });

    // From
    expect(getChildAtIndex(animation, 0)._fromNumber).toEqual(0);
    expect(getChildAtIndex(animation, 1)._fromNumber).toEqual(1);
    expect(getChildAtIndex(animation, 2)._fromNumber).toEqual(2);
    expect(getChildAtIndex(animation, 3)._fromNumber).toEqual(3);

    // To
    expect(getChildAtIndex(animation, 0)._toNumber).toEqual(3);
    expect(getChildAtIndex(animation, 1)._toNumber).toEqual(2);
    expect(getChildAtIndex(animation, 2)._toNumber).toEqual(1);
    expect(getChildAtIndex(animation, 3)._toNumber).toEqual(0);
  });
});
