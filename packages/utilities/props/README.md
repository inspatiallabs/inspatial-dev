<div align="center">
  <!-- <img src="https://your-image-url.com/inspatial-logo.png" alt="InSpatial Core Logo" width="200"/> -->

# 🚀 `InSpatial Props`

_Empowering your spatial applications with reusable types, schemas, and properties_

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Core](https://img.shields.io/badge/core-inspatial.dev-brightgreen.svg)](https://www.inspatial.dev)
[![App](https://img.shields.io/badge/app-inspatial.app-purple.svg)](https://www.inspatial.app)
[![Cloud](https://img.shields.io/badge/cloud-inspatial.cloud-yellow.svg)](https://www.inspatial.cloud)
[![Store](https://img.shields.io/badge/store-inspatial.store-red.svg)](https://www.inspatial.store)

</div>

<div align="center">

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![npm version](https://badge.fury.io/js/%40inspatial%2Fprops.svg)](https://badge.fury.io/js/%40inspatial%2Fprops)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.typescriptlang.org/)

</div>

---

## 🌟 Welcome to InSpatial Props

InSpatial Props is your go-to toolkit for building robust and type-safe spatial applications. It provides a comprehensive collection of reusable types, schemas, and properties that you can easily integrate and extend across your InSpatial projects.


## 🌟 Features

- 📦 Extensive collection of pre-defined props for spatial computing
- 🔧 Easily extendable base types and schemas
- 🎨 Consistent prop naming and structure across your application
- 🔗 Seamless integration with the InSpatial ecosystem
- 🛡️ Type-safe development with TypeScript

---

## 🎭 Usage

<!-- <div align="center">
  <img src="https://your-image-url.com/inspatial-kit.png" alt="InSpatial Kit" width="150"/>
</div> -->

Here's a quick example of how you can use InSpatial Props in your project:

```typescript
import { SharedProps, FormProps } from '@inspatial/props';

interface MyCustomObjectProps extends SharedProps, FormProps {
  name: string;
}

function MyCustomObject(props: MyCustomObjectProps) {
  // Your component logic here
}
```

## 🛠️ Extending Props

InSpatial Props is designed to be easily extendable. Here's an example of how you can create your own custom props:

```typescript
import { Vector3Props, ColorProps } from '@inspatial/props';
import { z } from 'zod';

export interface CustomSpatialObjectProps extends Vector3Props, ColorProps {
  intensity: number;
  isActive: boolean;
}

export const CustomSpatialObjectSchema = z.object({
  ...Vector3Props,
  ...ColorProps,
  intensity: z.number().min(0).max(1),
  isActive: z.boolean(),
});
```

---

## 🚀 Getting Started

To begin your journey with InSpatial Props, visit our comprehensive documentation at [inspatial.dev](https://www.inspatial.dev).

---
#### Install InSpatial Props:

```bash
npm install @inspatial/props
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
  <a href="https://www.inspatial.dev">Get Started with InSpatial Props</a>
</div>