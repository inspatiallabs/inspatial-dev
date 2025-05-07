import { test, expect, describe } from "@inspatial/test";
import { spy, mockFn } from "../../test/src/mock/mock.ts";
import {
  createRoot,
  createEffect,
  createSignal,
  untrack,
} from "../signal/src/index.ts";
import { createTestSpy, createEffectAdapter } from "./test-helpers.ts";
// Import our test setup
import "./test-setup.ts";

test("should not create dependency", () => {
  let lastCount = 0;
  const [count, setCount] = createSignal(0);
  const [other, setOther] = createSignal(0);
  const effectFn = createTestSpy();

  createRoot(() => {
    createEffectAdapter(() => {
      lastCount = untrack(() => count());
      other();
      effectFn();
    });
  });

  // Initial run
  expect(lastCount).toBe(0);
  expect(effectFn).toHaveBeenCalledTimes(1);

  setCount(1);
  // Shouldn't cause rerun, since we read count inside untrack
  expect(lastCount).toBe(0);
  expect(effectFn).toHaveBeenCalledTimes(1);

  setOther(1);
  // Should rerun, but lastCount should still be 0 since we haven't run again
  expect(lastCount).toBe(1);
  expect(effectFn).toHaveBeenCalledTimes(2);
});

test("should not affect deep dependency being created", () => {
  let lastCount = 0;
  const [count, setCount] = createSignal(0);
  const [other, setOther] = createSignal(0);
  const effectFn = createTestSpy();

  createRoot(() => {
    createEffectAdapter(() => {
      untrack(() => {
        count();
        createEffectAdapter(() => {
          lastCount = count();
          effectFn();
        });
      });
      other();
    });
  });

  // Initial run
  expect(lastCount).toBe(0);
  expect(effectFn).toHaveBeenCalledTimes(1);

  setCount(1);
  // Should cause rerun, since our createEffect inside untrack still has count as a dependency
  expect(lastCount).toBe(1);
  expect(effectFn).toHaveBeenCalledTimes(2);

  setOther(1);
  // Should not trigger a rerun of the inner effect
  expect(lastCount).toBe(1);
  expect(effectFn).toHaveBeenCalledTimes(2);
});

test("should track owner across peeks", () => {
  let secondUseCount = 0;
  let secondValue;
  const effectFn = createTestSpy();

  createRoot(() => {
    const [s1, set1] = createSignal(1);
    const [s2, set2] = createSignal(2);

    const derived = () => {
      // createEffect runs here
      untrack(() => {
        secondUseCount++;
      });
      return s1() + s2();
    };

    createEffectAdapter(() => {
      // first effect sees s1, s2, derived
      secondValue = derived();
      effectFn(secondValue);
    });

    set2(3);
  });

  expect(effectFn).toHaveBeenCalledWith(5);
  expect(secondUseCount).toBe(2);
});
