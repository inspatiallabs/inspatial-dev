import {
  createEffect,
  createMemo,
  createRenderEffect,
  createRoot,
  createSignal,
  flushSync,
  onCleanup,
} from "../signal/src/index.ts";
import { test, expect, mockFn } from "../../../dev/test/src/index.ts";

// Use test.each for setup/teardown
let cleanupFns: Array<() => void> = [];

// Cleanup after each test
test("cleanup after tests", () => {
  cleanupFns.forEach((fn) => fn());
  flushSync();
});

test("should run effect", () => {
  const [$x, setX] = createSignal(0),
    compute = mockFn($x),
    effect = mockFn();

  createRoot(() => createEffect(compute, effect));
  expect(compute).toHaveBeenCalledTimes(1);
  expect(effect).toHaveBeenCalledTimes(0);
  flushSync();
  expect(compute).toHaveBeenCalledTimes(1);
  expect(effect).toHaveBeenCalledTimes(1);
  expect(effect).toHaveBeenCalledWith(0, undefined);

  setX(1);
  flushSync();
  expect(compute).toHaveBeenCalledTimes(2);
  expect(effect).toHaveBeenCalledTimes(2);
  expect(effect).toHaveBeenCalledWith(1, 0);

  cleanupFns.push(() => flushSync());
});

test("should run effect on change", () => {
  const effect = mockFn();

  const [$x, setX] = createSignal(10);
  const [$y, setY] = createSignal(10);

  const $a = createMemo(() => $x() + $y());
  const $b = createMemo(() => $a());

  createRoot(() => createEffect($b, effect));

  expect(effect).toHaveBeenCalledTimes(0);

  setX(20);
  flushSync();
  expect(effect).toHaveBeenCalledTimes(1);

  setY(20);
  flushSync();
  expect(effect).toHaveBeenCalledTimes(2);

  setX(20);
  setY(20);
  flushSync();
  expect(effect).toHaveBeenCalledTimes(2);

  cleanupFns.push(() => flushSync());
});

test("should handle nested effect", () => {
  const [$x, setX] = createSignal(0);
  const [$y, setY] = createSignal(0);

  const outerEffect = mockFn();
  const innerEffect = mockFn();
  const innerPureDispose = mockFn();
  const innerEffectDispose = mockFn();

  const stopEffect = createRoot((dispose) => {
    createEffect(() => {
      $x();
      createEffect(
        () => {
          $y();
          onCleanup(innerPureDispose);
        },
        () => {
          innerEffect();
          return () => {
            innerEffectDispose();
          };
        }
      );
    }, outerEffect);

    return dispose;
  });

  flushSync();
  expect(outerEffect).toHaveBeenCalledTimes(1);
  expect(innerEffect).toHaveBeenCalledTimes(1);
  expect(innerPureDispose).toHaveBeenCalledTimes(0);
  expect(innerEffectDispose).toHaveBeenCalledTimes(0);

  setY(1);
  flushSync();
  expect(outerEffect).toHaveBeenCalledTimes(1);
  expect(innerEffect).toHaveBeenCalledTimes(2);
  expect(innerPureDispose).toHaveBeenCalledTimes(1);
  expect(innerEffectDispose).toHaveBeenCalledTimes(1);

  setY(2);
  flushSync();
  expect(outerEffect).toHaveBeenCalledTimes(1);
  expect(innerEffect).toHaveBeenCalledTimes(3);
  expect(innerPureDispose).toHaveBeenCalledTimes(2);
  expect(innerEffectDispose).toHaveBeenCalledTimes(2);

  innerEffect.mockReset();
  innerPureDispose.mockReset();
  innerEffectDispose.mockReset();

  setX(1);
  flushSync();
  expect(outerEffect).toHaveBeenCalledTimes(2);
  expect(innerEffect).toHaveBeenCalledTimes(1); // new one is created
  expect(innerPureDispose).toHaveBeenCalledTimes(1);
  expect(innerEffectDispose).toHaveBeenCalledTimes(1);

  setY(3);
  flushSync();
  expect(outerEffect).toHaveBeenCalledTimes(2);
  expect(innerEffect).toHaveBeenCalledTimes(2);
  expect(innerPureDispose).toHaveBeenCalledTimes(2);
  expect(innerEffectDispose).toHaveBeenCalledTimes(2);

  stopEffect();
  setX(10);
  setY(10);
  expect(outerEffect).toHaveBeenCalledTimes(2);
  expect(innerEffect).toHaveBeenCalledTimes(2);
  expect(innerPureDispose).toHaveBeenCalledTimes(3);
  expect(innerEffectDispose).toHaveBeenCalledTimes(3);

  cleanupFns.push(() => flushSync());
});

test("should stop effect", () => {
  const effect = mockFn();

  const [$x, setX] = createSignal(10);

  const stopEffect = createRoot((dispose) => {
    createEffect($x, effect);
    return dispose;
  });

  stopEffect();

  setX(20);
  flushSync();
  expect(effect).toHaveBeenCalledTimes(0);

  cleanupFns.push(() => flushSync());
});

test("should run all disposals before each new run", () => {
  const effect = mockFn();
  const disposeA = mockFn();
  const disposeB = mockFn();
  const disposeC = mockFn();

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
  const initial = mockFn(),
    effect = mockFn();

  const [$x, setX] = createSignal(0);

  let savedComputed: number;
  createRoot(() =>
    createRenderEffect(() => {
      savedComputed = $x();
      initial();
    }, effect)
  );

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
  const innerFn = mockFn(),
    outerFn = mockFn();

  const [$x, setX] = createSignal(1);
  const [$inner] = createSignal(1);

  createRoot(() => {
    createEffect(
      () => {
        $x();
        createEffect(
          () => {
            $inner();
            innerFn();
          },
          () => {}
        );
        outerFn();
      },
      () => {}
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
  let resolve;
  const p = new Promise((r) => (resolve = r));
  const track = mockFn();
  let result;

  createRoot(() => {
    createEffect(async () => {
      track();
      await p;
      result = "success";
    });
  });

  flushSync();
  expect(track).toHaveBeenCalledTimes(1);
  expect(result).toBeUndefined();
  resolve();
  await p;
  expect(result).toBe("success");

  cleanupFns.push(() => flushSync());
});

test("should be able to await nested effects with promises", async () => {
  let resolve;
  const p = new Promise((r) => (resolve = r));
  const track = mockFn();
  let result;

  const [$x, setX] = createSignal(false);

  const dispose = createRoot((dispose) => {
    createEffect(() => {
      if ($x()) {
        createEffect(async () => {
          track();
          await p;
          result = "success";
        });
      }
    });
    return dispose;
  });

  setX(true);
  flushSync();
  expect(track).toHaveBeenCalledTimes(1);
  expect(result).toBeUndefined();
  resolve();
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

  const inner = mockFn();
  const outer = mockFn();

  createRoot(() => {
    createEffect(() => {
      $x();
      $y();
      outer();

      createEffect(
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
  const [$x, setX] = createSignal(0),
    compute = mockFn(() => $x()),
    effect = mockFn();

  createRoot(() => createEffect(compute, effect));
  flushSync();
  expect(compute).toHaveBeenCalledTimes(1);
  expect(effect).toHaveBeenCalledTimes(1);
  expect(effect).toHaveBeenCalledWith(0, undefined);

  setX(1);
  flushSync();
  expect(compute).toHaveBeenCalledTimes(2);
  expect(effect).toHaveBeenCalledTimes(2);
  expect(effect).toHaveBeenCalledWith(1, 0);

  cleanupFns.push(() => flushSync());
});
