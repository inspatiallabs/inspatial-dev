# @in vs @inspatial UDE Modules

## @in UDE Modules

Think of @in UDE modules as individual LEGO bricks—each one is a perfectly crafted, single-purpose piece that works independently right out of the box. No assembly required, no dependencies needed. But here's where the magic happens: when you connect these bricks together, they form a complete full-stack, universal, and cross-platform framework.
Each @in module is like a specialized LEGO piece—whether it's a wheel, a window, or a foundation block—designed for one specific job and built to snap seamlessly with others. Every brick is useful on its own and comes with clear instructions, so you understand exactly what it does and how to use it.

## @inspatial/run

This is your complete LEGO castle kit. While @in modules are the individual bricks, @inspatial/run is the finished masterpiece—a fully assembled, ready-to-use structure that combines all those building blocks into one cohesive toolkit.
We chose this composable LEGO architecture because we know builders have different styles. Some developers love the creative process of selecting individual bricks and constructing something unique from the ground up. Others prefer to start with a pre-designed castle and get straight to adding their own creative touches.
Whether you're a brick-by-brick builder or a complete-kit creator, we've got you covered.

---

# Framework vs Module vs UDE\*\*

**What Makes Something a Framework:**

- Imposes structure on your code
- Ships with its own renderer
- Creates conflicts with other rendering environments (try using Vue & React together—you'll need significant low-level API changes to make it work)

**What Makes Something a Module:**

- Gets out of your way
- Integrates seamlessly with existing codebases
- Works regardless of your rendering choice or runtime environment
- Traditionally called "libraries"—but we call them modules because they're more than that

**In the InSpatial Ecosystem:**

- **@inspatial/run** = The only framework in our pipeline. It provides structure, opinions, and a complete development environment.
- **@in modules** = Pure modules. They adapt to your world instead of forcing you into theirs.

Think of it this way: frameworks are like moving into a fully furnished house with rules about where everything goes. Modules are like buying individual pieces of furniture that work in any house, with any style, following your rules.

**UDE (Universal Development Environment)** bridges this gap—giving you framework power when you want it, module flexibility when you need it.

---

# IDE vs CDE vs UDE\*\*

Here's a refined explanation of UDE vs IDE vs CDE:

---

**UDE vs IDE vs CDE**

**IDE (Integrated Development Environment)**

- Code-first interface (VS Code, IntelliJ, Xcode)
- Flexible and general-purpose for any type of development
- Requires technical knowledge to use effectively
- Primarily for developers and engineers

**CDE (Cloud Development Environment)**

- Cloud-hosted IDEs (GitHub Codespaces, Replit, Stackblitz)
- Still code-first, still requires developer expertise
- Limited by network connectivity and provider constraints

**UDE (Universal Development Environment)**

- **Visual-first interface** - starts with drag-and-drop, visual editing
- **Opinionated and focused** - specifically designed for anything that renders a graphical interface (apps, websites, games, xr)
- **Accessible to non-coders** - project managers and designers can use it without coding knowledge
- **Code mode available** - developers can switch to traditional coding interface when needed
- **Intelligence built-in** - comes bundled with LLMs for AI assistance
- **Truly universal deployment** - cloud by default, can run locally as installed binary
- **Zero-config rendering** - handles multi-platform deployment automatically

**The Key Difference:**

- **IDE/CDE**: "Here's a blank canvas and some tools - figure out what to build"
- **UDE**: "Here's a visual interface to build apps, websites, xr and games - code if you want to, but you don't have to"

UDEs embed IDEs within them, but flip the paradigm: visual creation first, code as an advanced option. This makes development accessible to creators, not just coders. Even though UDE's embed a code environemnt within them you can also build a fully fledged IDE from a UDE

Here's a refined explanation of why InSpatial chose to create its own JSX runtime instead of building on React:

# InSpatial vs InSpatial Run
InSpatial Run is a framework, InSpatial is a UDE.
