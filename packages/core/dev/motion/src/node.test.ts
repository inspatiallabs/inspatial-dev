import { describe, it, expect } from "@inspatial/test";
import { render } from "./render.ts"
import { createMotion, createMotionTimer, createMotionTimeline, InMotion } from "./index.ts";

const totalInstances = 10000;
const targets = [];

for (let i = 0; i < totalInstances; i++) {
  targets.push({ prop: Math.random() });
}

describe("InMotion Node tests", () => {
  it("Should call barebone test to see if an animation runs", (resolve) => {
    const obj = { test: 1 };
    const startTime = Date.now();
    createMotion(obj, {
      test: 2,
      duration: 1000,
      onComplete: () => {
        const endTime = Date.now() - startTime;
        expect(endTime).toBeCloseTo(1000, 15);
        console.log('endTime:', endTime);
        expect(obj.test).toEqual(2);
        resolve();
      }
    });
  });

  function getOptimizationStatus(fn) {
    // @ts-ignore
    const status = %GetOptimizationStatus(fn);
    // console.log(status, status.toString(2).padStart(12, '0'));
    if (status & (1 << 0)) console.log(fn, ' is function');
    if (status & (1 << 1)) console.log(fn, ' is never optimized');
    if (status & (1 << 2)) console.log(fn, ' is always optimized');
    if (status & (1 << 3)) console.log(fn, ' is maybe deoptimized');
    if (status & (1 << 4)) console.log(fn, ' is optimized');
    if (status & (1 << 5)) console.log(fn, ' is optimized by TurboFan');
    if (status & (1 << 6)) console.log(fn, ' is interpreted');
    if (status & (1 << 7)) console.log(fn, ' is marked for optimization');
    if (status & (1 << 8)) console.log(fn, ' is marked for concurrent optimization');
    if (status & (1 << 9)) console.log(fn, ' is optimizing concurrently');
    if (status & (1 << 10)) console.log(fn, ' is executing');
    if (status & (1 << 11)) console.log(fn, ' topmost frame is turbo fanned');
    console.log(fn, ' optimization status is ', status);
    return status;
  }

  it('Should test if the createMotion() function can be optimized', () => {
    for (let i = 0; i < totalInstances; i++) {
      createMotion(targets[i], {
        prop: Math.random(),
        delay: Math.random() * 1.5,
        duration: Math.random() * 2,
        loopDelay: Math.random() * 3
      })
    }

    const animation = createMotion(targets[0], {
      prop: Math.random(),
      duration: Math.random() * 2,
      ease: 'linear',
    });

    const tween = animation._head;

    const createMotionIsOptimized = getOptimizationStatus(createMotion);
    // @ts-ignore
    const animationHasFastProperties = %HasFastProperties(animation);
    // @ts-ignore
    const tweenHasFastProperties = %HasFastProperties(tween);

    if (animationHasFastProperties) console.log('animation has fast properties');
    if (tweenHasFastProperties) console.log('tween has fast properties');

    expect(createMotionIsOptimized).toEqual(49);
    expect(animationHasFastProperties).toEqual(true);
    expect(tweenHasFastProperties).toEqual(true);
  });

  it('Should test if the createMotionTimeline() function can be optimized', () => {

    for (let i = 0; i < totalInstances; i++) {
      createMotionTimeline({
        defaults: {
          delay: Math.random() * 1.5,
          duration: Math.random() * 2,
          loopDelay: Math.random() * 3
        },
      })
      .add(targets[i], {
        prop: Math.random(),
        delay: Math.random() * 1.5,
        duration: Math.random() * 2,
        loopDelay: Math.random() * 3
      })
      .add(targets[i], {
        prop: Math.random(),
        delay: Math.random() * 1.5,
        duration: Math.random() * 2,
          loopDelay: Math.random() * 3,
        });
    }

    const tl1 = createMotionTimeline({
      defaults: {
        delay: Math.random() * 1.5,
        duration: Math.random() * 2,
        loopDelay: Math.random() * 3
      },
    })
    .add(targets[0], {
      prop: Math.random(),
      delay: Math.random() * 1.5,
      duration: Math.random() * 2,
      loopDelay: Math.random() * 3
    })
    .add(targets[1], {
      prop: Math.random(),
      delay: Math.random() * 1.5,
      duration: Math.random() * 2,
      loopDelay: Math.random() * 3
    })

    expect(getOptimizationStatus(createMotionTimeline)).toEqual(49);

    const tl2 = createMotionTimeline({
      defaults: {
        duration: Math.random() * 10,
        autoplay: false
      }
    });

    for (let i = 0; i < 3500; i++) {
      tl2.add(targets[i], {
        prop: Math.random()
      });
    }

    tl2.restart();
    tl2.play();
    tl2.pause();

    expect(getOptimizationStatus(createMotionTimeline)).toEqual(49);

    const tlHasFastProperties = %HasFastProperties(tl2);

    if (tlHasFastProperties) console.log('timeline has fast properties');

    expect(tlHasFastProperties).toEqual(true);
  });

  it('Should test if the createMotionTimer() function can be optimized', () => {
    for (let i = 0; i < totalInstances * 2; i++) {
      createMotionTimer({
        duration: Math.random() * 2
      })
    }

    const timer = createMotionTimer({
      duration: Math.random() * 2,
    });

    const createMotionIsOptimized = getOptimizationStatus(createMotionTimer);
    const animationHasFastProperties = %HasFastProperties(timer);

    if (animationHasFastProperties) console.log('timer has fast properties');

    expect(createMotionIsOptimized).toEqual(49);
    expect(animationHasFastProperties).toEqual(true);
  });

  it('Should test if the render() function can be optimized', () => {

    // First test a normal run

    for (let i = 0; i < totalInstances; i++) {
      createMotion(targets[i], {
        prop: Math.random(),
        delay: Math.random() * 1.5,
        duration: Math.random() * 2,
        loopDelay: Math.random() * 3
      })
    }

    expect(getOptimizationStatus(render)).toEqual(49);

    // Then mix animation types an manually render them

    const animations = [];

    // animations.push(globalClock._additiveAnimation);

    for (let i = 0; i < totalInstances / 3; i++) {
      animations.push(createMotion(targets[i], {prop: Math.random(), duration: Math.random() * 2, autoplay: false}));
      animations.push(createMotionTimer({duration: Math.random() * 10, autoplay: false}));
    }

    // animations.push(globalClock._additiveAnimation);

    const start = Date.now();

    for (let i = 0; i < animations.length; i++) {
      const time = Date.now() - start;
      const tickMode = Math.random() < .5 ? 0 : -1;
      render(animations[i], time, 0, 0, tickMode);
    }

    expect(getOptimizationStatus(render)).toEqual(49);
  });

  it('Should test if the InMotion.update() function can be optimized', resolve => {

    // First test a normal run

    for (let i = 0; i < totalInstances; i++) {
      createMotion(targets[i], {
        prop: Math.random(),
        delay: Math.random() * 1.5,
        duration: Math.random() * 100,
        loopDelay: Math.random() * 3,
        frameRate: Math.random() * 10,
      });
      createMotionTimer({
        duration: Math.random() * 100,
        frameRate: Math.random() * 10,
      });
    }

    setTimeout(() => {
      expect(getOptimizationStatus(InMotion.update)).toEqual(49);
      resolve();
    }, 200)
  });

  const generateInstances = () => {
    let anim, tl, timer;
    for (let i = 0; i < totalInstances; i++) {
      anim = createMotion(targets[i], {
        prop: Math.random(),
        delay: Math.random() * 1.5,
        duration: Math.random() * 2,
        loopDelay: Math.random() * 3
      });
      tl = createMotionTimeline()
      .add(targets[i], {
        prop: Math.random(),
        delay: Math.random() * 1.5,
        duration: Math.random() * 2,
        loopDelay: Math.random() * 3
      })
      .add(targets[i], {
        prop: Math.random(),
        delay: Math.random() * 1.5,
        duration: Math.random() * 2,
        loopDelay: Math.random() * 3,
      })
      timer = createMotionTimer({
        delay: Math.random() * 1.5,
        duration: Math.random() * 2,
        loopDelay: Math.random() * 3
      });
    }
    return { anim, tl, timer }
  }

  it('Should test if InMotion has fast properties', () => {
    const { anim, tl, timer } = generateInstances();
    expect(%HasFastProperties(InMotion)).toEqual(true);
  });

  it("Should test if InMotion's defaults has fast properties", () => {
    const { anim, tl, timer } = generateInstances();
    expect(%HasFastProperties(InMotion.defaults)).toEqual(true);
  });

  it("Should test if timer has fast properties", () => {
    const { anim, tl, timer } = generateInstances();
    expect(%HasFastProperties(timer)).toEqual(true);
  });

  it("Should test if animation has fast properties", () => {
    const { anim, tl, timer } = generateInstances();
    expect(%HasFastProperties(anim)).toEqual(true);
  });

  it("Should test if tween has fast properties", () => {
    const { anim, tl, timer } = generateInstances();
    const tween = anim._head;
    expect(%HasFastProperties(tween)).toEqual(true);
  });

  it("Should test if tl has fast properties", () => {
    const { anim, tl, timer } = generateInstances();
    expect(%HasFastProperties(tl)).toEqual(true);
  });

});