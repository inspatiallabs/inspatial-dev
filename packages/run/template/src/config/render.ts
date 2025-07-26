import "./kit.css";
import { createRenderer } from "../../../src/renderer/index.ts";
import { App } from "../app/window/flat.tsx";
// import { cloud, cloudClient } from "../../../src/index.ts";

// 1. Create InSpatial Renderer
const InSpatial = await createRenderer({
  mode: "auto",
  debug: true,
});

// 2. Render InSpatial App
if (document.getElementById("app")) {
  InSpatial.render(document.getElementById("app"), App);
}

