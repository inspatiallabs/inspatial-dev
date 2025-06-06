import type { ISSProps } from "@inspatial/theme/iss";
/**
 * CSS rule types
 */
export enum CSSRuleType {
  STYLE_RULE = 1,
  IMPORT_RULE = 3,
  MEDIA_RULE = 4,
  FONT_FACE_RULE = 5,
  PAGE_RULE = 6,
  KEYFRAMES_RULE = 7,
  KEYFRAME_RULE = 8,
  SUPPORTS_RULE = 12,
  DOCUMENT_RULE = 13,
  HOST_RULE = 14,
}

/**
 * Interface for CSS properties accessed via style object
 * This allows for proper TypeScript typing with element.style.color, etc.
 * Uses ISSProp library for comprehensive property definitions
 */
export type CSSProperties = ISSProps;

/**
 * CSS style declaration class to store properties and values
 */
export class CSSStyleDeclaration {
  // Private properties for internal storage
  _properties: Map<string, { value: string; priority: string }> = new Map();
  _parentRule: CSSRule | null = null;
  _ownerNode: any = null;
  _readOnly: boolean = false;
  _updating: boolean = false;
  _computed: boolean = false;
  __starts?: number;
  __ends?: number;

  // CSS property accessors - implemented through Proxy
  [key: string]:
    | string
    | undefined
    | number
    | ((name: string, value: string, priority: string) => void)
    | Map<string, { value: string; priority: string }>
    | CSSRule
    | null
    | boolean
    | ((...args: any[]) => any);

  /**
   * Create a new CSSStyleDeclaration instance with property access
   */
  constructor() {
    // Ensure properties are initialized
    this._properties = new Map();

    return new Proxy(this, {
      get: (target, prop) => {
        if (typeof prop === "string") {
          // Make sure critical properties are exposed
          if (prop === "cssText") {
            return target.cssText;
          }

          if (prop === "parentRule") {
            return target._parentRule;
          }

          if (prop === "length") {
            return target.length;
          }

          if (prop === "_properties") {
            return target._properties;
          }

          if (
            prop === "setProperty" ||
            prop === "getPropertyValue" ||
            prop === "getPropertyPriority" ||
            prop === "removeProperty" ||
            prop === "item" ||
            prop === "toString"
          ) {
            return target[prop];
          }

          // Convert camelCase to kebab-case for CSS property names
          const cssProperty = camelToKebabCase(prop);
          return target.getPropertyValue(cssProperty);
        }

        return target[prop as any];
      },

      set: (target, prop, value) => {
        if (target._readOnly) {
          return true; // Silently fail if readonly
        }

        if (typeof prop === "string") {
          if (prop === "cssText") {
            target.cssText = value;
            return true;
          }

          if (prop === "_ownerNode") {
            target._ownerNode = value;
            return true;
          }

          if (prop === "_parentRule") {
            target._parentRule = value;
            return true;
          }

          if (prop === "_readOnly") {
            target._readOnly = value;
            return true;
          }

          if (prop === "_computed") {
            target._computed = value;
            return true;
          }

          // Convert camelCase to kebab-case for CSS property names
          if (!/^_/.test(prop)) {
            // Skip properties starting with underscore
            const cssProperty = camelToKebabCase(prop);
            target.setProperty(cssProperty, value);
          } else {
            target[prop as any] = value;
          }
          return true;
        }

        target[prop as any] = value;
        return true;
      },
    });
  }

  /**
   * Set a CSS property with optional priority
   */
  setProperty(name: string, value: string, priority: string = ""): void {
    if (this._readOnly) {
      // In a real implementation, this would throw a NoModificationAllowedError
      return;
    }

    // Handle empty or null value as removal
    if (value === null || value === "") {
      this.removeProperty(name);
      return;
    }

    // Store the property
    this._properties.set(name, { value, priority });

    // Update the style attribute of the owner node
    this._updateStyleAttribute();
  }

  /**
   * Get a CSS property value
   */
  getPropertyValue(name: string): string {
    if (this._computed) {
      return ""; // Computed styles not implemented
    }

    // Convert to lowercase for non-custom properties
    if (!name.startsWith("--")) {
      name = name.toLowerCase();
    }

    return this._properties.get(name)?.value || "";
  }

  /**
   * Get a CSS property priority
   */
  getPropertyPriority(name: string): string {
    if (!name.startsWith("--")) {
      name = name.toLowerCase();
    }

    return this._properties.get(name)?.priority || "";
  }

  /**
   * Remove a property
   */
  removeProperty(name: string): string {
    if (this._readOnly) {
      // In a real implementation, this would throw a NoModificationAllowedError
      return "";
    }

    if (!name.startsWith("--")) {
      name = name.toLowerCase();
    }

    const value = this.getPropertyValue(name);
    this._properties.delete(name);

    // Update the style attribute of the owner node
    this._updateStyleAttribute();

    return value;
  }

  /**
   * Number of properties
   */
  get length(): number {
    return this._properties.size;
  }

  /**
   * Get property name at index
   */
  item(index: number): string {
    return Array.from(this._properties.keys())[index] || "";
  }

  /**
   * Set the cssText property directly
   */
  set cssText(value: string) {
    if (this._readOnly) {
      return;
    }

    // Clear existing properties
    this._properties.clear();

    if (!value) {
      this._updateStyleAttribute();
      return;
    }

    // Parse the CSS text and set properties
    const rules = value.split(";");
    for (const rule of rules) {
      const trimmedRule = rule.trim();
      if (!trimmedRule) continue;

      const colonIndex = trimmedRule.indexOf(":");
      if (colonIndex === -1) continue;

      const property = trimmedRule.substring(0, colonIndex).trim();
      let valueText = trimmedRule.substring(colonIndex + 1).trim();

      // Check for !important
      let priority = "";
      const importantIndex = valueText.toLowerCase().indexOf("!important");
      if (importantIndex !== -1) {
        priority = "important";
        valueText = valueText.substring(0, importantIndex).trim();
      }

      if (property && valueText) {
        this._properties.set(property.toLowerCase(), {
          value: valueText,
          priority,
        });
      }
    }

    // Update the style attribute
    this._updateStyleAttribute();
  }

  /**
   * Get the cssText value
   */
  get cssText(): string {
    if (this._computed) {
      return "";
    }

    return this.toString();
  }

  /**
   * Convert to string (CSS text format)
   */
  toString(): string {
    const parts: string[] = [];
    this._properties.forEach((propData, name) => {
      parts.push(
        `${name}: ${propData.value}${
          propData.priority ? " !" + propData.priority : ""
        }`
      );
    });
    return parts.join("; ");
  }

  /**
   * Update the style attribute of the owner node
   */
  _updateStyleAttribute(): void {
    if (this._computed || !this._ownerNode || this._updating) {
      return;
    }

    // Prevent update loops
    this._updating = true;

    // Update the style attribute with current CSS text
    if (this._ownerNode.setAttribute) {
      this._ownerNode.setAttribute("style", this.toString());
    }

    this._updating = false;
  }
}

/**
 * Convert camelCase to kebab-case (e.g., fontSize -> font-size)
 */
function camelToKebabCase(str: string): string {
  if (!str || typeof str !== "string") return "";

  // Handle vendor prefixes like webkit, moz, ms
  const vendorPrefixed = str.match(/^(webkit|moz|ms|o)([A-Z])(.*)/);
  if (vendorPrefixed) {
    return `-${vendorPrefixed[1]}-${vendorPrefixed[2].toLowerCase()}${
      vendorPrefixed[3]
    }`
      .replace(/([A-Z])/g, "-$1")
      .toLowerCase();
  }

  return str.replace(/([A-Z])/g, "-$1").toLowerCase();
}

/**
 * Convert kebab-case to camelCase (e.g., font-size -> fontSize)
 */
function _kebabToCamelCase(str: string): string {
  if (!str || typeof str !== "string") return "";
  return str.replace(/-([a-z])/g, (_, group) => group.toUpperCase());
}

/**
 * Base CSS rule class
 */
export class CSSRule {
  type: CSSRuleType;
  parentStyleSheet: CSSStyleSheet | null = null;
  parentRule: CSSRule | null = null;
  __starts?: number;
  __ends?: number;

  constructor(type: CSSRuleType) {
    this.type = type;
  }

  get cssText(): string {
    return "";
  }
}

/**
 * CSS style rule class (for regular style rules)
 */
export class CSSStyleRule extends CSSRule {
  selectorText: string = "";
  style: CSSStyleDeclaration = new CSSStyleDeclaration();

  constructor() {
    super(CSSRuleType.STYLE_RULE);
  }

  override get cssText(): string {
    return `${this.selectorText} { ${this.style.toString()} }`;
  }
}

/**
 * CSS import rule
 */
export class CSSImportRule extends CSSRule {
  href: string = "";
  media: MediaList = new MediaList();
  styleSheet: CSSStyleSheet = new CSSStyleSheet();
  _rawCssText: string = ""; // Store raw CSS text during parsing

  constructor() {
    super(CSSRuleType.IMPORT_RULE);
  }

  override get cssText(): string {
    return `@import ${this.href}${
      this.media.mediaText ? ` ${this.media.mediaText}` : ""
    };`;
  }
}

/**
 * CSS media rule
 */
export class CSSMediaRule extends CSSRule {
  media: MediaList = new MediaList();
  cssRules: CSSRule[] = [];

  constructor() {
    super(CSSRuleType.MEDIA_RULE);
  }

  override get cssText(): string {
    let result = `@media ${this.media.mediaText} {`;
    for (const rule of this.cssRules) {
      result += rule.cssText;
    }
    result += "}";
    return result;
  }
}

/**
 * CSS keyframes rule
 */
export class CSSKeyframesRule extends CSSRule {
  name: string = "";
  cssRules: CSSKeyframeRule[] = [];
  vendorPrefix?: string;

  constructor() {
    super(CSSRuleType.KEYFRAMES_RULE);
  }

  override get cssText(): string {
    let result = `@${this.vendorPrefix || ""}keyframes ${this.name} {`;
    for (const rule of this.cssRules) {
      result += rule.cssText;
    }
    result += "}";
    return result;
  }
}

/**
 * CSS keyframe rule
 */
export class CSSKeyframeRule extends CSSRule {
  keyText: string = "";
  style: CSSStyleDeclaration = new CSSStyleDeclaration();

  constructor() {
    super(CSSRuleType.KEYFRAME_RULE);
  }

  override get cssText(): string {
    return `${this.keyText} { ${this.style.toString()} }`;
  }
}

/**
 * CSS font face rule
 */
export class CSSFontFaceRule extends CSSRule {
  style: CSSStyleDeclaration = new CSSStyleDeclaration();

  constructor() {
    super(CSSRuleType.FONT_FACE_RULE);
  }

  override get cssText(): string {
    return `@font-face { ${this.style.toString()} }`;
  }
}

/**
 * CSS supports rule
 */
export class CSSSupportsRule extends CSSRule {
  conditionText: string = "";
  cssRules: CSSRule[] = [];

  constructor() {
    super(CSSRuleType.SUPPORTS_RULE);
  }

  override get cssText(): string {
    let result = `@supports ${this.conditionText} {`;
    for (const rule of this.cssRules) {
      result += rule.cssText;
    }
    result += "}";
    return result;
  }
}

/**
 * CSS document rule
 */
export class CSSDocumentRule extends CSSRule {
  matcher = { matcherText: "" };
  cssRules: CSSRule[] = [];

  constructor() {
    super(CSSRuleType.DOCUMENT_RULE);
  }

  override get cssText(): string {
    let result = `@-moz-document ${this.matcher.matcherText} {`;
    for (const rule of this.cssRules) {
      result += rule.cssText;
    }
    result += "}";
    return result;
  }
}

/**
 * CSS host rule
 */
export class CSSHostRule extends CSSRule {
  cssRules: CSSRule[] = [];

  constructor() {
    super(CSSRuleType.HOST_RULE);
  }

  override get cssText(): string {
    let result = "@host {";
    for (const rule of this.cssRules) {
      result += rule.cssText;
    }
    result += "}";
    return result;
  }
}

/**
 * Media list class for handling media queries
 */
export class MediaList {
  mediaText: string = "";
}

/**
 * CSS stylesheet class for storing all CSS rules
 */
export class CSSStyleSheet {
  cssRules: CSSRule[] = [];

  toString(): string {
    return this.cssRules.map((rule) => rule.cssText).join("\n");
  }
}

/**
 * CSS value expression class for handling IE CSS expressions
 */
export class CSSValueExpression {
  constructor(private token: string, private idx: number) {}

  parse(): { expression: string; idx: number; error?: string } {
    let expression = "";
    let braceDepth = 0;
    let i = this.idx;
    const start = this.idx;

    // Skip the opening paren
    i++;

    for (; i < this.token.length; i++) {
      const char = this.token.charAt(i);

      if (char === "(") {
        braceDepth++;
      } else if (char === ")") {
        if (braceDepth === 0) {
          expression = this.token.slice(start, i + 1);
          break;
        }
        braceDepth--;
      }
    }

    if (i >= this.token.length) {
      return {
        expression: "",
        idx: this.idx,
        error: "Unmatched parenthesis in expression",
      };
    }

    return {
      expression,
      idx: i,
    };
  }
}

/**
 * Parse CSS from a string into a CSSStyleSheet object
 *
 * @param token - CSS string to parse
 * @returns Parsed CSSStyleSheet
 */
export function parseStyleElement(token: string): CSSStyleSheet {
  return parseStyleElementImplementation(token);
}

/**
 * Complete implementation of CSS parser
 *
 * @param token - CSS string to parse
 * @returns Parsed CSSStyleSheet
 */
export function parseStyleElementImplementation(token: string): CSSStyleSheet {
  let i = 0;

  /**
   * Parser state machine states:
   * - "before-selector": before starting a selector
   * - "selector": parsing a selector
   * - "atRule": parsing an at-rule
   * - "atBlock": parsing an at-rule block
   * - "conditionBlock": parsing a condition block (like @supports)
   * - "before-name": before starting a property name
   * - "name": parsing a property name
   * - "before-value": before starting a property value
   * - "value": parsing a property value
   * - "value-parenthesis": parsing a value with parentheses
   */
  let state: string = "before-selector";

  let index: number;
  let buffer: string = "";
  let valueParenthesisDepth: number = 0;

  // States where whitespace is significant and should be preserved
  const SIGNIFICANT_WHITESPACE: Record<string, boolean> = {
    selector: true,
    value: true,
    "value-parenthesis": true,
    atRule: true,
    "importRule-begin": true,
    importRule: true,
    atBlock: true,
    conditionBlock: true,
    "documentRule-begin": true,
  };

  const styleSheet = new CSSStyleSheet();

  // Current scope for rule insertion
  let currentScope:
    | CSSStyleSheet
    | CSSMediaRule
    | CSSSupportsRule
    | CSSKeyframesRule
    | CSSDocumentRule
    | CSSHostRule = styleSheet;

  // Parent rule for nested rules
  let parentRule:
    | CSSMediaRule
    | CSSSupportsRule
    | CSSKeyframesRule
    | CSSDocumentRule
    | CSSHostRule
    | null = null;

  // Track ancestor rules for proper nesting
  const ancestorRules: Array<
    | CSSMediaRule
    | CSSSupportsRule
    | CSSKeyframesRule
    | CSSDocumentRule
    | CSSHostRule
  > = [];
  let hasAncestors = false;
  let prevScope;

  // Variables to track rules being constructed
  let name: string = "";
  let priority: string = "";
  let styleRule: CSSStyleRule | CSSKeyframeRule | CSSFontFaceRule =
    new CSSStyleRule();
  let mediaRule: CSSMediaRule = new CSSMediaRule();
  let supportsRule: CSSSupportsRule = new CSSSupportsRule();
  let importRule: CSSImportRule = new CSSImportRule();
  let fontFaceRule: CSSFontFaceRule = new CSSFontFaceRule();
  let keyframesRule: CSSKeyframesRule = new CSSKeyframesRule();
  let documentRule: CSSDocumentRule = new CSSDocumentRule();
  let hostRule: CSSHostRule = new CSSHostRule();

  // Regular expression for keyframes
  const atKeyframesRegExp = /@(-(?:\w+-)+)?keyframes/g;

  // Helper function for parsing errors
  const parseError = (message: string): never => {
    const lines = token.substring(0, i).split("\n");
    const lineCount = lines.length;
    const charCount = lines.pop()!.length + 1;
    const error = new Error(
      message + " (line " + lineCount + ", char " + charCount + ")"
    );
    (error as any).line = lineCount;
    (error as any).char = charCount;
    (error as any).styleSheet = styleSheet;
    throw error;
  };

  // Parse character by character
  for (let character; (character = token.charAt(i)); i++) {
    switch (character) {
      // Whitespace handling
      case " ":
      case "\t":
      case "\r":
      case "\n":
      case "\f":
        if (SIGNIFICANT_WHITESPACE[state]) {
          buffer += character;
        }
        break;

      // String with double quotes
      case '"':
        index = i + 1;
        do {
          index = token.indexOf('"', index) + 1;
          if (!index) {
            parseError('Unmatched "');
          }
        } while (token[index - 2] === "\\");
        buffer += token.slice(i, index);
        i = index - 1;
        switch (state) {
          case "before-value":
            state = "value";
            break;
          case "importRule-begin":
            state = "importRule";
            break;
        }
        break;

      // String with single quotes
      case "'":
        index = i + 1;
        do {
          index = token.indexOf("'", index) + 1;
          if (!index) {
            parseError("Unmatched '");
          }
        } while (token[index - 2] === "\\");
        buffer += token.slice(i, index);
        i = index - 1;
        switch (state) {
          case "before-value":
            state = "value";
            break;
          case "importRule-begin":
            state = "importRule";
            break;
        }
        break;

      // Comment handling
      case "/":
        if (token.charAt(i + 1) === "*") {
          i += 2;
          index = token.indexOf("*/", i);
          if (index === -1) {
            parseError("Missing */");
          } else {
            i = index + 1;
          }
        } else {
          buffer += character;
        }
        if (state === "importRule-begin") {
          buffer += " ";
          state = "importRule";
        }
        break;

      // At-rule handling
      case "@":
        if (token.indexOf("@-moz-document", i) === i) {
          state = "documentRule-begin";
          documentRule = new CSSDocumentRule();
          documentRule.__starts = i;
          i += "-moz-document".length;
          buffer = "";
          break;
        } else if (token.indexOf("@media", i) === i) {
          state = "atBlock";
          mediaRule = new CSSMediaRule();
          mediaRule.__starts = i;
          i += "media".length;
          buffer = "";
          break;
        } else if (token.indexOf("@supports", i) === i) {
          state = "conditionBlock";
          supportsRule = new CSSSupportsRule();
          supportsRule.__starts = i;
          i += "supports".length;
          buffer = "";
          break;
        } else if (token.indexOf("@host", i) === i) {
          state = "hostRule-begin";
          i += "host".length;
          hostRule = new CSSHostRule();
          hostRule.__starts = i;
          buffer = "";
          break;
        } else if (token.indexOf("@import", i) === i) {
          state = "importRule-begin";
          i += "import".length;
          buffer += "@import";
          break;
        } else if (token.indexOf("@font-face", i) === i) {
          state = "fontFaceRule-begin";
          i += "font-face".length;
          fontFaceRule = new CSSFontFaceRule();
          fontFaceRule.__starts = i;
          buffer = "";
          break;
        } else {
          atKeyframesRegExp.lastIndex = i;
          const matchKeyframes = atKeyframesRegExp.exec(token);
          if (matchKeyframes && matchKeyframes.index === i) {
            state = "keyframesRule-begin";
            keyframesRule = new CSSKeyframesRule();
            keyframesRule.__starts = i;
            keyframesRule.vendorPrefix = matchKeyframes[1]; // Will come out as undefined if no prefix was found
            i += matchKeyframes[0].length - 1;
            buffer = "";
            break;
          } else if (state === "selector") {
            state = "atRule";
          }
        }
        buffer += character;
        break;

      // Opening brace - start of a rule block
      case "{":
        if (state === "selector" || state === "atRule") {
          if (styleRule instanceof CSSStyleRule) {
            styleRule.selectorText = buffer.trim();
            styleRule.style.__starts = i;
          }
          buffer = "";
          state = "before-name";
        } else if (state === "atBlock") {
          mediaRule.media.mediaText = buffer.trim();

          if (parentRule) {
            ancestorRules.push(parentRule);
          }

          currentScope = parentRule = mediaRule;
          mediaRule.parentStyleSheet = styleSheet;
          buffer = "";
          state = "before-selector";
        } else if (state === "conditionBlock") {
          supportsRule.conditionText = buffer.trim();

          if (parentRule) {
            ancestorRules.push(parentRule);
          }

          currentScope = parentRule = supportsRule;
          supportsRule.parentStyleSheet = styleSheet;
          buffer = "";
          state = "before-selector";
        } else if (state === "hostRule-begin") {
          if (parentRule) {
            ancestorRules.push(parentRule);
          }

          currentScope = parentRule = hostRule;
          hostRule.parentStyleSheet = styleSheet;
          buffer = "";
          state = "before-selector";
        } else if (state === "fontFaceRule-begin") {
          if (parentRule) {
            fontFaceRule.parentRule = parentRule;
          }
          fontFaceRule.parentStyleSheet = styleSheet;
          styleRule = fontFaceRule;
          buffer = "";
          state = "before-name";
        } else if (state === "keyframesRule-begin") {
          keyframesRule.name = buffer.trim();
          if (parentRule) {
            ancestorRules.push(parentRule);
            keyframesRule.parentRule = parentRule;
          }
          keyframesRule.parentStyleSheet = styleSheet;
          currentScope = parentRule = keyframesRule;
          buffer = "";
          state = "keyframeRule-begin";
        } else if (state === "keyframeRule-begin") {
          styleRule = new CSSKeyframeRule();
          (styleRule as CSSKeyframeRule).keyText = buffer.trim();
          styleRule.__starts = i;
          buffer = "";
          state = "before-name";
        } else if (state === "documentRule-begin") {
          // FIXME: what if this '{' is in the url text of the match function?
          documentRule.matcher.matcherText = buffer.trim();
          if (parentRule) {
            ancestorRules.push(parentRule);
            documentRule.parentRule = parentRule;
          }
          currentScope = parentRule = documentRule;
          documentRule.parentStyleSheet = styleSheet;
          buffer = "";
          state = "before-selector";
        }
        break;

      // Property name/value separator
      case ":":
        if (state === "name") {
          name = buffer.trim();
          buffer = "";
          state = "before-value";
        } else {
          buffer += character;
        }
        break;

      // Open parenthesis in values
      case "(":
        if (state === "value") {
          // IE CSS expression mode
          if (buffer.trim() === "expression") {
            const info = new CSSValueExpression(token, i).parse();

            if (info.error) {
              parseError(info.error);
            } else {
              buffer += info.expression;
              i = info.idx;
            }
          } else {
            state = "value-parenthesis";
            // Always ensure this is reset to 1 on transition
            // from value to value-parenthesis
            valueParenthesisDepth = 1;
            buffer += character;
          }
        } else if (state === "value-parenthesis") {
          valueParenthesisDepth++;
          buffer += character;
        } else {
          buffer += character;
        }
        break;

      // Close parenthesis in values
      case ")":
        if (state === "value-parenthesis") {
          valueParenthesisDepth--;
          if (valueParenthesisDepth === 0) state = "value";
        }
        buffer += character;
        break;

      // Important declaration
      case "!":
        if (state === "value" && token.indexOf("!important", i) === i) {
          priority = "important";
          i += "important".length;
        } else {
          buffer += character;
        }
        break;

      // End of declaration or at-rule
      case ";":
        switch (state) {
          case "value": {
            styleRule.style.setProperty(name, buffer.trim(), priority);
            priority = "";
            buffer = "";
            state = "before-name";
            break;
          }
          case "atRule":
            buffer = "";
            state = "before-selector";
            break;
          case "importRule": {
            importRule = new CSSImportRule();
            importRule.parentStyleSheet = styleSheet;
            if (importRule.styleSheet) {
              (importRule.styleSheet as any).parentStyleSheet = styleSheet;
            }

            importRule._rawCssText = buffer + character;

            // Extract href and media parts
            const importParts = buffer.replace(/^@import\s+/, "").trim();
            // Extract the URL (can be wrapped in quotes or url())
            const urlMatch = importParts.match(
              /(?:"([^"]+)"|'([^']+)'|url\((?:"([^"]+)"|'([^']+)'|([^)]+))\))(.*)$/
            );

            if (urlMatch) {
              // Get the first non-undefined capture group which contains the URL
              importRule.href =
                urlMatch[1] ||
                urlMatch[2] ||
                urlMatch[3] ||
                urlMatch[4] ||
                urlMatch[5] ||
                "";

              // Get any media query that follows
              const mediaQuery = urlMatch[6]?.trim();
              if (mediaQuery) {
                importRule.media.mediaText = mediaQuery;
              }
            }

            styleSheet.cssRules.push(importRule);
            buffer = "";
            state = "before-selector";
            break;
          }
          default:
            buffer += character;
            break;
        }
        break;

      // Closing brace - end of a rule block
      case "}":
        switch (state) {
          case "value": {
            styleRule.style.setProperty(name, buffer.trim(), priority);
            priority = "";
            buffer = "";
            state = "before-name";
            break;
          }
          case "before-name":
          case "name": {
            styleRule.__ends = i + 1;
            if (parentRule) {
              styleRule.parentRule = parentRule;
            }
            styleRule.parentStyleSheet = styleSheet;

            // Add rule to the appropriate collection based on its type
            if (
              currentScope === keyframesRule &&
              styleRule instanceof CSSKeyframeRule
            ) {
              keyframesRule.cssRules.push(styleRule);
            } else {
              (currentScope as any).cssRules.push(styleRule);
            }

            buffer = "";
            if (currentScope instanceof CSSKeyframesRule) {
              state = "keyframeRule-begin";
            } else {
              state = "before-selector";
            }
            break;
          }
          case "keyframeRule-begin":
          case "before-selector":
          case "selector": {
            // End of media/supports/document rule.
            if (!parentRule) {
              parseError("Unexpected }");
            }

            // Handle rules nested in @media or @supports
            hasAncestors = ancestorRules.length > 0;

            while (ancestorRules.length > 0) {
              parentRule = ancestorRules.pop()!;

              if (
                parentRule instanceof CSSMediaRule ||
                parentRule instanceof CSSSupportsRule
              ) {
                prevScope = currentScope;
                currentScope = parentRule;

                // Add the current scope's rules to parent
                if (
                  prevScope instanceof CSSMediaRule ||
                  prevScope instanceof CSSSupportsRule ||
                  prevScope instanceof CSSDocumentRule ||
                  prevScope instanceof CSSHostRule ||
                  prevScope instanceof CSSKeyframesRule
                ) {
                  currentScope.cssRules.push(prevScope);
                }
                break;
              }

              if (ancestorRules.length === 0) {
                hasAncestors = false;
              }
            }

            if (!hasAncestors) {
              if (currentScope !== styleSheet) {
                (currentScope as any).__ends = i + 1;
                styleSheet.cssRules.push(currentScope as CSSRule);
                currentScope = styleSheet;
                parentRule = null;
              }
            }

            buffer = "";
            state = "before-selector";
            break;
          }
        }
        break;

      // Handle all other characters
      default:
        switch (state) {
          case "before-selector": {
            state = "selector";
            styleRule = new CSSStyleRule();
            styleRule.__starts = i;
            break;
          }
          case "before-name": {
            state = "name";
            break;
          }
          case "before-value": {
            state = "value";
            break;
          }
          case "importRule-begin": {
            state = "importRule";
            break;
          }
        }
        buffer += character;
        break;
    }
  }

  return styleSheet;
}
