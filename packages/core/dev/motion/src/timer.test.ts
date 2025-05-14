import { describe, it, expect } from "@inspatial/test";
import { createMotion, inMotion } from "./index.ts";

describe("InMotion Timer", () => {
  it("Should handle specified timings parameters", (resolve) => {
    createMotion("#target-id", {
      translateX: 100,
      delay: 10,
      duration: 20,
      loop: 1,
      loopDelay: 10,
      onComplete: (a) => {
        expect(a.currentTime).toEqual(20 + 10 + 20);
        resolve();
      },
    });
  });

  const complexTimingsParams = {
    translateX: {
      to: 50,
      delay: () => 15,
      duration: () => 10,
    },
    translateY: {
      to: 35,
      delay: 10,
      duration: 10,
    },
    translateZ: {
      to: 20,
      delay: 35,
      duration: 30,
    },
    delay: () => 10,
    duration: () => 10,
    loopDelay: 10,
    loop: 1,
    autoplay: false,
  };

  it("Should calculate iteration currentTime when a delay is defined", () => {
    const inmotion = createMotion("#target-id", complexTimingsParams);
    expect(inmotion.currentTime).toEqual(-10);
    inmotion.seek(5);
    expect(inmotion.currentTime).toEqual(5);
    inmotion.seek(inmotion.duration);
    expect(inmotion.currentTime).toEqual(inmotion.duration);
  });

  it("Should calculate duration", () => {
    const inmotion = createMotion("#target-id", complexTimingsParams);
    expect(inmotion.duration).toEqual(55 + 10 + 55);
  });

  it("Should calculate iterationChangeEndTime", () => {
    const inmotion = createMotion("#target-id", complexTimingsParams);
    expect(inmotion.iterationDuration).toEqual(65 - 10);
  });

  it("Should delay the start of the inmotion", (resolve) => {
    const start = Date.now();
    const inmotion = createMotion("#target-id", {
      x: 100,
      delay: 100,
      duration: 100,
      ease: "linear",
      onBegin: (self) => {
        self.pause();
        const current = Date.now() - start;
        expect(current).toBeCloseTo(100, 17);
        expect(inMotion.get("#target-id", "x")).toEqual(0);
        inmotion.seek(50);
        expect(inMotion.get("#target-id", "x")).toEqual(50);
        inmotion.seek(100);
        expect(inMotion.get("#target-id", "x")).toEqual(100);
        resolve();
      },
    });
  });

  it("Should start delayed alternate looped inmotions correctly", () => {
    createMotion("#target-id", {
      y: -100,
      loop: 2,
      delay: 1000,
      alternate: true,
      autoplay: false,
    });
    expect(inMotion.get("#target-id", "y")).toEqual(0);
  });

  it("Should render the value in advance when a negative delay is defined on alternate looped inmotions", () => {
    const inmotion = createMotion("#target-id", {
      scale: [0, 1],
      ease: "linear",
      loop: true,
      duration: 1000,
      delay: -5250,
      alternate: true,
      autoplay: false,
    });
    inmotion.seek(0);
    expect(inMotion.get("#target-id", "scale")).toEqual(0.75);
  });

  it("Should get and set iterationProgress on non looped inmotion", () => {
    const inmotion = createMotion("#target-id", {
      scale: [0, 1],
      ease: "linear",
      duration: 1000,
      autoplay: false,
    });
    inmotion.iterationProgress = 0;
    expect(inMotion.get("#target-id", "scale")).toEqual(0);
    inmotion.iterationProgress = 0.5;
    expect(inMotion.get("#target-id", "scale")).toEqual(0.5);
    inmotion.iterationProgress = 1;
    expect(inMotion.get("#target-id", "scale")).toEqual(1);
    expect(inmotion.currentTime).toEqual(1000);
  });

  it("Should get and set iterationProgress on a looped inmotion with pre-defined iterations", () => {
    const inmotion = createMotion("#target-id", {
      scale: [0, 1],
      ease: "linear",
      duration: 1000,
      autoplay: false,
      loop: 3,
    });
    inmotion.seek(2200);
    expect(inMotion.get("#target-id", "scale")).toEqual(0.2);
    inmotion.iterationProgress = 0;
    expect(inmotion.currentTime).toEqual(2000);
    expect(inMotion.get("#target-id", "scale")).toEqual(0);
    inmotion.iterationProgress = 0.5;
    expect(inMotion.get("#target-id", "scale")).toEqual(0.5);
    inmotion.iterationProgress = 1;
    expect(inMotion.get("#target-id", "scale")).toEqual(0);
    expect(inmotion.currentTime).toEqual(3000);
  });

  it("Should get and set currentIteration on a looped inmotion with pre-defined iterations", () => {
    const inmotion = createMotion("#target-id", {
      scale: [0, 1],
      ease: "linear",
      duration: 1000,
      autoplay: false,
      loop: 4,
    });
    inmotion.currentIteration = 0;
    expect(inmotion.currentIteration).toEqual(0);
    inmotion.seek(1500);
    expect(inmotion.currentIteration).toEqual(1);
    inmotion.currentIteration = 2;
    expect(inmotion.currentIteration).toEqual(2);
    expect(inmotion.currentTime).toEqual(2000);
    inmotion.currentIteration = 99;
    expect(inmotion.currentIteration).toEqual(4);
    expect(inmotion.currentTime).toEqual(4000);
  });

  it("Should get and set currentTime on a looped inmotion with pre-defined iterations", () => {
    const inmotion = createMotion("#target-id", {
      scale: [0, 1],
      ease: "linear",
      duration: 1000,
      autoplay: false,
      loop: 4,
    });
    inmotion.currentTime = 1500;
    expect(inmotion.currentTime).toEqual(1500);
    expect(inMotion.get("#target-id", "scale")).toEqual(0.5);
    inmotion.currentTime = 4250;
    expect(inmotion.currentTime).toEqual(4250);
    expect(inMotion.get("#target-id", "scale")).toEqual(0.25);
    inmotion.currentTime = 5500;
    expect(inmotion.currentTime).toEqual(5000);
    expect(inMotion.get("#target-id", "scale")).toEqual(1);
  });

  it("Should get and set iterationCurrentTime on a looped inmotion with pre-defined iterations", () => {
    const inmotion = createMotion("#target-id", {
      scale: [0, 1],
      ease: "linear",
      duration: 1000,
      autoplay: false,
      loop: 4,
    });
    inmotion.iterationCurrentTime = 500;
    expect(inmotion.currentTime).toEqual(500);
    expect(inmotion.currentIteration).toEqual(0);
    expect(inmotion.iterationCurrentTime).toEqual(500);
    expect(inMotion.get("#target-id", "scale")).toEqual(0.5);
    inmotion.iterationCurrentTime = 1500;
    expect(inmotion.currentTime).toEqual(1500);
    expect(inmotion.currentIteration).toEqual(1);
    expect(inmotion.iterationCurrentTime).toEqual(500);
    expect(inMotion.get("#target-id", "scale")).toEqual(0.5);
    inmotion.iterationCurrentTime = 250;
    expect(inmotion.currentTime).toEqual(1250);
    expect(inmotion.currentIteration).toEqual(1);
    expect(inmotion.iterationCurrentTime).toEqual(250);
    expect(inMotion.get("#target-id", "scale")).toEqual(0.25);
  });

  it("Should get and set cancelled on an inmotion", () => {
    const inmotion = createMotion("#target-id", complexTimingsParams);
    expect(inmotion.cancelled).toEqual(false);
    inmotion.cancelled = true;
    expect(inmotion.cancelled).toEqual(true);
    expect(inmotion.paused).toEqual(true);
    inmotion.cancelled = false;
    expect(inmotion.cancelled).toEqual(false);
    expect(inmotion.paused).toEqual(false);
  });
});
