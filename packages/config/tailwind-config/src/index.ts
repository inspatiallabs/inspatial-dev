/*******************************************************************************
 * IMPORTS
 ********************************************************************************/
import {
  addCursorBase,
  addVariablesForColors,
  addGridBackgrounds,
  addCursorUtilities,
  addBaseSyntax,
  addBaseComponents,
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
  /**
   * DARK MODE
   ********************************************************************************/
  darkMode: ["class"],

  /**
   * PREFIX
   ********************************************************************************/
  prefix: "",

  /**
   * IMPORTANT
   ********************************************************************************/
  important: true,

  /**
   * VARIANTS
   ********************************************************************************/
  variants: {
    scrollbar: ["rounded"],
  },

  /**
   * CONTENT
   ********************************************************************************/
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  /**
   * PLUGINS
   ********************************************************************************/
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
    require("@xpd/tailwind-3dtransforms"),
    require("tailwind-scrollbar")({ nocompatible: true }),
    addVariablesForColors,
    addGridBackgrounds,
    addCursorBase,
    addCursorUtilities,
    addBaseSyntax,
    addBaseComponents,
  ],

  /**
   * ╔════════════════════════════════════════════════════════════════════════════╗
   * ║                    OVERRIDE TAILWINDCSS DEFAULTS                           ║
   * ╠════════════════════════════════════════════════════════════════════════════╣
   * ║ The properties below override existing values in the default theme         ║
   * ╚════════════════════════════════════════════════════════════════════════════╝
   */
  theme: {
    /*===============================================================================
     * ACCENT COLOR:
     *===============================================================================*/
    accentColor: ({ theme }) => ({
      ...theme("colors"),
      auto: "auto",
    }),

    /*===============================================================================
     * ANIMATIONS:
     *===============================================================================*/

    animation: {
      none: "none",
      shimmer: "shimmer 2s linear infinite",
      "caret-blink": "caret-blink 1.25s ease-out infinite",
      "accordion-down": "accordion-down 0.2s ease-out",
      "accordion-up": "accordion-up 0.2s ease-out",
      spin: "spin 1s linear infinite",
      ping: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
      pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      bounce: "bounce 1s infinite",
      hide: "hide 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      slideDownAndFade: "slideDownAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      slideLeftAndFade: "slideLeftAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      slideUpAndFade: "slideUpAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      slideRightAndFade:
        "slideRightAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      fadeIn: "fadeIn 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      fadeOut: "fadeOut 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      splash: "splash 1s cubic-bezier(0.16, 1, 0.3, 1)",
      loading: "loading 2s cubic-bezier(0.16, 1, 0.3, 1)",
    },

    /*===============================================================================
     * ARIAS:
     *===============================================================================*/
    aria: {
      busy: 'busy="true"',
      checked: 'checked="true"',
      disabled: 'disabled="true"',
      expanded: 'expanded="true"',
      hidden: 'hidden="true"',
      pressed: 'pressed="true"',
      readonly: 'readonly="true"',
      required: 'required="true"',
      selected: 'selected="true"',
    },

    /*===============================================================================
     * ASPECT RATIO:
     *===============================================================================*/
    aspectRatio: {
      auto: "auto",
      square: "1 / 1",
      video: "16 / 9",
    },

    /*===============================================================================
     * BACKDROP:
     *===============================================================================*/

    backdropBlur: ({ theme }) => ({
      base: "35px",
      ...theme("blur"),
    }),

    backdropBrightness: ({ theme }) => ({
      ...theme("brightness"),
    }),
    backdropContrast: ({ theme }) => ({
      ...theme("contrast"),
    }),
    backdropGrayscale: ({ theme }) => ({
      ...theme("grayscale"),
    }),
    backdropSepia: ({ theme }) => ({
      ...theme("sepia"),
    }),
    backgroundColor: ({ theme }) => ({
      ...theme("colors"),
    }),

    /*===============================================================================
     * BACKGROUND IMAGE:
     *===============================================================================*/
    backgroundImage: {
      none: "none",
      "gradient-to-t": "linear-gradient(to top, var(--tw-gradient-stops))",
      "gradient-to-tr":
        "linear-gradient(to top right, var(--tw-gradient-stops))",
      "gradient-to-r": "linear-gradient(to right, var(--tw-gradient-stops))",
      "gradient-to-br":
        "linear-gradient(to bottom right, var(--tw-gradient-stops))",
      "gradient-to-b": "linear-gradient(to bottom, var(--tw-gradient-stops))",
      "gradient-to-bl":
        "linear-gradient(to bottom left, var(--tw-gradient-stops))",
      "gradient-to-l": "linear-gradient(to left, var(--tw-gradient-stops))",
      "gradient-to-tl":
        "linear-gradient(to top left, var(--tw-gradient-stops))",
    },

    /*===============================================================================
     * BACKGROUND OPACITY:
     *===============================================================================*/

    backgroundOpacity: ({ theme }) => ({
      ...theme("opacity"),
    }),

    /*===============================================================================
     * BACKGROUND POSITION:
     *===============================================================================*/
    backgroundPosition: {
      bottom: "bottom",
      center: "center",
      left: "left",
      "left-bottom": "left bottom",
      "left-top": "left top",
      right: "right",
      "right-bottom": "right bottom",
      "right-top": "right top",
      top: "top",
    },

    /*===============================================================================
     * BACKGROUND SIZE:
     *===============================================================================*/
    backgroundSize: {
      auto: "auto",
      cover: "cover",
      contain: "contain",
    },

    /*===============================================================================
     * BLUR:
     *===============================================================================*/
    blur: {
      0: "0",
      none: "",
      sm: "4px",
      DEFAULT: "8px",
      md: "12px",
      lg: "16px",
      xl: "24px",
      "2xl": "40px",
      "3xl": "64px",
    },

    /*===============================================================================
     * BORDER
     *===============================================================================*/
    borderColor: ({ theme }) => ({
      ...theme("colors"),
      DEFAULT: theme("currentColor"),
    }),

    borderOpacity: ({ theme }) => ({
      ...theme("opacity"),
    }),

    borderRadius: {
      none: "0px",
      xs: "2px",
      DEFAULT: "4px",
      sm: "6px",
      md: "8px",
      base: "12px",
      lg: "16px",
      xl: "24px",
      "2xl": "24px",
      "3xl": "50px",
      "4xl": "100px",
      full: "9999px",
    },

    borderSpacing: ({ theme }) => ({
      ...theme("spacing"),
    }),

    borderWidth: {
      DEFAULT: "1px",
      0: "0px",
      1: "1px",
      2: "2px",
      4: "4px",
      8: "8px",
    },

    /*===============================================================================
     * BOX-SHADOWS:
     *===============================================================================*/
    boxShadow: {
      base: "0 10px 40px rgb(30, 35, 70, 0.05)",
      effect: "0px 3px 1px 1px rgba(0, 0, 0, 0.01)",
      subtle: "0px 2px 2px 0px rgba(27, 28, 29, 0.12)",
      hollow:
        "0px -0.5px 1px 0px rgba(255, 255, 255, 0.24) inset, 0px -0.35px 1px 0px rgba(255, 255, 255, 0.10) inset, 1px 1.5px 4px 0px rgba(17, 20, 44, 0.08) inset, 1px 1.5px 4px 0px rgba(17, 20, 44, 0.10) inset;",
      input: `0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)`,
      active: "2px 4px 0px #F9F9F9;",
      line: "0px 3px 0px rgba(238, 241, 250, 0.65)",
      inn: "inset 0px 0px 5px rgba(0, 0, 0, 0.01);",
      prime:
        "0px 100px 80px rgba(0, 0, 0, 0.07), 0px 41.7776px 33.4221px rgba(0, 0, 0, 0.0503198), 0px 22.3363px 17.869px rgba(0, 0, 0, 0.0417275), 0px 12.5216px 10.0172px rgba(0, 0, 0, 0.035), 0px 6.6501px 5.32008px rgba(0, 0, 0, 0.0282725), 0px 2.76726px 2.21381px rgba(0, 0, 0, 0.0196802);",
      cool: "0px 100px 80px rgba(166, 150, 194, 0.07), 0px 41.7776px 33.4221px rgba(166, 150, 194, 0.0503198), 0px 22.3363px 17.869px rgba(166, 150, 194, 0.0417275), 0px 12.5216px 10.0172px rgba(166, 150, 194, 0.035), 0px 6.6501px 5.32008px rgba(166, 150, 194, 0.0282725), 0px 2.76726px 2.21381px rgba(166, 150, 194, 0.0196802);",
    },

    boxShadowColor: ({ theme }) => theme("colors"),

    /*===============================================================================
     * BRIGHTNESS:
     *===============================================================================*/
    brightness: {
      0: "0",
      50: ".5",
      75: ".75",
      90: ".9",
      95: ".95",
      100: "1",
      105: "1.05",
      110: "1.1",
      125: "1.25",
      150: "1.5",
      200: "2",
    },

    /*===============================================================================
     * COLOR:
     *===============================================================================*/

    caretColor: ({ theme }) => ({
      ...theme("colors"),
    }),

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
        500: "#9000FF",
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
        500: "#EF0381",
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
        500: "#CE17D6",
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
        500: "#009FE3",
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
        500: "#0DEB57",
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
        500: "#D9251D",
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
        500: "#FFC837",
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
     * COLUMNS:
     *===============================================================================*/

    columns: {
      auto: "auto",
      1: "1",
      2: "2",
      3: "3",
      4: "4",
      5: "5",
      6: "6",
      7: "7",
      8: "8",
      9: "9",
      10: "10",
      11: "11",
      12: "12",
      "2xs": "18rem",
      "3xs": "35px",
      "4xs": "35px",
      xs: "20rem",
      sm: "24rem",
      "3md": "150px",
      "4md": "300px",
      md: "28rem",
      lg: "32rem",
      xl: "36rem",
      "2xl": "42rem",
      "3xl": "48rem",
      "4xl": "56rem",
      "5xl": "64rem",
      "6xl": "72rem",
      "7xl": "80rem",
    },

    /*===============================================================================
     * CONTAINER:
     *===============================================================================*/
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },

    /*===============================================================================
     * CONTRAST:
     *===============================================================================*/

    contrast: {
      0: "0",
      50: ".5",
      75: ".75",
      100: "1",
      125: "1.25",
      150: "1.5",
      200: "2",
    },

    /*===============================================================================
     * CURSOR:
     *===============================================================================*/

    cursor: {
      auto: "default", // Use the default cursor for cursor-auto
      default:
        "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/DefaultCursor.svg), default", // default replaces default
      select:
        "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/SelectCursor.svg), alias", // select replaces alias
      orbit:
        "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/OrbitCursor.svg), all-scroll", // orbit replaces all-scroll

      pointer:
        "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/PointerCursor.svg), pointer", // pointer replaces pointer
      pan: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/PanCursor.svg), grab", // pan replaces grab
      panning:
        "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/PanningCursor.svg), grabbing", // panning replaces grabbing

      loading:
        "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/LoadingCursor.svg), progress", // wait replaces progress
      help: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/HelpCursor.svg), help", // help replaces help
      disabled:
        "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/DisabledCursor.svg), not-allowed", // not-allowed replaces not-allowed

      "text-x":
        "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/TextXCursor.svg), vertical-text", // text replaces horizontal text
      "text-y":
        "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/TextYCursor.svg), text", // text replaces text
      cross:
        "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/CrossCursor.svg), crosshair", // crosshair replaces crosshair

      "zoom-in":
        "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/ZoomInCursor.svg), zoom-in", // zoom-in replaces zoom-in
      "zoom-out":
        "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/ZoomOutCursor.svg), zoom-out", // zoom-out replaces zoom-out
      copy: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/CopyCursor.svg?), copy", // copy replaces copy

      move: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/MoveCursor.svg), move", // move replaces move

      "resize-tlbr":
        "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/ResizeTLBRCursor.svg), nwse-resize", // resizeTLBR replaces nwse-resize
      "resize-y":
        "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/ResizeYCursor.svg), ns-resize", // resizeY replaces ns-resize
      "resize-trbl":
        "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/ResizeTRBLCursor.svg), nesw-resize", // resizeTRBL replaces nesw-resize
      "resize-x":
        "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/ResizeXCursor.svg), ew-resize", // resizeX replaces ew-resize
      "resize-tl":
        "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/ResizeTLCursor.svg), nw-resize", // resizeTL replaces nw-resize
      "resize-t":
        "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/ResizeTCursor.svg), n-resize", // resizeT replaces n-resize
      "resize-tr":
        "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/ResizeTRCursor.svg), ne-resize", // resizeTR replaces ne-resize
      "resize-r":
        "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/ResizeRCursor.svg), e-resize", // resizeR replaces e-resize
      "resize-br":
        "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/ResizeBRCursor.svg), se-resize", // resizeBR replaces se-resize
      "resize-b":
        "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/ResizeBCursor.svg), s-resize", // resizeB replaces s-resize
      "resize-bl":
        "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/ResizeBLCursor.svg), sw-resize", // resizeBL replaces sw-resize
      "resize-l":
        "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/ResizeLCursor.svg), w-resize", // resizeL replaces w-resize
    },

    /*===============================================================================
     * DIVIDE:
     *===============================================================================*/

    divideOpacity: ({ theme }) => ({
      ...theme("borderOpacity"),
    }),
    divideWidth: ({ theme }) => ({
      ...theme("borderWidth"),
    }),

    /*===============================================================================
     * DROP SHADOW:
     *===============================================================================*/

    dropShadow: {
      none: "0 0 #0000",
      DEFAULT: ["0 1px 2px rgb(0 0 0 / 0.1)", "0 1px 1px rgb(0 0 0 / 0.06)"],
      sm: "0 1px 1px rgb(0 0 0 / 0.05)",
      md: ["0 4px 3px rgb(0 0 0 / 0.07)", "0 2px 2px rgb(0 0 0 / 0.06)"],
      lg: ["0 10px 8px rgb(0 0 0 / 0.04)", "0 4px 3px rgb(0 0 0 / 0.1)"],
      xl: ["0 20px 13px rgb(0 0 0 / 0.03)", "0 8px 5px rgb(0 0 0 / 0.08)"],
      "2xl": "0 25px 25px rgb(0 0 0 / 0.15)",
    },

    /*===============================================================================
     * FILL:
     *===============================================================================*/

    fill: ({ theme }) => ({
      none: "none",
      ...theme("colors"),
    }),

    /*===============================================================================
     * FLEX (STRUCTURE):
     *===============================================================================*/

    flex: {
      1: "1 1 0%",
      auto: "1 1 auto",
      initial: "0 1 auto",
      none: "none",
    },

    flexBasis: ({ theme }) => ({
      auto: "auto",
      ...theme("spacing"),
      "1/2": "50%",
      "1/3": "33.333333%",
      "2/3": "66.666667%",
      "1/4": "25%",
      "2/4": "50%",
      "3/4": "75%",
      "1/5": "20%",
      "2/5": "40%",
      "3/5": "60%",
      "4/5": "80%",
      "1/6": "16.666667%",
      "2/6": "33.333333%",
      "3/6": "50%",
      "4/6": "66.666667%",
      "5/6": "83.333333%",
      "1/12": "8.333333%",
      "2/12": "16.666667%",
      "3/12": "25%",
      "4/12": "33.333333%",
      "5/12": "41.666667%",
      "6/12": "50%",
      "7/12": "58.333333%",
      "8/12": "66.666667%",
      "9/12": "75%",
      "10/12": "83.333333%",
      "11/12": "91.666667%",
      full: "100%",
    }),

    flexGrow: {
      0: "0",
      DEFAULT: "1",
    },

    flexShrink: {
      0: "0",
      DEFAULT: "1",
    },

    /*===============================================================================
     * FONT (TYPOGRAPHY):
     *===============================================================================*/

    fontFamily: {
      actual: ["var(--font-actual)"],
      aeion: ["var(--font-aeion)"],
      aerospace: ["var(--font-aerospace)"],
      along: ["var(--font-along)"],
      alternox: ["var(--font-alternox)"],
      amithen: ["var(--font-amithen)"],
      ankle: ["var(--font-ankle)"],
      anything: ["var(--font-anything)"],
      aperture: ["var(--font-aperture)"],
      aqum: ["var(--font-aqum)"],
      attack: ["var(--font-attack)"],
      bernados: ["var(--font-bernados)"],
      bertha: ["var(--font-bertha)"],
      bionix: ["var(--font-bionix)"],
      brawls: ["var(--font-brawls)"],
      brighton: ["var(--font-brighton)"],
      broad: ["var(--font-broad)"],
      candace: ["var(--font-candace)"],
      carolin: ["var(--font-carolin)"],
      congenial: ["var(--font-congenial)"],
      dakar: ["var(--font-dakar)"],
      denson: ["var(--font-denson)"],
      dumeh: ["var(--font-dumeh)"],
      elsone: ["var(--font-elsone)"],
      engine: ["var(--font-engine)"],
      enrique: ["var(--font-enrique)"],
      folker: ["var(--font-folker)"],
      fonzy: ["var(--font-fonzy)"],
      foregen: ["var(--font-foregen)"],
      gaoel: ["var(--font-gaoel)"],
      goodly: ["var(--font-goodly)"],
      hadeed: ["var(--font-hadeed)"],
      heather: ["var(--font-heather)"],
      inder: ["var(--font-inder)"],
      inter: ["var(--font-inter)"],
      jls: ["var(--font-jls)"],
      kimura: ["var(--font-kimura)"],
      lato: ["var(--font-lato)"],
      logotype: ["var(--font-logotype)"],
      lovelo: ["var(--font-lovelo)"],
      micro: ["var(--font-micro)"],
      moisses: ["var(--font-moisses)"],
      monica: ["var(--font-monica)"],
      montserrat: ["var(--font-montserrat)"],
      morality: ["var(--font-morality)"],
      nafasyah: ["var(--font-nafasyah)"],
      nanotech: ["var(--font-nanotech)"],
      naon: ["var(--font-naon)"],
      notche: ["var(--font-notche)"],
      numaposa: ["var(--font-numaposa)"],
      oklean: ["var(--font-oklean)"],
      parizaad: ["var(--font-parizaad)"],
      polaris: ["var(--font-polaris)"],
      polly: ["var(--font-polly)"],
      poppins: ["var(--font-poppins)"],
      qualux: ["var(--font-qualux)"],
      "queen-rogette": ["var(--font-queen-rogette)"],
      quora: ["var(--font-quora)"],
      ransom: ["var(--font-ransom)"],
      remura: ["var(--font-remura)"],
      rockley: ["var(--font-rockley)"],
      ronald: ["var(--font-ronald)"],
      rubik: ["var(--font-rubik)"],
      safari: ["var(--font-safari)"],
      sheylla: ["var(--font-sheylla)"],
      slamdunk: ["var(--font-slamdunk)"],
      sweetsnow: ["var(--font-sweetsnow)"],
      stampbor: ["var(--font-stampbor)"],
      trebuchet: ["var(--font-trebuchet)"],
      viora: ["var(--font-viora)"],
      zebrawood: ["var(--font-zebrawood)"],
    },

    fontSize: {
      h1: "72px",
      h2: "60px",
      h3: "48px",
      h4: "34px",
      h5: "24px",
      h6: "15px",

      base: "12px",

      xs: "8px",
      sm: "10px",
      md: "20px",
      lg: "32px",
      xl: "46px",
    },

    fontWeight: {
      thin: "100",
      light: "300",
      regular: "400",
      medium: "500",
      bold: "700",
      black: "900",
    },

    lineHeight: {
      2: "2",
      12: "12px",
      16: "16px",
      20: "20px",
      24: "24px",
      28: "28px",
      32: "32px",
      36: "36px",
      40: "40px",
      44: "44px",
      48: "48px",
      52: "52px",
      56: "56px",
      60: "60px",
      64: "64px",
      68: "68px",
      72: "72px",
      80: "80px",
      96: "96px",
      118: "118px",
      128: "128px",
    },

    letterSpacing: {
      xs: "-0.05em",
      sm: "-0.03em",
      base: "0em",
      md: "0.03em",
      lg: "0.05em",
      xl: "0.1em",
    },

    /*===============================================================================
     * GAP:
     *===============================================================================*/

    gap: ({ theme }) => ({
      ...theme("spacing"),
    }),

    /*===============================================================================
     * GRADIENT:
     *===============================================================================*/

    gradientColorStops: ({ theme }) => ({
      ...theme("colors"),
    }),
    gradientColorStopPositions: {
      "0%": "0%",
      "5%": "5%",
      "10%": "10%",
      "15%": "15%",
      "20%": "20%",
      "25%": "25%",
      "30%": "30%",
      "35%": "35%",
      "40%": "40%",
      "45%": "45%",
      "50%": "50%",
      "55%": "55%",
      "60%": "60%",
      "65%": "65%",
      "70%": "70%",
      "75%": "75%",
      "80%": "80%",
      "85%": "85%",
      "90%": "90%",
      "95%": "95%",
      "100%": "100%",
    },

    /*===============================================================================
     * GRAYSCALE:
     *===============================================================================*/

    grayscale: {
      0: "0",
      DEFAULT: "100%",
    },

    /*===============================================================================
     * GRID (STRUCTURE):
     *===============================================================================*/

    gridAutoColumns: {
      auto: "auto",
      min: "min-content",
      max: "max-content",
      fr: "minmax(0, 1fr)",
    },
    gridAutoRows: {
      auto: "auto",
      min: "min-content",
      max: "max-content",
      fr: "minmax(0, 1fr)",
    },
    gridColumn: {
      auto: "auto",
      "span-1": "span 1 / span 1",
      "span-2": "span 2 / span 2",
      "span-3": "span 3 / span 3",
      "span-4": "span 4 / span 4",
      "span-5": "span 5 / span 5",
      "span-6": "span 6 / span 6",
      "span-7": "span 7 / span 7",
      "span-8": "span 8 / span 8",
      "span-9": "span 9 / span 9",
      "span-10": "span 10 / span 10",
      "span-11": "span 11 / span 11",
      "span-12": "span 12 / span 12",
      "span-full": "1 / -1",
    },
    gridColumnEnd: {
      auto: "auto",
      1: "1",
      2: "2",
      3: "3",
      4: "4",
      5: "5",
      6: "6",
      7: "7",
      8: "8",
      9: "9",
      10: "10",
      11: "11",
      12: "12",
      13: "13",
    },
    gridColumnStart: {
      auto: "auto",
      1: "1",
      2: "2",
      3: "3",
      4: "4",
      5: "5",
      6: "6",
      7: "7",
      8: "8",
      9: "9",
      10: "10",
      11: "11",
      12: "12",
      13: "13",
    },
    gridRow: {
      auto: "auto",
      "span-1": "span 1 / span 1",
      "span-2": "span 2 / span 2",
      "span-3": "span 3 / span 3",
      "span-4": "span 4 / span 4",
      "span-5": "span 5 / span 5",
      "span-6": "span 6 / span 6",
      "span-7": "span 7 / span 7",
      "span-8": "span 8 / span 8",
      "span-9": "span 9 / span 9",
      "span-10": "span 10 / span 10",
      "span-11": "span 11 / span 11",
      "span-12": "span 12 / span 12",
      "span-full": "1 / -1",
    },
    gridRowEnd: {
      auto: "auto",
      1: "1",
      2: "2",
      3: "3",
      4: "4",
      5: "5",
      6: "6",
      7: "7",
      8: "8",
      9: "9",
      10: "10",
      11: "11",
      12: "12",
      13: "13",
    },
    gridRowStart: {
      auto: "auto",
      1: "1",
      2: "2",
      3: "3",
      4: "4",
      5: "5",
      6: "6",
      7: "7",
      8: "8",
      9: "9",
      10: "10",
      11: "11",
      12: "12",
      13: "13",
    },
    gridTemplateColumns: {
      none: "none",
      subgrid: "subgrid",
      fluid: "repeat(auto-fit,minmax(250px,1fr))",
      1: "repeat(1, minmax(0, 1fr))",
      2: "repeat(2, minmax(0, 1fr))",
      3: "repeat(3, minmax(0, 1fr))",
      4: "repeat(4, minmax(0, 1fr))",
      5: "repeat(5, minmax(0, 1fr))",
      6: "repeat(6, minmax(0, 1fr))",
      7: "repeat(7, minmax(0, 1fr))",
      8: "repeat(8, minmax(0, 1fr))",
      9: "repeat(9, minmax(0, 1fr))",
      10: "repeat(10, minmax(0, 1fr))",
      11: "repeat(11, minmax(0, 1fr))",
      12: "repeat(12, minmax(0, 1fr))",
    },

    gridTemplateRows: {
      none: "none",
      subgrid: "subgrid",
      1: "repeat(1, minmax(0, 1fr))",
      2: "repeat(2, minmax(0, 1fr))",
      3: "repeat(3, minmax(0, 1fr))",
      4: "repeat(4, minmax(0, 1fr))",
      5: "repeat(5, minmax(0, 1fr))",
      6: "repeat(6, minmax(0, 1fr))",
      7: "repeat(7, minmax(0, 1fr))",
      8: "repeat(8, minmax(0, 1fr))",
      9: "repeat(9, minmax(0, 1fr))",
      10: "repeat(10, minmax(0, 1fr))",
      11: "repeat(11, minmax(0, 1fr))",
      12: "repeat(12, minmax(0, 1fr))",
    },

    /*===============================================================================
     * HEIGHT:
     *===============================================================================*/

    height: ({ theme }) => ({
      ...theme("spacing"),
      auto: "auto",
      "1/2": "50%",
      "1/3": "33.333333%",
      "2/3": "66.666667%",
      "1/4": "25%",
      "2/4": "50%",
      "3/4": "75%",
      "1/5": "20%",
      "2/5": "40%",
      "3/5": "60%",
      "4/5": "80%",
      "1/6": "16.666667%",
      "2/6": "33.333333%",
      "3/6": "50%",
      "4/6": "66.666667%",
      "5/6": "83.333333%",
      full: "100%",
      screen: "100vh",
      "screen-100": "calc(100vh - 100px)",
      "screen-110": "calc(100vh - 110px)",
      "screen-120": "calc(100vh - 120px)",
      "screen-130": "calc(100vh - 130px)",
      "screen-140": "calc(100vh - 140px)",
      "screen-150": "calc(100vh - 150px)",
      "screen-160": "calc(100vh - 160px)",
      "screen-170": "calc(100vh - 170px)",
      "screen-180": "calc(100vh - 180px)",
      "screen-190": "calc(100vh - 190px)",
      "screen-200": "calc(100vh - 200px)",
      "screen-210": "calc(100vh - 210px)",
      "screen-220": "calc(100vh - 220px)",
      "screen-230": "calc(100vh - 230px)",
      "screen-240": "calc(100vh - 240px)",
      "screen-250": "calc(100vh - 250px)",
      "screen-260": "calc(100vh - 260px)",
      "screen-270": "calc(100vh - 270px)",
      "screen-280": "calc(100vh - 280px)",
      "screen-290": "calc(100vh - 290px)",
      "screen-300": "calc(100vh - 300px)",
      "screen-310": "calc(100vh - 310px)",
      "screen-320": "calc(100vh - 320px)",
      "screen-330": "calc(100vh - 330px)",
      "screen-340": "calc(100vh - 340px)",
      "screen-350": "calc(100vh - 350px)",
      "screen-360": "calc(100vh - 360px)",
      "screen-370": "calc(100vh - 370px)",
      "screen-380": "calc(100vh - 380px)",
      "screen-390": "calc(100vh - 390px)",
      "screen-400": "calc(100vh - 400px)",
      "screen-410": "calc(100vh - 410px)",
      "screen-420": "calc(100vh - 420px)",
      "screen-430": "calc(100vh - 430px)",
      "screen-440": "calc(100vh - 440px)",
      "screen-450": "calc(100vh - 450px)",
      "screen-460": "calc(100vh - 460px)",
      "screen-470": "calc(100vh - 470px)",
      "screen-480": "calc(100vh - 480px)",
      "screen-490": "calc(100vh - 490px)",
      "screen-500": "calc(100vh - 500px)",
      "screen-510": "calc(100vh - 510px)",
      "screen-520": "calc(100vh - 520px)",
      "screen-530": "calc(100vh - 530px)",
      "screen-540": "calc(100vh - 540px)",
      "screen-550": "calc(100vh - 550px)",
      "screen-560": "calc(100vh - 560px)",
      "screen-570": "calc(100vh - 570px)",
      "screen-580": "calc(100vh - 580px)",
      "screen-590": "calc(100vh - 590px)",
      "screen-600": "calc(100vh - 600px)",
      "screen-610": "calc(100vh - 610px)",
      "screen-620": "calc(100vh - 620px)",
      "screen-630": "calc(100vh - 630px)",
      "screen-640": "calc(100vh - 640px)",
      "screen-650": "calc(100vh - 650px)",
      "screen-660": "calc(100vh - 660px)",
      "screen-670": "calc(100vh - 670px)",
      "screen-680": "calc(100vh - 680px)",
      "screen-690": "calc(100vh - 690px)",
      "screen-700": "calc(100vh - 700px)",
      "screen-710": "calc(100vh - 710px)",
      "screen-720": "calc(100vh - 720px)",
      "screen-730": "calc(100vh - 730px)",
      "screen-740": "calc(100vh - 740px)",
      "screen-750": "calc(100vh - 750px)",
      "screen-760": "calc(100vh - 760px)",
      "screen-770": "calc(100vh - 770px)",
      "screen-780": "calc(100vh - 780px)",
      "screen-790": "calc(100vh - 790px)",
      "screen-800": "calc(100vh - 800px)",
      "screen-810": "calc(100vh - 810px)",
      "screen-820": "calc(100vh - 820px)",
      "screen-830": "calc(100vh - 830px)",
      "screen-840": "calc(100vh - 840px)",
      "screen-850": "calc(100vh - 850px)",
      "screen-860": "calc(100vh - 860px)",
      "screen-870": "calc(100vh - 870px)",
      "screen-880": "calc(100vh - 880px)",
      "screen-890": "calc(100vh - 890px)",
      "screen-900": "calc(100vh - 900px)",
      "screen-910": "calc(100vh - 910px)",
      "screen-920": "calc(100vh - 920px)",
      "screen-930": "calc(100vh - 930px)",
      "screen-940": "calc(100vh - 940px)",
      "screen-950": "calc(100vh - 950px)",
      "screen-960": "calc(100vh - 960px)",
      "screen-970": "calc(100vh - 970px)",
      "screen-980": "calc(100vh - 980px)",
      "screen-990": "calc(100vh - 990px)",
      "screen-1000": "calc(100vh - 1000px)",
      svh: "100svh",
      lvh: "100lvh",
      dvh: "100dvh",
      min: "min-content",
      max: "max-content",
      fit: "fit-content",
    }),

    minHeight: ({ theme }) => ({
      ...theme("spacing"),
      full: "100%",
      screen: "100vh",
      svh: "100svh",
      lvh: "100lvh",
      dvh: "100dvh",
      min: "min-content",
      max: "max-content",
      fit: "fit-content",
    }),
    maxHeight: ({ theme }) => ({
      ...theme("spacing"),
      none: "none",
      full: "100%",
      screen: "100vh",
      svh: "100svh",
      lvh: "100lvh",
      dvh: "100dvh",
      min: "min-content",
      max: "max-content",
      fit: "fit-content",
    }),

    /*===============================================================================
     * HUE ROTATE:
     *===============================================================================*/

    hueRotate: {
      0: "0deg",
      15: "15deg",
      30: "30deg",
      60: "60deg",
      90: "90deg",
      180: "180deg",
    },

    /*===============================================================================
     * INSET:
     *===============================================================================*/

    inset: ({ theme }) => ({
      auto: "auto",
      ...theme("spacing"),
      "1/2": "50%",
      "1/3": "33.333333%",
      "2/3": "66.666667%",
      "1/4": "25%",
      "2/4": "50%",
      "3/4": "75%",
      full: "100%",
    }),

    /*===============================================================================
     * INVERT:
     *===============================================================================*/

    invert: {
      0: "0",
      DEFAULT: "100%",
    },

    /*===============================================================================
     * KEYFRAMES:
     *===============================================================================*/
    keyframes: {
      hide: { from: { opacity: "1" }, to: { opacity: "0" } },
      spin: {
        to: {
          transform: "rotate(360deg)",
        },
      },
      ping: {
        "75%, 100%": {
          transform: "scale(2)",
          opacity: "0",
        },
      },
      pulse: {
        "50%": {
          opacity: ".5",
        },
      },
      bounce: {
        "0%, 100%": {
          transform: "translateY(-25%)",
          animationTimingFunction: "cubic-bezier(0.8,0,1,1)",
        },
        "50%": {
          transform: "none",
          animationTimingFunction: "cubic-bezier(0,0,0.2,1)",
        },
      },
      shimmer: {
        from: {
          backgroundPosition: "0 0",
        },
        to: {
          backgroundPosition: "-200% 0",
        },
      },
      "caret-blink": {
        "0%,70%,100%": { opacity: "1" },
        "20%,50%": { opacity: "0" },
      },
      "accordion-down": {
        from: { height: "0" },
        to: { height: "var(--radix-accordion-content-height)" },
      },
      "accordion-up": {
        from: { height: "var(--radix-accordion-content-height)" },
        to: { height: "0" },
      },
      slideDownAndFade: {
        from: { opacity: "0", transform: "translateY(-6px)" },
        to: { opacity: "1", transform: "translateY(0)" },
      },
      slideLeftAndFade: {
        from: { opacity: "0", transform: "translateX(6px)" },
        to: { opacity: "1", transform: "translateX(0)" },
      },
      slideUpAndFade: {
        from: { opacity: "0", transform: "translateY(6px)" },
        to: { opacity: "1", transform: "translateY(0)" },
      },
      slideRightAndFade: {
        from: { opacity: "0", transform: "translateX(-6px)" },
        to: { opacity: "1", transform: "translateX(0)" },
      },
      fadeIn: {
        "0%": { opacity: "0" },
        "100%": { opacity: "1" },
      },
      fadeOut: {
        "0%": { opacity: "1" },
        "100%": { opacity: "0" },
      },
      splash: {
        "0%": {
          transform: "translate(0px, 0px) scale(1)",
        },
        "33%": {
          transform: "translate(30px, -50px) scale(1.1)",
        },
        "66%": {
          transform: "translate(-20px, 20px) scale(0.9)",
        },
        "100%": {
          transform: "translate(0px, 0px) scale(1)",
        },
      },
      loading: {
        "0%": {
          width: "0%",
        },
        "100%": {
          width: "92.5%",
        },
      },
    },

    /*===============================================================================
     * LIST STYLE:
     *===============================================================================*/

    listStyleType: {
      none: "none",
      disc: "disc",
      decimal: "decimal",
    },
    listStyleImage: {
      none: "none",
    },

    /*===============================================================================
     * MARGINS: *TBRL stands for => Top Bottom Right Left
     *===============================================================================*/

    margin: ({ theme }) => ({
      auto: "auto",
      "t-10": "10px 0 0 0",
      "r-10": "0 10px 0 0",
      "b-10": "0 0 10px 0",
      "l-10": "0 0 0 10px",

      "t-20": "20px 0 0 0",
      "r-20": "0 20px 0 0",
      "b-20": "0 0 20px 0",
      "l-20": "0 0 0 20px",

      "t-30": "30px 0 0 0",
      "r-30": "0 30px 0 0",
      "b-30": "0 0 30px 0",
      "l-30": "0 0 0 30px",

      "t-40": "40px 0 0 0",
      "r-40": "0 40px 0 0",
      "b-40": "0 0 40px 0",
      "l-40": "0 0 0 40px",

      "t-50": "50px 0 0 0",
      "r-50": "0 50px 0 0",
      "b-50": "0 0 50px 0",
      "l-50": "0 0 0 50px",

      "t-60": "60px 0 0 0",
      "r-60": "0 60px 0 0",
      "b-60": "0 0 60px 0",
      "l-60": "0 0 0 60px",

      "t-70": "70px 0 0 0",
      "r-70": "0 70px 0 0",
      "b-70": "0 0 70px 0",
      "l-70": "0 0 0 70px",

      "t-80": "80px 0 0 0",
      "r-80": "0 80px 0 0",
      "b-80": "0 0 80px 0",
      "l-80": "0 0 0 80px",

      "t-90": "90px 0 0 0",
      "r-90": "0 90px 0 0",
      "b-90": "0 0 90px 0",
      "l-90": "0 0 0 90px",

      "t-100": "100px 0 0 0",
      "r-100": "0 100px 0 0",
      "b-100": "0 0 100px 0",
      "l-100": "0 0 0 100px",

      ...theme("spacing"),
    }),

    /*===============================================================================
     * LINE CLAMP:
     *===============================================================================*/

    lineClamp: {
      1: "1",
      2: "2",
      3: "3",
      4: "4",
      5: "5",
      6: "6",
    },

    /*===============================================================================
     * OBJECT POSITION:
     *===============================================================================*/

    objectPosition: {
      bottom: "bottom",
      center: "center",
      left: "left",
      "left-bottom": "left bottom",
      "left-top": "left top",
      right: "right",
      "right-bottom": "right bottom",
      "right-top": "right top",
      top: "top",
    },

    /*===============================================================================
     * OPACITY:
     *===============================================================================*/

    opacity: {
      0: "0",
      5: "0.05",
      10: "0.1",
      15: "0.15",
      20: "0.2",
      25: "0.25",
      30: "0.3",
      35: "0.35",
      40: "0.4",
      45: "0.45",
      50: "0.5",
      55: "0.55",
      60: "0.6",
      65: "0.65",
      70: "0.7",
      75: "0.75",
      80: "0.8",
      85: "0.85",
      90: "0.9",
      95: "0.95",
      100: "1",
    },

    /*===============================================================================
     * ORDER:
     *===============================================================================*/

    order: {
      first: "-9999",
      last: "9999",
      none: "0",
      1: "1",
      2: "2",
      3: "3",
      4: "4",
      5: "5",
      6: "6",
      7: "7",
      8: "8",
      9: "9",
      10: "10",
      11: "11",
      12: "12",
    },

    /*===============================================================================
     * OUTLINE:
     *===============================================================================*/

    outlineColor: ({ theme }) => ({
      ...theme("colors"),
    }),

    outlineOffset: {
      0: "0px",
      1: "1px",
      2: "2px",
      4: "4px",
      8: "8px",
    },
    outlineWidth: {
      0: "0px",
      1: "1px",
      2: "2px",
      4: "4px",
      8: "8px",
    },

    /*===============================================================================
     * PADDING:
     *===============================================================================*/

    padding: ({ theme }) => ({
      ...theme("spacing"),
    }),

    /*===============================================================================
     * PLACEHOLDER:
     *===============================================================================*/

    placeholderColor: ({ theme }) => ({
      ...theme("colors"),
    }),

    placeholderOpacity: ({ theme }) => ({
      ...theme("opacity"),
    }),

    /*===============================================================================
     * RING:
     *===============================================================================*/

    ringColor: ({ theme }) => ({
      DEFAULT: theme("colors.brand", "currentColor"),
      ...theme("colors"),
    }),
    ringOffsetColor: ({ theme }) => ({
      ...theme("colors"),
    }),
    ringOffsetWidth: {
      0: "0px",
      1: "1px",
      2: "2px",
      4: "4px",
      8: "8px",
    },
    ringOpacity: ({ theme }) => ({
      DEFAULT: "0.5",
      ...theme("opacity"),
    }),
    ringWidth: {
      DEFAULT: "0px",
      0: "0px",
      1: "1px",
      2: "2px",
      4: "4px",
      8: "8px",
    },

    /*===============================================================================
     * ROTATE:
     *===============================================================================*/

    rotate: {
      0: "0deg",
      1: "1deg",
      2: "2deg",
      3: "3deg",
      6: "6deg",
      12: "12deg",
      45: "45deg",
      90: "90deg",
      180: "180deg",
    },

    /*===============================================================================
     * SATURATE:
     *===============================================================================*/

    saturate: {
      0: "0",
      50: ".5",
      100: "1",
      150: "1.5",
      200: "2",
    },

    /*===============================================================================
     * SCALE:
     *===============================================================================*/

    scale: {
      0: "0",
      50: ".5",
      75: ".75",
      90: ".9",
      95: ".95",
      100: "1",
      105: "1.05",
      110: "1.1",
      125: "1.25",
      150: "1.5",
    },

    /*===============================================================================
     * SCREENS/BREAKPOINTS:
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

    /*===============================================================================
     * SCROLL MARGIN & PADDING:
     *===============================================================================*/

    scrollMargin: ({ theme }) => ({
      ...theme("spacing"),
    }),

    scrollPadding: ({ theme }) => theme("spacing"),

    /*===============================================================================
     * SEPIA:
     *===============================================================================*/

    sepia: {
      0: "0",
      DEFAULT: "100%",
    },

    /*===============================================================================
     * SKEW:
     *===============================================================================*/

    skew: {
      0: "0deg",
      1: "1deg",
      2: "2deg",
      3: "3deg",
      6: "6deg",
      12: "12deg",
    },

    /*===============================================================================
     * SPACE/SPACING:
     *===============================================================================*/

    space: ({ theme }) => ({
      ...theme("spacing"),
    }),

    spacing: {
      px: "1px",
      0: "0px",
      0.5: "0.125rem",
      1: "0.25rem",
      1.5: "0.375rem",
      2: "0.5rem",
      2.5: "0.625rem",
      3: "0.75rem",
      3.5: "0.875rem",
      4: "1rem",
      5: "1.25rem",
      6: "1.5rem",
      7: "1.75rem",
      8: "2rem",
      9: "2.25rem",
      10: "2.5rem",
      11: "2.75rem",
      12: "3rem",
      14: "3.5rem",
      16: "4rem",
      20: "5rem",
      24: "6rem",
      28: "7rem",
      32: "8rem",
      36: "9rem",
      40: "10rem",
      44: "11rem",
      48: "12rem",
      52: "13rem",
      56: "14rem",
      60: "15rem",
      64: "16rem",
      72: "18rem",
      80: "20rem",
      96: "24rem",
    },

    /*===============================================================================
     * STROKE:
     *===============================================================================*/

    stroke: ({ theme }) => ({
      none: "none",
      ...theme("colors"),
    }),

    strokeWidth: {
      0: "0",
      1: "1",
      2: "2",
    },

    /*===============================================================================
     * TEXT:
     *===============================================================================*/

    textColor: ({ theme }) => theme("colors"),
    textDecorationColor: ({ theme }) => theme("colors"),
    textDecorationThickness: {
      auto: "auto",
      "from-font": "from-font",
      0: "0px",
      1: "1px",
      2: "2px",
      4: "4px",
      8: "8px",
    },
    textIndent: ({ theme }) => ({
      ...theme("spacing"),
    }),

    textOpacity: ({ theme }) => ({
      ...theme("opacity"),
    }),

    textUnderlineOffset: {
      auto: "auto",
      0: "0px",
      1: "1px",
      2: "2px",
      4: "4px",
      8: "8px",
    },

    /*===============================================================================
     * TRANSFORM:
     *===============================================================================*/

    transformOrigin: {
      center: "center",
      top: "top",
      "top-right": "top right",
      right: "right",
      "bottom-right": "bottom right",
      bottom: "bottom",
      "bottom-left": "bottom left",
      left: "left",
      "top-left": "top left",
    },

    /*===============================================================================
     * TRANSITION:
     *===============================================================================*/

    transitionDelay: {
      0: "0s",
      75: "75ms",
      100: "100ms",
      150: "150ms",
      200: "200ms",
      300: "300ms",
      500: "500ms",
      700: "700ms",
      1000: "1000ms",
    },

    transitionDuration: {
      DEFAULT: "150ms",
      0: "0s",
      75: "75ms",
      100: "100ms",
      150: "150ms",
      200: "200ms",
      300: "300ms",
      500: "500ms",
      700: "700ms",
      1000: "1000ms",
    },

    transitionProperty: {
      none: "none",
      all: "all",
      DEFAULT:
        "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter",
      colors:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      opacity: "opacity",
      shadow: "box-shadow",
      transform: "transform",
    },

    transitionTimingFunction: {
      DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
      linear: "linear",
      in: "cubic-bezier(0.4, 0, 1, 1)",
      out: "cubic-bezier(0, 0, 0.2, 1)",
      "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
    },

    /*===============================================================================
     * TRANSLATE:
     *===============================================================================*/

    translate: ({ theme }) => ({
      ...theme("spacing"),
      "1/2": "50%",
      "1/3": "33.333333%",
      "2/3": "66.666667%",
      "1/4": "25%",
      "2/4": "50%",
      "3/4": "75%",
      full: "100%",
    }),

    /*===============================================================================
     * SIZE:
     *===============================================================================*/

    // @ts-ignore
    size: ({ theme }) => ({
      ...theme("spacing"),
      auto: "auto",
      "1/2": "50%",
      "1/3": "33.333333%",
      "2/3": "66.666667%",
      "1/4": "25%",
      "2/4": "50%",
      "3/4": "75%",
      "1/5": "20%",
      "2/5": "40%",
      "3/5": "60%",
      "4/5": "80%",
      "1/6": "16.666667%",
      "2/6": "33.333333%",
      "3/6": "50%",
      "4/6": "66.666667%",
      "5/6": "83.333333%",
      "1/12": "8.333333%",
      "2/12": "16.666667%",
      "3/12": "25%",
      "4/12": "33.333333%",
      "5/12": "41.666667%",
      "6/12": "50%",
      "7/12": "58.333333%",
      "8/12": "66.666667%",
      "9/12": "75%",
      "10/12": "83.333333%",
      "11/12": "91.666667%",
      full: "100%",
      min: "min-content",
      max: "max-content",
      fit: "fit-content",
    }),

    /*===============================================================================
     * WIDTH:
     *===============================================================================*/

    // @ts-ignore
    width: ({ theme }) => ({
      auto: "auto",
      ...theme("spacing"),
      "1/2": "50%",
      "1/3": "33.333333%",
      "2/3": "66.666667%",
      "1/4": "25%",
      "2/4": "50%",
      "3/4": "75%",
      "1/5": "20%",
      "2/5": "40%",
      "3/5": "60%",
      "4/5": "80%",
      "1/6": "16.666667%",
      "2/6": "33.333333%",
      "3/6": "50%",
      "4/6": "66.666667%",
      "5/6": "83.333333%",
      "1/12": "8.333333%",
      "2/12": "16.666667%",
      "3/12": "25%",
      "4/12": "33.333333%",
      "5/12": "41.666667%",
      "6/12": "50%",
      "7/12": "58.333333%",
      "8/12": "66.666667%",
      "9/12": "75%",
      "10/12": "83.333333%",
      "11/12": "91.666667%",
      full: "100%",
      screen: "100vw",
      "screen-100": "calc(100vw - 100px)",
      "screen-110": "calc(100vw - 110px)",
      "screen-120": "calc(100vw - 120px)",
      "screen-130": "calc(100vw - 130px)",
      "screen-140": "calc(100vw - 140px)",
      "screen-150": "calc(100vw - 150px)",
      "screen-160": "calc(100vw - 160px)",
      "screen-170": "calc(100vw - 170px)",
      "screen-180": "calc(100vw - 180px)",
      "screen-190": "calc(100vw - 190px)",
      "screen-200": "calc(100vw - 200px)",
      "screen-210": "calc(100vw - 210px)",
      "screen-220": "calc(100vw - 220px)",
      "screen-230": "calc(100vw - 230px)",
      "screen-240": "calc(100vw - 240px)",
      "screen-250": "calc(100vw - 250px)",
      "screen-260": "calc(100vw - 260px)",
      "screen-270": "calc(100vw - 270px)",
      "screen-280": "calc(100vw - 280px)",
      "screen-290": "calc(100vw - 290px)",
      "screen-300": "calc(100vw - 300px)",
      "screen-310": "calc(100vw - 310px)",
      "screen-320": "calc(100vw - 320px)",
      "screen-330": "calc(100vw - 330px)",
      "screen-340": "calc(100vw - 340px)",
      "screen-350": "calc(100vw - 350px)",
      "screen-360": "calc(100vw - 360px)",
      "screen-370": "calc(100vw - 370px)",
      "screen-380": "calc(100vw - 380px)",
      "screen-390": "calc(100vw - 390px)",
      "screen-400": "calc(100vw - 400px)",
      "screen-410": "calc(100vw - 410px)",
      "screen-420": "calc(100vw - 420px)",
      "screen-430": "calc(100vw - 430px)",
      "screen-440": "calc(100vw - 440px)",
      "screen-450": "calc(100vw - 450px)",
      "screen-460": "calc(100vw - 460px)",
      "screen-470": "calc(100vw - 470px)",
      "screen-480": "calc(100vw - 480px)",
      "screen-490": "calc(100vw - 490px)",
      "screen-500": "calc(100vw - 500px)",
      "screen-510": "calc(100vw - 510px)",
      "screen-520": "calc(100vw - 520px)",
      "screen-530": "calc(100vw - 530px)",
      "screen-540": "calc(100vw - 540px)",
      "screen-550": "calc(100vw - 550px)",
      "screen-560": "calc(100vw - 560px)",
      "screen-570": "calc(100vw - 570px)",
      "screen-580": "calc(100vw - 580px)",
      "screen-590": "calc(100vw - 590px)",
      "screen-600": "calc(100vw - 600px)",
      "screen-610": "calc(100vw - 610px)",
      "screen-620": "calc(100vw - 620px)",
      "screen-630": "calc(100vw - 630px)",
      "screen-640": "calc(100vw - 640px)",
      "screen-650": "calc(100vw - 650px)",
      "screen-660": "calc(100vw - 660px)",
      "screen-670": "calc(100vw - 670px)",
      "screen-680": "calc(100vw - 680px)",
      "screen-690": "calc(100vw - 690px)",
      "screen-700": "calc(100vw - 700px)",
      "screen-710": "calc(100vw - 710px)",
      "screen-720": "calc(100vw - 720px)",
      "screen-730": "calc(100vw - 730px)",
      "screen-740": "calc(100vw - 740px)",
      "screen-750": "calc(100vw - 750px)",
      "screen-760": "calc(100vw - 760px)",
      "screen-770": "calc(100vw - 770px)",
      "screen-780": "calc(100vw - 780px)",
      "screen-790": "calc(100vw - 790px)",
      "screen-800": "calc(100vw - 800px)",
      "screen-810": "calc(100vw - 810px)",
      "screen-820": "calc(100vw - 820px)",
      "screen-830": "calc(100vw - 830px)",
      "screen-840": "calc(100vw - 840px)",
      "screen-850": "calc(100vw - 850px)",
      "screen-860": "calc(100vw - 860px)",
      "screen-870": "calc(100vw - 870px)",
      "screen-880": "calc(100vw - 880px)",
      "screen-890": "calc(100vw - 890px)",
      "screen-900": "calc(100vw - 900px)",
      "screen-910": "calc(100vw - 910px)",
      "screen-920": "calc(100vw - 920px)",
      "screen-930": "calc(100vw - 930px)",
      "screen-940": "calc(100vw - 940px)",
      "screen-950": "calc(100vw - 950px)",
      "screen-960": "calc(100vw - 960px)",
      "screen-970": "calc(100vw - 970px)",
      "screen-980": "calc(100vw - 980px)",
      "screen-990": "calc(100vw - 990px)",
      "screen-1000": "calc(100vw - 1000px)",
      svw: "100svw",
      lvw: "100lvw",
      dvw: "100dvw",
      min: "min-content",
      max: "max-content",
      fit: "fit-content",
    }),

    // @ts-ignore
    maxWidth: ({ theme, breakpoints }) => ({
      ...theme("spacing"),
      none: "none",
      xs: "20rem",
      sm: "24rem",
      md: "28rem",
      lg: "32rem",
      xl: "36rem",
      "2xl": "42rem",
      "3xl": "48rem",
      "4xl": "56rem",
      "5xl": "64rem",
      "6xl": "72rem",
      "7xl": "80rem",
      full: "100%",
      min: "min-content",
      max: "max-content",
      fit: "fit-content",
      prose: "65ch",
      ...breakpoints(theme("screens")),
    }),

    // @ts-ignore
    minWidth: ({ theme }) => ({
      ...theme("spacing"),
      full: "100%",
      min: "min-content",
      max: "max-content",
      fit: "fit-content",
    }),

    /*===============================================================================
     * WILL CHANGE:
     *===============================================================================*/

    willChange: {
      auto: "auto",
      scroll: "scroll-position",
      contents: "contents",
      transform: "transform",
    },

    /*===============================================================================
     * Z-INDEX:
     *===============================================================================*/

    zIndex: {
      auto: "auto",
      0: "0",
      10: "10",
      20: "20",
      30: "30",
      40: "40",
      50: "50",
      60: "60",
      70: "70",
      80: "80",
      90: "90",
      100: "100",
      1000: "1000",
    },
  },
});

module.exports = inSpatialTailwindConfig;
