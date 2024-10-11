/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "../../packages/kit/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/props/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/utils/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {},
  },
  plugins: [],
};
