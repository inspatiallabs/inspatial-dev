// src/xml.test.ts
import { assertEquals, test } from "../../../test/src/index.ts";
import { jsx } from "../jsx/index.ts";
import {
  xml,
  registerNamespace,
  defineXmlComponent,
  XMLElements,
} from "./xml.ts";

test("Basic XML interpolation works", () => {
  const Template = xml`
    <greeting>Hello, {name}!</greeting>
  `({
    data: { name: "World" },
  });

  const el = jsx(Template, {}) as HTMLElement;
  assertEquals(el.textContent?.trim(), "Hello, World!");
});

test("XML with nested interpolation works", () => {
  const Template = xml`
    <user>
      <name>{user.firstName} {user.lastName}</name>
      <email>{user.contact.email}</email>
    </user>
  `({
    data: {
      user: {
        firstName: "Ben",
        lastName: "Emma",
        contact: {
          email: "benemma@inspatiallabs.com",
        },
      },
    },
  });

  const el = jsx(Template, {}) as HTMLElement;
  const nameEl = el.querySelector("name");
  const emailEl = el.querySelector("email");

  assertEquals(nameEl?.textContent, "Ben Emma");
  assertEquals(emailEl?.textContent, "benemma@inspatiallabs.com");
});

test("XML with attribute interpolation works", () => {
  const Template = xml`
    <input type="{inputType}" placeholder="{placeholder}" disabled="{isDisabled}" />
  `({
    data: {
      inputType: "text",
      placeholder: "Enter your name",
      isDisabled: true,
    },
  });

  const el = jsx(Template, {}) as HTMLElement;
  assertEquals(el.getAttribute("type"), "text");
  assertEquals(el.getAttribute("placeholder"), "Enter your name");
  assertEquals(el.hasAttribute("disabled"), true);
});

test("XML with boolean attribute conversion works", () => {
  const Template = xml`
    <checkbox checked="true" disabled="false" />
  `({});

  const el = jsx(Template, {}) as HTMLElement;
  assertEquals(el.getAttribute("checked"), "true");
  assertEquals(el.getAttribute("disabled"), "false");
});

test("XML namespaces work", () => {
  // Register test namespace with components
  const testComponents = {
    Button: (props: { type?: string; children?: any }) => {
      return jsx("button", {
        className: `test-button ${props.type || "default"}`,
        children: props.children,
      });
    },
  };

  registerNamespace("http://example.com/test", testComponents);

  const Template = xml`
    <form xmlns:test="http://example.com/test">
      <test:Button type="primary">Click Me</test:Button>
    </form>
  `({});

  const el = jsx(Template, {}) as HTMLElement;
  const button = el.querySelector("button");

  assertEquals(button !== null, true);
  assertEquals(button?.className, "test-button primary");
  assertEquals(button?.textContent, "Click Me");
});

test("XML with CDATA works", () => {
  const Template = xml`
    <document>
      <content>
        ${XMLElements.CDATA({
          children: "<script>alert('This is not executed');</script>",
        })}
      </content>
    </document>
  `({});

  const el = jsx(Template, {}) as HTMLElement;
  const content = el.querySelector("content");

  assertEquals(content?.getAttribute("data-type"), null);
  const cdataEl = content?.querySelector("[data-type='cdata']");
  assertEquals(cdataEl !== null, true);
  assertEquals(
    cdataEl?.textContent,
    "<script>alert('This is not executed');</script>"
  );
});

test("XML with comments works", () => {
  const Template = xml`
    <document>
      ${XMLElements.Comment({
        children: "This is a comment",
      })}
      <content>Some content</content>
    </document>
  `({});

  const el = jsx(Template, {}) as HTMLElement;
  const comment = el.querySelector("[data-type='comment']");

  assertEquals(comment !== null, true);
  assertEquals(comment?.textContent, "This is a comment");
});

test("defineXmlComponent creates components with props", () => {
  const Greeting = defineXmlComponent({
    template: `
      <greeting>
        <title>{title}</title>
        <message>Hello, {name}!</message>
      </greeting>
    `,
    props: ["name", "title"],
  });

  const el = jsx(Greeting, {
    name: "World",
    title: "Welcome Message",
  }) as HTMLElement;

  const title = el.querySelector("title");
  const message = el.querySelector("message");

  assertEquals(title?.textContent, "Welcome Message");
  assertEquals(message?.textContent, "Hello, World!");
});

test("XML with whitespace preservation works", () => {
  const Template = xml`
    <pre>
      function example() {
        console.log("Hello, World!");
      }
    </pre>
  `({
    preserveWhitespace: true,
  });

  const el = jsx(Template, {}) as HTMLElement;
  const text = el.textContent || "";

  // Check that whitespace is preserved
  assertEquals(text.includes("  "), true);
  assertEquals(text.includes("\n"), true);
});

test("XML with mixed JSX works", () => {
  const Header = (props: { title: string }) => {
    return jsx("header", {
      className: "app-header",
      children: jsx("h1", { children: props.title }),
    });
  };

  const Content = xml`
    <content>
      <paragraph>{text}</paragraph>
    </content>
  `({
    data: { text: "This is XML content" },
  });

  const App = (props: { title: string }) => {
    return jsx("div", {
      className: "app",
      children: [jsx(Header, { title: props.title }), jsx(Content, {})],
    });
  };

  const el = jsx(App, { title: "Mixed JSX and XML" }) as HTMLElement;
  const header = el.querySelector("header h1");
  const paragraph = el.querySelector("content paragraph");

  assertEquals(header?.textContent, "Mixed JSX and XML");
  assertEquals(paragraph?.textContent, "This is XML content");
});
