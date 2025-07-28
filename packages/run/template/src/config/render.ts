import "./kit.css";
import { createRenderer } from "../../../src/renderer/index.ts";
import { App } from "../app/window/flat.tsx";

// 1. Create InSpatial Renderer
const InSpatial = await createRenderer({
  mode: "browser",
  debug: "verbose"
});

// 2. Render InSpatial App
if (document.getElementById("app")) {
  InSpatial.render(document.getElementById("app"), App);
}

