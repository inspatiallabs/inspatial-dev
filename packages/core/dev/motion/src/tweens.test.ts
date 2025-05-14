import { describe, it, expect } from "@inspatial/test";
import {
  inMotion,
  inSequence,
  createMotion,
  createMotionTimer,
  createMotionTimeline,
} from "./index.ts";
import { getChildAtIndex } from "./utils/index.ts";
import { compositionTypes, valueTypes } from "./consts.ts";
import { removeChild } from "./helpers.ts";

describe("InMotion Tweens", () => {
  it("Should handle single tween timings", () => {
    const delay = 200;
    const duration = 300;

    const inmotion = createMotion("#target-id", {
      translateX: "100%",
      delay: delay,
      duration: duration,
      autoplay: false,
    });

    const firstTween = getChildAtIndex(inmotion, 0);
    const firstTweenChangeEndTime =
      firstTween._updateDuration + firstTween._startTime;

    expect(firstTween._startTime).toEqual(0);
    expect(firstTweenChangeEndTime).toEqual(duration);

    expect(inmotion.duration).toEqual(duration);
  });

  it("Should handle keyframes tween timings", () => {
    const delay1 = 200;
    const duration1 = 300;

    const delay2 = 300;
    const duration2 = 400;

    const inmotion = createMotion("#target-id", {
      translateX: [
        { to: "100%", delay: delay1, duration: duration1 },
        { to: "200%", delay: delay2, duration: duration2 },
      ],
      autoplay: false,
    });

    const firstTween = getChildAtIndex(inmotion, 0);
    const firstTweenChangeEndTime =
      firstTween._updateDuration + firstTween._startTime;

    expect(firstTween._startTime).toEqual(0);
    expect(firstTweenChangeEndTime).toEqual(duration1);

    const secondTween = getChildAtIndex(inmotion, 1);
    const secondTweenChangeEndTime =
      secondTween._updateDuration + secondTween._startTime;

    expect(secondTween._startTime).toEqual(duration1 + delay2);
    expect(secondTweenChangeEndTime).toEqual(duration1 + (delay2 + duration2));

    expect(inmotion.duration).toEqual(duration1 + delay2 + duration2);
  });

  it("Should handle simple tween ease", () => {
    const inmotion = createMotion("#target-id", {
      translateX: "100%",
      ease: "linear",
      autoplay: false,
    });

    expect(getChildAtIndex(inmotion, 0)._ease(0.5)).toEqual(0.5);
  });

  it("Should handle color tween", () => {
    const inmotion = createMotion("#target-id", {
      translateX: "100%",
      backgroundColor: "#000",
      autoplay: false,
    });

    expect(getChildAtIndex(inmotion, 1)._valueType).toEqual(valueTypes.COLOR);
  });

  it("Should handle canceled tween", () => {
    const [$target] = inMotion.$("#target-id");
    const tl = createMotionTimeline({
      autoplay: false,
      defaults: { ease: "linear" },
    })
      .add($target, {
        translateX: [0, 100],
        duration: 20,
      })
      .add(
        $target,
        {
          translateX: -100,
          duration: 5,
          onComplete: (self) => {
            removeChild(self, self._tail);
          },
        },
        10
      );

    tl.seek(5);
    expect(getComputedStyle($target).transform).toEqual("translateX(25px)");

    tl.seek(10);
    expect(getComputedStyle($target).transform).toEqual("translateX(50px)");

    tl.seek(15);
    expect(getComputedStyle($target).transform).toEqual("translateX(-100px)");

    tl.seek(20);
    expect(getComputedStyle($target).transform).toEqual("translateX(-100px)");
  });

  it("Should not remove tween siblings on inmotion pause", (resolve) => {
    const inmotion1 = createMotion("#target-id", {
      translateX: [{ to: -50 }, { to: 200 }],
      duration: 100,
    });
    const inmotion2 = createMotion("#target-id", {
      translateX: [{ to: 100 }, { to: -100 }],
      duration: 100,
      delay: 50,
    });
    createMotionTimer({
      duration: 50,
      onComplete: () => {
        inmotion1.pause();
        inmotion2.pause();
        expect(inmotion1.paused).toEqual(true);
        // This one should be null since the first should have been cancel
        expect(inmotion1._head._nextRep).toBeNull;
        expect(inmotion2.paused).toEqual(true);
        expect(inmotion2._head._nextRep).to.not.be.null;
        resolve();
      },
    });
  });

  it("Should remove tween siblings on inmotion complete", (resolve) => {
    const inmotion1 = createMotion("#target-id", {
      translateX: 200,
      duration: 50,
    });
    const inmotion2 = createMotion("#target-id", {
      translateX: 200,
      duration: 50,
      delay: 10,
    });
    createMotionTimer({
      duration: 100,
      onComplete: () => {
        expect(inmotion1.paused).toEqual(true);
        expect(inmotion1._cancelled).toEqual(1);
        expect(inmotion1._head._prevRep).toBeNull();

        expect(inmotion2.paused).toEqual(true);
        expect(inmotion2._cancelled).toEqual(1);
        expect(inmotion2._head._nextRep).toBeNull();
        resolve();
      },
    });
  });

  it("Should re-add tween siblings on play after inmotion complete", (resolve) => {
    const inmotion1 = createMotion("#target-id", {
      translateX: 200,
      duration: 50,
    });
    const inmotion2 = createMotion("#target-id", {
      translateX: 200,
      duration: 50,
      delay: 10,
    });
    createMotionTimer({
      duration: 100,
      onComplete: () => {
        expect(inmotion1._cancelled).toEqual(1);
        expect(inmotion2._cancelled).toEqual(1);
        inmotion1.restart();
        inmotion2.restart();
        createMotionTimer({
          duration: 20,
          onComplete: () => {
            inmotion1.pause();
            inmotion2.pause();
            expect(inmotion1.paused).toEqual(true);
            expect(inmotion1._cancelled).toEqual(0);
            expect(inmotion1._head._prevRep).not.toBeNull();
            expect(inmotion2.paused).toEqual(true);
            expect(inmotion2._cancelled).toEqual(0);
            expect(inmotion2._head._nextRep).not.toBeNull();
            resolve();
          },
        });
      },
    });
  });

  it("Should properly override looped tween", (resolve) => {
    const anim1 = createMotion("#target-id", {
      scale: 2,
      alternate: true,
      loop: true,
      duration: 100,
      composition: "replace",
    });

    const anim2 = createMotion("#target-id", {
      scale: 4,
      duration: 40,
      composition: "replace",
      onComplete: () => {
        expect(anim1.completed).toEqual(false);
        expect(anim1._cancelled).toEqual(1);
        resolve();
      },
    });
  });

  it("Should properly override timeline tweens", (resolve) => {
    const tl1 = createMotionTimeline()
      .add(
        "#target-id",
        {
          x: 200,
          duration: 60,
        },
        0
      )
      .add(
        "#target-id",
        {
          y: 200,
          duration: 60,
        },
        0
      );
    createMotionTimeline({
      delay: 10,
    })
      .add(
        "#target-id",
        {
          x: 100,
          duration: 30,
        },
        0
      )
      .add(
        "#target-id",
        {
          y: 100,
          duration: 30,
        },
        0
      )
      .then(() => {
        expect(tl1._cancelled).toEqual(1);
        resolve();
      });
  });

  it("Should not pause inmotion with partially overriden tweens", (resolve) => {
    const anim1 = createMotion("#target-id", {
      x: 100,
      scale: 2,
      alternate: true,
      loop: true,
      duration: 80,
      composition: "replace",
    });

    createMotion("#target-id", {
      scale: 4,
      duration: 40,
      composition: "replace",
      onComplete: () => {
        expect(anim1.completed).toEqual(false);
        expect(anim1._cancelled).toEqual(0);
        anim1.pause();
        resolve();
      },
    });
  });

  it("Should not pause timeline with partially overriden tweens", (resolve) => {
    const tl1 = createMotionTimeline()
      .add(
        "#target-id",
        {
          x: 200,
          duration: 60,
        },
        0
      )
      .add(
        "#target-id",
        {
          y: 200,
          duration: 60,
        },
        0
      );
    createMotionTimeline({
      delay: 10,
    })
      .add(
        "#target-id",
        {
          x: 100,
          duration: 30,
        },
        0
      )
      .then(() => {
        expect(tl1._cancelled).toEqual(0);
        tl1.pause();
        resolve();
      });
  });

  it("Should not override tweens with composition none", (resolve) => {
    const anim1 = createMotion("#target-id", {
      x: 100,
      scale: 2,
      duration: 80,
      composition: "none",
      onComplete: () => {
        expect(inMotion.get("#target-id", "x")).toEqual(100);
        expect(inMotion.get("#target-id", "scale")).toEqual(2);
        resolve();
      },
    });

    createMotion("#target-id", {
      scale: 4,
      duration: 40,
      composition: "none",
      onComplete: () => {
        expect(anim1.completed).toEqual(false);
        expect(anim1._cancelled).toEqual(0);
        expect(inMotion.get("#target-id", "scale")).toEqual(4);
      },
    });
  });

  it("Should properly blend tweens with composition blend", (resolve) => {
    const anim1 = createMotion("#target-id", {
      x: 100,
      scale: 2,
      duration: 200,
      composition: "blend",
      ease: "linear",
      onComplete: () => {
        expect(inMotion.get("#target-id", "x")).toBeGreaterThan(180);
        expect(inMotion.get("#target-id", "scale")).toBeGreaterThan(3.9);
        resolve();
      },
    });

    createMotion("#target-id", {
      x: 200,
      scale: 4,
      duration: 100,
      composition: "blend",
      ease: "linear",
      onComplete: () => {
        expect(anim1.completed).toEqual(false);
        expect(anim1._cancelled).toEqual(0);
        expect(inMotion.get("#target-id", "x")).toBeGreaterThan(120);
        expect(inMotion.get("#target-id", "x")).toBeLessThan(150);
        expect(inMotion.get("#target-id", "scale")).toBeGreaterThan(3);
        expect(inMotion.get("#target-id", "scale")).toBeLessThan(3.5);
      },
    });
  });

  it("Should properly assign specific tween properties", () => {
    const easeA = (t) => t;
    const easeB = (t) => t * 2;

    const modifierA = (v) => v;
    const modifierB = (v) => v * 2;

    const anim1 = createMotion("#target-id", {
      x: {
        to: 100,
        modifier: modifierA,
        composition: "blend",
        ease: easeA,
      },
      y: 100,
      composition: "none",
      ease: easeB,
      modifier: modifierB,
      autoplay: false,
    });

    const tweenX = anim1._head;
    const tweenY = tweenX._next;

    expect(tweenX._modifier).toEqual(modifierA);
    expect(tweenX._ease).toEqual(easeA);
    expect(tweenX._composition).toEqual(compositionTypes.blend);

    expect(tweenY._modifier).toEqual(modifierB);
    expect(tweenY._ease).toEqual(easeB);
    expect(tweenY._composition).toEqual(compositionTypes.none);
  });

  it("Should seek inside the delay of a tween correctly render the previous tween to value", () => {
    const anim = createMotionTimeline({
      autoplay: false,
    })
      .add("#target-id", {
        scale: [
          { to: [0, 1], duration: 200, ease: "outBack" },
          { to: [0, 0], duration: 100, delay: 500, ease: "inQuart" },
        ],
        delay: 200,
      })
      .init();

    anim.seek(404); // Seek after [0, 1] inside the delay of [0, 0]
    expect(inMotion.get("#target-id", "scale")).toEqual(1);
  });

  it("Should correctly override and from value definition", () => {
    const duration = 1000;
    const $els = inMotion.$(".target-class");

    const tl = createMotionTimeline({
      loop: 3,
      alternate: true,
      autoplay: false,
    })
      .add(
        $els[0],
        {
          translateX: [{ to: -50 }, { to: 200 }],
          duration: 1000,
        },
        0
      )
      .add(
        $els[0],
        {
          translateX: [{ to: 100 }, { to: -100 }],
          duration: 1000,
          delay: 500,
        },
        0
      )
      .add(
        [$els[0], $els[1], $els[2]],
        {
          translateY: (el) =>
            el.id == "square-1" ? -50 : el.id == "square-2" ? -100 : -150,
          duration: 1600,
          delay: 1250,
        },
        inSequence(500, { start: "-=250" })
      )
      .add(
        [$els[0], $els[1], $els[2]],
        {
          translateY: [
            { to: 50, duration: 500, delay: inSequence(250, { start: 0 }) },
            { to: 75, duration: 500, delay: 1000 },
            { to: 100, duration: 500, delay: 1000 },
          ],
        },
        "-=1250"
      )
      .add(
        $els[0],
        {
          id: "TEST A",
          translateY: 50,
        },
        "-=" + duration
      )
      .add(
        $els[1],
        {
          translateY: 50,
        },
        "-=" + duration
      )
      .add(
        $els[2],
        {
          translateY: 50,
        },
        "-=" + duration
      )
      .add(
        [$els[0], $els[1], $els[2]],
        {
          rotate: "-=180",
          duration: duration * 2,
          delay: inSequence(100),
        },
        "-=" + duration * 0.75
      )
      .add(
        [$els[0], $els[1], $els[2]],
        {
          id: "TEST B",
          translateY: 0,
          delay: inSequence(100),
        },
        "-=" + duration
      );

    const animA = tl._head._next._next._next._next._next._next;
    const animB = animA._next._next._next._next;

    expect(animA._head._fromNumber).toEqual(75);
    expect(animB._head._fromNumber).toEqual(50);
  });
});
