<div align="center">
    <a href="https://inspatiallabs.com" target="_blank">
        <img src="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg" alt="InSpatial" width="300"/>
    </a>

<br>
<br>

<p align="center">
    <a href="https://inspatiallabs.com" target="_blank">
        <img src="https://img.shields.io/badge/InSpatial-Theme-000000?style=for-the-badge" alt="InSpatial Theme" />
    </a>
</p>

</div>

---

## 🎨 InSpatial Theme

A powerful, type-safe and headless theming system for Universal and Spatial applications with support for custom fonts, color schemes, and dynamic theme generation - can be extended to build your own custom component Library.

## 🌟 Features

- 📦 70+ Premium built-in (Primitive) fonts with full TypeScript support
- 🌐 Google Fonts Integration
- 🎯 Multi-theme variant support (Flat, Neutral, Soft, Brutal)
- 🔄 Real-time theme switching
- 📊 Built-in Design Variables (Tokens) with semantic naming
- 💪 A comprehensive color system with terminal utilities, RGB manipulation, APCA text contrast, and more...
- 🎨 Dynamic theme generation with light/dark mode support
- 🔒 Type-safe theme configuration and validation
- 🚀 Optimized font loading and fallback strategies
- 🧩 Modular and extensible architecture

## 🛠️ Usage

### Step-by-Step Usage Guide

Follow these simple steps to get started with **InSpatial Theme**:

#### 1. **Initialize Theme**

```typescript
import { initTheme } from "@inspatial/theme"
const theme = initTheme()
```

#### 2. **Use Built-in Fonts**

```typescript
import { PrimitiveFontProps } from "@inspatial/theme"
// Access any of the 70+ premium fonts
const { actual, aeion, alternox } = PrimitiveFontProps
```

#### 3. **Generate Custom Theme**

```typescript
import { generateThemeMode } from "@inspatial/theme"
const customTheme = generateThemeMode("hsl(200, 100%, 50%)")
```

#### 4. **Theme Management**

```typescript
import { ThemeManager } from "@inspatial/theme"
// Get theme instance
const manager = ThemeManager.getInstance()
// Subscribe to theme changes
manager.subscribe((theme) => {
  console.log("Theme updated:", theme)
})
// Toggle dark mode
manager.toggleDarkMode()
```

#### 5. **Theme Variables**

```typescript
import { ThemeVariable } from "@inspatial/theme"
// Access predefined theme variables
const flatTheme = ThemeVariable.find((theme) => theme.variant === "flat")
```

## 📚 API Reference

### Theme Components

- `ThemeManager`: Core class for managing theme state
- `generateThemeMode`: Function for generating theme color schemes
- `PrimitiveFontProps`: Collection of premium fonts
- `ThemeVariable`: Predefined theme configurations

### Font Types

- `PrimitiveFontTypes`: Built-in premium fonts
- `GoogleFontTypes`: Google Fonts integration
- `AllFontVariants`: Union of all available fonts

### Theme Types

- `ThemeProps`: Main theme configuration interface
- `TypographyProps`: Typography configuration
- `ThemeFormatProps`: Color scheme configuration

## 🎯 Best Practices

1. Use the built-in theme manager for consistent state management
2. Leverage TypeScript for type-safe theme configurations
3. Implement proper font loading strategies
4. Use CSS variables for dynamic theme updates
5. Follow the mobile-first responsive approach

## 📄 License

InSpatial Theme is released under the Apache 2.0 License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Ready to build beautiful, consistent universal and spatial UIs?</strong>
  <br>
  <a href="https://www.inspatial.app">Start Building with InSpatial</a>
</div>
