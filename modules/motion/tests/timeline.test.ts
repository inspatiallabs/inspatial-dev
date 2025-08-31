import { describe, it, expect } from "@inspatial/test";
import {
  createMotionTimeline,
  eases,
  inMotion,
  createMotionTimer,
  createMotion,
} from "../src/index.ts";
import { compositionTypes, minValue } from "../src/consts.ts";
import { getChildAtIndex } from "../src/utils/index.ts";

describe("InMotion Timeline", () => {
  function createTL() {
    return createMotionTimeline({
      id: "Test",
      defaults: {
        duration: 50, // Can be inherited
        ease: "outExpo", // Can be inherited
        delay: function (_, i) {
          return 10 + i * 20;
        }, // Can be inherited
      },
      alternate: true, // Is not inherited
      loop: 1, // Is not inherited
    })
      .add(".target-class", {
        translateX: 250,
      })
      .add(".target-class", {
        opacity: 0.5,
        scale: 2,
      })
      .add("#target-id", {
        rotate: 180,
      })
      .add(".target-class", {
        translateX: 0,
        scale: 1,
      });
  }

  it("Should add delay to timeline children position", () => {
    const tl = createMotionTimeline({
      autoplay: false,
      defaults: {
        duration: 50,
      },
    })
      .add("#target-id", {
        translateX: 100,
        delay: 200,
      })
      .add("#target-id", {
        translateX: -100,
        delay: 300,
      })
      .add(
        "#target-id",
        {
          translateX: 0,
          delay: 50,
        },
        "+=150"
      )
      .add(
        "#target-id",
        {
          translateX: 100,
        },
        "+=50"
      );

    expect(
      getChildAtIndex(tl, 0)._offset + getChildAtIndex(tl, 0)._delay
    ).toEqual(200);
    expect(
      getChildAtIndex(tl, 1)._offset + getChildAtIndex(tl, 1)._delay
    ).toEqual(550);
    expect(
      getChildAtIndex(tl, 2)._offset + getChildAtIndex(tl, 2)._delay
    ).toEqual(800);
    expect(
      getChildAtIndex(tl, 3)._offset + getChildAtIndex(tl, 3)._delay
    ).toEqual(900);
  });

  it("Should calculate timeline duration as the sum of all the animation absoluteEndTime multiply by the iterations count", () => {
    const parameterInheritanceTL = createTL();
    expect(parameterInheritanceTL.duration).toEqual(420 * 2);
  });

  it("Should calculate timeline default parameters", () => {
    const tl = createMotionTimeline({
      loop: 1,
      reversed: true,
      defaults: {
        duration: 10,
        ease: "inOut",
        alternate: true,
        loop: 3,
        composition: "none",
      },
    })
      .add("#target-id", {
        translateX: 100,
        duration: 15,
      })
      .add("#target-id", {
        translateX: 200,
        reversed: false,
        ease: "outExpo",
        composition: "blend",
      });

    expect(getChildAtIndex(tl, 0)._reversed).toEqual(0);
    expect(getChildAtIndex(tl, 1)._reversed).toEqual(0);
    expect(tl.duration).toEqual(200); // (( 15 * 4 ) + ( 10 * 4 )) * 2 = 200
    expect(getChildAtIndex(tl, 0)._head._ease(0.75)).toEqual(
      eases.inOut()(0.75)
    );
    expect(getChildAtIndex(tl, 1)._head._ease(0.75)).toEqual(
      eases.outExpo(0.75)
    );
    expect(getChildAtIndex(tl, 0)._head._composition).toEqual(
      compositionTypes["none"]
    );
    expect(getChildAtIndex(tl, 1)._head._composition).toEqual(
      compositionTypes["blend"]
    );
  });

  it("Should calculate basic timeline positions", () => {
    const tl = createMotionTimeline({ defaults: { duration: 10 } })
      .add("#target-id", { translateX: 100 })
      .add("#target-id", { translateX: 200 })
      .add("#target-id", { translateX: 300 });

    expect(getChildAtIndex(tl, 0)._offset).toEqual(0);
    expect(getChildAtIndex(tl, 1)._offset).toEqual(10);
    expect(getChildAtIndex(tl, 2)._offset).toEqual(20);
    expect(tl.duration).toEqual(30);
  });

  it("Should calculate absolute timeline positions", () => {
    const tl = createMotionTimeline({ defaults: { duration: 10 } })
      .add("#target-id", { translateX: 100 }, 50)
      .add("#target-id", { translateX: 200 }, 25)
      .add("#target-id", { translateX: 300 }, 100);

    expect(getChildAtIndex(tl, 0)._offset).toEqual(50);
    expect(getChildAtIndex(tl, 1)._offset).toEqual(25);
    expect(getChildAtIndex(tl, 2)._offset).toEqual(100);
    expect(tl.duration).toEqual(110);
  });

  it("Should calculate absolute timeline positions with shared child params object", () => {
    const childParams = { translateX: 100 };
    const tl = createMotionTimeline({ defaults: { duration: 10 } })
      .add("#target-id", childParams, 50)
      .add("#target-id", childParams, 25)
      .add("#target-id", childParams, 100);

    expect(getChildAtIndex(tl, 0)._offset).toEqual(50);
    expect(getChildAtIndex(tl, 1)._offset).toEqual(25);
    expect(getChildAtIndex(tl, 2)._offset).toEqual(100);
    expect(tl.duration).toEqual(110);
  });

  it("Should calculate relative timeline positions", () => {
    const tl = createMotionTimeline({ defaults: { duration: 10 } })
      .add("#target-id", { translateX: 100 }, "+=20") // 0 + 20 = 20
      .add("#target-id", { translateX: 200 }, "*=2") // (20 + 10) * 2 = 60
      .add("#target-id", { translateX: 300 }, "-=50"); // (60 + 10) - 50 = 20

    expect(getChildAtIndex(tl, 0)._offset).toEqual(20);
    expect(getChildAtIndex(tl, 1)._offset).toEqual(60);
    expect(getChildAtIndex(tl, 2)._offset).toEqual(20);
    expect(tl.duration).toEqual(70); // 60 + 10
  });

  it("Should parse previous operator with relative values", () => {
    const $target = document.querySelector("#target-id");
    const tl = createMotionTimeline({ defaults: { duration: 10 } })
      .add($target, {
        translateX: 100,
      })
      .add(
        $target,
        {
          rotate: 100,
        },
        "<<+=100"
      );

    expect(getChildAtIndex(tl, 1)._offset).toEqual(100);
  });

  it("Should calculate previous animation end position", () => {
    const tl = createMotionTimeline({ defaults: { duration: 10 } })
      .add("#target-id", { translateX: 100 }, "+=40")
      .add("#target-id", { translateX: 200 }, "-=30") // 40 + 10 - 30 = 20
      .add("#target-id", { translateX: 300 }, "<"); // 20 + 10 = 30

    expect(getChildAtIndex(tl, 0)._offset).toEqual(40);
    expect(getChildAtIndex(tl, 1)._offset).toEqual(20);
    expect(getChildAtIndex(tl, 2)._offset).toEqual(30);
    expect(tl.duration).toEqual(50);
  });

  it("Should calculate previous animation end position with relative value", () => {
    const tl = createMotionTimeline({ defaults: { duration: 10 } })
      .add("#target-id", { translateX: 100 }, "+=40")
      .add("#target-id", { translateX: 200 }, "-=30") // 40 + 10 - 30 = 20
      .add("#target-id", { translateX: 300 }, "<+=5"); // 20 + 10 + 5 = 35

    expect(getChildAtIndex(tl, 2)._offset).toEqual(35);
  });

  it("Should calculate previous animation start position", () => {
    const tl = createMotionTimeline({ defaults: { duration: 10 } })
      .add("#target-id", { translateX: 100 }, "+=40")
      .add("#target-id", { translateX: 200 }, "-=30") // 40 + 10 - 30 = 20
      .add("#target-id", { translateX: 300 }, "<<"); // 20 = 20

    expect(getChildAtIndex(tl, 0)._offset).toEqual(40);
    expect(getChildAtIndex(tl, 1)._offset).toEqual(20);
    expect(getChildAtIndex(tl, 2)._offset).toEqual(20);
    expect(tl.duration).toEqual(50);
  });

  it("Should calculate previous animation start position with relative values", () => {
    const tl = createMotionTimeline({ defaults: { duration: 10 } })
      .add("#target-id", { translateX: 100 }, "+=40")
      .add("#target-id", { translateX: 200 }, "-=30") // 40 + 10 - 30 = 20
      .add("#target-id", { translateX: 300 }, "<<+=5"); // 20 + 5 = 25

    expect(getChildAtIndex(tl, 0)._offset).toEqual(40);
    expect(getChildAtIndex(tl, 1)._offset).toEqual(20);
    expect(getChildAtIndex(tl, 2)._offset).toEqual(25);
    expect(tl.duration).toEqual(50);
  });

  it("Should calculate mixed timeline time positions types", () => {
    const tl = createMotionTimeline({ defaults: { duration: 10 } })
      .add("#target-id", { translateX: 100 }, 50)
      .add("#target-id", { translateX: 200 }, "-=20") // (50 + 10) - 20 = 40
      .add("#target-id", { translateX: 300 }, 0);

    expect(getChildAtIndex(tl, 0)._offset).toEqual(50);
    expect(getChildAtIndex(tl, 1)._offset).toEqual(40);
    expect(getChildAtIndex(tl, 2)._offset).toEqual(0);
    expect(tl.duration).toEqual(60); // 50 + 10
  });

  it("Should calculate timeline labels positions", () => {
    const tl = createMotionTimeline({ defaults: { duration: 10 } })
      .label("A starts", 50)
      .label("B starts", 100)
      .label("C") // Added without a position before any animations
      .add("#target-id", { translateX: 50 }, "A starts")
      .label("A ends", "<")
      .label("D") // Added without a position after an animation
      .add("#target-id", { translateX: -50 }, "B starts")
      .add("#target-id", { translateX: 0 }, "A ends")
      .add("#target-id", { translateX: 100 }, "C")
      .add("#target-id", { translateX: 150 }, "D");

    expect(tl.labels["A starts"]).toEqual(50);
    expect(tl.labels["B starts"]).toEqual(100);
    expect(tl.labels["A ends"]).toEqual(50 + 10);
    expect(tl.labels["C"]).toEqual(0);
    expect(tl.labels["D"]).toEqual(50 + 10);
    expect(getChildAtIndex(tl, 0)._offset).toEqual(tl.labels["A starts"]);
    expect(getChildAtIndex(tl, 1)._offset).toEqual(tl.labels["B starts"]);
    expect(getChildAtIndex(tl, 2)._offset).toEqual(tl.labels["A ends"]);
    expect(getChildAtIndex(tl, 3)._offset).toEqual(tl.labels["C"]);
    expect(getChildAtIndex(tl, 4)._offset).toEqual(tl.labels["D"]);
    expect(tl.duration).toEqual(110); // 100 + 10
  });

  it("Should override tween when adding an animation before multiple keyframe start time on the same property", () => {
    const [$target] = inMotion.$("#target-id");
    const tl = createMotionTimeline({
      autoplay: false,
      defaults: {
        duration: 100,
        ease: "linear",
      },
    })
      .add($target, { translateX: 100, top: 100 })
      .add($target, {
        translateX: [
          { to: 250, duration: 50, delay: 50 },
          { to: 350, duration: 100 },
          { to: 150, duration: 150 },
        ],
      })
      .add($target, { translateX: 15, duration: 200 }, "-=275")
      .add($target, { top: 25, duration: 50 }, 0);

    // expect(getComputedStyle($target).transform).toEqual('translateX(0px)');
    // expect($target.style.top).toEqual('0px');
    expect(getComputedStyle($target).transform).toEqual("");
    expect(getComputedStyle($target).top).toEqual("");
    tl.seek(175);
    expect(getComputedStyle($target).transform).toEqual("translateX(175px)");
    // expect($target.style.top).toEqual('25px');
    expect(getComputedStyle($target).top).toEqual("25px");
    tl.seek(275);
    expect(getComputedStyle($target).transform).toEqual("translateX(95px)");
    tl.seek(375);
    expect(getComputedStyle($target).transform).toEqual("translateX(15px)");
    tl.seek(tl.duration);
    expect(getComputedStyle($target).transform).toEqual("translateX(15px)");
    tl.seek(275);
    expect(getComputedStyle($target).transform).toEqual("translateX(95px)");
  });

  it("Should compose tween with multiple timelines", () => {
    const [$target] = inMotion.$("#target-id");
    const tl1 = createMotionTimeline({
      autoplay: false,
      defaults: {
        duration: 100,
        ease: "linear",
      },
    })
      .add($target, { x: 100 })
      .add($target, { x: 200 })
      .init();

    tl1.seek(200);

    const tl2 = createMotionTimeline({
      autoplay: false,
      defaults: {
        duration: 100,
        ease: "linear",
      },
    })
      .add($target, { x: -100 })
      .init();

    tl2.seek(0);

    // TL 2 should correctly starts at 200px
    expect(getComputedStyle($target).transform).toEqual("translateX(200px)");
  });

  it("Should set initial tween value on loop", () => {
    const [$target1, $target2] = inMotion.$(".target-class");
    const tl = createMotionTimeline({
      autoplay: false,
      loop: 2,
      defaults: {
        duration: 100,
        ease: "linear",
      },
    })
      .add($target1, { translateX: 100 })
      .add($target1, { opacity: 0 })
      .add($target2, { translateX: 100 })
      .add($target2, { opacity: 0 });

    expect(getComputedStyle($target1).transform).toEqual("");
    expect(getComputedStyle($target2).transform).toEqual("");
    tl.seek(50);
    expect(getComputedStyle($target1).transform).toEqual("translateX(50px)");
    expect(getComputedStyle($target1).opacity).toEqual("");
    expect(getComputedStyle($target2).transform).toEqual("");
    expect(getComputedStyle($target2).opacity).toEqual("");
    tl.seek(100);
    expect(getComputedStyle($target1).transform).toEqual("translateX(100px)");
    expect(getComputedStyle($target1).opacity).toEqual("1");
    expect(getComputedStyle($target2).transform).toEqual("");
    expect(getComputedStyle($target2).opacity).toEqual("");
    tl.seek(150);
    expect(getComputedStyle($target1).transform).toEqual("translateX(100px)");
    expect(getComputedStyle($target1).opacity).toEqual("0.5");
    expect(getComputedStyle($target2).transform).toEqual("");
    expect(getComputedStyle($target2).opacity).toEqual("");
    tl.seek(200);
    expect(getComputedStyle($target1).transform).toEqual("translateX(100px)");
    expect(getComputedStyle($target1).opacity).toEqual("0");
    expect(getComputedStyle($target2).transform).toEqual("translateX(0px)");
    expect(getComputedStyle($target2).opacity).toEqual("");
    tl.seek(250);
    expect(getComputedStyle($target1).transform).toEqual("translateX(100px)");
    expect(getComputedStyle($target1).opacity).toEqual("0");
    expect(getComputedStyle($target2).transform).toEqual("translateX(50px)");
    expect(getComputedStyle($target2).opacity).toEqual("");
    tl.seek(300);
    expect(getComputedStyle($target1).transform).toEqual("translateX(100px)");
    expect(getComputedStyle($target1).opacity).toEqual("0");
    expect(getComputedStyle($target2).transform).toEqual("translateX(100px)");
    expect(getComputedStyle($target2).opacity).toEqual("1");
    tl.seek(350);
    expect(getComputedStyle($target1).transform).toEqual("translateX(100px)");
    expect(getComputedStyle($target1).opacity).toEqual("0");
    expect(getComputedStyle($target2).transform).toEqual("translateX(100px)");
    expect(getComputedStyle($target2).opacity).toEqual("0.5");
    tl.seek(400);
    expect(getComputedStyle($target1).transform).toEqual("translateX(0px)");
    expect(getComputedStyle($target1).opacity).toEqual("1");
    expect(getComputedStyle($target2).transform).toEqual("translateX(0px)");
    expect(getComputedStyle($target2).opacity).toEqual("1");
    tl.seek(550);
    expect(getComputedStyle($target1).transform).toEqual("translateX(100px)");
    expect(getComputedStyle($target1).opacity).toEqual("0.5");
    expect(getComputedStyle($target2).transform).toEqual("translateX(0px)");
    expect(getComputedStyle($target2).opacity).toEqual("1");
  });

  it("Should play tween with multiple timelines", (resolve) => {
    const target = { x: 0 };

    setTimeout(() => {
      const tl1 = createMotionTimeline({
        defaults: {
          duration: 100,
          ease: "linear",
        },
      })
        .add(target, { x: 100 })
        .init();
    }, 50);

    setTimeout(() => {
      const tl2 = createMotionTimeline({
        defaults: {
          duration: 100,
          ease: "linear",
        },
      })
        .add(target, { x: -100 })
        .init();
    }, 100);

    setTimeout(() => {
      expect(target.x).toBeLessThan(0);
      resolve();
    }, 150);
  });

  it("Should calculate timeline values", () => {
    const [$target] = inMotion.$("#target-id");
    const tl = createMotionTimeline({
      autoplay: false,
      defaults: {
        duration: 100,
        ease: "linear",
      },
    })
      .add($target, { translateX: 100 })
      .add($target, { translateX: 200 }, "-=50")
      .add($target, { translateX: 300 }, "-=50")
      .add($target, {
        translateX: [
          { to: 250, duration: 50, delay: 50 },
          { to: 350, duration: 100 },
          { to: 150, duration: 150 },
        ],
      });

    expect(getComputedStyle($target).transform).toEqual("");
    tl.seek(25);
    expect(getComputedStyle($target).transform).toEqual("translateX(25px)");
    tl.seek(100);
    expect(getComputedStyle($target).transform).toEqual("translateX(125px)");
    tl.seek(150);
    expect(getComputedStyle($target).transform).toEqual("translateX(212.5px)");
    tl.seek(tl.duration);
    expect(getComputedStyle($target).transform).toEqual("translateX(150px)");
  });

  it("Should correctly render alternate direction timeline children on seek after the animation end", (resolve) => {
    const [$target] = inMotion.$("#target-id");
    const tl = createMotionTimeline({
      loop: 2,
      alternate: true,
      onComplete: (self) => {
        self.seek(40);
        expect(getComputedStyle($target).transform).toEqual(
          "translateX(175px)"
        );
        resolve();
      },
    })
      .add($target, {
        translateX: -100,
        duration: 10,
        loop: 2,
        alternate: true,
        ease: "linear",
      })
      .add(
        $target,
        {
          translateX: 400,
          duration: 10,
          loop: 2,
          alternate: true,
          ease: "linear",
        },
        "-=5"
      );
  });

  it("Should correctly render alternate direction timeline children on seek midway", () => {
    const [$target] = inMotion.$("#target-id");
    const tl = createMotionTimeline({
      loop: 1,
      alternate: true,
      autoplay: false,
    })
      .add($target, {
        translateX: 100,
        duration: 10,
        alternate: true,
        ease: "linear",
      })
      .add(
        $target,
        {
          translateX: 200,
          translateY: 100,
          duration: 10,
          alternate: true,
          ease: "linear",
        },
        "-=5"
      );

    tl.seek(15);
    expect(getComputedStyle($target).transform).toEqual(
      "translateX(200px) translateY(100px)"
    );
    tl.seek(16);
    expect(getComputedStyle($target).transform).toEqual(
      "translateX(185px) translateY(90px)"
    );
    tl.seek(15);
    expect(getComputedStyle($target).transform).toEqual(
      "translateX(200px) translateY(100px)"
    );
    tl.seek(14);
    expect(getComputedStyle($target).transform).toEqual(
      "translateX(185px) translateY(90px)"
    );
  });

  it("Should not render previous tween before last on loop", (resolve) => {
    const [$target] = inMotion.$("#target-id");
    const tl = createMotionTimeline({
      loop: 3,
      onLoop: (self) => {
        self.paused = true;
        expect(
          +getComputedStyle($target).transform.replace(/[^\d.-]/g, "")
        ).toBeGreaterThan(39);
        resolve();
      },
    })
      .add($target, {
        translateY: -100,
        duration: 100,
      })
      .add($target, {
        translateY: 50,
        duration: 100,
      });
  });

  it("Should handle nested timelines", (resolve) => {
    const [$target] = inMotion.$("#target-id");
    let timerLog = false;

    const timer = createMotionTimer({
      duration: 30,
      onUpdate: () => {
        timerLog = true;
      },
    });

    const animation = createMotion($target, {
      x: 100,
      duration: 30,
    });

    createMotionTimeline({
      onComplete: (self) => {
        expect(self.duration).toEqual(50);
        expect(timerLog).toEqual(true);
        expect(
          +getComputedStyle($target).transform.replace(/[^\d.-]/g, "")
        ).toEqual(100);
        resolve();
      },
    })
      .sync(timer)
      .sync(animation, 20);

    expect(timerLog).toEqual(false);
    expect(
      +getComputedStyle($target).transform.replace(/[^\d.-]/g, "")
    ).toEqual(0);
  });

  it("Should add animation and timers as targets", (resolve) => {
    const [$target] = inMotion.$("#target-id");
    let timerLog = false;

    const timer = createMotionTimer({
      onUpdate: () => {
        timerLog = true;
      },
    });

    const animation = createMotion($target, {
      x: 100,
    });

    createMotionTimeline({
      onComplete: (self) => {
        expect(self.duration).toEqual(50);
        expect(timerLog).toEqual(true);
        expect(
          +getComputedStyle($target).transform.replace(/[^\d.-]/g, "")
        ).toEqual(100);
        resolve();
      },
    })
      .add(timer, {
        currentTime: timer.duration,
        duration: 30,
      })
      .add(
        animation,
        {
          currentTime: animation.duration,
          duration: 30,
        },
        20
      );

    expect(timerLog).toEqual(false);
    expect(
      +getComputedStyle($target).transform.replace(/[^\d.-]/g, "")
    ).toEqual(0);
  });

  it("Should add timers", (resolve) => {
    let timer1Log = false;
    let timer2Log = false;
    createMotionTimeline({
      onComplete: () => {
        expect(timer1Log).toEqual(true);
        expect(timer2Log).toEqual(true);
        resolve();
      },
    })
      .add({
        duration: 30,
        onUpdate: () => {
          timer1Log = true;
        },
      })
      .add(
        {
          duration: 30,
          onUpdate: () => {
            timer2Log = true;
          },
        },
        20
      );
  });

  it("Should add 0 duration animation", () => {
    const [$target] = inMotion.$("#target-id");
    const tl = createMotionTimeline({ autoplay: false })
      .add(
        $target,
        {
          y: -100,
          duration: 0,
        },
        2000
      )
      .seek(2000); // y should be -100
    expect(
      +getComputedStyle($target).transform.replace(/[^\d.-]/g, "")
    ).toEqual(-100);
  });

  it("Should set target", () => {
    const [$target] = inMotion.$("#target-id");
    const tl = createMotionTimeline({
      autoplay: false,
    })
      .set(
        $target,
        {
          y: -300,
        },
        2000
      )
      .seek(2000);
    expect(
      +getComputedStyle($target).transform.replace(/[^\d.-]/g, "")
    ).toEqual(-300);
  });

  it("Should mix .set() and .add()", () => {
    const [$target] = inMotion.$("#target-id");
    const tl = createMotionTimeline({
      autoplay: false,
      defaults: {
        ease: "linear",
      },
    })
      .set($target, { translateX: 50 })
      .add($target, {
        duration: 200,
        translateX: 100,
      })
      .set($target, { translateX: 200 })
      .add($target, {
        duration: 200,
        translateX: 400,
      })
      .set(
        $target,
        {
          translateX: -100,
        },
        800
      );
    tl.seek(0);
    expect(
      +getComputedStyle($target).transform.replace(/[^\d.-]/g, "")
    ).toEqual(50);
    tl.seek(100);
    expect(
      +getComputedStyle($target).transform.replace(/[^\d.-]/g, "")
    ).toEqual(75);
    tl.seek(200);
    expect(
      +getComputedStyle($target).transform.replace(/[^\d.-]/g, "")
    ).toEqual(200);
    tl.seek(300);
    expect(
      Math.round(+getComputedStyle($target).transform.replace(/[^\d.-]/g, ""))
    ).toEqual(300);
    tl.seek(800);
    expect(
      +getComputedStyle($target).transform.replace(/[^\d.-]/g, "")
    ).toEqual(-100);
  });

  it("Should call callbacks", (resolve) => {
    let timer1Log = 0;
    let timer2Log = 0;
    let timer3Log = 0;
    const tl = createMotionTimeline({
      onComplete: (self) => {
        expect(timer1Log).toEqual(1);
        expect(timer2Log).toEqual(1);
        expect(timer3Log).toEqual(1);
        expect(self.duration).toEqual(40);
        resolve();
      },
    })
      .call(() => {
        timer1Log += 1;
      }, 0)
      .call(() => {
        timer2Log += 1;
      }, 20)
      .call(() => {
        timer3Log += 1;
      }, 40);
  });

  it("Should call callbacks on a 0 duration timeline", (resolve) => {
    let timer1Log = 0;
    let timer2Log = 0;
    let timer3Log = 0;
    const tl = createMotionTimeline({
      onComplete: (self) => {
        expect(timer1Log).toEqual(1);
        expect(timer2Log).toEqual(1);
        expect(timer3Log).toEqual(1);
        expect(self.duration).toEqual(minValue);
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
      }, 0);
  });

  it("Should call callbacks multiple time via seek", () => {
    let timer1Log = 0;
    let timer2Log = 0;
    let timer3Log = 0;
    const tl = createMotionTimeline({ autoplay: false })
      .call(() => {
        timer1Log += 1;
      }, 0)
      .call(() => {
        timer2Log += 1;
      }, 1000)
      .call(() => {
        timer3Log += 1;
      }, 2000);

    expect(timer1Log).toEqual(0);
    expect(timer2Log).toEqual(0);
    expect(timer3Log).toEqual(0);

    tl.seek(500);

    expect(timer1Log).toEqual(1);
    expect(timer2Log).toEqual(0);
    expect(timer3Log).toEqual(0);

    tl.seek(1000);

    expect(timer1Log).toEqual(1);
    expect(timer2Log).toEqual(1);
    expect(timer3Log).toEqual(0);

    tl.seek(2000);

    expect(timer1Log).toEqual(1);
    expect(timer2Log).toEqual(1);
    expect(timer3Log).toEqual(1);

    tl.seek(1000);

    expect(timer1Log).toEqual(1);
    expect(timer2Log).toEqual(2);
    expect(timer3Log).toEqual(2);

    tl.seek(0);

    expect(timer1Log).toEqual(2);
    expect(timer2Log).toEqual(2);
    expect(timer3Log).toEqual(2);
  });

  it("Should call callbacks with alternate loops", () => {
    let timer1Log = 0;
    let timer2Log = 0;
    let timer3Log = 0;
    const tl = createMotionTimeline({
      autoplay: false,
      alternate: true,
      loop: 3,
    })
      .call(() => {
        timer1Log += 1;
      }, 0)
      .call(() => {
        timer2Log += 1;
      }, 1000)
      .call(() => {
        timer3Log += 1;
      }, 2000);

    expect(timer1Log).toEqual(0);
    expect(timer2Log).toEqual(0);
    expect(timer3Log).toEqual(0);

    tl.seek(500);

    expect(timer1Log).toEqual(1);
    expect(timer2Log).toEqual(0);
    expect(timer3Log).toEqual(0);

    tl.seek(1500);

    expect(timer1Log).toEqual(1);
    expect(timer2Log).toEqual(1);
    expect(timer3Log).toEqual(0);

    tl.seek(2000);

    expect(timer1Log).toEqual(1);
    expect(timer2Log).toEqual(1);
    expect(timer3Log).toEqual(1);

    tl.seek(3000);

    expect(timer1Log).toEqual(1);
    expect(timer2Log).toEqual(2);
    expect(timer3Log).toEqual(1);

    tl.seek(4000);

    expect(timer1Log).toEqual(2);
    expect(timer2Log).toEqual(2);
    expect(timer3Log).toEqual(1);
  });

  it("Should mix .call and .add", () => {
    const $targets = inMotion.$(".target-class");
    let timer1Log = 0;
    let timer2Log = 0;
    let timer3Log = 0;
    const tl = createMotionTimeline({
      loop: 2,
      autoplay: false,
    })
      .set(
        $targets,
        {
          opacity: 0.5,
        },
        0
      )
      .add(
        $targets,
        {
          id: "test",
          duration: 500,
          opacity: [1, 0.5],
          delay: (el, i) => i * 500,
          ease: "steps(1)",
        },
        0
      )
      .call(() => {
        timer1Log += 1;
      }, 0)
      .call(() => {
        timer2Log += 1;
      }, 500)
      .call(() => {
        timer3Log += 1;
      }, 1000)
      .init();

    expect(timer1Log).toEqual(0);
    expect(timer2Log).toEqual(0);
    expect(timer3Log).toEqual(0);
    tl.seek(50);
    expect(getComputedStyle($targets[2]).opacity).toEqual("0.5");
    expect(timer1Log).toEqual(1);
    expect(timer2Log).toEqual(0);
    expect(timer3Log).toEqual(0);
    tl.seek(600);
    expect(getComputedStyle($targets[2]).opacity).toEqual("0.5");
    expect(timer1Log).toEqual(1);
    expect(timer2Log).toEqual(1);
    expect(timer3Log).toEqual(0);
    tl.seek(1000);
    expect(timer1Log).toEqual(1);
    expect(timer2Log).toEqual(1);
    expect(timer3Log).toEqual(1);
    expect(getComputedStyle($targets[2]).opacity).toEqual("1");
  });

  it("Should properly update set values on loop", () => {
    const $targets = inMotion.$(".target-class");
    const tl = createMotionTimeline({
      loop: 2,
      autoplay: false,
    })
      .set(
        $targets,
        {
          opacity: 0.5,
        },
        0
      )
      .add(
        $targets,
        {
          id: "test",
          duration: 500,
          opacity: [1, 0.5],
          delay: (el, i) => i * 500,
          ease: "steps(1)",
        },
        0
      )
      .init();

    tl.seek(1250);
    expect(getComputedStyle($targets[2]).opacity).toEqual("1");
    tl.seek(1750);
    expect(getComputedStyle($targets[2]).opacity).toEqual("0.5");
  });

  it("Should remove nested animations", (resolve) => {
    const [$target] = inMotion.$("#target-id");
    let timerLog = false;

    const timer = createMotionTimer({
      duration: 30,
      onUpdate: () => {
        timerLog = true;
      },
    });

    const animation = createMotion($target, {
      x: 100,
      duration: 30,
    });

    const tl = createMotionTimeline({
      onComplete: (self) => {
        expect(self.duration).toEqual(50);
        expect(timerLog).toEqual(true);
        expect(
          +getComputedStyle($target).transform.replace(/[^\d.-]/g, "")
        ).toEqual(0);
        resolve();
      },
    })
      .sync(timer)
      .sync(animation, 20);

    expect(timerLog).toEqual(false);
    expect(
      +getComputedStyle($target).transform.replace(/[^\d.-]/g, "")
    ).toEqual(0);

    tl.remove(animation);
  });
});
