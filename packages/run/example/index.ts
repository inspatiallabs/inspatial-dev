import { DOMRenderer } from "../src/renderer/dom.ts";
import { wrap } from "../src/runtime/jsx/jsx-runtime.ts";
import { withDirectives } from "../src/trigger/directives.ts";
import { App } from "./app.jsx";

//1. Create a renderer (DOM)
const web = DOMRenderer(withDirectives);

//2. Wrap the renderer with the JSX runtime
wrap(web);

//3. Render InSpatial App
const root = document.getElementById("app")!;
web.render(root, App);
