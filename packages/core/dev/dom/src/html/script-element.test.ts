import { InSpatialDOM } from "../index.ts";
import { describe, it, assert } from "@inspatial/test";

// Test suite for ScriptElement

describe("ScriptElement", () => {
  it("should handle script element with attributes and text content", () => {
    // GIVEN a script element with attributes and text content
    const { document } = InSpatialDOM("<!DOCTYPE html><html />");
    const script = document.createElement("script");
    script.setAttribute("what", "ever");
    script.appendChild(document.createTextNode('"'));

    // THEN the script element should be represented correctly
    assert(
      script.toString() === '<script what="ever">"</script>',
      "text elements toString"
    );
  });

  it("should handle various elements with csp-hash attribute", () => {
    // GIVEN various elements with csp-hash attribute
    const { document } = InSpatialDOM("<!DOCTYPE html><html />");
    const head = document.head;

    if (head) {
      // WHEN setting innerHTML with different elements
      head.innerHTML = `<nope csp-hash="any">"</nope>`;
      assert(
        document.toString() ===
          '<!DOCTYPE html><html><head><nope csp-hash="any">"</nope></head></html>',
        "Issue #1 - <nope> node"
      );

      head.innerHTML = `<div csp-hash="any">"</div>`;
      assert(
        document.toString() ===
          '<!DOCTYPE html><html><head><div csp-hash="any">"</div></head></html>',
        "Issue #1 - <div> node"
      );

      head.innerHTML = `<title csp-hash="any">"</title>`;
      assert(
        document.toString() ===
          '<!DOCTYPE html><html><head><title csp-hash="any">"</title></head></html>',
        "Issue #1 - <title> node"
      );

      head.innerHTML = `<style csp-hash="any">"</style>`;
      assert(
        document.toString() ===
          '<!DOCTYPE html><html><head><style csp-hash="any">"</style></head></html>',
        "Issue #1 - <style> node"
      );

      head.innerHTML = `<script csp-hash="any">"</script>`;
      assert(
        document.toString() ===
          '<!DOCTYPE html><html><head><script csp-hash="any">"</script></head></html>',
        "Issue #1 - <script> node"
      );

      head.innerHTML = `<textarea csp-hash="any">"</textarea>`;
      assert(
        document.toString() ===
          '<!DOCTYPE html><html><head><textarea csp-hash="any">"</textarea></head></html>',
        "Issue #1 - <textarea> node"
      );
    }
  });

  it("should handle script element with JSON content", () => {
    // GIVEN a script element with JSON content
    const { document } = InSpatialDOM("<!DOCTYPE html><html />");
    const head = document.head;

    if (head) {
      // WHEN setting innerHTML with JSON content
      head.innerHTML = `<script type="application/ld+json">{}</script>`;
      head.querySelector("script").textContent = `{"change": true}`;
      assert(
        document.toString() ===
          '<!DOCTYPE html><html><head><script type="application/ld+json">{"change": true}</script></head></html>',
        "Issue #9 - <script> node"
      );

      head.innerHTML = `<script type="application/ld+json">{}</script>`;
      head.querySelector("script").text = `{"change": true}`;
      assert(
        document.toString() ===
          '<!DOCTYPE html><html><head><script type="application/ld+json">{"change": true}</script></head></html>'
      );
      assert(head.querySelector("script").text === `{"change": true}`);
    }
  });

  it("should handle script element with HTML content and comments", () => {
    // GIVEN a script element with HTML content and comments
    const { document } = InSpatialDOM("<!DOCTYPE html><html />");
    const head = document.head;

    if (head) {
      // WHEN setting innerHTML with HTML content and comments
      head.innerHTML = `<script>\n<!--comment-->\nfunction test() {\n  return html\`<div>\${'hello'}</div>\`;\n}\n</script>`;

      // THEN the script element should be represented correctly
      assert(
        head.toString() ===
          `<head><script>\n<!--comment-->\nfunction test() {\n  return html\`<div>\${'hello'}</div>\`;\n}\n</script></head>`,
        "<script>"
      );

      assert(
        head.firstChild.innerHTML ===
          `\n<!--comment-->\nfunction test() {\n  return html\`<div>\${'hello'}</div>\`;\n}\n`,
        "<script>.innerHTML"
      );

      head.firstChild.innerHTML = "html`<p>ok</p>`;";
      assert(
        head.firstChild.innerHTML === "html`<p>ok</p>`;",
        "<script>.innerHTML"
      );
    }
  });

  it("should handle script element with various attributes", () => {
    // GIVEN a script element with various attributes
    const { document } = InSpatialDOM(
      '<html><script src="./main.ts" type="module" nonce="111" async defer crossorigin="anonymous" nomodule referrerpolicy="no-referrer"/></html>'
    );
    const script = document.documentElement?.firstElementChild;

    // THEN the attributes should be set correctly
    if (script) {
      assert(script.src === `./main.ts`, "<script>.src");
      assert(script.type === `module`, "<script>.type");
      assert(script.nonce === "111", "<script>.nonce");
      assert(script.async === true, "<script>.async");
      assert(script.defer === true, "<script>.defer");
      assert(script.crossOrigin === `anonymous`, "<script>.crossorigin");
      assert(script.nomodule === true, "<script>.nomodule");
      assert(
        script.referrerPolicy === `no-referrer`,
        "<script>.referrerpolicy"
      );
      assert(
        script.toString() ===
          `<script src="./main.ts" type="module" nonce="111" async defer crossorigin="anonymous" nomodule referrerpolicy="no-referrer"></script>`
      );

      // WHEN modifying attributes
      script.nonce = "222";
      assert(script.nonce === "222", "<script>.nonce");
      script.async = false;
      assert(script.async === false, "<script>.async");
      script.defer = false;
      assert(script.defer === false, "<script>.defer");
      script.crossOrigin = "use-credentials";
      assert(script.crossOrigin === "use-credentials", "<script>.crossorigin");
      script.nomodule = false;
      assert(script.nomodule === false, "<script>.nomodule");
      script.referrerPolicy = "origin";
      assert(script.referrerPolicy === "origin", "<script>.referrerpolicy");
      script.src = "./main.ts";
      assert(script.src === "./main.ts", "<script>.src");
      script.type = "text/javascript";
      assert(script.type === "text/javascript", "<script>.type");
    }
  });

  it("should handle script element with special characters in content", () => {
    // GIVEN a script element with special characters in content
    const { document } = InSpatialDOM("<html></html>");
    const script = document.createElement("script");
    script.innerHTML = 'const test = "$$ $& $1"';
    document.head?.append(script);

    // THEN the script element should be represented correctly
    assert(
      document.toString() ===
        '<html><head><script>const test = "$$ $& $1"</script></head></html>'
    );
  });

  it("should handle script element with special characters in inline content", () => {
    // GIVEN a script element with special characters in inline content
    const { document } = InSpatialDOM(
      '<html><script>const test = "$$ $& $1"</script></html>'
    );

    // THEN the script element should be represented correctly
    assert(
      document.toString() ===
        '<html><script>const test = "$$ $& $1"</script></html>'
    );
  });
});
