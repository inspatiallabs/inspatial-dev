import { parseHTML } from "../index.ts";
import { describe, it, assert } from "@inspatial/test";

// Test suite for character data handling

describe("Character Data Handling", () => {
  it("should correctly parse and clone comment and text nodes", () => {
    let { document } = parseHTML("<html><!--comment-->text</html>");

    const documentElement = document.documentElement;
    if (documentElement) {
      const [comment, text] = documentElement.childNodes;

      assert(
        comment !== null && text !== null,
        "Comment and text nodes should not be null"
      );
      assert(JSON.stringify(comment.cloneNode()) === '[8,"comment"]');
      assert(JSON.stringify(text.cloneNode()) === '[3,"text"]');

      assert(text.data === "text");
      assert(text.nodeValue === "text");
      assert(text.textContent === "text");

      text.data = "data";
      assert(text.data === "data");
      assert(text.nodeValue === "data");
      assert(text.textContent === "data");

      text.nodeValue = "nodeValue";
      assert(text.data === "nodeValue");
      assert(text.nodeValue === "nodeValue");
      assert(text.textContent === "nodeValue");
    }
  });

  it("should correctly serialize HTML with comments", () => {
    let { document } = parseHTML(
      "<html><!-- a comment with a <div> tag --></html>"
    );
    assert(
      document.toString() === "<html><!-- a comment with a <div> tag --></html>"
    );
  });
});
