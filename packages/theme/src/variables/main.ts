import { ThemeProps } from "./types.ts";
import generateThemeMode from "../helpers.ts";

/*#######################################(Theme Variables)###########################################*/
/*
 * Theme Variables are reusable style settings (like colors, fonts, spacing etc...) that help keep your
 * app's look consistent. Instead of setting these styles over and over, you can just reference these
 * pre-defined variables wherever needed. InSpatial Theme Variables are aliases for design systems or design tokens.
 *
 * @type {ThemeProps[]}
 *
 * Properties:
 * -----------
 * @property {('flat'|'neutral'|'brutal'|'soft')} variant - The theme variant
 * @property {('auto'|'light'|'dark')} mode - The color mode
 * @property {string} cursor - The cursor style
 * @property {('xs'|'sm'|'md'|'lg'|'xl'|'2xl'|'3xl'|'4xl')} radius - Border radius size
 *
 * Typography:
 * ----------
 * @property {Object} typography - Typography configuration
 * @property {('text'|'quote'|'code')} typography.variant - Text style variant
 * @property {Object} typography.font - Font family settings
 * @property {string} typography.font.heading - Heading font family
 * @property {string} typography.font.body - Body font family
 * @property {string} typography.size - Font size
 * @property {string} typography.lineHeight - Line height
 * @property {string} typography.weight - Font weight
 * @property {string} typography.letterSpacing - Letter spacing
 * @property {string} typography.transform - Text transform
 *
 * Colors:
 * -------
 * @property {Object} format - Color format configuration
 * @property {string} format.name - Theme name
 * @property {Object} format.light - Light mode colors
 * @property {string} format.light.brand - Primary brand color
 * @property {string} format.light.background - Background color
 * @property {string} format.light.surface - Surface color
 * @property {string} format.light.primary - Primary text color
 * @property {string} format.light.secondary - Secondary text color
 * @property {string} format.light.muted - Muted text color
 * @property {Object} format.dark - Dark mode colors (same structure as light)
 * @property {string} format.light.window - Window color
 * @property {string} format.dark.window - Window color
 *
 * @example
 * const theme = ThemeVariable[0]; // Default theme
 * const isDark = theme.mode === 'dark';
 * const primaryColor = isDark ? theme.format.dark.primary : theme.format.light.primary;
 */
export const ThemeVariable: ThemeProps[] = [
  /*************(Default Theme)***************/
  /*                                         */
  /* important for your app theme            */
  /*                                         */
  /* --------------------------------------- */

  {
    variant: "flat",
    mode: "auto",
    cursor: "auto",
    radius: "lg",
    typography: {
      variant: "text",
      size: "base",
      // lineHeight: "",
      weight: "regular",
      letterSpacing: "base",
      transform: "none",
    },
    format: {
      name: "default",
      light: {
        brand: "hsl(var(--brand))",
        background: "hsl(var(--background))",
        surface: "hsl(var(--surface))",
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        muted: "hsl(var(--muted))",
        window: "hsl(var(--window))",
      },
      dark: {
        brand: "hsl(var(--brand-dark))",
        background: "hsl(var(--background-dark))",
        surface: "hsl(var(--surface-dark))",
        primary: "hsl(var(--primary-dark))",
        secondary: "hsl(var(--secondary-dark))",
        muted: "hsl(var(--muted-dark))",
        window: "hsl(var(--window-dark))",
      },
    },
  },

  /***************(Generated Theme)***************/
  /*                                            */
  /* From Here Down You Can Add More Themes     */
  /* created from a single colors               */
  /*                                            */
  /* -------------------------------------------*/

  {
    variant: "flat",
    mode: "auto",
    cursor: "auto",
    radius: "xl",
    typography: {
      variant: "text",
      font: {
        heading: "actual",
        body: "polly",
      },
      size: "base",
      // lineHeight: "2px",
      weight: "medium",
      letterSpacing: "base",
      transform: "none",
    },
    format: {
      name: "ocean",
      ...generateThemeMode("hsl(200, 100%, 50%)"),
    },
  },

  {
    variant: "flat",
    mode: "auto",
    cursor: "auto",
    radius: "sm",
    typography: {
      variant: "text",
      font: {
        heading: "amithen",
        body: "inder",
      },
      size: "lg",
      // lineHeight: "28px",
      weight: "bold",
      letterSpacing: "base",
      transform: "capitalize",
    },
    format: {
      name: "forest",
      ...generateThemeMode("hsl(140, 70%, 30%)"),
    },
  },
  {
    variant: "neutral",
    mode: "auto",
    cursor: "auto",
    radius: "md",
    typography: {
      variant: "text",
      font: {
        heading: "lovelo",
        body: "denson",
      },
      size: "xl",
      // lineHeight: "36px",
      weight: "medium",
      letterSpacing: "base",
      transform: "uppercase",
    },
    format: {
      name: "sunset",
      ...generateThemeMode("hsl(15, 100%, 50%)"),
    },
  },
  {
    variant: "brutal",
    mode: "auto",
    cursor: "auto",
    radius: "lg",
    typography: {
      variant: "text",
      font: {
        heading: "alternox",
        body: "trebuchet",
      },
      size: "h3",
      // lineHeight: "44px",
      weight: "light",
      letterSpacing: "base",
      transform: "lowercase",
    },
    format: {
      name: "lavender",
      ...generateThemeMode("hsl(290, 70%, 40%)"),
    },
  },
  {
    variant: "flat",
    mode: "auto",
    cursor: "auto",
    radius: "2xl",
    typography: {
      variant: "text",
      font: {
        heading: "jls",
        body: "actual",
      },
      size: "h2",
      // lineHeight: "52px",
      weight: "black",
      letterSpacing: "base",
      transform: "full-width",
    },
    format: {
      name: "blossom",
      ...generateThemeMode("hsl(330, 100%, 45%)"),
    },
  },
  {
    variant: "neutral",
    mode: "auto",
    cursor: "auto",
    radius: "xs",
    typography: {
      variant: "text",
      font: {
        heading: "poppins",
        body: "fonzy",
      },
      size: "h1",
      // lineHeight: "64px",
      weight: "black",
      letterSpacing: "base",
      transform: "none",
    },
    format: {
      name: "midnight",
      ...generateThemeMode("hsl(200, 100%, 50%)"),
    },
  },
  {
    variant: "brutal",
    mode: "auto",
    cursor: "auto",
    radius: "xl",
    typography: {
      variant: "text",
      font: {
        heading: "foregen",
        body: "polly",
      },
      size: "sm",
      // lineHeight: "20px",
      weight: "thin",
      letterSpacing: "base",
      transform: "uppercase",
    },
    format: {
      name: "autumn",
      ...generateThemeMode("hsl(20, 90%, 40%)"),
    },
  },
  {
    variant: "flat",
    mode: "auto",
    cursor: "auto",
    radius: "md",
    typography: {
      variant: "text",
      font: {
        heading: "goodly",
        body: "dumeh",
      },
      size: "xs",
      // lineHeight: "16px",
      weight: "regular",
      letterSpacing: "base",
      transform: "capitalize",
    },
    format: {
      name: "polar",
      ...generateThemeMode("hsl(190, 90%, 40%)"),
    },
  },
  {
    variant: "neutral",
    mode: "auto",
    cursor: "auto",
    radius: "lg",
    typography: {
      variant: "text",
      font: {
        heading: "oklean",
        body: "parizaad",
      },
      size: "h4",
      // lineHeight: "40px",
      weight: "medium",
      letterSpacing: "base",
      transform: "lowercase",
    },
    format: {
      name: "mocha",
      ...generateThemeMode("hsl(15, 80%, 30%)"),
    },
  },
  {
    variant: "brutal",
    mode: "auto",
    cursor: "auto",
    radius: "sm",
    typography: {
      variant: "text",
      font: {
        heading: "polaris",
        body: "qualux",
      },
      size: "h5",
      // lineHeight: "32px",
      weight: "light",
      letterSpacing: "base",
      transform: "full-width",
    },
    format: {
      name: "neon",
      ...generateThemeMode("hsl(0, 100%, 50%)"),
    },
  },
  {
    variant: "flat",
    mode: "auto",
    cursor: "auto",
    radius: "base",
    typography: {
      variant: "text",
      font: {
        heading: "adventpro",
        body: "quora",
      },
      size: "h6",
      // lineHeight: "24px",
      weight: "bold",
      letterSpacing: "base",
      transform: "none",
    },
    format: {
      name: "pastel",
      ...generateThemeMode("hsl(340, 80%, 75%)"),
    },
  },
  {
    variant: "neutral",
    mode: "auto",
    cursor: "auto",
    radius: "4xl",
    typography: {
      variant: "text",
      font: {
        heading: "folker",
        body: "inder",
      },
      size: "md",
      // lineHeight: "48px",
      weight: "medium",
      letterSpacing: "base",
      transform: "uppercase",
    },
    format: {
      name: "monochrome",
      ...generateThemeMode("hsl(0, 0%, 0%)"),
    },
  },
  {
    variant: "brutal",
    mode: "auto",
    cursor: "auto",
    radius: "xl",
    typography: {
      variant: "text",
      font: {
        heading: "amithen",
        body: "lovelo",
      },
      size: "base",
      // lineHeight: "2px",
      weight: "light",
      letterSpacing: "base",
      transform: "capitalize",
    },
    format: {
      name: "metropolis",
      ...generateThemeMode("hsl(210, 100%, 50%)"),
    },
  },
  {
    variant: "flat",
    mode: "auto",
    cursor: "auto",
    radius: "md",
    typography: {
      variant: "text",
      font: {
        heading: "alternox",
        body: "denson",
      },
      size: "lg",
      // lineHeight: "56px",
      weight: "black",
      letterSpacing: "base",
      transform: "lowercase",
    },
    format: {
      name: "earth",
      ...generateThemeMode("hsl(0, 60%, 40%)"),
    },
  },
  {
    variant: "neutral",
    mode: "auto",
    cursor: "auto",
    radius: "sm",
    typography: {
      variant: "text",
      font: {
        heading: "jls",
        body: "poppins",
      },
      size: "xl",
      // lineHeight: "60px",
      weight: "thin",
      letterSpacing: "base",
      transform: "full-width",
    },
    format: {
      name: "retro",
      ...generateThemeMode("hsl(200, 100%, 40%)"),
    },
  },
  {
    variant: "brutal",
    mode: "auto",
    cursor: "auto",
    radius: "lg",
    typography: {
      variant: "text",
      font: {
        heading: "actual",
        body: "foregen",
      },
      size: "h3",
      // lineHeight: "68px",
      weight: "black",
      letterSpacing: "base",
      transform: "none",
    },
    format: {
      name: "noire",
      ...generateThemeMode("hsl(0, 100%, 50%)"),
    },
  },
  {
    variant: "flat",
    mode: "auto",
    cursor: "auto",
    radius: "base",
    typography: {
      variant: "text",
      font: {
        heading: "fonzy",
        body: "goodly",
      },
      size: "h2",
      // lineHeight: "72px",
      weight: "regular",
      letterSpacing: "base",
      transform: "uppercase",
    },
    format: {
      name: "tropical",
      ...generateThemeMode("hsl(270, 100%, 50%)"),
    },
  },
  {
    variant: "neutral",
    mode: "auto",
    cursor: "auto",
    radius: "3xl",
    typography: {
      variant: "text",
      font: {
        heading: "polly",
        body: "oklean",
      },
      size: "h1",
      // lineHeight: "80px",
      weight: "medium",
      letterSpacing: "base",
      transform: "capitalize",
    },
    format: {
      name: "nordic",
      ...generateThemeMode("hsl(350, 80%, 50%)"),
    },
  },
  {
    variant: "soft",
    mode: "auto",
    cursor: "auto",
    radius: "xl",
    typography: {
      variant: "text",
      font: {
        heading: "parizaad",
        body: "polaris",
      },
      size: "sm",
      // lineHeight: "118px",
      weight: "bold",
      letterSpacing: "base",
      transform: "lowercase",
    },
    format: {
      name: "steampunk",
      ...generateThemeMode("hsl(15, 90%, 30%)"),
    },
  },

  /****************(Curated Theme)****************/
  /*                                            */
  /* From Here Down are themes curated from     */
  /* by hand                                    */
  /*                                            */
  /* -------------------------------------------*/

  {
    variant: "flat",
    mode: "auto",
    cursor: "auto",
    radius: "md",
    typography: {
      variant: "text",
      font: {
        heading: "qualux",
        body: "aleo",
      },
      size: "base",
      // lineHeight: "2px",
      weight: "medium",
      letterSpacing: "base",
      transform: "full-width",
    },
    format: {
      name: "breeze",
      light: {
        brand: "hsl(210, 100%, 50%)",
        background: "hsl(195, 100%, 95%)",
        surface: "hsl(200, 60%, 98%)",
        primary: "hsl(200, 80%, 40%)",
        secondary: "hsl(180, 60%, 50%)",
        muted: "hsl(200, 20%, 80%)",
      },
      dark: {
        brand: "hsl(210, 100%, 60%)",
        background: "hsl(200, 30%, 10%)",
        surface: "hsl(200, 25%, 15%)",
        primary: "hsl(200, 80%, 60%)",
        secondary: "hsl(180, 60%, 40%)",
        muted: "hsl(200, 20%, 30%)",
      },
    },
  },
  {
    variant: "neutral",
    mode: "auto",
    cursor: "auto",
    radius: "lg",
    typography: {
      variant: "text",
      font: {
        heading: "quora",
        body: "folker",
      },
      size: "lg",
      // lineHeight: "28px",
      weight: "black",
      letterSpacing: "base",
      transform: "none",
    },
    format: {
      name: "emerald",
      light: {
        brand: "hsl(140, 70%, 30%)",
        background: "hsl(100, 50%, 95%)",
        surface: "hsl(110, 40%, 98%)",
        primary: "hsl(130, 60%, 30%)",
        secondary: "hsl(90, 50%, 45%)",
        muted: "hsl(120, 15%, 80%)",
      },
      dark: {
        brand: "hsl(140, 70%, 40%)",
        background: "hsl(120, 20%, 10%)",
        surface: "hsl(120, 15%, 15%)",
        primary: "hsl(130, 60%, 50%)",
        secondary: "hsl(90, 50%, 35%)",
        muted: "hsl(120, 15%, 30%)",
      },
    },
  },
  {
    variant: "brutal",
    mode: "auto",
    cursor: "auto",
    radius: "sm",
    typography: {
      variant: "text",
      font: {
        heading: "inder",
        body: "amithen",
      },
      size: "xl",
      // lineHeight: "36px",
      weight: "thin",
      letterSpacing: "base",
      transform: "uppercase",
    },
    format: {
      name: "dusk",
      light: {
        brand: "hsl(15, 100%, 50%)",
        background: "hsl(40, 100%, 95%)",
        surface: "hsl(35, 80%, 98%)",
        primary: "hsl(20, 80%, 50%)",
        secondary: "hsl(45, 90%, 60%)",
        muted: "hsl(30, 20%, 80%)",
      },
      dark: {
        brand: "hsl(15, 100%, 60%)",
        background: "hsl(20, 30%, 10%)",
        surface: "hsl(25, 25%, 15%)",
        primary: "hsl(20, 80%, 60%)",
        secondary: "hsl(45, 90%, 50%)",
        muted: "hsl(30, 20%, 30%)",
      },
    },
  },

  {
    variant: "soft",
    mode: "auto",
    cursor: "auto",
    radius: "base",
    typography: {
      variant: "text",
      font: {
        heading: "lovelo",
        body: "alternox",
      },
      size: "h3",
      // lineHeight: "44px",
      weight: "light",
      letterSpacing: "base",
      transform: "capitalize",
    },
    format: {
      name: "amethyst",
      light: {
        brand: "hsl(290, 70%, 40%)",
        background: "hsl(260, 40%, 95%)",
        surface: "hsl(265, 30%, 98%)",
        primary: "hsl(280, 60%, 50%)",
        secondary: "hsl(250, 50%, 60%)",
        muted: "hsl(270, 15%, 80%)",
      },
      dark: {
        brand: "hsl(290, 70%, 50%)",
        background: "hsl(260, 20%, 10%)",
        surface: "hsl(265, 15%, 15%)",
        primary: "hsl(280, 60%, 60%)",
        secondary: "hsl(250, 50%, 50%)",
        muted: "hsl(270, 15%, 30%)",
      },
    },
  },
  {
    variant: "neutral",
    mode: "auto",
    cursor: "auto",
    radius: "base",
    typography: {
      variant: "text",
      font: {
        heading: "denson",
        body: "jls",
      },
      size: "h2",
      // lineHeight: "52px",
      weight: "bold",
      letterSpacing: "base",
      transform: "lowercase",
    },
    format: {
      name: "cherry",
      light: {
        brand: "hsl(330, 100%, 45%)",
        background: "hsl(10, 100%, 97%)",
        surface: "hsl(355, 60%, 98%)",
        primary: "hsl(340, 70%, 50%)",
        secondary: "hsl(0, 60%, 70%)",
        muted: "hsl(350, 20%, 80%)",
      },
      dark: {
        brand: "hsl(330, 100%, 55%)",
        background: "hsl(350, 30%, 10%)",
        surface: "hsl(355, 25%, 15%)",
        primary: "hsl(340, 70%, 60%)",
        secondary: "hsl(0, 60%, 60%)",
        muted: "hsl(350, 20%, 30%)",
      },
    },
  },
  {
    variant: "brutal",
    mode: "auto",
    cursor: "auto",
    radius: "xl",
    typography: {
      variant: "text",
      font: {
        heading: "trebuchet",
        body: "actual",
      },
      size: "h1",
      // lineHeight: "64px",
      weight: "medium",
      letterSpacing: "base",
      transform: "full-width",
    },
    format: {
      name: "rustic",
      light: {
        brand: "hsl(20, 90%, 40%)",
        background: "hsl(40, 30%, 95%)",
        surface: "hsl(35, 25%, 98%)",
        primary: "hsl(15, 80%, 40%)",
        secondary: "hsl(45, 70%, 50%)",
        muted: "hsl(25, 20%, 80%)",
      },
      dark: {
        brand: "hsl(20, 90%, 50%)",
        background: "hsl(25, 30%, 10%)",
        surface: "hsl(30, 25%, 15%)",
        primary: "hsl(15, 80%, 50%)",
        secondary: "hsl(45, 70%, 40%)",
        muted: "hsl(25, 20%, 30%)",
      },
    },
  },
  {
    variant: "flat",
    mode: "auto",
    cursor: "auto",
    radius: "md",
    typography: {
      variant: "text",
      font: {
        heading: "poppins",
        body: "foregen",
      },
      size: "sm",
      // lineHeight: "20px",
      weight: "regular",
      letterSpacing: "base",
      transform: "none",
    },
    format: {
      name: "arctic",
      light: {
        brand: "hsl(190, 90%, 40%)",
        background: "hsl(210, 60%, 98%)",
        surface: "hsl(205, 50%, 97%)",
        primary: "hsl(195, 80%, 40%)",
        secondary: "hsl(215, 60%, 50%)",
        muted: "hsl(200, 15%, 80%)",
      },
      dark: {
        brand: "hsl(190, 90%, 50%)",
        background: "hsl(210, 30%, 10%)",
        surface: "hsl(205, 25%, 15%)",
        primary: "hsl(195, 80%, 50%)",
        secondary: "hsl(215, 60%, 60%)",
        muted: "hsl(200, 15%, 30%)",
      },
    },
  },
  {
    variant: "neutral",
    mode: "auto",
    cursor: "auto",
    radius: "lg",
    typography: {
      variant: "text",
      font: {
        heading: "fonzy",
        body: "polly",
      },
      size: "xs",
      // lineHeight: "16px",
      weight: "medium",
      letterSpacing: "base",
      transform: "uppercase",
    },
    format: {
      name: "expresso",
      light: {
        brand: "hsl(15, 80%, 30%)",
        background: "hsl(30, 30%, 95%)",
        surface: "hsl(28, 25%, 98%)",
        primary: "hsl(20, 70%, 35%)",
        secondary: "hsl(35, 60%, 45%)",
        muted: "hsl(25, 15%, 80%)",
      },
      dark: {
        brand: "hsl(15, 80%, 40%)",
        background: "hsl(25, 30%, 10%)",
        surface: "hsl(28, 25%, 15%)",
        primary: "hsl(20, 70%, 45%)",
        secondary: "hsl(35, 60%, 35%)",
        muted: "hsl(25, 15%, 30%)",
      },
    },
  },
  {
    variant: "brutal",
    mode: "auto",
    cursor: "auto",
    radius: "sm",
    typography: {
      variant: "text",
      font: {
        heading: "goodly",
        body: "dumeh",
      },
      size: "h4",
      // lineHeight: "40px",
      weight: "light",
      letterSpacing: "base",
      transform: "capitalize",
    },
    format: {
      name: "sherbet",
      light: {
        brand: "hsl(340, 80%, 75%)",
        background: "hsl(60, 100%, 97%)",
        surface: "hsl(60, 60%, 95%)",
        primary: "hsl(180, 50%, 60%)",
        secondary: "hsl(120, 40%, 70%)",
        muted: "hsl(60, 30%, 85%)",
      },
      dark: {
        brand: "hsl(340, 80%, 65%)",
        background: "hsl(240, 30%, 15%)",
        surface: "hsl(240, 25%, 20%)",
        primary: "hsl(180, 50%, 50%)",
        secondary: "hsl(120, 40%, 60%)",
        muted: "hsl(240, 20%, 30%)",
      },
    },
  },
  {
    variant: "flat",
    mode: "auto",
    cursor: "auto",
    radius: "base",
    typography: {
      variant: "text",
      font: {
        heading: "oklean",
        body: "parizaad",
      },
      size: "h5",
      // lineHeight: "32px",
      weight: "black",
      letterSpacing: "base",
      transform: "lowercase",
    },
    format: {
      name: "mamal",
      light: {
        brand: "hsl(0, 0%, 0%)",
        background: "hsl(0, 0%, 100%)",
        surface: "hsl(0, 0%, 98%)",
        primary: "hsl(0, 0%, 20%)",
        secondary: "hsl(0, 0%, 40%)",
        muted: "hsl(0, 0%, 80%)",
      },
      dark: {
        brand: "hsl(0, 0%, 100%)",
        background: "hsl(0, 0%, 10%)",
        surface: "hsl(0, 0%, 15%)",
        primary: "hsl(0, 0%, 80%)",
        secondary: "hsl(0, 0%, 60%)",
        muted: "hsl(0, 0%, 30%)",
      },
    },
  },
  {
    variant: "neutral",
    mode: "auto",
    cursor: "auto",
    radius: "md",
    typography: {
      variant: "text",
      font: {
        heading: "polaris",
        body: "qualux",
      },
      size: "h6",
      // lineHeight: "24px",
      weight: "black",
      letterSpacing: "base",
      transform: "full-width",
    },
    format: {
      name: "cyberpunk",
      light: {
        brand: "hsl(210, 100%, 50%)",
        background: "hsl(180, 100%, 10%)",
        surface: "hsl(180, 80%, 15%)",
        primary: "hsl(60, 100%, 50%)",
        secondary: "hsl(330, 100%, 50%)",
        muted: "hsl(180, 50%, 30%)",
      },
      dark: {
        brand: "hsl(210, 100%, 60%)",
        background: "hsl(180, 100%, 5%)",
        surface: "hsl(180, 80%, 10%)",
        primary: "hsl(60, 100%, 60%)",
        secondary: "hsl(330, 100%, 60%)",
        muted: "hsl(180, 50%, 20%)",
      },
    },
  },
  {
    variant: "brutal",
    mode: "auto",
    cursor: "auto",
    radius: "xl",
    typography: {
      variant: "text",
      font: {
        heading: "acme",
        body: "quora",
      },
      size: "md",
      // lineHeight: "48px",
      weight: "thin",
      letterSpacing: "base",
      transform: "none",
    },
    format: {
      name: "terra",
      light: {
        brand: "hsl(0, 60%, 40%)",
        background: "hsl(40, 30%, 95%)",
        surface: "hsl(35, 25%, 90%)",
        primary: "hsl(120, 30%, 30%)",
        secondary: "hsl(60, 40%, 50%)",
        muted: "hsl(30, 20%, 70%)",
      },
      dark: {
        brand: "hsl(0, 60%, 50%)",
        background: "hsl(30, 30%, 15%)",
        surface: "hsl(35, 25%, 20%)",
        primary: "hsl(120, 30%, 40%)",
        secondary: "hsl(60, 40%, 40%)",
        muted: "hsl(30, 20%, 40%)",
      },
    },
  },
  {
    variant: "flat",
    mode: "auto",
    cursor: "auto",
    radius: "md",
    typography: {
      variant: "text",
      font: {
        heading: "folker",
        body: "inder",
      },
      size: "base",
      // lineHeight: "2px",
      weight: "light",
      letterSpacing: "base",
      transform: "uppercase",
    },
    format: {
      name: "vintage",
      light: {
        brand: "hsl(200, 100%, 40%)",
        background: "hsl(30, 50%, 90%)",
        surface: "hsl(30, 40%, 95%)",
        primary: "hsl(350, 80%, 50%)",
        secondary: "hsl(160, 50%, 40%)",
        muted: "hsl(30, 30%, 80%)",
      },
      dark: {
        brand: "hsl(200, 100%, 50%)",
        background: "hsl(30, 30%, 15%)",
        surface: "hsl(30, 25%, 20%)",
        primary: "hsl(350, 80%, 60%)",
        secondary: "hsl(160, 50%, 50%)",
        muted: "hsl(30, 30%, 40%)",
      },
    },
  },
  {
    variant: "neutral",
    mode: "auto",
    cursor: "auto",
    radius: "lg",
    typography: {
      variant: "text",
      font: {
        heading: "amithen",
        body: "lovelo",
      },
      size: "lg",
      // lineHeight: "56px",
      weight: "bold",
      letterSpacing: "base",
      transform: "capitalize",
    },
    format: {
      name: "noir",
      light: {
        brand: "hsl(0, 100%, 50%)",
        background: "hsl(0, 0%, 10%)",
        surface: "hsl(0, 0%, 15%)",
        primary: "hsl(0, 0%, 90%)",
        secondary: "hsl(0, 0%, 70%)",
        muted: "hsl(0, 0%, 30%)",
      },
      dark: {
        brand: "hsl(0, 100%, 40%)",
        background: "hsl(0, 0%, 5%)",
        surface: "hsl(0, 0%, 10%)",
        primary: "hsl(0, 0%, 80%)",
        secondary: "hsl(0, 0%, 60%)",
        muted: "hsl(0, 0%, 25%)",
      },
    },
  },
  {
    variant: "brutal",
    mode: "auto",
    cursor: "auto",
    radius: "sm",
    typography: {
      variant: "text",
      font: {
        heading: "alternox",
        body: "denson",
      },
      size: "xl",
      // lineHeight: "60px",
      weight: "medium",
      letterSpacing: "base",
      transform: "lowercase",
    },
    format: {
      name: "island",
      light: {
        brand: "hsl(270, 100%, 50%)",
        background: "hsl(180, 50%, 95%)",
        surface: "hsl(180, 40%, 98%)",
        primary: "hsl(150, 80%, 40%)",
        secondary: "hsl(330, 70%, 50%)",
        muted: "hsl(180, 30%, 80%)",
      },
      dark: {
        brand: "hsl(270, 100%, 60%)",
        background: "hsl(180, 30%, 15%)",
        surface: "hsl(180, 25%, 20%)",
        primary: "hsl(150, 80%, 50%)",
        secondary: "hsl(330, 70%, 60%)",
        muted: "hsl(180, 30%, 40%)",
      },
    },
  },
  {
    variant: "soft",
    mode: "auto",
    cursor: "auto",
    radius: "base",
    typography: {
      variant: "text",
      font: {
        heading: "jls",
        body: "poppins",
      },
      size: "h3",
      // lineHeight: "68px",
      weight: "medium",
      letterSpacing: "base",
      transform: "full-width",
    },
    format: {
      name: "fjord",
      light: {
        brand: "hsl(350, 80%, 50%)",
        background: "hsl(210, 50%, 98%)",
        surface: "hsl(210, 40%, 95%)",
        primary: "hsl(220, 80%, 30%)",
        secondary: "hsl(180, 60%, 40%)",
        muted: "hsl(210, 30%, 80%)",
      },
      dark: {
        brand: "hsl(350, 80%, 60%)",
        background: "hsl(210, 30%, 15%)",
        surface: "hsl(210, 25%, 20%)",
        primary: "hsl(220, 80%, 40%)",
        secondary: "hsl(180, 60%, 50%)",
        muted: "hsl(210, 30%, 40%)",
      },
    },
  },
  {
    variant: "neutral",
    mode: "auto",
    cursor: "auto",
    radius: "2xl",
    typography: {
      variant: "text",
      font: {
        heading: "actual",
        body: "foregen",
      },
      size: "h2",
      // lineHeight: "72px",
      weight: "black",
      letterSpacing: "base",
      transform: "uppercase",
    },
    format: {
      name: "brass",
      light: {
        brand: "hsl(15, 90%, 30%)",
        background: "hsl(40, 30%, 90%)",
        surface: "hsl(35, 25%, 95%)",
        primary: "hsl(20, 70%, 30%)",
        secondary: "hsl(45, 60%, 50%)",
        muted: "hsl(30, 20%, 70%)",
      },
      dark: {
        brand: "hsl(15, 90%, 40%)",
        background: "hsl(30, 30%, 15%)",
        surface: "hsl(35, 25%, 20%)",
        primary: "hsl(20, 70%, 40%)",
        secondary: "hsl(45, 60%, 40%)",
        muted: "hsl(30, 20%, 40%)",
      },
    },
  },
  {
    variant: "soft",
    mode: "auto",
    cursor: "auto",
    radius: "xl",
    typography: {
      variant: "text",
      font: {
        heading: "fonzy",
        body: "polly",
      },
      size: "h1",
      // lineHeight: "80px",
      weight: "light",
      letterSpacing: "base",
      transform: "none",
    },
    format: {
      name: "zinc",
      light: {
        brand: "hsl(240, 5%, 65%)",
        background: "hsl(0, 0%, 100%)",
        surface: "hsl(240, 5%, 96%)",
        primary: "hsl(240, 5%, 26%)",
        secondary: "hsl(240, 5%, 46%)",
        muted: "hsl(240, 5%, 86%)",
      },
      dark: {
        brand: "hsl(240, 5%, 65%)",
        background: "hsl(240, 10%, 10%)",
        surface: "hsl(240, 10%, 15%)",
        primary: "hsl(0, 0%, 90%)",
        secondary: "hsl(240, 5%, 70%)",
        muted: "hsl(240, 5%, 25%)",
      },
    },
  },

  // ... (other themes follow the same generateThemeMode pattern or can be configured manually)
];

export type ThemeVariable = keyof typeof ThemeVariable;
