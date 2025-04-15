<div align="center">
    <!-- <a href="https://inspatiallabs.com#gh-dark-mode-only" target="_blank">
    <img src="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-light.svg" alt="InSpatial" width="300"/>
   </a> -->

<a href="https://inspatiallabs.com" target="_blank">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-light.svg">
        <source media="(prefers-color-scheme: dark)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg">
        <img src="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg" alt="InSpatial" width="300"/>
    </picture>
</a>

<br>
   <br>

<a href="https://inspatiallabs.com" target="_blank">
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
[![InSpatial App](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/app-badge.svg)](https://www.inspatial.app)
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
| [![InSpatial App](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/app-badge.svg)](https://www.inspatial.app)       | Build and manage your InSpatial apps | [inspatial.app](https://www.inspatial.app)     |
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

## ✨ Advanced Features ✨

<table>
  <tr>
    <td>
      <h4>🎨 Theme Management</h4>
      <p>Control your application's theme with a powerful, type-safe manager that handles light/dark mode switching, system preference detection, and theme variable updates.</p>
      <pre><code>import { ThemeManager, initTheme } from "@inspatial/theme";

// Initialize theme system
const theme = initTheme();

// Subscribe to theme changes
theme.subscribe((state) => {
console.log("Theme updated:", state.isDarkMode ? "dark" : "light");
});

// Toggle between light and dark mode
theme.setDarkMode(true);

// Follow system preferences
theme.followSystem();</code></pre>

</td>
<td>
<h4>🌈 Color System</h4>
<p>A comprehensive color system with built-in palettes, terminal utilities, RGB manipulation, and CSS variable generation.</p>
<pre><code>import {
inspatialColors,
generateColorVariables,
red, bgBlue,
rgb24, rgb8,
stripAnsiCode
} from "@inspatial/theme";

// Access InSpatial's built-in colors
const { pop, crystal, trackloud } = inspatialColors;

// Generate CSS variables
const lightThemeVars = generateColorVariables(false);
const darkThemeVars = generateColorVariables(true);

// Terminal color utilities
console.log(red("Error:"), bgBlue("Status"));

// RGB color manipulation
console.log(rgb24("RGB Color", { r: 255, g: 0, b: 255 }));
console.log(rgb8("8-bit Color", 42));</code></pre>

</td>

  </tr>
  <tr>
    <td>
      <h4>📝 Typography System</h4>
      <p>Access over 70 premium fonts and Google Fonts with type-safe declarations, optimized loading, and fallback support.</p>
      <pre><code>// Using built-in premium fonts
import { PrimitiveFontProps } from "@inspatial/theme";
const { poppins, montserrat, inter } = PrimitiveFontProps;

// Using Google Fonts
import { Roboto, Open_Sans, Lato } from "@inspatial/theme";

// Creating fonts with options
const robotoFont = Roboto({
weight: ["400", "700"],
style: "normal",
subsets: ["latin"],
display: "swap",
preload: true,
fallback: ["system-ui", "sans-serif"]
});</code></pre>

</td>
<td>
<h4>🧩 Variant System</h4>
<p>Create flexible, composable component styles with a powerful variant system that intelligently handles CSS class conflicts.</p>
<pre><code>import { createVariant } from "@inspatial/theme";

// Create a button variant
const ButtonVariant = createVariant({
base: "px-4 py-2 rounded-md",
settings: {
intent: {
primary: "bg-blue-500 text-white",
secondary: "bg-gray-200 text-gray-800",
danger: "bg-red-500 text-white"
},
size: {
sm: "text-sm",
md: "text-base",
lg: "text-lg px-6 py-3"
}
},
defaultSettings: {
intent: "primary",
size: "md"
}
});

// Use the variant
const buttonClass = ButtonVariant.useVariant({
intent: "danger",
size: "lg",
className: "my-custom-class"
});</code></pre>

</td>

  </tr>
  <tr>
    <td colspan="2" align="center">
      <h4>✨ Effect System</h4>
      <p>Apply beautiful animations and transitions to your UI elements with a type-safe effect system.</p>
      <pre><code>import { Effect } from "@inspatial/theme";

// Available effects
const textEffect: Effect = "fadeUp";  
const patternEffect: Effect = "slideRight";

// Apply effects in your UI

<div className={`transition ${textEffect}`}>
  Animated Content
</div></code></pre>
    </td>
  </tr>
</table>

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

### 3. **Typography with Built-in Fonts**

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

> **Note about Google Fonts**: While InSpatial is all about `Ejectable Defaults` i.e Pre-configured primitives that you remove yourself. It can be very hard to apply similar concept when dealing with Fonts especially Google Fonts. By default, the module includes stubs for all Google Fonts to keep bundle size small. To use actual Google Fonts, you need to install them manually via our CLI.

#### Installing Google Fonts

```bash
# Install all Google Fonts
deno task fonts:google:install

# Install only popular fonts (recommended, much smaller)
deno task fonts:google:install -- --popular

# Install specific fonts
deno task fonts:google:install -- --families=Roboto,Open+Sans,Lato
```

#### Uninstalling Google Fonts

```bash
deno task fonts:google:uninstall
```

#### Available Popular Fonts

The following popular Google Fonts are available when using the `--popular` flag:

- Roboto
- Open Sans
- Lato
- Montserrat
- Poppins
- Inter
- Raleway
- Nunito
- Ubuntu
- Rubik
- And more...

### 5. **Variant System for Component Styling**

```tsx
import { createVariant, type VariantProps } from "@inspatial/theme/variant";

// Create a component variant
const ButtonVariant = createVariant({
  // Base styles applied to all buttons
  base: "inline-flex",

  // Variant settings
  settings: {
    intent: {
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

  // Compound variants for specific combinations
  composition: [
    {
      intent: "primary",
      size: "lg",
      className: "font-bold",
    },
  ],

  // Default settings
  defaultSettings: {
    intent: "primary",
    size: "md",
    rounded: "md",
  },
});

// Use the variant in components
const buttonClass = ButtonVariant.useVariant({
  intent: "danger",
  size: "lg",
  className: "mt-4", // Additional classes
});

// Use kit to safely combine classes
const combinedClasses = ButtonVariant.kit(
  "text-center",
  isActive && "bg-green-500",
  isBold ? "font-bold" : "font-normal"
);

// Compose multiple variants together
const CardButtonVariant = ButtonVariant.composeVariant(CardVariant);

// use derived variant class in component
<Button className={kit(buttonClass, className)} />;
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
| `variant.useVariant(props)`           | Apply variants with specific properties              |
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
