/*******************************************************************************
 * IMPORTS
 ********************************************************************************/
import type { Config } from "tailwindcss";
import {
  addCursorBase,
  addVariablesForColors,
  addGridBackgrounds,
  addCursorUtilities,
} from "./plugins";
import { withTV } from "tailwind-variants/transformer";

/*******************************************************************************
 * INSPATIAL TAILWIND CONFIG
 ********************************************************************************/

/**
 * InSpatial Tailwind CSS Config
 * ==============================
 *
 * A custom Tailwind CSS configuration for InSpatial apps,
 * optimized for spatial computing and cross-platform development.
 *
 * Key Features:
 * - Complete rewrite of default Tailwind configuration
 * - New default styling primitives and variables
 * - Seamless integration with InSpatial apps or any Tailwind CSS project
 *
 * Includes:
 * - Spatial-optimized color palette
 * - Typography scales with 70+ premium Kit fonts
 * - Iconography system with 10000+ icons
 * - Spatial-tailored spacing and sizing utilities
 * - Responsive breakpoints for spatial/window-first design
 * - Custom cursors and border radius utilities
 * - Adaptive effects for depth perception
 * - Extended height and width utilities
 * - Animation and transition presets for spatial interactions
 *
 * For more information, visit: https://www.inspatial.dev
 */

/*******************************************************************************
 * MAIN
 ********************************************************************************/
/** @type {import('tailwindcss').Config} */
const inSpatialTailwindConfig = withTV({
  darkMode: "class",
  important: true,
  variants: {
    scrollbar: ["rounded"],
  },
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
    require("@xpd/tailwind-3dtransforms"),
    require("tailwind-scrollbar")({ nocompatible: true }),
    addVariablesForColors,
    addGridBackgrounds,
    addCursorBase,
    addCursorUtilities,
    // addBaseSyntax,
    // addBaseComponents,
  ],

  safelist: [
    "w-64",
    "w-1/2",
    "rounded-l-lg",
    "rounded-r-lg",
    "bg-white",
    "bg-gray-200",
    "bg-slate-50",
    "grid-cols-4",
    "grid-cols-7",
    "h-6",
    "leading-6",
    "h-9",
    "leading-9",
    "shadow-lg",
    "stroke-width",
  ],

  theme: {
    /**
     * ╔════════════════════════════════════════════════════════════════════════════╗
     * ║                    EXTENDS/ADD TO TAILWINDCSS DEFAULTS                     ║
     * ╠════════════════════════════════════════════════════════════════════════════╣
     * ║ The properties below extend the default theme with custom values           ║
     * ║ They do not override any existing values but add new ones to the theme     ║
     * ║ properties added include:                                                  ║
     * ║ 1. height and width utilities                                              ║
     * ║ 2. fontWeight                                                              ║
     * ╚════════════════════════════════════════════════════════════════════════════╝
     */
    extend: {},

    /**
     * ╔════════════════════════════════════════════════════════════════════════════╗
     * ║                    OVERRIDE TAILWINDCSS DEFAULTS                           ║
     * ╠════════════════════════════════════════════════════════════════════════════╣
     * ║ The properties below override existing values in the default theme         ║
     * ║ properties overidden include:                                              ║
     * ║ 1. cursor                                                                  ║
     * ║ 2. colors                                                                  ║
     * ╚════════════════════════════════════════════════════════════════════════════╝
     */
    /* NOTE: To use solid colors as a variable, prefix with var(--), e.g. var(--pink-500) */
    colors: {
      /***************NEUTRAL VARIABLES***************/
      neutral: {
        muted: "var(--muted)",
        // Add more neutral color variables as needed
      },

      /***************PRIME VARIABLES***************/
      background: "hsl(var(--background))",
      surface: "hsl(var(--surface))",
      brand: "hsl(var(--brand))",
      primary: "hsl(var(--primary))",
      secondary: "hsl(var(--secondary))",
      muted: "hsl(var(--muted))",

      /***************SOLID COLORS***************/
      white: { DEFAULT: "#ffffff", light: "#EEF1FA", burn: "#F9F9F9" },
      black: {
        DEFAULT: "#1b2240",
        dark: "#11142c",
        night: "#1a1f39",
        burn: "#343a62",
      },
      skyblack: { DEFAULT: "#03082E", dark: "#060621" },
      damp: { DEFAULT: "#D4DCEF", II: "#CACED9", III: "#7E7D8D" },
      lav: { DEFAULT: "#F9FAFC" },
      pop: {
        DEFAULT: "#9000FF",
        50: "#F4E5FF",
        100: "#E9CCFF",
        200: "#D399FF",
        300: "#BD66FF",
        400: "#A733FF",
        500: "#9000FF", // DEFAULT
        600: "#7400CC",
        700: "#570099",
        800: "#3A0066",
        900: "#1D0033",
        950: "#0E0019",
      },
      trackloud: {
        DEFAULT: "#EF0381",
        50: "#FFE6F3",
        100: "#FECDE7",
        200: "#FE95CD",
        300: "#FD63B5",
        400: "#FC2B9B",
        500: "#EF0381", // DEFAULT
        600: "#BF0267",
        700: "#92024F",
        800: "#600134",
        900: "#32011B",
        950: "#19000E",
      },
      pink: {
        DEFAULT: "#CE17D6",
        50: "#FBE8FD",
        100: "#F7CCFA",
        200: "#F09EF5",
        300: "#E96CEF",
        400: "#E139EA",
        500: "#CE17D6", // DEFAULT
        600: "#A312AA",
        700: "#7B0E81",
        800: "#540958",
        900: "#280429",
        950: "#160217",
      },
      blue: {
        DEFAULT: "#009FE3",
        50: "#E0F6FF",
        100: "#C7EEFF",
        200: "#8FDDFF",
        300: "#57CDFF",
        400: "#1FBCFF",
        500: "#009FE3", // DEFAULT
        600: "#0081B8",
        700: "#00608A",
        800: "#00405C",
        900: "#00202E",
        950: "#000E14",
      },
      green: {
        DEFAULT: "#0DEB57",
        50: "#E7FEEE",
        100: "#CFFCDE",
        200: "#9AF9B9",
        300: "#69F798",
        400: "#39F477",
        500: "#0DEB57", // DEFAULT
        600: "#0ABC46",
        700: "#088C34",
        800: "#055C22",
        900: "#033012",
        950: "#011809",
      },
      red: {
        DEFAULT: "#D9251D",
        50: "#FCE9E9",
        100: "#F9D4D2",
        200: "#F2A5A1",
        300: "#EC7A74",
        400: "#E64F47",
        500: "#D9251D", // DEFAULT
        600: "#AF1F17",
        700: "#821711",
        800: "#550F0B",
        900: "#2D0806",
        950: "#160403",
      },
      yellow: {
        DEFAULT: "#FFC837",
        50: "#FFFAEB",
        100: "#FFF4D6",
        200: "#FFE9AD",
        300: "#FFDE85",
        400: "#FFD561",
        500: "#FFC837", // DEFAULT
        600: "#FAB700",
        700: "#B88700",
        800: "#7A5A00",
        900: "#3D2D00",
        950: "#1F1600",
      },
      eve: {
        DEFAULT: "#E9592B",
        50: "#FDEDE8",
        100: "#FBDFD5",
        200: "#F6BEAC",
        300: "#F29B7E",
        400: "#ED7A54",
        500: "#E9592B",
        600: "#C74115",
        700: "#94300F",
        800: "#66210B",
        900: "#331105",
        950: "#170802",
      },
      lime: {
        DEFAULT: "#8FF808",
        50: "#F4FEE6",
        100: "#E9FECD",
        200: "#D2FC9C",
        300: "#BCFB6A",
        400: "#A6F939",
        500: "#8FF808",
        600: "#73C606",
        700: "#569504",
        800: "#396303",
        900: "#1D3201",
        950: "#0E1901",
      },
      crystal: {
        DEFAULT: "#8BD8F4",
        50: "#F6FCFE",
        100: "#E8F7FD",
        200: "#D0EFFB",
        300: "#B9E8F8",
        400: "#A2E0F6",
        500: "#8BD8F4",
        600: "#45C0ED",
        700: "#149FD2",
        800: "#0D6A8C",
        900: "#073546",
        950: "#041C25",
      },
      transparent: "transparent",
      current: "currentColor",
      inherit: "inherit",
    },

    /*===============================================================================
     * The properties below define the breakpoints for responsive design
     *===============================================================================*/
    screens: {
      "4xl": { max: "3840px" },
      // => @media (max-width: 1535px) { ... }
      "3xl": { max: "1920px" },
      // => @media (max-width: 1535px) { ... }
      "2xl": { max: "1535px" },
      // => @media (max-width: 1535px) { ... }
      xl: { max: "1280px" },
      // => @media (max-width: 1280px) { ... }
      lg: { max: "1024px" },
      // => @media (max-width: 1024px) { ... }
      md: { max: "768px" },
      // => @media (max-width: 768px) { ... }
      sm: { max: "640px" },
      // => @media (max-width: 640px) { ... }
    },
  },
});

module.exports = inSpatialTailwindConfig;
