// Imports
import hljs from "npm:highlight.js@11.10.0/lib/core";
import typescript from "npm:highlight.js@11.10.0/lib/languages/typescript";
import {
  bgBlack,
  bgWhite,
  bgYellow,
  black,
  blue,
  cyan,
  gray,
  green,
  stripAnsiCode,
  underline,
  yellow,
} from "@inspatial/theme";
import { unescape } from "jsr:@std/html@1.0.0/entities";
hljs.registerLanguage("typescript", typescript);

/**
 * Syntax highlights code strings within backticks with ANSI codes.
 *
 * ```ts
 * import { highlight } from "./highlight.ts"
 * console.log(highlight("`const foo = 'bar'`"))
 * ```
 */
export function highlight(
  text: string,
  { underline: underlined = false, header = "", type = "" } = {} as {
    underline?: boolean;
    header?: string;
    type?: string;
  }
): string {
  text = text.replace(/`([^`]*?)`/g, (_, content) => {
    let highlighted = process(
      unescape(hljs.highlight(content, { language: "typescript" }).value)
    );
    if (underlined) {
      highlighted = underline(highlighted);
    }
    return highlighted;
  });
  let background = bgWhite;
  if (type === "warn") {
    text = yellow(stripAnsiCode(text));
    background = bgYellow;
  }
  if (type === "debug") {
    text = gray(stripAnsiCode(text));
    background = bgBlack;
  }
  if (header) {
    text = `${background(black(` ${header} `))} ${text}`;
  }
  return text;
}

/** Process rendered highlight.js html back to cli formatted highlighing. */
function process(html: string) {
  const stack: Array<{
    classname: string;
    a: number;
    b: number;
  }> = [];
  const regex = /<span[^>]*class="([^"]*)"[^>]*>|<\/span>/g;

  let match: RegExpExecArray | null = null;
  while ((match = regex.exec(html)) !== null) {
    const [captured] = match;
    const isOpen = captured.startsWith("<span");
    const isClose = captured === "</span>";
    const classname = isOpen ? match[1] : "";

    if (isOpen) {
      stack.push({
        classname,
        a: match.index,
        b: match.index + captured.length,
      });
    }
    if (isClose) {
      const { a, b, classname } = stack.pop()!;
      return process(
        `${html.substring(0, a)}${color(
          html.substring(b, match.index),
          classname
        )}${html.substring(match.index + captured.length)}`
      );
    }
  }
  return html;
}

/** Color content according to highlight.js classname. */
function color(content: string, classname: string) {
  return (
    {
      "hljs-comment": gray,
      "hljs-keyword": cyan,
      "hljs-string": green,
      "hljs-title function_": blue,
      "hljs-title class_": blue,
      "hljs-literal": yellow,
      "hljs-number": yellow,
    }[classname] ?? ((text: string) => text)
  )(content);
}
