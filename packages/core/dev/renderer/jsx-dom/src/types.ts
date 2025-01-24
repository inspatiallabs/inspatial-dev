// import { join } from "jsr:@std/path@1.0.8";
// import { existsSync } from "jsr:@std/fs@1.0.8";
// import { Buffer } from "node:buffer";
// import files from "./files.ts";

// /**
//  * Setup module for creating JSX IntrinsticElements type
//  * @module
//  */

// /**
//  * Adds a jsx.d.ts file to project that contains the basic `HTMLElement` types
//  * and any additional props.
//  */
// export const setup = (): void => {
//   Object.entries(files).forEach(([path, data]) => {
//     const cwd = Deno.cwd();

//     Deno.writeFileSync(join(cwd, path), Buffer.from(data));

//     if (!existsSync(join(cwd, "deno.json"))) {
//       throw new Error("No deno.json");
//     }

//     const denoJson: {
//       compilerOptions?: { jsx?: string; jsxFactory?: string; types?: string[] };
//     } = JSON.parse(new TextDecoder().decode(
//       Deno.readFileSync(join(cwd, "deno.json")),
//     ));

//     if (!("compilerOptions" in denoJson)) denoJson.compilerOptions = {};
//     if (!("types" in denoJson.compilerOptions!)) {
//       denoJson.compilerOptions!.types = [];
//     }

//     const hasDTs = denoJson.compilerOptions!.types?.some((t) =>
//       t === "./jsx.d.ts"
//     );
//     if (!hasDTs) {
//       denoJson.compilerOptions!.types!.push("./jsx.d.ts");
//     }

//     denoJson.compilerOptions!.jsx = "react";
//     denoJson.compilerOptions!.jsxFactory = "jsx";

//     Deno.writeFileSync(
//       join(cwd, "deno.json"),
//       Buffer.from(JSON.stringify(denoJson, null, 2)),
//     );
//   });
// };

// if (import.meta.main) setup();