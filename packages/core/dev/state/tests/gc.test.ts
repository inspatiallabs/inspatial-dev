import {
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  flushSync,
  getOwner
} from "../signal/src/index.ts";
import { test, expect, mockFn, afterEach } from "../../../dev/test/src/index.ts";
// Use test.each for setup/teardown
let cleanupFns: Array<() => void> = [];

// Cleanup after each test
test("cleanup after tests", () => {
  cleanupFns.forEach(fn => fn());
  flushSync();
});

function gc() {
  return new Promise(resolve =>
    setTimeout(async () => {
      flushSync(); // flush call stack (holds a reference)
      global.gc!();
      resolve(void 0);
    }, 0)
  );
}

if (global.gc) {
  test("should gc computed if there are no observers", async () => {
    const [$x] = createSignal(0),
      ref = new WeakRef(createMemo(() => $x()));

    await gc();
    expect(ref.deref()).toBeUndefined();
    
    cleanupFns.push(() => flushSync());
  });

  test("should _not_ gc computed if there are observers", async () => {
    let [$x] = createSignal(0),
      pointer;

    const ref = new WeakRef((pointer = createMemo(() => $x())));

    ref.deref()!();

    await gc();
    expect(ref.deref()).toBeDefined();

    pointer = undefined;
    await gc();
    expect(ref.deref()).toBeUndefined();
    
    cleanupFns.push(() => flushSync());
  });

  test("should gc root if disposed", async () => {
    let [$x] = createSignal(0),
      ref!: WeakRef<any>,
      pointer;

    const dispose = createRoot(dispose => {
      ref = new WeakRef(
        (pointer = createMemo(() => {
          $x();
        }))
      );

      return dispose;
    });

    await gc();
    expect(ref.deref()).toBeDefined();

    dispose();
    await gc();
    expect(ref.deref()).toBeDefined();

    pointer = undefined;
    await gc();
    expect(ref.deref()).toBeUndefined();
    
    cleanupFns.push(() => flushSync());
  });

  test("should gc effect lazily", async () => {
    let [$x, setX] = createSignal(0),
      ref!: WeakRef<any>;

    const dispose = createRoot(dispose => {
      createEffect($x, () => {
        ref = new WeakRef(getOwner()!);
      });

      return dispose;
    });

    await gc();
    expect(ref.deref()).toBeDefined();

    dispose();
    setX(1);

    await gc();
    expect(ref.deref()).toBeUndefined();
    
    cleanupFns.push(() => flushSync());
  });
} else {
  test("skipping gc tests (no global.gc available)", () => {
    // Skip tests when global.gc is not available
    cleanupFns.push(() => flushSync());
  });
}
