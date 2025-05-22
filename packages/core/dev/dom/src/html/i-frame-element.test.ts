import { createDOM } from "../cached.ts";
import { describe, it, assert } from "@inspatial/test";

// Test suite for IFrameElement

describe("IFrameElement", () => {
  it("should set the src attribute correctly", () => {
    // GIVEN an iframe element with a src attribute
    const { document } = createDOM('<html><iframe src="./test.html"></html>');
    const { firstElementChild: iframe } = document.documentElement;

    // THEN the src attribute should be set correctly
    assert(iframe.src, "./test.html", "Issue #82 - <iframe>.src");
  });

  it("should handle srcdoc attribute correctly", () => {
    // GIVEN an iframe element
    const { document } = createDOM(
      "<html><body><iframe></iframe></body></html>"
    );
    const iframe = document.body.querySelector("iframe");

    // WHEN setting the srcdoc attribute
    iframe.srcdoc = `<html><span style=\"color: red\">Test</span></html>`;

    // THEN the srcdoc attribute should be reflected in the innerHTML
    assert(
      document.body.innerHTML,
      `<iframe srcdoc=\"<html><span style=&quot;color: red&quot;>Test</span></html>\"></iframe>`
    );
  });

  it("should set multiple attributes correctly", () => {
    // GIVEN an iframe element
    const { document } = createDOM(
      "<html><body><iframe></iframe></body></html>"
    );
    const iframe = document.body.querySelector("iframe");

    // WHEN setting multiple attributes
    iframe.allow = "geolocation";
    iframe.name = "iframe-name";
    iframe.referrerPolicy = "no-referrer";
    iframe.loading = "lazy";

    // THEN the attributes should be set correctly
    assert(
      document.body.innerHTML,
      `<iframe loading=\"lazy\" referrerpolicy=\"no-referrer\" name=\"iframe-name\" allow=\"geolocation\"></iframe>`
    );
  });

  it("should handle allowFullscreen attribute correctly", () => {
    // GIVEN an iframe element with allowfullscreen attribute
    const { document } = createDOM(
      "<html><body><iframe allowfullscreen></iframe></body></html>"
    );
    const iframe = document.body.querySelector("iframe");

    // THEN the allowFullscreen attribute should be true
    assert(iframe.allowFullscreen, true);

    // WHEN setting allowFullscreen to false
    iframe.allowFullscreen = false;

    // THEN the allowFullscreen attribute should be removed
    assert(document.body.innerHTML, `<iframe></iframe>`);
  });

  it("should verify multiple attributes on an existing iframe", () => {
    // GIVEN an iframe element with multiple attributes
    const { document } = createDOM(
      `<html><body><iframe loading=\"lazy\" referrerpolicy=\"no-referrer\" name=\"iframe-name\" allow=\"geolocation\"></iframe></body></html>`
    );
    const iframe = document.body.querySelector("iframe");

    // THEN the attributes should be verified correctly
    assert(iframe.allowFullscreen, false);
    assert(iframe.loading, "lazy");
    assert(iframe.referrerPolicy, "no-referrer");
    assert(iframe.name, "iframe-name");
    assert(iframe.allow, "geolocation");
  });
});
