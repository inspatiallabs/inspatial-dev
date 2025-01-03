import { expect } from "../expect.ts";
import { test } from "../runtime.ts";

test({
  name: "example (InSpatial) test",
  fn: () => {
    expect("world").toBe("world");
  },
});
