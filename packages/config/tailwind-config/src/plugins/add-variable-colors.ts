// @ts-nocheck
import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette';
import plugin from 'tailwindcss/plugin';

/**
 * Custom Tailwind CSS Plugin that makes each static/independent colors available as variables, e.g. var(--white).
 */
export const addVariablesForColors = plugin(({ addBase, theme }) => {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
});