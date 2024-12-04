<div align="center">
  <!-- <img src="https://your-image-url.com/inspatial-logo.png" alt="InSpatial Core Logo" width="200"/> -->

# 🚀 `InSpatial Prop`

_Empowering your spatial applications with reusable types, schemas, and properties_

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Core](https://img.shields.io/badge/core-inspatial.dev-brightgreen.svg)](https://www.inspatial.dev)
[![App](https://img.shields.io/badge/app-inspatial.app-purple.svg)](https://www.inspatial.app)
[![Cloud](https://img.shields.io/badge/cloud-inspatial.cloud-yellow.svg)](https://www.inspatial.cloud)
[![Store](https://img.shields.io/badge/store-inspatial.store-red.svg)](https://www.inspatial.store)

</div>

<div align="center">

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![deno version](https://badge.fury.io/js/%40inspatial%2Fprop.svg)](https://badge.fury.io/js/%40inspatial%2Fprop)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.typescriptlang.org/)

</div>

---

## 🌟 Welcome to InSpatial Prop

InSpatial prop is your go-to toolkit for building robust and type-safe spatial applications. It provides a comprehensive collection of reusable types, schemas, and properties that you can easily integrate and extend across your InSpatial projects.


## 🌟 Features

- 📦 Extensive collection of pre-defined prop for spatial computing
- 🔧 Easily extendable base types and schemas
- 🎨 Consistent prop naming and structure across your application
- 🔗 Seamless integration with the InSpatial ecosystem
- 🛡️ Type-safe development with TypeScript

---

## 🎭 Usage

<!-- <div align="center">
  <img src="https://your-image-url.com/inspatial-kit.png" alt="InSpatial Kit" width="150"/>
</div> -->

Here's a quick example of how you can use InSpatial prop in your project:

```typescript
import { Sharedprop, Formprop } from '@inspatial/prop';

interface MyCustomObjectprop extends Sharedprop, Formprop {
  name: string;
}

function MyCustomObject(prop: MyCustomObjectprop) {
  // Your component logic here
}
```

## 🛠️ Extending prop

InSpatial prop is designed to be easily extendable. Here's an example of how you can create your own custom prop:

```typescript
import { Vector3prop, Colorprop } from '@inspatial/prop';
import { z } from 'zod';

export interface CustomSpatialObjectprop extends Vector3prop, Colorprop {
  intensity: number;
  isActive: boolean;
}

export const CustomSpatialObjectSchema = z.object({
  ...Vector3prop,
  ...Colorprop,
  intensity: z.number().min(0).max(1),
  isActive: z.boolean(),
});
```

---

## 🚀 Getting Started

To begin your journey with InSpatial prop, visit our comprehensive documentation at [inspatial.dev](https://www.inspatial.dev).

---
#### Install InSpatial prop:

```bash
deno install @inspatial/prop
```

---

## 🚀 Getting Started

To begin your journey with InSpatial Core, visit our comprehensive documentation at [inspatial.dev](https://www.inspatial.dev).

---

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

## 🚀 Release Channels

Choose the release channel that best fits your needs:

| Channel        | Description                           | Installation                          |
| -------------- | ------------------------------------- | ------------------------------------- |
| 🟢 **Stable**  | Production-ready release              | `deno install @inspatial/prop`         |
| 🟡 **Preview** | Usable early access                   | `deno install @inspatial/prop@preview` |
| 🔴 **Canary**  | Latest features, potentially unstable | `deno install @inspatial/prop@canary`  |

---

## 📄 License

InSpatial Core is released under the Apache 2.0 License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Ready to supercharge your spatial development?</strong>
  <br>
  <a href="https://www.inspatial.dev">Get Started with InSpatial prop</a>
</div>