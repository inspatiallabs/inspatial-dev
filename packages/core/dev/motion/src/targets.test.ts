import { describe, it, expect } from "@inspatial/test";
import { getChildLength } from "./utils/index.ts";
import { createMotion } from "./index.ts";

/*################################(VARIABLES)################################*/
const testObject = {
  x: 100,
};

const anOtherTestObject = {
  x: 200,
};

/*################################(TESTS)################################*/
describe("Targets", () => {
  it("Should create a single element from CSS selector", () => {
    const animation = createMotion("#target-id", {
      x: 100,
      duration: 100,
    });

    const targetEl = document.querySelector("#target-id");
    expect(getChildLength(animation)).toEqual(1);
    expect(animation.targets.includes(targetEl)).toEqual(true);
    expect(animation.targets.length).toEqual(1);
  });

  it("Should create multiple elements from CSS selector", () => {
    const animation = createMotion(".target-class", {
      x: 100,
      duration: 100,
    });

    const targetEls = document.querySelectorAll(".target-class");
    expect(getChildLength(animation)).toEqual(4);
    let i = 0;
    animation.targets.forEach((el) => {
      expect(targetEls[i++]).toEqual(el);
    });
  });

  it("Should create a single element from domNode", () => {
    const targetEl = document.querySelector("#target-id");
    const animation = createMotion(targetEl, {
      x: 100,
      duration: 100,
    });

    expect(getChildLength(animation)).toEqual(1);
    expect(animation.targets.includes(targetEl)).toEqual(true);
    expect(animation.targets.length).toEqual(1);
  });

  it("Should create multiple elements from nodeList", () => {
    const targetEls = document.querySelectorAll(".target-class");
    const animation = createMotion(targetEls, {
      x: 100,
      duration: 100,
    });

    expect(getChildLength(animation)).toEqual(4);
    let i = 0;
    animation.targets.forEach((el) => {
      expect(targetEls[i++]).toEqual(el);
    });
  });

  it("Should create a single object from JS Object", () => {
    const animation = createMotion(testObject, {
      plainValue: 200,
      duration: 100,
    });

    expect(getChildLength(animation)).toEqual(1);
    expect(animation.targets.includes(testObject)).toEqual(true);
    expect(animation.targets.length).toEqual(1);
  });

  it("Should create multiple elements from an Array of mixed CSS selectors", () => {
    const animation = createMotion(
      ["#target-id", ".target-class", 'div[data-index="0"]'],
      {
        x: 100,
        duration: 100,
      }
    );

    const targetIdEl = document.querySelector("#target-id");
    const targetClassEls = document.querySelectorAll(".target-class");
    const targetDataEl = document.querySelector('div[data-index="0"]');
    expect(getChildLength(animation)).toEqual(4);
    expect(animation.targets.includes(targetIdEl)).toEqual(true);
    expect(animation.targets.includes(targetDataEl)).toEqual(true);
    let i = 0;
    animation.targets.forEach((el) => {
      expect(targetClassEls[i++]).toEqual(el);
    });
  });

  it("Should create multiple elements and object from an Array of mixed target types", () => {
    const targetClassEls = document.querySelectorAll(".target-class");
    const animation = createMotion(
      [testObject, "#target-id", targetClassEls, 'div[data-index="0"]'],
      {
        x: 100,
        duration: 100,
      }
    );

    const targetIdEl = document.querySelector("#target-id");
    const targetDataEl = document.querySelector('div[data-index="0"]');
    expect(getChildLength(animation)).toEqual(5);
    expect(animation.targets.includes(testObject)).toEqual(true);
    expect(animation.targets.includes(targetIdEl)).toEqual(true);
    expect(animation.targets.includes(targetDataEl)).toEqual(true);
    expect(animation.targets.length).toEqual(5);
  });

  it("Should create multiple elements in nested arrays", () => {
    const targetClassEls = document.querySelectorAll(".target-class");
    const targetIdEl = document.querySelector("#target-id");
    const animation = createMotion(
      [targetClassEls, targetIdEl, [testObject, anOtherTestObject]],
      {
        x: 100,
        duration: 100,
      }
    );
    expect(getChildLength(animation)).toEqual(6);
    expect(animation.targets.includes(testObject)).toEqual(true);
    expect(animation.targets.includes(anOtherTestObject)).toEqual(true);
    expect(animation.targets.includes(targetIdEl)).toEqual(true);
    expect(animation.targets.length).toEqual(6);
  });

  it("Should create multiple elements in arrays with null or undefined values", () => {
    const targetClassEls = document.querySelectorAll(".target-class");
    const targetIdEl = document.querySelector("#target-id");
    const animation = createMotion(
      [testObject, anOtherTestObject, null, undefined],
      {
        x: 100,
        duration: 100,
      }
    );
    expect(getChildLength(animation)).toEqual(2);
    expect(animation.targets.includes(testObject)).toEqual(true);
    expect(animation.targets.includes(anOtherTestObject)).toEqual(true);
    expect(animation.targets.length).toEqual(2);
  });

  it("Should create multiple elements in nested arrays with null or undefined values", () => {
    const targetClassEls = document.querySelectorAll(".target-class");
    const targetIdEl = document.querySelector("#target-id");
    const animation = createMotion(
      [
        targetClassEls,
        targetIdEl,
        [testObject, anOtherTestObject, null, undefined],
        null,
        undefined,
      ],
      {
        x: 100,
        duration: 100,
      }
    );
    expect(getChildLength(animation)).toEqual(6);
    expect(animation.targets.includes(testObject)).toEqual(true);
    expect(animation.targets.includes(anOtherTestObject)).toEqual(true);
    expect(animation.targets.includes(targetIdEl)).toEqual(true);
    expect(animation.targets.length).toEqual(6);
  });

  it("Should properly handle animations without targets", () => {
    const animation = createMotion(undefined, { duration: 10 });
    expect(animation.targets).toEqual([]);
  });
});
