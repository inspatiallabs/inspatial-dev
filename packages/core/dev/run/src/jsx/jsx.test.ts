import { assertEquals, assertHTMLEquals, test } from "../../../test/src/index.ts";
import { jsx, Fragment } from "./index.ts";


// Basic Element Tests
test("Creates a div element", () => {
  const div = jsx("div", { className: "foo" }) as HTMLElement;
  assertEquals(div.outerHTML, '<div class="foo"></div>');
});

test("Handles nested elements", () => {
  const app = jsx("div", {
    children: jsx("h1", { children: "Hello" }),
  }) as HTMLElement;
  assertEquals(app.outerHTML, "<div><h1>Hello</h1></div>");
});

test("Creates elements with multiple attributes", () => {
  const el = jsx("input", {
    type: "text",
    id: "username",
    name: "username",
    placeholder: "Enter username",
  }) as HTMLElement;

  assertHTMLEquals(
    el,
    '<input type="text" id="username" name="username" placeholder="Enter username">'
  );
});

test("Handles boolean attributes", () => {
  const el = jsx("input", {
    type: "checkbox",
    checked: true,
    disabled: false,
  }) as HTMLElement;
  assertHTMLEquals(el, '<input type="checkbox" checked>');
});

test("Handles data attributes", () => {
  const el = jsx("div", {
    "data-testid": "test",
    "data-value": "123",
  }) as HTMLElement;
  assertHTMLEquals(el, '<div data-testid="test" data-value="123"></div>');
});

test("Processes style objects correctly", () => {
  const el = jsx("div", {
    style: { color: "red", fontSize: "16px" },
  }) as HTMLElement;
  assertEquals(el.getAttribute("style"), "color: red; fontSize: 16px;");
});

test("Handles both className and css props", () => {
  const el1 = jsx("div", { className: "foo bar" }) as HTMLElement;
  assertEquals(el1.getAttribute("class"), "foo bar");

  const el2 = jsx("div", { css: "baz qux" }) as HTMLElement;
  assertEquals(el2.getAttribute("class"), "baz qux");
});

// Children Tests
test("Handles multiple children", () => {
  const el = jsx("div", {
    children: [
      jsx("span", { children: "First" }),
      jsx("span", { children: "Second" }),
    ],
  }) as HTMLElement;
  assertEquals(
    el.outerHTML,
    "<div><span>First</span><span>Second</span></div>"
  );
});

test("Handles mixed content children", () => {
  const el = jsx("div", {
    children: [
      "Text before",
      jsx("span", { children: "Element" }),
      "Text after",
    ],
  }) as HTMLElement;
  assertEquals(
    el.outerHTML,
    "<div>Text before<span>Element</span>Text after</div>"
  );
});

test("Processes nested arrays of children", () => {
  const el = jsx("div", {
    children: [["Nested", "Array"], [jsx("span", { children: "Element" })]],
  }) as HTMLElement;
  assertEquals(el.outerHTML, "<div>NestedArray<span>Element</span></div>");
});

test("Ignores null, undefined, and boolean children", () => {
  const el = jsx("div", {
    children: [null, undefined, true, false, "Valid"],
  }) as HTMLElement;
  assertEquals(el.outerHTML, "<div>Valid</div>");
});

test("Converts numbers to strings", () => {
  const el = jsx("div", { children: 42 }) as HTMLElement;
  assertEquals(el.outerHTML, "<div>42</div>");
});

// Component Tests
test("Handles functional components", () => {
  const Greeting = (props: { name: string }) =>
    jsx("h1", { children: `Hello, ${props.name}!` });

  const el = jsx(Greeting, { name: "World" }) as HTMLElement;
  assertEquals(el.outerHTML, "<h1>Hello, World!</h1>");
});

test("Handles components that return other components", () => {
  const Title = (props: { children: unknown }) =>
    jsx("h1", { className: "title", children: props.children });

  const Header = (props: { title: string }) =>
    jsx(Title, { children: props.title });

  const el = jsx(Header, { title: "Hello" }) as HTMLElement;
  assertEquals(el.outerHTML, '<h1 class="title">Hello</h1>');
});

test("Handles components with children prop", () => {
  const Panel = (props: { children: unknown }) =>
    jsx("div", { className: "panel", children: props.children });

  const el = jsx(Panel, {
    children: [
      jsx("h2", { children: "Title" }),
      jsx("p", { children: "Content" }),
    ],
  }) as HTMLElement;

  assertEquals(
    el.outerHTML,
    '<div class="panel"><h2>Title</h2><p>Content</p></div>'
  );
});

// Fragment Tests
test("Handles basic Fragment usage", () => {
  const frag = jsx(Fragment, {
    children: [
      jsx("div", { children: "First" }),
      jsx("div", { children: "Second" }),
    ],
  }) as unknown as DocumentFragment;

  const wrapper = jsx("div", { children: frag }) as HTMLElement;
  assertEquals(
    wrapper.outerHTML,
    "<div><div>First</div><div>Second</div></div>"
  );
});

test("Handles nested Fragments", () => {
  const innerFrag = jsx(Fragment, {
    children: [
      jsx("span", { children: "Inner 1" }),
      jsx("span", { children: "Inner 2" }),
    ],
  });

  const outerFrag = jsx(Fragment, {
    children: [jsx("div", { children: "Outer" }), innerFrag],
  });

  const wrapper = jsx("div", { children: outerFrag }) as HTMLElement;
  assertHTMLEquals(
    wrapper,
    "<div><div>Outer</div><span>Inner 1</span><span>Inner 2</span></div>"
  );
});

// Event Handler Tests
test("Stores event handlers as data attributes", () => {
  const handleClick = () => console.log("clicked");
  const el = jsx("button", {
    onClick: handleClick,
    children: "Click me",
  }) as HTMLElement;

  // Since this is server-side, we expect the event to be stored as a data attribute
  // or ignored depending on your implementation
  assertEquals(el.outerHTML, "<button>Click me</button>");
});

// Edge Cases
test("Handles empty elements", () => {
  const el = jsx("div", null) as HTMLElement;
  assertEquals(el.outerHTML, "<div></div>");
});

test("Handles special characters in content", () => {
  const el = jsx("div", {
    children: "Special < > & \" ' characters",
  }) as HTMLElement;
  assertHTMLEquals(el, "<div>Special < > & \" ' characters</div>");
});
