<div align="center">
    <!-- <a href="https://inspatial.io#gh-dark-mode-only" target="_blank">
    <img src="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-light.svg" alt="InSpatial" width="300"/>
   </a> -->

<a href="https://inspatial.io" target="_blank">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-light.svg">
        <source media="(prefers-color-scheme: dark)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg">
        <img src="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg" alt="InSpatial" width="300"/>
    </picture>
</a>

<br>
   <br>

<a href="https://inspatial.io" target="_blank">
<p align="center">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/logo-light.svg">
        <source media="(prefers-color-scheme: dark)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/logo-dark.svg">
        <img src="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/logo-dark.svg" height="75" alt="InSpatial">
    </picture>
</p>
</a>

_Reality is your canvas_

<h3 align="center">
    InSpatial is a universal development environment (UDE) <br> for building cross-platform and spatial (AR/MR/VR) applications
  </h3>

[![InSpatial Dev](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/dev-badge.svg)](https://www.inspatial.dev)
[![InSpatial Cloud](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/cloud-badge.svg)](https://www.inspatial.cloud)
[![InSpatial App](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/app-badge.svg)](https://www.inspatial.io)
[![InSpatial Store](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/store-badge.svg)](https://www.inspatial.store)

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Discord](https://img.shields.io/badge/discord-join_us-5a66f6.svg?style=flat-square)](https://discord.gg/inspatiallabs)
[![Twitter](https://img.shields.io/badge/twitter-follow_us-1d9bf0.svg?style=flat-square)](https://twitter.com/inspatiallabs)
[![LinkedIn](https://img.shields.io/badge/linkedin-connect_with_us-0a66c2.svg?style=flat-square)](https://www.linkedin.com/company/inspatiallabs)

</div>

##

<div align="center">

| InSpatial                                                                                                                     | Description                          | Link                                           |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------- |
| [![InSpatial Dev](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/dev-badge.svg)](https://www.inspatial.dev)       | Universal Libraries & Frameworks     | [inspatial.dev](https://www.inspatial.dev)     |
| [![InSpatial Cloud](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/cloud-badge.svg)](https://www.inspatial.cloud) | Backend APIs and SDKs                | [inspatial.cloud](https://www.inspatial.cloud) |
| [![InSpatial App](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/app-badge.svg)](https://www.inspatial.io)       | Build and manage your InSpatial apps | [inspatial.app](https://www.inspatial.io)     |
| [![InSpatial Store](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/store-badge.svg)](https://www.inspatial.store) | Deploy and discover InSpatial apps   | [inspatial.store](https://www.inspatial.store) |

</div>

---

## 🔍 InSpatial Theme (🟡 Preview)

A comprehensive theming system for building cross-platform and spatial applications with consistent design language. InSpatial Theme provides a type-safe foundation for colors, typography, effects, and design variables with support for light/dark modes and dynamic theme switching.

### 👨‍💻 What Can I Do With InSpatial Theme?

- **Create Cohesive UIs**: Build applications with consistent design using theme variables and design tokens
- **Switch Themes Dynamically**: Support light/dark mode with real-time theme switching
- **Use Premium Fonts**: Access 70+ built-in premium fonts plus Google Fonts integration
- **Apply Color Systems**: Use InSpatial's comprehensive color system with light/dark mode support
- **Build Component Variants**: Create flexible component styles with the powerful variant system

## 🌟 Features

- 🎨 **Theme Manager**: Control theme state with type-safe APIs and system preference detection
- 🌓 **Light/Dark Mode**: Built-in support for both light and dark color schemes
- 📊 **Design Variables**: Comprehensive token system for spacing, radius, cursor styles, and more
- 🎯 **Multiple Theme Variants**: Choose from flat, neutral, brutal, and soft theme styles
- 🔄 **40+ Color Formats**: Choose from lavender, blossom, sky, sunset, forest, and many more
- 🌈 **Rich Color System**: Terminal colors, RGB manipulation, and automatic CSS variables
- 📦 **70+ Premium Fonts**: Built-in high-quality fonts with complete TypeScript support
- 🌐 **Google Fonts Integration**: Access and use any Google Font with proper TypeScript types
- 🚀 **Font Loading Optimization**: Efficient font loading with fallback strategies
- 💨 **Tailwind-Compatible**: Works seamlessly with Tailwind CSS
- 🧩 **Variant System**: Create complex, composable component styles with intelligent CSS class handling
- ✨ **Effect System**: Apply beautiful animations and transitions to your UI elements
- 🔒 **Type Safety**: Complete TypeScript support across all APIs
- 🔌 **Framework Agnostic**: Works with any JavaScript framework or vanilla JS

<div align="center">
  <h4>🚀 Keep reading to learn how to use all these amazing features! 🚀</h4>
</div>

## 📦 Install InSpatial Theme:

Choose your preferred package manager:

```bash
deno install jsr:@inspatial/theme
```

##

```bash
npx jsr add @inspatial/theme
```

##

```bash
yarn dlx jsr add @inspatial/theme
```

##

```bash
pnpm dlx jsr add @inspatial/theme
```

##

```bash
bunx jsr add @inspatial/theme
```

## 🛠️ Step-by-Step Usage Guide

Here are the essential usage patterns for working with InSpatial Theme:

### 1. **Theme Management**

```typescript
import { ThemeManager, initTheme, useTheme } from "@inspatial/theme";

// Initialize the theme manager
const theme = initTheme();

// Get the current theme state
const currentTheme = theme.getCurrentTheme();
console.log("Dark mode:", currentTheme.isDarkMode);

// Toggle dark mode
theme.setDarkMode(!currentTheme.isDarkMode);

// Subscribe to theme changes
const unsubscribe = theme.subscribe((updatedTheme) => {
  console.log("Theme updated:", updatedTheme);
});

// Set custom color variables
theme.setColorVariables({
  primary: "#0088ff",
  secondary: "#6600cc",
});

// Follow system preferences for dark/light mode
theme.followSystem();
```

### 2. **Color System**

```typescript
import {
  inspatialColors,
  generateColorVariables,
  red,
  green,
  blue,
  yellow,
  bgRed,
  bgGreen,
  bgBlue,
  bgYellow,
  rgb24,
  rgb8,
  stripAnsiCode,
} from "@inspatial/theme";

// Access InSpatial's color palette
const {
  skyblack, // "#03082E"
  pop, // "#9000FF"
  trackloud, // "#EF0381"
  crystal, // "#8BD8F4"
} = inspatialColors;

// Generate theme-aware CSS variables
const lightModeVars = generateColorVariables(false);
const darkModeVars = generateColorVariables(true);

// Terminal color utilities
console.log(red("Error message"), green("Success!"));
console.log(bgBlue(yellow("Warning!")));

// RGB color manipulation
// 24-bit RGB (16.7 million colors)
console.log(rgb24("Custom Color", 0xff00ff));
console.log(rgb24("Custom RGB", { r: 255, g: 0, b: 255 }));

// 8-bit RGB (256 colors)
console.log(rgb8("Paletted Color", 42));

// Remove ANSI color codes from colored text
const coloredText = red("Error!");
const plainText = stripAnsiCode(coloredText);
```

### 3. **Primitive Font - InSpatial Built-in Fonts**

```typescript
import { PrimitiveFontProps } from "@inspatial/theme";

// Access any of the 70+ premium fonts
const { inter, poppins, montserrat, lato, rubik, roboto } = PrimitiveFontProps;

// Use fonts in your application
const myFont = inter({
  src: "/path/to/inter.woff2",
  weight: "400",
  style: "normal",
  fallback: ["system-ui", "sans-serif"],
  preload: true,
  variable: "--font-inter",
});

// Access font properties
console.log(myFont.className); // CSS class name
console.log(myFont.style); // Font style properties
```

> **Note about Primitive Fonts**: InSpatial Primitive Fonts are included by default and require no CLI installation. They're served via a highly optimized CDN and include a curated set of fewer than 100 fonts, designed for performance and minimal payload.

### 4. **Google Fonts Integration**

```typescript
import { Roboto, Open_Sans, Lato } from "@inspatial/theme";

// Create a Google Font instance with options
const robotoFont = Roboto({
  weight: ["400", "700"],
  style: "normal",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: true,
  variable: "--font-roboto",
});

// Use the font in your styling
const styles = {
  fontFamily: robotoFont.style.fontFamily,
  className: robotoFont.className,
};
```

> **Note about Google Fonts**: InSpatial embraces the concept of `Ejectable Defaults` pre-configured primitives that you can selectively remove or override. However, applying this pattern to fonts, especially Google Fonts, presents unique challenges. To keep the bundle size lean, the module ships with lightweight stubs for all Google Fonts by default. If you want to use the actual fonts, you'll need to manually install them using our CLI.

#### ✨ How Google Font Stubs Work ✨

InSpatial Theme uses a smart stub system for Google Fonts:

```ascii
┏━━━━━━━━━━━━━━━━━━━━━━━ INITIAL PACKAGE ━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                              ┃
┃  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  ┃
┃  ┃                    LIGHTWEIGHT STUBS                    ┃  ┃
┃  ┃                                                         ┃  ┃
┃  ┃  ┏━━━━━━━━━━━━━━┓      ┏━━━━━━━━━━━━━━━━━━━━━━━┓      ┃  ┃
┃  ┃  ┃  Google Font ┃      ┃      stub.ts          ┃      ┃  ┃
┃  ┃  ┃  Interface   ┃━━━━━▶┃  ┏━━━━━━━━━━━━━━━┓   ┃      ┃  ┃
┃  ┃  ┗━━━━━━━━━━━━━━┛      ┃  ┃ export const ┃   ┃      ┃  ┃
┃  ┃                        ┃  ┃ Roboto = ... ┃   ┃      ┃  ┃
┃  ┃                        ┃  ┃ Open_Sans = .┃   ┃      ┃  ┃
┃  ┃        PROVIDES        ┃  ┃ Lato = ...   ┃   ┃      ┃  ┃
┃  ┃      CONSISTENT        ┃  ┃ ...          ┃   ┃      ┃  ┃
┃  ┃         API            ┃  ┗━━━━━━━━━━━━━━━┛   ┃      ┃  ┃
┃  ┃                        ┗━━━━━━━━━━━━━━━━━━━━━━━┛      ┃  ┃
┃  ┃                                                         ┃  ┃
┃  ┃  ⚠️ System fonts used as fallbacks                      ┃  ┃
┃  ┃  ⚠️ Warning messages shown when used                    ┃  ┃
┃  ┃  ⚠️ Small footprint (~15KB total)                       ┃  ┃
┃  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  ┃
┃                                                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                               │
                               │
                               ▼
┏━━━━━━━━━━━━ AFTER RUNNING: deno task fonts:google:install ━━━━━━━━━━━┓
┃                                                                      ┃
┃  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓    ┏━━━━━━━━━━━━━━━━━┓  ┃
┃  ┃         REAL IMPLEMENTATIONS           ┃    ┃                  ┃  ┃
┃  ┃                                        ┃    ┃    FONT FILES    ┃  ┃
┃  ┃  ┏━━━━━━━━━━━━━━┓     ┏━━━━━━━━━━━━━━┓ ┃    ┃  ┏━━━━━━━━━━━┓  ┃  ┃
┃  ┃  ┃  Google Font ┃     ┃   fonts.ts   ┃ ┃    ┃  ┃ roboto.woff┃  ┃  ┃
┃  ┃  ┃  Interface   ┃━━━━▶┃ ┏━━━━━━━━━━┓ ┃ ┃    ┃  ┗━━━━━━━━━━━┛  ┃  ┃
┃  ┃  ┗━━━━━━━━━━━━━━┛     ┃ ┃Roboto    ┃ ┃ ┃    ┃                  ┃  ┃
┃  ┃                       ┃ ┃Open_Sans ┃◀┫─┼────╋─▶┏━━━━━━━━━━━┓  ┃  ┃
┃  ┃                       ┃ ┃Lato      ┃◀┫─┼────╋─▶┃opensans.woff┃  ┃  ┃
┃  ┃                       ┃ ┃...       ┃ ┃ ┃    ┃  ┗━━━━━━━━━━━┛  ┃  ┃
┃  ┃  SAME API,            ┃ ┗━━━━━━━━━━┛ ┃ ┃    ┃                  ┃  ┃
┃  ┃  REAL FUNCTIONALITY   ┗━━━━━━━━━━━━━━┛ ┃    ┃  ┏━━━━━━━━━━━┓  ┃  ┃
┃  ┃                                        ┃    ┃  ┃ lato.woff  ┃  ┃  ┃
┃  ┃  ✅ Actual font loading                 ┃    ┃  ┗━━━━━━━━━━━┛  ┃  ┃
┃  ┃  ✅ CSS @font-face integration          ┃    ┃                  ┃  ┃
┃  ┃  ✅ Optimized font display              ┃    ┗━━━━━━━━━━━━━━━━━┛  ┃
┃  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛                         ┃
┃                                                                      ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

- **Before Installation**: The package includes lightweight stubs that:

  - Provide the same API/interface as real font implementations
  - Return warnings when used (suggesting font installation)
  - Use system fonts as fallbacks
  - Add minimal bundle size (~15KB for all Google Fonts)

- **After Installation**: When you run the install command:
  - Stubs are completely replaced with real implementations
  - Font files are downloaded or referenced from Google's CDN
  - Proper CSS is generated for @font-face declarations
  - Full font functionality becomes available
  - Variable name consistency is maintained for seamless transition

This approach gives you the best of both worlds: lightweight distribution and full functionality when needed!

#### Install Google Fonts

```bash
deno task fonts:google:install
```

#### Install only popular fonts (recommended, much smaller)

```
deno task fonts:google:install -- --popular
```

#### Install specific fonts

```
deno task fonts:google:install -- --families=Roboto,Open+Sans,Lato
```

#### Uninstall Google Fonts

```bash
deno task fonts:google:uninstall
```

### 5. **Variant System for Component Styling**

```tsx
import { createVariant } from "@inspatial/theme/variant";

/***********************(Create Variant)*************************/
export const ButtonVariant = createVariant({
  // Base styles applied to all buttons
  base: "inline-flex",

  // Core Variant settings
  settings: {
    format: {
      primary: "bg-(--primary)",
      secondary: "bg-(--secondary)",
      danger: "bg-red-50 text-red hover:bg-red hover:text-white",
    },
    size: {
      sm: "text-sm py-1 px-3",
      md: "text-base",
      lg: "text-lg py-3 px-6",
    },
    rounded: {
      none: "rounded-none",
      md: "rounded-md",
      full: "rounded-full",
    },
  },

  // Specify default variant settings
  defaultSettings: {
    format: "primary",
    size: "md",
    rounded: "md",
  },

  // Optional: Compound variants for specific combinations
  composition: [
    {
      format: "primary",
      size: "lg",
    },
  ],

  // Optional
  hooks: {},
});

/***********************(Variant Extraction)*************************/
export const buttonVariantClass = ButtonVariant.getVariant({
  format: "danger",
  size: "lg",
});

/***********************(Render)*************************/
<Button className={ButtonVariant.kit(`${buttonVariantClass}`, className)} />;
```

### TypeScript Integration

```typescript
// Import the variant utilities
import {
  createVariant,
  kit,
  type VariantProps,
} from "@inspatial/theme/variant";

import { ButtonVariant } from "./variant";

/***********************(Type)*************************/
// Extract prop types from your variant
type ButtonVariantType = VariantProps<typeof ButtonVariant>;

// Use the extracted type in your components
interface MyButtonProps extends ButtonVariantType {
 // These are already part of a universal SharedProps you can import from @inspatial/type
  children?: unknown;
  asChild?: boolean;
  disabled?: boolean;
  debug?: boolean;
  ...rest
}

/***********************(Render)*************************/
function Button({ format, size, theme, disabled, ...rest  }: MyButtonProps) {
  return (
    <component
       className={kit(ButtonVariant.getVariant({ format, size, theme }))}
       disabled={disabled}
    >
      Click
    </component>
  );
}
```

### Rendering Variants

There are two recommended approaches for applying variant styles in components:

#### 1. Direct Application

Best for single component usage where variant props aren't passed down:

```tsx
// Apply variant directly in the component
<Button
  className={ButtonVariant.getVariant({
    format: "ghost",
    size: "lg",
    theme: "flat",
  })}
/>
```

#### 2. Prop-Driven Approach (Founders-Choice)

Best for component systems where variant properties flow from parent to children:

```tsx
// Component accepts variant props from parent
function CustomButton({ format, size, theme, className, ...props }) {
  return (
    <Button
      className={kit(
        `${ButtonVariant.getVariant({ format, size, theme })}`,
        className
      )}
      {...props}
    />
  );
}
```

### 6. **Effect System**

```typescript
import { Effect } from "@inspatial/theme";

// Text effects
const textEffects: Effect[] = [
  "rotate",
  "flip",
  "pullUp",
  "fadeUp",
  "fadeDown",
  "fadeLeft",
  "fadeRight",
  "fadeIn",
  "reveal",
  "blurIn",
  "typing",
  "generate",
  "ticker",
  "reUp",
  "gradual",
];

// Pattern effects
const patternEffects: Effect[] = ["slideRight", "fadeOut", "scaleDown"];

// Use effects in your UI components
<div className={`transition ${textEffects[0]}`}>Animated Text</div>;
```

### 7. **Design Variables and Theme Configuration**

```typescript
import { ThemeProps, ThemeVariable } from "@inspatial/theme";

// Create a custom theme configuration
const myTheme: ThemeProps = {
  // Theme style: flat, neutral, brutal, or soft
  variant: "brutal",

  // Color scheme
  format: {
    name: "ocean",
    light: {
      brand: "#0088ff",
      background: "#ffffff",
      surface: "#f5f8fc",
      primary: "#0088ff",
      secondary: "#6600cc",
    },
    dark: {
      brand: "#0088ff",
      background: "#121212",
      surface: "#1e1e1e",
      primary: "#0088ff",
      secondary: "#8833ff",
    },
  },

  // Light/dark mode
  mode: "light",

  // Spacing scale
  spacing: "md",

  // Border radius
  radius: "md",

  // Cursor style
  cursor: "pointer",

  // Typography settings
  typography: {
    font: {
      heading: "montserrat",
      body: "inter",
    },
    size: "base",
    weight: "regular",
    lineHeight: "24px",
    letterSpacing: "base",
  },
};

// Access predefined theme variables
const flatTheme = ThemeVariable.find((theme) => theme.variant === "flat");
const oceanTheme = ThemeVariable.find((theme) => theme.format.name === "ocean");
```

---

## 🔍 API Reference

### Theme Manager

| Function/Class                  | Description                                                        |
| ------------------------------- | ------------------------------------------------------------------ |
| `ThemeManager`                  | Core class for managing theme state with light/dark mode detection |
| `initTheme()`                   | Initialize the theme manager (singleton pattern)                   |
| `theme.getCurrentTheme()`       | Get the current theme state including colors and variables         |
| `theme.setDarkMode(boolean)`    | Set dark or light mode explicitly                                  |
| `theme.followSystem()`          | Use system preference for light/dark mode                          |
| `theme.subscribe(listener)`     | Subscribe to theme changes (returns unsubscribe function)          |
| `theme.setColorVariables(vars)` | Set custom color variables                                         |

### Color System

| Function/Object                    | Description                                                 |
| ---------------------------------- | ----------------------------------------------------------- |
| `inspatialColors`                  | InSpatial's built-in color palette with 50+ semantic colors |
| `inspatialColorPatterns`           | RegExp patterns for finding colors in text/code             |
| `generateColorVariables(isDark)`   | Generate CSS variables for light or dark theme              |
| `rgb24(text, color)`               | Apply 24-bit RGB color to text (16.7M colors)               |
| `rgb8(text, color)`                | Apply 8-bit RGB color to text (256 colors)                  |
| `red`, `green`, `blue`, etc.       | Terminal foreground color utilities                         |
| `bgRed`, `bgGreen`, `bgBlue`, etc. | Terminal background color utilities                         |
| `stripAnsiCode(text)`              | Remove ANSI color codes from text                           |

### Typography System

| Function/Object      | Description                                            |
| -------------------- | ------------------------------------------------------ |
| `PrimitiveFontProps` | Collection of 70+ premium built-in fonts               |
| `GoogleFontTypes`    | Type representing all available Google Fonts           |
| `AllFontVariants`    | Union type of all font options (Google + Primitive)    |
| `InSpatialFontProp`  | Interface for font properties with className and style |
| `fontGenerator`      | Tool for generating font type declarations             |

### Variant System

| Function/Object                       | Description                                          |
| ------------------------------------- | ---------------------------------------------------- |
| `createVariant(config)`               | Create a variant component with style configurations |
| `variant.getVariant(props)`         | Apply variants with specific properties              |
| `variant.kit(...classes)`             | Utility for safely combining CSS classes             |
| `variant.composeVariant(...variants)` | Combine multiple variants together                   |
| `VariantProps<T>`                     | Extract props type from a variant component          |

### Effect System

| Type     | Description                                        |
| -------- | -------------------------------------------------- |
| `Effect` | Union type of all available effects for animations |

### Design Variables

| Type/Object            | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `ThemeProps`           | Main theme configuration interface                  |
| `ThemeVariantProps`    | Theme style options (flat, neutral, brutal, soft)   |
| `ThemeFormatNameProps` | Color scheme names (40+ options)                    |
| `ThemeFormatProps`     | Color format configuration with light/dark variants |
| `ThemeModeProps`       | Theme mode options (light, dark, auto)              |
| `ThemeSizeScaleProps`  | Size scale from xs to 4xl                           |
| `ThemeSpacingProps`    | Spacing scale options                               |
| `ThemeRadiusProps`     | Border radius scale options                         |
| `ThemeCursorProps`     | Cursor style options                                |
| `ThemeVariable`        | Predefined theme configurations                     |

## 📄 License

InSpatial Theme is released under the Apache 2.0 License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Ready to shape the future of spatial computing?</strong>
  <br>
  <a href="https://www.inspatiallabs.com">Start Building with InSpatial</a>
</div>
