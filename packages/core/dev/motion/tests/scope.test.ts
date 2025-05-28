import { describe, it, expect, beforeEach } from "@inspatial/test";
import { createMotionScope } from "../src/index.ts";
import { beforeEachTest } from "./test_setup.ts"

beforeEach(() => {
  beforeEachTest();
});

describe("InMotion Scope", () => {
  it("Should default to global root with no params", () => {
    const $root = document;
    const scope = createMotionScope();
    expect(scope.root).toEqual($root);
  });

  it("Should default to global root with non existing selector", () => {
    const $root = document;
    const scope = createMotionScope({ root: "#i-dont-exit" });
    expect(scope.root).toEqual($root);
  });

  it("Should default to global root with undefined selector", () => {
    const $root = document;
    const scope = createMotionScope({ root: undefined });
    expect(scope.root).toEqual($root);
  });

  it("Should use DOM root", () => {
    const $root = document.querySelector("#sequence-tests");
    const scope = createMotionScope({ root: $root as any });
    expect(scope.root).toEqual($root);
  });

  it("Should use React ref root", () => {
    const $root = document.querySelector("#sequence-tests");
    const ref = { current: $root as any };
    const scope = createMotionScope({ root: ref });
    expect(scope.root).toEqual($root);
  });

  it("Should use Angular ref root", () => {
    const $root = document.querySelector("#sequence-tests");
    const ref = { nativeElement: $root as any };
    const scope = createMotionScope({ root: ref });
    expect(scope.root).toEqual($root);
  });

  it("Should use Vue ref root", () => {
    const $root = document.querySelector("#sequence-tests");
    const ref = { value: $root as any };
    const scope = createMotionScope({ root: ref });
    expect(scope.root).toEqual($root);
  });
});
