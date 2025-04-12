import { parseHTML } from "../index.ts";
import { describe, it, assert } from "@inspatial/test";

// Test suite for TimeElement

describe("TimeElement", () => {
  it("should correctly parse and maintain datetime attribute", () => {
    const { document } = parseHTML(
      '<time datetime="2001-05-10 16:00:00">A big event</time>'
    );
    const time = document.lastElementChild;
    assert(time !== null, "Time element should not be null");
    assert(time.dateTime, "2001-05-10 16:00:00");
  });

  it("should update datetime attribute correctly", () => {
    const { document } = parseHTML(
      '<time datetime="2001-05-10 16:00:00">A big event</time>'
    );
    const time = document.lastElementChild;
    assert(time !== null, "Time element should not be null");
    time.setAttribute("datetime", "2001-05-10 00:00:00");
    assert(time.dateTime, "2001-05-10 00:00:00");
  });

  it("should set datetime property correctly", () => {
    const { document } = parseHTML(
      '<time datetime="2001-05-10 16:00:00">A big event</time>'
    );
    const time = document.lastElementChild;
    assert(time !== null, "Time element should not be null");
    time.dateTime = "2025-04-11 16:00:00";
    assert(time.getAttribute("datetime"), "2025-04-11 16:00:00");
  });
});
