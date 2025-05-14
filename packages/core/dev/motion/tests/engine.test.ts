import { describe, it, expect } from "@inspatial/test";
import { createMotion, InMotion, inMotion } from "../src/index.ts";

describe("InMotion Engine Core", () => {
  it("Should call set useDefaultMainLoop to false should prevent animations from running", (resolve) => {
    InMotion.useDefaultMainLoop = false;
    InMotion.useDefaultMainLoop = false;

    let renderCheck = 0;

    const animation = createMotion("#target-id", {
      x: 100,
      duration: 20,
      onUpdate: () => {
        renderCheck++;
      },
    });

    setTimeout(() => {
      expect(animation.began).toEqual(false);
      expect(animation.currentTime).toEqual(0);
      expect(renderCheck).toEqual(0);
      InMotion.useDefaultMainLoop = true; // Reset
      resolve();
    }, 70);
  });

  it("Should call manually tick the InMotion Engine with an external loop", (resolve) => {
    InMotion.useDefaultMainLoop = false;

    let raf = 0;

    function customLoop() {
      raf = requestAnimationFrame(customLoop);
      InMotion.update();
    }

    customLoop();

    let renderCheck = 0;

    const animation = createMotion("#target-id", {
      translateX: 100,
      onRender: () => {
        renderCheck++;
      },
      duration: 50,
    });

    setTimeout(() => {
      expect(animation.began).toEqual(true);
      expect(animation.completed).toEqual(true);
      expect(animation.currentTime).toEqual(50);
      expect(renderCheck).toBeGreaterThan(2);
      cancelAnimationFrame(raf);
      InMotion.useDefaultMainLoop = true; // Reset
      resolve();
    }, 70);
  });

  it("Should call pause and resume the InMotion Engine", (resolve) => {
    let renderCheck = 0;

    const animation = createMotion("#target-id", {
      translateX: 100,
      onRender: () => {
        renderCheck++;
      },
      duration: 50,
    });

    InMotion.pause();

    setTimeout(() => {
      expect(animation.began).toEqual(false);
      expect(animation.completed).toEqual(false);
      expect(animation.currentTime).toEqual(0);
      expect(renderCheck).toEqual(0);
      InMotion.resume();
      setTimeout(() => {
        expect(animation.began).toEqual(true);
        expect(animation.completed).toEqual(true);
        expect(animation.currentTime).toEqual(50);
        expect(renderCheck).toBeGreaterThan(2);
        resolve();
      }, 100);
    }, 50);
  });

  it("Should call default precision should be 4", () => {
    const [$target] = inMotion.$("#target-id");

    const initialTransformString = "translateX(0.12345px) scale(0.12345)";

    getComputedStyle($target).transform = initialTransformString;

    const animation = createMotion($target, {
      x: 2.12345,
      scale: 2.12345,
      ease: "linear",
      autoplay: false,
      duration: 500,
    });

    expect(getComputedStyle($target).transform).toEqual(initialTransformString);
    animation.seek(250);
    expect(getComputedStyle($target).transform).toEqual(
      "translateX(1.1235px) scale(1.1235)"
    );
    animation.seek(500);
    expect(getComputedStyle($target).transform).toEqual(
      "translateX(2.12345px) scale(2.12345)"
    );
  });

  it("Should call changing precision should affect only createMotion values", () => {
    const defaultPrecision = InMotion.precision;

    InMotion.precision = 1;

    const [$target] = inMotion.$("#target-id");

    const initialTransformString = "translateX(0.12345px) scale(0.12345)";

    getComputedStyle($target).transform = initialTransformString;

    const animation = createMotion($target, {
      x: 2.12345,
      scale: 2.12345,
      ease: "linear",
      autoplay: false,
      duration: 500,
    });

    expect(getComputedStyle($target).transform).toEqual(initialTransformString);
    animation.seek(250);
    expect(getComputedStyle($target).transform).toEqual(
      "translateX(1.1px) scale(1.1)"
    );
    animation.seek(500);
    expect(getComputedStyle($target).transform).toEqual(
      "translateX(2.12345px) scale(2.12345)"
    );

    InMotion.precision = defaultPrecision;
  });

  it("Should call changing the time unit should affect duration values", (resolve) => {
    const defaultUnit = InMotion.timeUnit;
    const defaultDuration = /** @type {Number}  */ InMotion.defaults.duration;

    InMotion.timeUnit = "s";

    expect(InMotion.defaults.duration).toEqual(defaultDuration * 0.001);

    const animation = createMotion("#target-id", {
      x: 100,
      ease: "linear",
      duration: 0.75,
    });

    setTimeout(() => {
      expect(animation.currentTime).toBeGreaterThan(0.1);
      expect(animation.currentTime).toBeLessThan(0.75);
      resolve();
      InMotion.timeUnit = defaultUnit;
    }, 150);
  });
});
