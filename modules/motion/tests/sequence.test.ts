import { describe, it, expect } from "@inspatial/test";
import { getChildAtIndex, getTweenDelay } from "../src/utils/index.ts";
import { createMotion, createMotionTimeline, inSequence } from "../src/index.ts";

describe("InMotion Sequence", () => {
  it("Should increase each values by a specific value for each elements", () => {
    const animation = createMotion(".target-class", {
      translateX: 100,
      duration: 10,
      delay: inSequence(10),
      autoplay: false,
    });
    expect(getTweenDelay(getChildAtIndex(animation, 0))).toEqual(0);
    expect(getTweenDelay(getChildAtIndex(animation, 1))).toEqual(10);
    expect(getTweenDelay(getChildAtIndex(animation, 2))).toEqual(20);
    expect(getTweenDelay(getChildAtIndex(animation, 3))).toEqual(30);
  });

  it("Should increase each values by a specific value with unit for each elements", () => {
    const inSequenceClass = document.querySelectorAll("#inSequence div");
    const animation = createMotion(inSequenceClass, {
      translateX: inSequence("1rem"),
      duration: 10,
      autoplay: false,
    });

    animation.seek(animation.duration);

    expect(getComputedStyle(inSequenceClass[0]).transform).toEqual(
      "translateX(0rem)"
    );
    expect(getComputedStyle(inSequenceClass[1]).transform).toEqual(
      "translateX(1rem)"
    );
    expect(getComputedStyle(inSequenceClass[2]).transform).toEqual(
      "translateX(2rem)"
    );
    expect(getComputedStyle(inSequenceClass[3]).transform).toEqual(
      "translateX(3rem)"
    );
    expect(getComputedStyle(inSequenceClass[4]).transform).toEqual(
      "translateX(4rem)"
    );
  });

  it("Should starts the sequenceing effect from a specific value", () => {
    const animation = createMotion(".target-class", {
      translateX: 100,
      duration: 10,
      delay: inSequence(10, { start: 5 }),
      autoplay: false,
    });
    expect(getTweenDelay(getChildAtIndex(animation, 0))).toEqual(0);
    expect(getTweenDelay(getChildAtIndex(animation, 1))).toEqual(10);
    expect(getTweenDelay(getChildAtIndex(animation, 2))).toEqual(20);
    expect(getTweenDelay(getChildAtIndex(animation, 3))).toEqual(30);
  });

  it("Should distribute evenly values between two numbers", () => {
    /** @type {NodeListOf<HTMLElement>} */
    const inSequenceClass = document.querySelectorAll("#inSequence div");
    const animation = createMotion(inSequenceClass, {
      translateX: inSequence([-10, 10]),
      duration: 10,
      autoplay: false,
    });

    animation.seek(animation.duration);

    expect(getChildAtIndex(animation, 0)._toNumber).toEqual(-10);
    expect(getChildAtIndex(animation, 1)._toNumber).toEqual(-5);
    expect(getChildAtIndex(animation, 2)._toNumber).toEqual(0);
    expect(getChildAtIndex(animation, 3)._toNumber).toEqual(5);
    expect(getChildAtIndex(animation, 4)._toNumber).toEqual(10);

    expect(getComputedStyle(inSequenceClass[0]).transform).toEqual(
      "translateX(-10px)"
    );
    expect(getComputedStyle(inSequenceClass[1]).transform).toEqual(
      "translateX(-5px)"
    );
    expect(getComputedStyle(inSequenceClass[2]).transform).toEqual(
      "translateX(0px)"
    );
    expect(getComputedStyle(inSequenceClass[3]).transform).toEqual(
      "translateX(5px)"
    );
    expect(getComputedStyle(inSequenceClass[4]).transform).toEqual(
      "translateX(10px)"
    );
  });

  it("Should specify the sequenceed ranged value unit", () => {
    /** @type {NodeListOf<HTMLElement>} */
    const inSequenceClass = document.querySelectorAll("#inSequence div");
    const animation = createMotion(inSequenceClass, {
      translateX: inSequence(["-10rem", "10rem"]),
      duration: 10,
      autoplay: false,
    });

    animation.seek(animation.duration);

    expect(getComputedStyle(inSequenceClass[0]).transform).toEqual(
      "translateX(-10rem)"
    );
    expect(getComputedStyle(inSequenceClass[1]).transform).toEqual(
      "translateX(-5rem)"
    );
    expect(getComputedStyle(inSequenceClass[2]).transform).toEqual(
      "translateX(0rem)"
    );
    expect(getComputedStyle(inSequenceClass[3]).transform).toEqual(
      "translateX(5rem)"
    );
    expect(getComputedStyle(inSequenceClass[4]).transform).toEqual(
      "translateX(10rem)"
    );
  });

  it("Should starts the sequence effect from the center", () => {
    const animation = createMotion("#inSequence div", {
      translateX: 10,
      delay: inSequence(10, { from: "center" }),
      autoplay: false,
    });
    expect(getTweenDelay(getChildAtIndex(animation, 0))).toEqual(20);
    expect(getTweenDelay(getChildAtIndex(animation, 1))).toEqual(10);
    expect(getTweenDelay(getChildAtIndex(animation, 2))).toEqual(0);
    expect(getTweenDelay(getChildAtIndex(animation, 3))).toEqual(10);
    expect(getTweenDelay(getChildAtIndex(animation, 4))).toEqual(20);
  });

  it("Should starts the sequence effect from the last element", () => {
    const animation = createMotion("#inSequence div", {
      translateX: 10,
      delay: inSequence(10, { from: "last" }),
      autoplay: false,
    });
    expect(getTweenDelay(getChildAtIndex(animation, 0))).toEqual(40);
    expect(getTweenDelay(getChildAtIndex(animation, 1))).toEqual(30);
    expect(getTweenDelay(getChildAtIndex(animation, 2))).toEqual(20);
    expect(getTweenDelay(getChildAtIndex(animation, 3))).toEqual(10);
    expect(getTweenDelay(getChildAtIndex(animation, 4))).toEqual(0);
  });

  it("Should starts the sequence effect from specific index", () => {
    const animation = createMotion("#inSequence div", {
      translateX: 10,
      delay: inSequence(10, { from: 1 }),
      autoplay: false,
    });
    expect(getTweenDelay(getChildAtIndex(animation, 0))).toEqual(10);
    expect(getTweenDelay(getChildAtIndex(animation, 1))).toEqual(0);
    expect(getTweenDelay(getChildAtIndex(animation, 2))).toEqual(10);
    expect(getTweenDelay(getChildAtIndex(animation, 3))).toEqual(20);
    expect(getTweenDelay(getChildAtIndex(animation, 4))).toEqual(30);
  });

  it("Should changes the order in which the sequence operates", () => {
    const animation = createMotion("#inSequence div", {
      translateX: 10,
      delay: inSequence(10, { from: 1, reversed: true }),
      autoplay: false,
    });
    expect(getTweenDelay(getChildAtIndex(animation, 0))).toEqual(20);
    expect(getTweenDelay(getChildAtIndex(animation, 1))).toEqual(30);
    expect(getTweenDelay(getChildAtIndex(animation, 2))).toEqual(20);
    expect(getTweenDelay(getChildAtIndex(animation, 3))).toEqual(10);
    expect(getTweenDelay(getChildAtIndex(animation, 4))).toEqual(0);
  });

  it("Should sequence values using an ease function", () => {
    const animation = createMotion("#inSequence div", {
      translateX: 10,
      delay: inSequence(10, { ease: "inOutQuad" }),
      autoplay: false,
    });
    expect(getTweenDelay(getChildAtIndex(animation, 0))).toEqual(0);
    expect(getTweenDelay(getChildAtIndex(animation, 1))).toEqual(5);
    expect(getTweenDelay(getChildAtIndex(animation, 2))).toEqual(20);
    expect(getTweenDelay(getChildAtIndex(animation, 3))).toEqual(35);
    expect(getTweenDelay(getChildAtIndex(animation, 4))).toEqual(40);
  });

  it("Should sequence values on 0 duration animations", () => {
    /** @type {NodeListOf<HTMLElement>} */
    const inSequenceClass = document.querySelectorAll("#grid div");
    const animation = createMotion(inSequenceClass, {
      opacity: 0,
      duration: 0,
      autoplay: false,
      delay: inSequence(100),
    });
    animation.seek(animation.duration);
    expect(getComputedStyle(inSequenceClass[0]).opacity).toEqual("0");
    expect(getComputedStyle(inSequenceClass[1]).opacity).toEqual("0");
    expect(getComputedStyle(inSequenceClass[2]).opacity).toEqual("0");
    expect(getComputedStyle(inSequenceClass[3]).opacity).toEqual("0");
    expect(getComputedStyle(inSequenceClass[4]).opacity).toEqual("0");
    expect(getComputedStyle(inSequenceClass[5]).opacity).toEqual("0");
    expect(getComputedStyle(inSequenceClass[6]).opacity).toEqual("0");
    expect(getComputedStyle(inSequenceClass[7]).opacity).toEqual("0");
    expect(getComputedStyle(inSequenceClass[8]).opacity).toEqual("0");
    expect(getComputedStyle(inSequenceClass[9]).opacity).toEqual("0");
    expect(getComputedStyle(inSequenceClass[10]).opacity).toEqual("0");
    expect(getComputedStyle(inSequenceClass[11]).opacity).toEqual("0");
    expect(getComputedStyle(inSequenceClass[12]).opacity).toEqual("0");
    expect(getComputedStyle(inSequenceClass[13]).opacity).toEqual("0");
    expect(getComputedStyle(inSequenceClass[14]).opacity).toEqual("0");
  });

  it("Should sequence grid values with a 2D array", () => {
    const animation = createMotion("#grid div", {
      scale: [1, 0],
      delay: inSequence(10, { grid: [5, 3], from: "center" }),
      autoplay: false,
    });

    expect(getTweenDelay(getChildAtIndex(animation, 0))).toBeCloseTo(
      22.4,
      0.0001
    );
    expect(getTweenDelay(getChildAtIndex(animation, 1))).toBeCloseTo(
      14.1,
      0.01
    );
    expect(getTweenDelay(getChildAtIndex(animation, 2))).toEqual(10);
    expect(getTweenDelay(getChildAtIndex(animation, 3))).toBeCloseTo(
      14.1,
      0.01
    );
    expect(getTweenDelay(getChildAtIndex(animation, 4))).toBeCloseTo(
      22.4,
      0.0001
    );

    expect(getTweenDelay(getChildAtIndex(animation, 5))).toEqual(20);
    expect(getTweenDelay(getChildAtIndex(animation, 6))).toEqual(10);
    expect(getTweenDelay(getChildAtIndex(animation, 7))).toEqual(0);
    expect(getTweenDelay(getChildAtIndex(animation, 8))).toEqual(10);
    expect(getTweenDelay(getChildAtIndex(animation, 9))).toEqual(20);

    expect(getTweenDelay(getChildAtIndex(animation, 10))).toBeCloseTo(
      22.4,
      0.0001
    );
    expect(getTweenDelay(getChildAtIndex(animation, 11))).toBeCloseTo(
      14.1,
      0.01
    );
    expect(getTweenDelay(getChildAtIndex(animation, 12))).toEqual(10);
    expect(getTweenDelay(getChildAtIndex(animation, 13))).toBeCloseTo(
      14.1,
      0.01
    );
    expect(getTweenDelay(getChildAtIndex(animation, 14))).toBeCloseTo(
      22.4,
      0.0001
    );
  });

  it("Should sequence grid values with a 2D array and axis parameters", () => {
    const animation = createMotion("#grid div", {
      translateX: inSequence(10, { grid: [5, 3], from: "center", axis: "x" }),
      translateY: inSequence(10, { grid: [5, 3], from: "center", axis: "y" }),
      autoplay: false,
    });

    expect(getChildAtIndex(animation, 0)._toNumber).toEqual(-20);
    expect(getChildAtIndex(animation, 2)._toNumber).toEqual(-10);
    expect(getChildAtIndex(animation, 4)._toNumber).toEqual(0);
    expect(getChildAtIndex(animation, 6)._toNumber).toEqual(10);
    expect(getChildAtIndex(animation, 8)._toNumber).toEqual(20);

    expect(getChildAtIndex(animation, 10)._toNumber).toEqual(-20);
    expect(getChildAtIndex(animation, 12)._toNumber).toEqual(-10);
    expect(getChildAtIndex(animation, 14)._toNumber).toEqual(0);
    expect(getChildAtIndex(animation, 16)._toNumber).toEqual(10);
    expect(getChildAtIndex(animation, 18)._toNumber).toEqual(20);

    expect(getChildAtIndex(animation, 20)._toNumber).toEqual(-20);
    expect(getChildAtIndex(animation, 22)._toNumber).toEqual(-10);
    expect(getChildAtIndex(animation, 24)._toNumber).toEqual(0);
    expect(getChildAtIndex(animation, 26)._toNumber).toEqual(10);
    expect(getChildAtIndex(animation, 28)._toNumber).toEqual(20);

    expect(getChildAtIndex(animation, 1)._toNumber).toEqual(-10);
    expect(getChildAtIndex(animation, 3)._toNumber).toEqual(-10);
    expect(getChildAtIndex(animation, 5)._toNumber).toEqual(-10);
    expect(getChildAtIndex(animation, 7)._toNumber).toEqual(-10);
    expect(getChildAtIndex(animation, 9)._toNumber).toEqual(-10);

    expect(getChildAtIndex(animation, 11)._toNumber).toEqual(0);
    expect(getChildAtIndex(animation, 13)._toNumber).toEqual(0);
    expect(getChildAtIndex(animation, 15)._toNumber).toEqual(0);
    expect(getChildAtIndex(animation, 17)._toNumber).toEqual(0);
    expect(getChildAtIndex(animation, 19)._toNumber).toEqual(0);

    expect(getChildAtIndex(animation, 21)._toNumber).toEqual(10);
    expect(getChildAtIndex(animation, 23)._toNumber).toEqual(10);
    expect(getChildAtIndex(animation, 25)._toNumber).toEqual(10);
    expect(getChildAtIndex(animation, 27)._toNumber).toEqual(10);
    expect(getChildAtIndex(animation, 29)._toNumber).toEqual(10);
  });

  it("Should sequence timeline positions", () => {
    const tl = createMotionTimeline({
      defaults: { duration: 10 },
      autoplay: false,
    }).add(
      ".target-class",
      { id: "inSequenced", translateX: 50 },
      inSequence(100)
    );

    expect(getChildAtIndex(tl, 0)._offset).toEqual(0);
    expect(getChildAtIndex(tl, 1)._offset).toEqual(100);
    expect(getChildAtIndex(tl, 2)._offset).toEqual(200);
    expect(getChildAtIndex(tl, 3)._offset).toEqual(300);
    expect(getChildAtIndex(tl, 0).id).toEqual("inSequenced-0");
    expect(getChildAtIndex(tl, 1).id).toEqual("inSequenced-1");
    expect(getChildAtIndex(tl, 2).id).toEqual("inSequenced-2");
    expect(getChildAtIndex(tl, 3).id).toEqual("inSequenced-3");
    expect(tl.duration).toEqual(310); // 300 + 10
  });

  it("Should sequence timeline positions with custom start value", () => {
    const tl = createMotionTimeline({
      defaults: { duration: 10 },
      autoplay: false,
    }).add(
      ".target-class",
      { id: "inSequenced", translateX: 50 },
      inSequence(100, { start: 100 })
    );

    expect(getChildAtIndex(tl, 0)._offset).toEqual(100);
    expect(getChildAtIndex(tl, 1)._offset).toEqual(200);
    expect(getChildAtIndex(tl, 2)._offset).toEqual(300);
    expect(getChildAtIndex(tl, 3)._offset).toEqual(400);
    expect(getChildAtIndex(tl, 0).id).toEqual("inSequenced-0");
    expect(getChildAtIndex(tl, 1).id).toEqual("inSequenced-1");
    expect(getChildAtIndex(tl, 2).id).toEqual("inSequenced-2");
    expect(getChildAtIndex(tl, 3).id).toEqual("inSequenced-3");
    expect(tl.duration).toEqual(410); // 400 + 10
  });

  it("Should sequence timeline positions with a label as start value", () => {
    const tl = createMotionTimeline({
      defaults: { duration: 10 },
      autoplay: false,
    })
      .label("LABEL", 100)
      .add(
        ".target-class",
        { id: "inSequenced", translateX: 50 },
        inSequence(100, { start: "LABEL" })
      );

    expect(getChildAtIndex(tl, 0)._offset).toEqual(100);
    expect(getChildAtIndex(tl, 1)._offset).toEqual(200);
    expect(getChildAtIndex(tl, 2)._offset).toEqual(300);
    expect(getChildAtIndex(tl, 3)._offset).toEqual(400);
    expect(getChildAtIndex(tl, 0).id).toEqual("inSequenced-0");
    expect(getChildAtIndex(tl, 1).id).toEqual("inSequenced-1");
    expect(getChildAtIndex(tl, 2).id).toEqual("inSequenced-2");
    expect(getChildAtIndex(tl, 3).id).toEqual("inSequenced-3");
    expect(tl.duration).toEqual(410); // 400 + 10
  });

  it("Should sequence timeline values", () => {
    const tl = createMotionTimeline({
      defaults: { duration: 10 },
      autoplay: false,
    }).add(
      ".target-class",
      { id: "inSequenced", translateX: inSequence(100, { from: "last" }) },
      inSequence(100)
    );

    expect(getChildAtIndex(tl, 0)._head._toNumber).toEqual(300);
    expect(getChildAtIndex(tl, 1)._head._toNumber).toEqual(200);
    expect(getChildAtIndex(tl, 2)._head._toNumber).toEqual(100);
    expect(getChildAtIndex(tl, 3)._head._toNumber).toEqual(0);
  });
});
