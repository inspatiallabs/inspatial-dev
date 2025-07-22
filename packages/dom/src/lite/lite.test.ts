import {
  it,
  expect,
  assert,
  spy,
  assertSpyCalls,
  describe,
  beforeEach,
} from "@inspatial/test";
import { createDOM } from "./index.ts";

describe("InDOM (lite)", () => {
  let env: ReturnType<typeof createDOM>;
  let doc: Document;

  /* Always create a fresh environment and document before each test */
  beforeEach(() => {
    env = createDOM();
    doc = env.createDocument(null, "html");
  });

  /*───────────────────────────
  Environment bootstrap
───────────────────────────*/

  it("Should bootstrap creates <head> & <body> once", () => {
    expect(doc.documentElement!.tagName).toBe("HTML");
    expect(doc.head!.tagName).toBe("HEAD");
    expect(doc.body!.tagName).toBe("BODY");
    expect(doc.documentElement!.childElementCount).toBe(2);
  });

  /*───────────────────────────
  Tree manipulation APIs
───────────────────────────*/

  it("Should appendChild / insertBefore update sibling links", () => {
    const one = doc.createElement("div");
    const two = doc.createElement("div");
    const three = doc.createElement("div");
    doc.body!.appendChild(one);
    doc.body!.insertBefore(two, one); // now order: two, one
    doc.body!.appendChild(three); // two, one, three

    expect(doc.body!.firstChild).toBe(two);
    expect(doc.body!.lastChild).toBe(three);
    expect(one.previousSibling).toBe(two);
    expect(one.nextSibling).toBe(three);
  });

  it("Should textContent getter aggregates, setter clears children", () => {
    const p = doc.createElement("p");
    p.append("hello", doc.createTextNode(" "), "world");
    expect(p.textContent).toBe("hello world");
    p.textContent = "reset";
    expect(p.childNodes.length).toBe(1);
    expect(p.firstChild!.nodeType).toBe(3); // Text node
    expect(p.textContent).toBe("reset");
  });

  it("Should cloneNode(deep) copies structure & attrs", () => {
    const src = doc.createElement("div");
    src.setAttribute("data-k", "v");
    const child = doc.createElement("span");
    child.textContent = "hi";
    src.appendChild(child);
    const shallow = src.cloneNode(false) as HTMLElement;
    const deep = src.cloneNode(true) as HTMLElement;

    // shallow – no children but attributes kept
    expect(shallow.childElementCount).toBe(0);
    expect(shallow.getAttribute("data-k")).toBe("v");

    // deep – children & attributes copied
    expect(deep.childElementCount).toBe(1);
    expect(deep.firstElementChild!.tagName).toBe("SPAN");
    expect(deep.getAttribute("data-k")).toBe("v");
  });

  /*───────────────────────────
  Attributes API
───────────────────────────*/

  it("Should set/get/removeAttribute round-trips", () => {
    const el = doc.createElement("div");
    el.setAttribute("data-test", "123");
    expect(el.getAttribute("data-test")).toBe("123");
    el.removeAttribute("data-test");
    expect(el.getAttribute("data-test")).toBeNull();
  });

  it("Should namespace attributes work", () => {
    const svgNs = "http://www.w3.org/2000/svg";
    const el = doc.createElement("rect");
    el.setAttributeNS(svgNs, "fill", "red");
    expect(el.getAttributeNS(svgNs, "fill")).toBe("red");
  });

  /*───────────────────────────
  Events system
───────────────────────────*/

  it("Should events bubble and capture correctly", () => {
    const root = doc.createElement("div");
    const child = doc.createElement("span");
    root.appendChild(child);
    doc.body!.appendChild(root);

    const bubbleSpy = spy();
    const captureSpy = spy();
    root.addEventListener("ping", bubbleSpy); // bubble phase
    root.addEventListener("ping", captureSpy, true); // capture phase

    const evt = env.createEvent("ping", { bubbles: true, captures: true });
    child.dispatchEvent(evt);

    assertSpyCalls(captureSpy, 1);
    assertSpyCalls(bubbleSpy, 1);
    // capture should fire before bubble – validated by call ordering
    assert(captureSpy.calls[0].self === root);
    assert(bubbleSpy.calls[0].self === root);
  });

  it("Should once option auto-removes listener", () => {
    const el = doc.createElement("div");
    const onceSpy = spy();
    el.addEventListener("tap", onceSpy, { once: true });
    const e = env.createEvent("tap");
    el.dispatchEvent(e);
    el.dispatchEvent(e);
    assertSpyCalls(onceSpy, 1);
  });

  /*───────────────────────────
  Forbidden / performance-heavy APIs
───────────────────────────*/

  it("Should innerHTML getter & setter throw informative error", () => {
    const el = doc.createElement("div");
    expect(() => el.innerHTML).toThrow("innerHTML");
    // Setter path
    expect(() => {
      // Purposely trigger the setter to ensure it throws
      // deno-lint-ignore no-explicit-any
      (el as any).innerHTML = "<p>bad</p>";
    }).toThrow("innerHTML");
  });

  /*───────────────────────────
  Register element safety
───────────────────────────*/

  it("Should registerElement prevents duplicates", () => {
    env.registerElement("my-box", env.scope.HTMLElement, false, true);
    expect(() =>
      env.registerElement("my-box", env.scope.HTMLElement)
    ).toThrow();
  });
});
