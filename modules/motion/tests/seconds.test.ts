import { describe, it, expect } from "@inspatial/test";
import { getChildAtIndex } from "../src/utils/index.ts";
import { minValue } from "../src/consts.ts";
import {
  createMotion,
  createMotionTimeline,
  createMotionTimer,
  InMotion,
} from "../src/index.ts";

describe("InMotion Seconds", () => {
  it("Calls added to a 0 duration timeline with a delay should not fire before the end of the delay duration", (resolve) => {
    InMotion.timeUnit = "s";

    let timer1Log = 0;
    let timer2Log = 0;
    let timer3Log = 0;

    const tl = createMotionTimeline({
      delay: 1,
      loop: 1,
      autoplay: false,
      // onUpdate: self => console.log(self.id, self._currentTime),
      onComplete: (self) => {
        expect(timer1Log).toEqual(1);
        expect(timer2Log).toEqual(1);
        expect(timer3Log).toEqual(1);
        InMotion.timeUnit = "ms";
        resolve();
      },
    })
      .call(() => {
        timer1Log += 1;
      }, 0)
      .call(() => {
        timer2Log += 1;
      }, 0)
      .call(() => {
        timer3Log += 1;
      }, 0)
      .init();

    tl.seek(-0.1);

    expect(timer1Log).toEqual(0);
    expect(timer2Log).toEqual(0);
    expect(timer3Log).toEqual(0);

    tl.play();
  });

  it("Should stretch a looped timer", () => {
    InMotion.timeUnit = "s";
    const timer1 = createMotionTimer({
      duration: 0.1,
      autoplay: false,
      loop: 0,
    });
    expect(timer1.duration).toEqual(0.1);
    for (let i = 1, l = 9999; i < l; i++) {
      const newTime = +(i * 0.1).toFixed(1);
      timer1.stretch(newTime);
      expect(timer1.duration).toEqual(newTime);
      expect(timer1.iterationDuration).toEqual(newTime);
    }
    timer1.stretch(0);
    expect(timer1.duration).toEqual(minValue);
    expect(timer1.iterationDuration).toEqual(minValue);
    InMotion.timeUnit = "ms";
  });

  it("Should stretch a looped timer", () => {
    InMotion.timeUnit = "s";
    const timer1 = createMotionTimer({
      duration: 0.1,
      autoplay: false,
      loop: 3,
    });
    expect(timer1.duration).toEqual(0.1 * 4);
    for (let i = 1, l = 9999; i < l; i++) {
      const newTime = +(i * 0.1).toFixed(1);
      timer1.stretch(newTime);
      expect(timer1.duration).toEqual(newTime);
      expect(timer1.iterationDuration).toEqual(newTime / timer1.iterationCount);
    }
    timer1.stretch(0);
    expect(timer1.duration).toEqual(minValue);
    expect(timer1.iterationDuration).toEqual(minValue);
    InMotion.timeUnit = "ms";
  });

  it("Should stretch an animation", () => {
    InMotion.timeUnit = "s";

    const animation1 = createMotion("#target-id", {
      width: [
        { to: 100, duration: 0.1 },
        { to: 100, duration: 0.2 },
      ],
      duration: 0.1,
      autoplay: false,
    });

    expect(animation1.duration).to.equal(0.3);
    expect(getChildAtIndex(animation1, 0)._updateDuration).toEqual(0.1);
    expect(getChildAtIndex(animation1, 1)._updateDuration).toEqual(0.2);
    animation1.stretch(0.6);
    expect(animation1.duration).toEqual(0.6);
    expect(getChildAtIndex(animation1, 0)._updateDuration).toEqual(0.2);
    expect(getChildAtIndex(animation1, 1)._updateDuration).toEqual(0.4);
    animation1.stretch(0.03);
    expect(animation1.duration).toEqual(0.03);
    expect(getChildAtIndex(animation1, 0)._updateDuration).toEqual(0.01);
    expect(getChildAtIndex(animation1, 1)._updateDuration).toEqual(0.02);
    animation1.stretch(0);
    expect(animation1.duration).toEqual(minValue);
    expect(getChildAtIndex(animation1, 0)._updateDuration).toEqual(minValue);
    expect(getChildAtIndex(animation1, 1)._updateDuration).toEqual(minValue);
    animation1.stretch(0.03);
    expect(animation1.duration).toEqual(0.03);
    expect(getChildAtIndex(animation1, 0)._updateDuration).toEqual(0.03);
    expect(getChildAtIndex(animation1, 1)._updateDuration).toEqual(0.03);

    InMotion.timeUnit = "ms";
  });
});
