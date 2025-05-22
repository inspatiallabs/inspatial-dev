/**
 * # AnchorElement Testing
 * @summary Tests for the anchor element's URL handling capabilities
 *
 * These tests verify that the anchor element correctly handles URLs with
 * different encoding and special character requirements.
 */
import { describe, it, assert } from "@inspatial/test";
import { createDOM } from "../index.ts";

describe("AnchorElement", () => {
  it("should correctly handle a basic URL in href", () => {
    // GIVEN an anchor element with a URL containing query parameters
    const { document } = createDOM(
      '<a href="https://inspatiallabs.com/?q=1&page=2">click me</a>'
    );
    const { lastElementChild: a } = document;

    // THEN it should maintain the original URL format
    const href = a.href;
    assert(
      href.includes("inspatiallabs.com") && href.includes("q=1") && href.includes("page=2"),
      "Anchor element href should include the domain and query parameters"
    );
  });

  it("should properly handle double quotes in href values", () => {
    // GIVEN an anchor element
    const { document } = createDOM(
      '<a href="https://inspatiallabs.com/?q=1&page=2">click me</a>'
    );
    const { lastElementChild: a } = document;

    // WHEN setting an href with a double quote character
    a.setAttribute("href", 'https://inspatiallabs.com/?q=1&page=2&test="');
    
    // THEN it should properly handle quotes in the href property
    const href = a.href;
    assert(
      href.includes("test=") && (href.includes('"') || href.includes('%22')),
      "Quotes should be preserved (either raw or encoded) in href property"
    );
  });

  it("should encode and decode URL components properly", () => {
    // GIVEN an anchor element
    const { document } = createDOM(
      '<a href="https://inspatiallabs.com/?q=1&page=2">click me</a>'
    );
    const { lastElementChild: a } = document;

    // WHEN setting an href with special characters
    a.setAttribute("href", 'https://inspatiallabs.com/?q=test value&page=2');
    
    // THEN it should properly handle the spaces in query parameters
    const href = a.href;
    assert(
      href.includes("test%20value") || href.includes("test+value"),
      "Spaces in query parameters should be properly encoded"
    );
  });

  it("should preserve percent-encoded values", () => {
    // GIVEN an anchor element
    const { document } = createDOM(
      '<a href="https://inspatiallabs.com/?q=1&page=2">click me</a>'
    );
    const { lastElementChild: a } = document;

    // WHEN setting an href with percent-encoded spaces
    a.setAttribute(
      "href",
      "https://inspatiallabs.com/path%20to%20some%20file.pdf"
    );

    // THEN it should maintain the percent encoding pattern
    const href = a.href;
    assert(
      href.includes("%20") && href.includes("file.pdf"),
      "Percent-encoded values should be preserved in the URL"
    );
  });
});
