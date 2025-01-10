<div align="center">
    <a href="https://inspatiallabs.com" target="_blank">
    <p align="center">
    <picture>
    <source media="(prefers-color-scheme: light)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg">
      <source media="(prefers-color-scheme: dark)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-light.svg">
        <img src="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg" alt="InSpatial" width="300">
    </picture>
</p>
   </a>

   <br>

  <h1 align="center">InSpatial Contribution Guideline</h1>


  <h3 align="center">
    
First off, thank you for considering contributing to InSpatial! It's people like you that make open source such a great medium for collaboration and innovation 🎉
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

---

## 📑 Table of Contents
- [🌟 How Can I Contribute?](#-how-can-i-contribute)
- [🌳 Core Contribution Workflow](#-core-contribution-workflow)
  - [1️⃣ Setting Up Your Environment](#1️⃣-setting-up-your-environment)
  - [2️⃣ Working on Features](#2️⃣-working-on-features)

  - [3️⃣ Syncing with Upstream](#3️⃣-syncing-with-upstream)
  - [4️⃣ Creating a Pull Request](#4️⃣-creating-a-pull-request)
  - [5️⃣ Git Commit + Messages](#5️⃣-git-commit-+-messages)
  - [🔍 Review and Approval Process](#-review-and-approval-process)
- [🌳 Branching Strategy](#-branching-strategy)
- [💻 Development Setup](#-development-setup)

 
- [📦 Package Structure](#-package-structure)
- [🚀 Release Channels](#-release-channels)
- [📜 License](#-license)


---

## 🌟 How Can I Contribute?

### 🐛 Reporting Bugs
1. **Use the GitHub issue tracker** - Check if the bug has already been reported
2. **Check the closed issues** - Your issue might have been resolved
3. **Provide detailed information**:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Screenshots if applicable

### 💡 Suggesting Enhancements
1. **Use the GitHub issue tracker**
2. **Be clear and descriptive**
3. **Provide examples and use cases**

---

### 🛠️ Contribution Guidelines
1. **Run linting**: `deno lint`
2. **Run formatting**: `deno fmt`
3. **Include & run tests**: `deno test`
4. **Follow [STYLEGUIDE.md](STYLEGUIDE.md) code conventions.**
5. **Follow [InSpatial Doc Rules](.inspatialdocrules) for documentation.**
6. **Write [Conventional Commits](https://www.conventionalcommits.org/)**

---

## 🔄 Core Contribution Workflow

### 1️⃣ Setting Up Your Environment
```bash
# Fork the repository and clone your fork
git clone https://github.com/YourUsername/InSpatial-Core.git

# Add the upstream repository
git remote add upstream https://github.com/InSpatial/InSpatial-Core.git
```

### 2️⃣ Working on Features
```bash
# Create a new branch off the relevant domain branch
git checkout -b cloud-ben cloud-main

# Commit changes regularly with descriptive messages
git commit -m "feat(cloud): add feature X to cloud module"
```

### 3️⃣ Syncing with Upstream
```bash
# Sync your branch with the latest changes from the domain branch
git fetch upstream
git merge upstream/cloud-main
```

### 4️⃣ Creating a Pull Request
```bash
# Push your branch to GitHub
git push origin cloud-ben
```

Then:
1. Open a pull request (PR) from your branch to the domain branch
2. Format your PR:
   - **Title**: `feat(domain): short description`
   - **Description**: Include details, screenshots, or diagrams
   - **Reviewers**: Assign domain maintainers

### 5️⃣ Git Commit + Messages

> 📝 **Template**
```
type(domain): InSpatial package-name - Short Summary

[Optional Detailed Description]
```

> 💡 **For Example**

```
feat(cloud): InSpatial Auth - Add user profile page

Implements a new user profile page with the following features:
- Profile image upload
- Bio editing
- Social links integration
```

<details>
<summary><strong>Available Types</strong></summary>

- `feat` - A new feature
- `fix` - A bug fix
- `refactor` - Code changes that neither fix a bug nor add a feature
- `docs` - Documentation updates
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
</details>

<details>
<summary><strong>Available Domains</strong></summary>

- `cloud` - Cloud infrastructure and deployment
- `store` - Marketplace features and integrations
- `dev` - Developer tools and utilities
- `app` - Application features and integrations
</details>

<details>
<summary><strong>Available Packages</strong></summary>

| Package | Description |
|---------|------------|
| `util` | Utility functions |
| `xr` | XR functions |
| `kit` | Kit functions |
| `run` | Run functions |
| `cache` | Cache functions |
| `env` | Environment functions |
| `router` | Router functions |
| `server` | Server functions |
| `ecs` | ECS functions |
| `iss` | ISS functions |
| `tw` | Tailwind functions |
| `theme` | Theme functions |
| `cli` | CLI functions |
| `test` | Test functions |
| `vfx` | VFX functions |
| `icon` | Icon functions |
| `inmoji` | Inmoji functions |
| `kv` | KV functions |
| `db` | DB functions |
| `cms` | CMS functions |
| `orm` | ORM functions |
| `auth` | Auth functions |
| `vault` | Vault functions |
| `ratelimit` | Rate limit functions |
| `infetch` | Infetch functions |
| `cron` | Cron functions |
| `live` | Live functions |
| `deploy` | Deploy functions |
</details>

---   

### 🔍 Review and Approval Process

#### Code Review Guidelines
- **Self-Review Checklist**:
  - ✓ Code readability and standards compliance
  - ✓ Comprehensive testing (manual and automated)
  - ✓ Documentation updates if needed
  
- **Peer Review Focus**:
  - ✓ Functionality validation
  - ✓ Style adherence
  - ✓ Performance implications
  - ✓ Security considerations

#### Merging Process
1. Domain maintainer reviews and approves PR
2. PR gets merged into domain branch (e.g., `cloud-main`)
3. Once stable, domain maintainer:
   - Creates PR to `main`
   - Coordinates final reviews
   - Handles merge to production



## 🌳 Branching Strategy

### Domain Ownership and Decision Making
Each domain in InSpatial Core has explicit ownership and decision-making authority:

| Domain | Owner | Responsibilities |
|--------|-------|-----------------|
| Cloud | @cloud-maintainer | Final decisions on cloud infrastructure, deployment, and scaling |
| Store | @store-maintainer | Final decisions on marketplace features and integrations |
| Dev | @dev-maintainer | Final decisions on developer experience and tooling |
| App | @app-maintainer | Final decisions on app features and integrations |

- Domain owners are core-maintainers and have final say on:
  - Feature acceptance/rejection
  - Architecture decisions
  - Breaking changes
  - Release timing
  - Technical direction
- External Contributors should:
  - Align proposals with domain owner's vision
  - Seek early feedback on major changes
  - Respect domain-specific guidelines
  - Direct domain-specific questions to respective owners

### Branch Hierarchy
```
main (production)
├── cloud-main
│   ├── cloud-ben
│   └── cloud-eli
├── store-main
│   ├── store-sam
│   └── store-alex
└── dev-main
    ├── dev-jay
    └── dev-kim
```

### Branch Naming
1. **`main`**  
   The stable, production-ready branch. Changes here are fully tested and reviewed.
2. **Domain Branches (e.g., `cloud-main`, `store-main`, `dev-main`, `app-main`)**  
   Each domain has its own branch for consolidating features and updates. These branches are owned by a designated domain maintainer.
3. **Individual Branches (e.g., `cloud-ben`, `cloud-eli`)**  
   Individual contributors use these branches to develop features or experiment. 
4. **Hotfix Branches (e.g., `hotfix-123`)**  
   These branches are used to fix critical bugs in the `main` branch. They are created from the `main` branch and merged back into it.


### Branch Hierarchy
<div align="center">
    <img src="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/contribution-hierarchy.png" alt="InSpatial Contribution Hierarchy">
</div>

---

## 💻 Development Setup

```bash
# Clone your fork
git clone https://github.com/inspatiallabs/inspatial-core.git

# Install dependencies
deno install

# Set up pre-commit hooks
deno run --allow-read --allow-write scripts/setup-hooks.ts

# Run development server
deno task dev
```

---

## 📦 Package Structure
```

inspatial-core/
├── dev/          
│   ├── .../            
│   └── .../     
├── cloud/       
│   ├── .../          
│   └── .../     
└── store/       
    ├── .../            
    └── .../      
```

---

## 🚀 Release Channels

| Channel | Description | Command |
|---------|-------------|---------|
| 🟢 **Stable** | Production-ready | `deno install @inspatial/core` |
| 🟡 **Preview** | Beta features | `deno install @inspatial/core@preview` |
| 🔴 **Canary** | Experimental | `deno install @inspatial/core@canary` |




## 📜 License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

Happy coding! 🎈
