// @ts-ignore
import plugin from "tailwindcss/plugin";

// TODO: Add base syntax for headings to provide consistency with InSpatial's tailwind.config.js
export const addBaseSyntax = plugin(({ addBase, theme }) => {
  addBase({
    // h1: { fontSize: theme("") },
    // h2: { fontSize: theme("") },
    // h3: { fontSize: theme("") },
    // h4: { fontSize: theme("") },
    // h5: { fontSize: theme("") },
    // h6: { fontSize: theme("") },
  });
});
