import {
  createEffect,
  createRoot,
  flushSync,
  onCleanup,
} from "../signal/src/index.ts";
import { test, expect, mockFn, afterEach } from "@inspatial/test";

// Use test.each for setup/teardown
let cleanupFns: Array<() => void> = [];

// Cleanup after each test
test("cleanup after tests", () => {
  cleanupFns.forEach(fn => fn());
  flushSync();
});

test("should be invoked when computation is disposed", () => {
  const disposeA = mockFn();
  const disposeB = mockFn();
  const disposeC = mockFn();

  const stopEffect = createRoot((dispose) => {
    createEffect(
      () => {
        onCleanup(disposeA);
        onCleanup(disposeB);
        onCleanup(disposeC);
      },
      () => {}
    );

    return dispose;
  });
  flushSync();

  stopEffect();

  expect(disposeA).toHaveBeenCalled();
  expect(disposeB).toHaveBeenCalled();
  expect(disposeC).toHaveBeenCalled();
  
  cleanupFns.push(() => flushSync());
});

test("should not trigger wrong  onCleanup", () => {
  const dispose = mockFn();

  createRoot(() => {
    createEffect(
      () => {
        onCleanup(dispose);
      },
      () => {}
    );

    const stopEffect = createRoot((dispose) => {
      createEffect(
        () => {},
        () => {}
      );
      return dispose;
    });

    stopEffect();
    flushSync();

    expect(dispose).toHaveBeenCalledTimes(0);
  });
  
  cleanupFns.push(() => flushSync());
});

test("should clean up in reverse order", () => {
  const disposeParent = mockFn();
  const disposeA = mockFn();
  const disposeB = mockFn();

  let calls = 0;

  const stopEffect = createRoot((dispose) => {
    createEffect(
      () => {
        onCleanup(() => disposeParent(++calls));

        createEffect(
          () => {
            onCleanup(() => disposeA(++calls));
          },
          () => {}
        );

        createEffect(
          () => {
            onCleanup(() => disposeB(++calls));
          },
          () => {}
        );
      },
      () => {}
    );

    return dispose;
  });
  flushSync();

  stopEffect();

  expect(disposeB).toHaveBeenCalled();
  expect(disposeA).toHaveBeenCalled();
  expect(disposeParent).toHaveBeenCalled();

  expect(disposeB).toHaveBeenCalledWith(1);
  expect(disposeA).toHaveBeenCalledWith(2);
  expect(disposeParent).toHaveBeenCalledWith(3);
  
  cleanupFns.push(() => flushSync());
});

test("should dispose all roots", () => {
  const disposals: string[] = [];

  const dispose = createRoot((dispose) => {
    createRoot(() => {
      onCleanup(() => disposals.push("SUBTREE 1"));
      createEffect(
        () => onCleanup(() => disposals.push("+A1")),
        () => {}
      );
      createEffect(
        () => onCleanup(() => disposals.push("+B1")),
        () => {}
      );
      createEffect(
        () => onCleanup(() => disposals.push("+C1")),
        () => {}
      );
    });

    createRoot(() => {
      onCleanup(() => disposals.push("SUBTREE 2"));
      createEffect(
        () => onCleanup(() => disposals.push("+A2")),
        () => {}
      );
      createEffect(
        () => onCleanup(() => disposals.push("+B2")),
        () => {}
      );
      createEffect(
        () => onCleanup(() => disposals.push("+C2")),
        () => {}
      );
    });

    onCleanup(() => disposals.push("ROOT"));

    return dispose;
  });

  flushSync();
  dispose();

  expect(disposals).toEqual([
    "+C2",
    "+B2",
    "+A2",
    "SUBTREE 2",
    "+C1",
    "+B1",
    "+A1",
    "SUBTREE 1",
    "ROOT",
  ]);
  
  cleanupFns.push(() => flushSync());
});
