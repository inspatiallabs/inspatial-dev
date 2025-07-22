/*##############################################(HELPER FUNCTIONS)##############################################*/

// Add proper types for the map objects to avoid index errors
export const sizeClassMap: Record<string, string> = {
  h1: "text-4xl lg:text-5xl xl:text-6xl",
  h2: "text-3xl lg:text-4xl xl:text-5xl",
  h3: "text-2xl lg:text-3xl xl:text-4xl",
  h4: "text-xl lg:text-2xl xl:text-3xl",
  h5: "text-lg lg:text-xl xl:text-2xl",
  h6: "text-base lg:text-lg xl:text-xl",
  base: "text-base",
  xs: "text-xs",
  sm: "text-sm",
  md: "text-md",
  lg: "text-lg",
  xl: "text-xl",
};

// Helper to generate typography weight classes
export const weightClassMap: Record<string, string> = {
  thin: "font-thin",
  light: "font-light",
  regular: "font-normal",
  medium: "font-medium",
  bold: "font-bold",
  black: "font-black",
};

// Helper to generate typography transform classes
export const transformClassMap: Record<string, string> = {
  none: "",
  uppercase: "uppercase",
  lowercase: "lowercase",
  capitalize: "capitalize",
  "full-width": "", // Needs custom CSS
};

// Helper for letter spacing
export const letterSpacingMap: Record<string, string> = {
  xs: "-tracking-tighter", // -0.05em
  sm: "-tracking-tight", // -0.03em
  base: "tracking-normal", // 0em
  md: "tracking-wide", // 0.03em
  lg: "tracking-wider", // 0.05em
  xl: "tracking-widest", // 0.1em
};
