// Clean test for animation.ts without any dom or dom related structures
import {
  createMotion,
  createMotionAnimation,
  JSAnimation,
} from "../src/animation.ts";
import { tweenTypes, minValue } from "../src/consts.ts";
import { createMotionTimer } from "../src/timer.ts";
import { getChildAtIndex, getChildLength } from "../src/utils/index.ts";
import { InMotion } from "../src/engine.ts";
import { test } from "@inspatial/test";

test("Should create motion animation", () => {
  const testObject = { x: 0, y: 0 };

  const animation = createMotion(testObject, {
    x: 100,
    y: 100,
    duration: 100,
    autoplay: false,
  });

  if (!animation) throw new Error("Animation not created");
  if (typeof animation.play !== "function")
    throw new Error("Animation.play is not a function");
  if (typeof animation.pause !== "function")
    throw new Error("Animation.pause is not a function");
});

test("Should handle plain values with createMotionAnimation", () => {
  const testObject = { value: 10 };

  // Create animatable with a 'value' property
  const animatable = createMotionAnimation(testObject, {
    value: 100, // This creates a 'value' function on the animatable
  });

  if (!animatable) throw new Error("Animatable not created");
  if (typeof animatable.value !== "function")
    throw new Error("Animatable.value is not a function");

  // Test that we can call the value function
  const currentValue = animatable.value();
  if (typeof currentValue !== "number")
    throw new Error("Value function should return a number");
});

test("Should create timer", () => {
  const timer = createMotionTimer({
    duration: 100,
    onUpdate: () => {},
    autoplay: false,
  });

  if (!timer) throw new Error("Timer not created");
  if (typeof timer.play !== "function")
    throw new Error("Timer.play is not a function");
  if (typeof timer.pause !== "function")
    throw new Error("Timer.pause is not a function");
});

test("Should handle utils functions with InMotion objects", () => {
  // Create an animation to test the linked list utilities
  const testObject = { x: 0 };
  const animation = createMotion(testObject, {
    x: 100,
    duration: 100,
    autoplay: false,
  });

  // Test with the animation object which has the internal structure
  const length = getChildLength(animation);
  if (typeof length !== "number")
    throw new Error(`Expected length to be a number, got ${typeof length}`);

  // Test getChildAtIndex with the animation
  const firstChild = getChildAtIndex(animation, 0);
  // This might be null if there are no children, which is valid
  if (firstChild !== null && typeof firstChild !== "object") {
    throw new Error(
      `Expected first child to be object or null, got ${typeof firstChild}`
    );
  }
});

test("Should export InMotion engine instance", () => {
  if (!InMotion) throw new Error("InMotion is not defined");
  if (typeof InMotion !== "object")
    throw new Error("InMotion is not an object");

  // Check that it has engine methods
  if (typeof InMotion.pause !== "function")
    throw new Error("InMotion.pause is not a function");
  if (typeof InMotion.resume !== "function")
    throw new Error("InMotion.resume is not a function");
  if (typeof InMotion.update !== "function")
    throw new Error("InMotion.update is not a function");
});

test("Should handle constants", () => {
  if (typeof tweenTypes !== "object")
    throw new Error("tweenTypes is not an object");
  if (typeof minValue !== "number") throw new Error("minValue is not a number");
  if (minValue <= 0) throw new Error("minValue should be greater than 0");
});

test("Should create JSAnimation instance", () => {
  const testObject = { opacity: 0 };
  const animation = new JSAnimation(testObject, {
    opacity: 1,
    duration: 100,
    autoplay: false,
  });

  if (!animation) throw new Error("JSAnimation not created");
  if (typeof animation.play !== "function")
    throw new Error("JSAnimation.play is not a function");
  if (typeof animation.pause !== "function")
    throw new Error("JSAnimation.pause is not a function");
  if (typeof animation.init !== "function")
    throw new Error("JSAnimation.init is not a function");
});
