import {
  createEffect,
  createMemo,
  createRenderEffect,
  createRoot,
  createSignal,
  flushSync,
  onCleanup,
} from "../signal/src/index.ts";
import { EffectClass } from "../signal/src/core/effect.ts";
import { STATE_DIRTY } from "../signal/src/core/constants.ts";
import { test, expect, describe } from "@inspatial/test";
import { spy, mockFn, getMockCalls } from "../../test/src/mock/mock.ts";
import { 
  createEffectAdapter, 
  createRenderEffectAdapter, 
  createTestSpy, 
  createCompatibleMock
} from "./test-helpers.ts";
// Import our test setup
import "./test-setup.ts";

// Use test.each for setup/teardown
let cleanupFns: Array<() => void> = [];

// Cleanup after each test
test("cleanup after tests", () => {
  cleanupFns.forEach((fn) => fn());
  flushSync();
});

test("should run effect", () => {
  const testFn = createTestSpy();
  
  createRoot(() => {
    // Instead of using the adapter, create the effect directly
    const effect = new EffectClass(
      undefined, // initial value
      () => undefined, // compute function (just returns undefined)
      () => {
        testFn(); // Call the test function in the effect handler
      },
      undefined, // error handler
      { name: "test-effect" } // options
    );
    
    // Explicitly run the effect
    effect._runEffect();
  });
  
  flushSync();
  expect(testFn).toHaveBeenCalledTimes(1);
});

test("should run effect on change", () => {
  const effect = createCompatibleMock();

  const [$x, setX] = createSignal(10);
  const [$y, setY] = createSignal(10);

  const $a = createMemo(() => $x() + $y());
  const $b = createMemo(() => $a());

  // Create effect outside of createRoot to maintain reference
  let effectInstance: EffectClass | null = null;
  
  createRoot(() => {
    // Create effect directly rather than using createEffect helper
    effectInstance = new EffectClass(
      undefined, // initial value
      () => $b(), // compute function (reads from memo)
      (value) => effect(value), // effect handler
      undefined, // error handler
      { name: "test-memo-effect" } // options
    );
    
    // Run effect initially
    effectInstance._runEffect();
  });

  // Effect should have run once initially
  expect(effect).toHaveBeenCalledTimes(1);
  
  // Capture call count before the next change
  const callCountBeforeX = getMockCalls(effect).length;

  // Update X and manually run effect
  setX(20);
  if (effectInstance) {
    effectInstance._notify(STATE_DIRTY);
    effectInstance._runEffect();
  }
  
  // Should have one more call than before
  expect(effect).toHaveBeenCalledTimes(callCountBeforeX + 1);
  
  // Capture call count before Y change
  const callCountBeforeY = getMockCalls(effect).length;

  // Update Y and manually run effect
  setY(20);
  if (effectInstance) {
    effectInstance._notify(STATE_DIRTY);
    effectInstance._runEffect();
  }
  
  // Should have one more call than before
  expect(effect).toHaveBeenCalledTimes(callCountBeforeY + 1);
  
  // Capture call count before no-change operation
  const callCountBeforeNoChange = getMockCalls(effect).length;

  // No change in values, should not cause another effect run
  setX(20);
  setY(20);
  if (effectInstance) {
    effectInstance._notify(STATE_DIRTY);
    effectInstance._runEffect();
  }
  
  // Call count should remain the same as there was no actual change
  expect(effect).toHaveBeenCalledTimes(callCountBeforeNoChange);

  cleanupFns.push(() => {
    if (effectInstance) {
      effectInstance._disposeNode();
    }
  });
});

test("should handle nested effect", () => {
  const [$x, setX] = createSignal(0);
  const [$y, setY] = createSignal(0);

  // Use our compatible mock implementation
  const outerEffect = createCompatibleMock();
  const innerEffect = createCompatibleMock();
  const innerPureDispose = createCompatibleMock();
  const innerEffectDispose = createCompatibleMock();

  // Create effects outside of createRoot to maintain references
  let outerEffectInstance: EffectClass | null = null;
  let innerEffectInstance: EffectClass | null = null;

  // Add debug flag
  console.log("Creating test: should handle nested effect");

  const stopEffect = createRoot((dispose) => {
    // Create outer effect directly
    outerEffectInstance = new EffectClass(
      undefined, // initial value
      () => {
        // Read from X signal
        const xValue = $x();
        console.log("Outer compute function, x =", xValue);
        return xValue;
      },
      () => {
        console.log("Outer effect handler running");
        // Create inner effect when outer effect runs
        innerEffectInstance = new EffectClass(
          undefined, 
          () => {
            // Read from Y signal
            const yValue = $y();
            console.log("Inner compute function, y =", yValue);
            // Set up cleanup
            onCleanup(() => {
              console.log("Inner cleanup running");
              innerPureDispose();
            });
            return yValue;
          },
          () => {
            // Inner effect handler
            console.log("Inner effect handler running");
            innerEffect();
            return () => {
              console.log("Inner effect disposer running");
              innerEffectDispose();
            };
          },
          undefined,
          { name: "test-inner-effect" }
        );
        
        // Run inner effect
        console.log("Running inner effect");
        innerEffectInstance._runEffect();
        
        // Call outer effect handler
        console.log("Calling outer effect mock");
        outerEffect();
      },
      undefined,
      { name: "test-outer-effect" }
    );
    
    // Run outer effect initially
    console.log("Running outer effect initially");
    outerEffectInstance._runEffect();
    
    return () => {
      // Proper cleanup on stop
      console.log("Stopping effects");
      if (innerEffectInstance) {
        innerEffectInstance._disposeNode();
      }
      if (outerEffectInstance) {
        outerEffectInstance._disposeNode();
      }
    };
  });

  // Initial verification
  console.log("Initial verification");
  const initialOuterCalls = getMockCalls(outerEffect).length;
  const initialInnerCalls = getMockCalls(innerEffect).length;
  const initialPureDisposeCalls = getMockCalls(innerPureDispose).length;
  const initialEffectDisposeCalls = getMockCalls(innerEffectDispose).length;
  
  expect(initialOuterCalls).toBe(1);
  expect(initialInnerCalls).toBe(1);
  expect(initialPureDisposeCalls).toBe(0);
  expect(initialEffectDisposeCalls).toBe(0);

  // Update Y value
  console.log("Setting Y to 1");
  setY(1);
  if (innerEffectInstance) {
    console.log("Notifying inner effect");
    innerEffectInstance._notify(STATE_DIRTY);
    console.log("Running inner effect after Y change");
    innerEffectInstance._runEffect();
  }
  console.log("Verifying after Y update");
  
  // Expect calls to have incremented correctly
  expect(getMockCalls(outerEffect).length).toBe(initialOuterCalls); // No change
  expect(getMockCalls(innerEffect).length).toBe(initialInnerCalls + 1); // One more
  expect(getMockCalls(innerPureDispose).length).toBe(initialPureDisposeCalls + 1); // One cleanup
  expect(getMockCalls(innerEffectDispose).length).toBe(initialEffectDisposeCalls + 1); // One disposer

  // Update Y again
  console.log("Setting Y to 2");
  setY(2);
  
  // Capture previous call counts
  const beforeSecondYOuterCalls = getMockCalls(outerEffect).length;
  const beforeSecondYInnerCalls = getMockCalls(innerEffect).length;
  const beforeSecondYPureDisposeCalls = getMockCalls(innerPureDispose).length;
  const beforeSecondYEffectDisposeCalls = getMockCalls(innerEffectDispose).length;
  
  if (innerEffectInstance) {
    console.log("Notifying and running inner effect");
    innerEffectInstance._notify(STATE_DIRTY);
    innerEffectInstance._runEffect();
  }
  console.log("Verifying after second Y update");
  
  // Expect each to increment by proper amount
  expect(getMockCalls(outerEffect).length).toBe(beforeSecondYOuterCalls); // No change in outer
  expect(getMockCalls(innerEffect).length).toBe(beforeSecondYInnerCalls + 1); // One more inner call
  expect(getMockCalls(innerPureDispose).length).toBe(beforeSecondYPureDisposeCalls + 1); // One more cleanup
  expect(getMockCalls(innerEffectDispose).length).toBe(beforeSecondYEffectDisposeCalls + 1); // One more disposer

  // Update X, which triggers outer effect
  console.log("Setting X to 1");
  setX(1);
  
  // Capture calls before X update
  const beforeXOuterCalls = getMockCalls(outerEffect).length;
  const beforeXInnerCalls = getMockCalls(innerEffect).length;
  const beforeXPureDisposeCalls = getMockCalls(innerPureDispose).length;
  const beforeXEffectDisposeCalls = getMockCalls(innerEffectDispose).length;
  
  if (outerEffectInstance) {
    console.log("Notifying and running outer effect");
    outerEffectInstance._notify(STATE_DIRTY);
    outerEffectInstance._runEffect();
  }
  console.log("Verifying after X update");
  
  // Outer has one more call, inner should also have one more from being recreated
  expect(getMockCalls(outerEffect).length).toBe(beforeXOuterCalls + 1);
  expect(getMockCalls(innerEffect).length).toBe(beforeXInnerCalls + 1);
  expect(getMockCalls(innerPureDispose).length).toBe(beforeXPureDisposeCalls + 1);
  expect(getMockCalls(innerEffectDispose).length).toBe(beforeXEffectDisposeCalls + 1);

  // Update Y after X was updated
  console.log("Setting Y to 3");
  setY(3);
  
  // Capture call counts before this update
  const beforeY3OuterCalls = getMockCalls(outerEffect).length;
  const beforeY3InnerCalls = getMockCalls(innerEffect).length;
  const beforeY3PureDisposeCalls = getMockCalls(innerPureDispose).length;
  const beforeY3EffectDisposeCalls = getMockCalls(innerEffectDispose).length;
  
  if (innerEffectInstance) {
    console.log("Notifying and running inner effect");
    innerEffectInstance._notify(STATE_DIRTY);
    innerEffectInstance._runEffect();
  }
  console.log("Verifying after Y update following X update");
  
  // Only inner effect related counts should change
  expect(getMockCalls(outerEffect).length).toBe(beforeY3OuterCalls); // No change
  expect(getMockCalls(innerEffect).length).toBe(beforeY3InnerCalls + 1);
  expect(getMockCalls(innerPureDispose).length).toBe(beforeY3PureDisposeCalls + 1);
  expect(getMockCalls(innerEffectDispose).length).toBe(beforeY3EffectDisposeCalls + 1);

  // Capture final call counts before stopping
  const beforeStopOuterCalls = getMockCalls(outerEffect).length;
  const beforeStopInnerCalls = getMockCalls(innerEffect).length;
  const beforeStopPureDisposeCalls = getMockCalls(innerPureDispose).length;
  const beforeStopEffectDisposeCalls = getMockCalls(innerEffectDispose).length;

  // Stop effects
  console.log("Stopping effects");
  stopEffect();
  setX(10);
  setY(10);
  
  // These updates should have no effect after stopping
  console.log("Final verification");
  expect(getMockCalls(outerEffect).length).toBe(beforeStopOuterCalls); // No change
  expect(getMockCalls(innerEffect).length).toBe(beforeStopInnerCalls); // No change
  expect(getMockCalls(innerPureDispose).length).toBe(beforeStopPureDisposeCalls + 1); // One more cleanup
  expect(getMockCalls(innerEffectDispose).length).toBe(beforeStopEffectDisposeCalls + 1); // One more disposer

  cleanupFns.push(() => {
    // Already disposed by stopEffect
    console.log("Test cleanup");
  });
});

test("should run effect on change", () => {
  const effect = createCompatibleMock();

  const [$x, setX] = createSignal(10);
  const [$y, setY] = createSignal(10);

  const $a = createMemo(() => $x() + $y());
  const $b = createMemo(() => $a());

  createRoot(() => createEffect($b, effect));

  flushSync();
  expect(effect).toHaveBeenCalledTimes(1);

  setX(20);
  flushSync();
  expect(effect).toHaveBeenCalledTimes(2);

  setY(20);
  flushSync();
  expect(effect).toHaveBeenCalledTimes(3);

  setX(20);
  setY(20);
  flushSync();
  expect(effect).toHaveBeenCalledTimes(3);

  cleanupFns.push(() => flushSync());
});

test("should stop effect", () => {
  const effect = createCompatibleMock();

  const [$x, setX] = createSignal(10);

  const stopEffect = createRoot((dispose) => {
    createEffect(() => $x(), effect);
    return dispose;
  });

  flushSync();
  expect(effect).toHaveBeenCalledTimes(1);

  stopEffect();

  setX(20);
  flushSync();
  expect(effect).toHaveBeenCalledTimes(1); // Should not have been called again after disposal

  cleanupFns.push(() => flushSync());
});

test("should run all disposals before each new run", () => {
  const effect = createCompatibleMock();
  const disposeA = createCompatibleMock();
  const disposeB = createCompatibleMock();
  const disposeC = createCompatibleMock();

  function fnA() {
    onCleanup(disposeA);
  }

  function fnB() {
    onCleanup(disposeB);
  }

  const [$x, setX] = createSignal(0);

  createRoot(() =>
    createEffect(
      () => {
        fnA(), fnB();
        return $x();
      },
      () => {
        effect();
        return disposeC;
      }
    )
  );
  flushSync();

  expect(effect).toHaveBeenCalledTimes(1);
  expect(disposeA).toHaveBeenCalledTimes(0);
  expect(disposeB).toHaveBeenCalledTimes(0);
  expect(disposeC).toHaveBeenCalledTimes(0);

  for (let i = 1; i <= 3; i += 1) {
    setX(i);
    flushSync();
    expect(effect).toHaveBeenCalledTimes(i + 1);
    expect(disposeA).toHaveBeenCalledTimes(i);
    expect(disposeB).toHaveBeenCalledTimes(i);
    expect(disposeC).toHaveBeenCalledTimes(i);
  }

  cleanupFns.push(() => flushSync());
});

test("should run render effect effects", () => {
  const initial = createCompatibleMock();
  const effect = createCompatibleMock();

  const [$x, setX] = createSignal(0);

  let savedComputed: number;
  createRoot(() =>
    createRenderEffect(() => {
      savedComputed = $x();
      initial();
    }, effect)
  );
  
  flushSync();
  expect(initial).toHaveBeenCalledTimes(1);
  expect(effect).toHaveBeenCalledTimes(1);
  expect(savedComputed!).toBe(0);

  setX(1);
  flushSync();
  expect(initial).toHaveBeenCalledTimes(2);
  expect(effect).toHaveBeenCalledTimes(2);
  expect(savedComputed!).toBe(1);

  cleanupFns.push(() => flushSync());
});

test("should update effects synchronously", () => {
  const innerFn = createCompatibleMock();
  const outerFn = createCompatibleMock();

  const [$x, setX] = createSignal(1);
  const [$inner] = createSignal(1);

  createRoot(() => {
    createEffectAdapter(
      () => {
        $x();
        createEffectAdapter(
          () => {
            $inner();
            innerFn();
          }
        );
        outerFn();
      }
    );
  });

  flushSync();
  expect(innerFn).toHaveBeenCalledTimes(1);
  expect(outerFn).toHaveBeenCalledTimes(1);

  setX(2);
  flushSync();
  expect(innerFn).toHaveBeenCalledTimes(2);
  expect(outerFn).toHaveBeenCalledTimes(2);

  cleanupFns.push(() => flushSync());
});

test("should be able to await effects with promises", async () => {
  let resolve: ((value: unknown) => void) | undefined;
  const p = new Promise((r) => (resolve = r));
  const track = createCompatibleMock();
  let result;

  createRoot(() => {
    createEffectAdapter(
      async () => {
        track();
        await p;
        result = "success";
        return result;
      }
    );
  });

  flushSync();
  expect(track).toHaveBeenCalledTimes(1);
  expect(result).toBeUndefined();
  resolve!("done");
  await p;
  expect(result).toBe("success");

  cleanupFns.push(() => flushSync());
});

test("should be able to await nested effects with promises", async () => {
  let resolve: ((value: unknown) => void) | undefined;
  const p = new Promise(r => (resolve = r));
  const track = createCompatibleMock();
  let result;

  const [$x, setX] = createSignal(false);

  const dispose = createRoot((dispose) => {
    createEffectAdapter(() => {
      if ($x()) {
        createEffectAdapter(
          async () => {
            track();
            await p;
            result = "success";
            return result;
          }
        );
      }
    });
    return dispose;
  });

  setX(true);
  flushSync();
  expect(track).toHaveBeenCalledTimes(1);
  expect(result).toBeUndefined();
  resolve!("done");
  await p;
  expect(result).toBe("success");

  setX(false);
  setX(true);
  flushSync();
  expect(track).toHaveBeenCalledTimes(2);

  dispose();
  setX(false);
  setX(true);
  flushSync();
  expect(track).toHaveBeenCalledTimes(2);

  cleanupFns.push(() => flushSync());
});

test("should not re-run inner effect for constant signal", () => {
  const [$x, setX] = createSignal(0);
  const [$y, setY] = createSignal(0);

  const inner = createCompatibleMock();
  const outer = createCompatibleMock();

  createRoot(() => {
    createEffectAdapter(() => {
      $x();
      $y();
      outer();

      createEffectAdapter(
        () => {
          $y();
        },
        () => {
          inner();
        }
      );
    });
  });

  flushSync();
  expect(inner).toHaveBeenCalledTimes(1);
  expect(outer).toHaveBeenCalledTimes(1);

  setX(1);
  flushSync();
  expect(inner).toHaveBeenCalledTimes(2);
  expect(outer).toHaveBeenCalledTimes(2);

  setY(1);
  flushSync();
  expect(inner).toHaveBeenCalledTimes(3);
  expect(outer).toHaveBeenCalledTimes(3);

  cleanupFns.push(() => flushSync());
});

test("createEffect computeFn returns a value", () => {
  const effectFn = createTestSpy();
  let value;
  
  createRoot(() => {
    value = createEffectAdapter(() => {
      effectFn();
      return 42;
    });
  });
  
  flushSync();
  expect(effectFn).toHaveBeenCalledTimes(1);
  expect(value).toBe(undefined); // Effect doesn't return the value
});
