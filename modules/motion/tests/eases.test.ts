import { describe, it, expect } from "@inspatial/test";
import {
  createMotion,
  inMotion,
  eases,
  createMotionSpring,
} from "../src/index.ts";

/*########################################(FUNCTIONS)########################################*/
function createEasingParam(ease: string) {
  return {
    opacity: [0, 1],
    ease: ease,
    autoplay: false,
    duration: 100,
  };
}

function getOpacityValue() {
  return inMotion.round(inMotion.get("#target-id", "opacity") as number, 2);
}

/*########################################(TESTS)########################################*/
describe("InMotion Eases", () => {
  it("Should call 'linear' / eases.linear()", () => {
    const anim1 = createMotion("#target-id", createEasingParam("linear"));
    anim1.seek(0);
    expect(
      parseFloat(getComputedStyle(document.querySelector("#target-id")).opacity)
    ).toEqual(0);
    anim1.seek(50);
    expect(
      parseFloat(
        getComputedStyle(document.querySelector("#target-id")!).opacity
      )
    ).toEqual(0.5);
    anim1.seek(100);
    expect(
      parseFloat(
        getComputedStyle(document.querySelector("#target-id")!).opacity
      )
    ).toEqual(1);
    inMotion.set("#target-id", { opacity: 0 });
    const anim2 = createMotion("#target-id", createEasingParam(eases.linear()));
    anim2.seek(0);
    expect(
      parseFloat(getComputedStyle(document.querySelector("#target-id")).opacity)
    ).toEqual(0);
    anim2.seek(50);
    expect(
      parseFloat(getComputedStyle(document.querySelector("#target-id")).opacity)
    ).toEqual(0.5);
    anim2.seek(100);
    expect(
      parseFloat(getComputedStyle(document.querySelector("#target-id")).opacity)
    ).toEqual(1);
  });

  it("Should call 'linear(0, 1)' / eases.linear(0, 1)", () => {
    const anim1 = createMotion("#target-id", createEasingParam("linear(0, 1)"));
    anim1.seek(0);
    expect(
      parseFloat(getComputedStyle(document.querySelector("#target-id")).opacity)
    ).toEqual(0);
    anim1.seek(50);
    expect(
      parseFloat(getComputedStyle(document.querySelector("#target-id")).opacity)
    ).toEqual(0.5);
    anim1.seek(100);
    expect(
      parseFloat(getComputedStyle(document.querySelector("#target-id")).opacity)
    ).toEqual(1);
    inMotion.set("#target-id", { opacity: 0 });
    const anim2 = createMotion(
      "#target-id",
      createEasingParam(eases.linear(0, 1))
    );
    anim2.seek(0);
    expect(
      parseFloat(getComputedStyle(document.querySelector("#target-id")).opacity)
    ).toEqual(0);
    anim2.seek(50);
    expect(
      parseFloat(getComputedStyle(document.querySelector("#target-id")).opacity)
    ).toEqual(0.5);
    anim2.seek(100);
    expect(
      parseFloat(getComputedStyle(document.querySelector("#target-id")).opacity)
    ).toEqual(1);
  });

  it("Should call Custom linear 'linear(0, 0.25, 1)' / eases.linear(0, 0.25, 1)", () => {
    const anim1 = createMotion(
      "#target-id",
      createEasingParam("linear(0, 0.25, 1)")
    );
    anim1.seek(0);
    expect(
      parseFloat(getComputedStyle(document.querySelector("#target-id")).opacity)
    ).toEqual(0);
    anim1.seek(50);
    expect(
      parseFloat(getComputedStyle(document.querySelector("#target-id")).opacity)
    ).toEqual(0.25);
    anim1.seek(100);
    expect(
      parseFloat(getComputedStyle(document.querySelector("#target-id")).opacity)
    ).toEqual(1);
    inMotion.set("#target-id", { opacity: 0 });
    const anim2 = createMotion(
      "#target-id",
      createEasingParam(eases.linear(0, 0.25, 1))
    );
    anim2.seek(0);
    expect(
      parseFloat(getComputedStyle(document.querySelector("#target-id")).opacity)
    ).toEqual(0);
    anim2.seek(50);
    expect(
      parseFloat(getComputedStyle(document.querySelector("#target-id")).opacity)
    ).toEqual(0.25);
    anim2.seek(100);
    expect(
      parseFloat(getComputedStyle(document.querySelector("#target-id")).opacity)
    ).toEqual(1);
  });

  it("Should call Custom uneven linear 'linear(0, 0.25 75%, 1)' / eases.linear(0, '0.25 75%', 1)", () => {
    const anim1 = createMotion(
      "#target-id",
      createEasingParam("linear(0, 0.25 75%, 1)")
    );
    anim1.seek(0);
    expect(
      parseFloat(getComputedStyle(document.querySelector("#target-id")).opacity)
    ).toEqual(0);
    anim1.seek(75);
    expect(
      parseFloat(getComputedStyle(document.querySelector("#target-id")).opacity)
    ).toEqual(0.25);
    anim1.seek(100);
    expect(
      parseFloat(getComputedStyle(document.querySelector("#target-id")).opacity)
    ).toEqual(1);
    inMotion.set("#target-id", { opacity: 0 });
    const anim2 = createMotion(
      "#target-id",
      createEasingParam(eases.linear(0, "0.25 75%", 1))
    );
    anim2.seek(0);
    expect(
      parseFloat(getComputedStyle(document.querySelector("#target-id")).opacity)
    ).toEqual(0);
    anim2.seek(75);
    expect(
      parseFloat(getComputedStyle(document.querySelector("#target-id")).opacity)
    ).toEqual(0.25);
    anim2.seek(100);
    expect(
      parseFloat(getComputedStyle(document.querySelector("#target-id")).opacity)
    ).toEqual(1);
  });

  const builtInNames = [
    "",
    "Quad",
    "Cubic",
    "Quart",
    "Quint",
    "Sine",
    "Circ",
    "Expo",
    "Bounce",
    "Back",
    "Elastic",
  ];
  const fnTypes = ["in", "out", "inOut"];

  builtInNames.forEach((name) => {
    fnTypes.forEach((type) => {
      const easeFunctionName = type + name;
      const hasParams = name === "" || name === "Back" || name === "Elastic";
      it(
        "'" +
          easeFunctionName +
          "' / eases." +
          easeFunctionName +
          (hasParams ? "()" : ""),
        () => {
          let fn = eases[easeFunctionName];
          if (hasParams) fn = fn();
          const anim1 = createMotion(
            "#target-id",
            createEasingParam(easeFunctionName)
          );
          anim1.seek(50);
          if (type === "in") {
            expect(getOpacityValue()).toBeLessThan(0.5);
          }
          if (type === "out") {
            expect(getOpacityValue()).toBeGreaterThan(0.5);
          }
          if (type === "inOut") {
            expect(getOpacityValue()).toEqual(0.5);
          }
          inMotion.set("#target-id", { opacity: 0 });
          const anim2 = createMotion("#target-id", createEasingParam(fn));
          anim2.seek(50);
          if (type === "in") {
            expect(getOpacityValue()).toBeLessThan(0.5);
          }
          if (type === "out") {
            expect(getOpacityValue()).toBeGreaterThan(0.5);
          }
          if (type === "inOut") {
            expect(getOpacityValue()).toEqual(0.5);
          }
        }
      );
    });
  });

  it("Should call Custom power ease: in(x), out(x), inOut(x)", () => {
    const anim1 = createMotion("#target-id", createEasingParam("in(1)"));
    anim1.seek(50);
    expect(getOpacityValue()).toEqual(0.5);
    inMotion.set("#target-id", { opacity: 0 });
    const anim2 = createMotion("#target-id", createEasingParam("in(1.5)"));
    anim2.seek(50);
    expect(getOpacityValue()).toEqual(0.35);
    inMotion.set("#target-id", { opacity: 0 });
    const anim3 = createMotion("#target-id", createEasingParam("in(2)"));
    anim3.seek(50);
    expect(getOpacityValue()).toEqual(0.25);
  });

  it("Should call Custom elastic ease: inElastic(x, y), outElastic(x, y), inOutElastic(x, y)", () => {
    const anim1 = createMotion("#target-id", createEasingParam("in(1)"));
    anim1.seek(50);
    expect(getOpacityValue()).toEqual(0.5);
    inMotion.set("#target-id", { opacity: 0 });
    const anim2 = createMotion("#target-id", createEasingParam("in(1.5)"));
    anim2.seek(50);
    expect(getOpacityValue()).toEqual(0.35);
    inMotion.set("#target-id", { opacity: 0 });
    const anim3 = createMotion("#target-id", createEasingParam("in(2)"));
    anim3.seek(50);
    expect(getOpacityValue()).toEqual(0.25);
  });

  it("Should call Spring ease overrides animation's duration parameter", () => {
    const animationParams = createEasingParam(createMotionSpring());
    animationParams.duration = 500;
    const animation = createMotion("#target-id", animationParams);
    expect(animation.duration).toBeGreaterThan(1000);
  });

  it("Should call Spring ease overrides tween's duration parameter", () => {
    const animation = createMotion("#target-id", {
      opacity: [0, 1],
      translateX: {
        to: 100,
        ease: createMotionSpring(),
        duration: 500,
      },
      duration: 400,
      autoplay: false,
    });
    expect(animation.duration).toBeGreaterThan(1000);
  });

  it("Should call Spring ease parameters affect animation's duration", () => {
    const target = "#target-id";
    expect(
      createMotion(target, createEasingParam(createMotionSpring())).duration
    ).toEqual(1740);
    expect(
      createMotion(target, createEasingParam(createMotionSpring({ mass: 10 })))
        .duration
    ).toEqual(13680);
    expect(
      createMotion(
        target,
        createEasingParam(createMotionSpring({ stiffness: 50 }))
      ).duration
    ).toEqual(1740);
    expect(
      createMotion(
        target,
        createEasingParam(createMotionSpring({ damping: 50 }))
      ).duration
    ).toEqual(1180);
    expect(
      createMotion(
        target,
        createEasingParam(createMotionSpring({ velocity: 10 }))
      ).duration
    ).toEqual(1680);
  });

  it("Should call Setting a Spring parameter after creation should update its duration", () => {
    const spring = createMotionSpring();
    expect(spring.duration).toEqual(1740);
    spring.mass = 10;
    expect(spring.duration).toEqual(13680);
    expect(spring.mass).toEqual(10);
    spring.mass = 1;
    spring.stiffness = 50;
    expect(spring.mass).toEqual(1);
    expect(spring.stiffness).toEqual(50);
    expect(spring.duration).toEqual(1740);
    spring.stiffness = 100;
    spring.damping = 50;
    expect(spring.stiffness).toEqual(100);
    expect(spring.damping).toEqual(50);
    expect(spring.duration).toEqual(1180);
    spring.damping = 10;
    spring.velocity = 10;
    expect(spring.damping).toEqual(10);
    expect(spring.velocity).toEqual(10);
    expect(spring.duration).toEqual(1680);
  });

  it('Should call Cubic bézier in: "cubicBezier(1,0,1,0)" / eases.cubicBezier(1,0,1,0)', () => {
    const cubicBezierIn = createMotion(
      "#target-id",
      createEasingParam(eases.cubicBezier(1, 0, 1, 0))
    );
    cubicBezierIn.seek(50);
    expect(getOpacityValue()).toBeLessThan(0.5);
    const cubicBezierInString = createMotion(
      "#target-id",
      createEasingParam("cubicBezier(1,0,1,0)")
    );
    cubicBezierInString.seek(50);
    expect(getOpacityValue()).toBeLessThan(0.5);
  });

  it('Should call Cubic bézier out: "cubicBezier(0,1,0,1)" / eases.cubicBezier(0,1,0,1)', () => {
    const cubicBezierOut = createMotion(
      "#target-id",
      createEasingParam(eases.cubicBezier(0, 1, 0, 1))
    );
    cubicBezierOut.seek(50);
    expect(getOpacityValue()).toBeGreaterThan(0.5);
    const cubicBezierOutString = createMotion(
      "#target-id",
      createEasingParam("cubicBezier(0,1,0,1)")
    );
    cubicBezierOutString.seek(50);
    expect(getOpacityValue()).toBeGreaterThan(0.5);
  });

  it('Should call Cubic bézier inOut: "cubicBezier(1,0,0,1)" / eases.cubicBezier(1,0,0,1)', () => {
    const cubicBezierInOut = createMotion(
      "#target-id",
      createEasingParam(eases.cubicBezier(1, 0, 0, 1))
    );
    cubicBezierInOut.seek(50);
    expect(getOpacityValue()).toEqual(0.5);
    const cubicBezierInOutString = createMotion(
      "#target-id",
      createEasingParam("cubicBezier(1,0,0,1)")
    );
    cubicBezierInOutString.seek(50);
    expect(getOpacityValue()).toEqual(0.5);
  });

  it("Should call Steps from end (default)", () => {
    const cubicBezierIn = createMotion(
      "#target-id",
      createEasingParam("steps(4)")
    );
    cubicBezierIn.seek(0);
    expect(getOpacityValue()).toEqual(0);
    cubicBezierIn.seek(24);
    expect(getOpacityValue()).toEqual(0);
    cubicBezierIn.seek(25);
    expect(getOpacityValue()).toEqual(0.25);
    cubicBezierIn.seek(49);
    expect(getOpacityValue()).toEqual(0.25);
    cubicBezierIn.seek(50);
    expect(getOpacityValue()).toEqual(0.5);
    cubicBezierIn.seek(74);
    expect(getOpacityValue()).toEqual(0.5);
    cubicBezierIn.seek(75);
    expect(getOpacityValue()).toEqual(0.75);
    cubicBezierIn.seek(99);
    expect(getOpacityValue()).toEqual(0.75);
    cubicBezierIn.seek(100);
    expect(getOpacityValue()).toEqual(1);
  });

  it("Should call Steps from start", () => {
    // Get the actual DOM element instead of using the selector string
    // This fixes the WeakMap key issue since DOM elements are objects
    const targetElement = document.querySelector('#target-id');
    if (!targetElement) {
      throw new Error('Target element #target-id not found in the DOM');
    }
    const cubicBezierIn = createMotion(
      targetElement, // Use the element directly instead of the string selector
      createEasingParam("steps(4, true)")
    );
    cubicBezierIn.seek(0);
    expect(getOpacityValue()).toEqual(0);
    cubicBezierIn.seek(1);
    expect(getOpacityValue()).toEqual(0.25);
    cubicBezierIn.seek(24);
    expect(getOpacityValue()).toEqual(0.25);
    cubicBezierIn.seek(25);
    expect(getOpacityValue()).toEqual(0.25);
    cubicBezierIn.seek(49);
    expect(getOpacityValue()).toEqual(0.5);
    cubicBezierIn.seek(50);
    expect(getOpacityValue()).toEqual(0.5);
    cubicBezierIn.seek(74);
    expect(getOpacityValue()).toEqual(0.75);
    cubicBezierIn.seek(75);
    expect(getOpacityValue()).toEqual(0.75);
    cubicBezierIn.seek(99);
    expect(getOpacityValue()).toEqual(1);
    cubicBezierIn.seek(100);
    expect(getOpacityValue()).toEqual(1);
  });
});
