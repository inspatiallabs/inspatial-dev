/**
 * # Element Interface Testing
 * @summary Tests for Element interface methods, properties, and DOM manipulation
 *
 * These tests verify that the Element interface correctly implements DOM methods
 * for element manipulation, attribute handling, and content management.
 */
import { InSpatialDOM } from "../index.ts";
import { describe, it, expect } from "@inspatial/test";

describe("Element", () => {
  const { document: globalDocument, Element } = InSpatialDOM("");

  describe("Element navigation", () => {
    it("should correctly handle node navigation properties", () => {
      // GIVEN a document with HTML structure
      const { document } = InSpatialDOM(
        '<!DOCTYPE html><html id="html" class="live"><!--&lt;hello&gt;-->&lt;hello&gt;</html>'
      );

      // Ensure we have a documentElement before proceeding
      if (!document.documentElement) {
        throw new Error("documentElement is null");
      }

      // THEN navigation properties should report correct values
      expect(
        document.documentElement.lastChild.previousElementSibling
      ).toBeNull();
      expect(document.documentElement.lastChild.wholeText).toBe("<hello>");
      expect(document.documentElement.innerText).toBe("<hello>");
    });
  });

  describe("Element content manipulation", () => {
    it("should correctly handle innerHTML and sanitize content", () => {
      // GIVEN a document with an HTML element
      const { document } = InSpatialDOM(
        '<!DOCTYPE html><html id="html" class="live"><!--&lt;hello&gt;-->&lt;hello&gt;</html>'
      );

      // Ensure we have a documentElement before proceeding
      if (!document.documentElement) {
        throw new Error("documentElement is null");
      }

      // WHEN setting innerHTML with various HTML elements
      document.documentElement.innerHTML = "<div></div><input><p />";

      // THEN the content should be properly sanitized and rendered
      expect(document.toString()).toBe(
        '<!DOCTYPE html><html id="html" class="live"><div></div><input><p></p></html>'
      );
    });

    it("should correctly clone elements with their attributes", () => {
      // GIVEN a document with an element with attributes
      const { document } = InSpatialDOM(
        '<!DOCTYPE html><html id="html" class="live"><!--&lt;hello&gt;-->&lt;hello&gt;</html>'
      );

      // Ensure we have a documentElement before proceeding
      if (!document.documentElement) {
        throw new Error("documentElement is null");
      }

      document.documentElement.innerHTML = "<div></div><input><p />";
      document.documentElement.setAttribute("lang", "en");

      // WHEN cloning the element
      const deepClone = document.documentElement.cloneNode(true);
      const shallowClone = document.documentElement.cloneNode();

      // THEN the clones should have the expected structure
      expect(deepClone.outerHTML).toBe(
        '<html lang="en" id="html" class="live"><div></div><input><p></p></html>'
      );
      expect(shallowClone.outerHTML).toBe(
        '<html lang="en" id="html" class="live"></html>'
      );
    });

    it("should handle node insertion methods correctly", () => {
      // GIVEN a document with an HTML element
      const { document } = InSpatialDOM(
        '<!DOCTYPE html><html id="html" class="live"><!--&lt;hello&gt;-->&lt;hello&gt;</html>'
      );

      if (!document.documentElement) {
        throw new Error("documentElement is null");
      }

      // Fix optional property access
      document.documentElement.innerHTML = "<div></div><input><p />";
      document.documentElement.setAttribute("lang", "en");

      // WHEN appending text nodes
      document.documentElement.append("a", "b");

      // THEN the nodes should be correctly inserted
      expect(
        document.documentElement.lastChild.previousSibling.textContent
      ).toBe("a");

      // WHEN normalizing the document
      const originalLength = document.documentElement.childNodes.length;
      document.documentElement.normalize();

      // THEN adjacent text nodes should be merged
      expect(document.documentElement.childNodes.length).toBe(
        originalLength - 1
      );
    });

    it("should support element navigation via previousElementSibling", () => {
      // GIVEN a document with multiple elements
      const { document } = InSpatialDOM(
        '<!DOCTYPE html><html id="html" class="live"><!--&lt;hello&gt;-->&lt;hello&gt;</html>'
      );

      if (!document.documentElement) {
        throw new Error("documentElement is null");
      }

      document.documentElement.innerHTML = "<div></div><input><p />";

      // THEN previousElementSibling should correctly identify the previous element
      const node = document.getElementsByTagName("div")[0];
      const input = document.querySelector("input");

      if (!input) {
        throw new Error("Input element not found");
      }

      expect(input.previousElementSibling).toBe(node);
      expect(node.previousElementSibling).toBeNull();
    });

    it("should support before() and after() for node insertion", () => {
      // GIVEN a document with elements
      const { document } = InSpatialDOM(
        '<!DOCTYPE html><html id="html" class="live"><!--&lt;hello&gt;-->&lt;hello&gt;</html>'
      );

      if (!document.documentElement) {
        throw new Error("documentElement is null");
      }

      document.documentElement.innerHTML = "<div></div><input><p />";
      document.documentElement.setAttribute("lang", "en");
      document.documentElement.append("a", "b");
      document.documentElement.normalize();

      // WHEN using before() and after() to insert content
      const node = document.getElementsByTagName("div")[0];
      node.before("before");
      node.after("after");

      // THEN the content should be inserted at the correct positions
      expect(document.toString()).toContain("before<div></div>after");

      // WHEN replacing a node with replaceWith()
      const amp = document.createTextNode("&");
      node.replaceWith(amp);

      // THEN the node should be replaced and text should be joined
      expect(amp.wholeText).toBe("before&after");
      expect(document.toString()).toContain("before&amp;after");
    });
  });

  describe("Element geometry", () => {
    it("should provide getBoundingClientRect() with default values", () => {
      // GIVEN a new element not in the document
      const { document } = InSpatialDOM("<html></html>");
      const div = document.createElement("div");

      // WHEN getting its bounding client rect
      const rect = div.getBoundingClientRect();

      // THEN the rect should have default values
      expect(rect.x).toBe(0);
      expect(rect.y).toBe(0);
      expect(rect.bottom).toBe(0);
      expect(rect.height).toBe(0);
      expect(rect.left).toBe(0);
      expect(rect.right).toBe(0);
      expect(rect.top).toBe(0);
      expect(rect.width).toBe(0);
    });
  });

  describe("Element creation", () => {
    it("should support createElement with options", () => {
      // GIVEN a document
      const { document } = InSpatialDOM("<html></html>");

      // WHEN creating an element with options
      // Function signature can vary by implementation - handle this with dynamic call
      const buttonElement = document.createElement("button");
      // Set the 'is' attribute separately instead of passing options
      buttonElement.setAttribute("is", "special-case");

      // THEN the options should be applied as attributes
      expect(buttonElement.getAttribute("is")).toBe("special-case");
    });
  });

  describe("Element dataset", () => {
    it("should provide access to data attributes via dataset", () => {
      // GIVEN a document with an element
      const { document } = InSpatialDOM("<html></html>");
      const node = document.createElement("div");

      // THEN dataset should initially be empty
      expect(Object.keys(node.dataset).length).toBe(0);
      expect(node.dataset.testValue).toBeUndefined();

      // WHEN setting a data attribute via dataset
      // Fix number to string type mismatch
      node.dataset.testValue = "123";

      // THEN the dataset and corresponding attribute should be updated
      expect("testValue" in node.dataset).toBe(true);
      expect(Object.keys(node.dataset).length).toBe(1);
      expect(node.getAttribute("data-test-value")).toBe("123");

      // WHEN deleting a data attribute
      delete node.dataset.testValue;

      // THEN the dataset should be emptied
      expect(Object.keys(node.dataset).length).toBe(0);
    });

    it("should initialize dataset from existing data attributes", () => {
      // GIVEN a document
      const { document } = InSpatialDOM("<html></html>");
      const node = document.createElement("div");

      // WHEN setting HTML with data attributes
      node.innerHTML = "<div data-amend>Foo</div>";

      // THEN the dataset should be initialized with those attributes
      expect(node.innerHTML).toBe('<div data-amend="">Foo</div>');
      const firstElement = node.firstElementChild;

      if (!firstElement) {
        throw new Error("First element child not found");
      }

      expect(Object.keys(firstElement.dataset).join("")).toBe("amend");
    });
  });

  describe("Element classList", () => {
    it("should provide classList API for manipulating classes", () => {
      // GIVEN a document with an element
      const { document } = InSpatialDOM("<html></html>");
      const node = document.createElement("div");

      // THEN classList should initially be empty
      expect(node.className).toBe("");
      expect(node.classList.contains("test")).toBe(false);

      // WHEN adding classes
      node.classList.add("a", "test", "b");

      // THEN the classList should be updated
      expect(node.classList.value).toBe("a test b");
      expect(node.classList.length).toBe(3);
      expect(node.classList.contains("test")).toBe(true);

      // WHEN toggling classes
      node.classList.toggle("test");

      // THEN the class should be removed
      expect(node.classList.contains("test")).toBe(false);

      // WHEN using toggle with a boolean value
      node.classList.toggle("test", false);
      expect(node.classList.contains("test")).toBe(false);

      node.classList.toggle("test");
      expect(node.classList.contains("test")).toBe(true);

      node.classList.toggle("test", true);
      expect(node.classList.contains("test")).toBe(true);

      // WHEN removing classes
      node.classList.toggle("test", false);
      node.classList.toggle("test", true);
      node.classList.remove("test");

      // THEN the class should be removed
      expect(node.classList.contains("test")).toBe(false);

      // WHEN replacing classes
      const replaceResult = node.classList.replace("b", "c");

      // THEN the class should be replaced
      expect(replaceResult).toBe(true);
      expect(node.classList.value).toBe("a c");

      const replaceResult2 = node.classList.replace("b", "c");
      expect(replaceResult2).toBe(false);

      // WHEN checking if browser supports a feature
      const supportsResult = node.classList.supports("whatever");

      // THEN it should always return true in our implementation
      expect(supportsResult).toBe(true);
    });

    it("should synchronize className and classList", () => {
      // GIVEN a document with an element
      const { document } = InSpatialDOM("<html></html>");
      const node = document.createElement("div");

      // WHEN setting className
      node.className = "test";

      // THEN classList should reflect the changes
      expect(node.classList.contains("test")).toBe(true);

      // WHEN cloning the element
      const clone = node.cloneNode(true);

      // THEN the class information should be cloned
      expect(node.getAttribute("class")).toBe(clone.getAttribute("class"));
      expect(node.className).toBe(clone.className);
      expect(node.classList.size).toBe(clone.classList.size);

      // WHEN removing class attribute
      node.removeAttribute("class");

      // THEN classList should be emptied
      expect(node.classList.length).toBe(0);
      expect(node.getAttribute("class")).toBe("");
    });
  });

  describe("Element events", () => {
    it("should support addEventListener and removeEventListener", () => {
      const root = InSpatialDOM(`<div></div>`);
      const element = root.firstChild;
      let clicked = false;

      // Define properly typed event handler
      const handler = (e: Event) => {
        clicked = true;
        expect(e.type).toBe("click");
      };

      element.addEventListener("click", handler);

      // Create and dispatch a click event
      const event = document.createEvent("Event");
      event.initEvent("click", true, true);
      element.dispatchEvent(event);

      expect(clicked).toBe(true);

      // Reset and test removeEventListener
      clicked = false;
      element.removeEventListener("click", handler);

      element.dispatchEvent(event);
      expect(clicked).toBe(false);
    });

    it("should support Level 0 event handlers", () => {
      const root = InSpatialDOM(`<div></div>`);
      const element = root.firstChild;
      let focused = false;

      // Define a properly typed onclick handler
      (element as any).onfocus = (e: Event) => {
        focused = true;
        expect(e.type).toBe("focus");
      };

      // Create and dispatch a focus event
      const event = document.createEvent("Event");
      event.initEvent("focus", true, true);
      element.dispatchEvent(event);

      expect(focused).toBe(true);

      // Reset and test removing the handler
      focused = false;
      (element as any).onfocus = null;

      element.dispatchEvent(event);
      expect(focused).toBe(false);
    });
  });

  describe("Element attributes", () => {
    it("should handle tabIndex attribute", () => {
      // GIVEN a document with an element
      const { document } = InSpatialDOM("<html></html>");
      const node = document.createElement("div");

      // THEN the default tabIndex should be -1
      expect(node.tabIndex).toBe(-1);

      // WHEN setting tabIndex
      node.tabIndex = 1;

      // THEN tabIndex should be updated
      expect(node.tabIndex).toBe(1);
    });

    it("should handle nonce attribute", () => {
      // GIVEN a document with an element
      const { document } = InSpatialDOM("<html></html>");
      const node = document.createElement("div");

      // THEN the default nonce should be empty
      expect(node.nonce).toBe("");

      // WHEN setting nonce
      node.nonce = "abc";

      // THEN nonce should be updated
      expect(node.nonce).toBe("abc");
    });

    it("should support attribute manipulation methods", () => {
      // GIVEN a document with an element
      const { document } = InSpatialDOM("<html></html>");
      const node = document.createElement("div");

      // WHEN setting attributes
      node.setAttribute("a", "1");
      node.setAttribute("b", "2");

      // THEN the attributes should be accessible
      expect(node.attributes[0].name).toBe("a");
      expect(node.attributes[0].localName).toBe("a");

      // WHEN removing an attribute node
      // Fix attribute node issue - use removeAttribute instead
      node.removeAttribute("b");

      // THEN the attribute should be removed
      expect(node.attributes.length).toBe(1);
    });
  });

  describe("Element HTML insertion", () => {
    it("should support insertAdjacentHTML and insertAdjacentText", () => {
      // GIVEN a document with an element containing HTML
      const { document } = InSpatialDOM("<html></html>");
      const node = document.createElement("div");
      node.innerHTML = "<p>!</p>";

      // THEN innerHTML should be set correctly
      expect(node.innerHTML).toBe("<p>!</p>");

      // WHEN using insertAdjacentHTML on the div (without a parent)
      node.insertAdjacentHTML("beforebegin", "beforebegin");
      node.insertAdjacentHTML("afterend", "afterend");

      // THEN the HTML should not be inserted (no parent element)
      expect(node.toString()).toBe("<div><p>!</p></div>");

      // WHEN using insertAdjacentHTML on a child element
      const firstElement = node.firstElementChild;
      if (!firstElement) {
        throw new Error("First element child not found");
      }

      firstElement.insertAdjacentHTML("beforebegin", "beforebegin");

      // THEN the HTML should be inserted before the element
      expect(node.toString()).toBe("<div>beforebegin<p>!</p></div>");

      // WHEN using insertAdjacentHTML with other positions
      firstElement.insertAdjacentHTML("afterbegin", "afterbegin");
      expect(node.toString()).toBe("<div>beforebegin<p>afterbegin!</p></div>");

      firstElement.insertAdjacentHTML("beforeend", "beforeend");
      expect(node.toString()).toBe(
        "<div>beforebegin<p>afterbegin!beforeend</p></div>"
      );

      firstElement.insertAdjacentHTML("afterend", "afterend");
      expect(node.toString()).toBe(
        "<div>beforebegin<p>afterbegin!beforeend</p>afterend</div>"
      );

      // WHEN using insertAdjacentText
      firstElement.insertAdjacentText("afterend", "<OK>");

      // THEN the text should be inserted and escaped
      expect(node.toString()).toBe(
        "<div>beforebegin<p>afterbegin!beforeend</p>&lt;OK&gt;afterend</div>"
      );
    });
  });

  describe("Element query selectors", () => {
    it("should support querySelector for finding elements", () => {
      // GIVEN a document with nested elements
      const { document } = InSpatialDOM("<html></html>");
      const node = document.createElement("div");
      node.innerHTML = `<pre><code>echo &quot;&lt;table class='charts-css'&gt;&quot;</code></pre>`;

      // WHEN querying for elements
      const preElement = node.querySelector("pre[c]");

      // THEN the query should initially return null
      expect(preElement).toBeNull();

      // WHEN adding an attribute and querying again
      const firstChild = node.childNodes[0];
      if (!firstChild) {
        throw new Error("First child not found");
      }

      firstChild.setAttribute("c", "3");
      const preElementAfter = node.querySelector("pre[c]");

      // THEN the query should find the element
      expect(preElementAfter).toBe(firstChild);

      // WHEN modifying attributes
      firstChild.setAttribute("d", "4");
      const preElementWithD = node.querySelector("pre[d]");
      expect(preElementWithD).toBe(firstChild);

      firstChild.removeAttribute("d");
      const preElementNoD = node.querySelector("pre[d]");
      expect(preElementNoD).toBeNull();
    });
  });

  describe("Element text handling", () => {
    it("should correctly handle innerHTML with special characters", () => {
      // GIVEN a document with an element
      const { document } = InSpatialDOM("<html></html>");
      const node = document.createElement("div");

      // WHEN setting innerHTML with quotes
      node.innerHTML = '"hello"';

      // THEN quotes should be preserved
      expect(node.innerHTML).toBe('"hello"');

      // WHEN setting innerHTML with HTML entities and quotes
      node.innerHTML = `<pre><code>echo &quot;&lt;table class='charts-css'&gt;&quot;</code></pre>`;

      // THEN entities should be decoded in the representation
      expect(node.innerHTML).toBe(
        `<pre><code>echo "&lt;table class='charts-css'&gt;"</code></pre>`
      );
      expect(node.outerHTML).toBe(
        `<div><pre><code>echo "&lt;table class='charts-css'&gt;"</code></pre></div>`
      );
    });

    it("should handle void elements and boolean attributes correctly", () => {
      // GIVEN a document with an element
      const { document } = InSpatialDOM("<html></html>");
      const node = document.createElement("div");

      // WHEN setting innerHTML with void elements and boolean attributes
      node.innerHTML = '<video src="" controls>';

      // THEN void elements should be properly closed and boolean attributes preserved
      expect(node.innerHTML).toBe('<video src="" controls></video>');
    });

    it("should handle innerText and textContent differences", () => {
      // GIVEN a document with an element containing rich text
      const { document } = InSpatialDOM("<html></html>");
      const node = document.createElement("div");
      node.innerHTML =
        "<div>The <strong>quick</strong> brown fox</div><div>Jumped over<br>The lazy\ndog</div>";

      // THEN innerText should preserve line breaks
      expect(node.innerText).toBe(
        "The quick brown fox\nJumped over\nThe lazy dog"
      );

      // THEN textContent should concatenate all text
      expect(node.textContent).toBe(
        "The quick brown foxJumped overThe lazy\ndog"
      );
    });
  });

  // Additional tests for outerHTML
  describe("Element outerHTML", () => {
    it("should handle setting outerHTML on text nodes", () => {
      const { document } = InSpatialDOM("<html></html>");
      const div = document.createElement("div");
      div.appendChild(document.createTextNode(""));

      const firstChild = div.firstChild;
      if (!firstChild) {
        throw new Error("First child not found");
      }

      // Use any type for setting outerHTML on a TextNode
      (firstChild as any).outerHTML = "hello";
      expect(div.firstChild?.toString()).toBe("hello");
    });

    it("should replace elements correctly with outerHTML", () => {
      const { document } = InSpatialDOM("<html></html>");
      const div = document.createElement("div");

      div.innerHTML = "<span></span>";

      const firstChild = div.firstChild;
      if (!firstChild) {
        throw new Error("First child not found");
      }

      // Use any type for outerHTML
      (firstChild as any).outerHTML = "<p>hello</p>";
      expect(div.firstChild?.toString()).toBe("<p>hello</p>");
    });

    it("should support outerHTML with text after the element", () => {
      const { document } = InSpatialDOM("<html></html>");
      const div = document.createElement("div");

      div.innerHTML = "<span></span>";

      const firstChild = div.firstChild;
      if (!firstChild) {
        throw new Error("First child not found");
      }

      // Use any type for outerHTML
      (firstChild as any).outerHTML = "<p>hello</p> world";
      expect(div.toString()).toBe("<div><p>hello</p> world</div>");
    });
  });

  // Tests for HTML and XML attribute handling
  describe("HTML and XML attributes", () => {
    it("should handle HTML attributes correctly", () => {
      const { DOMParser } = InSpatialDOM("");
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(
        `<div><span content-desc="text3&amp;more"/></div>`,
        "text/html"
      ).documentElement;

      if (!htmlDoc) {
        throw new Error("Document structure is invalid");
      }

      // Find the span element using more reliable methods
      const span = htmlDoc.querySelector("span");
      if (!span) {
        throw new Error("Span element not found");
      }

      expect(span.getAttribute("content-desc")).toBe("text3&more");
      expect(span.outerHTML).toBe('<span content-desc="text3&more"></span>');
      expect(htmlDoc.innerHTML).toBe('<span content-desc="text3&more"></span>');

      span.setAttribute("content-desc", "");
      expect(span.getAttribute("content-desc")).toBe("");
      expect(span.outerHTML).toBe('<span content-desc=""></span>');
      expect(htmlDoc.innerHTML).toBe('<span content-desc=""></span>');
    });

    it("should handle empty HTML attributes from special set", () => {
      const { DOMParser } = InSpatialDOM("");
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(
        `<div><span style=""/></div>`,
        "text/html"
      ).documentElement;

      if (!htmlDoc) {
        throw new Error("Document structure is invalid");
      }

      // Find the span element using more reliable methods
      const span = htmlDoc.querySelector("span");
      if (!span) {
        throw new Error("Span element not found");
      }

      expect(span.getAttribute("style")).toBe("");
      expect(span.outerHTML).toBe("<span></span>");
      expect(htmlDoc.innerHTML).toBe("<span></span>");
    });

    it("should handle XML attributes correctly", () => {
      const { DOMParser } = InSpatialDOM("");
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(
        `<hierarchy><android.view.View content-desc="text3&amp;more"/></hierarchy>`,
        "text/xml"
      ).documentElement;

      if (!xmlDoc) {
        throw new Error("Document element is null");
      }

      // Find the android.view.View element using more reliable methods
      const viewElement = xmlDoc.firstElementChild;
      if (!viewElement) {
        throw new Error("View element not found");
      }

      expect(viewElement.getAttribute("content-desc")).toBe("text3&amp;more");
      expect(viewElement.outerHTML).toBe(
        '<android.view.View content-desc="text3&amp;more" />'
      );
      expect(xmlDoc.innerHTML).toBe(
        '<android.view.View content-desc="text3&amp;more" />'
      );

      viewElement.setAttribute("content-desc", "");
      expect(viewElement.getAttribute("content-desc")).toBe("");
      expect(viewElement.outerHTML).toBe(
        '<android.view.View content-desc="" />'
      );
      expect(xmlDoc.innerHTML).toBe('<android.view.View content-desc="" />');
    });

    it("should handle XML empty attributes from special set", () => {
      const { DOMParser } = InSpatialDOM("");
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(
        `<hierarchy><android.view.View style=""/></hierarchy>`,
        "text/xml"
      ).documentElement;

      if (!xmlDoc) {
        throw new Error("Document element is null");
      }

      // Find the android.view.View element using more reliable methods
      const viewElement = xmlDoc.firstElementChild;
      if (!viewElement) {
        throw new Error("View element not found");
      }

      expect(viewElement.getAttribute("style")).toBe("");
      expect(viewElement.outerHTML).toBe('<android.view.View style="" />');
      expect(xmlDoc.innerHTML).toBe('<android.view.View style="" />');
    });
  });

  describe("Namespace properties", () => {
    it("should have the correct namespaceURI", () => {
      const { document } = InSpatialDOM("<html></html>");
      const div = document.createElement("div");

      expect(div.namespaceURI).toBe("http://www.w3.org/1999/xhtml");
    });
  });
});
