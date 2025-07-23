# Signal Lite Example

This is a minimal Vite example demonstrating the InSpatial Signal Lite reactive system working with vanilla DOM APIs and event listeners.

## Features Demonstrated

- 📊 **Counter Demo**: Basic signal reactivity with computed values
- ✏️ **Text Input Demo**: Two-way binding and derived values  
- 👥 **User Management Demo**: Array signals and complex state management
- 🔄 **Status Toggle Demo**: Boolean signals and conditional rendering
- ⛓️ **Signal Chain Demo**: Complex computed dependencies
- 🔬 **Advanced Operations**: Signal comparisons, logical operations, derive, extract, untrack

## Quick Start

### Prerequisites

- Node.js 16+ 
- pnpm (recommended) or npm

### Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start the development server:**
   ```bash
   pnpm dev
   ```

3. **Open your browser** to `http://localhost:3000`

4. **Open the browser console** to see advanced signal operations in action

### Build for Production

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

## Architecture

This example demonstrates signal-lite working in isolation without any InSpatial renderer dependencies. All reactivity is handled through:

- **Signals**: Reactive containers that hold values
- **Computed signals**: Derived values that update automatically
- **Watch effects**: Side effects that run when signals change
- **DOM event listeners**: Standard browser APIs for user interaction

## Key Concepts Demonstrated

### Basic Reactivity
```typescript
const count = createSignal(0);
const doubled = computed(() => count.value * 2);

// Watch for changes and update DOM
watch(() => {
  document.getElementById('display').textContent = count.value.toString();
});
```

### Two-way Binding
```typescript
const text = createSignal("Hello");

// Signal to DOM
watch(() => {
  input.value = text.value;
});

// DOM to Signal  
input.addEventListener('input', (e) => {
  text.value = e.target.value;
});
```

### Complex State Management
```typescript
const users = createSignal([]);
const userCount = computed(() => users.value.length);

// Immutable updates
const addUser = (user) => {
  users.value = [...users.value, user];
};
```

### Signal Operations
```typescript
const num1 = createSignal(10);
const num2 = createSignal(5);

const isGreater = num1.gt(num2);  // true
const andResult = bool1.and(bool2);
const { name, email } = extract(user, 'name', 'email');
```

## File Structure

```
example/
├── index.html          # Main HTML file with demo sections
├── src/
│   └── main.ts         # TypeScript with signal implementations
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
└── README.md          # This file
```

## Development Notes

- All examples use vanilla DOM APIs (no framework dependencies)
- Signal-lite is imported directly from the parent directory
- TypeScript is configured with DOM types for browser APIs
- Hot module replacement works out of the box with Vite
- Console logging shows advanced signal operations

## Troubleshooting

**Q: Getting import errors?**  
A: Make sure to run `pnpm install` first and that you're in the `example/` directory.

**Q: TypeScript errors about DOM?**  
A: The `tsconfig.json` should include DOM lib types. Check that `"DOM"` is in the `lib` array.

**Q: Signal operations not working?**  
A: Check the browser console for errors and make sure the signal-lite module is importing correctly from `../index.ts`.

**Q: Development server not starting?**  
A: Make sure port 3000 is available or modify the port in `vite.config.ts`.

## Learn More

- [InSpatial Signal Lite Documentation](../README.md)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/) 