import { describe, it, expect } from "@inspatial/test";
import {
  createMotion,
  createMotionTimeline,
  createMotionTimer,
} from "./index.ts";

describe("InMotion Promises", () => {
  it("Should then() on timer", (resolve) => {
    createMotionTimer({ duration: 30 }).then((anim) => {
      expect(anim.currentTime).toEqual(30);
      resolve();
    });
  });

  it("Should then() on animation", (resolve) => {
    createMotion("#target-id", {
      y: 100,
      duration: 30,
    }).then((anim) => {
      expect(anim.currentTime).toEqual(30);
      resolve();
    });
  });

  it("Should then() on timeline", (resolve) => {
    createMotionTimeline()
      .add("#target-id", {
        x: 100,
        duration: 15,
      })
      .add("#target-id", {
        y: 100,
        duration: 15,
      })
      .then((tl) => {
        expect(tl.currentTime).toEqual(30);
        resolve();
      });
  });

  it("Should use a timer as a return value in an async function", (resolve) => {
    function doSomethingAsync() {
      createMotionTimer({
        duration: 30,
      }).then((asyncTimer) => {
        expect(asyncTimer.currentTime).toEqual(30);
        resolve();
      });
    }
    doSomethingAsync();
  });
});
