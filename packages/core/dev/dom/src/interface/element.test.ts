/**
 * # Element Interface Testing
 * @summary Tests for Element interface methods, properties, and DOM manipulation
 *
 * These tests verify that the Element interface correctly implements DOM methods
 * for element manipulation, attribute handling, and content management.
 */
import { parseHTML } from "../cached.ts";
import { describe, it, assert } from "@inspatial/test";

describe("Element", () => {
  describe("Element navigation", () => {
    it("should correctly handle node navigation properties", () => {
      // GIVEN a document with HTML structure
      const { document } = parseHTML(
        '<!DOCTYPE html><html id="html" class="live"><!--&lt;hello&gt;-->&lt;hello&gt;</html>'
      );

      // THEN navigation properties should report correct values
      assert(
        document.documentElement.lastChild.previousElementSibling === null,
        "previousElementSibling should be null when no previous element exists"
      );
      assert(
        document.documentElement.lastChild.wholeText === "<hello>",
        "wholeText should contain the correct text content"
      );
      assert(
        document.documentElement.innerText === "<hello>",
        "innerText should reflect the text content of the element"
      );
    });
  });

  describe("Element content manipulation", () => {
    it("should correctly handle innerHTML and sanitize content", () => {
      // GIVEN a document with an HTML element
      const { document } = parseHTML(
        '<!DOCTYPE html><html id="html" class="live"><!--&lt;hello&gt;-->&lt;hello&gt;</html>'
      );

      // WHEN setting innerHTML with various HTML elements
      document.documentElement.innerHTML = "<div></div><input><p />";

      // THEN the content should be properly sanitized and rendered
      assert(
        document.toString() ===
          '<!DOCTYPE html><html id="html" class="live"><div></div><input><p></p></html>',
        "innerHTML should sanitize content and handle self-closing tags properly"
      );
    });

    it("should correctly clone elements with their attributes", () => {
      // GIVEN a document with an element with attributes
      const { document } = parseHTML(
        '<!DOCTYPE html><html id="html" class="live"><!--&lt;hello&gt;-->&lt;hello&gt;</html>'
      );
      document.documentElement.innerHTML = "<div></div><input><p />";
      document.documentElement.setAttribute("lang", "en");

      // WHEN cloning the element
      const deepClone = document.documentElement.cloneNode(true);
      const shallowClone = document.documentElement.cloneNode();

      // THEN the clones should have the expected structure
      assert(
        deepClone.outerHTML ===
          '<html lang="en" id="html" class="live"><div></div><input><p></p></html>',
        "Deep clone should include the element's content and attributes"
      );
      assert(
        shallowClone.outerHTML ===
          '<html lang="en" id="html" class="live"></html>',
        "Shallow clone should only include the element's attributes"
      );
    });

    it("should handle node insertion methods correctly", () => {
      // GIVEN a document with an HTML element
      const { document } = parseHTML(
        '<!DOCTYPE html><html id="html" class="live"><!--&lt;hello&gt;-->&lt;hello&gt;</html>'
      );
      document.documentElement.innerHTML = "<div></div><input><p />";
      document.documentElement.setAttribute("lang", "en");

      // WHEN appending text nodes
      document.documentElement.append("a", "b");

      // THEN the nodes should be correctly inserted
      assert(
        document.documentElement.lastChild.previousSibling.textContent === "a",
        "append() should correctly insert text nodes in the specified order"
      );

      // WHEN normalizing the document
      const originalLength = document.documentElement.childNodes.length;
      document.documentElement.normalize();

      // THEN adjacent text nodes should be merged
      assert(
        document.documentElement.childNodes.length === originalLength - 1,
        "normalize() should merge adjacent text nodes"
      );
    });

    it("should support element navigation via previousElementSibling", () => {
      // GIVEN a document with multiple elements
      const { document } = parseHTML(
        '<!DOCTYPE html><html id="html" class="live"><!--&lt;hello&gt;-->&lt;hello&gt;</html>'
      );
      document.documentElement.innerHTML = "<div></div><input><p />";

      // THEN previousElementSibling should correctly identify the previous element
      const node = document.getElementsByTagName("div")[0];
      assert(
        document.querySelector("input").previousElementSibling === node,
        "previousElementSibling should reference the previous element"
      );
      assert(
        node.previousElementSibling === null,
        "previousElementSibling should be null for the first element"
      );
    });

    it("should support before() and after() for node insertion", () => {
      // GIVEN a document with elements
      const { document } = parseHTML(
        '<!DOCTYPE html><html id="html" class="live"><!--&lt;hello&gt;-->&lt;hello&gt;</html>'
      );
      document.documentElement.innerHTML = "<div></div><input><p />";
      document.documentElement.setAttribute("lang", "en");
      document.documentElement.append("a", "b");
      document.documentElement.normalize();

      // WHEN using before() and after() to insert content
      const node = document.getElementsByTagName("div")[0];
      node.before("before");
      node.after("after");

      // THEN the content should be inserted at the correct positions
      assert(
        document.toString().includes("before<div></div>after"),
        "before() and after() should insert content at the correct positions"
      );

      // WHEN replacing a node with replaceWith()
      const amp = document.createTextNode("&");
      node.replaceWith(amp);

      // THEN the node should be replaced and text should be joined
      assert(
        amp.wholeText === "before&after",
        "replaceWith() should replace the node and join adjacent text nodes"
      );
      assert(
        document.toString().includes("before&amp;after"),
        "Special characters should be properly encoded when serialized"
      );
    });
  });

  describe("Element geometry", () => {
    it("should provide getBoundingClientRect() with default values", () => {
      // GIVEN a new element not in the document
      const { document } = parseHTML("<html></html>");
      const div = document.createElement("div");

      // WHEN getting its bounding client rect
      const rect = div.getBoundingClientRect();

      // THEN the rect should have default values
      assert(rect.x === 0, "Default x should be 0");
      assert(rect.y === 0, "Default y should be 0");
      assert(rect.bottom === 0, "Default bottom should be 0");
      assert(rect.height === 0, "Default height should be 0");
      assert(rect.left === 0, "Default left should be 0");
      assert(rect.right === 0, "Default right should be 0");
      assert(rect.top === 0, "Default top should be 0");
      assert(rect.width === 0, "Default width should be 0");
    });
  });

  describe("Element creation", () => {
    it("should support createElement with options", () => {
      // GIVEN a document
      const { document } = parseHTML("<html></html>");

      // WHEN creating an element with options
      const button = document.createElement("button", { is: "special-case" });

      // THEN the options should be applied as attributes
      assert(
        button.getAttribute("is") === "special-case",
        "createElement with options should set the corresponding attributes"
      );
    });
  });

  describe("Element dataset", () => {
    it("should provide access to data attributes via dataset", () => {
      // GIVEN a document with an element
      const { document } = parseHTML("<html></html>");
      const node = document.createTextNode("&");

      // THEN dataset should initially be empty
      assert(
        Object.keys(node.dataset).length === 0,
        "Dataset should initially be empty"
      );
      assert(
        node.dataset.testValue === undefined,
        "Dataset should not have testValue"
      );

      // WHEN setting a data attribute via dataset
      node.dataset.testValue = 123;

      // THEN the dataset and corresponding attribute should be updated
      assert(
        "testValue" in node.dataset,
        "Dataset should have testValue property"
      );
      assert(
        Object.keys(node.dataset).length === 1,
        "Dataset should have one property"
      );
      assert(
        node.getAttribute("data-test-value") === "123",
        "Dataset should set the corresponding attribute"
      );

      // WHEN deleting a data attribute
      delete node.dataset.testValue;

      // THEN the dataset should be emptied
      assert(
        Object.keys(node.dataset).length === 0,
        "Dataset should be empty after deletion"
      );
    });

    it("should initialize dataset from existing data attributes", () => {
      // GIVEN a document
      const { document } = parseHTML("<html></html>");
      const node = document.createElement("div");

      // WHEN setting HTML with data attributes
      node.innerHTML = "<div data-amend>Foo</div>";

      // THEN the dataset should be initialized with those attributes
      assert(
        node.innerHTML === '<div data-amend="">Foo</div>',
        "Empty attributes should be initialized"
      );
      assert(
        Object.keys(node.firstElementChild.dataset).join("") === "amend",
        "Dataset should be initialized from data attributes"
      );
    });
  });

  describe("Element classList", () => {
    it("should provide classList API for manipulating classes", () => {
      // GIVEN a document with an element
      const { document } = parseHTML("<html></html>");
      const node = document.createTextNode("&");

      // THEN classList should initially be empty
      assert(node.className === "", "Element should have no class initially");
      assert(
        node.classList.contains("test") === false,
        "classList should not contain 'test'"
      );

      // WHEN adding classes
      node.classList.add("a", "test", "b");

      // THEN the classList should be updated
      assert(
        node.classList.value === "a test b",
        "classList.value should contain all classes"
      );
      assert(
        node.classList.length === 3,
        "classList.length should reflect the number of classes"
      );
      assert(
        node.classList.contains("test") === true,
        "classList.contains should find added classes"
      );

      // WHEN toggling classes
      node.classList.toggle("test");

      // THEN the class should be removed
      assert(
        node.classList.contains("test") === false,
        "classList.toggle should remove the class"
      );

      // WHEN using toggle with a boolean value
      node.classList.toggle("test", false);
      assert(
        node.classList.contains("test") === false,
        "classList.toggle(class, false) should remove the class"
      );

      node.classList.toggle("test");
      assert(
        node.classList.contains("test") === true,
        "classList.toggle should add the class back"
      );

      node.classList.toggle("test", true);
      assert(
        node.classList.contains("test") === true,
        "classList.toggle(class, true) should add the class"
      );

      // WHEN removing classes
      node.classList.toggle("test", false);
      node.classList.toggle("test", true);
      node.classList.remove("test");

      // THEN the class should be removed
      assert(
        node.classList.contains("test") === false,
        "classList.remove should remove the class"
      );

      // WHEN replacing classes
      const replaceResult = node.classList.replace("b", "c");

      // THEN the class should be replaced
      assert(
        replaceResult === true,
        "classList.replace should return true when successful"
      );
      assert(
        node.classList.value === "a c",
        "classList.replace should update the class list"
      );

      const replaceResult2 = node.classList.replace("b", "c");
      assert(
        replaceResult2 === false,
        "classList.replace should return false when the class doesn't exist"
      );

      // WHEN checking if browser supports a feature
      const supportsResult = node.classList.supports("whatever");

      // THEN it should always return true in our implementation
      assert(supportsResult === true, "classList.supports should return true");
    });

    it("should synchronize className and classList", () => {
      // GIVEN a document with an element
      const { document } = parseHTML("<html></html>");
      const node = document.createElement("div");

      // WHEN setting className
      node.className = "test";

      // THEN classList should reflect the changes
      assert(
        node.classList.contains("test") === true,
        "classList should reflect changes to className"
      );

      // WHEN cloning the element
      const clone = node.cloneNode(true);

      // THEN the class information should be cloned
      assert(
        node.getAttribute("class") === clone.getAttribute("class"),
        "Cloned element should have the same class attribute"
      );
      assert(
        node.className === clone.className,
        "Cloned element should have the same className"
      );
      assert(
        node.classList.size === clone.classList.size,
        "Cloned element should have the same classList"
      );

      // WHEN removing class attribute
      node.removeAttribute("class");

      // THEN classList should be emptied
      assert(
        node.classList.length === 0,
        "classList should be empty after removing class attribute"
      );
      assert(
        node.getAttribute("class") === "",
        "getAttribute('class') should return empty string after removal"
      );
    });
  });

  describe("Element events", () => {
    it("should support level 0 events", () => {
      // GIVEN a document with an element
      const { document } = parseHTML("<html></html>");
      const node = document.createTextNode("&");

      // THEN there should be no initial onclick handler
      assert(
        node.onclick === null,
        "Element should have no initial onclick handler"
      );

      // WHEN setting a focus event handler
      let args = null;
      function focus(event) {
        args = event;
      }
      node.onfocus = focus;

      // THEN the handler should be set
      assert(
        node.onfocus === focus,
        "Element.onfocus should be set to the handler function"
      );

      // WHEN dispatching a focus event
      let event = node.ownerDocument.createEvent("Event");
      event.initEvent("focus");
      node.dispatchEvent(event);

      // THEN the handler should be called
      assert(
        args.type === "focus",
        "Event handler should receive the event object"
      );

      // WHEN removing the handler
      node.onfocus = null;

      // THEN the handler should be removed
      assert(
        node.onfocus === null,
        "Element.onfocus should be null after removal"
      );

      // WHEN calling focus() method
      args = null;
      node.onfocus = focus;
      node.focus();

      // THEN the focus event should be triggered
      assert(
        args.type === "focus",
        "focus() method should trigger the focus event"
      );
    });
  });

  describe("Element attributes", () => {
    it("should handle tabIndex attribute", () => {
      // GIVEN a document with an element
      const { document } = parseHTML("<html></html>");
      const node = document.createTextNode("&");

      // THEN the default tabIndex should be -1
      assert(node.tabIndex === -1, "Default tabIndex should be -1");

      // WHEN setting tabIndex
      node.tabIndex = 1;

      // THEN tabIndex should be updated
      assert(node.tabIndex === 1, "tabIndex should be updated");
    });

    it("should handle nonce attribute", () => {
      // GIVEN a document with an element
      const { document } = parseHTML("<html></html>");
      const node = document.createTextNode("&");

      // THEN the default nonce should be empty
      assert(node.nonce === "", "Default nonce should be empty string");

      // WHEN setting nonce
      node.nonce = "abc";

      // THEN nonce should be updated
      assert(node.nonce === "abc", "nonce should be updated");
    });

    it("should support attribute manipulation methods", () => {
      // GIVEN a document with an element
      const { document } = parseHTML("<html></html>");
      const node = document.createElement("div");

      // WHEN setting attributes
      node.setAttribute("a", "1");
      node.setAttribute("b", "2");

      // THEN the attributes should be accessible
      assert(
        node.attributes[0].name === "a",
        "First attribute name should be 'a'"
      );
      assert(
        node.attributes[0].localName === "a",
        "First attribute localName should be 'a'"
      );

      // WHEN removing an attribute node
      node.removeAttributeNode(node.attributes[1]);

      // THEN the attribute should be removed
      assert(
        node.attributes.length === 1,
        "Attribute should be removed by removeAttributeNode"
      );
    });
  });

  describe("Element HTML insertion", () => {
    it("should support insertAdjacentHTML and insertAdjacentText", () => {
      // GIVEN a document with an element containing HTML
      const { document } = parseHTML("<html></html>");
      const node = document.createElement("div");
      node.innerHTML = "<p>!</p>";

      // THEN innerHTML should be set correctly
      assert(
        node.innerHTML === "<p>!</p>",
        "innerHTML should be set correctly"
      );

      // WHEN using insertAdjacentHTML on the div (without a parent)
      node.insertAdjacentHTML("beforebegin", "beforebegin");
      node.insertAdjacentHTML("afterend", "afterend");

      // THEN the HTML should not be inserted (no parent element)
      assert(
        node.toString() === "<div><p>!</p></div>",
        "insertAdjacentHTML should have no effect without a parent"
      );

      // WHEN using insertAdjacentHTML on a child element
      node.firstElementChild.insertAdjacentHTML("beforebegin", "beforebegin");

      // THEN the HTML should be inserted before the element
      assert(
        node.toString() === "<div>beforebegin<p>!</p></div>",
        "beforebegin should insert HTML before the element"
      );

      // WHEN using insertAdjacentHTML with other positions
      node.firstElementChild.insertAdjacentHTML("afterbegin", "afterbegin");
      assert(
        node.toString() === "<div>beforebegin<p>afterbegin!</p></div>",
        "afterbegin should insert HTML after the start tag"
      );

      node.firstElementChild.insertAdjacentHTML("beforeend", "beforeend");
      assert(
        node.toString() === "<div>beforebegin<p>afterbegin!beforeend</p></div>",
        "beforeend should insert HTML before the end tag"
      );

      node.firstElementChild.insertAdjacentHTML("afterend", "afterend");
      assert(
        node.toString() ===
          "<div>beforebegin<p>afterbegin!beforeend</p>afterend</div>",
        "afterend should insert HTML after the element"
      );

      // WHEN using insertAdjacentText
      node.firstElementChild.insertAdjacentText("afterend", "<OK>");

      // THEN the text should be inserted and escaped
      assert(
        node.toString() ===
          "<div>beforebegin<p>afterbegin!beforeend</p>&lt;OK&gt;afterend</div>",
        "insertAdjacentText should insert escaped text"
      );
    });
  });

  describe("Element query selectors", () => {
    it("should support querySelector for finding elements", () => {
      // GIVEN a document with nested elements
      const { document } = parseHTML("<html></html>");
      const node = document.createElement("div");
      node.innerHTML = `<pre><code>echo &quot;&lt;table class='charts-css'&gt;&quot;</code></pre>`;

      // WHEN querying for elements
      const preElement = node.querySelector("pre[c]");

      // THEN the query should initially return null
      assert(
        preElement === null,
        "querySelector should return null when no matching element exists"
      );

      // WHEN adding an attribute and querying again
      node.childNodes[0].setAttribute("c", "3");
      const preElementAfter = node.querySelector("pre[c]");

      // THEN the query should find the element
      assert(
        preElementAfter === node.childNodes[0],
        "querySelector should find elements with matching attributes"
      );

      // WHEN modifying attributes
      node.childNodes[0].setAttribute("d", "4");
      const preElementWithD = node.querySelector("pre[d]");
      assert(
        preElementWithD === node.childNodes[0],
        "querySelector should find elements with new attributes"
      );

      node.childNodes[0].removeAttribute("d");
      const preElementNoD = node.querySelector("pre[d]");
      assert(
        preElementNoD === null,
        "querySelector should not find elements after attribute removal"
      );
    });
  });

  describe("Element text handling", () => {
    it("should correctly handle innerHTML with special characters", () => {
      // GIVEN a document with an element
      const { document } = parseHTML("<html></html>");
      const node = document.createElement("div");

      // WHEN setting innerHTML with quotes
      node.innerHTML = '"hello"';

      // THEN quotes should be preserved
      assert(node.innerHTML === '"hello"', "innerHTML should preserve quotes");

      // WHEN setting innerHTML with HTML entities and quotes
      node.innerHTML = `<pre><code>echo &quot;&lt;table class='charts-css'&gt;&quot;</code></pre>`;

      // THEN entities should be decoded in the representation
      assert(
        node.innerHTML ===
          `<pre><code>echo "&lt;table class='charts-css'&gt;"</code></pre>`,
        "innerHTML should decode HTML entities"
      );
      assert(
        node.outerHTML ===
          `<div><pre><code>echo "&lt;table class='charts-css'&gt;"</code></pre></div>`,
        "outerHTML should include the element itself"
      );
    });

    it("should handle void elements and boolean attributes correctly", () => {
      // GIVEN a document with an element
      const { document } = parseHTML("<html></html>");
      const node = document.createElement("div");

      // WHEN setting innerHTML with void elements and boolean attributes
      node.innerHTML = '<video src="" controls>';

      // THEN void elements should be properly closed and boolean attributes preserved
      assert(
        node.innerHTML === '<video src="" controls></video>',
        "innerHTML should properly close void elements"
      );
    });

    it("should handle innerText and textContent differences", () => {
      // GIVEN a document with an element containing rich text
      const { document } = parseHTML("<html></html>");
      const node = document.createElement("div");
      node.innerHTML =
        "<div>The <strong>quick</strong> brown fox</div><div>Jumped over<br>The lazy\ndog</div>";

      // THEN innerText should preserve line breaks
      assert(
        node.innerText === "The quick brown fox\nJumped over\nThe lazy dog",
        "innerText should preserve line breaks from markup"
      );

      // THEN textContent should concatenate all text
      assert(
        node.textContent === "The quick brown foxJumped overThe lazy\ndog",
        "textContent should include all text content without additional formatting"
      );
    });
  });
});
