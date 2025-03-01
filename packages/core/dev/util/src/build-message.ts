import {
  bgGreen,
  bgRed,
  bold,
  gray,
  green,
  red,
  white,
} from "../../theme/src/color/index.ts";
import { DiffResultProp, DiffTypeProp } from "./difference.ts";

/**
 * The `createDiffColor` utility function applies color formatting to text based on the type of difference (e.g., "added" or "removed"). It uses different colors to highlight changes, making it easier to visually identify differences.
 *
 * #### NOTE:
 * This utility is commonly used in testing frameworks to display differences between expected and actual outputs, helping you quickly identify discrepancies.
 *
 * #### Terminology:
 * ##### `assertion`: a check to see if something is true or false
 * ##### `difference`: a change between what you have and what you expect
 * ##### `assertion difference`: a change between what you have and what you expect in a check
 *
 * @param diffType Difference type, either added or removed.
 * @param background If true, colors the background instead of the text.
 *
 * @returns A function that colors the input string.
 *
 * @example Usage
 * ```ts
 * import { createDiffColor } from "@inspatial/util";
 * import { expect, test } from "@inspatial/test";
 * import { bold, green, red, white } from "@inspatial/theme/color";
 *
 *
 * test ({
 *  name: "create difference color added",
 *  fn: () => {
 *    expect(createDiffColor("added")("foo")).toBe(green(bold("foo")));
 *  }
 * })
 *
 * test ({
 *  name: "create difference color removed",
 *  fn: () => {
 *    expect(createDiffColor("removed")("foo")).toBe(red(bold("foo")));
 *  }
 * })
 *
 * test ({
 *  name: "create difference color common",
 *  fn: () => {
 *    expect(createDiffColor("common")("foo")).toBe(white("foo"));
 *  }
 * })
 * ```
 */
export function createDiffColor(
  diffType: DiffTypeProp,
  /**
   * Whether to color the background instead of the text.
   *
   * @default {false}
   */
  background = false
): (s: string) => string {
  switch (diffType) {
    case "added":
      return (s) => (background ? bgGreen(white(s)) : green(bold(s)));
    case "removed":
      return (s) => (background ? bgRed(white(s)) : red(bold(s)));
    default:
      return white;
  }
}
//#endregion createDiffColor

//#region createDiffSign
/**
 * The `createDiffSign` is a utility function that prefixes a "+" or "-" sign to indicate whether a line was added or removed in the difference output.
 *
 * #### NOTE:
 * This utility is commonly used in testing frameworks to display differences between expected and actual outputs, helping you quickly identify discrepancies.
 *
 * #### Terminology:
 * ##### `difference`: a change between what you have and what you expect
 *
 * @param diffType Difference type, either added or removed
 *
 * @returns A string representing the sign.
 *
 * @example Usage
 * ```ts
 * import { createDiffSign } from "@inspatial/util";
 * import { expect } from "@inspatial/test";
 *
 * expect(createDiffSign("added")).toBe("+   ");
 * expect(createDiffSign("removed")).toBe("-   ");
 * expect(createDiffSign("common")).toBe("    ");
 * ```
 */
export function createDiffSign(diffType: DiffTypeProp): string {
  switch (diffType) {
    case "added":
      return "+   ";
    case "removed":
      return "-   ";
    default:
      return "    ";
  }
}
//#endregion createDiffSign

/** Options for {@linkcode buildMessage}. */
interface BuildMessageOptions {
  /**
   * Whether to output the diff as a single string.
   *
   * @default {false}
   */
  stringDiff?: boolean;
}

/**
 * The `buildMessage` utility function constructs a formatted message that visually represents the differences between two strings or data sets. It uses the above utilities like {@linkcode createDiffColor} and {@linkcode createDiffSign} to enhance the readability of the difference output.
 *
 * #### NOTE:
 * This utility is commonly used in testing frameworks to display differences between expected and actual outputs, helping you quickly identify discrepancies.
 *
 * #### Terminology:
 * ##### `difference`: a change between what you have and what you expect
 *
 * @param diffResult The array of objects representing the differences between two strings or data sets
 * @param options Optional parameters for customizing the message.
 *
 * @returns An array of strings representing the built message.
 *
 * @example Usage
 * ```ts no-assert
 * import { diffStr, buildMessage } from "@inspatial/util";
 *
 * const diffResult = diffStr("Hello, world!", "Hello, world");
 *
 * console.log(buildMessage(diffResult));
 * // [
 * //   "",
 * //   "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
 * //   "    📊 InSpatial Test Results",
 * //   "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
 * //   "",
 * //   "    ⚡️ Compare: Actual vs Expected",
 * //   "┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄",
 * //   "",
 * //   "-   Hello, world!",
 * //   "+   Hello, world",
 * //   "",
 * //   "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
 * //   ""
 * // ]
 * ```
 */
export function buildMessage(
  diffResult: ReadonlyArray<DiffResultProp<string>>,
  options: BuildMessageOptions = {}
): string[] {
  const { stringDiff = false } = options;
  const messages = [
    "",
    gray("━".repeat(50)),
    `    ${bold("📊 InSpatial Test Results")}`,
    gray("━".repeat(50)),
    "",
    `    ${gray(bold("⚡️ Compare:"))} ${red(bold("Actual"))} ${gray("vs")} ${green(bold("Expected"))}`,
    gray("┄".repeat(50)),
    "",
  ];

  const diffMessages = diffResult.map((result) => {
    const color = createDiffColor(result.type);
    const line =
      result.details
        ?.map((detail) =>
          detail.type !== "common"
            ? createDiffColor(detail.type, true)(detail.value)
            : detail.value
        )
        .join("") ?? result.value;
    return color(`${createDiffSign(result.type)}${line}`);
  });

  messages.push(
    ...(stringDiff ? [diffMessages.join("")] : diffMessages),
    "",
    gray("━".repeat(50)),
    ""
  );

  return messages;
}
//#endregion buildMessage
