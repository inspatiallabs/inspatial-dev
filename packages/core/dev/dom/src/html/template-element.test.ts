import { parseHTML } from "../index.ts";
import { describe, it, assert } from "@inspatial/test";

// Test suite for TemplateElement

describe("TemplateElement", () => {
  it("should correctly parse and maintain innerHTML", () => {
    const { document } = parseHTML(
      "<template><div>foo</div><div>bar</div></template>"
    );
    const template = document.documentElement;
    assert(template !== null, "Template element should not be null");
    assert(template.innerHTML, "<div>foo</div><div>bar</div>");
  });

  it("should convert template to string correctly", () => {
    const { document } = parseHTML(
      "<template><div>foo</div><div>bar</div></template>"
    );
    const template = document.documentElement;
    assert(template !== null, "Template element should not be null");
    assert(
      template.toString(),
      "<template><div>foo</div><div>bar</div></template>"
    );
  });

  it("should handle empty template content correctly", () => {
    const { document } = parseHTML("<template></template>");
    const template = document.documentElement;
    assert(template !== null, "Template element should not be null");
    assert(template.innerHTML, "");
  });

  it("should append and clear children correctly", () => {
    const { document } = parseHTML("<template></template>");
    const template = document.documentElement;
    assert(template !== null, "Template element should not be null");
    template.innerHTML = "<p>ok</p>";
    assert(template.innerHTML, "<p>ok</p>");
    template.replaceChildren();
    assert(template.innerHTML, "");
  });

  it("should handle template attributes correctly", () => {
    const docWithTemplateAttribute = parseHTML(
      '<div template="anything"><p>not inside a template</p></div>'
    ).document.documentElement;
    assert(
      docWithTemplateAttribute !== null,
      "Document with template attribute should not be null"
    );
    assert(docWithTemplateAttribute.querySelector("*").tagName, "P");
    assert(
      docWithTemplateAttribute.querySelectorAll("*").length.toString(),
      "1"
    );
  });
});

let { document } = parseHTML(
  "<template><div>foo</div><div>bar</div></template>"
);

let template = document.documentElement;
assert(template !== null, "Template element should not be null");
assert(template.innerHTML, "<div>foo</div><div>bar</div>");

assert(
  template.toString(),
  "<template><div>foo</div><div>bar</div></template>"
);
assert(
  document.toString(),
  "<template><div>foo</div><div>bar</div></template>"
);

assert(document.querySelector("template > *"), null);

assert(template.content, template.content);

template.replaceChildren();
assert(template.innerHTML, "");

template.innerHTML = "<p>ok</p>";
assert(template.innerHTML, "<p>ok</p>");

template = document.createElement("template");
template.innerHTML = "<p>template</p>";
assert(template.content, template.content, "template.content");
assert(template.innerHTML, "<p>template</p>", "template.innerHTML");
document.documentElement.appendChild(template.content);
assert(template.innerHTML, "", "empty template.innerHTML");

let html = `<!DOCTYPE html>
<html>

<template>
    <div></div>
</template>
<template>

</template>
</html>
`;

({ document } = parseHTML(html));

assert(document.toString(), html);

const docWithTemplateAttribute = parseHTML(
  '<div template="anything"><p>not inside a template</p></div>'
).document.documentElement;
assert(
  docWithTemplateAttribute !== null,
  "Document with template attribute should not be null"
);

assert(docWithTemplateAttribute.querySelector("*").tagName, "P");
assert(docWithTemplateAttribute.querySelectorAll("*").length.toString(), "1");
