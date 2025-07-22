import { describe, it, assert } from "@inspatial/test";
import { createVirtualDOM } from "../index.ts";

// Test suite for MetaElement

describe("MetaElement", () => {
  it("should handle name and content attributes", () => {
    // GIVEN a meta element with name and content attributes
    const { document } = createVirtualDOM('<meta name="test" content="testContent">');
    const a = document.lastElementChild;

    // THEN the attributes should be set correctly
    if (a) {
      assert(a.toString() === '<meta name="test" content="testContent">');
      assert(a.name === "test");
      assert(a.content === "testContent");
    }
  });

  it("should handle charset attribute", () => {
    // GIVEN a meta element with charset attribute
    const { document } = createVirtualDOM('<meta charset="utf-8">');
    const b = document.lastElementChild;

    // THEN the charset attribute should be set correctly
    if (b) {
      assert(b.toString() === '<meta charset="utf-8">');
      assert(b.getAttribute('charset') === "utf-8");
    }
  });

  it("should handle httpEquiv and content attributes for refresh", () => {
    // GIVEN a meta element with httpEquiv refresh and content attributes
    const { document } = createVirtualDOM(
      '<meta http-equiv="refresh" content="0; url=https://google.com/?q=1&page=2">'
    );
    const c = document.lastElementChild;

    // THEN the attributes should be set correctly
    if (c) {
      assert(
        c.toString() ===
          '<meta http-equiv="refresh" content="0; url=https://google.com/?q=1&page=2">'
      );
      assert(c.httpEquiv === "refresh");
      assert(c.content === "0; url=https://google.com/?q=1&page=2");
    }
  });

  it("should handle httpEquiv and content attributes for content-security-policy", () => {
    // GIVEN a meta element with httpEquiv content-security-policy and content attributes
    const { document } = createVirtualDOM(
      "<meta http-equiv=\"content-security-policy\" content=\"default-src 'self'; img-src https://*; child-src 'none';\">"
    );
    const d = document.lastElementChild;

    // THEN the attributes should be set correctly
    if (d) {
      assert(
        d.toString() ===
          "<meta http-equiv=\"content-security-policy\" content=\"default-src 'self'; img-src https://*; child-src 'none';\">"
      );
      assert(d.httpEquiv === "content-security-policy");
      assert(
        d.content === "default-src 'self'; img-src https://*; child-src 'none';"
      );
    }
  });

  it("should handle httpEquiv and content attributes for content-type", () => {
    // GIVEN a meta element with httpEquiv content-type and content attributes
    const { document } = createVirtualDOM(
      '<meta http-equiv="content-type" content="text/html; charset=utf-8">'
    );
    const e = document.lastElementChild;

    // THEN the attributes should be set correctly
    if (e) {
      assert(
        e.toString() ===
          '<meta http-equiv="content-type" content="text/html; charset=utf-8">'
      );
      assert(e.httpEquiv === "content-type");
      assert(e.content === "text/html; charset=utf-8");
    }
  });

  it("should handle httpEquiv and content attributes for default-style", () => {
    // GIVEN a meta element with httpEquiv default-style and content attributes
    const { document } = createVirtualDOM(
      '<meta http-equiv="default-style" content="text/css">'
    );
    const f = document.lastElementChild;

    // THEN the attributes should be set correctly
    if (f) {
      assert(
        f.toString() === '<meta http-equiv="default-style" content="text/css">'
      );
      assert(f.httpEquiv === "default-style");
      assert(f.content === "text/css");
    }
  });

  it("should handle name, content, and media attributes for theme-color", () => {
    // GIVEN a meta element with name, content, and media attributes
    const { document } = createVirtualDOM(
      '<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: dark)">'
    );
    const g = document.lastElementChild;

    // THEN the attributes should be set correctly
    if (g) {
      assert(
        g.toString() ===
          '<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: dark)">'
      );
      assert(g.name === "theme-color");
      assert(g.content === "#ffffff");
      assert(g.media === "(prefers-color-scheme: dark)");
    }
  });
});
