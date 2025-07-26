import { nextTick, bind } from "../signal.ts";

/*#################################(Types)#################################*/

/** Mapping of keys to arrays of values */
type KeyValsMap = Record<string, string[]>;

/** Directive handler function type */
export type DirectiveHandler = (node: Element, value: any) => void;

/** Directive factory function type */
export type DirectiveFactory = (key: string) => DirectiveHandler;

/** Namespace to tags mapping */
interface NamespaceToTagsMap {
  [namespace: string]: string[];
}

/** Directives configuration */
interface DirectivesType {
  style: DirectiveFactory;
  class: DirectiveFactory;
  // className: DirectiveFactory;
}

/** Configuration object for DOM renderer with directives */
interface WithDirectivesType {
  doc: Document;
  namespaces: Record<string, string>;
  tagNamespaceMap: Record<string, string>;
  tagAliases: Record<string, string>;
  propAliases: Record<string, string>;
  onDirective: (
    prefix: string,
    key: string,
    prop?: string
  ) => DirectiveHandler | undefined;
}

/*#################################(Utilities)#################################*/

function reverseMap(keyValsMap: KeyValsMap): Record<string, string> {
  const reversed: Record<string, string> = {};
  for (let [key, vals] of Object.entries(keyValsMap)) {
    for (let val of vals) {
      reversed[val] = key;
    }
  }
  return reversed;
}

function prefix(prefixStr: string, keyArr: string[]): Record<string, string> {
  return Object.fromEntries(
    keyArr.map(function (i: string): [string, string] {
      return [i, `${prefixStr}${i}`];
    })
  );
}

/*#################################(Constants)#################################*/

const namespaces: Record<string, string> = {
  xml: "http://www.w3.org/XML/1998/namespace",
  html: "http://www.w3.org/1999/xhtml",
  svg: "http://www.w3.org/2000/svg",
  math: "http://www.w3.org/1998/Math/MathML",
  xlink: "http://www.w3.org/1999/xlink",
};

export const tagAliases: Record<string, string> = {};

const attributes: string[] = [
  "class",
  "style",
  "viewBox",
  "d",
  "tabindex",
  "role",
  "for",
];

const namespaceToTagsMap: NamespaceToTagsMap = {
  svg: [
    "animate",
    "animateMotion",
    "animateTransform",
    "circle",
    "clipPath",
    "defs",
    "desc",
    "discard",
    "ellipse",
    "feBlend",
    "feColorMatrix",
    "feComponentTransfer",
    "feComposite",
    "feConvolveMatrix",
    "feDiffuseLighting",
    "feDisplacementMap",
    "feDistantLight",
    "feDropShadow",
    "feFlood",
    "feFuncA",
    "feFuncB",
    "feFuncG",
    "feFuncR",
    "feGaussianBlur",
    "feImage",
    "feMerge",
    "feMergeNode",
    "feMorphology",
    "feOffset",
    "fePointLight",
    "feSpecularLighting",
    "feSpotLight",
    "feTile",
    "feTurbulence",
    "filter",
    "foreignObject",
    "g",
    "line",
    "linearGradient",
    "marker",
    "mask",
    "metadata",
    "mpath",
    "path",
    "pattern",
    "polygon",
    "polyline",
    "radialGradient",
    "rect",
    "set",
    "stop",
    "svg",
    "switch",
    "symbol",
    "text",
    "textPath",
    "title",
    "tspan",
    "unknown",
    "use",
    "view",
  ],
};

export const tagNamespaceMap: Record<string, string> =
  reverseMap(namespaceToTagsMap);
export const propAliases: Record<string, string> = prefix("attr:", attributes);

/*#################################(Directives)#################################*/

export const directives: DirectivesType = {
  /********************************* (Style) *********************************/
  style(key: string): DirectiveHandler {
    return function (node: Element, val: any): void {
      if (val === undefined || val === null) return;

      const styleObj = (node as HTMLElement).style;

      function handler(newVal: any): void {
        nextTick(function (): void {
          if (newVal === undefined || newVal === null || newVal === false) {
            styleObj.setProperty(key, "unset");
          } else {
            styleObj.setProperty(key, String(newVal));
          }
        });
      }

      bind(handler, val);
    };
  },
  /********************************* (Class) *********************************/
  class(key: string): DirectiveHandler {
    return function (node: Element, val: any): void {
      if (val === undefined || val === null) return;

      const classList = node.classList;

      function handler(newVal: any): void {
        nextTick(function (): void {
          if (newVal) {
            classList.add(key);
          } else {
            classList.remove(key);
          }
        });
      }

      bind(handler, val);
    };
  },
  /********************************* (ClassName) *********************************/
  // className(key: string): DirectiveHandler {
  //   return function (node: Element, val: any): void {
  //     if (val === undefined || val === null) return;

  //     const htmlElement = node as HTMLElement;

  //     function handler(newVal: any): void {
  //       nextTick(function (): void {
  //         if (newVal === undefined || newVal === null || newVal === false) {
  //           htmlElement.className = "";
  //         } else if (typeof newVal === "string") {
  //           htmlElement.className = newVal;
  //         } else if (Array.isArray(newVal)) {
  //           htmlElement.className = newVal.filter(Boolean).join(" ");
  //         } else if (typeof newVal === "object") {
  //           // Handle object format: { 'class1': true, 'class2': false }
  //           const classes = Object.entries(newVal)
  //             .filter(([_, active]) => Boolean(active))
  //             .map(([className, _]) => className);
  //           htmlElement.className = classes.join(" ");
  //         } else {
  //           htmlElement.className = String(newVal);
  //         }
  //       });
  //     }

  //     bind(handler, val);
  //   };
  // },
};


function onDirective(
  prefix: string,
  key: string
): DirectiveHandler | undefined {
  const handler = directives[prefix as keyof DirectivesType];
  if (handler) return handler(key);
  return undefined;
}

/*#################################(With Directives)#################################*/

export const withDirectives: WithDirectivesType = {
  doc: document,
  namespaces,
  tagNamespaceMap,
  tagAliases,
  propAliases,
  onDirective,
};
