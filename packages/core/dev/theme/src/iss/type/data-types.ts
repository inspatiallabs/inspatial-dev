//TODO(@benemma): Implement data types

import type * as DOMStyle from "./index.ts";

// For DOM/Web Only style Surfacing.
export interface DOMStyleProperties
  extends DOMStyle.Properties<string | number>,
    DOMStyle.PropertiesHyphen<string | number> {
  [dom: `--${string}`]: string | number | undefined;
}
