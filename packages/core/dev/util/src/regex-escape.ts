const RESERVED_CHARS = {
  "&": "\\x26",
  "!": "\\x21",
  "#": "\\x23",
  $: "\\$",
  "%": "\\x25",
  "*": "\\*",
  "+": "\\+",
  ",": "\\x2c",
  ".": "\\.",
  ":": "\\x3a",
  ";": "\\x3b",
  "<": "\\x3c",
  "=": "\\x3d",
  ">": "\\x3e",
  "?": "\\?",
  "@": "\\x40",
  "^": "\\^",
  "`": "\\x60",
  "~": "\\x7e",
  "(": "\\(",
  ")": "\\)",
  "[": "\\[",
  "]": "\\]",
  "{": "\\{",
  "}": "\\}",
  "/": "\\/",
  "-": "\\x2d",
  "\\": "\\\\",
  "|": "\\|",
} as const;

const RX_REGEXP_ESCAPE = new RegExp(
  `[${Object.values(RESERVED_CHARS).join("")}]`,
  "gu"
);

/**
 * RegExp escapes arbitrary text for interpolation into a regexp, such that it will
 * match exactly that text and nothing else.
 *
 * @example Usage
 * ```ts
 * import { regEscape } from "@inspatial/util";
 * import { assertEquals, assertMatch, assertNotMatch } from "@inspatial/test";
 *
 * const re = new RegExp(`^${regEscape(".")}$`, "u");
 *
 * assertEquals("^\\.$", re.source);
 * assertMatch(".", re);
 * assertNotMatch("a", re);
 * ```
 *
 * @param str The string to escape.
 * @returns The escaped string.
 */
export function regEscape(str: string): string {
  return str
    .replace(
      RX_REGEXP_ESCAPE,
      (m) => RESERVED_CHARS[m as keyof typeof RESERVED_CHARS]
    )
    .replace(/^[0-9a-zA-Z]/, (m) => `\\x${m.codePointAt(0)!.toString(16)}`);
}
