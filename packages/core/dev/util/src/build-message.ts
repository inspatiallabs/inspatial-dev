import {
  bgGreen,
  bgRed,
  bold,
  gray,
  green,
  red,
  white,
} from "jsr:@inspatial/theme/color";

/*#############################################(TYPES)#############################################*/
//#region DiffType
/** Ways that lines in a diff can be different. */
type DiffTypeProp = "removed" | "common" | "added";
//#endregion DiffType

//#region DiffResult
/**
 * Represents the result of a diff operation.
 *
 * @typeParam T The type of the value in the diff result.
 */
interface DiffResultProp<T> {
  /** The type of the diff. */
  type: DiffTypeProp;
  /** The value of the diff. */
  value: T;
  /** The details of the diff. */
  details?: DiffResultProp<T>[];
}

/**
 * Colors the output of assertion diffs.
 *
 * @param diffType Difference type, either added or removed.
 * @param background If true, colors the background instead of the text.
 *
 * @returns A function that colors the input string.
 *
 * @example Usage
 * ```ts
 * import { createDiffColor } from "@inspatial/util";
 * import { expect } from "@inspatial/test";
 * import { bold, green, red, white } from "@inspatial/theme/color";
 *
 * expect(createDiffColor("added")("foo")).toBe(green(bold("foo")));
 * expect(createDiffColor("removed")("foo")).toBe(red(bold("foo")));
 * expect(createDiffColor("common")("foo")).toBe(white("foo"));
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
 * Prefixes `+` or `-` in diff output.
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
 * Builds a message based on the provided diff result with enhanced visual formatting.
 *
 * @param diffResult The diff result array.
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
//#endregion BuildMessage
