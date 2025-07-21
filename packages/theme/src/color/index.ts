/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                           InSpatial Color System                          ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  A comprehensive color system for InSpatial applications, providing:      ║
 * ║  - Theme-aware color palette                                              ║
 * ║  - CSS variable generation                                                ║
 * ║  - Terminal color utilities                                               ║
 * ║  - RGB color manipulation                                                 ║
 * ║                                                                           ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                Usage Guide                                ║
 * ╟───────────────────────────────────────────────────────────────────────────╢
 * ║                                                                           ║
 * ║  1. Theme Colors:                                                         ║
 * ║     import { inspatialColors } from "@inspatial/color";                   ║
 * ║                                                                           ║
 * ║  2. CSS Variables:                                                        ║
 * ║     - Inline: style={{ color: "var(--color-black)" }}                     ║
 * ║     - Tailwind: text-[var(--color-black)]                                 ║
 * ║                                                                           ║
 * ║  3. Terminal Colors:                                                      ║
 * ║     import { red, bgBlue } from "@inspatial/color";                       ║
 * ║     console.log(red("Error:"), bgBlue("Status"));                         ║
 * ║                                                                           ║
 * ║  4. RGB Manipulation:                                                     ║
 * ║     import { rgb24, rgb8 } from "@inspatial/color";                       ║
 * ║     console.log(rgb24("Custom", { r: 255, g: 0, b: 0 }));                 ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

// deno-lint-ignore no-explicit-any
const { Deno } = globalThis as any;
const noColor =
  typeof Deno?.noColor === "boolean" ? (Deno.noColor as boolean) : false;

interface Code {
  open: string;
  close: string;
  regexp: RegExp;
}
/**
 * TODO(@benemma): Unify the color system with the color system in @inspatial/iss types called `NamedColor`
 * inspatialColors is for reference and direct use of colors,
 * it is not recommended to use it in the code.
 *
 * @example Usage
 * ```ts no-assert
 * import { inspatialColors } from "@inspatial/theme/color";
 * ```
 * const blueColor = inspatialColors.blue;  // Returns "#009FE3"
 */
export const inspatialColors = {
  azure: "#f0ffff",
  beige: "#f5f5dc",
  bisque: "#ffe4c4",
  black: {
    light: "#1b2240",
    dark: "#ffffff",
  },
  blue: "#009FE3",
  brown: "#a52a2a",
  coral: "#ff7f50",
  cornsilk: "#fff8dc",
  crimson: "#dc143c",
  crystal: "#8BD8F4",
  cyan: "#00ffff",
  damp: "#D4DCEF",
  darkblue: "#00008b",
  darkcyan: "#008b8b",
  darkgrey: "#a9a9a9",
  darkred: "#8b0000",
  deeppink: "#ff1493",
  dimgrey: "#696969",
  eve: "#E9592B",
  gold: "#ffd700",
  green: "#0DEB57",
  grey: "#808080",
  honeydew: "#f0fff0",
  hotpink: "#ff69b4",
  indigo: "#4b0082",
  ivory: "#fffff0",
  khaki: "#f0e68c",
  lav: "#F9FAFC",
  lavender: "#e6e6fa",
  lime: "#8FF808",
  linen: "#faf0e6",
  maroon: "#800000",
  moccasin: "#ffe4b5",
  navy: "#000080",
  oldlace: "#fdf5e6",
  olive: "#808000",
  orange: "#ffa500",
  orchid: "#da70d6",
  peru: "#cd853f",
  pink: "#CE17D6",
  plum: "#dda0dd",
  pop: "#9000FF",
  purple: "#800080",
  red: "#D9251D",
  salmon: "#fa8072",
  seagreen: "#2e8b57",
  seashell: "#fff5ee",
  sienna: "#a0522d",
  silver: "#c0c0c0",
  skyblack: "#03082E",
  skyblue: "#87ceeb",
  snow: "#fffafa",
  tan: "#d2b48c",
  teal: "#008080",
  thistle: "#d8bfd8",
  tomato: "#ff6347",
  trackloud: "#EF0381",
  violet: "#ee82ee",
  wheat: "#f5deb3",
  white: {
    light: "#ffffff",
    dark: "#1b2240",
  },
  yellow: "#FFC837",
};

/**
 * Creates a case-insensitive RegExp pattern for matching hex color codes, optionally including alpha channel (ff)
 * @param hex - The hexadecimal color value without the '#' prefix
 * @returns A RegExp that matches the hex color with optional alpha channel
 */
const HEX_PATTERN = (hex: string): RegExp =>
  new RegExp(`#${hex}(ff)?(?!\\w)`, "gi");

/**
 * TODO(@benemma): Unify the color system with the color system in @inspatial/iss types called `NamedColor`
 * inspatialColorPatterns is for finding and manipulating colors within text/code
 *
 * @example Usage
 * ```ts no-assert
 * import { inspatialColorPatterns } from "@inspatial/theme/color";
 *
 * const hasBlue = inspatialColorPatterns.blue.test("#009FE3");  // Returns true
 * const replaced = someString.replace(inspatialColorPatterns.blue, 'blue');
 * ```
 */
export const inspatialColorPatterns: Record<
  keyof typeof inspatialColors,
  RegExp | { light: RegExp; dark: RegExp }
> = {
  azure: HEX_PATTERN("f0ffff"),
  beige: HEX_PATTERN("f5f5dc"),
  bisque: HEX_PATTERN("ffe4c4"),
  black: {
    light: HEX_PATTERN("1b2240"),
    dark: HEX_PATTERN("ffffff"),
  },
  blue: HEX_PATTERN("009FE3"),
  brown: HEX_PATTERN("a52a2a"),
  coral: HEX_PATTERN("ff7f50"),
  cornsilk: HEX_PATTERN("fff8dc"),
  crimson: HEX_PATTERN("dc143c"),
  crystal: HEX_PATTERN("8BD8F4"),
  cyan: HEX_PATTERN("00ffff"),
  damp: HEX_PATTERN("D4DCEF"),
  darkblue: HEX_PATTERN("00008b"),
  darkcyan: HEX_PATTERN("008b8b"),
  darkgrey: HEX_PATTERN("a9a9a9"),
  darkred: HEX_PATTERN("8b0000"),
  deeppink: HEX_PATTERN("ff1493"),
  dimgrey: HEX_PATTERN("696969"),
  eve: HEX_PATTERN("E9592B"),
  gold: HEX_PATTERN("ffd700"),
  green: HEX_PATTERN("0DEB57"),
  grey: HEX_PATTERN("808080"),
  honeydew: HEX_PATTERN("f0fff0"),
  hotpink: HEX_PATTERN("ff69b4"),
  indigo: HEX_PATTERN("4b0082"),
  ivory: HEX_PATTERN("fffff0"),
  khaki: HEX_PATTERN("f0e68c"),
  lav: HEX_PATTERN("F9FAFC"),
  lavender: HEX_PATTERN("e6e6fa"),
  lime: HEX_PATTERN("8FF808"),
  linen: HEX_PATTERN("faf0e6"),
  maroon: HEX_PATTERN("800000"),
  moccasin: HEX_PATTERN("ffe4b5"),
  navy: HEX_PATTERN("000080"),
  oldlace: HEX_PATTERN("fdf5e6"),
  olive: HEX_PATTERN("808000"),
  orange: HEX_PATTERN("ffa500"),
  orchid: HEX_PATTERN("da70d6"),
  peru: HEX_PATTERN("cd853f"),
  pink: HEX_PATTERN("CE17D6"),
  plum: HEX_PATTERN("dda0dd"),
  pop: HEX_PATTERN("9000FF"),
  purple: HEX_PATTERN("800080"),
  red: HEX_PATTERN("D9251D"),
  salmon: HEX_PATTERN("fa8072"),
  seagreen: HEX_PATTERN("2e8b57"),
  seashell: HEX_PATTERN("fff5ee"),
  sienna: HEX_PATTERN("a0522d"),
  silver: HEX_PATTERN("c0c0c0"),
  skyblack: HEX_PATTERN("03082E"),
  skyblue: HEX_PATTERN("87ceeb"),
  snow: HEX_PATTERN("fffafa"),
  tan: HEX_PATTERN("d2b48c"),
  teal: HEX_PATTERN("008080"),
  thistle: HEX_PATTERN("d8bfd8"),
  tomato: HEX_PATTERN("ff6347"),
  trackloud: HEX_PATTERN("EF0381"),
  violet: HEX_PATTERN("ee82ee"),
  wheat: HEX_PATTERN("f5deb3"),
  white: {
    light: HEX_PATTERN("ffffff"),
    dark: HEX_PATTERN("1b2240"),
  },
  yellow: HEX_PATTERN("FFC837"),
};

/**
 * Generate CSS color variables for dark and light themes
 * @returns
 */
export function generateColorVariables(isDark: boolean): string {
  return Object.entries(inspatialColors)
    .map(([name, value]) => {
      const color =
        typeof value === "string" ? value : isDark ? value.dark : value.light;
      return `--color-${name}: ${color};`;
    })
    .join("\n");
}

/** RGB 8-bits per channel. Each in range `0->255` or `0x00->0xff` */
export interface Rgb {
  /** Red component value */
  r: number;
  /** Green component value */
  g: number;
  /** Blue component value */
  b: number;
}

let enabled = !noColor;

/**
 * Enable or disable text color when styling.
 *
 * `@inspatial/util` automatically detects NO_COLOR environmental variable
 * and disables text color. Use this API only when the automatic detection
 * doesn't work.
 *
 * @example Usage
 * ```ts no-assert
 * import { setColorEnabled } from "@inspatial/util";
 *
 * // Disable text color
 * setColorEnabled(false);
 *
 * // Enable text color
 * setColorEnabled(true);
 * ```
 *
 * @param value The boolean value to enable or disable text color
 */
export function setColorEnabled(value: boolean) {
  if (Deno?.noColor) {
    return;
  }

  enabled = value;
}

/**
 * Get whether text color change is enabled or disabled.
 *
 * @example Usage
 * ```ts no-assert
 * import { getColorEnabled } from "@inspatial/util";
 *
 * console.log(getColorEnabled()); // true if enabled, false if disabled
 * ```
 * @returns `true` if text color is enabled, `false` otherwise
 */
export function getColorEnabled(): boolean {
  return enabled;
}

/**
 * Builds color code
 * @param open
 * @param close
 */
function code(open: number[], close: number): Code {
  return {
    open: `\x1b[${open.join(";")}m`,
    close: `\x1b[${close}m`,
    regexp: new RegExp(`\\x1b\\[${close}m`, "g"),
  };
}

/**
 * Applies color and background based on color code and its associated text
 * @param str The text to apply color settings to
 * @param code The color code to apply
 */
function run(str: string, code: Code): string {
  return enabled
    ? `${code.open}${str.replace(code.regexp, code.open)}${code.close}`
    : str;
}

/**
 * Reset the text modified.
 *
 * @example Usage
 * ```ts no-assert
 * import { reset } from "@inspatial/util";
 *
 * console.log(reset("Hello, world!"));
 * ```
 *
 * @param str The text to reset
 * @returns The text with reset color
 */
export function reset(str: string): string {
  return run(str, code([0], 0));
}

/**
 * Make the text bold.
 *
 * @example Usage
 * ```ts no-assert
 * import { bold } from "@inspatial/util";
 *
 * console.log(bold("Hello, world!"));
 * ```
 *
 * @param str The text to make bold
 * @returns The bold text
 */
export function bold(str: string): string {
  return run(str, code([1], 22));
}

/**
 * The text emits only a small amount of light.
 *
 * @example Usage
 * ```ts no-assert
 * import { dim } from "@inspatial/util";
 *
 * console.log(dim("Hello, world!"));
 * ```
 *
 * @param str The text to dim
 * @returns The dimmed text
 *
 * Warning: Not all terminal emulators support `dim`.
 * For compatibility across all terminals, use {@linkcode gray} or {@linkcode brightBlack} instead.
 */
export function dim(str: string): string {
  return run(str, code([2], 22));
}

/**
 * Make the text italic.
 *
 * @example Usage
 * ```ts no-assert
 * import { italic } from "@inspatial/util";
 *
 * console.log(italic("Hello, world!"));
 * ```
 *
 * @param str The text to make italic
 * @returns The italic text
 */
export function italic(str: string): string {
  return run(str, code([3], 23));
}

/**
 * Make the text underline.
 *
 * @example Usage
 * ```ts no-assert
 * import { underline } from "@inspatial/util";
 *
 * console.log(underline("Hello, world!"));
 * ```
 *
 * @param str The text to underline
 * @returns The underlined text
 */
export function underline(str: string): string {
  return run(str, code([4], 24));
}

/**
 * Invert background color and text color.
 *
 * @example Usage
 * ```ts no-assert
 * import { inverse } from "@inspatial/util";
 *
 * console.log(inverse("Hello, world!"));
 * ```
 *
 * @param str The text to invert its color
 * @returns The inverted text
 */
export function invert(str: string): string {
  return run(str, code([7], 27));
}

/**
 * Make the text hidden.
 *
 * @example Usage
 * ```ts no-assert
 * import { hidden } from "@inspatial/util";
 *
 * console.log(hidden("Hello, world!"));
 * ```
 *
 * @param str The text to hide
 * @returns The hidden text
 */
export function hidden(str: string): string {
  return run(str, code([8], 28));
}

/**
 * Put horizontal line through the center of the text.
 *
 * @example Usage
 * ```ts no-assert
 * import { strikethrough } from "@inspatial/util";
 *
 * console.log(strikethrough("Hello, world!"));
 * ```
 *
 * @param str The text to strike through
 * @returns The text with horizontal line through the center
 */
export function strikethrough(str: string): string {
  return run(str, code([9], 29));
}

/**
 * Set text color to black.
 *
 * @example Usage
 * ```ts no-assert
 * import { black } from "@inspatial/util";
 *
 * console.log(black("Hello, world!"));
 * ```
 *
 * @param str The text to make black
 * @returns The black text
 */
export function black(str: string): string {
  return run(str, code([30], 39));
}

/**
 * Set text color to red.
 *
 * @example Usage
 * ```ts no-assert
 * import { red } from "@inspatial/util";
 *
 * console.log(red("Hello, world!"));
 * ```
 *
 * @param str The text to make red
 * @returns The red text
 */
export function red(str: string): string {
  return run(str, code([31], 39));
}

/**
 * Set text color to green.
 *
 * @example Usage
 * ```ts no-assert
 * import { green } from "@inspatial/util";
 *
 * console.log(green("Hello, world!"));
 * ```
 *
 * @param str The text to make green
 * @returns The green text
 */
export function green(str: string): string {
  return run(str, code([32], 39));
}

/**
 * Set text color to yellow.
 *
 * @example Usage
 * ```ts no-assert
 * import { yellow } from "@inspatial/util";
 *
 * console.log(yellow("Hello, world!"));
 * ```
 *
 * @param str The text to make yellow
 * @returns The yellow text
 */
export function yellow(str: string): string {
  return run(str, code([33], 39));
}

/**
 * Set text color to blue.
 *
 * @example Usage
 * ```ts no-assert
 * import { blue } from "@inspatial/util";
 *
 * console.log(blue("Hello, world!"));
 * ```
 *
 * @param str The text to make blue
 * @returns The blue text
 */
export function blue(str: string): string {
  return run(str, code([34], 39));
}

/**
 * Set text color to magenta.
 *
 * @example Usage
 * ```ts no-assert
 * import { magenta } from "@inspatial/util";
 *
 * console.log(magenta("Hello, world!"));
 * ```
 *
 * @param str The text to make magenta
 * @returns The magenta text
 */
export function magenta(str: string): string {
  return run(str, code([35], 39));
}

/**
 * Set text color to cyan.
 *
 * @example Usage
 * ```ts no-assert
 * import { cyan } from "@inspatial/util";
 *
 * console.log(cyan("Hello, world!"));
 * ```
 *
 * @param str The text to make cyan
 * @returns The cyan text
 */
export function cyan(str: string): string {
  return run(str, code([36], 39));
}

/**
 * Set text color to white.
 *
 * @example Usage
 * ```ts no-assert
 * import { white } from "@inspatial/util";
 *
 * console.log(white("Hello, world!"));
 * ```
 *
 * @param str The text to make white
 * @returns The white text
 */
export function white(str: string): string {
  return run(str, code([37], 39));
}

/**
 * Set text color to gray.
 *
 * @example Usage
 * ```ts no-assert
 * import { gray } from "@inspatial/util";
 *
 * console.log(gray("Hello, world!"));
 * ```
 *
 * @param str The text to make gray
 * @returns The gray text
 */
export function gray(str: string): string {
  return brightBlack(str);
}

/**
 * Set text color to bright black.
 *
 * @example Usage
 * ```ts no-assert
 * import { brightBlack } from "@inspatial/util";
 *
 * console.log(brightBlack("Hello, world!"));
 * ```
 *
 * @param str The text to make bright black
 * @returns The bright black text
 */
export function brightBlack(str: string): string {
  return run(str, code([90], 39));
}

/**
 * Set text color to bright red.
 *
 * @example Usage
 * ```ts no-assert
 * import { brightRed } from "@inspatial/util";
 *
 * console.log(brightRed("Hello, world!"));
 * ```
 *
 * @param str The text to make bright red
 * @returns The bright red text
 */
export function brightRed(str: string): string {
  return run(str, code([91], 39));
}

/**
 * Set text color to bright green.
 *
 * @example Usage
 * ```ts no-assert
 * import { brightGreen } from "@inspatial/util";
 *
 * console.log(brightGreen("Hello, world!"));
 * ```
 *
 * @param str The text to make bright green
 * @returns The bright green text
 */
export function brightGreen(str: string): string {
  return run(str, code([92], 39));
}

/**
 * Set text color to bright yellow.
 *
 * @example Usage
 * ```ts no-assert
 * import { brightYellow } from "@inspatial/util";
 *
 * console.log(brightYellow("Hello, world!"));
 * ```
 *
 * @param str The text to make bright yellow
 * @returns The bright yellow text
 */
export function brightYellow(str: string): string {
  return run(str, code([93], 39));
}

/**
 * Set text color to bright blue.
 *
 * @example Usage
 * ```ts no-assert
 * import { brightBlue } from "@inspatial/util";
 *
 * console.log(brightBlue("Hello, world!"));
 * ```
 *
 * @param str The text to make bright blue
 * @returns The bright blue text
 */
export function brightBlue(str: string): string {
  return run(str, code([94], 39));
}

/**
 * Set text color to bright magenta.
 *
 * @example Usage
 * ```ts no-assert
 * import { brightMagenta } from "@inspatial/util";
 *
 * console.log(brightMagenta("Hello, world!"));
 * ```
 *
 * @param str The text to make bright magenta
 * @returns The bright magenta text
 */
export function brightMagenta(str: string): string {
  return run(str, code([95], 39));
}

/**
 * Set text color to bright cyan.
 *
 * @example Usage
 * ```ts no-assert
 * import { brightCyan } from "@inspatial/util";
 *
 * console.log(brightCyan("Hello, world!"));
 * ```
 *
 * @param str The text to make bright cyan
 * @returns The bright cyan text
 */
export function brightCyan(str: string): string {
  return run(str, code([96], 39));
}

/**
 * Set text color to bright white.
 *
 * @example Usage
 * ```ts no-assert
 * import { brightWhite } from "@inspatial/util";
 *
 * console.log(brightWhite("Hello, world!"));
 * ```
 *
 * @param str The text to make bright white
 * @returns The bright white text
 */
export function brightWhite(str: string): string {
  return run(str, code([97], 39));
}

/**
 * Set background color to black.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgBlack } from "@inspatial/util";
 *
 * console.log(bgBlack("Hello, world!"));
 * ```
 *
 * @param str The text to make its background black
 * @returns The text with black background
 */
export function bgBlack(str: string): string {
  return run(str, code([40], 49));
}

/**
 * Set background color to red.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgRed } from "@inspatial/util";
 *
 * console.log(bgRed("Hello, world!"));
 * ```
 *
 * @param str The text to make its background red
 * @returns The text with red background
 */
export function bgRed(str: string): string {
  return run(str, code([41], 49));
}

/**
 * Set background color to green.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgGreen } from "@inspatial/util";
 *
 * console.log(bgGreen("Hello, world!"));
 * ```
 *
 * @param str The text to make its background green
 * @returns The text with green background
 */
export function bgGreen(str: string): string {
  return run(str, code([42], 49));
}

/**
 * Set background color to yellow.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgYellow } from "@inspatial/util";
 *
 * console.log(bgYellow("Hello, world!"));
 * ```
 *
 * @param str The text to make its background yellow
 * @returns The text with yellow background
 */
export function bgYellow(str: string): string {
  return run(str, code([43], 49));
}

/**
 * Set background color to blue.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgBlue } from "@inspatial/util";
 *
 * console.log(bgBlue("Hello, world!"));
 * ```
 *
 * @param str The text to make its background blue
 * @returns The text with blue background
 */
export function bgBlue(str: string): string {
  return run(str, code([44], 49));
}

/**
 *  Set background color to magenta.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgMagenta } from "@inspatial/util";
 *
 * console.log(bgMagenta("Hello, world!"));
 * ```
 *
 * @param str The text to make its background magenta
 * @returns The text with magenta background
 */
export function bgMagenta(str: string): string {
  return run(str, code([45], 49));
}

/**
 * Set background color to cyan.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgCyan } from "@inspatial/util";
 *
 * console.log(bgCyan("Hello, world!"));
 * ```
 *
 * @param str The text to make its background cyan
 * @returns The text with cyan background
 */
export function bgCyan(str: string): string {
  return run(str, code([46], 49));
}

/**
 * Set background color to white.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgWhite } from "@inspatial/util";
 *
 * console.log(bgWhite("Hello, world!"));
 * ```
 *
 * @param str The text to make its background white
 * @returns The text with white background
 */
export function bgWhite(str: string): string {
  return run(str, code([47], 49));
}

/**
 * Set background color to bright black.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgBrightBlack } from "@inspatial/util";
 *
 * console.log(bgBrightBlack("Hello, world!"));
 * ```
 *
 * @param str The text to make its background bright black
 * @returns The text with bright black background
 */
export function bgBrightBlack(str: string): string {
  return run(str, code([100], 49));
}

/**
 * Set background color to bright red.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgBrightRed } from "@inspatial/util";
 *
 * console.log(bgBrightRed("Hello, world!"));
 * ```
 *
 * @param str The text to make its background bright red
 * @returns The text with bright red background
 */
export function bgBrightRed(str: string): string {
  return run(str, code([101], 49));
}

/**
 * Set background color to bright green.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgBrightGreen } from "@inspatial/util";
 *
 * console.log(bgBrightGreen("Hello, world!"));
 * ```
 *
 * @param str The text to make its background bright green
 * @returns The text with bright green background
 */
export function bgBrightGreen(str: string): string {
  return run(str, code([102], 49));
}

/**
 * Set background color to bright yellow.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgBrightYellow } from "@inspatial/util";
 *
 * console.log(bgBrightYellow("Hello, world!"));
 * ```
 *
 * @param str The text to make its background bright yellow
 * @returns The text with bright yellow background
 */
export function bgBrightYellow(str: string): string {
  return run(str, code([103], 49));
}

/**
 * Set background color to bright blue.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgBrightBlue } from "@inspatial/util";
 *
 * console.log(bgBrightBlue("Hello, world!"));
 * ```
 *
 * @param str The text to make its background bright blue
 * @returns The text with bright blue background
 */
export function bgBrightBlue(str: string): string {
  return run(str, code([104], 49));
}

/**
 * Set background color to bright magenta.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgBrightMagenta } from "@inspatial/util";
 *
 * console.log(bgBrightMagenta("Hello, world!"));
 * ```
 *
 * @param str The text to make its background bright magenta
 * @returns The text with bright magenta background
 */
export function bgBrightMagenta(str: string): string {
  return run(str, code([105], 49));
}

/**
 * Set background color to bright cyan.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgBrightCyan } from "@inspatial/util";
 *
 * console.log(bgBrightCyan("Hello, world!"));
 * ```
 *
 * @param str The text to make its background bright cyan
 * @returns The text with bright cyan background
 */
export function bgBrightCyan(str: string): string {
  return run(str, code([106], 49));
}

/**
 * Set background color to bright white.
 *
 * @example Usage
 * ```ts no-assert
 * import { bgBrightWhite } from "@inspatial/util";
 *
 * console.log(bgBrightWhite("Hello, world!"));
 * ```
 *
 * @param str The text to make its background bright white
 * @returns The text with bright white background
 */
export function bgBrightWhite(str: string): string {
  return run(str, code([107], 49));
}

/* Special Color Sequences */

/**
 * Clam and truncate color codes
 * @param n The input number
 * @param max The number to truncate to
 * @param min The number to truncate from
 */
function clampAndTruncate(n: number, max = 255, min = 0): number {
  return Math.trunc(Math.max(Math.min(n, max), min));
}

/**
 * Set text color using paletted 8bit colors.
 * https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit
 *
 * @example Usage
 * ```ts no-assert
 * import { rgb8 } from "@inspatial/util";
 *
 * console.log(rgb8("Hello, world!", 42));
 * ```
 *
 * @param str The text color to apply paletted 8bit colors to
 * @param color The color code
 * @returns The text with paletted 8bit color
 */
export function rgb8(str: string, color: number): string {
  return run(str, code([38, 5, clampAndTruncate(color)], 39));
}

/**
 * Set background color using paletted 8bit colors.
 * https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit
 *
 * @example Usage
 * ```ts no-assert
 * import { bgRgb8 } from "@inspatial/util";
 *
 * console.log(bgRgb8("Hello, world!", 42));
 * ```
 *
 * @param str The text color to apply paletted 8bit background colors to
 * @param color code
 * @returns The text with paletted 8bit background color
 */
export function bgRgb8(str: string, color: number): string {
  return run(str, code([48, 5, clampAndTruncate(color)], 49));
}

/**
 * Set text color using 24bit rgb.
 * `color` can be a number in range `0x000000` to `0xffffff` or
 * an `Rgb`.
 *
 * @example To produce the color magenta:
 * ```ts no-assert
 * import { rgb24 } from "@inspatial/util";
 *
 * rgb24("foo", 0xff00ff);
 * rgb24("foo", {r: 255, g: 0, b: 255});
 * ``` * @param str The text color to apply 24bit rgb to
 * @param color The color code
 * @returns The text with 24bit rgb color
 */
export function rgb24(str: string, color: number | Rgb): string {
  if (typeof color === "number") {
    return run(
      str,
      code([38, 2, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff], 39)
    );
  }
  return run(
    str,
    code(
      [
        38,
        2,
        clampAndTruncate(color.r),
        clampAndTruncate(color.g),
        clampAndTruncate(color.b),
      ],
      39
    )
  );
}

/**
 * Set background color using 24bit rgb.
 * `color` can be a number in range `0x000000` to `0xffffff` or
 * an `Rgb`.
 *
 * @example To produce the color magenta:
 * ```ts no-assert
 * import { bgRgb24 } from "@inspatial/util";
 *
 * bgRgb24("foo", 0xff00ff);
 * bgRgb24("foo", {r: 255, g: 0, b: 255});
 * ```
 * @param str The text color to apply 24bit rgb to
 * @param color The color code
 * @returns The text with 24bit rgb color
 */
export function bgRgb24(str: string, color: number | Rgb): string {
  if (typeof color === "number") {
    return run(
      str,
      code([48, 2, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff], 49)
    );
  }
  return run(
    str,
    code(
      [
        48,
        2,
        clampAndTruncate(color.r),
        clampAndTruncate(color.g),
        clampAndTruncate(color.b),
      ],
      49
    )
  );
}

// https://github.com/chalk/ansi-regex/blob/02fa893d619d3da85411acc8fd4e2eea0e95a9d9/index.js
const ANSI_PATTERN = new RegExp(
  [
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TXZcf-nq-uy=><~]))",
  ].join("|"),
  "g"
);

/**
 * Remove ANSI escape codes from the string.
 *
 * @example Usage
 * ```ts no-assert
 * import { stripAnsiCode, red } from "@inspatial/util";
 *
 * console.log(stripAnsiCode(red("Hello, world!")));
 * ```
 *
 * @param string The text to remove ANSI escape codes from
 * @returns The text without ANSI escape codes
 */
export function stripAnsiCode(string: string): string {
  return string.replace(ANSI_PATTERN, "");
}
