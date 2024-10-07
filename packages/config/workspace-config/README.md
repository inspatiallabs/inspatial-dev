<div align="center">
  <!-- <img src="https://your-image-url.com/inspatial-logo.png" alt="InSpatial Core Logo" width="200"/> -->

# 🚀 `InSpatial Workspace Config`

_Reality is your canvas_

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Core](https://img.shields.io/badge/core-inspatial.dev-brightgreen.svg)](https://www.inspatial.dev)
[![App](https://img.shields.io/badge/app-inspatial.app-purple.svg)](https://www.inspatial.app)
[![Cloud](https://img.shields.io/badge/cloud-inspatial.cloud-yellow.svg)](https://www.inspatial.cloud)
[![Store](https://img.shields.io/badge/store-inspatial.store-red.svg)](https://www.inspatial.store)

</div>

---

## 🌟 Welcome to InSpatial Core Workspace Config

This package is purely used to standardize the configuration of workspaces in our monorepo. It is not intended for direct use in applications.

## 🌟 Features

- 📦 Standardized configuration structure
- 🔧 Easy-to-extend base settings
- 🎨 Consistent styling across workspaces
- 🔗 Seamless integration with Inspatial's ecosystem

---

## 🛠️ Usage

<!-- <div align="center">
  <img src="https://your-image-url.com/inspatial-kit.png" alt="InSpatial Kit" width="150"/>
</div> -->

To use this base configuration in your workspace:

- Import the base config in your workspace's configuration file:
- Copy the `turbo gen workspace` command below to extend the configuration to your workspace
- Make sure to replace `replace-me` with your desired workspace name
- By default, the workspace will be created in the `packages` directory
- **NOTE:** You can change the destination directory by modifying the `--destination` flag e.g `turbo gen workspace --name replace-me --copy packages/config/workspace-config --destination packages/other-directory`
- when you enter the command, you will prompted with the following:

## 🪜 Step by Step Guide

- ? What type of workspace should be added?
  app

  > package

- ? Which workspace should "your-replaced-name" start from? (Use arrow keys)

  ```
  @inspatial/eslint-config
  @inspatial/tsconfig
  @inspatial/tailwind-config
  > @inspatial/workspace-config
  @inspatial/kit
  @inspatial/utils
  ```

- make sure to select `@inspatial/workspace-config` as the base workspace

- Add workspace dependencies to "hooks"? (Y/n)
- ? Which packages should be added as dependencies to "hooks? (Press <space> to select, <a> to toggle  
  all, <i> to invert selection, and <enter> to proceed)
  packages

  ```
  ( ) @inspatial/eslint-config
  ( ) @inspatial/tsconfig
  ( ) @inspatial/tailwind-config
  ( ) @inspatial/workspace-config
  (*) @inspatial/kit
  (*) @inspatial/utils
  ```

- ? Which packages should be added as devDependencies to "hooks? (Press <space> to select, <a> to  
  toggle all, <i> to invert selection, and <enter> to proceed)
  packages

  ```
  > ( ) @inspatial/eslint-config
  > ( ) @inspatial/tsconfig
  > (*) @inspatial/tailwind-config
  > ( ) @inspatial/workspace-config
  > ( ) @inspatial/kit
  > ( ) @inspatial/utils
  ```

- ? Which packages should be added as peerDependencies to "hooks? (Press <space> to select, <a> to  
  toggle all, <i> to invert selection, and <enter> to proceed)
  packages

  ```
  > ( ) @inspatial/eslint-config
  > ( ) @inspatial/tsconfig
  > ( ) @inspatial/workspace-config
  > ( ) @inspatial/kit
  > ( ) @inspatial/kit-button
  > (*) @inspatial/utils
  ```

> > > Success! Created hooks at "your-destination-path"

````
- Finally navigate to your workspace and run `pnpm install` to install the dependencies

#### Extend the InSpatial Base Workspace Config:

```bash
turbo gen workspace --name replace-me --copy packages/config/workspace-config --destination packages/replace-me
````

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
  <strong>Ready to shape the future of spatial computing?</strong>
  <br>
  <a href="https://www.inspatial.app">Start Building with InSpatial</a>
</div>
