# 🚀 Contributing to InSpatial Core

First off, thank you for considering contributing to InSpatial! It's people like you that make open source such a great medium for collaboration and innovation 🎉

---

## 📑 Table of Contents
- [🌟 How Can I Contribute?](#-how-can-i-contribute)
- [🌳 Branching Strategy](#-branching-strategy)
- [💻 Development Setup](#-development-setup)
- [🎨 Style Guide](#-style-guide)
 
- [📦 Package Structure](#-package-structure)
- [🚀 Release Channels](#-release-channels)
- [📝 Documentation](#-documentation)
- [🤝 Community](#-community)
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

### 🛠️ Style Guide 
1. **Follow coding conventions**
2. **Run linting**: `deno lint`
3. **Run formatting**: `deno fmt`
4. **Write [Conventional Commits](https://www.conventionalcommits.org/)**
5. **Include tests**
see [STYLEGUIDE.md](STYLEGUIDE.md) for more information.

---

## Core Contribution Workflow

### **1. Setting Up Your Environment**
- Fork the repository and clone your fork:
  ```bash
  git clone https://github.com/YourUsername/InSpatial-Core.git

    Add the upstream repository:

    git remote add upstream https://github.com/InSpatial/InSpatial-Core.git

2. Working on Features

    Always start by creating a new branch off the relevant domain branch:

git checkout -b cloud-ben cloud-main

Commit changes regularly with descriptive messages:

    git commit -m "Add feature X to cloud module"

3. Syncing with the Upstream

    Sync your branch with the latest changes from the domain branch:

    git fetch upstream
    git merge upstream/cloud-main

4. Creating a Pull Request

    Push your branch to GitHub:

    git push origin cloud-ben

    Open a pull request (PR) from your branch (cloud-ben) to the domain branch (cloud-main):
        Title: Feature: [short description]
        Description: Include details, screenshots, or diagrams if needed.
        Assign reviewers from your domain (e.g., cloud-main maintainers).

Review and Approval Process
Code Review Guidelines

    Self-Review: Before submitting a PR, check for:
        Code readability and adherence to standards.
        Comprehensive testing (manual and automated).
    Peer Review: Reviewers will:
        Validate functionality and style.
        Suggest improvements or raise concerns.

Merging Process

    The domain maintainer approves and merges PRs into the domain branch (e.g., cloud-main).
    Once stable, the domain maintainer creates a PR to main and coordinates final reviews.

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
3. **Maintainer Branches (e.g., `cloud-ben`, `cloud-eli`)**  
   Individual contributors use these branches to develop features or experiment. 
4. **Hotfix Branches (e.g., `hotfix-123`)**  
   These branches are used to fix critical bugs in the `main` branch. They are created from the `main` branch and merged back into it.


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
├── dev/          # InSpatial Dev
│   ├── core/     # Core functionality
│   ├── kit/      # UI components
│   ├── iss/      # Styling system
│   └── util/     # Utilities
├── cloud/        # InSpatial Cloud
│   ├── core/     # Core functionality
│   ├── kit/      # UI components
│   ├── iss/      # Styling system
│   └── util/     # Utilities
└── store/        # InSpatial Store
    ├── core/   # Core functionality
    ├── kit/    # UI components
    ├── iss/    # Styling system
    └── util/   # Utilities
```

---

## 🚀 Release Channels

| Channel | Tag | Description | Command |
|---------|-----|-------------|---------|
| 🟢 **Stable** | `latest` | Production-ready | `deno install @inspatial/core` |
| 🟡 **Preview** | `preview` | Beta features | `deno install @inspatial/core@preview` |
| 🔴 **Canary** | `canary` | Experimental | `deno install @inspatial/core@canary` |


---

## 📝 Documentation

- Use JSDoc comments
- Include code examples
- Document breaking changes
- Update README.md when needed

---

## 🤝 Community

- Join our [Discord](https://discord.gg/inspatiallabs)
- Follow us on [Twitter](https://twitter.com/inspatiallabs)
- Follow on [LinkedIn](https://www.linkedin.com/company/inspatiallabs)
---

## 📜 License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

Happy coding! 🎈
