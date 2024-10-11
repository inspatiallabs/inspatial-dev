<div align="center">
  <!-- <img src="https://your-image-url.com/inspatial-logo.png" alt="InSpatial Core Logo" width="200"/> -->

# 🛠️ InSpatial Tailwind CSS Config

_🎨 Elevate your UI with InSpatial's custom Tailwind CSS configurations!_

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Core](https://img.shields.io/badge/core-inspatial.dev-brightgreen.svg)](https://www.inspatial.dev)
[![App](https://img.shields.io/badge/app-inspatial.app-purple.svg)](https://www.inspatial.app)
[![Cloud](https://img.shields.io/badge/cloud-inspatial.cloud-yellow.svg)](https://www.inspatial.cloud)
[![Store](https://img.shields.io/badge/store-inspatial.store-red.svg)](https://www.inspatial.store)

</div>

---

## 🚀 Features

- Complete rewrite of the default Tailwind configuration
- InSpatial's new default styling primitives and variables
- Seamless integration with InSpatial apps or any Tailwind CSS project
- Optimized for spatial computing and cross-platform development

## 📦 Install InSpatial Tailwind Config

```bash
npm install @inspatial/tailwind-config
```

---

## 🔧 Usage

Extend your `tailwind.config.ts` file with InSpatial's custom configuration:

```ts
import type { Config } from "tailwindcss";
import inSpatialTailwindConfig from "@inspatial/tailwind-config";

const config: Config = {
  content: [
    // ... your content configuration
  ],
  theme: {
    extend: {
      ...inSpatialTailwindConfig,
    },
  },
  plugins: [
    // ... your plugins
  ],
};
export default config;
```

---

## 🎭 What's Included?

- A brand new color palette optimized for spatial interfaces
- InSpatial's Typography scales, a collection of 70+ premium Kit fonts, and font weights, line heights and letterspacing presets for seamless readability across devices
- Iconography system with 10000+ icons optimized for spatial interfaces powered by InSpatial Kit Icons and a myriad of third party icon libraries.
- Spacing and sizing utilities tailored for all spatial environments
- Responsive breakpoints for spatial/window-first design
- Custom cursors
- Border and Corner radius utilities optimized for spatial interfaces
- Adaptive effects, shadows and opacity utilities for depth perception.
- Extended Height and Width utilities
- Custom Animation, Keyframes and transition presets for smooth spatial interactions

## 🛠 Customization

While `@inspatial/tailwind-config` provides a solid foundation, you can always extend or override any part of the configuration to suit your project's specific needs.

## 🚀 Getting Started

To begin your journey with InSpatial Core, visit our comprehensive documentation at [inspatial.dev](https://www.inspatial.dev).

---

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

## 🚀 Release Channels

Choose the release channel that best fits your needs:

| Channel        | Description                           | Installation                          |
| -------------- | ------------------------------------- | ------------------------------------- |
| 🟢 **Stable**  | Production-ready release              | `npm install @inspatial/core`         |
| 🟡 **Preview** | Usable early access                   | `npm install @inspatial/core@preview` |
| 🔴 **Canary**  | Latest features, potentially unstable | `npm install @inspatial/core@canary`  |

---

## 📄 License

InSpatial Core is released under the Apache 2.0 License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Ready to supercharge your spatial development?</strong>
  <br>
  <a href="https://www.inspatial.dev">Get Started with InSpatial Utils</a>
</div>
