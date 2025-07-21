import { describe, it, expect } from "@inspatial/test";
import { inMotion, createMotion, createMotionTimeline } from "../src/index.ts";
import { getChildAtIndex, getChildLength } from "../src/utils/index.ts";
import { addChild, removeChild } from "../src/helpers.ts";

/*#########################################(VAR)#########################################*/
const testObject = {
  plainValue: 10,
  valueWithUnit: "10px",
  multiplePLainValues: "16 32 64 128",
  multipleValuesWithUnits: "16px 32em 64% 128ch",
};

const anOtherTestObject = {
  plainValue: 200,
  duration: 100,
};

/*#########################################(TEST)#########################################*/

describe("InMotion Utils", () => {
  it("Should get a single DOM element", () => {
    const [$target] = inMotion.$("#target-id");
    expect($target).toEqual(document.querySelector("#target-id"));
  });

  it("Should get a multiple DOM elements", () => {
    const targets = inMotion.$(".target-class");
    const $query = document.querySelectorAll(".target-class");
    expect(targets).toEqual([$query[0], $query[1], $query[2], $query[3]]);
  });

  it("Should get Object properties", () => {
    const plainValue = inMotion.get(testObject, "plainValue");
    const valueWithUnit = inMotion.get(testObject, "valueWithUnit");
    const multiplePLainValues = inMotion.get(testObject, "multiplePLainValues");
    const multipleValuesWithUnits = inMotion.get(
      testObject,
      "multipleValuesWithUnits"
    );

    expect(plainValue).toEqual(10);
    expect(valueWithUnit).toEqual("10px");
    expect(multiplePLainValues).toEqual("16 32 64 128");
    expect(multipleValuesWithUnits).toEqual("16px 32em 64% 128ch");
  });

  it("Should return an empty array if the targets don't exist", () => {
    const targets = inMotion.$(".targets-doesnt-exist");
    expect(targets).toEqual([]);
  });

  it("Should set Object properties", () => {
    inMotion.set(testObject, {
      plainValue: 42,
      valueWithUnit: "42px",
      multiplePLainValues: "40 41 42 43",
      multipleValuesWithUnits: "40px 41em 42% 43ch",
    });

    expect(testObject.plainValue).toEqual(42);
    expect(testObject.valueWithUnit).toEqual("42px");
    expect(testObject.multiplePLainValues).toEqual("40 41 42 43");
    expect(testObject.multipleValuesWithUnits).toEqual("40px 41em 42% 43ch");
  });

  it("Should get DOM attributes", () => {
    const withWithAttributeWidth = inMotion.get(
      ".with-width-attribute",
      "width"
    );
    const withWithAttributeIndex = inMotion.get(
      ".with-width-attribute",
      "data-index"
    );
    const inputNumberMin = inMotion.get("#input-number", "min");
    const inputNumberMax = inMotion.get("#input-number", "max");

    expect(withWithAttributeWidth).toEqual("16px"); // 1rem
    expect(withWithAttributeIndex).toEqual("1");
    expect(inputNumberMin).toEqual("0");
    expect(inputNumberMax).toEqual("100");
  });

  it("Should set DOM attributes", () => {
    inMotion.set(".with-width-attribute", {
      width: 41,
      "data-index": 42,
    });

    inMotion.set("#input-number", {
      min: 41,
      max: 42,
    });

    const withWithAttributeWidth = inMotion.get(
      ".with-width-attribute",
      "width"
    );
    const withWithAttributeIndex = inMotion.get(
      ".with-width-attribute",
      "data-index"
    );
    const inputNumberMin = inMotion.get("#input-number", "min");
    const inputNumberMax = inMotion.get("#input-number", "max");

    expect(withWithAttributeWidth).toEqual("41px");
    expect(withWithAttributeIndex).toEqual("42");
    expect(inputNumberMin).toEqual("41");
    expect(inputNumberMax).toEqual("42");
  });

  it("Should get CSS properties", () => {
    const targetIdWidth = inMotion.get("#target-id", "width");
    const cssPrpertiesWidth = inMotion.get(".css-properties", "width");
    const withInlineStylesWidth = inMotion.get(".with-inline-styles", "width");

    expect(targetIdWidth).toEqual("16px"); // 1rem
    expect(cssPrpertiesWidth).toEqual("150px");
    expect(withInlineStylesWidth).toEqual("200px");
  });

  it("Should set CSS properties", () => {
    inMotion.set(["#target-id", ".css-properties", ".with-inline-styles"], {
      width: 42,
    });

    expect(inMotion.get("#target-id", "width")).toEqual("42px");
    expect(inMotion.get(".css-properties", "width")).toEqual("42px");
    expect(inMotion.get(".with-inline-styles", "width")).toEqual("42px");
  });

  it("Should get CSS transforms", () => {
    inMotion.set(["#target-id", ".with-inline-transforms"], {
      translateX: 41,
      translateY: 1, // has inline rem unit
      rotate: 42,
      scale: 1,
    });

    expect(inMotion.get(".with-inline-transforms", "translateX")).toEqual(
      "41px"
    );
    expect(inMotion.get(".with-inline-transforms", "translateY")).toEqual(
      "1rem"
    );
    expect(inMotion.get(".with-inline-transforms", "rotate")).toEqual("42deg");
    expect(inMotion.get(".with-inline-transforms", "scale")).toEqual("1");
  });

  it("Should get CSS transforms", () => {
    expect(inMotion.get(".with-inline-transforms", "translateX")).toEqual(
      "10px"
    );
    expect(inMotion.get(".with-inline-transforms", "translateY")).toEqual(
      "-0.5rem"
    ); // Has rem
  });

  it("Should get Object properties and convert unit", () => {
    expect(inMotion.get("#target-id", "width", "rem")).toEqual("1rem");
    expect(inMotion.get("#target-id", "width", "px")).toEqual("16px");
  });

  it("Should set Object properties to specific unit", () => {
    const anim = inMotion.set(testObject, {
      plainValue: "42px",
      valueWithUnit: "42rem",
      multiplePLainValues: "40% 41px 42rem 43vh",
      multipleValuesWithUnits: "40% 41px 42rem 43vh",
    });

    expect(testObject.plainValue).toEqual("42px");
    expect(testObject.valueWithUnit).toEqual("42rem");
    expect(testObject.multiplePLainValues).toEqual("40% 41px 42rem 43vh");
    expect(testObject.multipleValuesWithUnits).toEqual("40% 41px 42rem 43vh");
  });

  it("Should add child to linked list", () => {
    const parentList = {
      _head: null,
      _tail: null,
    };

    const child1 = { id: 1, _prev: null, _next: null, _priority: 1 };
    const child2 = { id: 2, _prev: null, _next: null, _priority: 1 };
    const child3 = { id: 3, _prev: null, _next: null, _priority: 1 };

    addChild(parentList, child1);

    expect(parentList._head.id).toEqual(1);
    expect(parentList._tail.id).toEqual(1);

    addChild(parentList, child2);

    expect(parentList._head.id).toEqual(1);
    expect(parentList._tail.id).toEqual(2);
    expect(child1._prev).toEqual(null);
    expect(child1._next.id).toEqual(2);
    expect(child2._prev.id).toEqual(1);
    expect(child2._next).toEqual(null);

    addChild(parentList, child3);

    expect(parentList._head.id).toEqual(1);
    expect(parentList._tail.id).toEqual(3);
    expect(child1._prev).toEqual(null);
    expect(child1._next.id).toEqual(2);
    expect(child2._prev.id).toEqual(1);
    expect(child2._next.id).toEqual(3);
    expect(child3._prev.id).toEqual(2);
    expect(child3._next).toEqual(null);
  });

  it("Should add child to linked list with sorting", () => {
    const parentList = {
      _head: null,
      _tail: null,
    };

    const child1 = { id: 1, _prev: null, _next: null, _priority: 999 };
    const child2 = { id: 2, _prev: null, _next: null, _priority: 42 };
    const child3 = { id: 3, _prev: null, _next: null, _priority: 100 };

    const sortMethod = (prev, child) => prev._priority > child._priority;

    addChild(parentList, child1, sortMethod);

    expect(parentList._head.id).toEqual(1);
    expect(parentList._tail.id).toEqual(1);

    addChild(parentList, child2, sortMethod);

    expect(parentList._head.id).toEqual(2);
    expect(parentList._tail.id).toEqual(1);

    expect(child2._prev).toEqual(null);
    expect(child2._next.id).toEqual(1);

    expect(child1._prev.id).toEqual(2);
    expect(child1._next).toEqual(null);

    addChild(parentList, child3, sortMethod);

    expect(parentList._head.id).toEqual(2);
    expect(parentList._tail.id).toEqual(1);
    expect(child2._prev).toEqual(null);
    expect(child2._next.id).toEqual(3);

    expect(child3._prev.id).toEqual(2);
    expect(child3._next.id).toEqual(1);

    expect(child1._prev.id).toEqual(3);
    expect(child1._next).toEqual(null);
  });

  it("Should remove child from linked list", () => {
    const parentList = {
      _head: null,
      _tail: null,
    };

    const child1 = { id: 1, _prev: null, _next: null, _priority: 999 };
    const child2 = { id: 2, _prev: null, _next: null, _priority: 42 };
    const child3 = { id: 3, _prev: null, _next: null, _priority: 100 };

    addChild(parentList, child1);
    addChild(parentList, child2);
    addChild(parentList, child3);

    removeChild(parentList, child1);

    expect(child1._prev).toEqual(null);
    expect(child1._next).toEqual(null);

    expect(parentList._head.id).toEqual(2);
    expect(parentList._tail.id).toEqual(3);

    expect(child2._prev).toEqual(null);
    expect(child2._next.id).toEqual(3);

    expect(child3._prev.id).toEqual(2);
    expect(child3._next).toEqual(null);

    removeChild(parentList, child3);

    expect(child3._prev).toEqual(null);
    expect(child3._next).toEqual(null);

    expect(parentList._head.id).toEqual(2);
    expect(parentList._tail.id).toEqual(2);

    expect(child2._prev).toEqual(null);
    expect(child2._next).toEqual(null);
  });

  it("Should shuffle an array", () => {
    const array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    const sum = array.reduce((a, b) => a + b, 0);
    const a = [...array];
    for (let i = 0; i < 100; i++) {
      const s = inMotion.shuffle(a);
      expect(s.reduce((a, b) => a + b, 0)).toEqual(sum);
      expect(s.length).toEqual(array.length);
      expect(array).not.toEqual(s);
    }
  });

  it("Should snap a value to an array", () => {
    const array = [25, 100, 400];
    const snap = 25;
    expect(inMotion.snap(10, snap)).toEqual(0);
    expect(inMotion.snap(20, snap)).toEqual(25);
    expect(inMotion.snap(50, snap)).toEqual(50);
    expect(inMotion.snap(60, snap)).toEqual(50);
    expect(inMotion.snap(70, snap)).toEqual(75);
    expect(inMotion.snap(10, array)).toEqual(25);
    expect(inMotion.snap(20, array)).toEqual(25);
    expect(inMotion.snap(50, array)).toEqual(25);
    expect(inMotion.snap(63, array)).toEqual(100);
    expect(inMotion.snap(75, array)).toEqual(100);
    expect(inMotion.snap(200, array)).toEqual(100);
    expect(inMotion.snap(300, array)).toEqual(400);
    expect(inMotion.snap(1000, array)).toEqual(400);
  });

  it("Should remove a target from an inmotion", () => {
    const [$target] = inMotion.$("#target-id");
    const inmotion1 = createMotion($target, { x: 100, y: 100 });
    const inmotion2 = createMotion($target, { rotate: 180 });
    const inmotion3 = createMotion($target, { scale: 2 });
    expect(inmotion1.targets[0]).toEqual($target);
    expect(inmotion1.paused).toEqual(false);
    expect(inmotion2.targets[0]).toEqual($target);
    expect(inmotion2.paused).toEqual(false);
    expect(inmotion3.targets[0]).toEqual($target);
    expect(inmotion3.paused).toEqual(false);
    inMotion.remove($target);
    expect(inmotion1._head).toEqual(null);
    expect(inmotion1.paused).toEqual(true);
    expect(inmotion2._head).toEqual(null);
    expect(inmotion2.paused).toEqual(true);
    expect(inmotion3._head).toEqual(null);
    expect(inmotion3.paused).toEqual(true);
  });

  it("Should remove targets with Objects references", () => {
    const inmotion = createMotion([testObject, anOtherTestObject], {
      plainValue: 200,
      duration: 100,
    });
    expect(getChildLength(inmotion)).toEqual(2);

    inMotion.remove(testObject);
    expect(getChildLength(inmotion)).toEqual(1);

    inMotion.remove(anOtherTestObject);
    expect(getChildLength(inmotion)).toEqual(0);
    expect(inmotion._hasChildren).toEqual(false);
  });

  it("Should remove targets from multiple inmotions at once", () => {
    const inmotion1 = createMotion([testObject, anOtherTestObject], {
      plainValue: 200,
      duration: 100,
    });
    const inmotion2 = createMotion(anOtherTestObject, {
      plainValue: 300,
      duration: 100,
    });
    expect(getChildLength(inmotion1)).toEqual(2);
    expect(getChildLength(inmotion2)).toEqual(1);

    inMotion.remove(testObject);
    expect(getChildLength(inmotion1)).toEqual(1);
    expect(getChildLength(inmotion2)).toEqual(1);

    inMotion.remove(anOtherTestObject);
    expect(getChildLength(inmotion1)).toEqual(0);
    expect(getChildLength(inmotion2)).toEqual(0);
  });

  it("Should remove targets from timeline", () => {
    const tl = createMotionTimeline({
      defaults: { duration: 100 },
    })
      .add([testObject, anOtherTestObject], {
        plainValue: 200,
      })
      .add(anOtherTestObject, {
        plainValue: 300,
      });

    expect(tl._hasChildren).toEqual(true);
    expect(getChildLength(getChildAtIndex(tl, 0))).toEqual(2);
    expect(getChildLength(getChildAtIndex(tl, 1))).toEqual(1);

    inMotion.remove(testObject);
    expect(getChildLength(getChildAtIndex(tl, 0))).toEqual(1);
    expect(getChildLength(getChildAtIndex(tl, 1))).toEqual(1);
    expect(tl._hasChildren).toEqual(true);

    inMotion.remove(anOtherTestObject);
    expect(tl._head).toEqual(null);
    expect(tl._tail).toEqual(null);
    expect(tl._hasChildren).toEqual(false);
  });

  it("Should remove targets on a specific inmotion", () => {
    const inmotion1 = createMotion([testObject, anOtherTestObject], {
      plainValue: 200,
      duration: 100,
    });
    const inmotion2 = createMotion([anOtherTestObject, testObject], {
      plainValue: 300,
      duration: 100,
    });
    expect(getChildLength(inmotion1)).toEqual(2);
    expect(getChildLength(inmotion2)).toEqual(2);

    inMotion.remove(anOtherTestObject, inmotion1);
    expect(getChildLength(inmotion1)).toEqual(1);
    expect(getChildLength(inmotion2)).toEqual(2);

    inMotion.remove(testObject, inmotion2);
    expect(getChildLength(inmotion1)).toEqual(1);
    expect(getChildLength(inmotion2)).toEqual(1);

    inMotion.remove(testObject, inmotion1);
    expect(getChildLength(inmotion1)).toEqual(0);
    expect(getChildLength(inmotion2)).toEqual(1);

    inMotion.remove(anOtherTestObject, inmotion2);
    expect(getChildLength(inmotion1)).toEqual(0);
    expect(getChildLength(inmotion2)).toEqual(0);
  });

  it("Should remove targets with CSS selectors", () => {
    const inmotion = createMotion(
      ["#target-id", ".target-class", 'div[data-index="0"]'],
      {
        x: 100,
        duration: 100,
      }
    );
    expect(getChildLength(inmotion)).toEqual(4);

    inMotion.remove("#target-id");
    expect(getChildLength(inmotion)).toEqual(3);

    inMotion.remove('[data-index="2"]');
    expect(getChildLength(inmotion)).toEqual(2);

    inMotion.remove(".target-class");
    expect(getChildLength(inmotion)).toEqual(0);
  });

  it("Should cancel inmotions with no tweens left after calling remove", () => {
    const inmotion = createMotion("#target-id", { x: 100 });
    expect(getChildLength(inmotion)).toEqual(1);

    inMotion.remove("#target-id");
    expect(getChildLength(inmotion)).toEqual(0);
    expect(inmotion._cancelled).toEqual(1);
    expect(inmotion.paused).toEqual(true);
  });

  it("Should not cancel inmotions if tweens left after calling remove", () => {
    const inmotion = createMotion(["#target-id", ".target-class"], { x: 100 });
    expect(getChildLength(inmotion)).toEqual(4);

    inMotion.remove("#target-id");
    expect(getChildLength(inmotion)).toEqual(3);
    expect(inmotion._cancelled).toEqual(0);
    inmotion.pause();
  });

  it("Should remove specific tween property", () => {
    const inmotion = createMotion("#target-id", { x: 100, y: 100 });
    expect(getChildLength(inmotion)).toEqual(2);

    inMotion.remove("#target-id", inmotion, "x");
    expect(getChildLength(inmotion)).toEqual(1);
    expect(inmotion._cancelled).toEqual(0);
    inmotion.pause();
  });

  it("Should remove specific tween property and cancel the inmotion if not tweens are left", () => {
    const inmotion = createMotion("#target-id", { x: 100, y: 100 });
    expect(getChildLength(inmotion)).toEqual(2);

    inMotion.remove("#target-id", inmotion, "x");
    inMotion.remove("#target-id", inmotion, "y");
    expect(getChildLength(inmotion)).toEqual(0);
    expect(inmotion._cancelled).toEqual(1);
    expect(inmotion.paused).toEqual(true);
  });

  it("Should remove the last CSS Transform tween property should not stops the other tweens from updating", (resolve) => {
    const inmotion = createMotion("#target-id", {
      x: 100,
      y: 100,
      onComplete: () => {
        expect(inMotion.get("#target-id", "x")).toEqual(100);
        expect(inMotion.get("#target-id", "y")).toEqual(0);
        resolve();
      },
      duration: 30,
    });
    expect(inMotion.get("#target-id", "x")).toEqual(0);
    inMotion.remove("#target-id", inmotion, "y");
  });
});
