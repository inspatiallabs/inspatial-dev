import { test, expect, assertIsError } from "@inspatial/test";

test({
  name: "should throw an error",
  fn: () => {
    try {
      throw new Error("Oops!");
    } catch (error) {
      expect(() => assertIsError(error)).not.toThrow();
    }
  },
});
