// // src/template.test.ts
// import { assertEquals, test } from "jsr:@inspatial/test";
// import { itx, defineComponent } from "./itx.ts";
// import { jsx } from "../jsx/jsx-runtime.ts";

// test("Basic interpolation works", () => {
//   const Template = itx`<div class="test">{{ message }}</div>`({
//     data() {
//       return { message: "Hello World" };
//     }
//   });
  
//   const el = jsx(Template, {}) as HTMLElement;
//   assertEquals(el.outerHTML, '<div class="test">Hello World</div>');
// });

// test("Nested interpolation works", () => {
//   const Template = itx`
//     <div>
//       <h1>{{ title }}</h1>
//       <p>{{ message }}</p>
//     </div>
//   `({
//     data() {
//       return { 
//         title: "Welcome",
//         message: "This is a test" 
//       };
//     }
//   });
  
//   const el = jsx(Template, {}) as HTMLElement;
//   assertEquals(el.innerHTML.includes("<h1>Welcome</h1>"), true);
//   assertEquals(el.innerHTML.includes("<p>This is a test</p>"), true);
// });

// test("in-if directive works", () => {
//   const Template = itx`
//     <div>
//       <h1>Always visible</h1>
//       <p in-if="isVisible">Conditionally visible</p>
//       <p in-if="!isVisible">Alternative content</p>
//     </div>
//   `({
//     data() {
//       return { isVisible: true };
//     }
//   });
  
//   const el = jsx(Template, {}) as HTMLElement;
//   assertEquals(el.innerHTML.includes("<p>Conditionally visible</p>"), true);
//   assertEquals(el.innerHTML.includes("<p>Alternative content</p>"), false);
// });

// test("in-for directive works", () => {
//   const Template = itx`
//     <ul>
//       <li in-for="item in items">{{ item.text }}</li>
//     </ul>
//   `({
//     data() {
//       return { 
//         items: [
//           { id: 1, text: "Item 1" },
//           { id: 2, text: "Item 2" },
//           { id: 3, text: "Item 3" }
//         ] 
//       };
//     }
//   });
  
//   const el = jsx(Template, {}) as HTMLElement;
//   const listItems = el.querySelectorAll("li");
//   assertEquals(listItems.length, 3);
//   assertEquals(listItems[0].textContent, "Item 1");
//   assertEquals(listItems[1].textContent, "Item 2");
//   assertEquals(listItems[2].textContent, "Item 3");
// });

// test("in-bind directive works", () => {
//   const Template = itx`
//     <input 
//       :type="inputType"
//       :placeholder="placeholder"
//       :disabled="isDisabled"
//     >
//   `({
//     data() {
//       return { 
//         inputType: "text",
//         placeholder: "Enter your name",
//         isDisabled: true
//       };
//     }
//   });
  
//   const el = jsx(Template, {}) as HTMLElement;
//   assertEquals(el.getAttribute("type"), "text");
//   assertEquals(el.getAttribute("placeholder"), "Enter your name");
//   assertEquals(el.hasAttribute("disabled"), true);
// });

// test("@event shorthand works", () => {
//   let clicked = false;
  
//   const Template = itx`
//     <button @click="handleClick">Click me</button>
//   `({
//     methods: {
//       handleClick() {
//         clicked = true;
//       }
//     }
//   });
  
//   const el = jsx(Template, {}) as HTMLElement;
//   assertEquals(el.hasAttribute("data-event-click"), true);
// });

// test("defineComponent creates components correctly", () => {
//   const Counter = defineComponent({
//     template: `
//       <div class="counter">
//         <span>{{ count }}</span>
//         <button @click="increment">+</button>
//       </div>
//     `,
//     data(): { count: number } {
//       return { count: 0 };
//     },
//     methods: {
//       increment(this: { count: number }) {
//         this.count++;
//       }
//     },
//     props: ["initialValue"]
//   });
  
//   const el = jsx(Counter, { initialValue: 5 }) as HTMLElement;
//   assertEquals(el.className, "counter");
//   assertEquals(el.querySelector("span")?.textContent, "0");
// });

// test("Components accept props", () => {
//   const Greeting = defineComponent({
//     template: `<h1>Hello, {{ name }}!</h1>`,
//     props: ["name"]
//   });
  
//   const el = jsx(Greeting, { name: "World" }) as HTMLElement;
//   assertEquals(el.textContent, "Hello, World!");
// });

// test("Components can be used in JSX", () => {
//   const Item = itx`<li>{{ text }}</li>`({
//     props: ["text"]
//   });
  
//   const List = (props: { items: string[] }) => {
//     return jsx("ul", {
//       children: props.items.map(item => jsx(Item, { text: item }))
//     });
//   };
  
//   const items = ["Item 1", "Item 2", "Item 3"];
//   const el = jsx(List, { items }) as HTMLElement;
  
//   const listItems = el.querySelectorAll("li");
//   assertEquals(listItems.length, 3);
//   assertEquals(listItems[0].textContent, "Item 1");
//   assertEquals(listItems[1].textContent, "Item 2");
//   assertEquals(listItems[2].textContent, "Item 3");
// });