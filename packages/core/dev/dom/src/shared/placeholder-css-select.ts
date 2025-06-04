/**
 * This is a placeholder for the css-select module.
 * The actual implementation should be installed as a dependency.
 */

export type Options = {
  xmlMode?: boolean;
  context?: any;
  adapter?: any;
  strict?: boolean;
};

export function compile(_selector: string, _options?: Options): (elem: any) => boolean {
  return () => false;
}

export function is(_element: any, _selector: string, _options?: Options): boolean {
  return false;
} 